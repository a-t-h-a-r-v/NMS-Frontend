import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Server, Plus, MapPin, Search, Pause, Play, Trash2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

export default function Dashboard() {
  const [devices, setDevices] = useState([]);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newDevice, setNewDevice] = useState({ hostname: '', ip: '', community: 'public' });

  const fetchDevices = () => {
    axios.get(`${API_URL}/devices?q=${search}`)
         .then(res => setDevices(res.data || []));
  };

  useEffect(() => { 
    const delayDebounce = setTimeout(() => { fetchDevices() }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search]);

  const handleAction = async (action, id) => {
    if (action === 'delete' && !confirm("Are you sure?")) return;
    await axios.post(`${API_URL}/device/action`, { action, id });
    fetchDevices();
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    await axios.post(`${API_URL}/devices`, newDevice);
    setShowAdd(false);
    setNewDevice({ hostname: '', ip: '', community: 'public' });
    fetchDevices();
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Device Dashboard</h1>
        
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1">
            <input 
              type="text" 
              placeholder="Search devices..." 
              className="pl-9 pr-4 py-2 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          </div>
          
          <button onClick={() => setShowAdd(!showAdd)} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700">
            <Plus size={18} /> Add
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8 border border-blue-100">
          <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4 items-end">
            <input className="border p-2 rounded w-full" placeholder="Hostname" value={newDevice.hostname} onChange={e => setNewDevice({...newDevice, hostname: e.target.value})} required />
            <input className="border p-2 rounded w-full" placeholder="IP Address" value={newDevice.ip} onChange={e => setNewDevice({...newDevice, ip: e.target.value})} required />
            <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded">Save</button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {devices.map(d => (
          <div key={d.id} className={`bg-white rounded-xl shadow-sm border transition-all ${d.is_paused ? 'border-yellow-300 bg-yellow-50' : 'border-slate-200 hover:border-blue-300'}`}>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <Link to={`/device/${d.id}`} className="flex items-center gap-4 group">
                  <div className={`p-3 rounded-lg ${d.is_paused ? 'bg-yellow-200' : 'bg-blue-50 group-hover:bg-blue-100'}`}>
                    <Server className={d.is_paused ? 'text-yellow-700' : 'text-blue-600'} size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">{d.hostname}</h3>
                    <p className="text-sm font-mono text-slate-500">{d.ip}</p>
                  </div>
                </Link>
                {d.is_paused && <span className="text-xs font-bold bg-yellow-200 text-yellow-800 px-2 py-1 rounded">PAUSED</span>}
              </div>
              
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <MapPin size={12} /> {d.location || "Unknown"}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleAction(d.is_paused ? 'resume' : 'pause', d.id)} className="p-1.5 text-slate-500 hover:bg-slate-100 rounded" title={d.is_paused ? "Resume" : "Pause"}>
                    {d.is_paused ? <Play size={16} /> : <Pause size={16} />}
                  </button>
                  <button onClick={() => handleAction('delete', d.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded" title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
