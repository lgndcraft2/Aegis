import React, { useEffect, useState } from 'react';
import { getLatestCycle } from '../api';

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

export function FraudRings() {
  const [cycle, setCycle] = useState<any>(null);
  const [rings, setRings] = useState<Ring[]>([]);
  const [selectedRing, setSelectedRing] = useState<Ring | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCycle = async () => {
      try {
        const latest = await getLatestCycle();
        if (latest) {
          setCycle(latest);
          
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
  }, []);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount);
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
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#1a1c1a_1px,transparent_1px)] [background-size:32px_32px]"></div>

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
                onClick={() => setSelectedRing(ring)}
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
          <div className="absolute right-6 top-6 w-96 bg-surface-container-lowest rounded-lg border border-outline-variant/20 shadow-lg z-20 flex flex-col max-h-[calc(100%-48px)] overflow-hidden">
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

            <div className="overflow-y-auto flex-1 p-5 space-y-4">
              <div>
                <h4 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-3">
                  Connected Entities
                </h4>
                <div className="space-y-2">
                  {[
                    { id: 'EMP-82891', type: 'Employee', dept: 'Finance' },
                    { id: 'VND-45021', type: 'Vendor', dept: 'Shell Co.' },
                    { id: 'ACC-920811', type: 'Account', dept: 'BVN Cluster' },
                  ].map((entity, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/20"
                    >
                      <p className="font-code-md text-code-md text-on-surface font-semibold">
                        {entity.id}
                      </p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        {entity.type} • {entity.dept}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

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
                      className="flex items-center gap-2 text-body-sm text-on-surface-variant"
                    >
                      <span className="w-2 h-2 rounded-full bg-error"></span>
                      {signal}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-outline-variant/20 flex gap-2">
              <button className="flex-1 px-3 py-2 bg-surface border border-outline-variant rounded-lg font-label-md text-label-md hover:bg-surface-container transition-colors">
                Investigate
              </button>
              <button className="flex-1 px-3 py-2 bg-error text-on-error rounded-lg font-label-md text-label-md hover:bg-error/90 transition-colors">
                Escalate
              </button>
            </div>
          </div>
        )}

        {/* Center: Graph Visualization Placeholder */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <span className="material-symbols-outlined text-6xl text-primary/20 mb-4 block">
              account_tree
            </span>
            <p className="font-body-md text-on-surface-variant/40">
              {rings.length > 0 ? 'Graph visualization with D3.js or Cytoscape.js' : 'No data'}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
              </div>
            </div>
          </div>
          
          <div className="p-5 overflow-y-auto space-y-6">
            {/* Entity Metadata */}
            <div>
              <h4 className="font-label-md text-label-md text-on-surface-variant uppercase border-b border-outline-variant/20 pb-2 mb-3">Entity Details</h4>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Ministry</span>
                  <span className="font-body-sm text-body-sm text-on-surface col-span-2">Works &amp; Housing</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Level</span>
                  <span className="font-body-sm text-body-sm text-on-surface col-span-2">Directorate (GL-15)</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Known Aliases</span>
                  <span className="font-body-sm text-body-sm text-on-surface col-span-2">O.A. Ventures (Proxy)</span>
                </div>
              </div>
            </div>

            {/* Connections Snippet */}
            <div>
              <h4 className="font-label-md text-label-md text-on-surface-variant uppercase border-b border-outline-variant/20 pb-2 mb-3">Direct Connections (Ring R-01)</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2 rounded bg-surface-container-low border border-outline-variant/20">
                  <div className="w-6 h-6 rotate-45 bg-surface border border-outline-variant flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[14px] -rotate-45 text-secondary">account_balance</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-code-md text-[11px] truncate text-on-surface">GTBank · 0129****83</p>
                  </div>
                  <span className="font-label-md text-[10px] text-error font-bold">₦4.2M</span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded bg-surface-container-low border border-outline-variant/20">
                  <div className="w-6 h-6 hexagon bg-surface border border-outline-variant flex items-center justify-center shrink-0" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
                    <span className="material-symbols-outlined text-[14px] text-secondary">storefront</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-code-md text-[11px] truncate text-on-surface">Apex Build Ltd</p>
                  </div>
                  <span className="font-label-md text-[10px] text-error font-bold">₦10.0M</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Actions Footer */}
          <div className="p-5 border-t border-outline-variant/20 bg-surface mt-auto flex gap-3">
            <button className="flex-1 bg-surface border border-outline text-on-surface font-label-md text-label-md py-2 rounded-lg hover:bg-surface-container-low transition-colors">
              Export Report
            </button>
            <button className="flex-1 bg-tertiary-container text-on-tertiary-container font-label-md text-label-md py-2 rounded-lg hover:bg-tertiary hover:text-on-tertiary transition-colors flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[18px]">gavel</span>
              Squad Hold
            </button>
          </div>
        </div>

        {/* Simulated Cytoscape Canvas Elements (Static representation) */}
        
        {/* Orchestrator Node */}
        <div className="absolute top-[40%] left-[45%] w-16 h-16 rounded-full border-[3px] border-error bg-error-container flex items-center justify-center z-10 shadow-[0_0_15px_rgba(186,26,26,0.3)] animate-pulse">
          <span className="material-symbols-outlined text-error text-2xl">person</span>
          <div className="absolute -bottom-8 w-32 text-center">
            <span className="font-code-md text-code-md text-on-surface bg-surface/80 px-1 rounded">Oluwaseun A.</span>
          </div>
        </div>

        {/* Vendor Node (Hexagon) */}
        <div className="absolute top-[25%] left-[55%] w-12 h-12 bg-surface border-2 border-outline-variant flex items-center justify-center z-10" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
          <span className="material-symbols-outlined text-secondary text-lg">storefront</span>
          <div className="absolute -bottom-6 w-24 text-center">
            <span className="font-code-md text-[11px] text-on-surface-variant bg-surface/80 px-1 rounded">Apex Build</span>
          </div>
        </div>

        {/* Bank Account Node (Diamond) */}
        <div className="absolute top-[55%] left-[35%] w-10 h-10 rotate-45 bg-surface border-2 border-outline-variant flex items-center justify-center z-10">
          <span className="material-symbols-outlined text-secondary text-base -rotate-45">account_balance</span>
          <div className="absolute -bottom-8 -right-8 w-24 text-center rotate-0">
            <span className="font-code-md text-[11px] text-on-surface-variant bg-surface/80 px-1 rounded">GTB-83</span>
          </div>
        </div>

        {/* Employee Node (Circle) */}
        <div className="absolute top-[30%] left-[30%] w-10 h-10 rounded-full bg-surface border-2 border-outline flex items-center justify-center z-10">
          <span className="material-symbols-outlined text-outline text-base">person_outline</span>
          <div className="absolute -bottom-6 w-24 text-center">
            <span className="font-code-md text-[11px] text-on-surface-variant bg-surface/80 px-1 rounded">EMP-112</span>
          </div>
        </div>

        {/* Edges (SVG lines) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" xmlns="http://www.w3.org/2000/svg">
          {/* Orchestrator to Vendor */}
          <line opacity="0.6" stroke="#ba1a1a" strokeDasharray="4" strokeWidth="2" x1="45%" x2="55%" y1="40%" y2="25%"></line>
          {/* Orchestrator to Bank */}
          <line opacity="0.8" stroke="#ba1a1a" strokeWidth="2" x1="45%" x2="35%" y1="40%" y2="55%"></line>
          {/* Orchestrator to Employee */}
          <line opacity="0.5" stroke="#707971" strokeWidth="1.5" x1="45%" x2="30%" y1="40%" y2="30%"></line>
          {/* Employee to Bank */}
          <line opacity="0.4" stroke="#707971" strokeWidth="1" x1="30%" x2="35%" y1="30%" y2="55%"></line>
        </svg>

        {/* Map Context Hint (Bottom Right) */}
        <div className="absolute bottom-6 right-6 opacity-30 pointer-events-none w-64 h-64 rounded-full overflow-hidden filter grayscale mix-blend-multiply hidden md:block">
          <img alt="Map outline" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDeTo8aUYUE3oPnxsppC5rDHcPJ0QmFW48Zaa8fuzcKm4BUB3jmeul9guEZPfVwdrBGxECzwuitfkKAsjtW0Un8oO-SCD_y-6zuyO49jwH51L_feDLheekKdnAThCzpRtz4aaxbw6-XYH8-_mraEPOKqlb7VVuDiV1NirQLv6iPgAvwg68Tnt0JaL5AGYh5EA6tGXCyg-FeXnqhECG8wkMmTLuwjLO7qcZcTxPYI4isuEeafGA5bloxBiB-NJWUVK6pq_7yHHz0dD5K"/>
        </div>
      </div>
    </main>
  );
}
