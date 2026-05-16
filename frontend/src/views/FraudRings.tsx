import React, { useEffect, useState } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import { getLatestCycle, getCycles } from '../api';
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

  useEffect(() => {
    const loadCycle = async () => {
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
          
          // Mock rings data - in production this would come from the graph analysis
          const mockRings: Ring[] = [
            {
              id: 'R-01',
              name: 'Ghost Fleet',
              nodeCount: 12,
              amount: 14200000,
              type: 'Govt Contract Fraud',
            },
            {
              id: 'R-02',
              name: 'Phantom Workforce',
              nodeCount: 8,
              amount: 6800000,
              type: 'Ghost Workers',
            },
            {
              id: 'R-03',
              name: 'Invoice Splitting',
              nodeCount: 5,
              amount: 2400000,
              type: 'Procurement Padding',
            },
          ];
          
          setRings(mockRings);
          if (mockRings.length > 0) {
            setSelectedRing(mockRings[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load cycle:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCycle();
  }, [selectedCycleId]);

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

    const enrichedRing = {
      ...selectedRing,
      entities: [
        { id: 'EMP-82891', type: 'Employee', dept: 'Finance' },
        { id: 'VND-45021', type: 'Vendor', dept: 'Shell Co.' },
        { id: 'ACC-920811', type: 'Account', dept: 'BVN Cluster' },
      ],
      signals: [
        'Account & BVN Clustering',
        'Service Record Void',
        'Cross-Domain Collusion',
      ],
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
                  This entity acts as a central hub within a highly irregular financial network. Our network analysis detected significant capital flow originating from <span className="font-semibold text-on-surface">14 distinct phantom employees</span> routing directly into a single shell vendor structure.
                </p>
              </div>

              {/* Graph Metrics */}
              <div>
                <h4 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-3">
                  Graph Centrality Metrics
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-surface-container-low p-3 rounded-lg border border-outline-variant/20">
                    <div>
                      <p className="font-label-sm text-label-sm text-on-surface">PageRank Score</p>
                      <p className="font-body-sm text-[11px] text-on-surface-variant">High influence in network</p>
                    </div>
                    <span className="font-code-md text-primary font-bold">0.894</span>
                  </div>
                  <div className="flex justify-between items-center bg-surface-container-low p-3 rounded-lg border border-outline-variant/20">
                    <div>
                      <p className="font-label-sm text-label-sm text-on-surface">Betweenness</p>
                      <p className="font-body-sm text-[11px] text-on-surface-variant">Critical bridge node</p>
                    </div>
                    <span className="font-code-md text-error font-bold">0.742</span>
                  </div>
                </div>
              </div>

              {/* Connected Entities */}
              <div>
                <h4 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-3">
                  Direct Connections
                </h4>
                <div className="space-y-2">
                  {[
                    { id: 'EMP-82891', type: 'Employee', dept: 'Finance', flow: '₦250k' },
                    { id: 'VND-45021', type: 'Vendor', dept: 'Shell Co.', flow: '₦890k' },
                    { id: 'ACC-920811', type: 'Account', dept: 'BVN Cluster', flow: '₦1.2m' },
                  ].map((entity, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/20 flex justify-between items-center"
                    >
                      <div>
                        <p className="font-code-md text-code-md text-on-surface font-semibold">
                          {entity.id}
                        </p>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          {entity.type} • {entity.dept}
                        </p>
                      </div>
                      <span className="font-code-md text-error font-bold">{entity.flow}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Flagged Signals */}
              <div className="border-t border-outline-variant/20 pt-4">
                <h4 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-3">
                  Flagged Signals
                </h4>
                <div className="space-y-2">
                  {[
                    'Account & BVN Clustering',
                    'Service Record Void',
                    'Cross-Domain Collusion',
                  ].map((signal, idx) => (
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
                cy={(cy) => {
                  setCyRef(cy);
                  cy.removeAllListeners('tap');
                  cy.on('tap', 'node', (evt) => {
                    setSelectedNode(evt.target.data());
                  });
                  cy.on('tap', (evt) => {
                    if (evt.target === cy) {
                      setSelectedNode(null);
                    }
                  });
                }}
              elements={[
                { data: { id: 'orchestrator', label: selectedRing?.name || 'Oluwaseun A.', type: 'Person' }, position: { x: 300, y: 300 } },
                { data: { id: 'emp', label: 'EMP-82891', type: 'Employee' }, position: { x: 200, y: 200 } },
                { data: { id: 'vnd', label: 'VND-45021', type: 'Vendor' }, position: { x: 400, y: 150 } },
                { data: { id: 'acc', label: 'ACC-920811', type: 'Account' }, position: { x: 250, y: 400 } },
                { data: { source: 'orchestrator', target: 'vnd' } },
                { data: { source: 'orchestrator', target: 'acc' } },
                { data: { source: 'orchestrator', target: 'emp' } },
                { data: { source: 'emp', target: 'acc' } }
              ]}
              stylesheet={[
                { selector: 'node', style: { 'background-color': '#4a6358', 'label': 'data(label)', 'color': '#ffffff', 'text-outline-color': '#1a1c19', 'text-outline-width': 2, 'text-valign': 'bottom', 'text-halign': 'center', 'font-size': '12px', 'text-margin-y': 4 } },
                { selector: 'node[type="Person"]', style: { 'background-color': '#ba1a1a', 'border-width': 3, 'border-color': '#ffb4ab', 'width': 45, 'height': 45 } },
                { selector: 'node[type="Vendor"]', style: { 'background-color': '#1f2a24', 'shape': 'hexagon', 'width': 35, 'height': 35 } },
                { selector: 'node[type="Account"]', style: { 'background-color': '#1f2a24', 'shape': 'diamond', 'width': 30, 'height': 30 } },
                { selector: 'edge', style: { 'width': 2, 'line-color': '#707971', 'target-arrow-color': '#707971', 'target-arrow-shape': 'triangle', 'curve-style': 'bezier' } }
              ]}
              style={{ width: '100%', height: '100%' }}
              layout={{ name: 'preset' }}
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
                {selectedNode.type === 'Person' && (
                  <div>
                    <span className="font-label-sm text-on-surface-variant uppercase block mb-1">Role</span>
                    <span className="font-body-sm text-error font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">warning</span>
                      Orchestrator
                    </span>
                  </div>
                )}
                {selectedNode.type === 'Account' && (
                  <div>
                    <span className="font-label-sm text-on-surface-variant uppercase block mb-1">Status</span>
                    <span className="font-body-sm text-warning font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">lock</span>
                      Flagged for Freeze
                    </span>
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
