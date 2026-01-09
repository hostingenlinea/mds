// client/src/App.jsx
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useParams, Navigate } from 'react-router-dom';
import axios from 'axios';

// Importamos las páginas
import Login from './pages/Login';
import Admin from './pages/Admin';
import Perfil from './pages/Perfil';
import Credencial from './components/Credencial';

// --- COMPONENTE PROTECTOR DE RUTAS ---
// Verifica si hay usuario logueado. Si no, manda al Login.
const PrivateRoute = ({ children, adminOnly = false }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  
  if (!user) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && user.rol !== 'ADMIN') {
    return <Navigate to="/perfil" />;
  }

  return children;
};

// --- COMPONENTE VISUALIZADOR PÚBLICO (Cualquiera puede verlo con el link) ---
const CredencialPublica = () => {
  const { id } = useParams();
  const [pastor, setPastor] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    const fetchPastor = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/pastores/${id}`);
        setPastor(res.data);
      } catch (error) {
        console.error("Error", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPastor();
  }, [id]);

  if (loading) return <div className="p-10 text-center">Cargando...</div>;
  if (!pastor) return <div className="p-10 text-center text-red-600">Credencial no encontrada.</div>;

  return <Credencial pastor={pastor} />;
};

// --- APP PRINCIPAL ---
function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          {/* Ruta Pública (Login es la entrada por defecto) */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          
          {/* Ruta Pública (Ver credencial escaneando QR) */}
          <Route path="/credencial/:id" element={<CredencialPublica />} />

          {/* Ruta Privada: SOLO ADMIN */}
          <Route path="/admin" element={
            <PrivateRoute adminOnly={true}>
              <Admin />
            </PrivateRoute>
          } />

          {/* Ruta Privada: CUALQUIER USUARIO REGISTRADO */}
          <Route path="/perfil" element={
            <PrivateRoute>
              <Perfil />
            </PrivateRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;