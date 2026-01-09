// client/src/pages/Admin.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Admin = () => {
  const [pastores, setPastores] = useState([]);
  const [form, setForm] = useState({ nombre: '', apellido: '', dni: '', iglesiaNombre: '', fotoUrl: '' });
  
  // Cambia esto por la URL de tu backend en Coolify cuando despliegues
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'; 

  useEffect(() => {
    cargarPastores();
  }, []);

  const cargarPastores = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/pastores`);
      setPastores(res.data);
    } catch (error) {
      console.error("Error cargando", error);
    }
  };

  const guardarPastor = async (e) => {
    e.preventDefault();
    await axios.post(`${API_URL}/api/pastores`, form);
    alert('Pastor Guardado');
    setForm({ nombre: '', apellido: '', dni: '', iglesiaNombre: '', fotoUrl: '' });
    cargarPastores();
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-blue-900 mb-6">Panel Admin MDS</h1>

      {/* FORMULARIO DE CARGA */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-lg font-bold mb-4">Nuevo Pastor</h2>
        <form onSubmit={guardarPastor} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input className="border p-2 rounded" placeholder="Nombre" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} required />
          <input className="border p-2 rounded" placeholder="Apellido" value={form.apellido} onChange={e => setForm({...form, apellido: e.target.value})} required />
          <input className="border p-2 rounded" placeholder="DNI" value={form.dni} onChange={e => setForm({...form, dni: e.target.value})} required />
          <input className="border p-2 rounded" placeholder="Nombre Iglesia" value={form.iglesiaNombre} onChange={e => setForm({...form, iglesiaNombre: e.target.value})} />
          <input className="border p-2 rounded" placeholder="URL Foto (ej: https://...)" value={form.fotoUrl} onChange={e => setForm({...form, fotoUrl: e.target.value})} />
          <button type="submit" className="bg-blue-900 text-white p-2 rounded hover:bg-blue-800">Guardar Pastor</button>
        </form>
      </div>

      {/* LISTA DE PASTORES */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-bold mb-4">Listado General</h2>
        <ul>
          {pastores.map(p => (
            <li key={p.id} className="border-b py-3 flex justify-between items-center">
              <div>
                <span className="font-bold text-gray-800">{p.apellido}, {p.nombre}</span>
                <span className="text-sm text-gray-500 ml-2">({p.dni})</span>
              </div>
              <a href={`/credencial/${p.id}`} target="_blank" className="text-blue-600 text-sm hover:underline">Ver Credencial</a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Admin;