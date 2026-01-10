import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// Usamos iconos más sobrios y profesionales
import { LayoutDashboard, Users, PlusSquare, LogOut, Search, Edit, Trash, Power, X, Camera, ChevronRight } from 'lucide-react';

const Admin = () => {
  const [pastores, setPastores] = useState([]);
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('listado');
  const [editingId, setEditingId] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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
    try { const res = await axios.get(`${API_URL}/api/pastores`); setPastores(res.data); } catch (error) { console.error(error); }
  };

  // --- LÓGICA DEL FORMULARIO (Igual que antes) ---
  const iniciarEdicion = (pastor) => { setForm({ ...pastor, password: '' }); setEditingId(pastor.id); setActiveView('formulario'); setMobileMenuOpen(false); };
  const cancelarEdicion = () => { setForm({ nombre: '', apellido: '', dni: '', iglesiaNombre: '', email: '', telefono: '', nombrePastora: '', fotoUrl: '', password: '', rol: 'USER', estado: 'HABILITADO' }); setEditingId(null); setActiveView('listado'); };
  const handleFileUpload = async (e) => { /* ... (Lógica de subida igual) ... */ const file = e.target.files[0]; if (!file) return; setUploading(true); const formData = new FormData(); formData.append('foto', file); try { const res = await axios.post(`${API_URL}/api/upload`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }); setForm({ ...form, fotoUrl: res.data.url }); } catch (error) { alert("Error al subir"); } finally { setUploading(false); } };
  const guardarPastor = async (e) => { e.preventDefault(); try { if (editingId) { await axios.put(`${API_URL}/api/pastores/${editingId}`, form); alert('✅ Actualizado'); } else { await axios.post(`${API_URL}/api/pastores`, form); alert('✅ Creado'); } cancelarEdicion(); cargarPastores(); } catch (error) { alert('Error al guardar.'); } };
  const eliminarPastor = async (id, nombre) => { if(!window.confirm(`¿Eliminar a ${nombre}?`)) return; try { await axios.delete(`${API_URL}/api/pastores/${id}`); cargarPastores(); } catch (error) { alert("Error"); } };
  const toggleEstado = async (pastor) => { const nuevoEstado = pastor.estado === 'HABILITADO' ? 'SUSPENDIDO' : 'HABILITADO'; try { await axios.put(`${API_URL}/api/pastores/${pastor.id}`, { estado: nuevoEstado }); cargarPastores(); } catch (e) { console.error(e); } };
  const cerrarSesion = () => { localStorage.clear(); navigate('/login'); };

  // Filtrado
  const filteredPastores = pastores.filter(p => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.dni.includes(searchTerm)
  );

  return (
    <div className="flex h-screen bg-[var(--brand-bg)] overflow-hidden text-gray-800 font-sans">
      
      {/* --- SIDEBAR INSTITUCIONAL (Barra Lateral) --- */}
      <aside className={`bg-brand-primary text-white w-64 flex-shrink-0 flex flex-col transition-all duration-300 fixed md:static inset-y-0 left-0 z-50 shadow-2xl md:shadow-none transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="h-20 flex items-center px-6 font-black text-2xl tracking-wider border-b border-white/10">
           MDS <span className="text-brand-accent ml-1">ADMIN</span>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2">
           <SidebarItem icon={<Users />} label="Directorio" active={activeView === 'listado'} onClick={() => {setActiveView('listado'); setMobileMenuOpen(false)}} />
           <SidebarItem icon={<PlusSquare />} label="Nuevo Registro" active={activeView === 'formulario' && !editingId} onClick={() => {setEditingId(null); setActiveView('formulario'); setMobileMenuOpen(false)}} />
        </nav>

        <div className="p-4 border-t border-white/10">
           <button onClick={cerrarSesion} className="flex items-center gap-3 text-white/70 hover:text-white transition w-full px-4 py-3 rounded-lg hover:bg-white/5 font-medium">
             <LogOut size={20} /> Cerrar Sesión
           </button>
        </div>
      </aside>
      
      {/* Overlay para móvil */}
      {mobileMenuOpen && <div onClick={() => setMobileMenuOpen(false)} className="fixed inset-0 bg-black/50 z-40 md:hidden"></div>}

      {/* --- CONTENIDO PRINCIPAL --- */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Header Superior */}
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-6 lg:px-10">
           <div className="flex items-center gap-4">
              <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2 text-gray-600"><LayoutDashboard /></button>
              <h1 className="text-2xl font-bold text-gray-800 hidden md:block">
                {activeView === 'listado' ? 'Gestión de Pastores' : (editingId ? 'Editando Pastor' : 'Alta de Pastor')}
              </h1>
           </div>
           
           {activeView === 'listado' && (
             <div className="relative">
               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
               <input type="text" placeholder="Buscar por nombre o DNI..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                 className="pl-10 pr-4 py-2 border border-gray-300 rounded-full text-sm focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none w-64 lg:w-80 transition"
               />
             </div>
           )}
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-10">
           
           {/* VISTA: LISTADO */}
           {activeView === 'listado' && (
             <div className="max-w-5xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                   {filteredPastores.map(p => (
                     <div key={p.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
                       <div className="p-5 flex items-start gap-4 relative">
                          {/* Estado y Rol */}
                          <div className="absolute top-4 right-4 flex flex-col items-end gap-1">
                             <span className={`h-2.5 w-2.5 rounded-full ${p.estado === 'HABILITADO' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                             {p.rol === 'ADMIN' && <span className="text-[10px] font-bold text-brand-primary bg-blue-50 px-1.5 rounded border border-blue-100">ADMIN</span>}
                          </div>

                          <img src={p.fotoUrl || 'https://via.placeholder.com/150'} className="w-16 h-16 rounded-full object-cover border-4 border-brand-bg shadow-sm" />
                          <div className="flex-1 min-w-0 pt-1">
                             <h3 className="text-lg font-bold text-gray-900 truncate capitalize leading-tight">{p.apellido}, {p.nombre}</h3>
                             <p className="text-sm text-gray-500 truncate">{p.iglesiaNombre || 'Sin iglesia asignada'}</p>
                             <p className="text-xs font-mono text-gray-400 mt-1">DNI: {p.dni}</p>
                          </div>
                       </div>
                       
                       {/* Barra de Acciones */}
                       <div className="bg-gray-50 border-t border-gray-100 grid grid-cols-4 divide-x divide-gray-100">
                          <ActionButton icon={<Edit size={16} />} label="Editar" onClick={() => iniciarEdicion(p)} color="text-blue-600" />
                          <ActionButton icon={<Power size={16} />} label={p.estado === 'HABILITADO' ? 'Suspender' : 'Habilitar'} onClick={() => toggleEstado(p)} color={p.estado === 'HABILITADO' ? 'text-orange-500' : 'text-green-600'} />
                          <ActionButton icon={<Trash size={16} />} label="Borrar" onClick={() => eliminarPastor(p.id, p.apellido)} color="text-red-600" />
                          <a href={`/#/credencial/${p.id}`} target="_blank" className="flex flex-col items-center justify-center py-3 hover:bg-gray-100 transition group/btn text-brand-accent">
                             <ChevronRight size={20} className="group-hover/btn:translate-x-1 transition-transform"/>
                          </a>
                       </div>
                     </div>
                   ))}
                </div>
                {filteredPastores.length === 0 && <p className="text-center text-gray-500 py-10">No se encontraron resultados.</p>}
             </div>
           )}

           {/* VISTA: FORMULARIO */}
           {activeView === 'formulario' && (
             <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                   <div>
                     <h2 className="text-xl font-bold text-gray-900">{editingId ? 'Modificar Datos' : 'Nuevo Registro'}</h2>
                     <p className="text-sm text-gray-500">Complete la información institucional del pastor.</p>
                   </div>
                   <button onClick={cancelarEdicion} className="p-2 bg-white border border-gray-200 rounded-full text-gray-400 hover:text-gray-700 transition"><X size={20}/></button>
                </div>
                
                <form onSubmit={guardarPastor} className="p-8 space-y-6">
                  {/* Foto y Datos Principales */}
                  <div className="flex flex-col md:flex-row gap-8 items-start">
                     {/* Subida de Foto */}
                     <div className="flex-shrink-0 w-full md:w-auto flex flex-col items-center gap-3">
                        <div className="relative group">
                           <img src={form.fotoUrl || 'https://via.placeholder.com/150'} className="w-32 h-32 rounded-full object-cover border-4 border-gray-100 shadow-md group-hover:border-brand-accent transition" />
                           <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition cursor-pointer">
                             <Camera size={30} />
                             <input type="file" onChange={handleFileUpload} disabled={uploading} className="hidden"/>
                           </label>
                        </div>
                        <p className="text-xs font-bold text-gray-400 uppercase">{uploading ? 'Subiendo...' : 'Foto de Perfil'}</p>
                     </div>

                     {/* Campos Principales */}
                     <div className="flex-1 space-y-4 w-full">
                        <div className="grid grid-cols-2 gap-4">
                          <Input label="Nombre" val={form.nombre} set={v => setForm({...form, nombre: v})} />
                          <Input label="Apellido" val={form.apellido} set={v => setForm({...form, apellido: v})} />
                        </div>
                        <Input label="DNI (Usuario)" val={form.dni} set={v => setForm({...form, dni: v})} type="number" />
                        <Input label="Iglesia/Congregación" val={form.iglesiaNombre} set={v => setForm({...form, iglesiaNombre: v})} />
                     </div>
                  </div>
                  
                  <Separator label="Seguridad y Acceso" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-brand-bg p-4 rounded-xl border border-gray-200/50">
                     <Select label="Rol de Usuario" val={form.rol} set={v => setForm({...form, rol: v})} options={[{v:'USER',l:'Usuario Normal'}, {v:'ADMIN',l:'Administrador'}]} />
                     <Select label="Estado de Credencial" val={form.estado} set={v => setForm({...form, estado: v})} options={[{v:'HABILITADO',l:'Activo / Habilitado'}, {v:'SUSPENDIDO',l:'Suspendido'}]} />
                     <Input label="Contraseña" type="password" val={form.password} set={v => setForm({...form, password: v})} required={false} placeholder={editingId ? "••••••" : "DNI por defecto"} />
                  </div>
                  
                  <Separator label="Información Adicional" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input label="Teléfono / WhatsApp" type="tel" val={form.telefono} set={v => setForm({...form, telefono: v})} required={false} />
                      <Input label="Correo Electrónico" type="email" val={form.email} set={v => setForm({...form, email: v})} required={false} />
                      <Input label="Nombre del Cónyuge" val={form.nombrePastora} set={v => setForm({...form, nombrePastora: v})} required={false} />
                  </div>

                  <div className="pt-6 flex gap-4 justify-end">
                     <button type="button" onClick={cancelarEdicion} className="px-6 py-3 border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition">Cancelar</button>
                     <button type="submit" disabled={uploading || !form.nombre || !form.apellido || !form.dni} className="px-8 py-3 bg-brand-primary text-white font-bold rounded-xl shadow-lg hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                       {uploading ? 'Procesando...' : (editingId ? 'Guardar Cambios' : 'Registrar Pastor')}
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

// --- Componentes Auxiliares Estilizados ---
const SidebarItem = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group ${active ? 'bg-white text-brand-primary shadow-lg font-bold' : 'text-white/70 hover:bg-white/10 hover:text-white font-medium'}`}>
    <span className={`${active ? 'text-brand-accent' : 'text-white/50 group-hover:text-white'} transition-colors`}>{icon}</span>
    {label}
  </button>
);

const ActionButton = ({ icon, label, onClick, color }) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center py-3 hover:bg-gray-100 transition ${color} group`}>
    <span className="group-hover:scale-110 transition-transform">{icon}</span>
    <span className="text-[10px] font-bold mt-1 opacity-70">{label}</span>
  </button>
);

const Input = ({ label, val, set, type="text", required=true, placeholder="" }) => (
  <div className="w-full">
    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wider">{label} {required && <span className="text-brand-accent">*</span>}</label>
    <input type={type} value={val} onChange={e => set(e.target.value)} className="w-full border-2 border-gray-200 bg-white px-4 py-3 rounded-xl focus:ring-0 focus:border-brand-primary outline-none text-sm font-medium transition text-gray-700 placeholder-gray-300" placeholder={placeholder} required={required} />
  </div>
);

const Select = ({ label, val, set, options }) => (
    <div className="w-full">
      <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wider">{label}</label>
      <select value={val} onChange={e => set(e.target.value)} className="w-full border-2 border-gray-200 bg-white px-4 py-3 rounded-xl focus:ring-0 focus:border-brand-primary outline-none text-sm font-bold text-gray-700 transition appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23007CB2%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:12px_12px] bg-[right_1rem_center] pr-10">
          {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </div>
);

const Separator = ({ label }) => (
    <div className="flex items-center gap-4 pt-4 pb-2">
        <div className="h-px bg-gray-200 flex-1"></div>
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</span>
        <div className="h-px bg-gray-200 flex-1"></div>
    </div>
);

export default Admin;