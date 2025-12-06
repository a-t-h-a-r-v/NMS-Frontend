import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './Dashboard';
import DeviceDetail from './DeviceDetail';
import Alerts from './Alerts'; // IMPORT THIS
import Logs from './Logs';     // IMPORT THIS
import Settings from './Settings'; // IMPORT THIS
import { Activity, LayoutDashboard, Bell, Settings as SettingsIcon, FileText } from 'lucide-react';

function Sidebar() {
  const location = useLocation();
  const NavItem = ({ to, icon: Icon, label }) => (
    <Link to={to} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${location.pathname === to ? 'bg-blue-700 text-white' : 'text-blue-100 hover:bg-blue-800'}`}>
      <Icon size={20} /><span className="font-medium">{label}</span>
    </Link>
  );
  return (
    <div className="w-64 bg-slate-900 min-h-screen flex flex-col text-white fixed left-0 top-0 z-50">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <Activity className="text-blue-400" size={28} />
        <h1 className="text-xl font-bold">GoNMS</h1>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
        <NavItem to="/alerts" icon={Bell} label="Alerts" />
        <NavItem to="/logs" icon={FileText} label="Logs" />
        <NavItem to="/settings" icon={SettingsIcon} label="Settings" />
      </nav>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="flex bg-slate-100 min-h-screen">
        <Sidebar />
        <main className="flex-1 ml-64 p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/device/:id" element={<DeviceDetail />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/logs" element={<Logs />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
export default App;
