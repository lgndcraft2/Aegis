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
          
          const squadData = await getSquadAccounts(latest.cycle_id);
          
          if (squadData && squadData.held_accounts) {
            const realTransactions: Transaction[] = squadData.held_accounts.map((acc: any) => ({
              entity_id: acc.squad_ref || acc.transaction_id,
              amount: acc.amount,
              va_number: acc.va_number,
              status: 'HELD',
              timestamp: latest.started_at || new Date().toISOString(),
            }));
            setTransactions(realTransactions);
          } else {
            setTransactions([]);
          }
        }
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleRelease = (index: number) => {
    const updated = [...transactions];
    updated[index].status = 'RELEASED';
    setTransactions(updated);
  };

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
              Treasury Payment Interception
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
                                <button 
                                  onClick={() => handleRelease(index)}
                                  className="flex-1 px-4 py-2 bg-surface border border-outline-variant rounded-lg font-label-md text-label-md hover:bg-surface-container transition-colors"
                                >
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
