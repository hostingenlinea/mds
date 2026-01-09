// client/src/pages/Login.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, { dni, password });
      
      // Guardar datos en memoria (LocalStorage)
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      // Redirigir según quién sea
      if (res.data.user.rol === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/perfil');
      }

    } catch (err) {
      setError('DNI o Contraseña incorrectos');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center text-blue-900 mb-6">Acceso MDS</h1>
        
        {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm text-center">{error}</div>}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">DNI (Usuario)</label>
            <input 
              type="text" 
              className="w-full border p-2 rounded mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input 
              type="password" 
              className="w-full border p-2 rounded mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="w-full bg-blue-900 text-white py-2 rounded font-bold hover:bg-blue-800 transition">
            INGRESAR
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;