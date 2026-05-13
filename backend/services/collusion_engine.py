import networkx as nx
import pandas as pd

def generate_collusion_graph(employees_df: pd.DataFrame, vendors_df: pd.DataFrame, cycle_id: str):
    """
    Builds a unified behavioral graph across payroll and procurement.
    Returns: A Cytoscape compatible elements list and a list of cross-domain alerts.
    """
    G = nx.Graph()
    alerts = []
    
    # 1. Add Employee Nodes
    for _, emp in employees_df.iterrows():
        G.add_node(emp['employee_id'], type='EMPLOYEE', score=emp.get('score', 100), label=emp['name'])
        
        # Link to BVN
        if pd.notna(emp['bvn']):
            G.add_node(f"BVN_{emp['bvn']}", type='BVN', label=f"BVN {emp['bvn']}")
            G.add_edge(emp['employee_id'], f"BVN_{emp['bvn']}", relation='HAS_BVN')
            
        # Link to Salary Account
        if pd.notna(emp['salary_account']):
            G.add_node(f"ACC_{emp['salary_account']}", type='ACCOUNT', label=f"ACC {emp['salary_account']}")
            G.add_edge(emp['employee_id'], f"ACC_{emp['salary_account']}", relation='PAYS_TO')

    # 2. Add Vendor Nodes
    for _, vnd in vendors_df.iterrows():
        G.add_node(vnd['vendor_id'], type='VENDOR', score=vnd.get('score', 100), label=vnd['name'])
        
        # Link to BVN
        if pd.notna(vnd['bvn']):
            G.add_node(f"BVN_{vnd['bvn']}", type='BVN', label=f"BVN {vnd['bvn']}")
            G.add_edge(vnd['vendor_id'], f"BVN_{vnd['bvn']}", relation='HAS_BVN')
            
        # Link to Settlement Account
        if pd.notna(vnd['settlement_account']):
            G.add_node(f"ACC_{vnd['settlement_account']}", type='ACCOUNT', label=f"ACC {vnd['settlement_account']}")
            G.add_edge(vnd['vendor_id'], f"ACC_{vnd['settlement_account']}", relation='SETTLES_TO')
            
        # Link to Address
        if pd.notna(vnd['registration_address']):
            addr_id = f"ADDR_{vnd['registration_address'][:20].replace(' ', '_')}"
            G.add_node(addr_id, type='ADDRESS', label=vnd['registration_address'][:30])
            G.add_edge(vnd['vendor_id'], addr_id, relation='REGISTERED_AT')

    # 3. Detect Cross-Domain Collusion
    # Find BVN or Account nodes that connect to both an EMPLOYEE and a VENDOR
    for node in G.nodes():
        if G.nodes[node].get('type') in ['BVN', 'ACCOUNT']:
            neighbors = list(G.neighbors(node))
            types = [G.nodes[n].get('type') for n in neighbors]
            
            if 'EMPLOYEE' in types and 'VENDOR' in types:
                # We found cross-domain collusion!
                emp_neighbors = [n for n in neighbors if G.nodes[n].get('type') == 'EMPLOYEE']
                vnd_neighbors = [n for n in neighbors if G.nodes[n].get('type') == 'VENDOR']
                
                # Create alerts
                for e in emp_neighbors:
                    G.nodes[e]['score'] = 0 # Immediate hold
                    alerts.append({
                        "cycle_id": cycle_id,
                        "entity_type": "EMPLOYEE",
                        "entity_id": e,
                        "signal_name": "Cross-Domain Collusion",
                        "description": f"Employee shares {G.nodes[node]['type']} with a vendor.",
                        "severity": "CRITICAL"
                    })
                for v in vnd_neighbors:
                    G.nodes[v]['score'] = 0 # Immediate hold
                    alerts.append({
                        "cycle_id": cycle_id,
                        "entity_type": "VENDOR",
                        "entity_id": v,
                        "signal_name": "Cross-Domain Collusion",
                        "description": f"Vendor shares {G.nodes[node]['type']} with an employee.",
                        "severity": "CRITICAL"
                    })
                    
    # Format graph for cytoscape (JSON)
    elements = []
    for node, data in G.nodes(data=True):
        elements.append({
            "data": {"id": node, "label": data.get('label', node), "type": data.get('type'), "score": data.get('score', 100)},
            "classes": data.get('type').lower()
        })
        
    for source, target, data in G.edges(data=True):
        elements.append({
            "data": {"source": source, "target": target, "label": data.get('relation')}
        })
        
    return elements, alerts
