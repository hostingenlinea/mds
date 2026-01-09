// client/src/pages/Admin.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const [pastores, setPastores] = useState([]);
  const navigate = useNavigate();
  
  // Estado del formulario
  const [form, setForm] = useState({ 
    nombre: '', apellido: '', dni: '', iglesiaNombre: '', 
    email: '', telefono: '', nombrePastora: '', fotoUrl: '' 
  });
  
  const [uploading, setUploading] = useState(false); 
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'; 

  // Verificar seguridad
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) { navigate('/login'); return; }
    const user = JSON.parse(userStr);
    if (user.rol !== 'ADMIN') { navigate('/perfil'); return; }
    cargarPastores();
  }, [navigate]);

  const cargarPastores = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/pastores`);
      setPastores(res.data);
    } catch (error) { console.error(error); }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('foto', file);
    try {
      const res = await axios.post(`${API_URL}/api/upload`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm({ ...form, fotoUrl: res.data.url });
    } catch (error) { alert("Error al subir imagen"); } finally { setUploading(false); }
  };

  const guardarPastor = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/pastores`, form);
      alert('✅ Pastor Registrado');
      setForm({ nombre: '', apellido: '', dni: '', iglesiaNombre: '', email: '', telefono: '', nombrePastora: '', fotoUrl: '' });
      cargarPastores();
    } catch (error) { alert('Error: DNI duplicado.'); }
  };

  const cerrarSesion = () => {
    localStorage.clear();
    navigate('/login');
  };

  // --- CÁLCULO DE ESTADÍSTICAS ---
  const totalPastores = pastores.length;
  const totalLogins = pastores.reduce((acc, p) => acc + (p.vecesLogin || 0), 0);
  const totalVistas = pastores.reduce((acc, p) => acc + (p.vecesVisto || 0), 0);
  // Top 3 pastores con más actividad (suma de logins + vistas)
  const topPastores = [...pastores]
    .sort((a, b) => ((b.vecesLogin||0) + (b.vecesVisto||0)) - ((a.vecesLogin||0) + (a.vecesVisto||0)))
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-900 p-4 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-white font-bold text-xl tracking-wider">MDS ADMIN</h1>
          </div>
          <button onClick={cerrarSesion} className="bg-blue-800/50 text-blue-100 px-3 py-1.5 rounded hover:bg-red-600/80 transition text-sm">
            Cerrar Sesión
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-4 lg:p-8 space-y-8">
        
        {/* --- SECCIÓN DE ESTADÍSTICAS (NUEVO) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Pastores" value={totalPastores} icon="👥" color="bg-white" textColor="text-gray-800" />
          <StatCard label="Accesos al Sistema" value={totalLogins} icon="🔐" color="bg-blue-50" textColor="text-blue-800" />
          <StatCard label="Escaneos de QR" value={totalVistas} icon="📱" color="bg-green-50" textColor="text-green-800" />
          
          {/* Tarjeta de Top Actividad */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">🏆 Más Activos</h3>
            <div className="space-y-2">
              {topPastores.map((p, i) => (
                <div key={p.id} className="flex justify-between text-xs">
                  <span className="font-semibold text-gray-700">{i+1}. {p.apellido}</span>
                  <span className="text-gray-500">{(p.vecesLogin||0) + (p.vecesVisto||0)} mov.</span>
                </div>
              ))}
              {topPastores.length === 0 && <span className="text-xs text-gray-400">Sin datos aún</span>}
            </div>
          </div>
        </div>

        {/* --- GRID PRINCIPAL (FORMULARIO Y LISTA) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* FORMULARIO */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden lg:col-span-1 lg:sticky lg:top-24">
            <div className="bg-gray-50 p-4 border-b border-gray-200">
              <h2 className="font-bold text-gray-800 flex items-center gap-2">👤 Nuevo Registro</h2>
            </div>
            <div className="p-5">
              <form onSubmit={guardarPastor} className="space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Nombre" val={form.nombre} set={v => setForm({...form, nombre: v})} />
                  <Input label="Apellido" val={form.apellido} set={v => setForm({...form, apellido: v})} />
                </div>
                <Input label="DNI (Usuario)" val={form.dni} set={v => setForm({...form, dni: v})} />
                <Input label="Iglesia" val={form.iglesiaNombre} set={v => setForm({...form, iglesiaNombre: v})} />
                <div className="border-t border-gray-100 pt-4 space-y-4">
                  <p className="text-xs font-bold text-gray-400 uppercase">Opcionales</p>
                  <Input label="Email" type="email" val={form.email} set={v => setForm({...form, email: v})} required={false} />
                  <Input label="Teléfono" type="tel" val={form.telefono} set={v => setForm({...form, telefono: v})} required={false} />
                  <Input label="Nombre Esposa" val={form.nombrePastora} set={v => setForm({...form, nombrePastora: v})} required={false} />
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-2 text-center">
                  <label className="block text-xs font-bold text-blue-800 uppercase mb-3">Foto</label>
                  <div className="flex flex-col items-center gap-3">
                    {form.fotoUrl ? <img src={form.fotoUrl} className="w-16 h-16 rounded-full object-cover border-2 border-white shadow" alt="Preview"/> : <span className="text-2xl">📷</span>}
                    <label className="cursor-pointer bg-white border border-blue-300 text-blue-700 px-4 py-1.5 rounded-full text-xs font-bold hover:bg-blue-600 hover:text-white transition">
                      {uploading ? '...' : 'Subir Foto'}
                      <input type="file" onChange={handleFileUpload} disabled={uploading} className="hidden"/>
                    </label>
                  </div>
                </div>
                <button type="submit" disabled={uploading} className="w-full py-3 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-lg shadow-md text-sm">
                  {uploading ? '⏳ ...' : '💾 GUARDAR PASTOR'}
                </button>
              </form>
            </div>
          </div>

          {/* LISTADO */}
          <div className="lg:col-span-2 space-y-4">
             <div className="flex justify-between items-center">
                <h2 className="font-bold text-gray-700 flex items-center gap-2">📋 Listado <span className="bg-gray-200 text-xs px-2 rounded-full">{pastores.length}</span></h2>
             </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pastores.map(p => (
                <div key={p.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex gap-4 hover:border-blue-300 transition relative overflow-hidden group">
                  {/* Barra lateral de estado */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${p.estado === 'HABILITADO' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  
                  <img src={p.fotoUrl || 'https://via.placeholder.com/100?text=S/F'} alt="Avatar" className="w-14 h-14 rounded-full object-cover border border-gray-200 bg-gray-50" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 text-base truncate">{p.apellido}, {p.nombre}</h3>
                    <p className="text-xs text-gray-500 font-mono">DNI: {p.dni}</p>
                    
                    {/* Badge Stats Individuales */}
                    <div className="flex gap-2 mt-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      <span title="Veces que hizo Login">🔐 {p.vecesLogin || 0}</span>
                      <span title="Veces que se vio su credencial">👁️ {p.vecesVisto || 0}</span>
                    </div>
                  </div>
                  <a href={`/#/credencial/${p.id}`} target="_blank" rel="noreferrer" className="shrink-0 bg-gray-50 text-blue-600 w-10 h-10 rounded-lg flex items-center justify-center hover:bg-blue-600 hover:text-white transition shadow-sm border border-gray-100">🆔</a>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// Componentes Auxiliares
const Input = ({ label, val, set, type="text", required=true }) => (
  <div>
    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{label}</label>
    <input type={type} value={val} onChange={e => set(e.target.value)} className="w-full border border-gray-300 bg-white p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="..." required={required} />
  </div>
);

const StatCard = ({ label, value, icon, color, textColor }) => (
  <div className={`${color} p-4 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between`}>
    <div>
      <p className="text-xs font-bold text-gray-400 uppercase">{label}</p>
      <p className={`text-2xl font-black ${textColor}`}>{value}</p>
    </div>
    <span className="text-2xl opacity-50">{icon}</span>
  </div>
);

export default Admin;