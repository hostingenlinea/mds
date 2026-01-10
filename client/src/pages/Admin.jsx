import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Menu, User, LogOut, X, Search, Bell, List, PlusCircle, Trash2, Edit } from 'lucide-react';

const Admin = () => {
  const [pastores, setPastores] = useState([]);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('listado');
  const [editingId, setEditingId] = useState(null);
  
  // Estado para menús móviles
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // Formulario
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
    setForm({ ...pastor, password: '' }); // Cargar datos
    setEditingId(pastor.id);
    setActiveTab('nuevo');
    setSidebarOpen(false); // Cerrar menú al seleccionar
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

  const eliminarPastor = async (id, nombre) => {
    if(!window.confirm(`¿Eliminar a ${nombre}?`)) return;
    try { await axios.delete(`${API_URL}/api/pastores/${id}`); cargarPastores(); } catch (error) { alert("Error al eliminar"); }
  };

  const toggleEstado = async (pastor) => {
      const nuevoEstado = pastor.estado === 'HABILITADO' ? 'SUSPENDIDO' : 'HABILITADO';
      try { await axios.put(`${API_URL}/api/pastores/${pastor.id}`, { estado: nuevoEstado }); cargarPastores(); } catch (e) { console.error(e); }
  };

  const cerrarSesion = () => { localStorage.clear(); navigate('/login'); };

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      
      {/* --- HEADER ESTILO APP (AZUL) --- */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-blue-700 text-white flex items-center justify-between px-4 z-50 shadow-md">
        
        {/* Izquierda: Menú Hamburguesa */}
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-blue-600 rounded-full transition">
          <Menu size={28} strokeWidth={2.5} />
        </button>

        {/* Centro: Logo */}
        <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight">MDS <span className="font-light opacity-80">Admin</span></span>
        </div>

        {/* Derecha: Iconos Acción y Perfil */}
        <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-blue-600 rounded-full transition">
               <Search size={24} />
            </button>
            <div className="relative">
                <button onClick={() => setProfileMenuOpen(!profileMenuOpen)} className="p-2 hover:bg-blue-600 rounded-full transition">
                  <User size={24} />
                </button>
                
                {/* Menú Dropdown de Perfil */}
                {profileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 text-gray-800 animate-in fade-in zoom-in duration-200 origin-top-right">
                        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                            <p className="text-sm font-bold text-gray-900">Administrador</p>
                            <p className="text-xs text-gray-500 truncate">admin@mds.com</p>
                        </div>
                        <button onClick={cerrarSesion} className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium">
                            <LogOut size={16} /> Cerrar Sesión
                        </button>
                    </div>
                )}
            </div>
        </div>
      </header>

      {/* --- SIDEBAR (Menú Lateral Deslizable) --- */}
      {/* Overlay Oscuro */}
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"></div>}
      
      {/* Panel Lateral */}
      <aside className={`fixed inset-y-0 left-0 w-72 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:shadow-none border-r border-gray-100 pt-16 md:pt-0`}>
         <div className="p-6 hidden md:block">
            <h1 className="text-2xl font-black text-slate-800">MDS Admin</h1>
         </div>
         <nav className="p-4 space-y-2">
            <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Menú Principal</p>
            <button onClick={() => { setActiveTab('listado'); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'listado' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                <List size={20} /> Listado General
            </button>
            <button onClick={() => { setEditingId(null); setActiveTab('nuevo'); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'nuevo' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                <PlusCircle size={20} /> Nuevo Registro
            </button>
         </nav>
      </aside>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <main className="flex-1 flex flex-col overflow-y-auto pt-16 bg-gray-50">
        <div className="p-6 max-w-6xl mx-auto w-full">
          
          {/* VISTA: LISTADO */}
          {activeTab === 'listado' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                 <h2 className="text-xl font-bold text-slate-800">Pastores ({pastores.length})</h2>
                 <button onClick={() => { setEditingId(null); setActiveTab('nuevo'); }} className="bg-blue-600 text-white p-3 rounded-full shadow-lg md:hidden">
                    <PlusCircle size={24} />
                 </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pastores.map(p => (
                  <div key={p.id} className={`bg-white rounded-xl p-4 border shadow-sm relative overflow-hidden ${p.estado === 'SUSPENDIDO' ? 'border-red-200 bg-red-50/20' : 'border-gray-100'}`}>
                     <div className={`absolute top-3 right-3 w-3 h-3 rounded-full ${p.estado === 'HABILITADO' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                     
                     <div className="flex items-center gap-4 mb-4">
                       <img src={p.fotoUrl || 'https://via.placeholder.com/100'} className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm" />
                       <div className="min-w-0">
                         <h4 className="font-bold text-slate-800 truncate text-lg">{p.apellido}</h4>
                         <p className="text-sm text-slate-600">{p.nombre}</p>
                         <p className="text-xs text-slate-400 font-mono mt-1">{p.dni}</p>
                       </div>
                     </div>
                     
                     {/* Botones Acción Estilo App */}
                     <div className="flex gap-2 border-t pt-3">
                        <button onClick={() => iniciarEdicion(p)} className="flex-1 py-2 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold flex justify-center items-center gap-1 hover:bg-slate-100"><Edit size={14}/> Editar</button>
                        <button onClick={() => toggleEstado(p)} className={`flex-1 py-2 rounded-lg text-xs font-bold flex justify-center items-center gap-1 ${p.estado==='HABILITADO'?'bg-orange-50 text-orange-600':'bg-green-50 text-green-600'}`}>
                            {p.estado === 'HABILITADO' ? 'Pausar' : 'Activar'}
                        </button>
                        <button onClick={() => eliminarPastor(p.id, p.apellido)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100"><Trash2 size={16}/></button>
                     </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VISTA: FORMULARIO */}
          {activeTab === 'nuevo' && (
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="font-bold text-lg text-slate-800">{editingId ? 'Editar Pastor' : 'Nuevo Registro'}</h3>
                  <button onClick={cancelarEdicion} className="p-1 hover:bg-slate-200 rounded-full"><X size={20} className="text-slate-500"/></button>
                </div>
                
                <form onSubmit={guardarPastor} className="p-6 space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Nombre" val={form.nombre} set={v => setForm({...form, nombre: v})} />
                    <Input label="Apellido" val={form.apellido} set={v => setForm({...form, apellido: v})} />
                  </div>
                  
                  {/* Selector Rol/Estado */}
                  <div className="flex gap-4 p-3 bg-blue-50/50 rounded-xl border border-blue-100/50">
                     <div className="flex-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Rol</label>
                        <select value={form.rol} onChange={e => setForm({...form, rol: e.target.value})} className="w-full bg-transparent font-bold text-slate-700 outline-none mt-1">
                            <option value="USER">Usuario</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                     </div>
                     <div className="w-px bg-blue-200"></div>
                     <div className="flex-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Estado</label>
                        <select value={form.estado} onChange={e => setForm({...form, estado: e.target.value})} className={`w-full bg-transparent font-bold outline-none mt-1 ${form.estado==='HABILITADO'?'text-green-600':'text-red-600'}`}>
                            <option value="HABILITADO">Activo</option>
                            <option value="SUSPENDIDO">Suspendido</option>
                        </select>
                     </div>
                  </div>

                  <Input label="DNI (Usuario)" val={form.dni} set={v => setForm({...form, dni: v})} />
                  <Input label="Contraseña (Opcional)" type="password" val={form.password} set={v => setForm({...form, password: v})} required={false} placeholder={editingId ? "Sin cambios" : "Igual al DNI"} />
                  <Input label="Iglesia" val={form.iglesiaNombre} set={v => setForm({...form, iglesiaNombre: v})} />
                  
                  {/* Foto */}
                  <div className="flex items-center gap-4 p-3 border border-dashed border-slate-300 rounded-xl bg-slate-50">
                    {form.fotoUrl ? <img src={form.fotoUrl} className="w-12 h-12 rounded-full object-cover" /> : <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center"><User size={20} className="text-slate-300"/></div>}
                    <input type="file" onChange={handleFileUpload} disabled={uploading} className="text-xs text-slate-500 w-full file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-100 file:text-blue-700"/>
                  </div>

                  <button type="submit" disabled={uploading} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition active:scale-[0.98]">
                    {uploading ? 'Guardando...' : 'GUARDAR DATOS'}
                  </button>
                </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const Input = ({ label, val, set, type="text", required=true, placeholder="" }) => (
  <div>
    <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">{label}</label>
    <input type={type} value={val} onChange={e => set(e.target.value)} className="w-full border border-slate-200 bg-white p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium" placeholder={placeholder} required={required} />
  </div>
);

export default Admin;