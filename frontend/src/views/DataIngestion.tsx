import React, { useState } from 'react';
import { uploadPayroll, uploadVendors, runSurveillance, loadScenario } from '../api';

interface UploadState {
  file: File | null;
  uploading: boolean;
  success: boolean;
  error: string | null;
}

export function DataIngestion({ onCycleStarted, onNavigate }: { onCycleStarted?: (id: string) => void, onNavigate?: (view: any) => void }) {
  const [payroll, setPayroll] = useState<UploadState>({
    file: null,
    uploading: false,
    success: false,
    error: null,
  });

  const [vendors, setVendors] = useState<UploadState>({
    file: null,
    uploading: false,
    success: false,
    error: null,
  });

  const [running, setRunning] = useState(false);
  const [scenarioLoading, setScenarioLoading] = useState(false);
  const [scenarioLoaded, setScenarioLoaded] = useState(false);

  const handlePayrollUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPayroll((prev) => ({ ...prev, file, uploading: true, error: null }));

    try {
      await uploadPayroll(file);
      setPayroll((prev) => ({ ...prev, success: true, uploading: false }));
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Upload failed';
      setPayroll((prev) => ({
        ...prev,
        error: msg,
        uploading: false,
      }));
    }
  };

  const handleVendorUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVendors((prev) => ({ ...prev, file, uploading: true, error: null }));

    try {
      await uploadVendors(file);
      setVendors((prev) => ({ ...prev, success: true, uploading: false }));
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Upload failed';
      setVendors((prev) => ({
        ...prev,
        error: msg,
        uploading: false,
      }));
    }
  };

  const handleRunSurveillance = async () => {
    setRunning(true);
    try {
      const result = await runSurveillance();
      if (onCycleStarted) onCycleStarted(result.cycle_id);
      if (onNavigate) onNavigate('dashboard');
    } catch (err) {
      console.error('Failed to run surveillance:', err);
    } finally {
      setRunning(false);
    }
  };

  const handleLoadScenario = async (n: number) => {
    setScenarioLoading(true);
    try {
      await loadScenario(n);
      setScenarioLoaded(true);
      // Also mark payroll/vendors as success for visual UI feedback
      setPayroll(prev => ({ ...prev, success: true, error: null }));
      setVendors(prev => ({ ...prev, success: true, error: null }));
    } catch (err) {
      console.error('Failed to load scenario:', err);
    } finally {
      setScenarioLoading(false);
    }
  };

  const canRunSurveillance = (payroll.success && vendors.success) || scenarioLoaded;

  return (
    <main className="flex-1 md:ml-[220px] p-6 bg-surface-container-low min-h-screen">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-background mb-2">
              Data Ingestion
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-prose">
              Upload government payroll and vendor registers. AEGIS normalizes the data and runs multi-signal analysis across payroll, procurement, and cross-domain collusion networks.
            </p>
          </div>
          <button
            onClick={async () => {
              if (window.confirm('Are you sure you want to wipe the database? All historical cycles and data will be lost.')) {
                try {
                  const { resetDatabase } = await import('../api');
                  await resetDatabase();
                  alert('Database reset successful.');
                  window.location.reload();
                } catch (e) {
                  alert('Reset failed.');
                }
              }
            }}
            className="px-4 py-2 bg-error/10 text-error border border-error/20 rounded-lg font-label-md text-label-md hover:bg-error/20 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
            Reset Environment
          </button>
        </div>

        {/* Upload Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payroll Upload */}
          <div className="bg-surface rounded-lg border border-outline-variant/30 overflow-hidden flex flex-col h-full">
            <div className="p-5 border-b border-outline-variant/20 bg-surface-container">
              <div className="flex items-center justify-between">
                <h2 className="font-label-md text-label-md text-on-surface uppercase tracking-wider">
                  Payroll CSV
                </h2>
                <span className="material-symbols-outlined text-on-surface-variant text-[24px]">
                  description
                </span>
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col">
              {payroll.file ? (
                <div className="mb-6 p-4 bg-surface-container-low rounded-lg border border-outline-variant/20 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-[20px]">
                      table_chart
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body-md text-body-md text-on-surface font-semibold truncate">
                      {payroll.file.name}
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      {(payroll.file.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                  {payroll.success && (
                    <span className="material-symbols-outlined text-primary shrink-0">
                      check_circle
                    </span>
                  )}
                </div>
              ) : (
                <label className="mb-6 p-8 border-2 border-dashed border-outline-variant/40 rounded-lg hover:border-primary hover:bg-surface-container-low transition-colors cursor-pointer flex flex-col items-center justify-center">
                  <span className="material-symbols-outlined text-outline-variant text-[40px] mb-3">
                    cloud_upload
                  </span>
                  <span className="font-body-md text-body-md text-on-surface-variant text-center">
                    Click to upload or drag and drop
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant text-center mt-1">
                    CSV files only
                  </span>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handlePayrollUpload}
                    disabled={payroll.uploading}
                    className="hidden"
                  />
                </label>
              )}

              <div className="flex-1 flex flex-col">
                <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-3">
                  Required Columns
                </h3>
                <div className="grid grid-cols-2 gap-2 font-body-sm text-body-sm bg-surface-container-low rounded-lg p-4 overflow-y-auto max-h-32">
                  {[
                    'employee_id',
                    'name',
                    'department',
                    'grade_level',
                    'salary_account',
                    'bvn',
                    'employment_date',
                  ].map((col) => (
                    <div
                      key={col}
                      className="flex items-center text-on-surface-variant"
                    >
                      <span className="w-2 h-2 rounded-full bg-primary mr-2"></span>
                      {col}
                    </div>
                  ))}
                </div>
              </div>

              {payroll.error && (
                <div className="mt-4 p-3 bg-error/10 border border-error/30 rounded-lg">
                  <p className="font-body-sm text-error">{payroll.error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Vendor Upload */}
          <div className="bg-surface rounded-lg border border-outline-variant/30 overflow-hidden flex flex-col h-full">
            <div className="p-5 border-b border-outline-variant/20 bg-surface-container">
              <div className="flex items-center justify-between">
                <h2 className="font-label-md text-label-md text-on-surface uppercase tracking-wider">
                  Vendor Register
                </h2>
                <span className="material-symbols-outlined text-on-surface-variant text-[24px]">
                  corporate_fare
                </span>
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col">
              {vendors.file ? (
                <div className="mb-6 p-4 bg-surface-container-low rounded-lg border border-outline-variant/20 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-[20px]">
                      table_chart
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body-md text-body-md text-on-surface font-semibold truncate">
                      {vendors.file.name}
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      {(vendors.file.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                  {vendors.success && (
                    <span className="material-symbols-outlined text-primary shrink-0">
                      check_circle
                    </span>
                  )}
                </div>
              ) : (
                <label className="mb-6 p-8 border-2 border-dashed border-outline-variant/40 rounded-lg hover:border-primary hover:bg-surface-container-low transition-colors cursor-pointer flex flex-col items-center justify-center">
                  <span className="material-symbols-outlined text-outline-variant text-[40px] mb-3">
                    cloud_upload
                  </span>
                  <span className="font-body-md text-body-md text-on-surface-variant text-center">
                    Click to upload or drag and drop
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant text-center mt-1">
                    CSV files only
                  </span>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleVendorUpload}
                    disabled={vendors.uploading}
                    className="hidden"
                  />
                </label>
              )}

              <div className="flex-1 flex flex-col">
                <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-3">
                  Required Columns
                </h3>
                <div className="grid grid-cols-2 gap-2 font-body-sm text-body-sm bg-surface-container-low rounded-lg p-4 overflow-y-auto max-h-32">
                  {[
                    'vendor_id',
                    'name',
                    'registration_address',
                    'director_name',
                    'settlement_account',
                    'bvn',
                    'registration_date',
                  ].map((col) => (
                    <div
                      key={col}
                      className="flex items-center text-on-surface-variant"
                    >
                      <span className="w-2 h-2 rounded-full bg-primary mr-2"></span>
                      {col}
                    </div>
                  ))}
                </div>
              </div>

              {vendors.error && (
                <div className="mt-4 p-3 bg-error/10 border border-error/30 rounded-lg">
                  <p className="font-body-sm text-error">{vendors.error}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CTA: Run Surveillance */}
        <button
          onClick={handleRunSurveillance}
          disabled={!canRunSurveillance || running}
          className={`w-full py-4 rounded-lg font-label-md text-label-md flex items-center justify-center gap-2 transition-all ${
            canRunSurveillance && !running
              ? 'bg-primary text-on-primary hover:bg-primary/90 shadow-md'
              : 'bg-surface-container text-on-surface-variant cursor-not-allowed opacity-60'
          }`}
        >
          <span className={`material-symbols-outlined ${running ? 'animate-spin' : ''}`}>
            {running ? 'hourglass_empty' : 'play_arrow'}
          </span>
          {running ? 'Running Surveillance...' : 'Initiate Surveillance Cycle'}
        </button>

        {/* Demo Scenarios */}
        <div className="border-t border-outline-variant/20 pt-8">
          <h2 className="font-headline-sm text-headline-sm text-on-background mb-2">
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
                description: 'Phantom employees + shell vendor collusion',
                details: '12 Anomalies • 3 Signals',
              },
              {
                id: 2,
                name: 'Clean Slate',
                description: 'Baseline dataset with zero anomalies',
                details: '0 Anomalies • Baseline',
              },
              {
                id: 3,
                name: 'Deep Network',
                description: 'Complex multi-tier relationships',
                details: '45 Anomalies • 8 Signals',
              },
            ].map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => handleLoadScenario(scenario.id)}
                disabled={scenarioLoading}
                className="p-5 bg-surface rounded-lg border border-outline-variant/30 hover:border-primary hover:bg-surface-container transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left"
              >
                <h3 className="font-label-md text-label-md text-on-background font-semibold mb-1">
                  {scenario.name}
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mb-3">
                  {scenario.description}
                </p>
                <p className="font-code-sm text-code-sm text-on-surface-variant">
                  {scenario.details}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
