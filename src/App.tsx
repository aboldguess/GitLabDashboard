import { useState, useEffect } from 'react';
import { useStore } from './store/useStore';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import Projects from './components/Projects';
import Sidebar from './components/Sidebar';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const instances = useStore(state => state.instances);

  useEffect(() => {
    if (instances.length === 0) {
      setCurrentPage('settings');
    }
  }, [instances]);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="flex-1 overflow-auto">
        <div className="h-full p-6 max-w-7xl mx-auto">
          {currentPage === 'dashboard' && <Dashboard />}
          {currentPage === 'projects' && <Projects />}
          {currentPage === 'settings' && <Settings />}
        </div>
      </main>
    </div>
  );
}
