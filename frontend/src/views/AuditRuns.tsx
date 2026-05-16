import React, { useEffect, useState } from 'react';
import { getCycles } from '../api';

interface AuditRunProps {
  onSelectCycle: (cycleId: string) => void;
}

export function AuditRuns({ onSelectCycle }: AuditRunProps) {
  const [cycles, setCycles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCycles = async () => {
      try {
        const data = await getCycles();
        setCycles(data); // Backend already returns newest first (started_at desc)
      } catch (err) {
        console.error('Failed to load cycles', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCycles();
  }, []);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      notation: 'compact',
    }).format(amount || 0);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <main className="flex-1 md:ml-[220px] p-6 bg-surface-container-low min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">
            hourglass_empty
          </span>
          <p className="mt-4 font-label-md text-on-surface-variant">Loading Audit History...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 md:ml-[220px] p-6 bg-surface-container-low min-h-screen overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="font-headline-lg text-headline-lg text-on-background mb-2">
            Audit Runs
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Historical overview of all surveillance cycles and data uploads.
          </p>
        </div>

        <div className="bg-surface border border-outline-variant/30 rounded-lg overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-outline-variant/20 bg-surface-container-lowest">
            <h3 className="font-headline-sm text-headline-sm text-on-background">
              Execution History
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container-lowest border-b border-outline-variant/20">
                <tr>
                  <th className="px-6 py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                    Cycle ID
                  </th>
                  <th className="px-6 py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                    Execution Date
                  </th>
                  <th className="px-6 py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                    Records Scanned
                  </th>
                  <th className="px-6 py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                    Fraud Alerts
                  </th>
                  <th className="px-6 py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                    Capital Protected
                  </th>
                  <th className="px-6 py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {cycles.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-on-surface-variant font-body-md">
                      No audit runs found. Upload a dataset to begin surveillance.
                    </td>
                  </tr>
                ) : (
                  cycles.map((cycle) => (
                    <tr key={cycle.cycle_id} className="hover:bg-surface-container-low transition-colors group">
                      <td className="px-6 py-4">
                        <code className="font-code-md text-code-md text-on-surface font-semibold bg-surface-container rounded px-2 py-1">
                          {cycle.cycle_id.split('_').pop()}
                        </code>
                      </td>
                      <td className="px-6 py-4 font-body-md text-on-surface-variant">
                        {formatDate(cycle.started_at)}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-body-md text-on-surface">
                          <span className="font-semibold">{cycle.total_employees}</span> Emps
                          <span className="mx-2 text-outline-variant">|</span>
                          <span className="font-semibold">{cycle.total_vendors}</span> Vnds
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center justify-center min-w-[2rem] px-2 py-1 rounded-full font-label-sm font-bold ${
                          cycle.total_alerts > 0 ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'
                        }`}>
                          {cycle.total_alerts || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-code-md text-on-surface font-semibold">
                        {formatAmount(cycle.total_intercepted_amount || 0)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-label-sm font-semibold ${
                            cycle.status === 'COMPLETED'
                              ? 'bg-primary/10 text-primary'
                              : cycle.status === 'RUNNING'
                              ? 'bg-secondary/10 text-secondary'
                              : 'bg-error/10 text-error'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            {cycle.status === 'COMPLETED' ? 'check_circle' : cycle.status === 'RUNNING' ? 'sync' : 'error'}
                          </span>
                          {cycle.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => onSelectCycle(cycle.cycle_id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity px-4 py-2 bg-primary text-on-primary rounded-lg font-label-md font-semibold hover:bg-primary/90 flex items-center gap-2 ml-auto"
                        >
                          View Results
                          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
