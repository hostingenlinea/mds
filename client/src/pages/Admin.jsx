import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const [pastores, setPastores] = useState([]);
  const navigate = useNavigate();
  
  const [form, setForm] = useState({ 
    nombre: '', apellido: '', dni: '', iglesiaNombre: '', 
    email: '', telefono: '', nombrePastora: '', fotoUrl: '' 
  });
  
  const [uploading, setUploading] = useState(false); 
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'; 

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.rol !== 'ADMIN') navigate('/login');
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
    } catch (error) { alert('Error: Posible DNI duplicado.'); }
  };

  const cerrarSesion = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-100 pb-10">
      {/* NAVBAR */}
      <nav className="bg-blue-900 text-white p-4 shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-black tracking-tight">MDS <span className="font-light text-blue-300">ADMIN</span></h1>
          <button onClick={cerrarSesion} className="bg-blue-800 px-3 py-1 rounded text-xs font-bold hover:bg-red-600 transition">
            SALIR
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-4 space-y-6">
        
        {/* TARJETA DE FORMULARIO */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 p-4 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-700">👤 Nuevo Registro</h2>
          </div>
          
          <div className="p-6">
            <form onSubmit={guardarPastor} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Sección Datos */}
              <div className="space-y-4">
                <Input label="Nombre" val={form.nombre} set={v => setForm({...form, nombre: v})} />
                <Input label="Apellido" val={form.apellido} set={v => setForm({...form, apellido: v})} />
                <Input label="DNI (Usuario)" val={form.dni} set={v => setForm({...form, dni: v})} />
                <Input label="Iglesia" val={form.iglesiaNombre} set={v => setForm({...form, iglesiaNombre: v})} />
              </div>

              {/* Sección Contacto y Foto */}
              <div className="space-y-4">
                <Input label="Email" type="email" val={form.email} set={v => setForm({...form, email: v})} />
                <Input label="Teléfono" type="tel" val={form.telefono} set={v => setForm({...form, telefono: v})} />
                <Input label="Nombre Pastora/Esposa" val={form.nombrePastora} set={v => setForm({...form, nombrePastora: v})} />
                
                {/* Custom File Upload */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Foto de Perfil</label>
                  <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-dashed border-slate-300">
                    {form.fotoUrl ? (
                      <img src={form.fotoUrl} className="w-12 h-12 rounded-full object-cover border-2 border-green-500" alt="Preview" />
                    ) : (
                      <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center text-xl">📷</div>
                    )}
                    <input type="file" onChange={handleFileUpload} disabled={uploading} className="text-sm w-full text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"/>
                  </div>
                  {uploading && <p className="text-xs text-blue-600 mt-1 font-bold animate-pulse">Subiendo imagen...</p>}
                </div>
              </div>

              <div className="md:col-span-2 pt-4">
                 <button type="submit" disabled={uploading} className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-700 to-blue-900 text-white font-bold text-lg shadow-lg hover:shadow-xl transition transform active:scale-95 disabled:opacity-50">
                   {uploading ? '⏳ Espere...' : '💾 GUARDAR PASTOR'}
                 </button>
              </div>
            </form>
          </div>
        </div>

        {/* LISTADO */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-700 mb-4">📋 Pastores Registrados</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pastores.map(p => (
              <div key={p.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 transition">
                <img src={p.fotoUrl || 'https://via.placeholder.com/50'} alt="Avatar" className="w-12 h-12 rounded-full object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 text-sm truncate">{p.apellido}, {p.nombre}</p>
                  <p className="text-xs text-slate-500">DNI: {p.dni}</p>
                </div>
                <a href={`/#/credencial/${p.id}`} target="_blank" rel="noreferrer" className="bg-white p-2 rounded-lg text-blue-600 shadow-sm border border-slate-200 hover:text-blue-800">
                  🆔
                </a>
              </div>
            ))}
            {pastores.length === 0 && <p className="text-gray-400 text-sm col-span-full text-center py-4">No hay registros aún.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente auxiliar para Inputs más limpios
const Input = ({ label, val, set, type="text" }) => (
  <div>
    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{label}</label>
    <input 
      type={type} 
      value={val} 
      onChange={e => set(e.target.value)} 
      className="w-full border border-slate-200 bg-slate-50 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-sm font-medium" 
      required={type !== 'tel' && type !== 'email'}
    />
  </div>
);

export default Admin;