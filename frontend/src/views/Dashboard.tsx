import React, { useEffect, useState } from 'react';
import { getLatestCycle, getCycles, subscribeToStream, loadScenario } from '../api';

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

export function Dashboard({ selectedCycleId }: { selectedCycleId?: string | null }) {
  const [cycle, setCycle] = useState<CycleSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [streamMessage, setStreamMessage] = useState('');
  const [loadingScenario, setLoadingScenario] = useState(false);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    const loadCycle = async () => {
      try {
        let activeCycle = null;
        if (selectedCycleId) {
          const cycles = await getCycles();
          activeCycle = cycles.find(c => c.cycle_id === selectedCycleId);
        } else {
          activeCycle = await getLatestCycle();
        }
        
        if (activeCycle) {
          setCycle(activeCycle);
          
          // Subscribe to real-time updates if running
          if (activeCycle.status === 'RUNNING') {
            unsubscribe = subscribeToStream(activeCycle.cycle_id, (message) => {
              setStreamMessage(message.stage || message.message || '');
              if (message.progress) setProgress(message.progress);
            });
          }
        }
      } catch (err) {
        console.error('Failed to load cycle:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCycle();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [selectedCycleId]);

  const handleLoadScenario = async (n: number) => {
    setLoadingScenario(true);
    try {
      const result = await loadScenario(n);
      setStreamMessage(`Scenario "${result.scenario_name}" loaded — ${result.employees} employees, ${result.vendors} vendors. Go to Upload to run surveillance.`);
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


      </div>
    </main>
  );
}
