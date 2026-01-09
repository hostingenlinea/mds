// client/src/components/Credencial.jsx
import React from 'react';
import QRCode from "react-qr-code";

const Credencial = ({ pastor }) => {
  const esValido = pastor.estado === 'HABILITADO';
  
  // Obtenemos la URL actual del navegador para generar el QR
  // Esto asegura que el QR siempre apunte a "esta misma credencial"
  const urlCredencial = window.location.href;

  return (
    <div className="max-w-sm mx-auto bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200 mt-10 relative font-sans">
      {/* CINTA DE ESTADO */}
      <div className={`h-3 w-full ${esValido ? 'bg-blue-900' : 'bg-red-600'}`}></div>

      {/* HEADER CON LOGO */}
      <div className="bg-slate-900 p-6 text-center text-white relative overflow-hidden">
        {/* Adorno de fondo */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-yellow-400 to-transparent"></div>
        
        <h3 className="text-[10px] font-bold tracking-[0.2em] text-yellow-500 opacity-90 uppercase mb-2 relative z-10">Iglesia Cristiana Global</h3>
        <h1 className="text-3xl font-black tracking-tighter text-white relative z-10">MDS</h1>
        <p className="text-xs font-light tracking-widest text-gray-300 relative z-10">MENSAJE DE SALVACIÓN</p>
      </div>

      {/* FOTO Y DATOS */}
      <div className="px-6 pb-6 -mt-10 flex flex-col items-center relative z-10">
        {/* Foto Avatar con borde de estado */}
        <div className="p-1.5 bg-white rounded-full shadow-lg">
          <img 
            src={pastor.fotoUrl || "https://via.placeholder.com/150?text=Sin+Foto"} 
            alt="Pastor" 
            className={`w-36 h-36 rounded-full object-cover border-4 ${esValido ? 'border-blue-900' : 'border-red-500'}`}
          />
        </div>

        <h2 className="mt-4 text-2xl font-bold text-gray-800 text-center uppercase leading-tight">
          {pastor.nombre} {pastor.apellido}
        </h2>
        <div className="text-sm font-bold text-blue-900 uppercase tracking-wide mt-1">Pastor Ordenado</div>

        {/* Badge de Estado */}
        <span className={`mt-3 px-6 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-widest shadow-sm ${esValido ? 'bg-green-600' : 'bg-red-600'}`}>
          {pastor.estado}
        </span>

        {/* Tabla de Datos */}
        <div className="w-full mt-6 space-y-3 text-sm text-gray-600 border-t border-gray-100 pt-4">
          <div className="flex justify-between items-center border-b border-gray-50 pb-2">
            <span className="font-bold text-gray-400 text-xs uppercase">Documento</span>
            <span className="font-medium text-gray-800">{pastor.dni}</span>
          </div>
          <div className="flex justify-between items-center border-b border-gray-50 pb-2">
            <span className="font-bold text-gray-400 text-xs uppercase">Fichero Culto</span>
            <span className="font-medium text-gray-800">{pastor.ficheroCulto || "-"}</span>
          </div>
          <div className="flex justify-between items-center pt-1">
            <span className="font-bold text-gray-400 text-xs uppercase">Congregación</span>
            <span className="font-medium text-gray-800 text-right max-w-[160px] leading-tight">{pastor.iglesiaNombre}</span>
          </div>
        </div>
      </div>

      {/* FOOTER CON QR REAL */}
      <div className="bg-gray-50 p-5 border-t border-gray-200 flex items-center justify-between gap-4">
        <div className="text-left">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Escanea para validar</p>
          <p className="text-[9px] text-gray-400 leading-tight mt-1 max-w-[120px]">
            Esta credencial es personal e intransferible. Válida solo si el estado es HABILITADO.
          </p>
        </div>
        
        {/* Componente QR Generado */}
        <div className="bg-white p-2 rounded shadow-sm border border-gray-200">
          <QRCode 
            value={urlCredencial} 
            size={64} 
            fgColor="#1e3a8a" // Azul oscuro
            level="L"
          />
        </div>
      </div>
    </div>
  );
};

export default Credencial;