import { useState } from 'react';
import { LayoutDashboard, Settings as SettingsIcon, FolderGit2, Search } from 'lucide-react';
import { useStore } from '../store/useStore';

interface SidebarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

export default function Sidebar({ currentPage, setCurrentPage }: SidebarProps) {
  const currentUser = useStore((state) => state.currentUser);
  const activeInstance = useStore((state) => state.instances.find(i => i.active));

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects', icon: FolderGit2 },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full shrink-0 z-10">
      <div className="p-6 border-b border-slate-800 bg-slate-900/50">
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <FolderGit2 className="w-5 h-5 text-white" />
          </div>
          <span>GitLab <span className="text-slate-500 font-normal">Mgr</span></span>
        </h1>
        {activeInstance && (
          <p className="text-xs text-slate-500 mt-3 truncate font-medium flex items-center gap-2" title={activeInstance.name}>
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            {activeInstance.name}
          </p>
        )}
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentPage(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200 text-sm font-medium ${
              currentPage === item.id
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'
            }`}
          >
            <item.icon className={`w-5 h-5 ${currentPage === item.id ? 'text-indigo-400' : 'text-slate-500'}`} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center justify-between p-2 rounded-lg border border-slate-800 hover:bg-slate-800 transition-colors cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center font-bold text-sm tracking-tighter">
              {currentUser?.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-medium text-slate-200">{currentUser?.name}</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{currentUser?.role}</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
