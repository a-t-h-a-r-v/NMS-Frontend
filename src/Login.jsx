import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { setSession } from './utils/auth';
import { Lock, User } from 'lucide-react';
import JSEncrypt from 'jsencrypt';

const API_URL = import.meta.env.VITE_API_URL;

export default function Login() {
  const [creds, setCreds] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch Public Key on load
    axios.get(`${API_URL}/auth/key`).then(res => setPublicKey(res.data.publicKey));
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!publicKey) {
      setError("Secure connection not established. Try refreshing.");
      return;
    }

    try {
      // Encrypt Credentials
      const encryptor = new JSEncrypt();
      encryptor.setPublicKey(publicKey);
      const payload = encryptor.encrypt(JSON.stringify(creds));

      if (!payload) {
        setError("Encryption failed");
        return;
      }

      // Send Encrypted Payload
      const res = await axios.post(`${API_URL}/login`, { payload });
      
      if (res.data && res.data.token) {
          setSession(res.data.token, res.data.user);
          navigate('/');
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 401) {
        setError('Invalid credentials');
      } else {
        setError('Login failed. Check server logs.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-6 text-slate-800">GoNMS Login</h1>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm text-center font-medium">{error}</div>}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-3 text-slate-400" size={18} />
            <input 
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder="Username" 
              value={creds.username}
              onChange={e => setCreds({...creds, username: e.target.value})}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
            <input 
              type="password"
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder="Password" 
              value={creds.password}
              onChange={e => setCreds({...creds, password: e.target.value})}
            />
          </div>
          <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition">
            Sign In (Secure)
          </button>
        </form>
      </div>
    </div>
  );
}
