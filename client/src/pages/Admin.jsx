// client/src/pages/Admin.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Admin = () => {
  const [pastores, setPastores] = useState([]);
  
  // Estado del formulario
  const [form, setForm] = useState({ 
    nombre: '', 
    apellido: '', 
    dni: '', 
    iglesiaNombre: '', 
    fotoUrl: '' 
  });
  
  // Estado de carga para la imagen
  const [uploading, setUploading] = useState(false); 

  // URL del Backend (toma la variable de entorno o usa localhost por defecto)
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'; 

  // Cargar pastores al iniciar
  useEffect(() => {
    cargarPastores();
  }, []);

  const cargarPastores = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/pastores`);
      setPastores(res.data);
    } catch (error) {
      console.error("Error cargando pastores", error);
    }
  };

  // --- FUNCIÓN DE SUBIDA DE IMAGEN (MinIO) ---
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true); // Activa el texto "Subiendo..."
    
    const formData = new FormData();
    formData.append('foto', file); // 'foto' debe coincidir con el backend

    try {
      // Enviamos el archivo al endpoint que creamos en el server
      const res = await axios.post(`${API_URL}/api/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // El servidor responde con la URL pública de la imagen
      // La guardamos en el estado del formulario
      setForm({ ...form, fotoUrl: res.data.url });
      
    } catch (error) {
      console.error("Error subiendo imagen", error);
      alert("Error al subir la imagen. Revisa que el Backend tenga las claves de MinIO bien puestas.");
    } finally {
      setUploading(false); // Apaga el texto de carga
    }
  };

  // --- GUARDAR EN BASE DE DATOS ---
  const guardarPastor = async (e) => {
    e.preventDefault();
    
    try {
      await axios.post(`${API_URL}/api/pastores`, form);
      alert('Pastor Guardado Correctamente');
      
      // Limpiar formulario
      setForm({ nombre: '', apellido: '', dni: '', iglesiaNombre: '', fotoUrl: '' });
      // Recargar lista
      cargarPastores();
      
    } catch (error) {
      console.error(error);
      alert('Error al guardar datos. Revisa la consola.');
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-900 mb-8 border-b pb-4">Panel Admin MDS</h1>

        {/* --- FORMULARIO DE CARGA --- */}
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8 border border-gray-100">
          <h2 className="text-xl font-bold mb-4 text-gray-700">Registrar Nuevo Pastor</h2>
          
          <form onSubmit={guardarPastor} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Campos de Texto */}
            <div className="space-y-4">
              <input 
                className="w-full border p-3 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                placeholder="Nombre" 
                value={form.nombre} 
                onChange={e => setForm({...form, nombre: e.target.value})} 
                required 
              />
              <input 
                className="w-full border p-3 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                placeholder="Apellido" 
                value={form.apellido} 
                onChange={e => setForm({...form, apellido: e.target.value})} 
                required 
              />
              <input 
                className="w-full border p-3 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                placeholder="DNI" 
                value={form.dni} 
                onChange={e => setForm({...form, dni: e.target.value})} 
                required 
              />
              <input 
                className="w-full border p-3 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                placeholder="Nombre de la Iglesia" 
                value={form.iglesiaNombre} 
                onChange={e => setForm({...form, iglesiaNombre: e.target.value})} 
              />
            </div>

            {/* Campo de Subida de Foto */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition">
              <label className="text-sm font-bold text-gray-600 mb-2">Foto de Perfil</label>
              
              {/* Previsualización si ya subió imagen */}
              {form.fotoUrl ? (
                <div className="mb-3 text-center">
                  <img src={form.fotoUrl} alt="Vista previa" className="w-20 h-20 object-cover rounded-full mx-auto border-2 border-green-500 shadow-sm" />
                  <span className="text-xs text-green-600 font-bold block mt-1">¡Imagen Lista!</span>
                </div>
              ) : (
                <div className="mb-3 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}

              <input 
                type="file" 
                accept="image/*"
                onChange={handleFileUpload} 
                disabled={uploading}
                className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              
              {uploading && <p className="text-blue-600 text-sm font-bold mt-2 animate-pulse">Subiendo a la nube... ☁️</p>}
            </div>

            {/* Botón Guardar */}
            <div className="md:col-span-2">
               <button 
                 type="submit" 
                 disabled={uploading} 
                 className={`w-full py-3 rounded text-white font-bold transition shadow-md ${uploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-900 hover:bg-blue-800'}`}
               >
                 {uploading ? 'Espera a que suba la imagen...' : 'GUARDAR PASTOR'}
               </button>
            </div>
          </form>
        </div>

        {/* --- LISTADO --- */}
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100">
          <h2 className="text-xl font-bold mb-4 text-gray-700">Listado General</h2>
          <ul>
            {pastores.map(p => (
              <li key={p.id} className="border-b last:border-0 py-4 flex justify-between items-center hover:bg-gray-50 px-2 transition">
                <div className="flex items-center gap-4">
                  {/* Miniatura */}
                  <img 
                    src={p.fotoUrl || 'https://via.placeholder.com/150?text=Sin+Foto'} 
                    alt="Avatar" 
                    className="w-12 h-12 rounded-full object-cover border border-gray-300 shadow-sm" 
                  />
                  <div>
                    <span className="font-bold text-gray-800 block text-lg">{p.apellido}, {p.nombre}</span>
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded">DNI: {p.dni}</span>
                  </div>
                </div>
                
                {/* Botón Ver Credencial (Con el enlace arreglado para HashRouter) */}
                <a 
                  href={`/#/credencial/${p.id}`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="bg-blue-100 text-blue-700 px-4 py-2 rounded hover:bg-blue-200 text-sm font-bold transition"
                >
                  Ver Credencial 🆔
                </a>
              </li>
            ))}
          </ul>
          {pastores.length === 0 && <p className="text-gray-500 text-center py-4">Aún no hay pastores registrados.</p>}
        </div>
      </div>
    </div>
  );
};

export default Admin;