import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const [pastores, setPastores] = useState([]);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('listado'); 
  const [editingId, setEditingId] = useState(null);

  // Formulario con ROL y ESTADO
  const [form, setForm] = useState({ 
    nombre: '', apellido: '', dni: '', iglesiaNombre: '', 
    email: '', telefono: '', nombrePastora: '', fotoUrl: '',
    password: '', rol: 'USER', estado: 'HABILITADO'
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

  const iniciarEdicion = (pastor) => {
    setForm({
      nombre: pastor.nombre, apellido: pastor.apellido, dni: pastor.dni,
      iglesiaNombre: pastor.iglesiaNombre || '', email: pastor.email || '',
      telefono: pastor.telefono || '', nombrePastora: pastor.nombrePastora || '',
      fotoUrl: pastor.fotoUrl || '', password: '', 
      rol: pastor.rol, estado: pastor.estado // Cargamos rol y estado actual
    });
    setEditingId(pastor.id);
    setActiveTab('nuevo');
  };

  const cancelarEdicion = () => {
    setForm({ 
        nombre: '', apellido: '', dni: '', iglesiaNombre: '', email: '', 
        telefono: '', nombrePastora: '', fotoUrl: '', password: '', 
        rol: 'USER', estado: 'HABILITADO' 
    });
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

  // Guardar (Crear o Editar)
  const guardarPastor = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_URL}/api/pastores/${editingId}`, form);
        alert('✅ Datos Actualizados');
      } else {
        await axios.post(`${API_URL}/api/pastores`, form);
        alert('✅ Pastor Creado');
      }
      cancelarEdicion(); 
      cargarPastores();
    } catch (error) { alert('Error al guardar.'); }
  };

  // Eliminar Pastor
  const eliminarPastor = async (id, nombre) => {
    if(!window.confirm(`¿Estás seguro de ELIMINAR a ${nombre}? Esta acción no se puede deshacer.`)) return;
    
    try {
        await axios.delete(`${API_URL}/api/pastores/${id}`);
        cargarPastores(); // Recargar lista
    } catch (error) {
        alert("Error al eliminar");
    }
  };

  // Cambiar Estado Rápido (Habilitar/Suspender)
  const toggleEstado = async (pastor) => {
      const nuevoEstado = pastor.estado === 'HABILITADO' ? 'SUSPENDIDO' : 'HABILITADO';
      try {
          await axios.put(`${API_URL}/api/pastores/${pastor.id}`, { estado: nuevoEstado });
          cargarPastores(); // Recargar para ver el cambio visual
      } catch (error) { console.error(error); }
  };

  const cerrarSesion = () => { localStorage.clear(); navigate('/login'); };

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
          <button onClick={() => { setEditingId(null); setActiveTab('nuevo'); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'nuevo' ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}>
            <span>👤</span> {editingId ? 'Editando...' : 'Nuevo Pastor'}
          </button>
        </nav>
        <div className="p-4 border-t">
          <button onClick={cerrarSesion} className="w-full text-red-500 hover:bg-red-50 py-2 rounded-lg font-bold text-sm transition">Cerrar Sesión</button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-y-auto relative">
        <div className="md:hidden bg-white p-4 flex justify-between items-center shadow-sm sticky top-0 z-30">
          <h1 className="font-bold text-slate-800">MDS Admin</h1>
          <button onClick={cerrarSesion} className="text-xs text-red-500 font-bold">Salir</button>
        </div>
        
        <div className="p-6 lg:p-10 max-w-6xl mx-auto w-full">
          
          {/* VISTA LISTADO */}
          {activeTab === 'listado' && (
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <h2 className="text-2xl font-bold text-slate-800">Panel de Control</h2>
                <button onClick={() => { setEditingId(null); setActiveTab('nuevo'); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold shadow hover:bg-blue-700 transition">+ Nuevo</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastores.map(p => (
                  <div key={p.id} className={`bg-white rounded-2xl p-5 border shadow-sm hover:shadow-md transition-all group relative overflow-hidden ${p.estado === 'SUSPENDIDO' ? 'border-red-200 bg-red-50/30' : 'border-gray-100'}`}>
                     
                     {/* Etiqueta de Estado */}
                     <div className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-bold text-white rounded-bl-xl ${p.estado === 'HABILITADO' ? 'bg-green-500' : 'bg-red-500'}`}>
                        {p.estado}
                     </div>

                     <div className="flex items-center gap-4 mb-4">
                       <img src={p.fotoUrl || 'https://via.placeholder.com/100'} className={`w-14 h-14 rounded-full object-cover border-2 ${p.estado === 'HABILITADO' ? 'border-green-400' : 'border-red-400'} shadow-sm`} />
                       <div className="min-w-0">
                         <h4 className="font-bold text-slate-800 truncate">{p.apellido}, {p.nombre}</h4>
                         <p className="text-xs text-slate-500 font-mono">DNI: {p.dni}</p>
                         <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{p.rol}</span>
                       </div>
                     </div>
                     
                     {/* Botones de Acción */}
                     <div className="grid grid-cols-4 gap-2 pt-2 border-t border-gray-100">
                        <button onClick={() => toggleEstado(p)} title={p.estado === 'HABILITADO' ? 'Suspender' : 'Habilitar'} className={`col-span-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center ${p.estado === 'HABILITADO' ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                            {p.estado === 'HABILITADO' ? '⏸' : '▶'}
                        </button>
                        <button onClick={() => iniciarEdicion(p)} className="col-span-1 py-2 rounded-lg bg-slate-50 text-slate-600 text-xs font-bold hover:bg-slate-100 transition">✏️</button>
                        <a href={`/#/credencial/${p.id}`} target="_blank" rel="noreferrer" className="col-span-1 py-2 rounded-lg bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-100 transition flex items-center justify-center">🆔</a>
                        <button onClick={() => eliminarPastor(p.id, p.apellido)} className="col-span-1 py-2 rounded-lg bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 transition">🗑</button>
                     </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VISTA FORMULARIO */}
          {activeTab === 'nuevo' && (
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="bg-slate-50/50 p-6 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="font-bold text-xl text-slate-800">{editingId ? '✏️ Editando' : '👤 Nuevo Pastor'}</h3>
                  <button onClick={cancelarEdicion} className="text-sm text-slate-500 hover:text-red-500">Cancelar</button>
                </div>
                
                <form onSubmit={guardarPastor} className="p-6 space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Nombre" val={form.nombre} set={v => setForm({...form, nombre: v})} />
                    <Input label="Apellido" val={form.apellido} set={v => setForm({...form, apellido: v})} />
                  </div>
                  
                  {/* SELECCIÓN DE ROL Y ESTADO (NUEVO) */}
                  <div className="grid grid-cols-2 gap-4 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Rol de Usuario</label>
                        <select value={form.rol} onChange={e => setForm({...form, rol: e.target.value})} className="w-full p-2.5 rounded-lg border border-slate-200 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none">
                            <option value="USER">USUARIO (Normal)</option>
                            <option value="ADMIN">ADMINISTRADOR</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Estado</label>
                        <select value={form.estado} onChange={e => setForm({...form, estado: e.target.value})} className={`w-full p-2.5 rounded-lg border border-slate-200 text-sm font-bold outline-none ${form.estado === 'HABILITADO' ? 'text-green-600' : 'text-red-600'}`}>
                            <option value="HABILITADO">HABILITADO 🟢</option>
                            <option value="SUSPENDIDO">SUSPENDIDO 🔴</option>
                        </select>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input label="DNI (Usuario)" val={form.dni} set={v => setForm({...form, dni: v})} />
                    <div className="relative">
                       <Input label="Contraseña" type="password" val={form.password} set={v => setForm({...form, password: v})} required={false} />
                       <p className="text-[10px] text-gray-400 absolute top-0 right-0">{editingId ? 'Vacío = No cambiar' : 'Vacío = DNI'}</p>
                    </div>
                  </div>

                  <Input label="Iglesia" val={form.iglesiaNombre} set={v => setForm({...form, iglesiaNombre: v})} />
                  
                  <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Email" type="email" val={form.email} set={v => setForm({...form, email: v})} required={false} />
                      <Input label="Teléfono" type="tel" val={form.telefono} set={v => setForm({...form, telefono: v})} required={false} />
                    </div>
                    <Input label="Nombre Esposa" val={form.nombrePastora} set={v => setForm({...form, nombrePastora: v})} required={false} />
                  </div>

                  <div className="flex items-center gap-4 p-3 border border-dashed border-slate-300 rounded-xl">
                    {form.fotoUrl ? <img src={form.fotoUrl} className="w-12 h-12 rounded-full object-cover" /> : <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-xl">📷</div>}
                    <input type="file" onChange={handleFileUpload} disabled={uploading} className="block w-full text-xs text-slate-500"/>
                  </div>

                  <button type="submit" disabled={uploading} className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg transition">
                    {uploading ? '⏳ ...' : (editingId ? '💾 GUARDAR CAMBIOS' : '💾 CREAR PASTOR')}
                  </button>
                </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const Input = ({ label, val, set, type="text", required=true }) => (
  <div>
    <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">{label} {required && '*'}</label>
    <input type={type} value={val} onChange={e => set(e.target.value)} className="w-full border border-slate-200 bg-white p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium placeholder-slate-300" required={required} />
  </div>
);

export default Admin;