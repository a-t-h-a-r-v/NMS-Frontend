import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Server, Plus, MapPin, Search, Pause, Play, Trash2, Radar, Pencil, AlertTriangle, Lock, Wifi, WifiOff, HelpCircle } from 'lucide-react';
import { getSession } from './utils/auth';

const API_URL = import.meta.env.VITE_API_URL;

export default function Dashboard() {
  const [devices, setDevices] = useState([]);
  const [search, setSearch] = useState("");
  const { user } = getSession();
  const isAdmin = user?.role === 'admin';
  
  // Modals
  const [showModal, setShowModal] = useState(false);
  const [showScan, setShowScan] = useState(false);
  const [conflictData, setConflictData] = useState(null);

  // Data States
  const [formData, setFormData] = useState({ id: null, hostname: '', ip: '', community: 'public' });
  const [scanCidr, setScanCidr] = useState("192.168.1.0/24");
  const [scanResults, setScanResults] = useState([]);
  const [isScanning, setIsScanning] = useState(false);

  const fetchDevices = () => {
    axios.get(`${API_URL}/devices?q=${search}`).then(res => setDevices(res.data || []));
  };
  
  useEffect(() => { 
    const t = setTimeout(fetchDevices, 300);
    return () => clearTimeout(t);
  }, [search]);

  const handleAction = async (action, id) => {
      if (action === 'delete' && !confirm("Delete this device?")) return;
      try {
        await axios.post(`${API_URL}/device/action`, { action, id });
        fetchDevices();
      } catch (err) {
        alert("Action failed: Permission denied");
      }
  };

  const openCreate = () => {
    setFormData({ id: null, hostname: '', ip: '', community: 'public' });
    setShowModal(true);
  };

  const openEdit = (device) => {
    if (!device.can_write) return;
    setFormData({ id: device.id, hostname: device.hostname, ip: device.ip, community: device.community || 'public' });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (formData.id) await axios.put(`${API_URL}/devices`, formData);
      else await axios.post(`${API_URL}/devices`, formData);
      setShowModal(false);
      fetchDevices();
    } catch (err) {
      if (err.response && err.response.status === 409) setConflictData(err.response.data);
      else alert("Error: " + (err.response?.data || err.message));
    }
  };

  // Conflict Resolution
  const handleOverwrite = async () => {
    try {
      await axios.post(`${API_URL}/devices`, { ...formData, force: true });
      setConflictData(null);
      setShowModal(false);
      fetchDevices();
    } catch (err) {
      alert("Overwrite failed: " + err.message);
    }
  };

  const runScan = async () => {
    setIsScanning(true);
    setScanResults([]);
    try {
        const res = await axios.post(`${API_URL}/scan`, { cidr: scanCidr });
        setScanResults(res.data);
    } catch(err) {
        alert("Scan failed. Ensure you are an admin.");
    } finally {
        setIsScanning(false);
    }
  };

  const addDiscovered = async (host) => {
    try {
      await axios.post(`${API_URL}/devices`, { hostname: host.hostname, ip: host.ip, community: 'public' });
      fetchDevices();
      setScanResults(scanResults.filter(r => r.ip !== host.ip));
    } catch (err) {
      if (err.response && err.response.status === 409) {
         setFormData({ id: null, hostname: host.hostname, ip: host.ip, community: 'public' });
         setConflictData(err.response.data);
      }
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Device Dashboard</h1>
        <div className="flex gap-3 w-full md:w-auto">
            <input className="pl-9 pr-4 py-2 border rounded-lg w-full" placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)} />
            {isAdmin && (
                <>
                    <button onClick={() => setShowScan(!showScan)} className="bg-indigo-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-indigo-700">
                        <Radar size={18}/> Scan
                    </button>
                    <button onClick={openCreate} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700">
                        <Plus size={18}/> Add
                    </button>
                </>
            )}
        </div>
      </div>

      {showScan && isAdmin && (
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8 border border-indigo-100">
            <h3 className="font-semibold mb-4 text-lg border-b pb-2 flex items-center gap-2 text-indigo-800">
                <Radar size={20} /> Network Discovery
            </h3>
            <div className="flex gap-4 mb-4">
                <input className="border p-2 rounded flex-1 font-mono" value={scanCidr} onChange={e => setScanCidr(e.target.value)} />
                <button onClick={runScan} disabled={isScanning} className="bg-indigo-600 text-white px-6 py-2 rounded disabled:opacity-50">
                    {isScanning ? "Scanning..." : "Start Scan"}
                </button>
            </div>
            {scanResults.length > 0 && (
                <div className="bg-slate-50 rounded border p-4">
                    <ul className="space-y-2">
                        {scanResults.map((r, i) => (
                            <li key={i} className="flex justify-between items-center bg-white p-2 rounded shadow-sm">
                                <div><span className="font-bold block">{r.ip}</span><span className="text-xs text-slate-500">{r.hostname}</span></div>
                                <button onClick={() => addDiscovered(r)} className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded font-bold hover:bg-green-200">ADD</button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {devices.map(d => {
          const isDown = d.status === 'down';
          const isUnknown = d.status === 'unknown' || !d.status;
          
          let cardClass = 'border-slate-200 bg-white hover:border-blue-300';
          let statusColor = 'text-green-600';
          let StatusIcon = Wifi;
          let statusText = 'ONLINE';

          if (isDown) {
            cardClass = 'border-red-300 bg-red-50';
            statusColor = 'text-red-600';
            StatusIcon = WifiOff;
            statusText = 'OFFLINE';
          } else if (isUnknown) {
            cardClass = 'border-slate-200 bg-slate-50';
            statusColor = 'text-slate-500';
            StatusIcon = HelpCircle;
            statusText = 'UNKNOWN';
          } else if (d.is_paused) {
            // Paused but technically "Up" or not polling
            cardClass = 'border-yellow-300 bg-yellow-50';
            statusColor = 'text-yellow-700';
            StatusIcon = Pause;
            statusText = 'PAUSED';
          }

          return (
            <div key={d.id} className={`rounded-xl shadow-sm border p-6 transition-all ${cardClass}`}>
               <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col">
                    <Link to={`/device/${d.id}`} className="font-bold text-lg text-slate-800 block hover:text-blue-600 truncate max-w-[180px]" title={d.hostname}>
                        {d.hostname}
                    </Link>
                    <div className={`flex items-center gap-1 text-xs font-bold mt-1 ${statusColor}`}>
                        <StatusIcon size={12} />
                        {statusText}
                    </div>
                  </div>
                  {/* Badge for specific states if needed, or keep clean */}
                  {d.is_paused && !isDown && <span className="text-xs font-bold bg-yellow-200 text-yellow-800 px-2 py-1 rounded">PAUSED</span>}
               </div>
               
               <p className="text-sm font-mono text-slate-500 mb-4 bg-slate-100/50 p-1 rounded w-fit px-2">{d.ip}</p>
               
               <div className="flex gap-2 border-t border-slate-200/60 pt-4 mt-auto">
                  {d.can_write ? (
                      <>
                          <button onClick={() => openEdit(d)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title="Edit"><Pencil size={18}/></button>
                          <button onClick={() => handleAction(d.is_paused?'resume':'pause', d.id)} className={`p-2 rounded-lg transition-colors ${d.is_paused ? 'text-green-600 hover:bg-green-100' : 'text-orange-500 hover:bg-orange-100'}`} title={d.is_paused?"Resume":"Pause"}>
                              {d.is_paused ? <Play size={18}/> : <Pause size={18}/>}
                          </button>
                          <button onClick={() => handleAction('delete', d.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors" title="Delete"><Trash2 size={18}/></button>
                      </>
                  ) : (
                      <span className="text-xs text-slate-400 flex items-center gap-1 py-2"><Lock size={14}/> Read Only</span>
                  )}
               </div>
            </div>
          );
        })}
      </div>

      {/* CONFLICT MODAL */}
      {conflictData && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md animate-in zoom-in-95 border-l-4 border-yellow-500">
            <div className="flex items-start gap-4">
              <div className="bg-yellow-100 p-3 rounded-full text-yellow-600"><AlertTriangle size={24} /></div>
              <div>
                <h3 className="font-bold text-lg text-slate-800">Duplicate IP Detected</h3>
                <p className="text-slate-600 mt-2 text-sm">IP <span className="font-mono font-bold bg-slate-100 px-1">{formData.ip}</span> exists.</p>
                <div className="bg-slate-50 p-3 rounded mt-3 text-sm">
                  <p><strong>Existing:</strong> {conflictData.existing_hostname}</p>
                  <p><strong>New:</strong> {formData.hostname}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-6 mt-2">
              <button onClick={() => setConflictData(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">Cancel</button>
              <button onClick={handleOverwrite} className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">Overwrite</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD/EDIT MODAL */}
      {showModal && !conflictData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="font-bold text-xl mb-4 text-slate-800">{formData.id ? 'Edit Device' : 'Add New Device'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Hostname</label>
                  <input className="border border-slate-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Core-Switch-01" value={formData.hostname} onChange={e => setFormData({...formData, hostname: e.target.value})} required />
              </div>
              <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">IP Address</label>
                  <input className="border border-slate-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. 192.168.1.1" value={formData.ip} onChange={e => setFormData({...formData, ip: e.target.value})} required />
              </div>
              <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">SNMP Community</label>
                  <input className="border border-slate-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-500 outline-none" placeholder="public" value={formData.community} onChange={e => setFormData({...formData, community: e.target.value})} />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">Cancel</button>
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 shadow-sm">Save Device</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
