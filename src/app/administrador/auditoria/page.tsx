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
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-light text-gray-900 tracking-tight">
                    Auditoría del Sistema
                  </h1>
                  <p className="text-gray-500 text-sm mt-1">
                    Monitoreo y trazabilidad de actividades del sistema
                  </p>
                </div>
              </div>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Activity className="w-4 h-4 text-blue-600" />
                    <span className="text-xs text-blue-600 font-medium">Total Logs</span>
                  </div>
                  <div className="text-2xl font-light text-gray-900">{logs.length}</div>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-xs text-green-600 font-medium">Éxitos</span>
                  </div>
                  <div className="text-2xl font-light text-gray-900">
                    {logs.filter(l => l.resultado === 'EXITOSO').length}
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span className="text-xs text-amber-600 font-medium">Parciales</span>
                  </div>
                  <div className="text-2xl font-light text-gray-900">
                    {logs.filter(l => l.resultado === 'PARCIAL').length}
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-purple-600" />
                    <span className="text-xs text-purple-600 font-medium">Usuarios</span>
                  </div>
                  <div className="text-2xl font-light text-gray-900">
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
