import React from 'react';
import QRCode from "react-qr-code";
import { ShieldCheck, ShieldX } from 'lucide-react';

const Credencial = ({ pastor }) => {
  const esValido = pastor.estado === 'HABILITADO';
  const urlCredencial = window.location.href;

  return (
    // Fondo general de la página de credencial
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 antialiased font-sans">
      
      {/* TARJETA DE CREDENCIAL OFICIAL */}
      <div className="w-full max-w-[380px] bg-white rounded-2xl overflow-hidden shadow-2xl relative">
        
        {/* --- CABECERA INSTITUCIONAL (Color Principal) --- */}
        <div className="bg-brand-primary h-40 relative overflow-hidden flex justify-center items-start pt-8">
            {/* Patrón de fondo sutil */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--brand-accent),_transparent_70%)]"></div>
            
            <div className="text-center relative z-10">
                <h1 className="text-white font-black text-3xl tracking-tight leading-none">MDS</h1>
                <p className="text-brand-accent text-xs font-bold uppercase tracking-[0.2em] mt-1">Mensaje de Salvación</p>
            </div>
        </div>

        {/* --- CUERPO DE LA CREDENCIAL --- */}
        <div className="px-6 pb-8 relative">
            
            {/* FOTO DE PERFIL FLOTANTE */}
            <div className="flex justify-center -mt-20 mb-4 relative">
                <div className="p-1 bg-white rounded-full shadow-lg">
                    <img 
                      src={pastor.fotoUrl || "https://via.placeholder.com/150?text=Foto"} 
                      alt="Pastor" 
                      className={`w-36 h-36 rounded-full object-cover border-4 ${esValido ? 'border-brand-accent' : 'border-red-500'}`}
                    />
                </div>
                {/* Icono de Estado */}
                <div className={`absolute bottom-2 right-1/3 translate-x-4 p-2 rounded-full text-white shadow-md border-2 border-white ${esValido ? 'bg-green-500' : 'bg-red-500'}`}>
                    {esValido ? <ShieldCheck size={20} /> : <ShieldX size={20} />}
                </div>
            </div>

            {/* DATOS PRINCIPALES */}
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 leading-tight capitalize">{pastor.nombre} {pastor.apellido}</h2>
                <div className="inline-block bg-brand-primary/10 text-brand-primary text-xs font-black uppercase px-3 py-1 rounded-full mt-2 tracking-wider border border-brand-primary/20">
                    Ministro Ordenado
                </div>
            </div>

            {/* TABLA DE DATOS FORMAL */}
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 mb-6 space-y-3 text-sm relative overflow-hidden">
                {/* Barra lateral de acento */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-primary"></div>
                
                <DataRow label="Documento (DNI)" value={pastor.dni} />
                <DataRow label="Congregación" value={p.iglesiaNombre || 'N/A'} />
                {pastor.nombrePastora && <DataRow label="Cónyuge" value={pastor.nombrePastora} />}
                
                {/* Estado */}
                <div className="flex justify-between items-center pt-2 border-t border-gray-200 mt-2">
                    <span className="text-gray-500 font-medium text-xs uppercase">Estado</span>
                    <span className={`font-bold text-xs px-2 py-0.5 rounded uppercase ${esValido ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {pastor.estado}
                    </span>
                </div>
            </div>

            {/* CÓDIGO QR DE VALIDACIÓN */}
            <div className="flex flex-col items-center gap-3">
                <div className="bg-white p-2 rounded-xl border-2 border-dashed border-brand-primary/30">
                    <QRCode 
                        value={urlCredencial} 
                        size={100} 
                        bgColor="#FFFFFF"
                        fgColor="var(--brand-primary)" // Usa el color de la marca
                        level="M"
                    />
                </div>
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider text-center max-w-[200px]">
                    Escanee para validar autenticidad oficial
                </p>
            </div>

        </div>
        
        {/* PIE DE PÁGINA */}
        <div className="bg-gray-100 py-3 text-center border-t border-gray-200">
            <p className="text-[10px] text-gray-500 font-medium">Documento Digital Oficial • MDS</p>
        </div>
      </div>
    </div>
  );
};

// Componente auxiliar para filas de datos
const DataRow = ({ label, value }) => (
    <div className="flex justify-between items-center">
        <span className="text-gray-500 font-medium text-xs uppercase truncate pr-4">{label}</span>
        <span className="text-gray-900 font-bold text-right truncate flex-1">{value}</span>
    </div>
);

export default Credencial;