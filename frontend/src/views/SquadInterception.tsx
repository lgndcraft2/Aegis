import React, { useEffect, useState } from 'react';
import { getLatestCycle, getSquadAccounts } from '../api';

interface Transaction {
  entity_id: string;
  amount: number;
  va_number: string;
  status: 'HELD' | 'RELEASED' | 'INVESTIGATING';
  timestamp: string;
}

export function SquadInterception() {
  const [cycle, setCycle] = useState<any>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const latest = await getLatestCycle();
        if (latest) {
          setCycle(latest);
          
          // Mock transactions - in production this would come from Squad API
          const mockTransactions: Transaction[] = [
            {
              entity_id: 'Global Logistics Corp',
              amount: 1245000,
              va_number: 'VA-9081-4432-11',
              status: 'HELD',
              timestamp: '2024-05-15T14:32:00Z',
            },
            {
              entity_id: 'EMP-82891 (Phantom)',
              amount: 250000,
              va_number: 'VA-7234-8899-02',
              status: 'HELD',
              timestamp: '2024-05-15T14:28:00Z',
            },
            {
              entity_id: 'Prime Supplies Ltd',
              amount: 890000,
              va_number: 'VA-5521-3344-09',
              status: 'HELD',
              timestamp: '2024-05-15T14:25:00Z',
            },
            {
              entity_id: 'Verified Vendor (Inc.)',
              amount: 450000,
              va_number: 'VA-8890-1122-05',
              status: 'RELEASED',
              timestamp: '2024-05-15T13:45:00Z',
            },
          ];
          
          setTransactions(mockTransactions);
        }
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-NG', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const totalHeld = transactions
    .filter((t) => t.status === 'HELD')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalReleased = transactions
    .filter((t) => t.status === 'RELEASED')
    .reduce((sum, t) => sum + t.amount, 0);

  if (loading) {
    return (
      <main className="flex-1 md:ml-[220px] p-6 bg-surface-container-low min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4">
            <span className="material-symbols-outlined text-4xl text-primary animate-spin">
              hourglass_empty
            </span>
          </div>
          <p className="font-body-md text-on-surface-variant">Loading transactions...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 md:ml-[220px] p-6 bg-surface-container-low min-h-screen">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-background mb-2">
              Squad Payment Interception
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Real-time disbursement control through Squad Virtual Accounts.
            </p>
          </div>

          <div className="flex gap-2">
            <button className="px-4 py-2 bg-surface border border-outline-variant rounded-lg font-label-md text-label-md hover:bg-surface-container transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">download</span>
              Export Report
            </button>
            <button className="px-4 py-2 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              Release All Cleared
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-surface rounded-lg border border-outline-variant/30 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-2">
                  Total in Hold
                </p>
                <p className="font-headline-lg text-headline-lg text-error font-bold">
                  {formatAmount(totalHeld)}
                </p>
              </div>
              <span className="material-symbols-outlined text-error/50 text-[40px]">
                lock_clock
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              {transactions.filter((t) => t.status === 'HELD').length} transactions pending review
            </p>
          </div>

          <div className="bg-surface rounded-lg border border-outline-variant/30 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-2">
                  Released Today
                </p>
                <p className="font-headline-lg text-headline-lg text-primary font-bold">
                  {formatAmount(totalReleased)}
                </p>
              </div>
              <span className="material-symbols-outlined text-primary/50 text-[40px]">
                verified_user
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              {transactions.filter((t) => t.status === 'RELEASED').length} transactions cleared
            </p>
          </div>
        </div>

        {/* Payment Feed Table */}
        <div className="bg-surface rounded-lg border border-outline-variant/30 overflow-hidden">
          <div className="px-6 py-4 border-b border-outline-variant/20 bg-surface-container-lowest">
            <h3 className="font-headline-sm text-headline-sm text-on-background">
              Live Payment Feed
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container-lowest border-b border-outline-variant/20">
                <tr>
                  <th className="px-6 py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                    Entity / Beneficiary
                  </th>
                  <th className="px-6 py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                    Virtual Account
                  </th>
                  <th className="px-6 py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">
                    Amount
                  </th>
                  <th className="px-6 py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {transactions.map((tx, index) => (
                  <React.Fragment key={index}>
                    <tr className="hover:bg-surface-container-low transition-colors cursor-pointer">
                      <td className="px-6 py-4">
                        <p className="font-body-md text-body-md text-on-surface font-semibold">
                          {tx.entity_id}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <code className="font-code-md text-code-md text-on-surface-variant bg-surface-container-low rounded px-2 py-1">
                          {tx.va_number}
                        </code>
                      </td>
                      <td className="px-6 py-4 text-right font-code-md text-code-md text-on-surface font-semibold">
                        {formatAmount(tx.amount)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-label-sm text-label-sm font-semibold ${
                            tx.status === 'HELD'
                              ? 'bg-error/10 text-error'
                              : tx.status === 'RELEASED'
                              ? 'bg-primary/10 text-primary'
                              : 'bg-secondary/10 text-secondary'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            {tx.status === 'HELD'
                              ? 'block'
                              : tx.status === 'RELEASED'
                              ? 'check_circle'
                              : 'schedule'}
                          </span>
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-body-sm text-body-sm text-on-surface-variant">
                        {formatTime(tx.timestamp)}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() =>
                            setExpandedIndex(expandedIndex === index ? null : index)
                          }
                          className="text-on-surface-variant hover:text-primary transition-colors"
                        >
                          <span
                            className={`material-symbols-outlined transition-transform ${
                              expandedIndex === index ? 'rotate-180' : ''
                            }`}
                          >
                            expand_more
                          </span>
                        </button>
                      </td>
                    </tr>

                    {/* Expanded Details */}
                    {expandedIndex === index && (
                      <tr className="bg-surface-container-low border-t border-outline-variant/20">
                        <td colSpan={6} className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                              <p className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-2">
                                Transaction ID
                              </p>
                              <code className="font-code-md text-code-md text-on-surface">
                                TRX_{Math.random().toString(36).substr(2, 8).toUpperCase()}
                              </code>
                            </div>
                            <div>
                              <p className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-2">
                                AEGIS Score
                              </p>
                              <div className="flex items-center gap-2">
                                <span className="font-headline-md text-headline-md text-error font-bold">
                                  92
                                </span>
                                <span className="text-body-sm text-error">/ 100</span>
                              </div>
                            </div>
                            <div>
                              <p className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-2">
                                Primary Signal
                              </p>
                              <p className="font-body-sm text-body-sm text-on-surface">
                                Cross-Domain Collusion
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 flex gap-2">
                            {tx.status === 'HELD' && (
                              <>
                                <button className="flex-1 px-4 py-2 bg-surface border border-outline-variant rounded-lg font-label-md text-label-md hover:bg-surface-container transition-colors">
                                  Clear & Release
                                </button>
                                <button className="flex-1 px-4 py-2 bg-error text-on-error rounded-lg font-label-md text-label-md hover:bg-error/90 transition-colors">
                                  Escalate to EFCC
                                </button>
                              </>
                            )}
                            {tx.status === 'RELEASED' && (
                              <button className="flex-1 px-4 py-2 bg-surface border border-outline-variant rounded-lg font-label-md text-label-md hover:bg-surface-container transition-colors">
                                View Details
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Info */}
        <div className="bg-surface-container-lowest rounded-lg border border-outline-variant/20 p-4 text-center">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            All intercepted payments held in Squad Virtual Accounts pending human review. Learn more about
            <a
              href="#"
              className="text-primary hover:underline ml-1"
            >
              Squad's financial infrastructure
            </a>
            .
          </p>
        </div>
      </div>
    </main>
  );
}
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
