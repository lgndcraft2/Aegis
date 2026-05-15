import React from 'react';

export function SquadInterception() {
  return (
    <main className="flex-1 md:ml-[220px] p-margin-mobile md:p-margin-desktop max-w-container-max-width mx-auto w-full">
      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-background">Squad Interception</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">Cycle Disbursement Summary — Batch 84A2</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-surface-container-lowest border border-outline-variant text-on-background px-4 py-2 rounded-lg font-label-md text-label-md hover:bg-surface-container-low transition-colors shadow-ambient">
            Generate Cycle Report
          </button>
          <button className="bg-primary text-on-primary px-4 py-2 rounded-lg font-label-md text-label-md hover:bg-surface-tint transition-colors shadow-ambient">
            Release All Cleared
          </button>
        </div>
      </header>

      {/* Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Live Payment Feed (70%) */}
        <section className="lg:col-span-8 bg-surface-container-lowest rounded-lg shadow-ambient border border-outline-variant/20 flex flex-col h-[700px]">
          <div className="px-6 py-4 border-b border-outline-variant/20 flex justify-between items-center">
            <h3 className="font-headline-sm text-headline-sm text-on-background">Live Payment Feed</h3>
            <div className="flex items-center gap-2 text-on-surface-variant font-label-md text-label-md cursor-pointer hover:text-primary">
              <span className="material-symbols-outlined text-sm">filter_list</span> Filter
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-surface-container-lowest z-10 shadow-[0_1px_0_rgba(108,115,104,0.2)]">
                <tr>
                  <th className="py-3 px-6 font-label-md text-label-md text-secondary uppercase tracking-wider">Entity / Beneficiary</th>
                  <th className="py-3 px-6 font-label-md text-label-md text-secondary uppercase tracking-wider">VA Number</th>
                  <th className="py-3 px-6 font-label-md text-label-md text-secondary uppercase tracking-wider text-right">Amount</th>
                  <th className="py-3 px-6 font-label-md text-label-md text-secondary uppercase tracking-wider text-center">Status</th>
                  <th className="py-3 px-6 font-label-md text-label-md text-secondary uppercase tracking-wider w-10"></th>
                </tr>
              </thead>
              <tbody className="font-body-sm text-body-sm text-on-surface divide-y divide-outline-variant/20">
                <tr className="hover:bg-surface transition-colors cursor-pointer">
                  <td className="py-3 px-6">
                    <div className="font-label-md text-label-md">Global Logistics Corp</div>
                    <div className="text-on-surface-variant">Inv-2023-891</div>
                  </td>
                  <td className="py-3 px-6 font-code-md text-code-md text-on-surface-variant">VA-9081-4432-11</td>
                  <td className="py-3 px-6 text-right font-code-md text-code-md">$1,245,000.00</td>
                  <td className="py-3 px-6 text-center">
                    <span className="inline-flex items-center px-2 py-1 rounded bg-error-container text-on-error-container font-label-md text-label-md uppercase text-[10px]">Intercepted</span>
                  </td>
                  <td className="py-3 px-6 text-secondary"><span className="material-symbols-outlined text-lg">more_vert</span></td>
                </tr>
                <tr className="hover:bg-surface transition-colors cursor-pointer bg-surface/50">
                  <td className="py-3 px-6">
                    <div className="font-label-md text-label-md">Apex Infrastructure Ltd</div>
                    <div className="text-on-surface-variant">Gov-Grant-B4</div>
                  </td>
                  <td className="py-3 px-6 font-code-md text-code-md text-on-surface-variant">VA-1120-9988-75</td>
                  <td className="py-3 px-6 text-right font-code-md text-code-md">$850,500.00</td>
                  <td className="py-3 px-6 text-center">
                    <span className="inline-flex items-center px-2 py-1 rounded bg-primary-fixed text-on-primary-fixed font-label-md text-label-md uppercase text-[10px]">Released</span>
                  </td>
                  <td className="py-3 px-6 text-secondary"><span className="material-symbols-outlined text-lg">more_vert</span></td>
                </tr>
                <tr className="hover:bg-surface transition-colors cursor-pointer">
                  <td className="py-3 px-6">
                    <div className="font-label-md text-label-md">Meridian Supplies</div>
                    <div className="text-on-surface-variant">PO-773-AQ</div>
                  </td>
                  <td className="py-3 px-6 font-code-md text-code-md text-on-surface-variant">VA-3341-2210-99</td>
                  <td className="py-3 px-6 text-right font-code-md text-code-md">$42,100.50</td>
                  <td className="py-3 px-6 text-center">
                    <span className="inline-flex items-center px-2 py-1 rounded bg-surface-variant text-on-surface-variant font-label-md text-label-md uppercase text-[10px]">Pending</span>
                  </td>
                  <td className="py-3 px-6 text-secondary"><span className="material-symbols-outlined text-lg">more_vert</span></td>
                </tr>
                <tr className="hover:bg-surface transition-colors cursor-pointer">
                  <td className="py-3 px-6">
                    <div className="font-label-md text-label-md">Quantum Medical Systems</div>
                    <div className="text-on-surface-variant">Med-Eq-901</div>
                  </td>
                  <td className="py-3 px-6 font-code-md text-code-md text-on-surface-variant">VA-8812-4455-22</td>
                  <td className="py-3 px-6 text-right font-code-md text-code-md">$3,100,000.00</td>
                  <td className="py-3 px-6 text-center">
                    <span className="inline-flex items-center px-2 py-1 rounded bg-error-container text-on-error-container font-label-md text-label-md uppercase text-[10px]">Intercepted</span>
                  </td>
                  <td className="py-3 px-6 text-secondary"><span className="material-symbols-outlined text-lg">more_vert</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Right: Cycle Summary (30%) */}
        <section className="lg:col-span-4 flex flex-col gap-6">
          {/* Status Card */}
          <div className="bg-surface-container-lowest rounded-lg shadow-ambient border border-outline-variant/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-headline-sm text-headline-sm text-on-background">System Status</h3>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <span className="font-label-md text-label-md text-secondary uppercase">Squad API · Connected</span>
              </div>
            </div>
          </div>

          {/* Summary Card */}
          <div className="bg-surface-container-lowest rounded-lg shadow-ambient border border-outline-variant/20 flex-1 flex flex-col">
            <div className="px-6 py-4 border-b border-outline-variant/20">
              <h3 className="font-headline-sm text-headline-sm text-on-background">Cycle Summary</h3>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <div className="mb-8">
                <p className="font-label-md text-label-md text-secondary uppercase mb-2">Total Intercepted Amount</p>
                <div className="font-metric-xl text-metric-xl text-error tracking-tight">$4,345,000.00</div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">+12% vs previous cycle</p>
              </div>
              
              <div className="space-y-6 mt-auto">
                <div>
                  <div className="flex justify-between font-label-md text-label-md mb-2">
                    <span className="text-error">Intercepted Volume</span>
                    <span className="text-on-background">68%</span>
                  </div>
                  <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                    <div className="bg-error h-full rounded-full" style={{ width: '68%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between font-label-md text-label-md mb-2">
                    <span className="text-primary">Released Volume</span>
                    <span className="text-on-background">32%</span>
                  </div>
                  <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                    <div className="bg-primary h-full rounded-full" style={{ width: '32%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
