import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { ArrowLeft, Server, Activity, Disc, Network, Cpu, Clock, MapPin, User, AlertTriangle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function DeviceDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetch = () => axios.get(`${API_URL}/device/detail?id=${id}`).then(res => setData(res.data));
    fetch();
    const interval = setInterval(fetch, 30000);
    return () => clearInterval(interval);
  }, [id]);

  if (!data) return <div className="p-20 text-center text-slate-500 animate-pulse">Loading detailed telemetry...</div>;

  const { sys_info, history_health, history_net, protocols, interfaces, storage } = data;

  // Formatting helpers
  const fmtBytes = (bytes) => (bytes / 1024 / 1024 / 1024).toFixed(1) + ' GB';
  const fmtUptime = (sec) => {
    const d = Math.floor(sec / 86400);
    const h = Math.floor((sec % 86400) / 3600);
    return `${d}d ${h}h`;
  };

  // Prepare data for Protocol Pie Chart
  const protoPieData = [
    { name: 'TCP In', value: protocols.tcp.in },
    { name: 'UDP In', value: protocols.udp.in },
    { name: 'ICMP In', value: protocols.icmp.in }
  ];

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-start justify-between bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div>
          <Link to="/" className="text-slate-500 hover:text-blue-600 flex items-center gap-2 mb-2 text-sm">
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <Server className="text-blue-600" /> System Telemetry
          </h1>
          <p className="text-slate-500 mt-1 max-w-4xl truncate" title={sys_info.descr}>{sys_info.descr}</p>
        </div>
        <div className="text-right space-y-1 text-sm text-slate-600">
          <div className="flex items-center justify-end gap-2"><Clock size={14} /> Uptime: <span className="font-mono font-bold text-slate-800">{fmtUptime(sys_info.uptime)}</span></div>
          <div className="flex items-center justify-end gap-2"><MapPin size={14} /> {sys_info.location}</div>
          <div className="flex items-center justify-end gap-2"><User size={14} /> {sys_info.contact}</div>
        </div>
      </div>

      {/* ROW 1: CRITICAL HEALTH (CPU & RAM) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CPU Load Trend */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><Cpu size={18} /> CPU Load Average</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={history_health}>
                <defs>
                  <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip contentStyle={{backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px'}} />
                <Legend />
                <Area type="monotone" dataKey="load1" stroke="#2563eb" fillOpacity={1} fill="url(#colorLoad)" name="1 Min Load" />
                <Area type="monotone" dataKey="load5" stroke="#9333ea" fillOpacity={0.1} fill="#9333ea" name="5 Min Load" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Memory & Swap Utilization */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><Activity size={18} /> Memory & Swap (MB)</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={history_health}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip contentStyle={{backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px'}} />
                <Legend />
                <Line type="step" dataKey="ram_used" stroke="#10b981" strokeWidth={2} dot={false} name="RAM Used" />
                <Line type="step" dataKey="swap_used" stroke="#f59e0b" strokeWidth={2} dot={false} name="Swap Used" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ROW 2: NETWORK TRAFFIC & PROTOCOLS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Network Throughput Area Chart */}
        <div className="col-span-2 bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><Network size={18} /> Total Network Traffic (KB/s)</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={history_net}>
                <defs>
                  <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip contentStyle={{backgroundColor: '#1e293b', color: '#fff'}} />
                <Legend />
                <Area type="monotone" dataKey="rx_kb" stroke="#10b981" fill="url(#colorIn)" name="Inbound (RX)" />
                <Area type="monotone" dataKey="tx_kb" stroke="#3b82f6" fill="url(#colorOut)" name="Outbound (TX)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Protocol Distribution Radar Chart */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-700 mb-4">Packet Distribution</h3>
          <div className="h-64">
             <ResponsiveContainer>
              <PieChart>
                <Pie data={protoPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {protoPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
             </ResponsiveContainer>
          </div>
          <div className="text-center mt-2 text-xs text-slate-500">
            TCP Established: <span className="font-bold text-blue-600">{protocols.tcp.estab}</span>
          </div>
        </div>
      </div>

      {/* ROW 3: INTERFACE BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interface Traffic Bar Chart */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
           <h3 className="font-bold text-slate-700 mb-4">Traffic by Interface (Latest Snapshot)</h3>
           <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={interfaces} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Legend />
                <Bar dataKey="in_bytes" fill="#10b981" name="RX Bytes" stackId="a" />
                <Bar dataKey="out_bytes" fill="#3b82f6" name="TX Bytes" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
           </div>
        </div>

        {/* Packet Errors & Discards */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
           <h3 className="font-bold text-slate-700 mb-4 text-red-600 flex items-center gap-2">
             <AlertTriangle size={18} /> Interface Errors & Discards
           </h3>
           <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={interfaces}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="errors" fill="#ef4444" name="Errors" />
                <Bar dataKey="discards" fill="#f59e0b" name="Discards" />
              </BarChart>
            </ResponsiveContainer>
           </div>
        </div>
      </div>

      {/* ROW 4: STORAGE & FILE SYSTEMS */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
        <h3 className="font-bold text-slate-700 mb-6 flex items-center gap-2"><Disc size={18} /> Storage Utilization</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {storage.map((disk, i) => {
             const percent = Math.round((disk.used / disk.size) * 100) || 0;
             const color = percent > 90 ? 'bg-red-500' : percent > 70 ? 'bg-yellow-500' : 'bg-green-500';
             return (
               <div key={i} className="border border-slate-100 p-4 rounded-lg bg-slate-50">
                 <div className="flex justify-between mb-2">
                   <span className="font-bold text-slate-700 truncate max-w-[70%]" title={disk.name}>{disk.name}</span>
                   <span className="text-sm font-mono">{percent}%</span>
                 </div>
                 <div className="w-full bg-slate-200 rounded-full h-2.5 mb-2">
                   <div className={`h-2.5 rounded-full ${color}`} style={{ width: `${percent}%` }}></div>
                 </div>
                 <div className="flex justify-between text-xs text-slate-500">
                    <span>Used: {fmtBytes(disk.used)}</span>
                    <span>Total: {fmtBytes(disk.size)}</span>
                 </div>
               </div>
             );
          })}
        </div>
      </div>
    </div>
  );
}
