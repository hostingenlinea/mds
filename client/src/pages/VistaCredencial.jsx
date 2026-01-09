// client/src/pages/VistaCredencial.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Credencial from '../components/Credencial';

const VistaCredencial = () => {
  const { id } = useParams();
  const [pastor, setPastor] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    axios.get(`${API_URL}/api/pastores/${id}`)
      .then(res => setPastor(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center mt-10">Cargando datos...</div>;
  if (!pastor) return <div className="text-center mt-10 text-red-500 font-bold">Credencial No Encontrada</div>;

  return (
    <div className="min-h-screen bg-gray-200 p-4 flex items-center justify-center">
      <Credencial pastor={pastor} />
    </div>
  );
};

export default VistaCredencial;