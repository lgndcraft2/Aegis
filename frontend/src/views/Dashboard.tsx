., c,c c ,c,import React, { useEffect, useState } from 'react';
import { getLatestCycle, subscribeToStream, loadScenario } from '../api';

interface CycleSummary {
  cycle_id: string;
  status: 'RUNNING' | 'COMPLETED' | 'ERROR';
  total_employees: number;
  total_vendors: number;
  total_alerts: number;
  critical_alerts: number;
  high_alerts: number;
  intercepted_amount: number;
  completed_at?: string;
}

export function Dashboard() {
  const [cycle, setCycle] = useState<CycleSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [streamMessage, setStreamMessage] = useState('');
  const [loadingScenario, setLoadingScenario] = useState(false);

  useEffect(() => {
    const loadCycle = async () => {
      try {
        const latest = await getLatestCycle();
        if (latest) {
          setCycle(latest);
          
          // Subscribe to real-time updates if running
          if (latest.status === 'RUNNING') {
            const unsubscribe = subscribeToStream(latest.cycle_id, (message) => {
              setStreamMessage(message.stage || message.message || '');
              if (message.progress) setProgress(message.progress);
            });
            return unsubscribe;
          }
        }
      } catch (err) {
        console.error('Failed to load cycle:', err);
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = loadCycle();
    return () => {
      if (unsubscribe instanceof Function) unsubscribe();
    };
  }, []);

  const handleLoadScenario = async (n: number) => {
    setLoadingScenario(true);
    try {
      const result = await loadScenario(n);
      if (result.cycle_id) {
        setCycle(result);
        setProgress(0);
        setStreamMessage('Scenario loaded, running surveillance...');
      }
    } catch (err) {
      console.error('Failed to load scenario:', err);
    } finally {
      setLoadingScenario(false);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount);
  };

  return (
    <main className="flex-1 md:ml-[220px] min-h-screen p-6 bg-surface-container-low">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-background mb-2">
              Intelligence Dashboard
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Real-time surveillance across payroll, procurement, and collusion networks.
            </p>
          </div>
          {cycle && (
            <div className="flex items-center gap-2 px-4 py-2 bg-surface-container rounded-lg border border-outline-variant/30">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="font-label-md text-label-md text-on-surface-variant">
                Cycle {cycle.cycle_id?.slice(-3)} • {cycle.status}
              </span>
            </div>
          )}
        </div>

        {/* Status Bar with Progress */}
        {cycle && cycle.status === 'RUNNING' && (
          <div className="bg-surface-container rounded-lg border border-outline-variant/30 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                {streamMessage || 'Initializing analysis...'}
              </span>
              <span className="font-code-md text-code-md text-on-surface-variant">{progress}%</span>
            </div>
            <div className="h-1.5 bg-surface-variant rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Metric 1: Employees Scanned */}
          <div className="bg-surface rounded-lg border border-outline-variant/30 p-5 flex flex-col">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                Employees Scanned
              </h3>
              <span className="material-symbols-outlined text-on-surface-variant text-[20px]">group</span>
            </div>
            <div className="text-4xl font-bold text-on-background mb-1">
              {cycle?.total_employees.toLocaleString() || '—'}
            </div>
            <p className="font-body-sm text-on-surface-variant">Payroll dataset</p>
          </div>

          {/* Metric 2: Vendors Scanned */}
          <div className="bg-surface rounded-lg border border-outline-variant/30 p-5 flex flex-col">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                Vendors Scanned
              </h3>
              <span className="material-symbols-outlined text-on-surface-variant text-[20px]">storefront</span>
            </div>
            <div className="text-4xl font-bold text-on-background mb-1">
              {cycle?.total_vendors.toLocaleString() || '—'}
            </div>
            <p className="font-body-sm text-on-surface-variant">Procurement register</p>
          </div>

          {/* Metric 3: Total Flagged */}
          <div className="bg-surface rounded-lg border border-outline-variant/30 p-5 flex flex-col">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                Alerts Generated
              </h3>
              <span className="material-symbols-outlined text-error text-[20px]">warning</span>
            </div>
            <div className="text-4xl font-bold text-error mb-1">
              {cycle?.total_alerts.toLocaleString() || '—'}
            </div>
            <p className="font-body-sm text-on-surface-variant">
              {cycle?.critical_alerts ? `${cycle.critical_alerts} critical` : 'None'}
            </p>
          </div>

          {/* Metric 4: Amount Intercepted */}
          <div className="bg-surface rounded-lg border border-outline-variant/30 p-5 flex flex-col">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                Intercepted
              </h3>
              <span className="material-symbols-outlined text-primary text-[20px]">account_balance_wallet</span>
            </div>
            <div className="text-2xl font-bold text-primary mb-1">
              {cycle?.intercepted_amount ? formatAmount(cycle.intercepted_amount) : '₦0'}
            </div>
            <p className="font-body-sm text-on-surface-variant">In Squad VAs</p>
          </div>
        </div>

        {/* Alert Breakdown */}
        {cycle && (
          <div className="bg-surface rounded-lg border border-outline-variant/30 p-6">
            <h2 className="font-headline-sm text-headline-sm text-on-background mb-4">Alert Composition</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-error mr-3"></div>
                <div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant uppercase">Critical</p>
                  <p className="font-headline-md text-headline-md text-error">
                    {cycle.critical_alerts}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-warning mr-3"></div>
                <div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant uppercase">High</p>
                  <p className="font-headline-md text-headline-md text-warning">
                    {cycle.high_alerts}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-secondary mr-3"></div>
                <div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant uppercase">Review</p>
                  <p className="font-headline-md text-headline-md text-secondary">
                    {Math.max(0, (cycle.total_alerts || 0) - (cycle.critical_alerts || 0) - (cycle.high_alerts || 0))}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Demo Scenarios */}
        <div className="border-t border-outline-variant/20 pt-8">
          <h2 className="font-headline-sm text-headline-sm text-on-background mb-4">
            Demo Scenarios
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mb-6">
            Load pre-seeded datasets to see AEGIS in action.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                id: 1,
                name: 'Ghost Fleet',
                desc: 'Phantom employees + shell vendors',
                icon: 'directions_boat',
              },
              {
                id: 2,
                name: 'Clean Slate',
                desc: 'Baseline dataset, zero anomalies',
                icon: 'check_circle',
              },
              {
                id: 3,
                name: 'Deep Network',
                desc: 'Complex multi-tier relationships',
                icon: 'account_tree',
              },
            ].map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => handleLoadScenario(scenario.id)}
                disabled={loadingScenario}
                className="p-4 bg-surface border border-outline-variant/30 rounded-lg hover:border-primary hover:bg-surface-container transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-label-md text-label-md text-on-background font-semibold">
                    {scenario.name}
                  </h3>
                  <span className="material-symbols-outlined text-on-surface-variant">
                    {scenario.icon}
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {scenario.desc}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
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
