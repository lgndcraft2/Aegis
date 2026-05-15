import React, { useEffect, useState } from 'react';
import { getLatestCycle, getAlerts } from '../api';
import type { FraudAlert } from '../types';

interface AlertRow {
  entity_id: string;
  entity_type: 'EMPLOYEE' | 'VENDOR' | 'TRANSACTION';
  signal_name: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  expanded: boolean;
}

export function Surveillance() {
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [cycle, setCycle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'critical' | 'high' | 'hold' | 'review'>('all');

  useEffect(() => {
    const loadData = async () => {
      try {
        const latest = await getLatestCycle();
        if (latest) {
          setCycle(latest);
          const fetchedAlerts = await getAlerts(latest.cycle_id);
          
          const alertRows: AlertRow[] = fetchedAlerts.map((alert: FraudAlert) => ({
            entity_id: alert.entity_id,
            entity_type: alert.entity_type,
            signal_name: alert.signal_name,
            severity: alert.severity,
            description: alert.description,
            expanded: false,
          }));
          
          setAlerts(alertRows.sort((a, b) => {
            const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
            return severityOrder[a.severity] - severityOrder[b.severity];
          }));
        }
      } catch (err) {
        console.error('Failed to load alerts:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const toggleExpand = (index: number) => {
    setAlerts((prev) =>
      prev.map((alert, i) =>
        i === index ? { ...alert, expanded: !alert.expanded } : alert
      )
    );
  };

  const getFilteredAlerts = () => {
    let filtered = alerts;

    if (filter === 'critical') {
      filtered = alerts.filter((a) => a.severity === 'CRITICAL');
    } else if (filter === 'high') {
      filtered = alerts.filter((a) => a.severity === 'HIGH');
    }

    return filtered;
  };

  const filteredAlerts = getFilteredAlerts();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'text-error bg-error/10';
      case 'HIGH':
        return 'text-warning bg-warning/10';
      case 'MEDIUM':
        return 'text-secondary bg-secondary/10';
      default:
        return 'text-on-surface-variant bg-surface-container-low';
    }
  };

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-error/10 border-error/30';
      case 'HIGH':
        return 'bg-warning/10 border-warning/30';
      case 'MEDIUM':
        return 'bg-secondary/10 border-secondary/30';
      default:
        return 'bg-surface-container-low border-outline-variant/20';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'block';
      case 'HIGH':
        return 'warning';
      case 'MEDIUM':
        return 'info';
      default:
        return 'check';
    }
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
          <p className="font-body-md text-on-surface-variant">Loading alerts...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 md:ml-[220px] p-6 bg-surface-container-low min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-background mb-2">
              Active Surveillance Queue
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-prose">
              Monitoring cross-departmental financial flows for anomalous activity.
            </p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-surface border border-outline-variant rounded-lg font-label-md text-label-md hover:bg-surface-container transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">download</span>
              Export
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 border-b border-outline-variant/20 pb-4">
          {['all', 'critical', 'high'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 font-label-md text-label-md rounded-t-lg transition-all ${
                filter === f
                  ? 'bg-surface border border-outline-variant/30 border-b-surface'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === 'critical' && alerts.filter((a) => a.severity === 'CRITICAL').length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-error/20 text-error text-[11px] font-bold rounded-full">
                  {alerts.filter((a) => a.severity === 'CRITICAL').length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Alerts List */}
        <div className="bg-surface rounded-lg border border-outline-variant/30 overflow-hidden">
          {filteredAlerts.length === 0 ? (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant/50 mb-3 block">
                check_circle
              </span>
              <p className="font-body-md text-on-surface-variant">
                No {filter === 'all' ? 'alerts' : filter} alerts found
              </p>
            </div>
          ) : (
            <div className="divide-y divide-outline-variant/20">
              {filteredAlerts.map((alert, index) => (
                <div
                  key={index}
                  className={`border-l-4 ${
                    alert.severity === 'CRITICAL'
                      ? 'border-error'
                      : alert.severity === 'HIGH'
                      ? 'border-warning'
                      : 'border-secondary'
                  }`}
                >
                  {/* Alert Row */}
                  <button
                    onClick={() => toggleExpand(index)}
                    className="w-full p-5 hover:bg-surface-container-low transition-colors text-left flex items-start gap-4"
                  >
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${getSeverityColor(alert.severity)}`}>
                      <span className="material-symbols-outlined text-[20px]">
                        {getSeverityIcon(alert.severity)}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-1">
                        <div>
                          <h3 className="font-label-md text-label-md text-on-background font-semibold">
                            {alert.entity_id}
                          </h3>
                          <p className="font-body-sm text-body-sm text-on-surface-variant">
                            {alert.entity_type === 'EMPLOYEE'
                              ? 'Payroll'
                              : alert.entity_type === 'VENDOR'
                              ? 'Procurement'
                              : 'Transaction'}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full font-label-sm text-label-sm font-semibold ${getSeverityColor(alert.severity)}`}
                        >
                          {alert.severity}
                        </span>
                      </div>

                      <p className="font-body-sm text-on-surface mb-2">{alert.signal_name}</p>

                      {alert.expanded && (
                        <div className="mt-3 pt-3 border-t border-outline-variant/20">
                          <p className="font-body-sm text-on-surface-variant">
                            {alert.description}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Expand Toggle */}
                    <span
                      className={`material-symbols-outlined text-on-surface-variant shrink-0 transition-transform ${
                        alert.expanded ? 'rotate-180' : ''
                      }`}
                    >
                      expand_more
                    </span>
                  </button>

                  {/* Expanded Detail Panel */}
                  {alert.expanded && (
                    <div className={`px-5 pb-5 border-t border-outline-variant/20 space-y-4 ${getSeverityBg(alert.severity)}`}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase block mb-1">
                            Entity ID
                          </span>
                          <code className="font-code-md text-code-md text-on-surface bg-surface-container rounded px-2 py-1 block">
                            {alert.entity_id}
                          </code>
                        </div>
                        <div>
                          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase block mb-1">
                            Signal
                          </span>
                          <p className="font-body-sm text-on-surface">{alert.signal_name}</p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button className="flex-1 px-4 py-2 bg-surface border border-outline-variant rounded-lg font-label-md text-label-md hover:bg-surface-container transition-colors">
                          Review Details
                        </button>
                        <button className="flex-1 px-4 py-2 bg-error text-on-error rounded-lg font-label-md text-label-md hover:bg-error/90 transition-colors">
                          Escalate to EFCC
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary Stats */}
        {cycle && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-surface rounded-lg border border-outline-variant/30 p-5">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase block mb-2">
                Critical Alerts
              </span>
              <div className="text-3xl font-bold text-error">
                {alerts.filter((a) => a.severity === 'CRITICAL').length}
              </div>
            </div>
            <div className="bg-surface rounded-lg border border-outline-variant/30 p-5">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase block mb-2">
                High Risk
              </span>
              <div className="text-3xl font-bold text-warning">
                {alerts.filter((a) => a.severity === 'HIGH').length}
              </div>
            </div>
            <div className="bg-surface rounded-lg border border-outline-variant/30 p-5">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase block mb-2">
                Total Entities Flagged
              </span>
              <div className="text-3xl font-bold text-on-background">
                {new Set(alerts.map((a) => a.entity_id)).size}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
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
