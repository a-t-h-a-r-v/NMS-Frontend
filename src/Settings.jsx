import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

export default function Settings() {
  const [settings, setSettings] = useState({ poll_interval: 60, snmp_timeout: 2000, retention_days: 30 });
  const [msg, setMsg] = useState("");

  useEffect(() => {
    axios.get(`${API_URL}/settings`).then(res => {
        if(res.data) setSettings(res.data);
    });
  }, []);

  const handleSave = async () => {
    await axios.post(`${API_URL}/settings`, settings);
    setMsg("Settings saved! Restarting poller cycle...");
    setTimeout(() => setMsg(""), 3000);
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6 text-slate-800">Configuration</h1>
      <div className="bg-white p-6 rounded-lg shadow border border-slate-200 space-y-6">
        <div>
          <h3 className="font-semibold text-lg mb-4 border-b pb-2">Polling Engine</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Poll Interval (seconds)</label>
              <input type="number" className="border rounded p-2 w-full" 
                value={settings.poll_interval} 
                onChange={e => setSettings({...settings, poll_interval: e.target.value})} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">SNMP Timeout (ms)</label>
              <input type="number" className="border rounded p-2 w-full" 
                value={settings.snmp_timeout} 
                onChange={e => setSettings({...settings, snmp_timeout: e.target.value})} 
              />
            </div>
          </div>
        </div>
        
        <div>
            <h3 className="font-semibold text-lg mb-4 border-b pb-2">Data Retention</h3>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Keep Data For (Days)</label>
              <input type="number" className="border rounded p-2 w-full" 
                value={settings.retention_days} 
                onChange={e => setSettings({...settings, retention_days: e.target.value})} 
              />
            </div>
        </div>

        <div className="flex items-center justify-between pt-4">
          <button onClick={handleSave} className="bg-blue-600 text-white px-6 py-2 rounded font-medium hover:bg-blue-700 flex items-center gap-2">
            <Save size={18} /> Save Changes
          </button>
          {msg && <span className="text-green-600 font-medium animate-pulse">{msg}</span>}
        </div>
      </div>
    </div>
  );
}
