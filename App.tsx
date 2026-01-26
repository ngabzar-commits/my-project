
import React, { useState, useEffect, useCallback } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { LogEntry, SystemStats, MessageAnalysis } from './types';
import { analyzeLogEntry } from './services/geminiService';

// --- Sub-components (Helper Components) ---

const StatCard: React.FC<{ title: string; value: string | number; icon: string; color: string }> = ({ 
  title, value, icon, color 
}) => (
  <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl shadow-lg">
    <div className="flex items-center justify-between mb-2">
      <span className="text-slate-400 text-sm font-medium">{title}</span>
      <i className={`${icon} ${color} text-xl`}></i>
    </div>
    <div className="text-2xl font-bold text-white">{value}</div>
  </div>
);

const SidebarItem: React.FC<{ icon: string; label: string; active?: boolean; onClick: () => void }> = ({ 
  icon, label, active, onClick 
}) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
      active ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`}
  >
    <i className={`${icon} text-lg`}></i>
    <span className="font-medium">{label}</span>
  </button>
);

// --- Main App Component ---

const App: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<SystemStats>({
    totalRequests: 0,
    avgLatency: 0,
    successRate: 0,
    activeConnections: 12
  });
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [analysis, setAnalysis] = useState<MessageAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [view, setView] = useState<'dashboard' | 'logs' | 'settings'>('dashboard');

  // Simulation of incoming traffic
  useEffect(() => {
    const interval = setInterval(() => {
      const newLog: LogEntry = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toLocaleTimeString(),
        method: 'POST',
        endpoint: '/data/handleMsg.do',
        status: Math.random() > 0.05 ? 200 : 500,
        payload: { userId: Math.floor(Math.random() * 100000), msgType: Math.floor(Math.random() * 5) },
        response: { success: true, timestamp: Date.now() },
        latency: Math.floor(Math.random() * 150) + 20
      };

      setLogs(prev => [newLog, ...prev].slice(0, 50));
      setStats(prev => ({
        totalRequests: prev.totalRequests + 1,
        avgLatency: Math.floor((prev.avgLatency * prev.totalRequests + newLog.latency) / (prev.totalRequests + 1)),
        successRate: Math.round(((prev.totalRequests * (prev.successRate / 100) + (newLog.status === 200 ? 1 : 0)) / (prev.totalRequests + 1)) * 100),
        activeConnections: prev.activeConnections + (Math.random() > 0.5 ? 1 : -1)
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleAnalyze = async (log: LogEntry) => {
    setIsAnalyzing(true);
    setAnalysis(null);
    setSelectedLog(log);
    const result = await analyzeLogEntry(log);
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-200">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col p-4">
        <div className="flex items-center space-x-3 mb-10 px-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <i className="fa-solid fa-server text-white text-xl"></i>
          </div>
          <div>
            <h1 className="text-white font-bold leading-tight">Higgs Admin</h1>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Control Panel</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarItem 
            icon="fa-solid fa-chart-line" 
            label="Overview" 
            active={view === 'dashboard'} 
            onClick={() => setView('dashboard')} 
          />
          <SidebarItem 
            icon="fa-solid fa-list-ul" 
            label="Traffic Logs" 
            active={view === 'logs'} 
            onClick={() => setView('logs')} 
          />
          <SidebarItem 
            icon="fa-solid fa-gear" 
            label="Config" 
            active={view === 'settings'} 
            onClick={() => setView('settings')} 
          />
        </nav>

        <div className="mt-auto p-4 bg-slate-800/50 rounded-xl border border-slate-700">
          <div className="text-xs text-slate-400 mb-1">Target Endpoint</div>
          <div className="text-sm font-mono truncate text-indigo-400">/data/handleMsg.do</div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-900/50">
          <h2 className="text-lg font-semibold text-white">
            {view === 'dashboard' ? 'Real-time Metrics' : view === 'logs' ? 'Endpoint Traffic' : 'System Settings'}
          </h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-xs font-bold text-emerald-500 uppercase">Live Connection</span>
            </div>
            <button className="text-slate-400 hover:text-white transition-colors">
              <i className="fa-solid fa-bell"></i>
            </button>
          </div>
        </header>

        {/* Scrollable View Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {view === 'dashboard' && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Requests" value={stats.totalRequests.toLocaleString()} icon="fa-solid fa-bolt" color="text-yellow-400" />
                <StatCard title="Avg Latency" value={`${stats.avgLatency}ms`} icon="fa-solid fa-clock" color="text-blue-400" />
                <StatCard title="Success Rate" value={`${stats.successRate}%`} icon="fa-solid fa-circle-check" color="text-emerald-400" />
                <StatCard title="Active Streams" value={stats.activeConnections} icon="fa-solid fa-users" color="text-purple-400" />
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
                  <h3 className="text-white font-semibold mb-6">Traffic Distribution (Last 50 Events)</h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={logs.slice().reverse()}>
                        <defs>
                          <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="timestamp" stroke="#94a3b8" fontSize={10} />
                        <YAxis stroke="#94a3b8" fontSize={10} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                        />
                        <Area type="monotone" dataKey="latency" stroke="#6366f1" fillOpacity={1} fill="url(#colorLatency)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col">
                  <h3 className="text-white font-semibold mb-4">Recent Exceptions</h3>
                  <div className="flex-1 space-y-4">
                    {logs.filter(l => l.status !== 200).length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-3">
                        <i className="fa-solid fa-shield-heart text-4xl text-emerald-500/20"></i>
                        <p className="text-sm">No critical errors detected</p>
                      </div>
                    ) : (
                      logs.filter(l => l.status !== 200).slice(0, 5).map(l => (
                        <div key={l.id} className="p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-xs font-bold text-red-400">HTTP {l.status}</span>
                            <span className="text-[10px] text-slate-500">{l.timestamp}</span>
                          </div>
                          <div className="text-xs font-mono text-slate-300 truncate">/data/handleMsg.do</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {view === 'logs' && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 h-full">
              {/* Log List */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-[700px]">
                <div className="p-4 border-b border-slate-800 bg-slate-800/20 flex justify-between items-center">
                  <h3 className="text-white font-semibold">Live Traffic Stream</h3>
                  <span className="text-xs text-slate-500 font-mono">Filter: POST handleMsg.do</span>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="sticky top-0 bg-slate-900 border-b border-slate-800 text-slate-500 font-medium">
                      <tr>
                        <th className="px-4 py-3">Time</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Latency</th>
                        <th className="px-4 py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {logs.map((log) => (
                        <tr key={log.id} className={`hover:bg-slate-800/50 transition-colors ${selectedLog?.id === log.id ? 'bg-indigo-600/10' : ''}`}>
                          <td className="px-4 py-3 font-mono text-xs">{log.timestamp}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              log.status === 200 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                            }`}>
                              {log.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-400 font-mono text-xs">{log.latency}ms</td>
                          <td className="px-4 py-3">
                            <button 
                              onClick={() => handleAnalyze(log)}
                              className="text-indigo-400 hover:text-indigo-300 text-xs font-bold"
                            >
                              Analyze
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Analysis Sidebar */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col overflow-hidden h-[700px]">
                {selectedLog ? (
                  <>
                    <div className="p-6 border-b border-slate-800">
                      <h3 className="text-white font-bold mb-1">Packet Inspector</h3>
                      <p className="text-xs text-slate-500">ID: {selectedLog.id}</p>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                      {/* Payload Visualization */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Payload Data</h4>
                        <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-indigo-300 code-font overflow-x-auto">
                          {JSON.stringify(selectedLog.payload, null, 2)}
                        </pre>
                      </div>

                      {/* AI Analysis Section */}
                      <div className="bg-indigo-600/5 border border-indigo-600/20 rounded-xl p-5 relative">
                        <div className="flex items-center space-x-2 mb-4">
                          <i className="fa-solid fa-wand-magic-sparkles text-indigo-400"></i>
                          <h4 className="text-sm font-bold text-white">Gemini AI Analysis</h4>
                        </div>

                        {isAnalyzing ? (
                          <div className="flex items-center space-x-3 text-indigo-400">
                            <i className="fa-solid fa-circle-notch animate-spin"></i>
                            <span className="text-sm animate-pulse">Scanning packet contents...</span>
                          </div>
                        ) : analysis ? (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-400">Risk Assessment</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                analysis.riskLevel === 'Low' ? 'bg-emerald-500/20 text-emerald-400' :
                                analysis.riskLevel === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-red-500/20 text-red-400'
                              }`}>
                                {analysis.riskLevel}
                              </span>
                            </div>
                            <p className="text-sm text-slate-300 leading-relaxed">
                              {analysis.summary}
                            </p>
                            <div className="space-y-2">
                              <h5 className="text-[10px] font-bold text-slate-500 uppercase">Recommendations</h5>
                              <ul className="space-y-1">
                                {analysis.recommendations.map((rec, i) => (
                                  <li key={i} className="text-xs text-indigo-300 flex items-start space-x-2">
                                    <span className="mt-1 w-1 h-1 rounded-full bg-indigo-500 shrink-0"></span>
                                    <span>{rec}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500 italic">Select a log and click 'Analyze' to begin AI inspection.</p>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4">
                    <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center">
                      <i className="fa-solid fa-microscope text-3xl text-slate-600"></i>
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">No Log Selected</h3>
                      <p className="text-slate-500 text-sm max-w-[250px] mx-auto">
                        Click analyze on any traffic entry to inspect its contents and get AI-powered insights.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {view === 'settings' && (
            <div className="max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-8">
              <section className="space-y-4">
                <h3 className="text-lg font-bold text-white">Target Configuration</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Endpoint Path</label>
                    <input 
                      type="text" 
                      defaultValue="/data/handleMsg.do"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-indigo-400 font-mono text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Protocol</label>
                      <select className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-slate-300 text-sm focus:outline-none focus:border-indigo-500">
                        <option>HTTPS</option>
                        <option>HTTP</option>
                        <option>WSS</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Port</label>
                      <input 
                        type="number" 
                        defaultValue="443"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-slate-300 text-sm focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-4 pt-8 border-t border-slate-800">
                <h3 className="text-lg font-bold text-white">Analysis Presets</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
                    <div>
                      <div className="text-sm font-bold text-white">Anomalous Detection</div>
                      <p className="text-xs text-slate-500">Automatically flag packets with unusual msgType signatures.</p>
                    </div>
                    <div className="w-12 h-6 bg-indigo-600 rounded-full relative p-1 cursor-pointer">
                      <div className="w-4 h-4 bg-white rounded-full ml-auto"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
                    <div>
                      <div className="text-sm font-bold text-white">Latency Thresholds</div>
                      <p className="text-xs text-slate-500">Alert if endpoint response exceeds 200ms.</p>
                    </div>
                    <div className="w-12 h-6 bg-slate-700 rounded-full relative p-1 cursor-pointer">
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>
              </section>

              <div className="pt-4 flex justify-end">
                <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-bold text-sm transition-colors shadow-lg shadow-indigo-600/20">
                  Save Changes
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
