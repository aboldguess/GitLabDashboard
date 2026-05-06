import React from 'react';
import { HelpCircle, Key, Server, Settings, ExternalLink, ShieldAlert, Cpu } from 'lucide-react';

export default function Help() {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-indigo-400" />
            Help <span className="text-slate-500 font-normal">& Configuration</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Instructions on connecting to your GitLab v18 installation on Raspberry Pi.</p>
        </div>
      </div>

      <div className="flex-1 overflow-auto grid gap-4 grid-cols-1 md:grid-cols-2">
        {/* Step 1 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 shrink-0">
              <span className="font-bold">1</span>
            </div>
            <h2 className="text-lg font-bold text-white">Network Prerequisites</h2>
          </div>
          <div className="text-sm text-slate-400 space-y-4 leading-relaxed flex-1">
            <p>Ensure your Raspberry Pi 5 is powered on and connected to your local network. The dashboard assumes your Pi is reachable by default at:</p>
            <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 font-mono text-indigo-300 flex items-center gap-2">
              <Server className="w-4 h-4 shrink-0" />
              http://gitlab.local
            </div>
            <p>If you have configured a custom IP address (e.g., <code className="text-slate-300">192.168.1.100</code>), you will need to replace the default URL in the Settings tab.</p>
            
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mt-4">
              <h3 className="text-emerald-400 font-bold text-xs uppercase tracking-widest flex items-center gap-2 mb-2">
                <Cpu className="w-4 h-4" /> Hardware Target
              </h3>
              <p className="text-xs text-emerald-500/80">These defaults are tuned for GitLab v18 running natively or via Docker on a Raspberry Pi 5 (8GB model recommended).</p>
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 shrink-0">
              <span className="font-bold">2</span>
            </div>
            <h2 className="text-lg font-bold text-white">Generate an API Token</h2>
          </div>
          <div className="text-sm text-slate-400 space-y-4 leading-relaxed flex-1">
            <p>To access your projects, issues, and statistics, the dashboard requires a <strong>Personal Access Token</strong>.</p>
            <ol className="list-decimal pl-5 space-y-2 marker:text-slate-600">
              <li>Log in to your local GitLab instance.</li>
              <li>Navigate to your User Settings &gt; Access Tokens (eg http://gitlab.local/-/user_settings/personal_access_tokens).</li>
              <li>Click "Add new token".</li>
              <li>Give it a descriptive name (e.g., <code className="text-slate-300">Dashboard Token</code>).</li>
              <li>Set an expiration date (or leave it blank).</li>
              <li>Select the <code className="text-indigo-400 font-bold bg-indigo-500/10 px-1 py-0.5 rounded">api</code> or <code className="text-indigo-400 font-bold bg-indigo-500/10 px-1 py-0.5 rounded">read_api</code> scope. CONLSULT ADAM ABOUT ACCESS LEVELS.</li>
              <li>Click Create and copy the generated token immediately.</li>
            </ol>
            
            <a 
              href="http://gitlab.local/-/profile/personal_access_tokens" 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors text-xs font-medium w-max mt-4"
            >
              Open Token Settings <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 shrink-0">
              <span className="font-bold">3</span>
            </div>
            <h2 className="text-lg font-bold text-white">Configure Dashboard</h2>
          </div>
          <div className="text-sm text-slate-400 space-y-4 leading-relaxed flex-1">
            <p>Once you have the token:</p>
            <ol className="list-decimal pl-5 space-y-2 marker:text-slate-600">
              <li>Navigate to the <span className="font-bold text-slate-300">Settings</span> tab in the sidebar.</li>
              <li>Enter a memorable Alias (e.g., <code className="text-slate-300">Raspberry Pi 5 GitLab</code>).</li>
              <li>In the URL field, stick with the default <code className="text-slate-300">http://gitlab.local</code> or replace it with your Pi's IP address.</li>
              <li>Paste the Personal Access Token in the token field.</li>
              <li>Click <strong>Add Instance</strong>.</li>
            </ol>
            <p className="mt-4 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 italic text-xs">
              Note: Token strings typically start with <code>glpat-</code>
            </p>
          </div>
        </div>

        {/* Version Notice */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20 shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-white">Version Compatibility</h2>
          </div>
          <div className="text-sm text-slate-400 space-y-4 leading-relaxed flex-1">
            <p>This integration is optimized for the latest features arriving in <strong>GitLab v18</strong>. If you are using a legacy version (e.g. v17):</p>
            
            <ul className="space-y-3">
              <li className="flex gap-2">
                <span className="text-amber-500 shrink-0">•</span>
                <span><strong>Time Tracking / Estimated Time:</strong> Advanced GraphQL endpoints for real-time ticket estimation stats will fall back to legacy `time_stats`.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-500 shrink-0">•</span>
                <span><strong>Deep Multi-Sort:</strong> V18 features high-performance native sorting across all fields. Older versions will use local client-side sorting instead.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-500 shrink-0">•</span>
                <span><strong>Quick Edit Actions:</strong> "State_event" transitions (Close/Reopen) are supported on older versions, but parallel updates might fail gracefully.</span>
              </li>
            </ul>
            
            <p className="text-xs border-t border-slate-800 pt-4 mt-auto">
              A warning banner will automatically appear at the top of the dashboard if a pre-v18 instance is detected.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
