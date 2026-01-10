import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const [pastores, setPastores] = useState([]);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('listado'); 
  
  // Estado para Edición
  const [editingId, setEditingId] = useState(null); // Si es null, estamos creando. Si tiene ID, editamos.

  const [form, setForm] = useState({ 
    nombre: '', apellido: '', dni: '', iglesiaNombre: '', 
    email: '', telefono: '', nombrePastora: '', fotoUrl: '',
    password: '' // Nuevo campo contraseña
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

  // Función para cargar datos en el formulario y editar
  const iniciarEdicion = (pastor) => {
    setForm({
      nombre: pastor.nombre,
      apellido: pastor.apellido,
      dni: pastor.dni,
      iglesiaNombre: pastor.iglesiaNombre || '',
      email: pastor.email || '',
      telefono: pastor.telefono || '',
      nombrePastora: pastor.nombrePastora || '',
      fotoUrl: pastor.fotoUrl || '',
      password: '' // La contraseña siempre empieza vacía por seguridad
    });
    setEditingId(pastor.id);
    setActiveTab('nuevo'); // Llevamos al usuario al formulario
  };

  const cancelarEdicion = () => {
    setForm({ nombre: '', apellido: '', dni: '', iglesiaNombre: '', email: '', telefono: '', nombrePastora: '', fotoUrl: '', password: '' });
    setEditingId(null);
    setActiveTab('listado');
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
      if (editingId) {
        // MODO EDICIÓN (PUT)
        await axios.put(`${API_URL}/api/pastores/${editingId}`, form);
        alert('✅ Pastor Actualizado');
      } else {
        // MODO CREACIÓN (POST)
        await axios.post(`${API_URL}/api/pastores`, form);
        alert('✅ Pastor Creado');
      }
      
      // Limpiar y volver
      cancelarEdicion(); 
      cargarPastores();
    } catch (error) { 
      console.error(error);
      alert('Error al guardar. Revisa la conexión o DNI duplicado.'); 
    }
  };

  const cerrarSesion = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col z-20">
        <div className="p-6">
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">MDS<span className="text-blue-600">Admin</span></h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <button onClick={cancelarEdicion} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'listado' ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}>
            <span>📋</span> Listado
          </button>
          <button onClick={() => { setEditingId(null); setForm({ ...form, password: '' }); setActiveTab('nuevo'); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'nuevo' ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}>
            <span>👤</span> {editingId ? 'Editando...' : 'Nuevo Pastor'}
          </button>
        </nav>
        <div className="p-4 border-t">
          <button onClick={cerrarSesion} className="w-full text-red-500 hover:bg-red-50 py-2 rounded-lg font-bold text-sm transition">Cerrar Sesión</button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-y-auto relative">
        
        {/* Mobile Header */}
        <div className="md:hidden bg-white p-4 flex justify-between items-center shadow-sm sticky top-0 z-30">
          <h1 className="font-bold text-slate-800">MDS Admin</h1>
          <button onClick={cerrarSesion} className="text-xs text-red-500 font-bold">Salir</button>
        </div>
        
        <div className="md:hidden bg-white px-2 pb-2 flex gap-2 border-b sticky top-14 z-20">
           <button onClick={cancelarEdicion} className={`flex-1 py-2 text-xs font-bold rounded ${activeTab === 'listado' ? 'bg-blue-100 text-blue-700' : 'bg-gray-50'}`}>Listado</button>
           <button onClick={() => { setEditingId(null); setActiveTab('nuevo'); }} className={`flex-1 py-2 text-xs font-bold rounded ${activeTab === 'nuevo' ? 'bg-blue-100 text-blue-700' : 'bg-gray-50'}`}>Nuevo</button>
        </div>

        <div className="p-6 lg:p-10 max-w-5xl mx-auto w-full">
          
          {/* TAB: LISTADO */}
          {activeTab === 'listado' && (
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div>
                   <h2 className="text-2xl font-bold text-slate-800">Pastores Registrados</h2>
                   <p className="text-gray-500 text-sm">Administra las credenciales y accesos.</p>
                </div>
                <button onClick={() => { setEditingId(null); setActiveTab('nuevo'); }} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition">
                  + Nuevo
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastores.map(p => (
                  <div key={p.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                     <div className="flex items-center gap-4 mb-4">
                       <img src={p.fotoUrl || 'https://via.placeholder.com/100'} alt="Avatar" className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm" />
                       <div className="min-w-0">
                         <h4 className="font-bold text-slate-800 truncate">{p.apellido}, {p.nombre}</h4>
                         <p className="text-xs text-slate-500 font-mono">DNI: {p.dni}</p>
                       </div>
                     </div>
                     <div className="grid grid-cols-2 gap-2 mb-4">
                        <button onClick={() => iniciarEdicion(p)} className="w-full py-2 rounded-lg bg-slate-50 text-slate-600 text-xs font-bold hover:bg-slate-100 transition border border-slate-200">
                          ✏️ Editar
                        </button>
                        <a href={`/#/credencial/${p.id}`} target="_blank" rel="noreferrer" className="w-full py-2 rounded-lg bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-100 transition border border-blue-100 text-center">
                          🆔 Ver
                        </a>
                     </div>
                     <div className="text-[10px] text-gray-400 text-center flex justify-center gap-4 border-t pt-3">
                        <span>Accesos: {p.vecesLogin || 0}</span>
                        <span>Vistas: {p.vecesVisto || 0}</span>
                     </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: FORMULARIO (CREAR / EDITAR) */}
          {activeTab === 'nuevo' && (
            <div className="max-w-2xl mx-auto">
              <button onClick={cancelarEdicion} className="mb-6 text-sm text-slate-500 font-medium hover:text-slate-800 flex items-center gap-2">
                ← Volver al listado
              </button>
              
              <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="bg-slate-50/50 p-8 border-b border-slate-100">
                  <h3 className="font-bold text-2xl text-slate-800">
                    {editingId ? '✏️ Editando Pastor' : '👤 Nuevo Pastor'}
                  </h3>
                  <p className="text-slate-500 mt-1">
                    {editingId ? 'Modifica los datos abajo. Deja la contraseña vacía si no quieres cambiarla.' : 'Complete los datos. Si no ingresa contraseña, será el DNI.'}
                  </p>
                </div>
                
                <form onSubmit={guardarPastor} className="p-8 space-y-6">
                  <div className="grid grid-cols-2 gap-5">
                    <Input label="Nombre" val={form.nombre} set={v => setForm({...form, nombre: v})} />
                    <Input label="Apellido" val={form.apellido} set={v => setForm({...form, apellido: v})} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-5">
                    <Input label="DNI (Usuario)" val={form.dni} set={v => setForm({...form, dni: v})} />
                    {/* CAMPO PASSWORD NUEVO */}
                    <div className="relative">
                       <Input label={editingId ? "Nueva Contraseña (Opcional)" : "Contraseña (Opcional)"} type="password" val={form.password} set={v => setForm({...form, password: v})} required={false} />
                       <p className="text-[10px] text-gray-400 mt-1 absolute right-0 top-0">{editingId ? 'Vacío = No cambiar' : 'Vacío = DNI'}</p>
                    </div>
                  </div>

                  <Input label="Nombre de la Iglesia" val={form.iglesiaNombre} set={v => setForm({...form, iglesiaNombre: v})} />
                  
                  <div className="p-5 bg-slate-50 rounded-xl space-y-4 border border-slate-100">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contacto y Familia</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input label="Email" type="email" val={form.email} set={v => setForm({...form, email: v})} required={false} />
                      <Input label="Teléfono" type="tel" val={form.telefono} set={v => setForm({...form, telefono: v})} required={false} />
                    </div>
                    <Input label="Nombre Pastora/Esposa" val={form.nombrePastora} set={v => setForm({...form, nombrePastora: v})} required={false} />
                  </div>

                  {/* Foto */}
                  <div className="flex items-center gap-5 p-4 border border-dashed border-slate-300 rounded-xl">
                    {form.fotoUrl ? <img src={form.fotoUrl} className="w-16 h-16 rounded-full object-cover shadow-sm" /> : <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 text-2xl">📷</div>}
                    <div className="flex-1">
                       <label className="block text-sm font-bold text-slate-700 mb-1">Foto de Perfil</label>
                       <input type="file" onChange={handleFileUpload} disabled={uploading} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"/>
                    </div>
                  </div>

                  <button type="submit" disabled={uploading} className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg transition transform active:scale-[0.99]">
                    {uploading ? '⏳ Procesando...' : (editingId ? '💾 ACTUALIZAR DATOS' : '💾 CREAR PASTOR')}
                  </button>
                  
                  {editingId && (
                    <button type="button" onClick={cancelarEdicion} className="w-full py-2 text-slate-500 font-bold text-sm hover:text-slate-800">
                      Cancelar Edición
                    </button>
                  )}
                </form>
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
    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1 tracking-wide">{label} {required && <span className="text-red-400">*</span>}</label>
    <input 
      type={type} value={val} onChange={e => set(e.target.value)} 
      className="w-full border border-slate-200 bg-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm font-medium shadow-sm placeholder-slate-300"
      placeholder={type === 'password' ? '••••••' : ''}
      required={required} 
    />
  </div>
);

export default Admin;