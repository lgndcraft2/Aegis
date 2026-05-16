import React from 'react';

type View = 'dashboard' | 'runs' | 'ingest' | 'scores' | 'graph' | 'squad';

interface MainLayoutProps {
  activeView: View;
  setActiveView: (view: View) => void;
  selectedCycleId?: string | null;
  children: React.ReactNode;
}

export function MainLayout({ activeView, setActiveView, selectedCycleId, children }: MainLayoutProps) {
  const navItems: { id: View; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'runs', label: 'Audit Runs', icon: 'history' },
    { id: 'ingest', label: 'Upload', icon: 'upload_file' },
    { id: 'scores', label: 'Surveillance', icon: 'security' },
    { id: 'graph', label: 'Fraud Rings', icon: 'hub' },
    { id: 'squad', label: 'Treasury', icon: 'account_balance_wallet' },
  ];

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen overflow-hidden flex flex-col antialiased">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-margin-desktop bg-surface dark:bg-surface-dim h-14 border-b border-outline-variant/20 dark:border-outline/20 shadow-sm shrink-0">
        <div className="flex items-center gap-4">
          <span className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed-dim">AEGIS</span>
          <div className="h-4 w-px bg-outline-variant/50 mx-2 hidden md:block"></div>
            <span className="font-label-md text-label-md text-on-surface-variant hidden md:flex items-center gap-2 uppercase">
              <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
              {selectedCycleId ? `CYCLE ${selectedCycleId.split('_').pop()}` : 'NO ACTIVE CYCLE'}
            </span>
        </div>
        
        <div className="flex-1 flex justify-end items-center gap-4">
          <div className="relative hidden md:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
            <input 
              className="pl-10 pr-4 py-1.5 bg-surface-container-low border border-outline-variant rounded-full text-body-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-64" 
              placeholder="Search records..." 
              type="text" 
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-on-surface-variant hover:bg-surface-container-low transition-colors rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="p-2 text-on-surface-variant hover:bg-surface-container-low transition-colors rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined">settings</span>
            </button>
            <div className="w-8 h-8 rounded-full overflow-hidden ml-2 border border-outline-variant/20">
              <img alt="User profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBXKIxG8ZdKv4iLy5qd_R9K47dSy-x_tZUQLuc1jS9u8mkrIS46p6HtsZCZXrbG9WUJWFCqSdY0d3OgAdOarM6-j2JZ55eaBkh_aLHmphHVVqtpESwR8w4DevHTXItymeCndK5ZB9SIjbUDPK3r5RFCM_OJ6tct0CBtY8yWOKzB-Bj3eOzbCfNbtTnhnfRpASUFenKeL0xiSc_9TO39bg-M0y07uptM_6MhfPlcE9_9akdMTMLMHtZOl17rMYs68nvyLew-Yl278XOG"/>
            </div>
          </div>
        </div>
      </nav>

      {/* SideNavBar & Content Container */}
      <div className="flex flex-1 pt-14 overflow-hidden relative">
        {/* SideNavBar (Desktop) */}
        <aside className="fixed left-0 top-14 h-[calc(100vh-56px)] z-40 flex-col py-4 w-[220px] bg-surface-container-lowest dark:bg-inverse-surface border-r border-outline-variant/20 dark:border-outline/20 hidden md:flex">
          <div className="px-4 mb-6 mt-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center border border-outline-variant/30">
                <span className="material-symbols-outlined text-primary" style={{fontVariationSettings: "'FILL' 1"}}>account_balance</span>
              </div>
              <div>
                <h2 className="font-headline-sm text-headline-sm font-bold text-primary">AEGIS</h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Gov-Fin Intelligence</p>
              </div>
            </div>
            <button 
              onClick={() => setActiveView('ingest')}
              className="w-full bg-primary text-on-primary py-2 px-4 rounded-lg font-label-md text-label-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              New Scan
            </button>
          </div>
          
          <nav className="flex-1 overflow-y-auto px-2 space-y-1">
            {navItems.map((item) => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    isActive 
                      ? 'bg-primary-container/10 text-primary border-r-4 border-primary scale-[0.98]' 
                      : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]" style={isActive ? {fontVariationSettings: "'FILL' 1"} : {}}>{item.icon}</span>
                  <span className="font-label-md text-label-md">{item.label}</span>
                </button>
              );
            })}
          </nav>
          
          <div className="mt-auto px-3 space-y-1 pt-4 border-t border-outline-variant/20">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container transition-all">
              <span className="material-symbols-outlined text-[20px]">help</span>
              <span className="font-label-md text-label-md">Help</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container transition-all">
              <span className="material-symbols-outlined text-[20px]">logout</span>
              <span className="font-label-md text-label-md">Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        {children}
      </div>

      {/* BottomNavBar (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 flex justify-around items-center h-[72px] bg-surface dark:bg-surface-dim border-t border-outline-variant/20 dark:border-outline/20 pb-safe shadow-[0_-1px_3px_rgba(0,0,0,0.05)]">
        {navItems.slice(0,4).map((item) => {
          const isActive = activeView === item.id;
          return (
            <button 
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`flex flex-col items-center justify-center w-full h-full ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}
            >
              {isActive ? (
                <div className="bg-primary-container/20 px-4 py-1 rounded-full mb-1">
                  <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>{item.icon}</span>
                </div>
              ) : (
                <span className="material-symbols-outlined mb-1">{item.icon}</span>
              )}
              <span className={`font-label-md text-[10px] ${isActive ? 'font-bold' : ''}`}>{item.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  );
}
