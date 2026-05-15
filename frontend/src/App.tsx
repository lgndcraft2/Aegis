import { useState } from 'react';
import { MainLayout } from './components/MainLayout';
import { Dashboard } from './views/Dashboard';
import { DataIngestion } from './views/DataIngestion';
import { Surveillance } from './views/Surveillance';
import { FraudRings } from './views/FraudRings';
import { SquadInterception } from './views/SquadInterception';

type View = 'dashboard' | 'ingest' | 'scores' | 'graph' | 'squad';

export default function App() {
  const [activeView, setActiveView] = useState<View>('dashboard');

  return (
    <MainLayout activeView={activeView} setActiveView={setActiveView}>
      {activeView === 'dashboard' && <Dashboard />}
      {activeView === 'ingest' && <DataIngestion />}
      {activeView === 'scores' && <Surveillance />}
      {activeView === 'graph' && <FraudRings />}
      {activeView === 'squad' && <SquadInterception />}
    </MainLayout>
  );
}
