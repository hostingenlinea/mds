import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Church, CreditCard, Book, Bell, Search, LogOut, Plus, Trash2, Edit3, Power, X, User, Menu, ChevronDown, Printer, FileText, UploadCloud } from 'lucide-react';

const Admin = () => {
  const [pastores, setPastores] = useState([]);
  const [actas, setActas] = useState([]); 
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('listado'); 
  const [editingId, setEditingId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Formulario Pastor
  const [form, setForm] = useState({ 
    nombre: '', apellido: '', dni: '', iglesiaNombre: '', 
    email: '', telefono: '', nombrePastora: '', fotoUrl: '',
    password: '', rol: 'USER', estado: 'HABILITADO'
  });

  // Formulario Acta (Ahora incluye iglesiaNombre)
  const [formActa, setFormActa] = useState({ titulo: '', contenido: '', iglesiaNombre: '', archivoUrl: '' });

  const [uploading, setUploading] = useState(false); 
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'; 

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.rol !== 'ADMIN') { navigate('/login'); return; }
    cargarDatos();
  }, [navigate]);

  const cargarDatos = async () => {
      try {
          const resP = await axios.get(`${API_URL}/api/pastores`);
          setPastores(resP.data);
          const resA = await axios.get(`${API_URL}/api/actas`);
          setActas(resA.data);
      } catch (e) { console.error(e); }
  };

  // --- LOGICA ---
  const iniciarEdicion = (p) => { setForm({ ...p, password: '' }); setEditingId(p.id); setActiveTab('nuevo'); setSidebarOpen(false); };
  const cancelarEdicion = () => { setForm({ nombre: '', apellido: '', dni: '', iglesiaNombre: '', email: '', telefono: '', nombrePastora: '', fotoUrl: '', password: '', rol: 'USER', estado: 'HABILITADO' }); setEditingId(null); setActiveTab('listado'); };
  
  const handleFileUpload = async (e, type) => { 
      const file = e.target.files[0]; if (!file) return; 
      setUploading(true); 
      const formData = new FormData(); formData.append('foto', file); 
      try { 
          const res = await axios.post(`${API_URL}/api/upload`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }); 
          if (type === 'pastor') setForm({ ...form, fotoUrl: res.data.url });
          if (type === 'acta') setFormActa({ ...formActa, archivoUrl: res.data.url });
      } 
      catch (error) { alert("Error al subir archivo"); } 
      finally { setUploading(false); } 
  };

  const guardarPastor = async (e) => { e.preventDefault(); try { if (editingId) await axios.put(`${API_URL}/api/pastores/${editingId}`, form); else await axios.post(`${API_URL}/api/pastores`, form); cancelarEdicion(); cargarDatos(); alert(editingId ? 'Actualizado' : 'Creado'); } catch (error) { alert('Error al guardar'); } };
  const eliminarPastor = async (id) => { if(confirm('¿Eliminar?')) { await axios.delete(`${API_URL}/api/pastores/${id}`); cargarDatos(); } };
  const toggleEstado = async (p) => { await axios.put(`${API_URL}/api/pastores/${p.id}`, { estado: p.estado === 'HABILITADO' ? 'SUSPENDIDO' : 'HABILITADO' }); cargarDatos(); };
  const cerrarSesion = () => { localStorage.clear(); navigate('/login'); };

  // --- LOGICA ACTAS ---
  const guardarActa = async (e) => {
      e.preventDefault();
      if (!formActa.iglesiaNombre) return alert("Debe indicar el nombre de la iglesia");
      try {
          await axios.post(`${API_URL}/api/actas`, formActa);
          alert("✅ Acta registrada correctamente");
          setFormActa({ titulo: '', contenido: '', iglesiaNombre: '', archivoUrl: '' }); 
          cargarDatos(); 
          setActiveTab('actas'); 
      } catch (error) { alert("Error al guardar acta. Verifique conexión."); }
  };
  const eliminarActa = async (id) => { if(confirm('¿Borrar este acta?')) { await axios.delete(`${API_URL}/api/actas/${id}`); cargarDatos(); } };

  const listaIglesias = [...new Set(pastores.map(p => p.iglesiaNombre).filter(n => n && n.trim() !== ''))];

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"></div>}

      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-mds-dark text-white flex-shrink-0 flex flex-col transition-transform duration-300 border-r border-white/5 shadow-2xl md:shadow-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="h-20 flex items-center justify-between px-6">
           <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-lg shadow-lg">M</div>
               <span className="font-bold text-lg tracking-tight text-white">MDS Global</span>
           </div>
           <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white"><X size={24} /></button>
        </div>
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
           <SidebarItem icon={<LayoutDashboard size={20}/>} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => {setActiveTab('dashboard'); setSidebarOpen(false)}} />
           <SidebarItem icon={<Users size={20}/>} label="Pastores" active={activeTab === 'listado' || activeTab === 'nuevo'} onClick={() => {setActiveTab('listado'); setSidebarOpen(false)}} />
           <SidebarItem icon={<Church size={20}/>} label="Iglesias" active={activeTab === 'iglesias'} onClick={() => {setActiveTab('iglesias'); setSidebarOpen(false)}} />
           <SidebarItem icon={<CreditCard size={20}/>} label="Credenciales" active={activeTab === 'credenciales'} onClick={() => {setActiveTab('credenciales'); setSidebarOpen(false)}} />
           <SidebarItem icon={<Book size={20}/>} label="Libro de Actas" active={activeTab === 'actas' || activeTab === 'nueva_acta'} onClick={() => {setActiveTab('actas'); setSidebarOpen(false)}} />
        </nav>
        <div className="p-4 border-t border-white/5 bg-black/20">
           <button onClick={cerrarSesion} className="flex items-center gap-3 text-gray-400 hover:text-white transition px-4 py-2 w-full text-sm font-medium"><LogOut size={18} /> Cerrar Sesión</button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#f8fafc] w-full">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 flex-shrink-0 shadow-sm z-10 sticky top-0">
           <div className="flex items-center gap-4">
               <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg"><Menu size={28} /></button>
               <div className="relative w-full max-w-md hidden sm:block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="text" placeholder="Buscar..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition" />
               </div>
           </div>
           <div className="flex items-center gap-3 md:gap-4">
              <div className="h-8 w-8 bg-mds-dark rounded-full flex items-center justify-center text-white font-bold border border-gray-200 shadow-sm">A</div>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
           
           {activeTab === 'dashboard' && (
             <div className="space-y-6 animate-in fade-in duration-300">
                <h1 className="text-2xl font-bold text-gray-800">Panel Central</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                   <StatCard icon={<Users className="text-blue-600"/>} label="Total Pastores" value={pastores.length} />
                   <StatCard icon={<Church className="text-green-600"/>} label="Iglesias" value={listaIglesias.length} />
                   <StatCard icon={<Users className="text-orange-600"/>} label="Suspendidos" value={pastores.filter(p=>p.estado==='SUSPENDIDO').length} />
                   <StatCard icon={<Book className="text-purple-600"/>} label="Actas" value={actas.length} />
                </div>
             </div>
           )}

           {activeTab === 'listado' && (
             <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                   <h1 className="text-2xl font-bold text-gray-800">Gestión de Pastores</h1>
                   <button onClick={() => {setEditingId(null); setActiveTab('nuevo')}} className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition">
                      <Plus size={18} /> Nuevo Registro
                   </button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                   {pastores.map(p => (
                      <div key={p.id} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                         <div className={`absolute top-0 left-0 w-1 h-full ${p.estado === 'HABILITADO' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                         <div className="flex gap-4 items-center mb-4 pl-3">
                               <img src={p.fotoUrl || 'https://via.placeholder.com/100'} className="w-12 h-12 rounded-full object-cover bg-gray-50 border border-gray-100" />
                               <div className="min-w-0">
                                  <h3 className="font-bold text-gray-900 text-lg leading-tight capitalize truncate pr-2">{p.apellido}, {p.nombre}</h3>
                                  <p className="text-sm text-gray-500 truncate">{p.iglesiaNombre}</p>
                                  {p.rol === 'ADMIN' && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">ADMIN</span>}
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

           {activeTab === 'iglesias' && (
             <div className="space-y-6 animate-in fade-in duration-300">
                <h1 className="text-2xl font-bold text-gray-800">Sedes e Iglesias</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {listaIglesias.length > 0 ? listaIglesias.map((iglesia, index) => (
                        <div key={index} className="bg-white p-5 rounded-xl border border-gray-200 flex items-center gap-4">
                            <div className="p-3 bg-green-50 text-green-600 rounded-lg"><Church size={24}/></div>
                            <h3 className="font-bold text-gray-800">{iglesia}</h3>
                        </div>
                    )) : <p className="text-gray-400">No hay iglesias.</p>}
                </div>
             </div>
           )}

           {activeTab === 'credenciales' && (
             <div className="space-y-6 animate-in fade-in duration-300">
                <h1 className="text-2xl font-bold text-gray-800">Emisión de Credenciales</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pastores.map(p => (
                        <div key={p.id} className="bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <img src={p.fotoUrl || 'https://via.placeholder.com/50'} className="w-10 h-10 rounded-full bg-gray-100 object-cover"/>
                                <div><p className="font-bold text-sm text-gray-800">{p.nombre} {p.apellido}</p><p className="text-xs text-gray-500">{p.dni}</p></div>
                            </div>
                            <a href={`/#/credencial/${p.id}`} target="_blank" className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition"><Printer size={20}/></a>
                        </div>
                    ))}
                </div>
             </div>
           )}

           {/* --- LIBRO DE ACTAS --- */}
           {activeTab === 'actas' && (
             <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">Libro de Actas</h1>
                    <button onClick={() => setActiveTab('nueva_acta')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-sm flex items-center gap-2">
                        <Plus size={18}/> Nueva Acta
                    </button>
                </div>
                <div className="grid grid-cols-1 gap-4">
                    {actas.length > 0 ? actas.map(acta => (
                        <div key={acta.id} className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col md:flex-row md:items-center justify-between hover:shadow-sm transition gap-4">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-purple-50 text-purple-600 rounded-lg"><FileText size={24}/></div>
                                <div>
                                    <h3 className="font-bold text-gray-800 text-lg">{acta.titulo}</h3>
                                    <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">{acta.iglesiaNombre}</p>
                                    <p className="text-sm text-gray-600">{acta.contenido}</p>
                                    <p className="text-xs text-gray-400 mt-1">Fecha: {new Date(acta.fecha).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {acta.archivoUrl && <a href={acta.archivoUrl} target="_blank" rel="noreferrer" className="text-blue-600 text-xs font-bold bg-blue-50 px-3 py-1.5 rounded-lg">Ver Archivo</a>}
                                <button onClick={() => eliminarActa(acta.id)} className="text-red-500 p-2 hover:bg-red-50 rounded-lg"><Trash2 size={18}/></button>
                            </div>
                        </div>
                    )) : <p className="text-center text-gray-400 py-10">No hay actas registradas.</p>}
                </div>
             </div>
           )}

           {/* --- FORMULARIO NUEVA ACTA (CON CAMPO IGLESIA) --- */}
           {activeTab === 'nueva_acta' && (
             <div className="max-w-2xl mx-auto animate-in slide-in-from-right duration-300">
                <button onClick={() => setActiveTab('actas')} className="mb-4 text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1">← Volver al libro</button>
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50"><h2 className="font-bold text-xl text-gray-800">Redactar Nueva Acta</h2></div>
                    <form onSubmit={guardarActa} className="p-6 space-y-4">
                        <Input label="Título del Acta" val={formActa.titulo} set={v => setFormActa({...formActa, titulo: v})} placeholder="Ej: Reunión Anual de Pastores" />
                        
                        {/* Selector de Iglesia para el Acta */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Iglesia Correspondiente</label>
                            <div className="relative">
                                <select value={formActa.iglesiaNombre} onChange={e => setFormActa({...formActa, iglesiaNombre: e.target.value})} className="w-full border border-gray-300 bg-white rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none font-medium">
                                    <option value="">Seleccionar Iglesia...</option>
                                    {listaIglesias.map(i => <option key={i} value={i}>{i}</option>)}
                                    <option value="Otra">Otra (Especificar en título)</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500"><ChevronDown size={16}/></div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Contenido / Descripción</label>
                            <textarea value={formActa.contenido} onChange={e => setFormActa({...formActa, contenido: e.target.value})} rows="5" className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" required placeholder="Escribe aquí los detalles del acta..."></textarea>
                        </div>
                        
                        <div className="p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300 flex items-center gap-4">
                             <div className="p-3 bg-white rounded-full border"><UploadCloud className="text-gray-400"/></div>
                             <div className="flex-1">
                                <label className="block text-sm font-bold text-blue-700 cursor-pointer hover:underline">
                                    Adjuntar Archivo (PDF/Foto)
                                    <input type="file" onChange={(e) => handleFileUpload(e, 'acta')} className="hidden" disabled={uploading}/>
                                </label>
                                {formActa.archivoUrl && <span className="text-xs text-green-600 font-bold block mt-1">Archivo adjunto ✅</span>}
                             </div>
                        </div>

                        <button type="submit" disabled={uploading} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition disabled:opacity-50">
                            {uploading ? 'Subiendo...' : 'Guardar Acta'}
                        </button>
                    </form>
                </div>
             </div>
           )}

           {activeTab === 'nuevo' && (
             <div className="max-w-3xl mx-auto animate-in slide-in-from-right duration-300 pb-20">
                <button onClick={cancelarEdicion} className="mb-4 text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1">← Volver</button>
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    {/* ... (Formulario Pastor - Igual que antes) ... */}
                    <div className="px-6 md:px-8 py-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <div><h2 className="font-bold text-xl text-gray-800">{editingId ? 'Editar Registro' : 'Nuevo Registro'}</h2></div>
                        <button onClick={cancelarEdicion}><X size={20} className="text-gray-400"/></button>
                    </div>
                    <form onSubmit={guardarPastor} className="p-6 md:p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input label="Nombre" val={form.nombre} set={v=>setForm({...form, nombre: v})} />
                            <Input label="Apellido" val={form.apellido} set={v=>setForm({...form, apellido: v})} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input label="DNI" val={form.dni} set={v=>setForm({...form, dni: v})} type="number" />
                            <Input label="Email" val={form.email} set={v=>setForm({...form, email: v})} required={false} type="email" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input label="Esposa" val={form.nombrePastora} set={v=>setForm({...form, nombrePastora: v})} required={false} />
                            <Input label="Teléfono" val={form.telefono} set={v=>setForm({...form, telefono: v})} required={false} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input label="Contraseña" type="password" val={form.password} set={v=>setForm({...form, password: v})} required={false} placeholder="Opcional" />
                            <div className="grid grid-cols-2 gap-4">
                                <Select label="Estado" val={form.estado} set={v=>setForm({...form, estado: v})} options={[{v:'HABILITADO',l:'Habilitado'},{v:'SUSPENDIDO',l:'Suspendido'}]} />
                                <Select label="Rol" val={form.rol} set={v=>setForm({...form, rol: v})} options={[{v:'USER',l:'Pastor'},{v:'ADMIN',l:'Admin'}]} />
                            </div>
                        </div>
                        <Select label="Iglesia" val={form.iglesiaNombre} set={v=>setForm({...form, iglesiaNombre: v})} options={[{v:'', l:'Seleccionar...'}, {v:'Sede Central', l:'Sede Central'}, {v:'Sede Norte', l:'Sede Norte'}]} />
                        <Input label="Otra Iglesia" val={form.iglesiaNombre} set={v=>setForm({...form, iglesiaNombre: v})} placeholder="Escriba aquí..." />
                        
                        <div className="p-4 bg-blue-50 rounded-lg flex gap-4 items-center">
                            <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center overflow-hidden border">{form.fotoUrl ? <img src={form.fotoUrl} className="w-full h-full object-cover"/> : <User className="text-gray-300"/>}</div>
                            <label className="text-sm font-bold text-blue-700 cursor-pointer hover:underline">
                                Subir Foto <input type="file" onChange={(e) => handleFileUpload(e, 'pastor')} className="hidden" disabled={uploading}/>
                            </label>
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <button type="button" onClick={cancelarEdicion} className="px-5 py-2 text-gray-600">Cancelar</button>
                            <button type="submit" disabled={uploading} className="px-8 py-2 bg-blue-600 text-white font-bold rounded-lg">{uploading ? '...' : 'Guardar'}</button>
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

const SidebarItem = ({ icon, label, active, onClick }) => (<button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mx-2 mb-1 text-sm font-medium ${active ? 'bg-blue-600 text-white shadow-md' : 'text-mds-text hover:bg-white/5 hover:text-white'}`} style={{width: 'calc(100% - 16px)'}}>{icon} {label}</button>);
const StatCard = ({ icon, label, value }) => (<div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4"><div className="p-3 bg-gray-50 rounded-lg">{icon}</div><div><p className="text-sm text-gray-500 font-medium">{label}</p><p className="text-2xl font-bold text-gray-800">{value}</p></div></div>);
const Input = ({ label, val, set, type="text", required=true, placeholder="" }) => (<div><label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">{label}</label><input type={type} value={val} onChange={e=>set(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder={placeholder} required={required} /></div>);
const Select = ({ label, val, set, options }) => (<div><label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">{label}</label><div className="relative"><select value={val} onChange={e => set(e.target.value)} className="w-full border border-gray-300 bg-white rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none font-medium">{options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}</select><div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500"><ChevronDown size={16}/></div></div></div>);

export default Admin;