import React from 'react';
import { getAuditoriaLogs } from './actions';
import { AuditoriaTableClient } from './client';
import { Activity, ShieldCheck, TrendingUp, Users, AlertCircle } from 'lucide-react';

export const metadata = {
  title: 'Auditoría del Sistema | Administrador',
};

export default async function AuditoriaPage() {
  const logs = await getAuditoriaLogs();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Moderno */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex-1">
              <div className="flex flex-col mb-3">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                  <span className="w-1.5 h-8 bg-[#8B1E1E] rounded-full inline-block mr-1"></span>
                  Auditoría del Sistema
                </h1>
                <p className="text-gray-500 text-sm mt-1 ml-4 italic border-l-2 border-gray-100 pl-4">
                  Monitoreo y trazabilidad de actividades del sistema
                </p>
              </div>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-red-50/30 rounded-xl p-4 border border-[#8B1E1E]/10 hover:border-[#8B1E1E]/30 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <Activity className="w-4 h-4 text-[#8B1E1E]" />
                    <span className="text-xs text-[#8B1E1E] font-bold">Total Logs</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{logs.length}</div>
                </div>
                
                <div className="bg-green-50/30 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-xs text-green-600 font-bold">Éxitos</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {logs.filter(l => l.resultado === 'EXITOSO').length}
                  </div>
                </div>
                
                <div className="bg-amber-50/30 rounded-xl p-4 border border-amber-200">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span className="text-xs text-amber-600 font-bold">Parciales</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {logs.filter(l => l.resultado === 'PARCIAL').length}
                  </div>
                </div>
                
                <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-slate-600" />
                    <span className="text-xs text-slate-600 font-bold">Usuarios</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {new Set(logs.map(l => l.usuario?.correo).filter(Boolean)).size}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Table Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <AuditoriaTableClient initialData={logs} />
        </div>
      </div>
    </div>
  );
}
