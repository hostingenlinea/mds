import React from 'react';
import QRCode from "react-qr-code";
import { CheckCircle2, AlertCircle } from 'lucide-react';

const Credencial = ({ pastor }) => {
  const esValido = pastor.estado === 'HABILITADO';
  const urlCredencial = window.location.href;

  return (
    <div className="flex flex-col gap-8 items-center justify-center p-4 bg-gray-100 min-h-screen font-sans">
      
      {/* --- FRENTE DE LA CREDENCIAL --- */}
      <div className="w-[320px] h-[540px] bg-white rounded-[30px] shadow-2xl overflow-hidden relative flex flex-col items-center border border-gray-100">
        
        {/* Cabecera Azul Oscura Curva */}
        <div className="w-full h-36 bg-[#0f172a] relative">
            <div className="absolute top-6 w-full text-center">
                <h1 className="text-white font-serif text-lg tracking-widest opacity-90">MDS GLOBAL</h1>
            </div>
        </div>

        {/* Foto Perfil Flotante */}
        <div className="-mt-16 relative z-10">
          <div className="p-1 bg-white rounded-full shadow-lg">
            <img 
              src={pastor.fotoUrl || 'https://via.placeholder.com/150'} 
              className="w-32 h-32 rounded-full object-cover border-4 border-[#0f172a]" 
            />
          </div>
        </div>

        {/* Datos Principales */}
        <div className="text-center mt-4 px-6 w-full flex-1 flex flex-col">
           <h2 className="text-2xl font-black text-[#0f172a] leading-tight uppercase font-sans">
             {pastor.nombre} <br/> {pastor.apellido}
           </h2>
           <p className="text-blue-600 font-bold text-xs tracking-[0.2em] uppercase mt-2">Pastor Ordenado</p>
           
           <div className="mt-6 space-y-4">
               {/* Caja DNI */}
               <div className="bg-gray-50 py-2 px-4 rounded-xl border border-gray-100">
                 <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Documento de Identidad</p>
                 <p className="text-xl font-black text-gray-800 tracking-wide">{pastor.dni}</p>
               </div>

               {/* Caja Estado */}
               <div className={`py-2 px-4 rounded-xl border-2 ${esValido ? 'border-green-100 bg-green-50/50' : 'border-red-100 bg-red-50/50'}`}>
                 <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Estado Credencial</p>
                 <div className={`flex items-center justify-center gap-2 text-sm font-black uppercase ${esValido ? 'text-green-600' : 'text-red-600'}`}>
                    {esValido ? <CheckCircle2 size={16}/> : <AlertCircle size={16}/>}
                    {esValido ? 'HABILITADO' : 'SUSPENDIDO'}
                 </div>
               </div>
           </div>

           {/* QR al pie */}
           <div className="mt-auto mb-6 flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition">
              <div className="p-1.5 bg-white border border-gray-200 rounded-lg">
                 <QRCode value={urlCredencial} size={50} />
              </div>
              <p className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">Verificación Digital MDS</p>
           </div>
        </div>
      </div>

      {/* --- DORSO (REVERSO) --- */}
      <div className="w-[320px] h-[540px] bg-[#0f172a] rounded-[30px] shadow-2xl overflow-hidden relative flex flex-col p-8 text-white">
          <h3 className="text-blue-400 font-bold italic mb-8 border-b border-blue-900 pb-4">MENSAJE DE SALVACIÓN</h3>
          
          <div className="space-y-6 flex-1">
             <div>
               <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Jurisdicción Sede</p>
               <p className="font-bold text-lg leading-tight">{pastor.iglesiaNombre || 'Sede Central Global'}</p>
             </div>
             
             <div className="grid grid-cols-1 gap-4">
               <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                  <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Fichero de Culto</p>
                  <p className="font-mono text-sm tracking-widest text-white">FC-99283</p>
               </div>
               <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                  <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Personería Jurídica</p>
                  <p className="font-mono text-sm tracking-widest text-white">PJ-001293</p>
               </div>
             </div>

             <div className="pt-4">
                <p className="text-xs italic text-gray-400 leading-relaxed">
                  "Y les dijo: Id por todo el mundo y predicad el evangelio a toda criatura."
                </p>
                <p className="text-[10px] text-blue-400 font-bold mt-1 text-right">- Marcos 16:15</p>
             </div>
          </div>

          <div className="mt-auto pt-6 border-t border-gray-800 flex justify-between items-end">
             <div className="w-24 border-t border-gray-500 pt-1 text-center">
                <p className="text-[8px] text-gray-500 font-bold uppercase">Firma Autorizada</p>
             </div>
             <div className="bg-white text-[#0f172a] text-[10px] font-black px-2 py-1 rounded">MDS</div>
          </div>
          
          <p className="text-[8px] text-center text-gray-600 font-bold uppercase mt-4">
             www.mdsglobal.org
          </p>
      </div>

    </div>
  );
};

export default Credencial;