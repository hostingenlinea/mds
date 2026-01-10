import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Users, Church, MapPin, Calendar, Clock, FileText, Plus, Edit2, Trash2, X, LogOut, Menu, Upload, Search, Filter } from 'lucide-react';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('pastores');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  
  // Datos
  const [pastores, setPastores] = useState([]);
  const [iglesias, setIglesias] = useState([]);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  // Modales
  const [showPastorModal, setShowPastorModal] = useState(false);
  const [showIglesiaModal, setShowIglesiaModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Forms
  const [pastorForm, setPastorForm] = useState({ nombre: '', apellido: '', dni: '', email: '', telefono: '', nombrePastora: '', iglesiaNombre: '', estado: 'HABILITADO', password: '', rol: 'USER', fotoUrl: '' });
  const [iglesiaForm, setIglesiaForm] = useState({ nombre: '', direccion: '', dias: '', horarios: '', ficheroCulto: '', personeria: '', estado: 'ACTIVA' });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.rol !== 'ADMIN') navigate('/login');
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
        const [resP, resI] = await Promise.all([axios.get(`${API_URL}/api/pastores`), axios.get(`${API_URL}/api/iglesias`)]);
        setPastores(resP.data);
        setIglesias(resI.data);
    } catch (e) { console.error(e); }
  };

  // --- LOGICA MODALES ---
  const abrirModalPastor = (p = null) => {
      setPastorForm(p || { nombre: '', apellido: '', dni: '', email: '', telefono: '', nombrePastora: '', iglesiaNombre: iglesias[0]?.nombre || '', estado: 'HABILITADO', password: '', rol: 'USER', fotoUrl: '' });
      setEditingId(p ? p.id : null);
      setShowPastorModal(true);
  };
  const abrirModalIglesia = (i = null) => {
      setIglesiaForm(i || { nombre: '', direccion: '', dias: '', horarios: '', ficheroCulto: '', personeria: '', estado: 'ACTIVA' });
      setEditingId(i ? i.id : null);
      setShowIglesiaModal(true);
  };

  // --- CRUD ---
  const guardarPastor = async (e) => { e.preventDefault(); try { if(editingId) await axios.put(`${API_URL}/api/pastores/${editingId}`, pastorForm); else await axios.post(`${API_URL}/api/pastores`, pastorForm); setShowPastorModal(false); cargarDatos(); } catch (e) { alert('Error'); } };
  const eliminarPastor = async (id) => { if(confirm('¿Eliminar?')) { await axios.delete(`${API_URL}/api/pastores/${id}`); cargarDatos(); } };
  
  const guardarIglesia = async (e) => { e.preventDefault(); try { if(editingId) await axios.put(`${API_URL}/api/iglesias/${editingId}`, iglesiaForm); else await axios.post(`${API_URL}/api/iglesias`, iglesiaForm); setShowIglesiaModal(false); cargarDatos(); } catch (e) { alert('Error'); } };
  const eliminarIglesia = async (id) => { if(confirm('¿Eliminar Sede?')) { await axios.delete(`${API_URL}/api/iglesias/${id}`); cargarDatos(); } };

  const handleFileUpload = async (e) => { const file = e.target.files[0]; if (!file) return; setUploading(true); const fd = new FormData(); fd.append('foto', file); try { const res = await axios.post(`${API_URL}/api/upload`, fd, {headers:{'Content-Type':'multipart/form-data'}}); setPastorForm({...pastorForm, fotoUrl: res.data.url}); } catch(e){alert('Error foto');} finally{setUploading(false);} };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      
      {/* SIDEBAR OSCURO (IGUAL A TU REFERENCIA) */}
      <aside className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-[#030816] text-white transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
         <div className="h-20 flex items-center gap-3 px-6 border-b border-gray-800/50">
             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">M</div>
             <span className="font-bold text-lg tracking-tight">MDS Global</span>
             <button onClick={()=>setSidebarOpen(false)} className="md:hidden ml-auto text-gray-500"><X/></button>
         </div>
         <nav className="p-4 space-y-2">
             <SidebarBtn icon={<Users size={20}/>} label="Pastores" active={activeTab==='pastores'} onClick={()=>{setActiveTab('pastores'); setSidebarOpen(false)}} />
             <SidebarBtn icon={<Church size={20}/>} label="Iglesias" active={activeTab==='iglesias'} onClick={()=>{setActiveTab('iglesias'); setSidebarOpen(false)}} />
         </nav>
         <div className="absolute bottom-0 w-full p-4 border-t border-gray-800/50">
             <button onClick={()=>{localStorage.clear(); navigate('/login')}} className="flex items-center gap-3 text-gray-400 hover:text-white transition w-full px-4 py-2 rounded-lg hover:bg-white/5"><LogOut size={18}/> Cerrar Sesión</button>
         </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 flex flex-col h-full overflow-hidden w-full">
        <header className="md:hidden h-16 bg-white border-b flex items-center px-4 justify-between shrink-0">
           <div className="flex items-center gap-3">
               <button onClick={()=>setSidebarOpen(true)} className="p-2 -ml-2"><Menu/></button>
               <span className="font-bold text-gray-800">Panel Central</span>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
           
           {/* --- SECCIÓN PASTORES (TABLA MODERNA) --- */}
           {activeTab === 'pastores' && (
             <div className="max-w-7xl mx-auto space-y-6">
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                     <div>
                         <h1 className="text-2xl font-bold text-[#030816] font-serif">Directorio de Pastores</h1>
                         <p className="text-gray-500 text-sm">Base de datos centralizada de liderato global</p>
                     </div>
                     <button onClick={()=>abrirModalPastor()} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-lg shadow-blue-500/20 flex items-center gap-2 transition w-full md:w-auto justify-center">
                         <Plus size={18}/> Nuevo Pastor
                     </button>
                 </div>

                 {/* TABLA (Visible en PC) / CARDS (Visible en Móvil) */}
                 <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                     {/* Vista Móvil: Cards */}
                     <div className="md:hidden divide-y divide-gray-100">
                        {pastores.map(p => (
                            <div key={p.id} className="p-4 space-y-3">
                                <div className="flex items-center gap-3">
                                    <img src={p.fotoUrl || 'https://via.placeholder.com/40'} className="w-10 h-10 rounded-full object-cover" />
                                    <div>
                                        <p className="font-bold text-gray-900">{p.nombre} {p.apellido}</p>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.estado==='HABILITADO'?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{p.estado}</span>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-600 space-y-1 pl-13">
                                    <p>🏛 {p.iglesiaNombre}</p>
                                    <p>🆔 {p.dni}</p>
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <button onClick={()=>abrirModalPastor(p)} className="flex-1 py-2 bg-gray-50 text-blue-600 text-xs font-bold rounded">EDITAR</button>
                                    <button onClick={()=>eliminarPastor(p.id)} className="px-3 bg-red-50 text-red-600 rounded"><Trash2 size={16}/></button>
                                </div>
                            </div>
                        ))}
                     </div>

                     {/* Vista PC: Tabla */}
                     <div className="hidden md:block overflow-x-auto">
                         <table className="w-full text-left">
                             <thead className="bg-gray-50 border-b border-gray-100">
                                 <tr>
                                     <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Pastor</th>
                                     <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Documento / Iglesia</th>
                                     <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Contacto</th>
                                     <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Estado</th>
                                     <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Acciones</th>
                                 </tr>
                             </thead>
                             <tbody className="divide-y divide-gray-100">
                                 {pastores.map(p => (
                                     <tr key={p.id} className="hover:bg-gray-50/50 transition">
                                         <td className="px-6 py-4">
                                             <div className="flex items-center gap-3">
                                                 <img src={p.fotoUrl || 'https://via.placeholder.com/40'} className="w-10 h-10 rounded-full object-cover shadow-sm" />
                                                 <div>
                                                     <p className="font-bold text-gray-900 text-sm">{p.nombre} {p.apellido}</p>
                                                     {p.nombrePastora && <p className="text-xs text-gray-400">Esposa: {p.nombrePastora}</p>}
                                                 </div>
                                             </div>
                                         </td>
                                         <td className="px-6 py-4">
                                             <p className="font-bold text-gray-700 text-sm">{p.dni}</p>
                                             <p className="text-xs text-blue-600 font-medium">{p.iglesiaNombre || 'Sin Asignar'}</p>
                                         </td>
                                         <td className="px-6 py-4">
                                             <p className="text-sm text-gray-600">{p.telefono || '-'}</p>
                                             <p className="text-xs text-gray-400">{p.email}</p>
                                         </td>
                                         <td className="px-6 py-4">
                                             <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${p.estado==='HABILITADO' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                 {p.estado}
                                             </span>
                                         </td>
                                         <td className="px-6 py-4 text-right">
                                             <div className="flex justify-end gap-2">
                                                 <button onClick={()=>abrirModalPastor(p)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"><Edit2 size={16}/></button>
                                                 <button onClick={()=>eliminarPastor(p.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"><Trash2 size={16}/></button>
                                             </div>
                                         </td>
                                     </tr>
                                 ))}
                             </tbody>
                         </table>
                     </div>
                 </div>
             </div>
           )}

           {/* --- SECCIÓN IGLESIAS --- */}
           {activeTab === 'iglesias' && (
             <div className="max-w-7xl mx-auto space-y-6">
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                     <div>
                         <h1 className="text-2xl font-bold text-[#030816] font-serif">Iglesias Globales</h1>
                         <p className="text-gray-500">Gestión de sedes, personerías y horarios</p>
                     </div>
                     <button onClick={()=>abrirModalIglesia()} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-medium shadow-lg shadow-emerald-500/20 flex items-center gap-2 w-full md:w-auto justify-center">
                         <Plus size={18}/> Registrar Sede
                     </button>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {iglesias.map(i => (
                         <div key={i.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col group hover:shadow-md transition">
                             <div className="bg-[#0f172a] p-5 relative">
                                 <span className="absolute top-4 right-4 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">
                                     {i.estado}
                                 </span>
                                 <h3 className="text-white font-serif text-lg font-bold pr-16 leading-tight">{i.nombre}</h3>
                             </div>
                             
                             <div className="p-5 flex-1 space-y-4">
                                 <div className="flex items-start gap-3 text-gray-600">
                                     <MapPin size={18} className="mt-0.5 text-gray-400 shrink-0"/>
                                     <p className="text-sm font-medium">{i.direccion || 'Sin dirección registrada'}</p>
                                 </div>
                                 <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-50">
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1 flex items-center gap-1"><Calendar size={10}/> Días</p>
                                        <p className="text-xs font-bold text-gray-700">{i.dias || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1 flex items-center gap-1"><Clock size={10}/> Horarios</p>
                                        <p className="text-xs font-bold text-gray-700">{i.horarios || '-'}</p>
                                    </div>
                                 </div>
                             </div>

                             <div className="bg-gray-50 p-3 border-t border-gray-100 flex gap-2">
                                 <div className="flex-1 bg-white border border-blue-100 rounded px-2 py-1.5">
                                     <p className="text-[9px] font-bold text-blue-400 uppercase flex items-center gap-1"><FileText size={10}/> Fichero</p>
                                     <p className="text-xs font-bold text-gray-800">{i.ficheroCulto || '-'}</p>
                                 </div>
                                 <div className="flex-1 bg-white border border-blue-100 rounded px-2 py-1.5">
                                     <p className="text-[9px] font-bold text-blue-400 uppercase flex items-center gap-1"><FileText size={10}/> Personería</p>
                                     <p className="text-xs font-bold text-gray-800">{i.personeria || '-'}</p>
                                 </div>
                             </div>
                             <div className="p-2 flex justify-end gap-2 border-t border-gray-100">
                                 <button onClick={()=>abrirModalIglesia(i)} className="px-3 py-1 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded">EDITAR</button>
                                 <button onClick={()=>eliminarIglesia(i.id)} className="px-3 py-1 text-xs font-bold text-red-600 hover:bg-red-50 rounded">ELIMINAR</button>
                             </div>
                         </div>
                     ))}
                 </div>
             </div>
           )}
        </div>
      </main>

      {/* --- MODAL PASTOR --- */}
      {showPastorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
              <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                 <h3 className="font-bold text-lg text-gray-800 font-serif">Registrar Nuevo Pastor</h3>
                 <button onClick={()=>setShowPastorModal(false)} className="text-gray-400 hover:text-red-500"><X/></button>
              </div>
              <form onSubmit={guardarPastor} className="p-6 space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <Input label="Nombre" val={pastorForm.nombre} set={v=>setPastorForm({...pastorForm, nombre:v})} />
                    <Input label="Apellido" val={pastorForm.apellido} set={v=>setPastorForm({...pastorForm, apellido:v})} />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <Input label="DNI / Documento" val={pastorForm.dni} set={v=>setPastorForm({...pastorForm, dni:v})} />
                    <Input label="Email" val={pastorForm.email} set={v=>setPastorForm({...pastorForm, email:v})} />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <Input label="Nombre de Esposa" val={pastorForm.nombrePastora} set={v=>setPastorForm({...pastorForm, nombrePastora:v})} />
                    <Input label="Teléfono" val={pastorForm.telefono} set={v=>setPastorForm({...pastorForm, telefono:v})} />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Estado</label>
                       <select value={pastorForm.estado} onChange={e=>setPastorForm({...pastorForm, estado:e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm">
                          <option value="HABILITADO">Habilitado</option>
                          <option value="SUSPENDIDO">Suspendido</option>
                       </select>
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Iglesia Asignada</label>
                       <select value={pastorForm.iglesiaNombre} onChange={e=>setPastorForm({...pastorForm, iglesiaNombre:e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm">
                          <option value="">Seleccionar Sede...</option>
                          {iglesias.map(i => <option key={i.id} value={i.nombre}>{i.nombre}</option>)}
                       </select>
                    </div>
                 </div>
                 
                 <div className="pt-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Foto de Perfil</label>
                    <div className="flex items-center gap-4 border rounded-lg p-3">
                       {pastorForm.fotoUrl ? <img src={pastorForm.fotoUrl} className="w-12 h-12 rounded-full object-cover"/> : <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center"><Upload size={20}/></div>}
                       <input type="file" onChange={handleFileUpload} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                    </div>
                 </div>

                 <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                    <button type="button" onClick={()=>setShowPastorModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
                    <button type="submit" disabled={uploading} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow">{uploading ? '...' : 'Guardar Pastor'}</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* --- MODAL IGLESIA --- */}
      {showIglesiaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
              <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                 <h3 className="font-bold text-lg text-gray-800 font-serif">Registrar Sede Global</h3>
                 <button onClick={()=>setShowIglesiaModal(false)} className="text-gray-400 hover:text-red-500"><X/></button>
              </div>
              <form onSubmit={guardarIglesia} className="p-6 space-y-4">
                 <Input label="Nombre de la Sede" val={iglesiaForm.nombre} set={v=>setIglesiaForm({...iglesiaForm, nombre:v})} />
                 <Input label="Dirección Completa" val={iglesiaForm.direccion} set={v=>setIglesiaForm({...iglesiaForm, direccion:v})} />
                 <div className="grid grid-cols-2 gap-4">
                    <Input label="Días de Culto" val={iglesiaForm.dias} set={v=>setIglesiaForm({...iglesiaForm, dias:v})} placeholder="Ej: Mar y Dom"/>
                    <Input label="Horarios" val={iglesiaForm.horarios} set={v=>setIglesiaForm({...iglesiaForm, horarios:v})} placeholder="Ej: 19:30hs"/>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <Input label="Fichero Culto" val={iglesiaForm.ficheroCulto} set={v=>setIglesiaForm({...iglesiaForm, ficheroCulto:v})} />
                    <Input label="Personería Jurídica" val={iglesiaForm.personeria} set={v=>setIglesiaForm({...iglesiaForm, personeria:v})} />
                 </div>
                 <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                    <button type="button" onClick={()=>setShowIglesiaModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
                    <button type="submit" className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow">Guardar Sede</button>
                 </div>
              </form>
           </div>
        </div>
      )}

    </div>
  );
};

// Componentes Auxiliares
const SidebarBtn = ({ icon, label, active, onClick }) => (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium ${active ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
        {icon} {label}
    </button>
);

const Input = ({ label, val, set, placeholder="" }) => (
    <div>
       <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{label}</label>
       <input type="text" value={val} onChange={e=>set(e.target.value)} placeholder={placeholder} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
    </div>
);

export default Admin;