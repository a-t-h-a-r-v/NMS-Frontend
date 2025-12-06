import { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertCircle, AlertTriangle, CheckCircle, Server } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    axios.get(`${API_URL}/alerts`).then(res => setAlerts(res.data));
  }, []);

  const styles = {
    critical: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: AlertCircle },
    warning: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', icon: AlertTriangle },
    info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: CheckCircle },
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-slate-800">System Alerts</h1>
      <div className="space-y-4">
        {alerts.map(a => {
          const s = styles[a.severity] || styles.info;
          const Icon = s.icon;
          return (
            <div key={a.id} className={`p-4 rounded-lg border ${s.bg} ${s.border} flex items-start gap-4 shadow-sm`}>
              <Icon className={`mt-1 ${s.text}`} size={20} />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className={`font-bold ${s.text} uppercase text-xs tracking-wider mb-1`}>{a.severity}</h3>
                  <span className="text-xs text-slate-500">{a.time}</span>
                </div>
                <p className="text-slate-800 font-medium">{a.message}</p>
                <div className="flex items-center gap-2 mt-2 text-sm text-slate-500">
                  <Server size={14} /> {a.hostname}
                </div>
              </div>
            </div>
          );
        })}
        {alerts.length === 0 && <div className="text-center p-10 text-slate-500">No active alerts.</div>}
      </div>
    </div>
  );
}
