// client/src/components/Credencial.jsx
import React from 'react';

const Credencial = ({ pastor }) => {
  const esValido = pastor.estado === 'HABILITADO';

  return (
    <div className="max-w-sm mx-auto bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200 mt-10 relative">
      {/* CINTA DE ESTADO (Visual rápida) */}
      <div className={`h-2 w-full ${esValido ? 'bg-blue-800' : 'bg-red-600'}`}></div>

      {/* HEADER */}
      <div className="bg-blue-900 p-6 text-center text-white">
        <h3 className="text-xs font-bold tracking-widest text-yellow-400 opacity-80 uppercase mb-1">Iglesia Cristiana Global</h3>
        <h1 className="text-2xl font-bold tracking-wide">MDS</h1>
        <p className="text-xs font-light">Mensaje de Salvación</p>
      </div>

      {/* FOTO Y DATOS */}
      <div className="px-6 pb-6 -mt-8 flex flex-col items-center relative z-10">
        {/* Foto Avatar */}
        <div className="p-1 bg-white rounded-full shadow-lg">
          <img 
            src={pastor.fotoUrl || "https://via.placeholder.com/150"} 
            alt="Pastor" 
            className={`w-32 h-32 rounded-full object-cover border-4 ${esValido ? 'border-blue-900' : 'border-red-500'}`}
          />
        </div>

        <h2 className="mt-4 text-xl font-bold text-gray-800 text-center uppercase">
          {pastor.nombre} {pastor.apellido}
        </h2>
        <div className="text-sm font-semibold text-blue-800 uppercase tracking-wide">Pastor Ordenado</div>

        {/* Estado Badge */}
        <span className={`mt-2 px-4 py-1 rounded-full text-xs font-bold text-white uppercase ${esValido ? 'bg-green-600' : 'bg-red-600'}`}>
          {pastor.estado}
        </span>

        {/* Tabla de Datos */}
        <div className="w-full mt-6 space-y-3 text-sm text-gray-600 border-t pt-4">
          <div className="flex justify-between">
            <span className="font-bold">DNI:</span>
            <span>{pastor.dni}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold">Fichero Culto:</span>
            <span>{pastor.ficheroCulto || "-"}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold">Iglesia:</span>
            <span className="text-right max-w-[150px] truncate">{pastor.iglesiaNombre}</span>
          </div>
        </div>
      </div>

      {/* FOOTER QR (Simulado) */}
      <div className="bg-gray-100 p-4 border-t flex items-center justify-between text-xs text-gray-400">
        <p>Credencial Digital Oficial</p>
        <div className="w-8 h-8 bg-gray-300 rounded flex items-center justify-center text-[8px]">QR</div>
      </div>
    </div>
  );
};

export default Credencial;