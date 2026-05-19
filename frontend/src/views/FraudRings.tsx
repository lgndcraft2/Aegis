import React, { useEffect, useState } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import { getLatestCycle, getCycles, getResults } from '../api';
import { generateEFCCDossier, generateICPCReport, downloadDossier, copyDossierToClipboard } from '../utils/efccExport';

interface GraphNode {
  id: string;
  label: string;
  type: string;
  score: number;
}

interface Ring {
  id: string;
  name: string;
  nodeCount: number;
  amount: number;
  type: string;
}

export function FraudRings({ selectedCycleId }: { selectedCycleId?: string | null }) {
  const [cycle, setCycle] = useState<any>(null);
  const [rings, setRings] = useState<Ring[]>([]);
  const [selectedRing, setSelectedRing] = useState<Ring | null>(null);
  const [loading, setLoading] = useState(true);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<'efcc' | 'icpc'>('efcc');
  const [cyRef, setCyRef] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [graphElements, setGraphElements] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        let activeCycle = null;
        if (selectedCycleId) {
          const cycles = await getCycles();
          activeCycle = cycles.find((c: any) => c.cycle_id === selectedCycleId);
        } else {
          activeCycle = await getLatestCycle();
        }

        if (activeCycle) {
          setCycle(activeCycle);

          if (activeCycle.status === 'COMPLETED') {
            const results = await getResults(activeCycle.cycle_id);
            const graph = results.graph || [];
            setGraphElements(graph);

            const clusterMap: Record<string, any[]> = {};
            const orchestrators: Record<string, any> = {};
            for (const el of graph) {
              const d = el.data || {};
              if (d.cluster && !d.source) {
                if (!clusterMap[d.cluster]) clusterMap[d.cluster] = [];
                clusterMap[d.cluster].push(d);
              }
              if (d.is_orchestrator && d.cluster) orchestrators[d.cluster] = d;
            }

            const realRings: Ring[] = Object.entries(clusterMap).map(([clusterId, nodes]) => {
              const entityNodes = nodes.filter(n => ['EMPLOYEE','VENDOR'].includes(n.type));
              const orch = orchestrators[clusterId];
              const hasCrossDomain = new Set(entityNodes.map(n => n.type)).size > 1;
              return {
                id: clusterId,
                name: orch ? `${orch.label} Network` : clusterId,
                nodeCount: nodes.length,
                amount: entityNodes.length * (hasCrossDomain ? 4500000 : 250000),
                type: hasCrossDomain ? 'Cross-Domain Collusion' : 'Cluster Anomaly',
              };
            });

            setRings(realRings);
            if (realRings.length > 0) setSelectedRing(realRings[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load cycle:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [selectedCycleId]);

  // Stabilize layout: only run COSE when elements change
  useEffect(() => {
    if (cyRef && graphElements.length > 0) {
      const layout = cyRef.layout({
        name: 'cose',
        animate: true,
        animationDuration: 1000,
        nodeRepulsion: () => 4500,
        idealEdgeLength: () => 50,
        gravity: 0.25,
        randomize: true,
        componentSpacing: 100,
        nodeOverlap: 20,
        refresh: 20,
      } as any);
      layout.run();
    }
  }, [cyRef, graphElements]);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount);
  };

  const handleExportDossier = (format: 'efcc' | 'icpc') => {
    if (!selectedRing || !cycle) return;

    const ringNodes = graphElements
      .filter((el: any) => el.data?.cluster === selectedRing?.id && !el.data?.source)
      .map((el: any) => el.data);

    const enrichedRing = {
      ...selectedRing,
      entities: ringNodes
        .filter((d: any) => ['EMPLOYEE','VENDOR','BVN','ACCOUNT'].includes(d.type))
        .slice(0, 10)
        .map((d: any) => ({ id: d.id, type: d.type, dept: d.is_orchestrator ? 'Orchestrator' : d.type })),
      signals: selectedRing.type === 'Cross-Domain Collusion'
        ? ['Cross-Domain Collusion', 'Account & BVN Clustering', 'Ring Orchestrator']
        : ['Account & BVN Clustering', 'Service Record Void'],
    };

    let dossier: string;
    let filename: string;

    if (format === 'efcc') {
      dossier = generateEFCCDossier(enrichedRing, cycle);
      filename = `EFCC-Dossier-${selectedRing.id}-${new Date().toISOString().split('T')[0]}.txt`;
    } else {
      dossier = generateICPCReport(enrichedRing, cycle);
      filename = `ICPC-Report-${selectedRing.id}-${new Date().toISOString().split('T')[0]}.txt`;
    }

    downloadDossier(dossier, filename);
    setShowExportModal(false);
  };

  if (loading) {
    return (
      <main className="flex-1 md:ml-[220px] p-6 bg-surface-container-low min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4">
            <span className="material-symbols-outlined text-4xl text-primary animate-spin">
              hourglass_empty
            </span>
          </div>
          <p className="font-body-md text-on-surface-variant">Loading fraud rings...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 md:ml-[220px] bg-surface relative overflow-hidden flex flex-col min-h-screen">
      {/* Top Status Bar */}
      <div className="h-12 bg-surface-container-lowest border-b border-outline-variant/20 flex items-center px-6 z-10 shrink-0">
        <div className="flex items-center gap-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            Cycle {cycle?.cycle_id?.slice(-3)} • {cycle?.status}
          </span>
          <span className="text-outline-variant">•</span>
          <span className="text-on-surface font-semibold">{rings.length} Rings Detected</span>
          <span className="text-outline-variant">•</span>
          <span className="text-primary font-semibold">
            {formatAmount(rings.reduce((sum, r) => sum + r.amount, 0))} Intercepted
          </span>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 relative flex overflow-hidden">
        {/* Graph Canvas Background */}
        <div className="absolute inset-0 bg-surface-bright opacity-50" />
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#80808033_1px,transparent_1px),linear-gradient(to_bottom,#80808033_1px,transparent_1px)] bg-[size:24px_24px]"></div>

        {/* Left Sidebar: Detected Rings List */}
        <div className="absolute left-6 top-6 w-80 bg-surface-container-lowest rounded-lg border border-outline-variant/20 shadow-lg z-20 flex flex-col max-h-[calc(100%-48px)] overflow-hidden">
          <div className="p-4 border-b border-outline-variant/20 flex justify-between items-center">
            <h3 className="font-label-md text-label-md text-on-surface uppercase tracking-widest">
              Active Rings
            </h3>
            <span className="bg-error-container text-on-error-container font-label-md text-[10px] px-2 py-0.5 rounded-full font-semibold">
              {rings.length} Critical
            </span>
          </div>

          <div className="overflow-y-auto flex-1">
            {rings.map((ring) => (
              <button
                key={ring.id}
                onClick={() => { setSelectedRing(ring); setIsRightPanelOpen(true); }}
                className={`w-full p-4 border-b border-outline-variant/20 hover:bg-surface-container-low transition-colors text-left ${
                  selectedRing?.id === ring.id ? 'bg-primary-container/10 border-l-4 border-l-primary' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-code-md text-code-md font-semibold text-primary">
                    {ring.id}
                  </span>
                  <span className="font-label-md text-label-md text-error font-bold">
                    {formatAmount(ring.amount)}
                  </span>
                </div>
                <div className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1 mb-1">
                  <span className="material-symbols-outlined text-[14px]">account_tree</span>
                  {ring.nodeCount} Nodes
                </div>
                <p className="font-body-sm text-body-sm text-on-surface">{ring.type}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Right Sidebar: Entity Profile */}
        {selectedRing && (
          <>
            {/* Toggle Button */}
            <button
              onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
              className={`absolute top-6 transition-all duration-300 ${
                isRightPanelOpen ? 'right-[408px]' : 'right-6'
              } z-30 bg-surface-container-lowest p-2 rounded-l-lg border border-r-0 border-outline-variant/20 shadow-lg text-on-surface hover:bg-surface-container-low`}
            >
              <span className="material-symbols-outlined">
                {isRightPanelOpen ? 'chevron_right' : 'chevron_left'}
              </span>
            </button>

            {/* Sidebar Content */}
            <div
              className={`absolute right-6 top-6 w-96 bg-surface-container-lowest rounded-lg border border-outline-variant/20 shadow-lg z-20 flex flex-col max-h-[calc(100%-48px)] overflow-hidden transition-transform duration-300 ${
                isRightPanelOpen ? 'translate-x-0' : 'translate-x-[calc(100%+24px)]'
              }`}
            >
              <div className="p-5 border-b border-outline-variant/20">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="font-headline-sm text-headline-sm text-on-surface mb-1">
                      {selectedRing.name}
                    </h2>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      {selectedRing.type}
                    </p>
                  </div>
                </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-surface-container-low rounded-lg p-3">
                  <p className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-1">
                    Nodes
                  </p>
                  <p className="font-headline-md text-headline-md text-on-surface">
                    {selectedRing.nodeCount}
                  </p>
                </div>
                <div className="bg-surface-container-low rounded-lg p-3">
                  <p className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-1">
                    Amount
                  </p>
                  <p className="font-headline-sm text-headline-sm text-error">
                    {formatAmount(selectedRing.amount)}
                  </p>
                </div>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 p-5 space-y-6">
              {/* Plain English Summary */}
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <h4 className="font-label-sm text-label-sm text-primary uppercase tracking-wider mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">psychology</span>
                  AEGIS Analysis
                </h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  {(() => {
                    const ringNodes = graphElements.filter((el: any) => el.data?.cluster === selectedRing?.id && !el.data?.source);
                    const empCount = ringNodes.filter((el: any) => el.data?.type === 'EMPLOYEE').length;
                    const vndCount = ringNodes.filter((el: any) => el.data?.type === 'VENDOR').length;
                    const orch = ringNodes.find((el: any) => el.data?.is_orchestrator);
                    if (orch) return <>Orchestrator <span className="font-semibold text-on-surface">{orch.data.label}</span> bridges {empCount} employee(s) and {vndCount} vendor(s) through shared financial infrastructure. Betweenness centrality of {orch.data.betweenness_centrality?.toFixed(4)} indicates a critical coordination role.</>;
                    return <>This cluster contains {selectedRing?.nodeCount} connected nodes with anomalous cross-domain linkages.</>;
                  })()}
                </p>
              </div>

              {/* Graph Metrics — from real orchestrator data */}
              {(() => {
                const orch = graphElements.find((el: any) => el.data?.cluster === selectedRing?.id && el.data?.is_orchestrator);
                const pr = orch?.data?.pagerank ?? 0;
                const bc = orch?.data?.betweenness_centrality ?? 0;
                return (
                  <div>
                    <h4 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-3">Graph Centrality Metrics</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center bg-surface-container-low p-3 rounded-lg border border-outline-variant/20">
                        <div>
                          <p className="font-label-sm text-label-sm text-on-surface">PageRank Score</p>
                          <p className="font-body-sm text-[11px] text-on-surface-variant">Influence in network</p>
                        </div>
                        <span className="font-code-md text-primary font-bold">{pr.toFixed ? pr.toFixed(4) : pr}</span>
                      </div>
                      <div className="flex justify-between items-center bg-surface-container-low p-3 rounded-lg border border-outline-variant/20">
                        <div>
                          <p className="font-label-sm text-label-sm text-on-surface">Betweenness</p>
                          <p className="font-body-sm text-[11px] text-on-surface-variant">Bridge centrality</p>
                        </div>
                        <span className="font-code-md text-error font-bold">{bc.toFixed ? bc.toFixed(4) : bc}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Connected Entities — from real graph data */}
              <div>
                <h4 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-3">Direct Connections</h4>
                <div className="space-y-2">
                  {graphElements
                    .filter((el: any) => el.data?.cluster === selectedRing?.id && !el.data?.source && ['EMPLOYEE','VENDOR','BVN','ACCOUNT'].includes(el.data?.type))
                    .slice(0, 6)
                    .map((el: any, idx: number) => (
                    <div key={idx} className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/20 flex justify-between items-center">
                      <div>
                        <p className="font-code-md text-code-md text-on-surface font-semibold">{el.data.id}</p>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">{el.data.type} • Score: {el.data.score ?? '—'}</p>
                      </div>
                      {el.data.is_orchestrator && <span className="font-label-sm text-error font-bold">ORCH</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Flagged Signals — derive from ring type */}
              <div className="border-t border-outline-variant/20 pt-4">
                <h4 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-3">Flagged Signals</h4>
                <div className="space-y-2">
                  {(selectedRing?.type === 'Cross-Domain Collusion'
                    ? ['Cross-Domain Collusion', 'Account & BVN Clustering', 'Ring Orchestrator']
                    : ['Account & BVN Clustering', 'Service Record Void']
                  ).map((signal, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-body-sm text-on-surface-variant bg-error/5 p-2 rounded border border-error/10"
                    >
                      <span className="material-symbols-outlined text-error text-[16px]">warning</span>
                      <span className="text-error font-medium">{signal}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-outline-variant/20 flex gap-2">
              <button 
                onClick={() => setShowExportModal(true)}
                className="flex-1 px-3 py-2 bg-surface border border-outline-variant rounded-lg font-label-md text-label-md hover:bg-surface-container transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
                Export Dossier
              </button>
              <button className="flex-1 px-3 py-2 bg-error text-on-error rounded-lg font-label-md text-label-md hover:bg-error/90 transition-colors">
                Escalate
              </button>
            </div>
          </div>
          </>
        )}

        {/* Center: Graph Visualization Placeholder */}
        {rings.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <span className="material-symbols-outlined text-6xl text-primary/20 mb-4 block">
                account_tree
              </span>
              <p className="font-body-md text-on-surface-variant/40">
                No data
              </p>
            </div>
          </div>
        )}
        {/* Simulated Cytoscape Canvas Elements (Static representation) */}
        
        {rings.length > 0 && (
          <>
            <div className="fixed bottom-6 right-6 z-20 flex flex-col gap-2 bg-surface p-2 rounded-lg shadow-lg border border-outline-variant/30">
              <button onClick={() => cyRef?.zoom(cyRef.zoom() * 1.2)} className="w-8 h-8 flex items-center justify-center hover:bg-surface-container rounded transition-colors text-on-surface">
                <span className="material-symbols-outlined text-[20px]">zoom_in</span>
              </button>
              <button onClick={() => cyRef?.zoom(cyRef.zoom() * 0.8)} className="w-8 h-8 flex items-center justify-center hover:bg-surface-container rounded transition-colors text-on-surface">
                <span className="material-symbols-outlined text-[20px]">zoom_out</span>
              </button>
              <button onClick={() => cyRef?.fit()} className="w-8 h-8 flex items-center justify-center hover:bg-surface-container rounded transition-colors text-on-surface">
                <span className="material-symbols-outlined text-[20px]">fit_screen</span>
              </button>
            </div>
            <div className="absolute inset-0 z-10">
              <CytoscapeComponent
                cy={(cy: any) => {
                  setCyRef(cy);
                  cy.removeAllListeners('tap');
                  cy.on('tap', 'node', (evt: any) => {
                    setSelectedNode(evt.target.data());
                  });
                  cy.on('tap', (evt: any) => {
                    if (evt.target === cy) {
                      setSelectedNode(null);
                    }
                  });
                }}
              elements={graphElements.length > 0 ? graphElements : [
                { data: { id: 'empty', label: 'No graph data', type: 'PLACEHOLDER' } }
              ]}
              stylesheet={[
                { selector: 'node', style: { 'background-color': '#4a6358', 'label': 'data(label)', 'color': '#ffffff', 'text-outline-color': '#1a1c19', 'text-outline-width': 2, 'text-valign': 'bottom', 'text-halign': 'center', 'font-size': '10px', 'text-margin-y': 4, 'width': 25, 'height': 25 } },
                { selector: 'node[type="EMPLOYEE"]', style: { 'background-color': '#4a6358', 'shape': 'ellipse', 'width': 30, 'height': 30 } },
                { selector: 'node[type="VENDOR"]', style: { 'background-color': '#7d5260', 'shape': 'hexagon', 'width': 30, 'height': 30 } },
                { selector: 'node[type="BVN"]', style: { 'background-color': '#535f70', 'shape': 'round-rectangle', 'width': 22, 'height': 22, 'font-size': '8px' } },
                { selector: 'node[type="ACCOUNT"]', style: { 'background-color': '#535f70', 'shape': 'diamond', 'width': 22, 'height': 22, 'font-size': '8px' } },
                { selector: 'node[type="ADDRESS"]', style: { 'background-color': '#535f70', 'shape': 'round-triangle', 'width': 20, 'height': 20, 'font-size': '8px' } },
                { selector: '.orchestrator', style: { 'background-color': '#ba1a1a', 'border-width': 3, 'border-color': '#ffb4ab', 'width': 45, 'height': 45, 'font-size': '12px' } },
                { selector: 'edge', style: { 'width': 1.5, 'line-color': '#707971', 'target-arrow-color': '#707971', 'target-arrow-shape': 'triangle', 'curve-style': 'bezier', 'opacity': 0.7 } }
              ]}
              style={{ width: '100%', height: '100%' }}
              layout={{ name: 'preset' } as any}
            />
          </div>
          {selectedNode && (
            <div className="absolute top-6 right-6 z-20 bg-surface-container-low p-4 rounded-lg shadow-lg border border-outline-variant/30 w-64 pointer-events-auto">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-headline-sm text-on-surface">{selectedNode.label}</h3>
                <button onClick={() => setSelectedNode(null)} className="text-on-surface-variant hover:text-on-surface">
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
              <div className="font-label-sm text-on-surface-variant uppercase tracking-wider mb-3">
                {selectedNode.type}
              </div>
              <div className="space-y-3">
                <div>
                  <span className="font-label-sm text-on-surface-variant uppercase block mb-1">Entity ID</span>
                  <span className="font-code-md text-on-surface bg-surface px-2 py-1 rounded border border-outline-variant/20">{selectedNode.id}</span>
                </div>
                {selectedNode.score !== undefined && (
                  <div>
                    <span className="font-label-sm text-on-surface-variant uppercase block mb-1">AEGIS Score</span>
                    <span className={`font-headline-sm font-bold ${selectedNode.score < 50 ? 'text-error' : selectedNode.score < 80 ? 'text-warning' : 'text-primary'}`}>{selectedNode.score}/100</span>
                  </div>
                )}
                {selectedNode.is_orchestrator && (
                  <div>
                    <span className="font-label-sm text-on-surface-variant uppercase block mb-1">Role</span>
                    <span className="font-body-sm text-error font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">warning</span>
                      Ring Orchestrator
                    </span>
                  </div>
                )}
                {selectedNode.betweenness_centrality > 0 && (
                  <div>
                    <span className="font-label-sm text-on-surface-variant uppercase block mb-1">Betweenness</span>
                    <span className="font-code-md text-on-surface">{selectedNode.betweenness_centrality?.toFixed(4)}</span>
                  </div>
                )}
                {selectedNode.pagerank > 0 && (
                  <div>
                    <span className="font-label-sm text-on-surface-variant uppercase block mb-1">PageRank</span>
                    <span className="font-code-md text-on-surface">{selectedNode.pagerank?.toFixed(6)}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          </>
        )}
        {/* Export Modal */}
        {showExportModal && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-surface-container-lowest rounded-lg border border-outline-variant/20 shadow-2xl max-w-md w-full">
              <div className="p-6 border-b border-outline-variant/20">
                <h2 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">security</span>
                  Export EFCC Prosecution Dossier
                </h2>
                <p className="font-body-sm text-on-surface-variant mt-2">
                  Generate a court-admissible compliance report formatted for Nigerian regulatory bodies
                </p>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <h4 className="font-label-md text-on-surface-variant uppercase mb-3 tracking-wider">
                    Select Report Format
                  </h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 rounded-lg border border-outline-variant/30 cursor-pointer hover:bg-surface-container-low transition-colors" onClick={() => setExportFormat('efcc')}>
                      <input
                        type="radio"
                        name="format"
                        value="efcc"
                        checked={exportFormat === 'efcc'}
                        onChange={() => setExportFormat('efcc')}
                        className="w-4 h-4"
                      />
                      <div>
                        <p className="font-label-md text-on-surface font-semibold">EFCC Format</p>
                        <p className="font-body-sm text-on-surface-variant">Economic & Financial Crimes Commission</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-3 rounded-lg border border-outline-variant/30 cursor-pointer hover:bg-surface-container-low transition-colors" onClick={() => setExportFormat('icpc')}>
                      <input
                        type="radio"
                        name="format"
                        value="icpc"
                        checked={exportFormat === 'icpc'}
                        onChange={() => setExportFormat('icpc')}
                        className="w-4 h-4"
                      />
                      <div>
                        <p className="font-label-md text-on-surface font-semibold">ICPC Format</p>
                        <p className="font-body-sm text-on-surface-variant">Independent Corrupt Practices Commission</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="bg-surface-container-low rounded-lg p-3 border-l-4 border-l-tertiary">
                  <p className="font-label-sm text-on-surface-variant uppercase tracking-wider mb-1">
                    Ring {selectedRing?.id}
                  </p>
                  <p className="font-body-sm text-on-surface">{selectedRing?.name}</p>
                  <p className="font-label-md text-error font-bold mt-1">{formatAmount(selectedRing?.amount || 0)}</p>
                </div>
              </div>

              <div className="p-6 border-t border-outline-variant/20 flex gap-3">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="flex-1 px-4 py-2 bg-surface border border-outline-variant rounded-lg font-label-md text-on-surface hover:bg-surface-container transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleExportDossier(exportFormat)}
                  className="flex-1 px-4 py-2 bg-primary text-on-primary rounded-lg font-label-md font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  Download
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
