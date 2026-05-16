import networkx as nx
import numpy as np
import pandas as pd
import logging

logger = logging.getLogger("aegis.collusion")


def generate_collusion_graph(employees_df: pd.DataFrame, vendors_df: pd.DataFrame, cycle_id: str):
    """
    Builds a unified behavioral graph across payroll and procurement,
    runs centrality analysis (betweenness, degree, PageRank, eigenvector)
    and connected-component clustering to surface fraud rings and identify
    orchestrator nodes.

    Returns: Cytoscape-compatible elements list and cross-domain alerts.
    """
    G = nx.Graph()
    alerts = []

    # ══════════════════════════════════════════════
    #  Phase 1 — Graph Construction
    # ══════════════════════════════════════════════

    for _, emp in employees_df.iterrows():
        G.add_node(emp['employee_id'], type='EMPLOYEE', score=emp.get('score', 100), label=emp['name'])

        if pd.notna(emp['bvn']):
            G.add_node(f"BVN_{emp['bvn']}", type='BVN', label=f"BVN {emp['bvn']}")
            G.add_edge(emp['employee_id'], f"BVN_{emp['bvn']}", relation='HAS_BVN')

        if pd.notna(emp['salary_account']):
            G.add_node(f"ACC_{emp['salary_account']}", type='ACCOUNT', label=f"ACC {emp['salary_account']}")
            G.add_edge(emp['employee_id'], f"ACC_{emp['salary_account']}", relation='PAYS_TO')

    for _, vnd in vendors_df.iterrows():
        G.add_node(vnd['vendor_id'], type='VENDOR', score=vnd.get('score', 100), label=vnd['name'])

        if pd.notna(vnd['bvn']):
            G.add_node(f"BVN_{vnd['bvn']}", type='BVN', label=f"BVN {vnd['bvn']}")
            G.add_edge(vnd['vendor_id'], f"BVN_{vnd['bvn']}", relation='HAS_BVN')

        if pd.notna(vnd['settlement_account']):
            G.add_node(f"ACC_{vnd['settlement_account']}", type='ACCOUNT', label=f"ACC {vnd['settlement_account']}")
            G.add_edge(vnd['vendor_id'], f"ACC_{vnd['settlement_account']}", relation='SETTLES_TO')

        if pd.notna(vnd['registration_address']):
            addr_id = f"ADDR_{vnd['registration_address'][:20].replace(' ', '_')}"
            G.add_node(addr_id, type='ADDRESS', label=vnd['registration_address'][:30])
            G.add_edge(vnd['vendor_id'], addr_id, relation='REGISTERED_AT')

    if len(G.nodes()) < 3:
        return _format_cytoscape(G), alerts

    # ══════════════════════════════════════════════
    #  Phase 2 — Cross-Domain Shared-Field Detection (base layer)
    # ══════════════════════════════════════════════

    for node in list(G.nodes()):
        node_type = G.nodes[node].get('type')
        if node_type not in ('BVN', 'ACCOUNT'):
            continue
        neighbors = list(G.neighbors(node))
        types = [G.nodes[n].get('type') for n in neighbors]

        if 'EMPLOYEE' in types and 'VENDOR' in types:
            emp_neighbors = [n for n in neighbors if G.nodes[n].get('type') == 'EMPLOYEE']
            vnd_neighbors = [n for n in neighbors if G.nodes[n].get('type') == 'VENDOR']

            for e in emp_neighbors:
                G.nodes[e]['score'] = max(0, G.nodes[e].get('score', 100) - 50)
                G.nodes[e]['cross_domain'] = True
                alerts.append({
                    "cycle_id": cycle_id,
                    "entity_type": "EMPLOYEE",
                    "entity_id": e,
                    "signal_name": "Cross-Domain Collusion",
                    "description": f"Employee shares {node_type} node with a vendor via {node}.",
                    "severity": "CRITICAL"
                })
            for v in vnd_neighbors:
                G.nodes[v]['score'] = max(0, G.nodes[v].get('score', 100) - 50)
                G.nodes[v]['cross_domain'] = True
                alerts.append({
                    "cycle_id": cycle_id,
                    "entity_type": "VENDOR",
                    "entity_id": v,
                    "signal_name": "Cross-Domain Collusion",
                    "description": f"Vendor shares {node_type} node with an employee via {node}.",
                    "severity": "CRITICAL"
                })

    # ══════════════════════════════════════════════
    #  Phase 3 — Centrality Analysis (amplification layer)
    # ══════════════════════════════════════════════

    print(f"\n[AEGIS GRAPH] Computing Degree and Betweenness Centrality for {len(G.nodes())} nodes...")
    degree_cent = nx.degree_centrality(G)
    betweenness_cent = nx.betweenness_centrality(G)

    print(f"[AEGIS GRAPH] Computing PageRank (max_iter=100)...")
    try:
        pagerank = nx.pagerank(G, max_iter=100)
    except nx.PowerIterationFailedConvergence:
        pagerank = {n: 1.0 / len(G) for n in G.nodes()}

    try:
        eigenvector_cent = nx.eigenvector_centrality(G, max_iter=300)
    except (nx.PowerIterationFailedConvergence, nx.NetworkXError):
        eigenvector_cent = {n: 0.0 for n in G.nodes()}

    for node in G.nodes():
        G.nodes[node]['degree_centrality'] = round(degree_cent.get(node, 0), 4)
        G.nodes[node]['betweenness_centrality'] = round(betweenness_cent.get(node, 0), 4)
        G.nodes[node]['pagerank'] = round(pagerank.get(node, 0), 6)
        G.nodes[node]['eigenvector_centrality'] = round(eigenvector_cent.get(node, 0), 4)

    # ══════════════════════════════════════════════
    #  Phase 4 — Connected-Component Cluster Analysis
    # ══════════════════════════════════════════════

    print(f"[AEGIS GRAPH] Finding connected components to identify fraud rings...")
    components = list(nx.connected_components(G))
    suspicious_clusters = []

    for comp in components:
        comp_types = {G.nodes[n].get('type') for n in comp}
        entity_nodes = [n for n in comp if G.nodes[n].get('type') in ('EMPLOYEE', 'VENDOR')]

        has_employee = 'EMPLOYEE' in comp_types
        has_vendor = 'VENDOR' in comp_types
        is_cross_domain = has_employee and has_vendor
        is_dense = len(entity_nodes) > 3

        if not (is_cross_domain or is_dense):
            continue

        # Orchestrator = entity node with highest betweenness in this component
        entity_bc = {n: betweenness_cent.get(n, 0) for n in entity_nodes}
        if not entity_bc:
            continue

        orchestrator = max(entity_bc, key=entity_bc.get)
        orch_bc = entity_bc[orchestrator]

        G.nodes[orchestrator]['is_orchestrator'] = True
        G.nodes[orchestrator]['orchestrator_score'] = round(orch_bc, 4)

        cluster_id = f"RING_{len(suspicious_clusters) + 1}"
        suspicious_clusters.append({
            "cluster_id": cluster_id,
            "nodes": list(comp),
            "entity_count": len(entity_nodes),
            "is_cross_domain": is_cross_domain,
            "orchestrator": orchestrator,
            "orchestrator_betweenness": round(orch_bc, 4),
        })

        orch_type = G.nodes[orchestrator].get('type', 'ENTITY')
        alerts.append({
            "cycle_id": cycle_id,
            "entity_type": orch_type,
            "entity_id": orchestrator,
            "signal_name": "Ring Orchestrator",
            "description": (
                f"Highest betweenness centrality ({orch_bc:.4f}) in a "
                f"{'cross-domain ' if is_cross_domain else ''}cluster of "
                f"{len(entity_nodes)} entities. Likely coordinator."
            ),
            "severity": "CRITICAL"
        })

    # ══════════════════════════════════════════════
    #  Phase 5 — Centrality-Based Score Adjustments
    # ══════════════════════════════════════════════

    entity_bc = {
        n: betweenness_cent.get(n, 0)
        for n in G.nodes()
        if G.nodes[n].get('type') in ('EMPLOYEE', 'VENDOR')
    }

    if len(entity_bc) > 5:
        vals = list(entity_bc.values())
        p90 = float(np.percentile(vals, 90))
        p75 = float(np.percentile(vals, 75))

        for node, bc in entity_bc.items():
            nd = G.nodes[node]
            if nd.get('cross_domain'):
                continue
            current = nd.get('score', 100)

            if bc > p90 and bc > 0.01:
                G.nodes[node]['score'] = max(0, current - 25)
                alerts.append({
                    "cycle_id": cycle_id,
                    "entity_type": nd.get('type', 'ENTITY'),
                    "entity_id": node,
                    "signal_name": "High Betweenness Centrality",
                    "description": (
                        f"Betweenness centrality {bc:.4f} is in the 90th percentile. "
                        f"Entity bridges multiple clusters in the financial network."
                    ),
                    "severity": "HIGH"
                })
            elif bc > p75 and bc > 0.005:
                G.nodes[node]['score'] = max(0, current - 10)
                alerts.append({
                    "cycle_id": cycle_id,
                    "entity_type": nd.get('type', 'ENTITY'),
                    "entity_id": node,
                    "signal_name": "Elevated Network Centrality",
                    "description": (
                        f"Betweenness centrality {bc:.4f} is above the 75th percentile. "
                        f"Entity has unusual connectivity."
                    ),
                    "severity": "MEDIUM"
                })

    # PageRank amplification for entities inside suspicious clusters
    suspicious_entity_set = set()
    for cl in suspicious_clusters:
        for n in cl['nodes']:
            if G.nodes[n].get('type') in ('EMPLOYEE', 'VENDOR'):
                suspicious_entity_set.add(n)

    pr_vals = [pagerank.get(n, 0) for n in suspicious_entity_set if pagerank.get(n, 0) > 0]
    if len(pr_vals) > 3:
        pr_threshold = float(np.percentile(pr_vals, 70))
        for node in suspicious_entity_set:
            pr = pagerank.get(node, 0)
            nd = G.nodes[node]
            if pr > pr_threshold and not nd.get('cross_domain'):
                current = nd.get('score', 100)
                G.nodes[node]['score'] = max(0, current - 15)
                alerts.append({
                    "cycle_id": cycle_id,
                    "entity_type": nd.get('type', 'ENTITY'),
                    "entity_id": node,
                    "signal_name": "Elevated PageRank in Fraud Cluster",
                    "description": (
                        f"PageRank {pr:.6f} elevated within suspicious cluster. "
                        f"High connectivity to other flagged entities."
                    ),
                    "severity": "MEDIUM"
                })

    logger.info(
        f"Collusion analysis: {len(components)} components, "
        f"{len(suspicious_clusters)} suspicious clusters, {len(alerts)} alerts"
    )

    elements = _format_cytoscape(G, suspicious_clusters)
    return elements, alerts


def _format_cytoscape(G: nx.Graph, clusters: list = None) -> list:
    """Format NetworkX graph as Cytoscape.js compatible elements."""
    cluster_map = {}
    if clusters:
        for cl in clusters:
            for node in cl['nodes']:
                cluster_map[node] = cl['cluster_id']

    elements = []

    for node, data in G.nodes(data=True):
        el = {
            "data": {
                "id": node,
                "label": data.get('label', node),
                "type": data.get('type'),
                "score": data.get('score', 100),
                "degree_centrality": data.get('degree_centrality', 0),
                "betweenness_centrality": data.get('betweenness_centrality', 0),
                "pagerank": data.get('pagerank', 0),
                "eigenvector_centrality": data.get('eigenvector_centrality', 0),
                "is_orchestrator": data.get('is_orchestrator', False),
            },
            "classes": (data.get('type') or '').lower()
        }
        if node in cluster_map:
            el["data"]["cluster"] = cluster_map[node]
        if data.get('is_orchestrator'):
            el["classes"] += " orchestrator"
        elements.append(el)

    for source, target, data in G.edges(data=True):
        elements.append({
            "data": {"source": source, "target": target, "label": data.get('relation')}
        })

    return elements
