import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export default function Logs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = () => axios.get(`${API_URL}/logs`).then(res => setLogs(res.data));
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000); // Poll logs every 5s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col">
      <h1 className="text-2xl font-bold mb-4 text-slate-800">System Logs</h1>
      <div className="flex-1 bg-slate-900 rounded-lg shadow overflow-hidden overflow-y-auto p-4 font-mono text-sm">
        {logs.map((log, i) => (
          <div key={i} className="mb-1 border-b border-slate-800 pb-1 last:border-0 hover:bg-slate-800">
            <span className="text-slate-500 mr-3">[{log.time}]</span>
            <span className={`font-bold mr-3 ${log.level === 'ERROR' ? 'text-red-400' : 'text-green-400'}`}>{log.level}</span>
            <span className="text-purple-400 mr-3">{log.source}:</span>
            <span className="text-slate-200">{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
