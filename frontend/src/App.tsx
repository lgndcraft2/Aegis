import { useState, useEffect } from 'react';
import { MainLayout } from './components/MainLayout';
import { getLatestCycle } from './api';
import { Dashboard } from './views/Dashboard';
import { DataIngestion } from './views/DataIngestion';
import { Surveillance } from './views/Surveillance';
import { FraudRings } from './views/FraudRings';
import { SquadInterception } from './views/SquadInterception';
import { AuditRuns } from './views/AuditRuns';

type View = 'dashboard' | 'runs' | 'ingest' | 'scores' | 'graph' | 'squad';

export default function App() {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [selectedCycleId, setSelectedCycleId] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const latest = await getLatestCycle();
        if (latest) {
          setSelectedCycleId(latest.cycle_id);
        }
      } catch (e) {
        console.error('Failed to fetch latest cycle', e);
      }
    };
    fetchLatest();
  }, []);

  return (
    <MainLayout activeView={activeView} setActiveView={setActiveView} selectedCycleId={selectedCycleId}>
      {activeView === 'dashboard' && <Dashboard selectedCycleId={selectedCycleId} />}
      {activeView === 'runs' && <AuditRuns onSelectCycle={(id) => { setSelectedCycleId(id); setActiveView('dashboard'); }} />}
      {activeView === 'ingest' && (
        <DataIngestion 
          onCycleStarted={(id) => setSelectedCycleId(id)} 
          onNavigate={(view) => setActiveView(view)} 
        />
      )}
      {activeView === 'scores' && <Surveillance selectedCycleId={selectedCycleId} onNavigate={setActiveView} />}
      {activeView === 'graph' && <FraudRings selectedCycleId={selectedCycleId} />}
      {activeView === 'squad' && <SquadInterception selectedCycleId={selectedCycleId} />}
    </MainLayout>
  );
}
