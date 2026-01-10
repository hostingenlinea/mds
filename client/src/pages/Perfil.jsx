import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Credencial from '../components/Credencial';

const Perfil = () => {
  const [pastor, setPastor] = useState(null);
  const navigate = useNavigate();
  const [modoEdicion, setModoEdicion] = useState(false); // false = ver credencial, true = editar datos
  const [form, setForm] = useState({});
  const [uploading, setUploading] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    const userStored = JSON.parse(localStorage.getItem('user'));
    if (!userStored) { navigate('/login'); return; }
    
    // Cargar datos
    cargarDatos(userStored.id);
  }, [navigate]);

  const cargarDatos = async (id) => {
      try {
        const res = await axios.get(`${API_URL}/api/pastores/${id}`);
        setPastor(res.data);
        // Preparamos el formulario con sus datos actuales
        setForm({
            ...res.data,
            password: '' // Contraseña vacía por seguridad
        });
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
          alert("✅ Datos actualizados correctamente");
          cargarDatos(pastor.id); // Recargar datos frescos
          setModoEdicion(false);  // Volver a la credencial
      } catch (error) {
          alert("Error al actualizar");
      }
  };

  const logout = () => { localStorage.clear(); navigate('/login'); };

  if (!pastor) return <div className="p-10 text-center font-bold text-gray-500">Cargando...</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-6 px-4 font-sans">
      
      {/* Encabezado */}
      <div className="w-full max-w-md flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm">
        <h2 className="text-lg font-black text-slate-800">MDS <span className="text-blue-600">Perfil</span></h2>
        <button onClick={logout} className="text-xs font-bold text-red-500 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition">Cerrar Sesión</button>
      </div>
      
      {/* Selector de Pestañas */}
      <div className="w-full max-w-md bg-white p-1 rounded-xl shadow-sm flex gap-1 mb-6">
          <button onClick={() => setModoEdicion(false)} className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${!modoEdicion ? 'bg-slate-800 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
             🆔 Mi Credencial
          </button>
          <button onClick={() => setModoEdicion(true)} className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${modoEdicion ? 'bg-slate-800 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
             ✏️ Mis Datos
          </button>
      </div>

      {/* VISTA: CREDENCIAL */}
      {!modoEdicion && (
         <div className="animate-in fade-in zoom-in duration-300">
             <Credencial pastor={pastor} />
             <p className="mt-6 text-xs text-gray-400 text-center max-w-xs mx-auto">
                Muestra este código QR al ingresar a los eventos para registrar tu asistencia automáticamente.
             </p>
         </div>
      )}

      {/* VISTA: FORMULARIO EDICIÓN USUARIO */}
      {modoEdicion && (
         <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-in slide-in-from-right duration-300">
             <div className="bg-slate-50 p-6 border-b border-slate-100">
                 <h3 className="font-bold text-lg text-slate-800">Editar mi Información</h3>
                 <p className="text-xs text-gray-500">Mantén tus datos actualizados.</p>
             </div>
             
             <form onSubmit={guardarCambios} className="p-6 space-y-4">
                 {/* Datos no editables o importantes */}
                 <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-2">
                     <p className="text-xs text-blue-600 font-bold uppercase mb-1">Datos Fijos</p>
                     <p className="text-sm font-bold text-slate-700">{pastor.nombre} {pastor.apellido}</p>
                     <p className="text-xs text-slate-500">DNI: {pastor.dni} (Usuario)</p>
                 </div>

                 <Input label="Nombre Iglesia" val={form.iglesiaNombre} set={v => setForm({...form, iglesiaNombre: v})} />
                 
                 <div className="grid grid-cols-2 gap-3">
                     <Input label="Email" type="email" val={form.email} set={v => setForm({...form, email: v})} />
                     <Input label="Teléfono" type="tel" val={form.telefono} set={v => setForm({...form, telefono: v})} />
                 </div>
                 
                 <Input label="Nombre Esposa" val={form.nombrePastora} set={v => setForm({...form, nombrePastora: v})} />

                 <div className="pt-2 border-t border-dashed">
                    <label className="block text-xs font-bold text-slate-500 mb-1">Cambiar Contraseña (Opcional)</label>
                    <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full border p-2.5 rounded-lg text-sm bg-gray-50 focus:bg-white transition outline-none focus:ring-2 focus:ring-blue-500" placeholder="Dejar vacío para mantener la actual" />
                 </div>

                 <div className="flex items-center gap-4 py-2">
                    {form.fotoUrl ? <img src={form.fotoUrl} className="w-10 h-10 rounded-full object-cover" /> : <span className="text-xl">📷</span>}
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-slate-500 mb-1">Actualizar Foto</label>
                        <input type="file" onChange={handleFileUpload} disabled={uploading} className="text-xs text-slate-400 w-full"/>
                    </div>
                 </div>

                 <button type="submit" disabled={uploading} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition">
                     {uploading ? 'Subiendo...' : 'Guardar Mis Datos'}
                 </button>
             </form>
         </div>
      )}

    </div>
  );
};

const Input = ({ label, val, set, type="text" }) => (
  <div>
    <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">{label}</label>
    <input type={type} value={val || ''} onChange={e => set(e.target.value)} className="w-full border border-slate-200 bg-white p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium" />
  </div>
);

export default Perfil;