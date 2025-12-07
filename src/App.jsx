import { BrowserRouter, Routes, Route, Link, useLocation, Navigate, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Dashboard from './Dashboard';
import DeviceDetail from './DeviceDetail';
import Alerts from './Alerts';
import Logs from './Logs';
import Settings from './Settings';
import Login from './Login';
import AdminUsers from './AdminUsers';
import { Activity, LayoutDashboard, Bell, Settings as SettingsIcon, FileText, Users, LogOut } from 'lucide-react';
import { getSession, setupAxios, clearSession } from './utils/auth';

setupAxios();

function Sidebar() {
  const location = useLocation();
  const { user } = getSession();
  const isAdmin = user?.role === 'admin';

  const NavItem = ({ to, icon: Icon, label }) => (
    <Link to={to} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${location.pathname === to ? 'bg-blue-700 text-white' : 'text-blue-100 hover:bg-blue-800'}`}>
      <Icon size={20} /><span className="font-medium">{label}</span>
    </Link>
  );

  return (
    <div className="w-64 bg-slate-900 min-h-screen flex flex-col text-white fixed left-0 top-0 z-40">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <Activity className="text-blue-400" size={28} />
        <h1 className="text-xl font-bold">GoNMS</h1>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
        <NavItem to="/alerts" icon={Bell} label="Alerts" />
        {isAdmin && <NavItem to="/logs" icon={FileText} label="Logs" />}
        {isAdmin && <NavItem to="/users" icon={Users} label="Users" />}
        {isAdmin && <NavItem to="/settings" icon={SettingsIcon} label="Settings" />}
      </nav>
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-4 py-3 mb-2 text-slate-400 text-sm">
            <div className="w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center font-bold text-blue-200">
                {user?.username?.[0]?.toUpperCase()}
            </div>
            <div>
                <div className="font-bold text-white">{user?.username}</div>
                <div className="text-xs uppercase">{user?.role}</div>
            </div>
        </div>
        <button onClick={clearSession} className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-red-300 hover:bg-slate-800 hover:text-red-200 transition">
            <LogOut size={18} /> Sign Out
        </button>
      </div>
    </div>
  );
}

const PrivateRoute = ({ adminOnly = false }) => {
    const { token, user } = getSession();
    if (!token) return <Navigate to="/login" />;
    if (adminOnly && user?.role !== 'admin') return <Navigate to="/" />;
    return (
        <div className="flex bg-slate-100 min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                <Outlet />
            </main>
        </div>
    );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes */}
        <Route element={<PrivateRoute />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/device/:id" element={<DeviceDetail />} />
            <Route path="/alerts" element={<Alerts />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<PrivateRoute adminOnly={true} />}>
            <Route path="/logs" element={<Logs />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/users" element={<AdminUsers />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
export default App;
