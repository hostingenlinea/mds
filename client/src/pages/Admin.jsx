// client/src/pages/Admin.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const [pastores, setPastores] = useState([]);
  const navigate = useNavigate();
  
  // Estado del formulario
  const [form, setForm] = useState({ 
    nombre: '', 
    apellido: '', 
    dni: '', 
    iglesiaNombre: '', 
    email: '', 
    telefono: '', 
    nombrePastora: '', 
    fotoUrl: '' 
  });
  
  const [uploading, setUploading] = useState(false); 
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'; 

  // Verificar seguridad al cargar
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) { 
      navigate('/login'); 
      return; 
    }
    const user = JSON.parse(userStr);
    if (user.rol !== 'ADMIN') { 
      navigate('/perfil'); 
      return; 
    }
    
    cargarPastores();
  }, [navigate]);

  const cargarPastores = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/pastores`);
      setPastores(res.data);
    } catch (error) { 
      console.error(error); 
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append('foto', file);

    try {
      const res = await axios.post(`${API_URL}/api/upload`, formData, { 
        headers: { 'Content-Type': 'multipart/form-data' } 
      });
      setForm({ ...form, fotoUrl: res.data.url });
    } catch (error) { 
      alert("Error al subir imagen"); 
    } finally { 
      setUploading(false); 
    }
  };

  const guardarPastor = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/pastores`, form);
      alert('✅ Pastor Registrado Correctamente');
      
      // Limpiar formulario
      setForm({ 
        nombre: '', apellido: '', dni: '', iglesiaNombre: '', 
        email: '', telefono: '', nombrePastora: '', fotoUrl: '' 
      });
      cargarPastores();
    } catch (error) { 
      alert('Error: Revisa que el DNI no esté duplicado.'); 
    }
  };

  const cerrarSesion = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* NAVBAR SUPERIOR */}
      <nav className="bg-blue-900 p-4 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-white font-bold text-xl tracking-wider">MDS</h1>
            <span className="bg-blue-800 text-blue-200 text-xs px-2 py-1 rounded-full uppercase font-semibold border border-blue-700">
              Panel Admin
            </span>
          </div>
          <button 
            onClick={cerrarSesion} 
            className="flex items-center gap-2 text-blue-200 hover:text-white transition text-sm font-medium bg-blue-800/50 px-3 py-1.5 rounded hover:bg-red-600/80"
          >
            Cerrar Sesión
          </button>
        </div>
      </nav>

      {/* CONTENIDO PRINCIPAL - GRID RESPONSIVO */}
      <div className="max-w-7xl mx-auto p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* --- COLUMNA IZQUIERDA: FORMULARIO (Sticky en PC) --- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden lg:col-span-1 lg:sticky lg:top-24">
          <div className="bg-gray-50 p-4 border-b border-gray-200 flex items-center gap-2">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <span>👤</span> Nuevo Registro
            </h2>
          </div>
          
          <div className="p-5">
            <form onSubmit={guardarPastor} className="space-y-5">
              
              <div className="grid grid-cols-2 gap-3">
                <Input label="Nombre" val={form.nombre} set={v => setForm({...form, nombre: v})} />
                <Input label="Apellido" val={form.apellido} set={v => setForm({...form, apellido: v})} />
              </div>
              
              <Input label="DNI (Será el Usuario)" val={form.dni} set={v => setForm({...form, dni: v})} />
              <Input label="Nombre de la Iglesia" val={form.iglesiaNombre} set={v => setForm({...form, iglesiaNombre: v})} />
              
              <div className="border-t border-gray-100 pt-4 space-y-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Datos Opcionales</p>
                <Input label="Email" type="email" val={form.email} set={v => setForm({...form, email: v})} required={false} />
                <Input label="Teléfono/WhatsApp" type="tel" val={form.telefono} set={v => setForm({...form, telefono: v})} required={false} />
                <Input label="Nombre Pastora/Esposa" val={form.nombrePastora} set={v => setForm({...form, nombrePastora: v})} required={false} />
              </div>

              {/* SUBIDA DE FOTO */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-2">
                <label className="block text-xs font-bold text-blue-800 uppercase mb-3 text-center">Foto de Perfil</label>
                <div className="flex flex-col items-center justify-center gap-3">
                  {form.fotoUrl ? (
                    <img src={form.fotoUrl} className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md" alt="Preview" />
                  ) : (
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-3xl shadow-inner text-gray-300 border border-gray-200">📷</div>
                  )}
                  
                  <label className="cursor-pointer bg-white border border-blue-300 text-blue-700 px-4 py-2 rounded-full font-semibold text-xs hover:bg-blue-600 hover:text-white transition w-full text-center relative overflow-hidden shadow-sm">
                    {uploading ? 'Subiendo...' : 'Seleccionar Foto'}
                    <input type="file" onChange={handleFileUpload} disabled={uploading} className="absolute inset-0 opacity-0 cursor-pointer"/>
                  </label>
                  {uploading && <p className="text-[10px] text-blue-600 font-bold animate-pulse">Cargando...</p>}
                </div>
              </div>

              <button 
                type="submit" 
                disabled={uploading} 
                className="w-full py-3.5 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-lg shadow-md transition transform active:scale-[0.98] disabled:opacity-70 text-sm tracking-wide"
              >
                {uploading ? '⏳ ESPERANDO IMAGEN...' : '💾 GUARDAR PASTOR'}
              </button>
            </form>
          </div>
        </div>

        {/* --- COLUMNA DERECHA: LISTADO --- */}
        <div className="lg:col-span-2">
           <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-gray-700 text-lg flex items-center gap-2">
                📋 Pastores Registrados 
                <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">{pastores.length}</span>
              </h2>
           </div>

          {/* Grid de Tarjetas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pastores.map(p => (
              <div key={p.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center gap-4 hover:border-blue-300 hover:shadow-md transition group">
                <img 
                  src={p.fotoUrl || 'https://via.placeholder.com/100?text=S/F'} 
                  alt="Avatar" 
                  className="w-14 h-14 rounded-full object-cover border border-gray-200 group-hover:border-blue-200 transition bg-gray-50" 
                />
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 text-base truncate capitalize">
                    {p.apellido}, {p.nombre}
                  </h3>
                  <p className="text-xs text-gray-500 mb-1 font-mono">DNI: {p.dni}</p>
                  
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100 truncate max-w-[120px]">
                      {p.iglesiaNombre || 'Sin Iglesia'}
                    </span>
                    {p.telefono && (
                      <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded border border-green-100">
                        📞 {p.telefono}
                      </span>
                    )}
                  </div>
                </div>
                
                <a 
                  href={`/#/credencial/${p.id}`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="shrink-0 bg-gray-50 text-blue-600 w-10 h-10 rounded-lg border border-gray-200 hover:bg-blue-600 hover:text-white hover:border-blue-700 transition flex items-center justify-center shadow-sm"
                  title="Ver Credencial"
                >
                  🆔
                </a>
              </div>
            ))}
            
            {pastores.length === 0 && (
              <div className="col-span-full bg-white rounded-xl p-10 text-center text-gray-400 border border-gray-200 border-dashed">
                <p className="text-4xl mb-3 opacity-50">📭</p>
                <p>No hay pastores registrados todavía.</p>
                <p className="text-sm mt-1 text-gray-300">Usa el formulario para agregar el primero.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

// --- COMPONENTE AUXILIAR PARA INPUTS ---
// Esto mantiene el diseño limpio y consistente
const Input = ({ label, val, set, type="text", required=true }) => (
  <div>
    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 pl-1">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    <input 
      type={type} 
      value={val} 
      onChange={e => set(e.target.value)} 
      className="w-full border border-gray-300 bg-white text-gray-900 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm shadow-sm" 
      placeholder={`...`}
      required={required}
    />
  </div>
);

export default Admin;