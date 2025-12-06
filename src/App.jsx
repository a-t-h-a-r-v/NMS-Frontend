import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './Dashboard';
import DeviceDetail from './DeviceDetail';
import { Activity, LayoutDashboard, Bell, Settings, FileText, Server } from 'lucide-react';

// Sidebar Navigation Component
function Sidebar() {
  const location = useLocation();

  const NavItem = ({ to, icon: Icon, label }) => {
    const isActive = location.pathname === to;
    return (
      <Link to={to} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-blue-700 text-white' : 'text-blue-100 hover:bg-blue-800'}`}>
        <Icon size={20} />
        <span className="font-medium">{label}</span>
      </Link>
    );
  };

  return (
    <div className="w-64 bg-slate-900 min-h-screen flex flex-col text-white fixed left-0 top-0">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <Activity className="text-blue-400" size={28} />
        <h1 className="text-xl font-bold tracking-tight">GoNMS</h1>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
        <NavItem to="/alerts" icon={Bell} label="Alerts" />
        <NavItem to="/logs" icon={FileText} label="System Logs" />
        <NavItem to="/settings" icon={Settings} label="Settings" />
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800 rounded p-3 text-xs text-slate-400">
          <p>Status: <span className="text-green-400">Online</span></p>
          <p>Version: v1.0.2</p>
        </div>
      </div>
    </div>
  );
}

// Placeholder pages for the "Full App" feel
const Placeholder = ({ title }) => (
  <div className="p-8 text-center text-slate-500 bg-white rounded-lg border border-dashed border-slate-300 m-4 h-96 flex flex-col items-center justify-center">
    <Settings size={48} className="mb-4 text-slate-300" />
    <h2 className="text-xl font-semibold mb-2">{title} Module</h2>
    <p>This feature is coming in the next update.</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <div className="flex bg-slate-100 min-h-screen">
        <Sidebar />
        <main className="flex-1 ml-64 p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/device/:id" element={<DeviceDetail />} />
            <Route path="/alerts" element={<Placeholder title="Alerts & Incidents" />} />
            <Route path="/logs" element={<Placeholder title="System Logs" />} />
            <Route path="/settings" element={<Placeholder title="System Configuration" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
