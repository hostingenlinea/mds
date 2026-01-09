// client/src/pages/Admin.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const [pastores, setPastores] = useState([]);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('listado'); // 'listado' o 'nuevo'
  
  // Formulario
  const [form, setForm] = useState({ 
    nombre: '', apellido: '', dni: '', iglesiaNombre: '', 
    email: '', telefono: '', nombrePastora: '', fotoUrl: '' 
  });
  const [uploading, setUploading] = useState(false); 
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'; 

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.rol !== 'ADMIN') { navigate('/login'); return; }
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
      setActiveTab('listado'); // Volver al listado al terminar
    } catch (error) { alert('Error: DNI duplicado.'); }
  };

  const cerrarSesion = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Stats
  const totalLogins = pastores.reduce((acc, p) => acc + (p.vecesLogin || 0), 0);
  const totalVistas = pastores.reduce((acc, p) => acc + (p.vecesVisto || 0), 0);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">
      
      {/* SIDEBAR (Barra Lateral) */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-2xl z-20 hidden md:flex">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-black tracking-tighter text-blue-400">MDS<span className="text-white">Admin</span></h1>
          <p className="text-xs text-slate-400 mt-1">Gestión de Credenciales</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('listado')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'listado' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <span>📋</span> Listado General
          </button>
          <button 
            onClick={() => setActiveTab('nuevo')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'nuevo' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <span>👤</span> Nuevo Pastor
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button onClick={cerrarSesion} className="w-full flex items-center justify-center gap-2 text-red-400 hover:text-red-300 transition text-sm font-bold py-2">
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 flex flex-col overflow-y-auto relative">
        
        {/* Header Mobile (Solo visible en celular) */}
        <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-30 shadow-md">
          <h1 className="font-bold">MDS Admin</h1>
          <button onClick={cerrarSesion} className="text-xs bg-slate-800 px-2 py-1 rounded">Salir</button>
        </div>
        
        {/* Navegación Mobile */}
        <div className="md:hidden bg-white p-2 flex gap-2 shadow-sm border-b sticky top-14 z-20">
           <button onClick={() => setActiveTab('listado')} className={`flex-1 py-2 text-xs font-bold rounded ${activeTab === 'listado' ? 'bg-blue-100 text-blue-700' : 'bg-gray-50'}`}>Listado</button>
           <button onClick={() => setActiveTab('nuevo')} className={`flex-1 py-2 text-xs font-bold rounded ${activeTab === 'nuevo' ? 'bg-blue-100 text-blue-700' : 'bg-gray-50'}`}>Nuevo</button>
        </div>

        <div className="p-6 lg:p-10 max-w-6xl mx-auto w-full">
          
          {/* HEADER DASHBOARD */}
          <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">Panel de Control</h2>
              <p className="text-gray-500 text-sm">Bienvenido al sistema de administración.</p>
            </div>
            {/* Stats Rápidos */}
            <div className="flex gap-4">
              <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 px-6 text-center">
                <span className="block text-2xl font-black text-blue-600">{pastores.length}</span>
                <span className="text-xs text-gray-400 uppercase font-bold">Pastores</span>
              </div>
              <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 px-6 text-center hidden sm:block">
                <span className="block text-2xl font-black text-green-600">{totalVistas}</span>
                <span className="text-xs text-gray-400 uppercase font-bold">Escaneos</span>
              </div>
            </div>
          </header>

          {/* VISTA: LISTADO */}
          {activeTab === 'listado' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-700">Directorio de Pastores</h3>
                <button onClick={() => setActiveTab('nuevo')} className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-2 rounded-lg font-bold shadow-lg shadow-blue-500/30 transition">
                  + Agregar Nuevo
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {pastores.map(p => (
                  <div key={p.id} className="group relative bg-white rounded-xl p-4 border border-gray-100 hover:border-blue-300 hover:shadow-xl transition-all duration-300">
                     <div className="flex items-start gap-4">
                       <img src={p.fotoUrl || 'https://via.placeholder.com/100'} alt="Avatar" className="w-16 h-16 rounded-full object-cover shadow-md border-2 border-white" />
                       <div className="flex-1 min-w-0">
                         <h4 className="font-bold text-gray-800 truncate">{p.apellido}, {p.nombre}</h4>
                         <p className="text-xs text-gray-500 mb-1">{p.iglesiaNombre}</p>
                         <span className="inline-block bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded-full font-mono">DNI: {p.dni}</span>
                       </div>
                     </div>
                     <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
                        <div className="flex gap-3 text-xs text-gray-400">
                          <span title="Logins">🔐 {p.vecesLogin}</span>
                          <span title="Vistas">👁️ {p.vecesVisto}</span>
                        </div>
                        <a href={`/#/credencial/${p.id}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 text-sm font-bold flex items-center gap-1">
                          Ver Credencial ↗
                        </a>
                     </div>
                  </div>
                ))}
                {pastores.length === 0 && <div className="col-span-full text-center py-10 text-gray-400">No hay registros aún.</div>}
              </div>
            </div>
          )}

          {/* VISTA: FORMULARIO */}
          {activeTab === 'nuevo' && (
            <div className="max-w-2xl mx-auto">
              <button onClick={() => setActiveTab('listado')} className="mb-4 text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1">← Volver al listado</button>
              
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 p-6 border-b border-gray-100">
                  <h3 className="font-bold text-xl text-gray-800">Registrar Nuevo Pastor</h3>
                  <p className="text-sm text-gray-500">Complete los datos para generar la credencial.</p>
                </div>
                
                <div className="p-8">
                  <form onSubmit={guardarPastor} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <Input label="Nombre" val={form.nombre} set={v => setForm({...form, nombre: v})} />
                      <Input label="Apellido" val={form.apellido} set={v => setForm({...form, apellido: v})} />
                    </div>
                    
                    <Input label="DNI (Será el Usuario)" val={form.dni} set={v => setForm({...form, dni: v})} />
                    <Input label="Nombre de la Iglesia" val={form.iglesiaNombre} set={v => setForm({...form, iglesiaNombre: v})} />
                    
                    <div className="p-4 bg-blue-50/50 rounded-xl space-y-4 border border-blue-100/50">
                      <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider">Información de Contacto</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Email" type="email" val={form.email} set={v => setForm({...form, email: v})} required={false} />
                        <Input label="Teléfono" type="tel" val={form.telefono} set={v => setForm({...form, telefono: v})} required={false} />
                      </div>
                      <Input label="Nombre Pastora/Esposa" val={form.nombrePastora} set={v => setForm({...form, nombrePastora: v})} required={false} />
                    </div>

                    <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300">
                      {form.fotoUrl ? <img src={form.fotoUrl} className="w-16 h-16 rounded-full object-cover border-2 border-green-500" alt="Pre"/> : <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-2xl border text-gray-300">📷</div>}
                      <div className="flex-1">
                        <label className="block text-sm font-bold text-gray-700 mb-1">Foto de Perfil</label>
                        <input type="file" onChange={handleFileUpload} disabled={uploading} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                        {uploading && <span className="text-xs text-blue-600 font-bold animate-pulse mt-1 block">Subiendo...</span>}
                      </div>
                    </div>

                    <button type="submit" disabled={uploading} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition transform active:scale-[0.98]">
                      {uploading ? '⏳ Procesando...' : '💾 GUARDAR REGISTRO'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

const Input = ({ label, val, set, type="text", required=true }) => (
  <div>
    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">{label} {required && <span className="text-red-400">*</span>}</label>
    <input 
      type={type} value={val} onChange={e => set(e.target.value)} 
      className="w-full border border-gray-200 bg-white p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm font-medium shadow-sm"
      placeholder="..." required={required} 
    />
  </div>
);

export default Admin;