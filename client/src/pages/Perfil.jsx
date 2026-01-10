import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Menu, User, LogOut, QrCode, Edit3, X, Camera } from 'lucide-react';
import Credencial from '../components/Credencial';

const Perfil = () => {
  const [pastor, setPastor] = useState(null);
  const navigate = useNavigate();
  const [modoEdicion, setModoEdicion] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false); // Menú desplegable lateral
  const [form, setForm] = useState({});
  const [uploading, setUploading] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    const userStored = JSON.parse(localStorage.getItem('user'));
    if (!userStored) { navigate('/login'); return; }
    cargarDatos(userStored.id);
  }, [navigate]);

  const cargarDatos = async (id) => {
      try {
        const res = await axios.get(`${API_URL}/api/pastores/${id}`);
        setPastor(res.data);
        setForm({ ...res.data, password: '' });
      } catch (err) { console.error(err); }
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
    } catch (error) { alert("Error subiendo foto"); } finally { setUploading(false); }
  };

  const guardarCambios = async (e) => {
      e.preventDefault();
      try {
          await axios.put(`${API_URL}/api/pastores/${pastor.id}`, form);
          alert("✅ Datos actualizados");
          cargarDatos(pastor.id);
          setModoEdicion(false);
      } catch (error) { alert("Error al actualizar"); }
  };

  const logout = () => { localStorage.clear(); navigate('/login'); };

  if (!pastor) return <div className="h-screen flex items-center justify-center text-blue-600 font-bold">Cargando App...</div>;

  return (
    <div className="min-h-screen bg-gray-100 font-sans pb-10">
      
      {/* --- HEADER ESTILO APP --- */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-blue-700 text-white flex items-center justify-between px-4 z-50 shadow-md">
         {/* Menú: Abre opciones */}
         <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 hover:bg-blue-600 rounded-full transition">
           <Menu size={28} />
         </button>

         <span className="text-lg font-bold">MDS App</span>

         {/* Perfil: Va a Editar Datos */}
         <button onClick={() => setModoEdicion(true)} className={`p-2 rounded-full transition ${modoEdicion ? 'bg-white text-blue-700' : 'hover:bg-blue-600'}`}>
           <User size={24} />
         </button>
      </header>

      {/* --- MENÚ DESPLEGABLE (DRAWER) --- */}
      {menuOpen && (
          <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)}>
              <div className="absolute top-16 left-0 w-64 bg-white shadow-2xl p-4 rounded-br-2xl border-t border-gray-100 animate-in slide-in-from-top duration-200" onClick={e => e.stopPropagation()}>
                  <div className="mb-4 pb-4 border-b border-gray-100">
                      <p className="font-bold text-gray-800 text-lg">{pastor.nombre}</p>
                      <p className="text-xs text-gray-400">Pastor</p>
                  </div>
                  <nav className="space-y-2">
                      <button onClick={() => { setModoEdicion(false); setMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-blue-50 text-gray-600 hover:text-blue-700 font-medium transition">
                          <QrCode size={20}/> Mi Credencial
                      </button>
                      <button onClick={() => { setModoEdicion(true); setMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-blue-50 text-gray-600 hover:text-blue-700 font-medium transition">
                          <Edit3 size={20}/> Editar Mis Datos
                      </button>
                      <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 text-red-500 font-medium transition mt-4">
                          <LogOut size={20}/> Cerrar Sesión
                      </button>
                  </nav>
              </div>
          </div>
      )}

      {/* --- CONTENIDO --- */}
      <div className="pt-24 px-4 flex flex-col items-center">
         
         {!modoEdicion ? (
             // VISTA: CREDENCIAL
             <div className="w-full max-w-md animate-in zoom-in duration-300">
                 <div className="bg-white p-4 rounded-2xl shadow-sm mb-6 flex items-center gap-4">
                     <div className="bg-blue-100 p-3 rounded-full text-blue-600"><QrCode size={24}/></div>
                     <div>
                         <h2 className="font-bold text-gray-800">Mi Credencial Digital</h2>
                         <p className="text-xs text-gray-500">Muestra este código al ingresar.</p>
                     </div>
                 </div>
                 <Credencial pastor={pastor} />
             </div>
         ) : (
             // VISTA: EDITAR DATOS
             <div className="w-full max-w-md animate-in slide-in-from-right duration-300">
                 <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                     <div className="bg-slate-50 p-6 border-b border-gray-100 flex justify-between items-center">
                         <h2 className="font-bold text-lg text-slate-800">Mis Datos</h2>
                         <button onClick={() => setModoEdicion(false)} className="bg-white p-1 rounded-full shadow border border-gray-200"><X size={18} className="text-gray-500"/></button>
                     </div>
                     
                     <form onSubmit={guardarCambios} className="p-6 space-y-4">
                         {/* Foto con Icono de Cámara */}
                         <div className="flex justify-center mb-6">
                            <div className="relative">
                                <img src={form.fotoUrl || pastor.fotoUrl} className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg" />
                                <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer shadow-md hover:bg-blue-700 transition">
                                    <Camera size={16} />
                                    <input type="file" onChange={handleFileUpload} className="hidden" disabled={uploading}/>
                                </label>
                            </div>
                         </div>

                         <div className="space-y-4">
                             <Input label="Iglesia" val={form.iglesiaNombre} set={v => setForm({...form, iglesiaNombre: v})} />
                             <Input label="Teléfono" type="tel" val={form.telefono} set={v => setForm({...form, telefono: v})} />
                             <Input label="Email" type="email" val={form.email} set={v => setForm({...form, email: v})} />
                             <Input label="Nombre Esposa" val={form.nombrePastora} set={v => setForm({...form, nombrePastora: v})} />
                             <div className="pt-2 border-t border-dashed">
                                <Input label="Nueva Contraseña (Opcional)" type="password" val={form.password} set={v => setForm({...form, password: v})} placeholder="••••••" />
                             </div>
                         </div>

                         <button type="submit" disabled={uploading} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition mt-4">
                             {uploading ? 'Guardando...' : 'GUARDAR CAMBIOS'}
                         </button>
                     </form>
                 </div>
             </div>
         )}
      </div>
    </div>
  );
};

const Input = ({ label, val, set, type="text", placeholder="" }) => (
  <div>
    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">{label}</label>
    <input type={type} value={val || ''} onChange={e => set(e.target.value)} placeholder={placeholder} className="w-full border border-gray-200 bg-white p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium" />
  </div>
);

export default Perfil;