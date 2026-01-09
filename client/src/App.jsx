// client/src/App.jsx
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import axios from 'axios';

// Importamos las páginas
import Admin from './pages/Admin';
import Credencial from './components/Credencial';

// --- COMPONENTE ENVOLTORIO PARA LA CREDENCIAL ---
// Este componente se encarga de buscar los datos del pastor según la ID de la URL
const CredencialWrapper = () => {
  const { id } = useParams(); // Obtiene el ID de la URL (ej: 123)
  const [pastor, setPastor] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    const fetchPastor = async () => {
      try {
        // Busca al pastor específico por su ID en el backend
        const res = await axios.get(`${API_URL}/api/pastores`);
        const pastorEncontrado = res.data.find(p => p.id.toString() === id);
        setPastor(pastorEncontrado);
      } catch (error) {
        console.error("Error buscando pastor", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPastor();
  }, [id]);

  if (loading) return <div className="p-10 text-center">Cargando credencial...</div>;
  if (!pastor) return <div className="p-10 text-center text-red-600">Pastor no encontrado o ID incorrecto.</div>;

  // Si lo encuentra, muestra el diseño de la credencial
  return <Credencial pastor={pastor} />;
};


// --- COMPONENTE PRINCIPAL APP (EL MAPA) ---
function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          {/* Ruta principal: Muestra el Panel Admin */}
          <Route path="/" element={<Admin />} />
          
          {/* Ruta de credencial: Muestra la credencial específica */}
          <Route path="/credencial/:id" element={<CredencialWrapper />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;