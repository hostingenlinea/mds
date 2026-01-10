import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Church, CreditCard, Book, Bell, Search, LogOut, Plus, Trash2, Edit3, Power, MoreVertical, X, User } from 'lucide-react';

const Admin = () => {
  const [pastores, setPastores] = useState([]);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('listado'); // 'listado', 'nuevo'
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

  // --- LÓGICA (Igual que antes) ---
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
      <aside className="w-64 bg-mds-dark text-white flex-shrink-0 flex flex-col transition-all duration-300">
        {/* Logo Area */}
        <div className="h-16 flex items-center gap-3 px-6 mt-4">
           <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-lg">M</div>
           <span className="font-bold text-lg tracking-tight">MDS Global</span>
        </div>

        {/* Menú Principal */}
        <nav className="flex-1 px-4 py-6 space-y-1">
           <SidebarItem icon={<LayoutDashboard size={20}/>} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
           <SidebarItem icon={<Users size={20}/>} label="Pastores" active={activeTab === 'listado' || activeTab === 'nuevo'} onClick={() => setActiveTab('listado')} />
           <SidebarItem icon={<Church size={20}/>} label="Iglesias" active={false} />
           <SidebarItem icon={<CreditCard size={20}/>} label="Credenciales" active={false} />
           <SidebarItem icon={<Book size={20}/>} label="Libro de Actas" active={false} />
        </nav>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-white/10">
           <button onClick={cerrarSesion} className="flex items-center gap-3 text-gray-400 hover:text-white transition px-4 py-2 w-full text-sm font-medium">
             <LogOut size={18} /> Cerrar Sesión
           </button>
        </div>
      </aside>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Header Superior (Buscador y Perfil) */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 flex-shrink-0">
           {/* Buscador */}
           <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" placeholder="Buscar pastores, iglesias..." className="w-full pl-10 pr-4 py-2 bg-gray-100 border-transparent rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition" />
           </div>
           
           {/* Iconos Derecha */}
           <div className="flex items-center gap-4">
              <button className="text-gray-500 hover:text-gray-700 relative">
                 <Bell size={20} />
                 <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="h-8 w-8 bg-gray-200 rounded-full overflow-hidden border border-gray-300">
                 <img src="https://via.placeholder.com/100" alt="Admin" className="w-full h-full object-cover" />
              </div>
              <div className="text-sm">
                 <p className="font-bold text-gray-700 leading-none">Admin Central</p>
                 <p className="text-xs text-gray-400">Sede Global</p>
              </div>
           </div>
        </header>

        {/* Área de Trabajo Scrollable */}
        <div className="flex-1 overflow-y-auto p-8 bg-[#f8fafc]">
           
           {/* VISTA: DASHBOARD (Resumen) */}
           {activeTab === 'dashboard' && (
             <div className="space-y-6 animate-in fade-in">
                <h1 className="text-2xl font-bold text-gray-800">Panel Central</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                   <StatCard icon={<Users className="text-blue-600"/>} label="Total Pastores" value={pastores.length} />
                   <StatCard icon={<Church className="text-green-600"/>} label="Iglesias" value="1" />
                   <StatCard icon={<Users className="text-orange-600"/>} label="Suspendidos" value={pastores.filter(p=>p.estado==='SUSPENDIDO').length} />
                </div>
                <div className="mt-8 p-10 bg-white rounded-xl border border-gray-100 text-center text-gray-400">
                   <p>Gráficos de tendencia próximamente...</p>
                </div>
             </div>
           )}

           {/* VISTA: LISTADO DE PASTORES */}
           {activeTab === 'listado' && (
             <div className="space-y-6 animate-in fade-in">
                <div className="flex justify-between items-center">
                   <h1 className="text-2xl font-bold text-gray-800">Gestión de Pastores</h1>
                   <button onClick={() => {setEditingId(null); setActiveTab('nuevo')}} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-sm transition">
                      <Plus size={18} /> Nuevo Pastor
                   </button>
                </div>

                {/* Tabla/Grid Limpia */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                   {pastores.map(p => (
                      <div key={p.id} className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition group">
                         <div className="flex items-start justify-between mb-4">
                            <div className="flex gap-4">
                               <img src={p.fotoUrl || 'https://via.placeholder.com/100'} className="w-12 h-12 rounded-full object-cover bg-gray-100" />
                               <div>
                                  <h3 className="font-bold text-gray-900">{p.nombre} {p.apellido}</h3>
                                  <p className="text-sm text-gray-500">{p.iglesiaNombre}</p>
                               </div>
                            </div>
                            <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${p.estado === 'HABILITADO' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                               {p.estado}
                            </div>
                         </div>
                         <div className="text-xs text-gray-400 font-mono mb-4 pl-16">
                            ID: {p.dni}
                         </div>
                         <div className="flex gap-2 border-t border-gray-100 pt-3">
                            <button onClick={() => iniciarEdicion(p)} className="flex-1 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 rounded hover:bg-gray-100">Editar</button>
                            <button onClick={() => toggleEstado(p)} className="flex-1 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 rounded hover:bg-gray-100">{p.estado === 'HABILITADO' ? 'Suspender' : 'Activar'}</button>
                            <button onClick={() => eliminarPastor(p.id)} className="px-3 py-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"><Trash2 size={16}/></button>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
           )}

           {/* VISTA: FORMULARIO */}
           {activeTab === 'nuevo' && (
             <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-in slide-in-from-right">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                   <h2 className="font-bold text-gray-800">{editingId ? 'Editar Registro' : 'Nuevo Registro'}</h2>
                   <button onClick={cancelarEdicion}><X size={20} className="text-gray-400 hover:text-gray-600"/></button>
                </div>
                <form onSubmit={guardarPastor} className="p-8 space-y-6">
                   <div className="grid grid-cols-2 gap-6">
                      <Input label="Nombre" val={form.nombre} set={v=>setForm({...form, nombre: v})} />
                      <Input label="Apellido" val={form.apellido} set={v=>setForm({...form, apellido: v})} />
                   </div>
                   <Input label="DNI (Usuario)" val={form.dni} set={v=>setForm({...form, dni: v})} />
                   <Input label="Iglesia" val={form.iglesiaNombre} set={v=>setForm({...form, iglesiaNombre: v})} />
                   
                   {/* Foto */}
                   <div className="p-4 border border-dashed border-gray-300 rounded-lg flex items-center gap-4">
                      {form.fotoUrl ? <img src={form.fotoUrl} className="w-12 h-12 rounded-full object-cover"/> : <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center"><User size={20} className="text-gray-400"/></div>}
                      <div className="flex-1">
                         <label className="text-sm font-medium text-blue-600 cursor-pointer hover:underline">Subir foto de perfil <input type="file" onChange={handleFileUpload} className="hidden" disabled={uploading}/></label>
                         <p className="text-xs text-gray-400">JPG, PNG max 2MB</p>
                      </div>
                   </div>

                   <div className="flex justify-end gap-3 pt-4">
                      <button type="button" onClick={cancelarEdicion} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">Cancelar</button>
                      <button type="submit" disabled={uploading} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm transition">
                         {uploading ? 'Guardando...' : 'Guardar Datos'}
                      </button>
                   </div>
                </form>
             </div>
           )}

        </div>
      </main>
    </div>
  );
};

// Componentes Estéticos
const SidebarItem = ({ icon, label, active, onClick }) => (
   <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mx-2 mb-1 transition-colors text-sm font-medium ${active ? 'bg-blue-600 text-white shadow-md' : 'text-mds-text hover:bg-white/5 hover:text-white'}`} style={{width: 'calc(100% - 16px)'}}>
      {icon} {label}
   </button>
);

const StatCard = ({ icon, label, value }) => (
   <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
      <div className="p-3 bg-gray-50 rounded-lg">{icon}</div>
      <div>
         <p className="text-sm text-gray-500">{label}</p>
         <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
   </div>
);

const Input = ({ label, val, set }) => (
   <div>
      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{label}</label>
      <input type="text" value={val} onChange={e=>set(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
   </div>
);

export default Admin;