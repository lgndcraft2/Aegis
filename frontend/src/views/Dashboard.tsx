., c,c c ,c,import React from 'react';

export function Dashboard() {
  return (
    <main className="flex-1 md:ml-[220px] min-h-screen p-margin-desktop bg-surface-container-low">
      <div className="max-w-container-max-width mx-auto space-y-gutter">
        {/* Stat Blocks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
          {/* Stat 1 */}
          <div className="bg-surface rounded-lg p-4 shadow-[0_1px_3px_rgba(0,0,0,0.08)] relative border border-outline-variant/20">
            <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[16px]">group</span>
            </div>
            <div className="font-label-md text-label-md text-on-surface-variant uppercase mb-2">EMPLOYEES SCANNED</div>
            <div className="font-metric-xl text-metric-xl text-primary font-bold">500</div>
          </div>
          
          {/* Stat 2 */}
          <div className="bg-surface rounded-lg p-4 shadow-[0_1px_3px_rgba(0,0,0,0.08)] relative border border-outline-variant/20">
            <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[16px]">storefront</span>
            </div>
            <div className="font-label-md text-label-md text-on-surface-variant uppercase mb-2">VENDORS SCANNED</div>
            <div className="font-metric-xl text-metric-xl text-primary font-bold">120</div>
          </div>
          
          {/* Stat 3 */}
          <div className="bg-surface rounded-lg p-4 shadow-[0_1px_3px_rgba(0,0,0,0.08)] relative border border-outline-variant/20">
            <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-error/10 flex items-center justify-center text-error">
              <span className="material-symbols-outlined text-[16px]">flag</span>
            </div>
            <div className="font-label-md text-label-md text-on-surface-variant uppercase mb-2">TOTAL FLAGGED</div>
            <div className="font-metric-xl text-metric-xl text-error font-bold">23</div>
          </div>
          
          {/* Stat 4 */}
          <div className="bg-surface rounded-lg p-4 shadow-[0_1px_3px_rgba(0,0,0,0.08)] relative border border-outline-variant/20">
            <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[16px]">account_balance_wallet</span>
            </div>
            <div className="font-label-md text-label-md text-on-surface-variant uppercase mb-2">AMOUNT INTERCEPTED</div>
            <div className="font-metric-xl text-metric-xl text-primary font-bold">₦23.4M</div>
          </div>
        </div>

        {/* Split Body Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          {/* Left Column (60%) */}
          <div className="lg:col-span-7 space-y-gutter">
            {/* Bar Chart Card */}
            <div className="bg-surface rounded-lg p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-outline-variant/20">
              <div className="font-headline-sm text-headline-sm text-on-surface mb-6 border-b border-outline-variant/20 pb-4">AEGIS Score Distribution</div>
              <div className="space-y-4">
                {/* Row 1 */}
                <div>
                  <div className="flex justify-between font-label-md text-label-md text-on-surface-variant mb-1">
                    <span>Clear (0-30)</span>
                    <span>450 Entities</span>
                  </div>
                  <div className="w-full bg-surface-container-highest rounded-full h-2 overflow-hidden">
                    <div className="bg-primary h-full rounded-full" style={{ width: '72%' }}></div>
                  </div>
                </div>
                {/* Row 2 */}
                <div>
                  <div className="flex justify-between font-label-md text-label-md text-on-surface-variant mb-1">
                    <span>Review (31-70)</span>
                    <span>147 Entities</span>
                  </div>
                  <div className="w-full bg-surface-container-highest rounded-full h-2 overflow-hidden">
                    <div className="bg-[#d97706] h-full rounded-full" style={{ width: '24%' }}></div>
                  </div>
                </div>
                {/* Row 3 */}
                <div>
                  <div className="flex justify-between font-label-md text-label-md text-on-surface-variant mb-1">
                    <span>Hold (71-100)</span>
                    <span>23 Entities</span>
                  </div>
                  <div className="w-full bg-surface-container-highest rounded-full h-2 overflow-hidden">
                    <div className="bg-error h-full rounded-full" style={{ width: '4%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Terminal Activity Card */}
            <div className="bg-surface rounded-lg p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-outline-variant/20">
              <div className="font-headline-sm text-headline-sm text-on-surface mb-4 border-b border-outline-variant/20 pb-4">Recent Activity</div>
              <div className="bg-inverse-surface rounded-md p-4 font-code-md text-code-md text-inverse-on-surface space-y-2 h-[200px] overflow-y-auto">
                <div className="flex gap-4">
                  <span className="text-primary-fixed-dim">10:42:05</span>
                  <span>[SCAN_UPDATE] Vendor V-8921 check complete. Status: CLEAR.</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-primary-fixed-dim">10:41:12</span>
                  <span className="text-tertiary-fixed-dim">[ALERT] High risk pattern detected on Employee E-442. Flagging for HOLD.</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-primary-fixed-dim">10:40:01</span>
                  <span>[SYS_LOG] Cycle 004 initialized. Target parameters loaded.</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-primary-fixed-dim">10:38:44</span>
                  <span className="text-[#fbbf24]">[WARN] Delayed response from external DB for V-110. Retrying...</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-primary-fixed-dim">10:35:20</span>
                  <span>[SCAN_UPDATE] Employee E-901 check complete. Status: CLEAR.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (40%) */}
          <div className="lg:col-span-5 space-y-gutter">
            {/* Donut Chart Card */}
            <div className="bg-surface rounded-lg p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-outline-variant/20 flex flex-col items-center justify-center min-h-[250px]">
              <div className="w-full font-headline-sm text-headline-sm text-on-surface mb-6 border-b border-outline-variant/20 pb-4 text-left">Verdict Breakdown</div>
              <div className="relative w-48 h-48 rounded-full flex items-center justify-center border-8 border-surface-container-highest" style={{ background: "conic-gradient(from 0deg, theme('colors.primary') 0% 72%, #d97706 72% 96%, theme('colors.error') 96% 100%)", borderColor: 'transparent' }}>
                <div className="absolute inset-0 rounded-full border-8 border-surface mix-blend-overlay opacity-20"></div>
                <div className="w-36 h-36 bg-surface rounded-full flex flex-col items-center justify-center shadow-inner z-10">
                  <span className="font-headline-lg text-headline-lg font-bold text-on-surface">620</span>
                  <span className="font-label-md text-label-md text-on-surface-variant uppercase">Entities</span>
                </div>
              </div>
            </div>

            {/* Highest Risk Table Card */}
            <div className="bg-surface rounded-lg p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-outline-variant/20 overflow-hidden">
              <div className="font-headline-sm text-headline-sm text-on-surface mb-4 border-b border-outline-variant/20 pb-4">Highest Risk</div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-outline-variant/20">
                      <th className="py-2 px-2 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">ID</th>
                      <th className="py-2 px-2 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Score</th>
                      <th className="py-2 px-2 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Primary Flag</th>
                    </tr>
                  </thead>
                  <tbody className="font-body-sm text-body-sm text-on-surface">
                    <tr className="border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors bg-error-container/20">
                      <td className="py-3 px-2 font-code-md">V-882</td>
                      <td className="py-3 px-2 font-bold text-error">94</td>
                      <td className="py-3 px-2">Ghost Director</td>
                    </tr>
                    <tr className="border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors bg-error-container/10">
                      <td className="py-3 px-2 font-code-md">E-442</td>
                      <td className="py-3 px-2 font-bold text-error">88</td>
                      <td className="py-3 px-2">Multiple TINs</td>
                    </tr>
                    <tr className="border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors">
                      <td className="py-3 px-2 font-code-md">V-104</td>
                      <td className="py-3 px-2 font-bold text-[#d97706]">76</td>
                      <td className="py-3 px-2">Address Mismatch</td>
                    </tr>
                    <tr className="border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors">
                      <td className="py-3 px-2 font-code-md">E-991</td>
                      <td className="py-3 px-2 font-bold text-[#d97706]">72</td>
                      <td className="py-3 px-2">Dormant Account</td>
                    </tr>
                    <tr className="hover:bg-surface-container-low transition-colors">
                      <td className="py-3 px-2 font-code-md">V-330</td>
                      <td className="py-3 px-2 font-bold text-[#d97706]">71</td>
                      <td className="py-3 px-2">High Value Jump</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
