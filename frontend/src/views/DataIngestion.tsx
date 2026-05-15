import React from 'react';

export function DataIngestion() {
  return (
    <main className="flex-1 md:ml-[220px] p-margin-mobile md:p-margin-desktop max-w-container-max-width mx-auto w-full">
      {/* Page Header */}
      <header className="mb-8">
        <h1 className="font-headline-lg text-headline-lg text-primary mb-2">Data Ingestion</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant">Ingest records for multi-signal anomaly detection.</p>
      </header>

      {/* Upload Zones Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter mb-8">
        {/* Payroll CSV Upload */}
        <div className="bg-surface-container-lowest rounded-lg border border-outline-variant shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col h-full">
          <div className="p-4 border-b border-outline-variant/20 flex justify-between items-center bg-surface">
            <h2 className="font-label-md text-label-md text-primary uppercase">Payroll CSV</h2>
            <span className="material-symbols-outlined text-outline">description</span>
          </div>
          <div className="p-6 flex-1 flex flex-col">
            {/* Active File State (Simulated) */}
            <div className="flex-1 flex flex-col">
              <div className="flex items-center p-4 bg-surface-container-low rounded-lg border border-outline-variant/50 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center mr-4">
                  <span className="material-symbols-outlined text-primary text-[24px]" style={{fontVariationSettings: "'FILL' 1"}}>table_chart</span>
                </div>
                <div className="flex-1">
                  <div className="font-label-md text-label-md text-on-surface truncate">Q3_Gov_Payroll_Master.csv</div>
                  <div className="font-body-sm text-body-sm text-on-surface-variant">24.5 MB • 142,084 Rows</div>
                </div>
                <button className="text-outline hover:text-error transition-colors">
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
              
              <h3 className="font-label-md text-label-md text-on-surface-variant uppercase mb-3">Schema Validation</h3>
              <div className="grid grid-cols-2 gap-2 font-code-md text-code-md bg-surface-bright border border-outline-variant/20 rounded p-3 h-[180px] overflow-y-auto">
                <div className="flex items-center text-on-surface"><span className="w-2 h-2 rounded-full bg-primary mr-2"></span>employee_id</div>
                <div className="flex items-center text-on-surface"><span className="w-2 h-2 rounded-full bg-primary mr-2"></span>first_name</div>
                <div className="flex items-center text-on-surface"><span className="w-2 h-2 rounded-full bg-primary mr-2"></span>last_name</div>
                <div className="flex items-center text-on-surface"><span className="w-2 h-2 rounded-full bg-primary mr-2"></span>ssn_hash</div>
                <div className="flex items-center text-on-surface"><span className="w-2 h-2 rounded-full bg-primary mr-2"></span>department_code</div>
                <div className="flex items-center text-on-surface"><span className="w-2 h-2 rounded-full bg-primary mr-2"></span>base_salary</div>
                <div className="flex items-center text-on-surface"><span className="w-2 h-2 rounded-full bg-primary mr-2"></span>bank_routing_num</div>
                <div className="flex items-center text-on-surface"><span className="w-2 h-2 rounded-full bg-primary mr-2"></span>bank_account_num</div>
                <div className="flex items-center text-on-surface-variant opacity-70"><span className="w-2 h-2 rounded-full bg-outline mr-2"></span>bonus_amount</div>
                <div className="flex items-center text-on-surface-variant opacity-70"><span className="w-2 h-2 rounded-full bg-outline mr-2"></span>tax_deductions</div>
              </div>
            </div>
          </div>
        </div>

        {/* Vendor Register Upload */}
        <div className="bg-surface-container-lowest rounded-lg border border-outline-variant shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col h-full">
          <div className="p-4 border-b border-outline-variant/20 flex justify-between items-center bg-surface">
            <h2 className="font-label-md text-label-md text-primary uppercase">Vendor Register</h2>
            <span className="material-symbols-outlined text-outline">corporate_fare</span>
          </div>
          <div className="p-6 flex-1 flex flex-col">
            {/* Active File State (Simulated) */}
            <div className="flex-1 flex flex-col">
              <div className="flex items-center p-4 bg-surface-container-low rounded-lg border border-outline-variant/50 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center mr-4">
                  <span className="material-symbols-outlined text-primary text-[24px]" style={{fontVariationSettings: "'FILL' 1"}}>table_chart</span>
                </div>
                <div className="flex-1">
                  <div className="font-label-md text-label-md text-on-surface truncate">Approved_Vendors_FY24.csv</div>
                  <div className="font-body-sm text-body-sm text-on-surface-variant">8.2 MB • 45,902 Rows</div>
                </div>
                <button className="text-outline hover:text-error transition-colors">
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
              
              <h3 className="font-label-md text-label-md text-on-surface-variant uppercase mb-3">Schema Validation</h3>
              <div className="grid grid-cols-2 gap-2 font-code-md text-code-md bg-surface-bright border border-outline-variant/20 rounded p-3 h-[180px] overflow-y-auto">
                <div className="flex items-center text-on-surface"><span className="w-2 h-2 rounded-full bg-primary mr-2"></span>vendor_id</div>
                <div className="flex items-center text-on-surface"><span className="w-2 h-2 rounded-full bg-primary mr-2"></span>legal_name</div>
                <div className="flex items-center text-on-surface"><span className="w-2 h-2 rounded-full bg-primary mr-2"></span>ein_tax_id</div>
                <div className="flex items-center text-on-surface"><span className="w-2 h-2 rounded-full bg-primary mr-2"></span>incorporation_date</div>
                <div className="flex items-center text-error"><span className="w-2 h-2 rounded-full bg-error mr-2"></span>primary_address (Missing)</div>
                <div className="flex items-center text-on-surface"><span className="w-2 h-2 rounded-full bg-primary mr-2"></span>bank_routing_num</div>
                <div className="flex items-center text-on-surface"><span className="w-2 h-2 rounded-full bg-primary mr-2"></span>bank_account_num</div>
                <div className="flex items-center text-on-surface"><span className="w-2 h-2 rounded-full bg-primary mr-2"></span>contact_email</div>
                <div className="flex items-center text-on-surface-variant opacity-70"><span className="w-2 h-2 rounded-full bg-outline mr-2"></span>contract_value</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary CTA */}
      <div className="mb-12">
        <button className="w-full bg-primary text-on-primary font-headline-sm text-headline-sm py-4 rounded-lg shadow-sm hover:bg-primary/90 transition-colors flex items-center justify-center space-x-3 group">
          <span className="material-symbols-outlined group-hover:rotate-180 transition-transform duration-500">sync</span>
          <span>Initiate Surveillance Cycle</span>
        </button>
      </div>

      {/* Demo Scenarios Panel */}
      <section className="border-t border-outline-variant/20 pt-8">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="font-headline-sm text-headline-sm text-primary">Demo Scenarios</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Load pre-seeded datasets for demonstration purposes.</p>
          </div>
          <span className="material-symbols-outlined text-outline">science</span>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          {/* Scenario 1 */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-5 cursor-pointer hover:border-primary hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] transition-all group">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-label-md text-label-md text-primary uppercase">The Ghost Fleet</h3>
              <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors text-[20px]">directions_boat</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">Simulates a complex network of phantom employees routing payments to shell vendor accounts.</p>
            <div className="font-code-md text-[11px] text-outline">12 Anomalies • 3 Signals</div>
          </div>
          
          {/* Scenario 2 */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-5 cursor-pointer hover:border-primary hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] transition-all group">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-label-md text-label-md text-primary uppercase">Clean Slate</h3>
              <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors text-[20px]">check_circle</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">A baseline dataset with zero intentional anomalies to demonstrate false-positive suppression.</p>
            <div className="font-code-md text-[11px] text-outline">0 Anomalies • Baseline</div>
          </div>
          
          {/* Scenario 3 */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-5 cursor-pointer hover:border-primary hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] transition-all group">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-label-md text-label-md text-primary uppercase">Deep Network</h3>
              <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors text-[20px]">account_tree</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">High-volume dataset revealing subtle multi-tier relationships between disparate vendor entities.</p>
            <div className="font-code-md text-[11px] text-outline">45 Anomalies • 8 Signals</div>
          </div>
        </div>
      </section>
    </main>
  );
}
