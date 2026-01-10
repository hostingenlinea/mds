import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Church, CreditCard, Book, FileText, Plus, Edit2, Trash2, X, LogOut, Menu, Upload, Search, Filter, Calendar } from 'lucide-react';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard'); // Por defecto Dashboard
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  
  // Datos
  const [pastores, setPastores] = useState([]);
  const [iglesias, setIglesias] = useState([]);
  const [actas, setActas] = useState([]);
  
  // Modales
  const [showPastorModal, setShowPastorModal] = useState(false);
  const [showIglesiaModal, setShowIglesiaModal] = useState(false);
  const [showActaModal, setShowActaModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Forms
  const [pastorForm, setPastorForm] = useState({});
  const [iglesiaForm, setIglesiaForm] = useState({});
  const [actaForm, setActaForm] = useState({ titulo: '', contenido: '', iglesiaNombre: '' });
  
  const [uploading, setUploading] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'; 

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.rol !== 'ADMIN') navigate('/login');
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
        const [resP, resI, resA] = await Promise.all([
            axios.get(`${API_URL}/api/pastores`),
            axios.get(`${API_URL}/api/iglesias`),
            axios.get(`${API_URL}/api/actas`)
        ]);
        setPastores(resP.data);
        setIglesias(resI.data);
        setActas(resA.data);
    } catch (e) { console.error(e); }
  };

  // --- HANDLERS GENÉRICOS ---
  const handleFileUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return; setUploading(true);
    const fd = new FormData(); fd.append('foto', file);
    try { const res = await axios.post(`${API_URL}/api/upload`, fd, {headers:{'Content-Type':'multipart/form-data'}}); setPastorForm({...pastorForm, fotoUrl: res.data.url}); } catch(e){alert('Error foto');} finally{setUploading(false);}
  };

  // --- CRUD PASTORES ---
  const abrirModalPastor = (p = null) => {
      setPastorForm(p || { nombre: '', apellido: '', dni: '', email: '', telefono: '', nombrePastora: '', iglesiaNombre: iglesias[0]?.nombre || '', estado: 'HABILITADO', password: '', rol: 'USER', fotoUrl: '' });
      setEditingId(p ? p.id : null);
      setShowPastorModal(true);
  };
  const guardarPastor = async (e) => { e.preventDefault(); try { if(editingId) await axios.put(`${API_URL}/api/pastores/${editingId}`, pastorForm); else await axios.post(`${API_URL}/api/pastores`, pastorForm); setShowPastorModal(false); cargarDatos(); } catch (e) { alert('Error'); } };
  const eliminarPastor = async (id) => { if(confirm('¿Eliminar?')) { await axios.delete(`${API_URL}/api/pastores/${id}`); cargarDatos(); } };

  // --- CRUD IGLESIAS ---
  const abrirModalIglesia = (i = null) => { setIglesiaForm(i || { nombre: '', direccion: '', dias: '', horarios: '', ficheroCulto: '', personeria: '', estado: 'ACTIVA' }); setEditingId(i ? i.id : null); setShowIglesiaModal(true); };
  const guardarIglesia = async (e) => { e.preventDefault(); try { if(editingId) await axios.put(`${API_URL}/api/iglesias/${editingId}`, iglesiaForm); else await axios.post(`${API_URL}/api/iglesias`, iglesiaForm); setShowIglesiaModal(false); cargarDatos(); } catch (e) { alert('Error'); } };
  const eliminarIglesia = async (id) => { if(confirm('¿Eliminar Sede?')) { await axios.delete(`${API_URL}/api/iglesias/${id}`); cargarDatos(); } };

  // --- CRUD ACTAS ---
  const guardarActa = async (e) => { e.preventDefault(); try { await axios.post(`${API_URL}/api/actas`, actaForm); setShowActaModal(false); setActaForm({ titulo: '', contenido: '', iglesiaNombre: '' }); cargarDatos(); } catch (e) { alert('Error'); } };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      
      {/* SIDEBAR */}
      <aside className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-[#030816] text-white transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
         <div className="h-20 flex items-center gap-3 px-6 border-b border-gray-800/50">
             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">M</div>
             <span className="font-bold text-lg tracking-tight">MDS Global</span>
             <button onClick={()=>setSidebarOpen(false)} className="md:hidden ml-auto text-gray-500"><X/></button>
         </div>
         <nav className="p-4 space-y-1">
             <SidebarBtn icon={<LayoutDashboard size={18}/>} label="Dashboard" active={activeTab==='dashboard'} onClick={()=>{setActiveTab('dashboard'); setSidebarOpen(false)}} />
             <SidebarBtn icon={<Users size={18}/>} label="Pastores" active={activeTab==='pastores'} onClick={()=>{setActiveTab('pastores'); setSidebarOpen(false)}} />
             <SidebarBtn icon={<Church size={18}/>} label="Iglesias" active={activeTab==='iglesias'} onClick={()=>{setActiveTab('iglesias'); setSidebarOpen(false)}} />
             <SidebarBtn icon={<CreditCard size={18}/>} label="Credenciales" active={activeTab==='credenciales'} onClick={()=>{setActiveTab('credenciales'); setSidebarOpen(false)}} />
             <SidebarBtn icon={<Book size={18}/>} label="Libro de Actas" active={activeTab==='actas'} onClick={()=>{setActiveTab('actas'); setSidebarOpen(false)}} />
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
           
           {/* --- DASHBOARD --- */}
           {activeTab === 'dashboard' && (
             <div className="space-y-6">
                <h1 className="text-2xl font-bold text-[#030816] font-serif">Bienvenido al Panel Central</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <StatCard label="Total Pastores" value={pastores.length} icon={<Users className="text-blue-600"/>} />
                   <StatCard label="Iglesias Activas" value={iglesias.length} icon={<Church className="text-emerald-600"/>} />
                   <StatCard label="Actas Registradas" value={actas.length} icon={<Book className="text-orange-600"/>} />
                </div>
             </div>
           )}

           {/* --- PASTORES --- */}
           {activeTab === 'pastores' && (
             <div className="max-w-7xl mx-auto space-y-6">
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                     <div><h1 className="text-2xl font-bold text-[#030816] font-serif">Directorio de Pastores</h1><p className="text-gray-500 text-sm">Base de datos centralizada</p></div>
                     <button onClick={()=>abrirModalPastor()} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-lg flex items-center gap-2 w-full md:w-auto justify-center"><Plus size={18}/> Nuevo Pastor</button>
                 </div>
                 {/* Tabla Desktop / Cards Mobile */}
                 <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                     <div className="md:hidden divide-y divide-gray-100">{pastores.map(p => <PastorCardMobile key={p.id} p={p} onEdit={()=>abrirModalPastor(p)} onDelete={()=>eliminarPastor(p.id)}/>)}</div>
                     <div className="hidden md:block overflow-x-auto">
                         <table className="w-full text-left">
                             <thead className="bg-gray-50 border-b border-gray-100"><tr><th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Pastor</th><th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Doc / Iglesia</th><th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Estado</th><th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase">Acciones</th></tr></thead>
                             <tbody className="divide-y divide-gray-100">{pastores.map(p => <PastorRowDesktop key={p.id} p={p} onEdit={()=>abrirModalPastor(p)} onDelete={()=>eliminarPastor(p.id)}/>)}</tbody>
                         </table>
                     </div>
                 </div>
             </div>
           )}

           {/* --- IGLESIAS --- */}
           {activeTab === 'iglesias' && (
             <div className="max-w-7xl mx-auto space-y-6">
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                     <div><h1 className="text-2xl font-bold text-[#030816] font-serif">Iglesias Globales</h1><p className="text-gray-500 text-sm">Gestión de sedes</p></div>
                     <button onClick={()=>abrirModalIglesia()} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-medium shadow-lg flex items-center gap-2 w-full md:w-auto justify-center"><Plus size={18}/> Registrar Sede</button>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {iglesias.map(i => <IglesiaCard key={i.id} i={i} onEdit={()=>abrirModalIglesia(i)} onDelete={()=>eliminarIglesia(i.id)}/>)}
                 </div>
             </div>
           )}

           {/* --- LIBRO DE ACTAS (DISEÑO SOLICITADO) --- */}
           {activeTab === 'actas' && (
             <div className="max-w-7xl mx-auto space-y-6">
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                     <div>
                         <h1 className="text-2xl font-bold text-[#030816] font-serif">Libro de Actas</h1>
                         <p className="text-gray-500 text-sm">Registro histórico de asambleas y decisiones</p>
                     </div>
                     <div className="flex gap-3 w-full md:w-auto">
                         <select className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg p-2.5 outline-none flex-1 md:flex-none">
                             <option>Todas las Sedes</option>
                             {iglesias.map(i => <option key={i.id}>{i.nombre}</option>)}
                         </select>
                         <button onClick={()=>setShowActaModal(true)} className="bg-[#030816] hover:bg-black text-white px-5 py-2.5 rounded-lg font-medium shadow-lg flex items-center gap-2 whitespace-nowrap"><Plus size={18}/> Nueva Acta</button>
                     </div>
                 </div>

                 <div className="space-y-4">
                     {actas.map(a => (
                         <div key={a.id} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition">
                             <div className="flex justify-between items-start mb-2">
                                 <div className="flex items-center gap-3">
                                     <div className="p-2 bg-gray-50 rounded-lg border border-gray-100"><FileText size={20} className="text-gray-600"/></div>
                                     <div>
                                         <h3 className="font-bold text-gray-900 text-lg">{a.titulo}</h3>
                                         <p className="text-xs text-blue-500 font-bold uppercase">{new Date(a.fecha).toLocaleDateString()}</p>
                                     </div>
                                 </div>
                                 <button className="text-sm font-bold text-blue-600 hover:underline">Ver Detalle</button>
                             </div>
                             <p className="text-gray-600 italic text-sm border-l-4 border-gray-100 pl-4 py-1">"{a.contenido}"</p>
                             <div className="mt-4 flex gap-2">
                                 <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded font-bold uppercase">{a.iglesiaNombre}</span>
                             </div>
                         </div>
                     ))}
                     {actas.length === 0 && <div className="text-center py-10 text-gray-400 bg-white rounded-xl border border-dashed">No hay actas registradas.</div>}
                 </div>
             </div>
           )}

           {/* --- CREDENCIALES (PLACEHOLDER) --- */}
           {activeTab === 'credenciales' && (
               <div className="text-center py-20">
                   <CreditCard size={48} className="mx-auto text-gray-300 mb-4"/>
                   <h2 className="text-xl font-bold text-gray-400">Gestión de Impresión</h2>
                   <p className="text-gray-400">Seleccione un pastor del directorio para ver su credencial.</p>
                   <button onClick={()=>setActiveTab('pastores')} className="mt-4 text-blue-600 font-bold hover:underline">Ir al Directorio</button>
               </div>
           )}
        </div>
      </main>

      {/* --- MODALES --- */}
      
      {/* Modal Pastor */}
      {showPastorModal && (
        <Modal title={editingId ? "Editar Pastor" : "Registrar Nuevo Pastor"} onClose={()=>setShowPastorModal(false)}>
            <form onSubmit={guardarPastor} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <Input label="NOMBRE" val={pastorForm.nombre} set={v=>setPastorForm({...pastorForm, nombre:v})} />
                    <Input label="APELLIDO" val={pastorForm.apellido} set={v=>setPastorForm({...pastorForm, apellido:v})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <Input label="DNI / DOCUMENTO" val={pastorForm.dni} set={v=>setPastorForm({...pastorForm, dni:v})} />
                    <Input label="EMAIL" val={pastorForm.email} set={v=>setPastorForm({...pastorForm, email:v})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <Input label="NOMBRE DE ESPOSA" val={pastorForm.nombrePastora} set={v=>setPastorForm({...pastorForm, nombrePastora:v})} />
                    <Input label="TELÉFONO" val={pastorForm.telefono} set={v=>setPastorForm({...pastorForm, telefono:v})} />
                </div>
                {/* PASSWORD AGREGADO */}
                <div className="grid grid-cols-2 gap-4">
                    <Input label="CONTRASEÑA (OPCIONAL)" type="password" val={pastorForm.password} set={v=>setPastorForm({...pastorForm, password:v})} placeholder="••••••" />
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">ESTADO</label>
                        <select value={pastorForm.estado} onChange={e=>setPastorForm({...pastorForm, estado:e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"><option value="HABILITADO">Habilitado</option><option value="SUSPENDIDO">Suspendido</option></select>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">IGLESIA ASIGNADA</label>
                        <select value={pastorForm.iglesiaNombre} onChange={e=>setPastorForm({...pastorForm, iglesiaNombre:e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"><option value="">Seleccionar Sede...</option>{iglesias.map(i=><option key={i.id} value={i.nombre}>{i.nombre}</option>)}</select>
                    </div>
                </div>
                <div className="pt-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">FOTO DE PERFIL</label>
                    <div className="flex items-center gap-4 border border-dashed border-gray-300 rounded-lg p-3 bg-gray-50">
                        <Upload size={20} className="text-gray-400"/>
                        <input type="file" onChange={handleFileUpload} className="text-sm text-gray-500 w-full" disabled={uploading}/>
                    </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <button type="button" onClick={()=>setShowPastorModal(false)} className="px-4 py-2 border rounded-lg text-gray-600">Cancelar</button>
                    <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold shadow">{editingId ? 'Guardar Cambios' : 'Guardar Pastor'}</button>
                </div>
            </form>
        </Modal>
      )}

      {/* Modal Iglesia */}
      {showIglesiaModal && (
        <Modal title="Registrar Sede Global" onClose={()=>setShowIglesiaModal(false)}>
            <form onSubmit={guardarIglesia} className="space-y-4">
                <Input label="NOMBRE DE LA SEDE" val={iglesiaForm.nombre} set={v=>setIglesiaForm({...iglesiaForm, nombre:v})} />
                <Input label="DIRECCIÓN" val={iglesiaForm.direccion} set={v=>setIglesiaForm({...iglesiaForm, direccion:v})} />
                <div className="grid grid-cols-2 gap-4">
                    <Input label="DÍAS DE CULTO" val={iglesiaForm.dias} set={v=>setIglesiaForm({...iglesiaForm, dias:v})} />
                    <Input label="HORARIOS" val={iglesiaForm.horarios} set={v=>setIglesiaForm({...iglesiaForm, horarios:v})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <Input label="FICHERO CULTO" val={iglesiaForm.ficheroCulto} set={v=>setIglesiaForm({...iglesiaForm, ficheroCulto:v})} />
                    <Input label="PERSONERÍA" val={iglesiaForm.personeria} set={v=>setIglesiaForm({...iglesiaForm, personeria:v})} />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <button type="button" onClick={()=>setShowIglesiaModal(false)} className="px-4 py-2 border rounded-lg text-gray-600">Cancelar</button>
                    <button type="submit" className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-bold shadow">Guardar Sede</button>
                </div>
            </form>
        </Modal>
      )}

      {/* Modal Acta */}
      {showActaModal && (
        <Modal title="Nueva Acta de Asamblea" onClose={()=>setShowActaModal(false)}>
            <form onSubmit={guardarActa} className="space-y-4">
                <Input label="TÍTULO DEL ACTA" val={actaForm.titulo} set={v=>setActaForm({...actaForm, titulo:v})} placeholder="Ej: Asamblea Ordinaria #001" />
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">SEDE</label>
                    <select value={actaForm.iglesiaNombre} onChange={e=>setActaForm({...actaForm, iglesiaNombre:e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"><option value="">Seleccionar...</option>{iglesias.map(i=><option key={i.id} value={i.nombre}>{i.nombre}</option>)}</select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">CONTENIDO / RESUMEN</label>
                    <textarea value={actaForm.contenido} onChange={e=>setActaForm({...actaForm, contenido:e.target.value})} className="w-full border border-gray-300 rounded-lg p-3 text-sm h-32 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Escriba aquí los detalles..."></textarea>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <button type="button" onClick={()=>setShowActaModal(false)} className="px-4 py-2 border rounded-lg text-gray-600">Cancelar</button>
                    <button type="submit" className="px-6 py-2 bg-[#030816] text-white rounded-lg font-bold shadow">Publicar Acta</button>
                </div>
            </form>
        </Modal>
      )}

    </div>
  );
};

// --- SUBCOMPONENTES ---
const SidebarBtn = ({ icon, label, active, onClick }) => (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium ${active ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
        {icon} {label}
    </button>
);

const StatCard = ({ label, value, icon }) => (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">{icon}</div>
        <div><p className="text-sm text-gray-500 font-medium">{label}</p><p className="text-2xl font-bold text-gray-800">{value}</p></div>
    </div>
);

const PastorCardMobile = ({ p, onEdit, onDelete }) => (
    <div className="p-4 space-y-3">
        <div className="flex items-center gap-3">
            <img src={p.fotoUrl || 'https://via.placeholder.com/40'} className="w-10 h-10 rounded-full object-cover" />
            <div><p className="font-bold text-gray-900">{p.nombre} {p.apellido}</p><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.estado==='HABILITADO'?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{p.estado}</span></div>
        </div>
        <div className="text-sm text-gray-600 pl-13"><p>🏛 {p.iglesiaNombre}</p><p>🆔 {p.dni}</p></div>
        <div className="flex gap-2 pt-2"><button onClick={onEdit} className="flex-1 py-2 bg-gray-50 text-blue-600 text-xs font-bold rounded">EDITAR</button><button onClick={onDelete} className="px-3 bg-red-50 text-red-600 rounded"><Trash2 size={16}/></button></div>
    </div>
);

const PastorRowDesktop = ({ p, onEdit, onDelete }) => (
    <tr className="hover:bg-gray-50/50 transition">
        <td className="px-6 py-4"><div className="flex items-center gap-3"><img src={p.fotoUrl || 'https://via.placeholder.com/40'} className="w-10 h-10 rounded-full object-cover shadow-sm"/><div><p className="font-bold text-gray-900 text-sm">{p.nombre} {p.apellido}</p></div></div></td>
        <td className="px-6 py-4"><p className="font-bold text-gray-700 text-sm">{p.dni}</p><p className="text-xs text-blue-600">{p.iglesiaNombre}</p></td>
        <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${p.estado==='HABILITADO' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{p.estado}</span></td>
        <td className="px-6 py-4 text-right"><div className="flex justify-end gap-2"><button onClick={onEdit} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={16}/></button><button onClick={onDelete} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={16}/></button></div></td>
    </tr>
);

const IglesiaCard = ({ i, onEdit, onDelete }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col group hover:shadow-md transition">
        <div className="bg-[#0f172a] p-5 relative"><span className="absolute top-4 right-4 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">{i.estado}</span><h3 className="text-white font-serif text-lg font-bold pr-16">{i.nombre}</h3></div>
        <div className="p-5 flex-1 space-y-4"><div className="flex items-start gap-3 text-gray-600"><p className="text-sm font-medium">{i.direccion || 'Sin dirección'}</p></div></div>
        <div className="p-2 flex justify-end gap-2 border-t border-gray-100"><button onClick={onEdit} className="px-3 py-1 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded">EDITAR</button><button onClick={onDelete} className="px-3 py-1 text-xs font-bold text-red-600 hover:bg-red-50 rounded">ELIMINAR</button></div>
    </div>
);

const Modal = ({ title, children, onClose }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
        <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50"><h3 className="font-bold text-lg text-gray-800 font-serif">{title}</h3><button onClick={onClose} className="text-gray-400 hover:text-red-500"><X/></button></div>
            <div className="p-6">{children}</div>
        </div>
    </div>
);

const Input = ({ label, val, set, type="text", placeholder="" }) => (
    <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">{label}</label><input type={type} value={val || ''} onChange={e=>set(e.target.value)} placeholder={placeholder} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" /></div>
);

export default Admin;