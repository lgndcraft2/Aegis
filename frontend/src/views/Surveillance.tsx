import React from 'react';

export function Surveillance() {
  return (
    <main className="md:ml-[220px] p-margin-desktop max-w-container-max-width w-full">
      <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-background mb-1">Active Surveillance Queue</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Monitoring cross-departmental financial flows for anomalous activity.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-surface text-on-surface border border-outline-variant rounded-lg font-label-md text-label-md hover:bg-surface-container-low transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">filter_list</span>
            Filter
          </button>
          <button className="px-4 py-2 bg-surface text-on-surface border border-outline-variant rounded-lg font-label-md text-label-md hover:bg-surface-container-low transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export
          </button>
        </div>
      </div>

      {/* Data Table Container */}
      <div className="bg-surface rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-outline-variant/30 bg-surface-container-lowest">
            <div className="col-span-2 font-label-md text-label-md text-secondary">ID</div>
            <div className="col-span-1 font-label-md text-label-md text-secondary">TYPE</div>
            <div className="col-span-2 font-label-md text-label-md text-secondary">AEGIS SCORE</div>
            <div className="col-span-2 font-label-md text-label-md text-secondary">VERDICT</div>
            <div className="col-span-2 font-label-md text-label-md text-secondary">PRIMARY FLAG</div>
            <div className="col-span-1 font-label-md text-label-md text-secondary">DEPT</div>
            <div className="col-span-2 font-label-md text-label-md text-secondary text-right">ACTION</div>
          </div>

          {/* Row 1: Expandable (Critical) */}
          <div className="group border-b border-outline-variant/20 transition-colors cursor-pointer bg-surface-container-low/30">
            <div className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-surface-container-lowest">
              <div className="col-span-2 font-code-md text-code-md text-on-surface">TRX-8922-A</div>
              <div className="col-span-1 text-on-surface-variant">
                <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
              </div>
              <div className="col-span-2 font-headline-sm text-headline-sm score-hold">94.2</div>
              <div className="col-span-2">
                <span className="pill-hold">
                  <span className="material-symbols-outlined text-[14px]">block</span>
                  HOLD
                </span>
              </div>
              <div className="col-span-2 font-body-sm text-body-sm text-on-surface truncate">Velocity Spike (24h)</div>
              <div className="col-span-1 font-body-sm text-body-sm text-on-surface-variant">PROC</div>
              <div className="col-span-2 flex justify-end">
                <span className="material-symbols-outlined text-on-surface-variant transition-transform rotate-180">expand_more</span>
              </div>
            </div>

            {/* Expanded Detail Panel */}
            <div className="px-6 pb-6 pt-2 border-t border-outline-variant/20 bg-surface-bright">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Col 1: Signals */}
                <div className="col-span-1 space-y-4">
                  <h4 className="font-label-md text-label-md text-secondary uppercase border-b border-outline-variant/30 pb-2">Score Breakdown</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between font-body-sm text-body-sm mb-1">
                        <span className="text-on-surface">Network Proximity</span>
                        <span className="font-code-md text-error">98</span>
                      </div>
                      <div className="h-1.5 w-full bg-surface-variant rounded-full overflow-hidden">
                        <div className="h-full bg-error w-[98%] rounded-full"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between font-body-sm text-body-sm mb-1">
                        <span className="text-on-surface">Velocity/Volume</span>
                        <span className="font-code-md text-error">92</span>
                      </div>
                      <div className="h-1.5 w-full bg-surface-variant rounded-full overflow-hidden">
                        <div className="h-full bg-error w-[92%] rounded-full"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between font-body-sm text-body-sm mb-1">
                        <span className="text-on-surface">Historical Deviation</span>
                        <span className="font-code-md text-secondary">45</span>
                      </div>
                      <div className="h-1.5 w-full bg-surface-variant rounded-full overflow-hidden">
                        <div className="h-full bg-secondary w-[45%] rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Col 2: Metadata Grid */}
                <div className="col-span-1 space-y-4">
                  <h4 className="font-label-md text-label-md text-secondary uppercase border-b border-outline-variant/30 pb-2">Entity Metadata</h4>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                    <div>
                      <span className="block font-body-sm text-body-sm text-on-surface-variant mb-0.5">Originator</span>
                      <span className="block font-body-sm text-body-sm text-on-surface font-semibold">Apex Logistics Ltd.</span>
                    </div>
                    <div>
                      <span className="block font-body-sm text-body-sm text-on-surface-variant mb-0.5">Beneficiary</span>
                      <span className="block font-body-sm text-body-sm text-on-surface font-semibold">Unknown Shell (BVI)</span>
                    </div>
                    <div>
                      <span className="block font-body-sm text-body-sm text-on-surface-variant mb-0.5">Amount</span>
                      <span className="block font-code-md text-code-md text-on-surface">NGN 450,000,000</span>
                    </div>
                    <div>
                      <span className="block font-body-sm text-body-sm text-on-surface-variant mb-0.5">Timestamp</span>
                      <span className="block font-code-md text-code-md text-on-surface">2023-10-24 14:32Z</span>
                    </div>
                  </div>
                </div>

                {/* Col 3: Actions & Chart Placeholder */}
                <div className="col-span-1 space-y-4 flex flex-col h-full">
                  <h4 className="font-label-md text-label-md text-secondary uppercase border-b border-outline-variant/30 pb-2">Sentinel Trajectory (90d)</h4>
                  <div className="flex-1 bg-surface-container-low rounded border border-outline-variant/20 p-3 flex items-center justify-center relative overflow-hidden h-24">
                    {/* CSS Representation of declining red-orange trend line */}
                    <svg className="absolute inset-0 w-full h-full text-error" fill="none" preserveAspectRatio="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 100 40">
                      <path d="M0 35 L20 32 L40 28 L60 25 L80 15 L100 5" vectorEffect="non-scaling-stroke"></path>
                    </svg>
                    <div className="absolute inset-0 bg-gradient-to-t from-error/10 to-transparent"></div>
                  </div>
                  <div className="flex gap-2 mt-auto pt-2">
                    <button className="flex-1 px-3 py-2 bg-surface text-on-surface border border-outline-variant rounded-lg font-label-md text-label-md hover:bg-surface-container-low transition-colors text-center">
                      Clear &amp; Release
                    </button>
                    <button className="flex-1 px-3 py-2 bg-error text-on-error rounded-lg font-label-md text-label-md hover:bg-error/90 transition-colors text-center shadow-sm">
                      Escalate to EFCC
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Standard (Review) */}
          <div className="group border-b border-outline-variant/20 hover:bg-surface-container-lowest transition-colors cursor-pointer bg-surface">
            <div className="grid grid-cols-12 gap-4 px-6 py-4 items-center">
              <div className="col-span-2 font-code-md text-code-md text-on-surface">VND-4011-B</div>
              <div className="col-span-1 text-on-surface-variant">
                <span className="material-symbols-outlined text-[20px]">corporate_fare</span>
              </div>
              <div className="col-span-2 font-headline-sm text-headline-sm score-review">68.5</div>
              <div className="col-span-2">
                <span className="pill-review">
                  <span className="material-symbols-outlined text-[14px]">visibility</span>
                  REVIEW
                </span>
              </div>
              <div className="col-span-2 font-body-sm text-body-sm text-on-surface truncate">Unusual IP Geo-location</div>
              <div className="col-span-1 font-body-sm text-body-sm text-on-surface-variant">HR</div>
              <div className="col-span-2 flex justify-end">
                <span className="material-symbols-outlined text-on-surface-variant transition-transform group-hover:text-primary">expand_more</span>
              </div>
            </div>
          </div>

          {/* Row 3: Standard (Clear) */}
          <div className="group border-b border-outline-variant/20 hover:bg-surface-container-lowest transition-colors cursor-pointer bg-surface">
            <div className="grid grid-cols-12 gap-4 px-6 py-4 items-center">
              <div className="col-span-2 font-code-md text-code-md text-on-surface">PAY-1190-C</div>
              <div className="col-span-1 text-on-surface-variant">
                <span className="material-symbols-outlined text-[20px]">payments</span>
              </div>
              <div className="col-span-2 font-headline-sm text-headline-sm score-clear">12.1</div>
              <div className="col-span-2">
                <span className="pill-clear">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  CLEAR
                </span>
              </div>
              <div className="col-span-2 font-body-sm text-body-sm text-on-surface truncate">None Detected</div>
              <div className="col-span-1 font-body-sm text-body-sm text-on-surface-variant">FIN</div>
              <div className="col-span-2 flex justify-end">
                <span className="material-symbols-outlined text-on-surface-variant transition-transform group-hover:text-primary">expand_more</span>
              </div>
            </div>
          </div>

          {/* Row 4: Standard (Hold) */}
          <div className="group hover:bg-surface-container-lowest transition-colors cursor-pointer bg-surface">
            <div className="grid grid-cols-12 gap-4 px-6 py-4 items-center">
              <div className="col-span-2 font-code-md text-code-md text-on-surface">CON-5502-D</div>
              <div className="col-span-1 text-on-surface-variant">
                <span className="material-symbols-outlined text-[20px]">description</span>
              </div>
              <div className="col-span-2 font-headline-sm text-headline-sm score-hold">88.9</div>
              <div className="col-span-2">
                <span className="pill-hold">
                  <span className="material-symbols-outlined text-[14px]">block</span>
                  HOLD
                </span>
              </div>
              <div className="col-span-2 font-body-sm text-body-sm text-on-surface truncate">Director Cross-Pollination</div>
              <div className="col-span-1 font-body-sm text-body-sm text-on-surface-variant">PROC</div>
              <div className="col-span-2 flex justify-end">
                <span className="material-symbols-outlined text-on-surface-variant transition-transform group-hover:text-primary">expand_more</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between text-on-surface-variant">
        <span className="font-body-sm text-body-sm">Showing 1-4 of 1,240 records</span>
        <div className="flex gap-1">
          <button className="p-1 rounded hover:bg-surface-container-low disabled:opacity-50" disabled>
            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
          </button>
          <button className="w-8 h-8 rounded bg-primary text-on-primary font-body-sm text-body-sm flex items-center justify-center">1</button>
          <button className="w-8 h-8 rounded hover:bg-surface-container-low font-body-sm text-body-sm flex items-center justify-center">2</button>
          <button className="w-8 h-8 rounded hover:bg-surface-container-low font-body-sm text-body-sm flex items-center justify-center">3</button>
          <span className="w-8 h-8 flex items-center justify-center">...</span>
          <button className="p-1 rounded hover:bg-surface-container-low">
            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
          </button>
        </div>
      </div>
    </main>
  );
}
