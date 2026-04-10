import React from 'react';
import { getVinculaciones, getEstadisticasVinculaciones } from './actions';
import { VinculacionesTableClient } from './client';
import { LinkIcon, Users, CheckCircle, XCircle, AlertTriangle, Clock, FileText, TrendingUp } from 'lucide-react';

export const metadata = { title: 'Vinculaciones Aliado | Administrador' };

export default async function VinculacionesPage() {
    const [vinculaciones, estadisticas] = await Promise.all([
        getVinculaciones(),
        getEstadisticasVinculaciones()
    ]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-[#8B1E1E]/10 rounded-xl mt-0.5">
                        <LinkIcon className="w-5 h-5 text-[#8B1E1E]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-[#1e293b]">Vinculaciones Aliado-Programa</h1>
                        <p className="text-[#64748b] text-sm mt-0.5">Flujo de revisión y aprobación de convenios entre aliados y programas académicos.</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="text-right">
                        <div className="text-2xl font-bold text-[#1e293b]">{estadisticas.tasaAprobacion}%</div>
                        <div className="text-xs text-[#64748b]">Tasa de aprobación</div>
                    </div>
                    <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
            </div>

            {/* Tarjetas de estadísticas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <div className="bg-white rounded-xl border border-[#e2e8f0] p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="text-2xl font-bold text-[#1e293b]">{estadisticas.total}</span>
                    </div>
                    <p className="text-sm font-semibold text-[#1e293b]">Total Vinculaciones</p>
                    <p className="text-xs text-[#94a3b8] mt-1">Registradas en el sistema</p>
                </div>

                <div className="bg-white rounded-xl border border-[#e2e8f0] p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-yellow-50 rounded-lg">
                            <Clock className="w-5 h-5 text-yellow-600" />
                        </div>
                        <span className="text-2xl font-bold text-[#1e293b]">{estadisticas.pendientes}</span>
                    </div>
                    <p className="text-sm font-semibold text-[#1e293b]">Pendientes</p>
                    <p className="text-xs text-[#94a3b8] mt-1">Esperando revisión</p>
                </div>

                <div className="bg-white rounded-xl border border-[#e2e8f0] p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-green-50 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <span className="text-2xl font-bold text-[#1e293b]">{estadisticas.aprobadas}</span>
                    </div>
                    <p className="text-sm font-semibold text-[#1e293b]">Aprobadas</p>
                    <p className="text-xs text-[#94a3b8] mt-1">Convenios activos</p>
                </div>

                <div className="bg-white rounded-xl border border-[#e2e8f0] p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-red-50 rounded-lg">
                            <XCircle className="w-5 h-5 text-red-600" />
                        </div>
                        <span className="text-2xl font-bold text-[#1e293b]">{estadisticas.rechazadas}</span>
                    </div>
                    <p className="text-sm font-semibold text-[#1e293b]">Rechazadas</p>
                    <p className="text-xs text-[#94a3b8] mt-1">Convenios cancelados</p>
                </div>

                <div className="bg-white rounded-xl border border-[#e2e8f0] p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-orange-50 rounded-lg">
                            <AlertTriangle className="w-5 h-5 text-orange-600" />
                        </div>
                        <span className="text-2xl font-bold text-[#1e293b]">{estadisticas.suspendidas}</span>
                    </div>
                    <p className="text-sm font-semibold text-[#1e293b]">Suspendidas</p>
                    <p className="text-xs text-[#94a3b8] mt-1">Temporalmente inactivas</p>
                </div>

                <div className="bg-white rounded-xl border border-[#e2e8f0] p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-gray-50 rounded-lg">
                            <FileText className="w-5 h-5 text-gray-600" />
                        </div>
                        <span className="text-2xl font-bold text-[#1e293b]">{estadisticas.vencidas}</span>
                    </div>
                    <p className="text-sm font-semibold text-[#1e293b]">Vencidas</p>
                    <p className="text-xs text-[#94a3b8] mt-1">Convenios expirados</p>
                </div>
            </div>

            {/* Tabla de vinculaciones */}
            <div className="bg-white rounded-xl border border-[#e2e8f0]">
                <VinculacionesTableClient initialData={vinculaciones as any} />
            </div>
        </div>
    );
}
