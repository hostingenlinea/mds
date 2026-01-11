import React from 'react';
import QRCode from "react-qr-code";
import { ShieldCheck, ShieldX } from 'lucide-react';

const Credencial = ({ pastor }) => {
  const esValido = pastor.estado === 'HABILITADO';
  const urlCredencial = window.location.href;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 antialiased font-sans">
      
      <div className="w-full max-w-[360px] bg-white rounded-3xl overflow-hidden shadow-2xl relative pb-8">
        
        {/* --- HEADER AZUL --- */}
        {/* Aumenté la altura a h-48 para dar más espacio */}
        <div className="bg-[#0f172a] h-48 relative overflow-hidden flex justify-center pt-8">
            <div className="text-center relative z-10">
                {/* Texto MDS (Solo MDS) */}
                <h1 className="text-white font-serif font-bold text-3xl tracking-widest">MDS</h1>
                <p className="text-blue-200 text-[10px] font-bold uppercase tracking-[0.3em] mt-1"></p>
            </div>
        </div>

        {/* --- FOTO DE PERFIL --- */}
        {/* Ajusté el margen negativo para bajar la foto un poco */}
        <div className="flex justify-center -mt-20 mb-3 relative z-20">
            <div className="p-1.5 bg-white rounded-full shadow-lg">
                <div className="relative">
                    <img 
                      src={pastor.fotoUrl || "https://via.placeholder.com/150"} 
                      alt="Pastor" 
                      className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-inner bg-gray-200"
                    />
                    {/* Icono de Estado */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0">
                         {/* Truco para centrar visualmente */}
                    </div>
                </div>
            </div>
            {/* Badge de estado flotante pequeño */}
            <div className={`absolute bottom-0 bg-white rounded-full p-1 shadow-md border border-gray-100`}>
                 {esValido ? <ShieldCheck size={20} className="text-blue-500 fill-blue-50"/> : <ShieldX size={20} className="text-red-500"/>}
            </div>
        </div>

        {/* --- DATOS --- */}
        <div className="text-center px-6">
            <h2 className="text-xl font-black text-slate-900 uppercase leading-none mb-1">{pastor.nombre}</h2>
            <h2 className="text-xl font-black text-slate-900 uppercase leading-none mb-2">{pastor.apellido}</h2>
            
            <p className="text-blue-600 font-bold text-xs uppercase tracking-wider mb-6">Pastor Ordenado</p>

            {/* Tarjeta de DNI */}
            <div className="bg-gray-50 rounded-xl p-3 mb-3 border border-gray-100">
                <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Documento de Identidad</p>
                <p className="text-xl font-mono font-bold text-slate-800 tracking-wider">{pastor.dni}</p>
            </div>

             {/* Tarjeta de Estado */}
            <div className={`rounded-xl p-3 mb-6 border ${esValido ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Estado Credencial</p>
                <div className="flex items-center justify-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${esValido ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <p className={`text-sm font-bold uppercase ${esValido ? 'text-green-700' : 'text-red-700'}`}>
                        {pastor.estado}
                    </p>
                </div>
            </div>

            {/* QR */}
            <div className="flex justify-center mb-4">
                <div className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm">
                    <QRCode value={urlCredencial} size={80} level="M" />
                </div>
            </div>
            <p className="text-[9px] text-gray-300 uppercase font-bold tracking-widest">Verificación Digital MDS</p>

        </div>
      </div>
      
      {/* Fondo decorativo inferior estilo MDS Global */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-[#0f172a] rounded-t-[3rem] -z-10 translate-y-16"></div>
    </div>
  );
};

export default Credencial;