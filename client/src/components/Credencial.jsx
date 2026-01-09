import React from 'react';
import QRCode from "react-qr-code";

const Credencial = ({ pastor }) => {
  const esValido = pastor.estado === 'HABILITADO';
  const urlCredencial = window.location.href;

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      {/* TARJETA PRINCIPAL */}
      <div className="w-full max-w-sm bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-700 relative">
        
        {/* EFECTO DE BRILLO DE FONDO */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-blue-500 opacity-10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-purple-500 opacity-10 blur-3xl"></div>

        {/* CINTA DE ESTADO SUPERIOR */}
        <div className={`h-2 w-full ${esValido ? 'bg-gradient-to-r from-green-400 to-emerald-600' : 'bg-red-600'}`}></div>

        <div className="p-8 relative z-10 flex flex-col items-center">
          
          {/* HEADER */}
          <div className="text-center mb-6">
            <h3 className="text-xs font-bold tracking-[0.3em] text-blue-400 uppercase mb-1">Iglesia Cristiana Global</h3>
            <h1 className="text-4xl font-black tracking-tighter text-white">MDS</h1>
            <p className="text-[10px] text-gray-400 tracking-widest uppercase mt-1">Mensaje de Salvación</p>
          </div>

          {/* FOTO DE PERFIL CON ANILLO */}
          <div className="relative mb-6 group">
            <div className={`absolute -inset-1 rounded-full blur opacity-40 transition group-hover:opacity-75 ${esValido ? 'bg-gradient-to-r from-blue-400 to-emerald-400' : 'bg-red-600'}`}></div>
            <img 
              src={pastor.fotoUrl || "https://via.placeholder.com/150?text=Sin+Foto"} 
              alt="Pastor" 
              className="relative w-40 h-40 rounded-full object-cover border-4 border-slate-800 shadow-xl"
            />
            {/* Badge de estado flotante */}
            <span className={`absolute bottom-2 right-2 px-3 py-1 rounded-full text-[10px] font-black text-white uppercase shadow-lg border border-slate-900 ${esValido ? 'bg-emerald-500' : 'bg-red-500'}`}>
              {esValido ? 'ACTIVO' : 'INACTIVO'}
            </span>
          </div>

          {/* NOMBRE Y CARGO */}
          <h2 className="text-2xl font-bold text-white text-center leading-tight mb-1">
            {pastor.nombre} {pastor.apellido}
          </h2>
          <div className="text-sm font-semibold text-blue-300 uppercase tracking-wide mb-6">Pastor Ordenado</div>

          {/* DATOS EN GRID */}
          <div className="w-full bg-slate-800/50 rounded-xl p-4 border border-slate-700 backdrop-blur-sm mb-6">
            <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-center">
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-bold">Documento</p>
                <p className="text-sm text-gray-200 font-mono">{pastor.dni}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-bold">Iglesia</p>
                <p className="text-sm text-gray-200 truncate">{pastor.iglesiaNombre}</p>
              </div>
            </div>
          </div>

          {/* CÓDIGO QR */}
          <div className="bg-white p-3 rounded-xl shadow-lg transform transition hover:scale-105 duration-300">
            <QRCode 
              value={urlCredencial} 
              size={120} 
              fgColor="#0f172a" 
              level="M"
            />
          </div>
          <p className="text-[10px] text-gray-500 mt-4 text-center max-w-[200px]">
            Escanea este código para validar la autenticidad de esta credencial digital.
          </p>

        </div>
      </div>
    </div>
  );
};

export default Credencial;