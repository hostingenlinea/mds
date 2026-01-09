// client/src/pages/Admin.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const [pastores, setPastores] = useState([]);
  const navigate = useNavigate();
  
  // Estado del formulario con TODOS los campos nuevos
  const [form, setForm] = useState({ 
    nombre: '', 
    apellido: '', 
    dni: '', 
    iglesiaNombre: '', 
    email: '',          // Nuevo
    telefono: '',       // Nuevo
    nombrePastora: '',  // Nuevo
    fotoUrl: '' 
  });
  
  const [uploading, setUploading] = useState(false); 
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'; 

  // Verificar si es Admin al cargar (Seguridad extra frontend)
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.rol !== 'ADMIN') {
      navigate('/login');
    }
    cargarPastores();
  }, [navigate]);

  const cargarPastores = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/pastores`);
      setPastores(res.data);
    } catch (error) {
      console.error("Error cargando pastores", error);
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
      console.error("Error subiendo imagen", error);
      alert("Error al subir imagen");
    } finally {
      setUploading(false);
    }
  };

  const guardarPastor = async (e) => {
    e.preventDefault();
    try {
      // Enviamos todos los datos (incluyendo los nuevos)
      await axios.post(`${API_URL}/api/pastores`, form);
      alert('Pastor Registrado Correctamente');
      
      // Limpiar formulario completo
      setForm({ 
        nombre: '', apellido: '', dni: '', iglesiaNombre: '', 
        email: '', telefono: '', nombrePastora: '', fotoUrl: '' 
      });
      cargarPastores();
      
    } catch (error) {
      console.error(error);
      alert('Error al guardar. Revisa que el DNI no esté repetido.');
    }
  };

  const cerrarSesion = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8 border-b pb-4">
          <h1 className="text-3xl font-bold text-blue-900">Panel de Administración</h1>
          <button onClick={cerrarSesion} className="text-red-600 font-bold hover:underline text-sm">
            Cerrar Sesión 🔒
          </button>
        </div>

        {/* --- FORMULARIO --- */}
        <div className="bg-white p-8 rounded-lg shadow-lg mb-8 border border-gray-100">
          <h2 className="text-xl font-bold mb-6 text-gray-700 flex items-center gap-2">
            👤 Registrar Nuevo Pastor
          </h2>
          
          <form onSubmit={guardarPastor} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Columna Izquierda: Datos Personales */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Datos Principales</h3>
              <input className="w-full border p-3 rounded focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Nombre" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} required />
              <input className="w-full border p-3 rounded focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Apellido" value={form.apellido} onChange={e => setForm({...form, apellido: e.target.value})} required />
              <input className="w-full border p-3 rounded focus:ring-2 focus:ring-blue-500 outline-none" placeholder="DNI (Será el usuario)" value={form.dni} onChange={e => setForm({...form, dni: e.target.value})} required />
              <input className="w-full border p-3 rounded focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Nombre de la Iglesia" value={form.iglesiaNombre} onChange={e => setForm({...form, iglesiaNombre: e.target.value})} />
            </div>

            {/* Columna Derecha: Datos de Contacto y Familia */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Contacto y Familia</h3>
              <input type="email" className="w-full border p-3 rounded focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              <input type="tel" className="w-full border p-3 rounded focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Teléfono / WhatsApp" value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} />
              <input className="w-full border p-3 rounded focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Nombre de la Esposa/Pastora" value={form.nombrePastora} onChange={e => setForm({...form, nombrePastora: e.target.value})} />
            
              {/* Subida de Foto */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 mt-2 flex items-center gap-4">
                {form.fotoUrl ? (
                   <img src={form.fotoUrl} alt="Vista previa" className="w-12 h-12 rounded-full object-cover border-2 border-green-500" />
                ) : (
                   <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">📷</div>
                )}
                <div className="flex-1">
                  <label className="text-xs font-bold text-gray-500 block mb-1">Foto de Perfil</label>
                  <input type="file" accept="image/*" onChange={handleFileUpload} disabled={uploading} className="text-xs w-full text-gray-500" />
                  {uploading && <span className="text-blue-600 text-xs font-bold animate-pulse">Subiendo...</span>}
                </div>
              </div>
            </div>

            {/* Botón Guardar */}
            <div className="md:col-span-2 mt-4">
               <button type="submit" disabled={uploading} className="w-full py-4 rounded bg-blue-900 hover:bg-blue-800 text-white font-bold text-lg shadow-md transition">
                 {uploading ? '⏳ Esperando imagen...' : '💾 GUARDAR PASTOR'}
               </button>
            </div>
          </form>
        </div>

        {/* --- LISTADO --- */}
        <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-100">
          <h2 className="text-xl font-bold mb-6 text-gray-700">📋 Listado General</h2>
          <ul>
            {pastores.map(p => (
              <li key={p.id} className="border-b last:border-0 py-4 flex flex-col md:flex-row justify-between items-center hover:bg-gray-50 px-2 transition gap-4">
                
                {/* Info Principal */}
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <img src={p.fotoUrl || 'https://via.placeholder.com/150?text=?'} alt="Avatar" className="w-12 h-12 rounded-full object-cover border border-gray-300 shadow-sm" />
                  <div>
                    <span className="font-bold text-gray-800 block text-lg">{p.apellido}, {p.nombre}</span>
                    <div className="flex gap-2 text-xs text-gray-500">
                      <span className="bg-gray-100 px-2 py-0.5 rounded">DNI: {p.dni}</span>
                      {p.telefono && <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded">📞 {p.telefono}</span>}
                    </div>
                  </div>
                </div>

                {/* Botón Ver Credencial */}
                <a href={`/#/credencial/${p.id}`} target="_blank" rel="noreferrer" className="bg-white border border-blue-200 text-blue-700 px-4 py-2 rounded hover:bg-blue-50 text-sm font-bold transition flex items-center gap-2">
                  Ver Credencial 🆔
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Admin;