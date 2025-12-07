import { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Shield, Key, Trash2, Plus, Check, X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [permModal, setPermModal] = useState(null); // Contains user object if open
  const [devices, setDevices] = useState([]); // All devices
  const [userPerms, setUserPerms] = useState([]); // Perms for selected user

  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'user' });

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = () => axios.get(`${API_URL}/admin/users`).then(res => setUsers(res.data));

  const handleCreate = async (e) => {
    e.preventDefault();
    await axios.post(`${API_URL}/admin/users`, newUser);
    setShowModal(false);
    fetchUsers();
  };

  const handleDelete = async (id) => {
    if(confirm("Delete user?")) {
        await axios.delete(`${API_URL}/admin/users?id=${id}`);
        fetchUsers();
    }
  };

  const openPerms = async (user) => {
    setPermModal(user);
    // Fetch perms for this user
    const res = await axios.get(`${API_URL}/admin/permissions?user_id=${user.id}`);
    setUserPerms(res.data);
  };

  const togglePerm = async (deviceId, type, currentVal) => {
    const p = userPerms.find(p => p.device_id === deviceId) || { has_access: false, can_write: false };
    
    let updates = { ...p };
    if (type === 'access') {
        updates.has_access = !updates.has_access;
        if (!updates.has_access) updates.can_write = false; // Remove write if access revoked
    } else {
        updates.can_write = !updates.can_write;
        if (updates.can_write) updates.has_access = true; // Grant access if write enabled
    }

    // Optimistic Update
    const newPerms = userPerms.map(up => up.device_id === deviceId ? { ...up, ...updates } : up);
    setUserPerms(newPerms);

    await axios.post(`${API_URL}/admin/permissions`, {
        user_id: permModal.id,
        device_id: deviceId,
        has_access: updates.has_access,
        can_write: updates.can_write
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2">
            <Plus size={18}/> Add User
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map(u => (
            <div key={u.id} className="bg-white p-5 rounded-lg shadow border border-slate-200">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2 font-bold text-slate-700">
                        <User size={18} /> {u.username}
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs uppercase font-bold ${u.role==='admin'?'bg-purple-100 text-purple-700':'bg-slate-100 text-slate-600'}`}>
                        {u.role}
                    </span>
                </div>
                <div className="text-xs text-slate-400 mb-4">Created: {new Date(u.created_at).toLocaleDateString()}</div>
                
                <div className="flex gap-2">
                    {u.role !== 'admin' && (
                        <button onClick={() => openPerms(u)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-1.5 rounded text-sm font-medium flex items-center justify-center gap-2">
                            <Key size={14} /> Permissions
                        </button>
                    )}
                    <button onClick={() => handleDelete(u.id)} className="p-2 text-red-400 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                </div>
            </div>
        ))}
      </div>

      {/* CREATE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
                <h3 className="font-bold mb-4">Create User</h3>
                <form onSubmit={handleCreate} className="space-y-3">
                    <input className="border w-full p-2 rounded" placeholder="Username" required value={newUser.username} onChange={e=>setNewUser({...newUser, username: e.target.value})} />
                    <input className="border w-full p-2 rounded" type="password" placeholder="Password" required value={newUser.password} onChange={e=>setNewUser({...newUser, password: e.target.value})} />
                    <select className="border w-full p-2 rounded" value={newUser.role} onChange={e=>setNewUser({...newUser, role: e.target.value})}>
                        <option value="user">Standard User</option>
                        <option value="admin">Administrator</option>
                    </select>
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => setShowModal(false)} className="px-3 py-1 text-slate-500">Cancel</button>
                        <button className="bg-blue-600 text-white px-4 py-1.5 rounded">Create</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* PERMISSIONS MODAL */}
      {permModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl h-[80vh] flex flex-col">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h3 className="font-bold">Permissions: {permModal.username}</h3>
                    <button onClick={() => setPermModal(null)}><X size={20} className="text-slate-400 hover:text-slate-600" /></button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-2">
                    <div className="grid grid-cols-12 gap-2 font-bold text-xs text-slate-500 uppercase px-2 mb-2">
                        <div className="col-span-6">Device</div>
                        <div className="col-span-3 text-center">Read Access</div>
                        <div className="col-span-3 text-center">Write Access</div>
                    </div>
                    {userPerms.map(d => (
                        <div key={d.device_id} className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2 rounded border border-slate-100">
                            <div className="col-span-6 font-medium text-slate-700 truncate" title={d.hostname}>{d.hostname}</div>
                            
                            <div className="col-span-3 flex justify-center">
                                <button 
                                    onClick={() => togglePerm(d.device_id, 'access', d.has_access)}
                                    className={`w-10 h-6 rounded-full transition-colors flex items-center px-0.5 ${d.has_access ? 'bg-green-500 justify-end' : 'bg-slate-300 justify-start'}`}
                                >
                                    <div className="w-5 h-5 bg-white rounded-full shadow-sm" />
                                </button>
                            </div>

                            <div className="col-span-3 flex justify-center">
                                <button 
                                    onClick={() => togglePerm(d.device_id, 'write', d.can_write)}
                                    disabled={!d.has_access}
                                    className={`w-10 h-6 rounded-full transition-colors flex items-center px-0.5 ${d.can_write ? 'bg-orange-500 justify-end' : 'bg-slate-300 justify-start'} ${!d.has_access && 'opacity-50 cursor-not-allowed'}`}
                                >
                                    <div className="w-5 h-5 bg-white rounded-full shadow-sm" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
