import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Server, Plus, MapPin, RefreshCw } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

export default function Dashboard() {
  const [devices, setDevices] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Use lowercase keys to match JSON standard
  const [newDevice, setNewDevice] = useState({ hostname: '', ip: '', community: 'public' });

  const fetchDevices = () => {
    setLoading(true);
    axios.get(`${API_URL}/devices`)
      .then(res => setDevices(res.data || []))
      .catch(err => console.error("Fetch error:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDevices(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault(); // Stop page reload
    
    // Basic validation
    if(!newDevice.hostname || !newDevice.ip) {
      alert("Hostname and IP are required");
      return;
    }

    try {
      await axios.post(`${API_URL}/devices`, newDevice);
      // Success! Reset form and refresh list
      setShowAdd(false);
      setNewDevice({ hostname: '', ip: '', community: 'public' });
      fetchDevices(); 
    } catch (err) {
      console.error(err);
      alert("Failed to save device. Check console for details.");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Network Dashboard</h1>
          <p className="text-slate-500">Overview of all monitored assets</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchDevices} className="p-2 text-slate-600 hover:bg-white rounded border border-transparent hover:border-slate-300 transition">
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={() => setShowAdd(!showAdd)} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow-sm flex items-center gap-2 transition"
          >
            <Plus size={18} /> Add Device
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8 border border-blue-100 animate-in fade-in slide-in-from-top-4">
          <h3 className="font-semibold mb-4 text-lg border-b pb-2">New Device Configuration</h3>
          <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Hostname</label>
              <input 
                className="border border-slate-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-500 outline-none" 
                placeholder="e.g. Core-Router-01"
                value={newDevice.hostname} 
                onChange={e => setNewDevice({...newDevice, hostname: e.target.value})} 
              />
            </div>
            <div className="flex-1 w-full">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">IP Address</label>
              <input 
                className="border border-slate-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-500 outline-none" 
                placeholder="e.g. 192.168.1.1"
                value={newDevice.ip} 
                onChange={e => setNewDevice({...newDevice, ip: e.target.value})} 
              />
            </div>
            <div className="w-full md:w-48">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Community</label>
              <input 
                className="border border-slate-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-500 outline-none" 
                placeholder="public"
                value={newDevice.community} 
                onChange={e => setNewDevice({...newDevice, community: e.target.value})} 
              />
            </div>
            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-medium shadow-sm w-full md:w-auto">
              Save Device
            </button>
          </form>
        </div>
      )}

      {devices.length === 0 && !loading && (
        <div className="text-center py-20 text-slate-400">
          <Server size={48} className="mx-auto mb-4 opacity-50" />
          <p>No devices found. Add your first device to start monitoring.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {devices.map(d => (
          <Link to={`/device/${d.id}`} key={d.id} className="block group">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-lg hover:border-blue-300 transition-all duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg group-hover:bg-blue-100 transition-colors">
                    <Server className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-800 group-hover:text-blue-700">{d.hostname}</h3>
                    <p className="text-sm font-mono text-slate-500">{d.ip}</p>
                  </div>
                </div>
                <div className="h-3 w-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
              </div>
              
              <div className="border-t border-slate-100 pt-4 mt-2">
                 <p className="text-sm text-slate-600 line-clamp-2 mb-2 min-h-[2.5rem]">
                   {d.description || <span className="italic text-slate-400">Waiting for SNMP poll...</span>}
                 </p>
                 <div className="flex items-center gap-1 text-xs text-slate-400 font-medium uppercase tracking-wide">
                  <MapPin size={12} /> {d.location || "Unknown"}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
