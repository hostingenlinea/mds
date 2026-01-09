// client/src/pages/Perfil.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Credencial from '../components/Credencial';

const Perfil = () => {
  const [pastor, setPastor] = useState(null);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    // Leer usuario de la memoria
    const userStored = JSON.parse(localStorage.getItem('user'));
    if (!userStored) {
      navigate('/login');
      return;
    }

    // Buscar datos actualizados del pastor
    axios.get(`${API_URL}/api/pastores/${userStored.id}`)
      .then(res => setPastor(res.data))
      .catch(err => console.error(err));
  }, [navigate]);

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (!pastor) return <div className="p-10 text-center">Cargando datos...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-md flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-700">Mi Credencial</h2>
        <button onClick={logout} className="text-sm text-red-600 font-bold hover:underline">
          Cerrar Sesión
        </button>
      </div>
      
      {/* Reusamos el componente Credencial que ya creamos */}
      <Credencial pastor={pastor} />
      
      <p className="mt-8 text-sm text-gray-500 text-center max-w-xs">
        Esta es tu credencial oficial. Puedes mostrar este código QR para validar tu habilitación ministerial.
      </p>
    </div>
  );
};

export default Perfil;