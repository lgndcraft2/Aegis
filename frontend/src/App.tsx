import { useState } from 'react'
import {
  Shield,
  Upload,
  Activity,
  Network,
  FileText,
  CreditCard,
} from 'lucide-react'

type View = 'dashboard' | 'ingest' | 'scores' | 'graph' | 'squad' | 'report'

export default function App() {
  const [activeView, setActiveView] = useState<View>('dashboard')

  const navItems: { id: View; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <Activity size={20} /> },
    { id: 'ingest', label: 'Data Ingestion', icon: <Upload size={20} /> },
    { id: 'scores', label: 'AEGIS Scores', icon: <Shield size={20} /> },
    { id: 'graph', label: 'Fraud Graph', icon: <Network size={20} /> },
    { id: 'squad', label: 'Squad Panel', icon: <CreditCard size={20} /> },
    { id: 'report', label: 'Audit Report', icon: <FileText size={20} /> },
  ]

  return (
    <div className="flex h-screen font-['Inter',sans-serif]">
      {/* Sidebar */}
      <aside className="w-64 glass-panel rounded-none border-r border-slate-700/50 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
              <Shield size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">AEGIS</h1>
              <p className="text-[10px] text-slate-400 tracking-widest uppercase">
                Guardian System
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeView === item.id
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Status footer */}
        <div className="p-4 border-t border-slate-700/50">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            System Online
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">
          {activeView === 'dashboard' && <DashboardPlaceholder />}
          {activeView === 'ingest' && <PlaceholderView title="Data Ingestion" />}
          {activeView === 'scores' && <PlaceholderView title="AEGIS Score Table" />}
          {activeView === 'graph' && <PlaceholderView title="Fraud Ring Graph" />}
          {activeView === 'squad' && <PlaceholderView title="Squad Interception Panel" />}
          {activeView === 'report' && <PlaceholderView title="Audit Report" />}
        </div>
      </main>
    </div>
  )
}

function DashboardPlaceholder() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-2">Surveillance Dashboard</h2>
      <p className="text-slate-400 text-sm mb-8">
        Real-time overview of AEGIS monitoring activity
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Records Monitored', value: '—', color: 'from-blue-500 to-cyan-500' },
          { label: 'Entities Flagged', value: '—', color: 'from-amber-500 to-orange-500' },
          { label: 'Funds Intercepted', value: '—', color: 'from-red-500 to-pink-500' },
        ].map((stat) => (
          <div key={stat.label} className="glass-panel p-6">
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">{stat.label}</p>
            <p className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="glass-panel p-6">
        <p className="text-slate-400 text-sm text-center py-12">
          Upload payroll and vendor data to begin a surveillance cycle.
        </p>
      </div>
    </div>
  )
}

function PlaceholderView({ title }: { title: string }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>
      <div className="glass-panel p-12 text-center">
        <p className="text-slate-400">Component in progress</p>
      </div>
    </div>
  )
}
