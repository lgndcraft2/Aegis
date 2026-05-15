import React from 'react';

export function FraudRings() {
  return (
    <main className="flex-1 md:ml-[220px] bg-surface relative overflow-hidden flex flex-col">
      {/* Top Stats Bar */}
      <div className="h-12 bg-surface-container-lowest border-b border-outline-variant/20 flex items-center justify-center px-6 shrink-0 z-10 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-4 font-code-md text-code-md text-on-surface-variant tracking-wide">
          <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span> Surveillance Cycle 004</span>
          <span className="text-outline-variant">•</span>
          <span className="text-on-surface font-semibold">3 Rings Detected</span>
          <span className="text-outline-variant">•</span>
          <span className="text-primary font-semibold">₦23.4M Intercepted</span>
        </div>
      </div>

      {/* Graph Canvas Container */}
      <div className="flex-1 relative bg-surface-bright" id="graph-container">
        {/* Simulated Graph Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#1a1c1a_1px,transparent_1px)] [background-size:24px_24px]"></div>

        {/* Left Overlay: Detected Rings */}
        <div className="absolute left-6 top-6 w-80 bg-surface-container-lowest rounded-lg border border-outline-variant/20 shadow-[0_4px_12px_rgba(0,0,0,0.08)] z-20 flex flex-col max-h-[calc(100%-48px)] overflow-hidden">
          <div className="p-4 border-b border-outline-variant/20 flex justify-between items-center bg-surface">
            <h3 className="font-label-md text-label-md text-on-surface uppercase tracking-widest">Active Rings</h3>
            <span className="bg-error-container text-on-error-container font-label-md text-[10px] px-2 py-0.5 rounded-full">3 Critical</span>
          </div>
          <div className="overflow-y-auto">
            <div className="p-4 border-b border-outline-variant/20 hover:bg-surface-container-low cursor-pointer transition-colors bg-primary-container/5">
              <div className="flex justify-between items-start mb-1">
                <span className="font-code-md text-code-md font-semibold text-primary">R-01</span>
                <span className="font-label-md text-label-md text-error">₦14.2M</span>
              </div>
              <div className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">account_tree</span> 12 Nodes · Govt Contract Fraud
              </div>
            </div>
            <div className="p-4 border-b border-outline-variant/20 hover:bg-surface-container-low cursor-pointer transition-colors">
              <div className="flex justify-between items-start mb-1">
                <span className="font-code-md text-code-md font-semibold text-on-surface">R-02</span>
                <span className="font-label-md text-label-md text-error">₦6.8M</span>
              </div>
              <div className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">account_tree</span> 8 Nodes · Ghost Workers
              </div>
            </div>
            <div className="p-4 hover:bg-surface-container-low cursor-pointer transition-colors">
              <div className="flex justify-between items-start mb-1">
                <span className="font-code-md text-code-md font-semibold text-on-surface">R-03</span>
                <span className="font-label-md text-label-md text-error">₦2.4M</span>
              </div>
              <div className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">account_tree</span> 5 Nodes · Procurement Padding
              </div>
            </div>
          </div>
        </div>

        {/* Right Overlay: Entity Profile (Simulated Active State) */}
        <div className="absolute right-6 top-6 w-96 bg-surface-container-lowest rounded-lg border border-outline-variant/20 shadow-[0_4px_12px_rgba(0,0,0,0.12)] z-20 flex flex-col max-h-[calc(100%-48px)] overflow-hidden hidden md:flex">
          <div className="p-5 border-b border-outline-variant/20 relative">
            <button className="absolute top-4 right-4 text-outline hover:text-on-surface transition-colors">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-tertiary-container/20 border-2 border-error rounded-full flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-error" style={{fontVariationSettings: "'FILL' 1"}}>person</span>
              </div>
              <div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface mb-0.5">Oluwaseun Adebayo</h2>
                <p className="font-code-md text-code-md text-on-surface-variant">EMP-88392 · Sr. Procurement</p>
              </div>
            </div>
            <div className="flex items-center justify-between bg-surface-container-low rounded p-3 border border-outline-variant/30">
              <div>
                <span className="block font-label-md text-label-md text-on-surface-variant uppercase mb-1">AEGIS Score</span>
                <span className="font-metric-xl text-metric-xl text-error leading-none">94<span className="text-headline-sm">/100</span></span>
              </div>
              <div className="text-right">
                <span className="bg-error-container text-on-error-container font-label-md text-label-md px-2.5 py-1 rounded-full uppercase tracking-wider">High Risk</span>
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
