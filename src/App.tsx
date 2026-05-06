import React, { useState, useEffect } from 'react';
import { useStore } from './store/useStore';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import Projects from './components/Projects';
import Sidebar from './components/Sidebar';
import Help from './components/Help';
import { fetchVersion } from './services/gitlab';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const instances = useStore(state => state.instances);
  const getGitlabClient = useStore(state => state.getGitlabClient);
  
  const [versionWarning, setVersionWarning] = useState<string | null>(null);

  useEffect(() => {
    if (instances.length === 0) {
      setCurrentPage('settings');
    }
  }, [instances]);

  useEffect(() => {
    const client = getGitlabClient();
    if (!client) {
      setVersionWarning(null);
      return;
    }
    
    fetchVersion()
      .then(data => {
        const major = parseInt(data.version.split('.')[0], 10);
        if (major < 18) {
          setVersionWarning(`GitLab v${data.version} detected. Expected v18+. Some functionality (like advanced time tracking and certain webhooks) will not work and has been gracefully disabled.`);
        } else {
          setVersionWarning(null);
        }
      })
      .catch(err => {
        setVersionWarning('Unable to verify GitLab version. Standard features will work, but v18+ exclusive functionality may fail.');
      });
  }, [getGitlabClient, instances]);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="flex-1 overflow-auto flex flex-col">
        {versionWarning && (
          <div className="mx-6 mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-3 shrink-0">
            <span className="text-amber-500 text-xl shrink-0">⚠️</span>
            <span className="text-amber-400 text-sm font-medium">{versionWarning}</span>
          </div>
        )}
        <div className="h-full p-6 max-w-7xl mx-auto w-full">
          {currentPage === 'dashboard' && <Dashboard />}
          {currentPage === 'projects' && <Projects />}
          {currentPage === 'settings' && <Settings />}
          {currentPage === 'help' && <Help />}
        </div>
      </main>
    </div>
  );
}
