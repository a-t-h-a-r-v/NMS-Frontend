import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts';
import { HardDrive, Cpu, Network, ArrowLeft } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

export default function DeviceDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = () => {
        axios.get(`${API_URL}/device/detail?id=${id}`)
             .then(res => setData(res.data))
             .catch(err => console.error(err));
    };
    fetchData(); // Initial fetch
    const interval = setInterval(fetchData, 60000); // Poll frontend every 60s
    return () => clearInterval(interval);
  }, [id]);

  if (!data) return <div className="p-10 text-center">Loading metrics...</div>;

  return (
    <div>
      <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-4">
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>
      
      <h1 className="text-3xl font-bold mb-6">Device Metrics</h1>

      {/* Row 1: Health Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* CPU Load Chart */}
        <div className="bg-white p-4 rounded shadow border border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <Cpu className="text-blue-500" />
            <h2 className="font-semibold">CPU Load History (1/5 min)</h2>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.history}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="load1" stroke="#2563eb" strokeWidth={2} dot={false} name="Load 1m" />
                <Line type="monotone" dataKey="load5" stroke="#9333ea" strokeWidth={2} dot={false} name="Load 5m" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Storage Usage Bar Chart */}
        <div className="bg-white p-4 rounded shadow border border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <HardDrive className="text-green-500" />
            <h2 className="font-semibold">Storage Usage (GB)</h2>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.storage} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                <Tooltip />
                <Bar dataKey="used_gb" stackId="a" fill="#ef4444" name="Used" />
                <Bar dataKey="size_gb" stackId="a" fill="#e5e7eb" name="Total" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Interfaces Table */}
      <div className="bg-white p-4 rounded shadow border border-slate-200">
        <div className="flex items-center gap-2 mb-4">
          <Network className="text-orange-500" />
          <h2 className="font-semibold">Interface Statistics (Latest Snapshot)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-sm uppercase border-b">
                <th className="p-3">Interface</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">In (Bytes)</th>
                <th className="p-3 text-right">Out (Bytes)</th>
              </tr>
            </thead>
            <tbody>
              {data.interfaces.map((iface, i) => (
                <tr key={i} className="border-b hover:bg-slate-50">
                  <td className="p-3 font-medium">
                    {iface.name} <span className="text-slate-400 text-xs ml-2">{iface.alias}</span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${iface.status === 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {iface.status === 1 ? 'UP' : 'DOWN'}
                    </span>
                  </td>
                  <td className="p-3 text-right font-mono text-slate-600">{iface.in_bytes.toLocaleString()}</td>
                  <td className="p-3 text-right font-mono text-slate-600">{iface.out_bytes.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
