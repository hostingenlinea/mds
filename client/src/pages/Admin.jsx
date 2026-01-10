import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Church, CreditCard, Book, Bell, Search, LogOut, Plus, Trash2, Edit3, Power, X, User } from 'lucide-react';

const Admin = () => {
  const [pastores, setPastores] = useState([]);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('listado'); 
  const [editingId, setEditingId] = useState(null);
  
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

  const cargarPastores = async () => { try { const res = await axios.get(`${API_URL}/api/pastores`); setPastores(res.data); } catch (e) { console.error(e); } };

  // --- LÓGICA ---
  const iniciarEdicion = (p) => { setForm({ ...p, password: '' }); setEditingId(p.id); setActiveTab('nuevo'); };
  const cancelarEdicion = () => { setForm({ nombre: '', apellido: '', dni: '', iglesiaNombre: '', email: '', telefono: '', nombrePastora: '', fotoUrl: '', password: '', rol: 'USER', estado: 'HABILITADO' }); setEditingId(null); setActiveTab('listado'); };
  const handleFileUpload = async (e) => { const file = e.target.files[0]; if (!file) return; setUploading(true); const formData = new FormData(); formData.append('foto', file); try { const res = await axios.post(`${API_URL}/api/upload`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }); setForm({ ...form, fotoUrl: res.data.url }); } catch (error) { alert("Error al subir"); } finally { setUploading(false); } };
  const guardarPastor = async (e) => { e.preventDefault(); try { if (editingId) await axios.put(`${API_URL}/api/pastores/${editingId}`, form); else await axios.post(`${API_URL}/api/pastores`, form); cancelarEdicion(); cargarPastores(); alert(editingId ? 'Actualizado' : 'Creado'); } catch (error) { alert('Error al guardar'); } };
  const eliminarPastor = async (id) => { if(confirm('¿Eliminar?')) { await axios.delete(`${API_URL}/api/pastores/${id}`); cargarPastores(); } };
  const toggleEstado = async (p) => { await axios.put(`${API_URL}/api/pastores/${p.id}`, { estado: p.estado === 'HABILITADO' ? 'SUSPENDIDO' : 'HABILITADO' }); cargarPastores(); };
  const cerrarSesion = () => { localStorage.clear(); navigate('/login'); };

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      
      {/* --- SIDEBAR OSCURO (Estilo MDS Global) --- */}
      <aside className="w-64 bg-mds-dark text-white flex-shrink-0 flex flex-col transition-all duration-300 border-r border-white/5">
        {/* Logo Area */}
        <div className="h-20 flex items-center gap-3 px-6">
           <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-lg shadow-lg shadow-blue-500/20">M</div>
           <span className="font-bold text-lg tracking-tight text-white">MDS Global</span>
        </div>

        {/* Menú Principal */}
        <nav className="flex-1 px-3 py-6 space-y-1">
           <SidebarItem icon={<LayoutDashboard size={20}/>} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
           <SidebarItem icon={<Users size={20}/>} label="Pastores" active={activeTab === 'listado' || activeTab === 'nuevo'} onClick={() => setActiveTab('listado')} />
           <SidebarItem icon={<Church size={20}/>} label="Iglesias" active={false} />
           <SidebarItem icon={<CreditCard size={20}/>} label="Credenciales" active={false} />
           <SidebarItem icon={<Book size={20}/>} label="Libro de Actas" active={false} />
        </nav>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-white/5 bg-black/20">
           <button onClick={cerrarSesion} className="flex items-center gap-3 text-gray-400 hover:text-white transition px-4 py-2 w-full text-sm font-medium">
             <LogOut size={18} /> Cerrar Sesión
           </button>
        </div>
      </aside>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#f8fafc]">
        
        {/* Header Superior */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 flex-shrink-0 shadow-sm z-10">
           {/* Buscador */}
           <div className="relative w-96 hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" placeholder="Buscar pastores, iglesias..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition" />
           </div>
           
           {/* Perfil */}
           <div className="flex items-center gap-4">
              <button className="text-gray-500 hover:text-gray-700 relative p-2 rounded-full hover:bg-gray-100 transition">
                 <Bell size={20} />
                 <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              </button>
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                 <div className="text-right hidden md:block">
                    <p className="font-bold text-gray-700 text-sm leading-none">Admin Central</p>
                    <p className="text-xs text-gray-400 mt-1">Sede Global</p>
                 </div>
                 <div className="h-9 w-9 bg-mds-dark rounded-full flex items-center justify-center text-white font-bold border border-gray-200 shadow-sm">
                    A
                 </div>
              </div>
           </div>
        </header>

        {/* Área de Trabajo */}
        <div className="flex-1 overflow-y-auto p-8">
           
           {/* VISTA: DASHBOARD */}
           {activeTab === 'dashboard' && (
             <div className="space-y-6 animate-in fade-in duration-300">
                <h1 className="text-2xl font-bold text-gray-800">Panel Central</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                   <StatCard icon={<Users className="text-blue-600"/>} label="Total Pastores" value={pastores.length} />
                   <StatCard icon={<Church className="text-emerald-600"/>} label="Iglesias" value="1" />
                   <StatCard icon={<Users className="text-orange-600"/>} label="Suspendidos" value={pastores.filter(p=>p.estado==='SUSPENDIDO').length} />
                </div>
             </div>
           )}

           {/* VISTA: LISTADO */}
           {activeTab === 'listado' && (
             <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex justify-between items-center">
                   <h1 className="text-2xl font-bold text-gray-800">Pastores</h1>
                   <button onClick={() => {setEditingId(null); setActiveTab('nuevo')}} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-lg shadow-blue-500/20 transition">
                      <Plus size={18} /> Nuevo Registro
                   </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                   {pastores.map(p => (
                      <div key={p.id} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                         <div className={`absolute top-0 left-0 w-1 h-full ${p.estado === 'HABILITADO' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                         
                         <div className="flex items-start justify-between mb-4 pl-3">
                            <div className="flex gap-4">
                               <img src={p.fotoUrl || 'https://via.placeholder.com/100'} className="w-12 h-12 rounded-full object-cover bg-gray-50 border border-gray-100" />
                               <div>
                                  <h3 className="font-bold text-gray-900 text-lg leading-tight capitalize">{p.apellido}, {p.nombre}</h3>
                                  <p className="text-sm text-gray-500">{p.iglesiaNombre}</p>
                               </div>
                            </div>
                         </div>
                         
                         <div className="pl-3 mb-4 grid grid-cols-2 gap-2">
                             <div className="bg-gray-50 px-2 py-1 rounded text-xs text-gray-500 font-mono">DNI: {p.dni}</div>
                             <div className={`px-2 py-1 rounded text-xs font-bold uppercase text-center ${p.estado === 'HABILITADO' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                                {p.estado}
                             </div>
                         </div>

                         <div className="flex gap-2 pt-3 border-t border-gray-50 pl-3">
                            <button onClick={() => iniciarEdicion(p)} className="flex-1 py-2 text-xs font-bold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition">EDITAR</button>
                            <button onClick={() => toggleEstado(p)} className="flex-1 py-2 text-xs font-bold text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition">{p.estado === 'HABILITADO' ? 'SUSPENDER' : 'ACTIVAR'}</button>
                            <button onClick={() => eliminarPastor(p.id)} className="px-3 py-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 size={16}/></button>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
           )}

           {/* VISTA: FORMULARIO */}
           {activeTab === 'nuevo' && (
             <div className="max-w-3xl mx-auto animate-in slide-in-from-right duration-300">
                <button onClick={cancelarEdicion} className="mb-4 text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1">← Volver</button>
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="px-8 py-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <div>
                            <h2 className="font-bold text-xl text-gray-800">{editingId ? 'Editar Registro' : 'Nuevo Registro'}</h2>
                            <p className="text-sm text-gray-500 mt-1">Complete la información del pastor.</p>
                        </div>
                        <button onClick={cancelarEdicion} className="p-2 bg-white border border-gray-200 rounded-full text-gray-400 hover:text-red-500 transition"><X size={20}/></button>
                    </div>
                    
                    <form onSubmit={guardarPastor} className="p-8 space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <Input label="Nombre" val={form.nombre} set={v=>setForm({...form, nombre: v})} />
                            <Input label="Apellido" val={form.apellido} set={v=>setForm({...form, apellido: v})} />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <Input label="DNI (Usuario)" val={form.dni} set={v=>setForm({...form, dni: v})} />
                            <Input label="Iglesia" val={form.iglesiaNombre} set={v=>setForm({...form, iglesiaNombre: v})} />
                        </div>
                        
                        <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-100 flex items-center gap-4">
                             <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center border border-gray-200 overflow-hidden">
                                {form.fotoUrl ? <img src={form.fotoUrl} className="w-full h-full object-cover"/> : <User className="text-gray-300"/>}
                             </div>
                             <div>
                                <label className="block text-sm font-bold text-blue-700 cursor-pointer hover:underline">
                                    Subir Foto de Perfil
                                    <input type="file" onChange={handleFileUpload} className="hidden" disabled={uploading}/>
                                </label>
                                <p className="text-xs text-gray-400">Recomendado: 400x400px</p>
                             </div>
                        </div>

                        <div className="flex justify-end pt-4 gap-3">
                            <button type="button" onClick={cancelarEdicion} className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition">Cancelar</button>
                            <button type="submit" disabled={uploading} className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition disabled:opacity-50">
                                {uploading ? 'Guardando...' : 'Guardar Datos'}
                            </button>
                        </div>
                    </form>
                </div>
             </div>
           )}

        </div>
      </main>
    </div>
  );
};

// Componentes
const SidebarItem = ({ icon, label, active, onClick }) => (
   <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mx-2 mb-1 transition-all text-sm font-medium ${active ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' : 'text-mds-text hover:bg-white/5 hover:text-white'}`} style={{width: 'calc(100% - 16px)'}}>
      {icon} {label}
   </button>
);

const StatCard = ({ icon, label, value }) => (
   <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 hover:shadow-md transition">
      <div className="p-3 bg-gray-50 rounded-lg">{icon}</div>
      <div>
         <p className="text-sm text-gray-500 font-medium">{label}</p>
         <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
   </div>
);

const Input = ({ label, val, set }) => (
   <div>
      <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">{label}</label>
      <input type="text" value={val} onChange={e=>set(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" />
   </div>
);

export default Admin;