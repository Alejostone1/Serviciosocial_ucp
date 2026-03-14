import React from 'react';
import { getPostulaciones, getEstadisticasPostulaciones, getOpcionesFiltros } from './actions';
import { PostulacionesDashboardClient } from './dashboard-client';
import { ClipboardList, Users, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export const metadata = { title: 'Postulaciones | Administrador' };

export default async function PostulacionesPage() {
    const [postulaciones, estadisticas, opciones] = await Promise.all([
        getPostulaciones(),
        getEstadisticasPostulaciones(),
        getOpcionesFiltros()
    ]);

    const pendientes = postulaciones.filter(p => p.estado === 'PENDIENTE').length;
    const enRevision = postulaciones.filter(p => p.estado === 'EN_REVISION').length;
    const aceptadas = postulaciones.filter(p => p.estado === 'ACEPTADA').length;
    const rechazadas = postulaciones.filter(p => p.estado === 'RECHAZADA').length;

    return (
        <div className="space-y-6">
            {/* Header con métricas principales */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <ClipboardList className="w-6 h-6 text-[#8B1E1E]" />
                        <h1 className="text-2xl font-bold text-[#1e293b]">Gestión de Postulaciones</h1>
                    </div>
                    <p className="text-[#64748b] text-sm">Sistema integral de revisión y gestión de postulaciones a convocatorias de servicio social.</p>
                </div>
                {pendientes > 0 && (
                    <span className="shrink-0 text-sm font-bold px-4 py-2 bg-yellow-100 text-yellow-800 rounded-xl border border-yellow-200 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {pendientes} pendiente{pendientes !== 1 ? 's' : ''}
                    </span>
                )}
            </div>

            {/* Tarjetas de estadísticas principales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-[#e2e8f0] p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="text-2xl font-bold text-[#1e293b]">{estadisticas.totalPostulaciones}</span>
                    </div>
                    <p className="text-sm font-semibold text-[#1e293b]">Total Postulaciones</p>
                    <p className="text-xs text-[#94a3b8] mt-1">En el sistema</p>
                </div>

                <div className="bg-white rounded-xl border border-[#e2e8f0] p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-yellow-50 rounded-lg">
                            <Clock className="w-5 h-5 text-yellow-600" />
                        </div>
                        <span className="text-2xl font-bold text-[#1e293b]">{pendientes + enRevision}</span>
                    </div>
                    <p className="text-sm font-semibold text-[#1e293b]">En Revisión</p>
                    <p className="text-xs text-[#94a3b8] mt-1">Pendientes + En proceso</p>
                </div>

                <div className="bg-white rounded-xl border border-[#e2e8f0] p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-green-50 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <span className="text-2xl font-bold text-[#1e293b]">{aceptadas}</span>
                    </div>
                    <p className="text-sm font-semibold text-[#1e293b]">Aceptadas</p>
                    <p className="text-xs text-[#94a3b8] mt-1">Aprobadas para participar</p>
                </div>

                <div className="bg-white rounded-xl border border-[#e2e8f0] p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-red-50 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                        </div>
                        <span className="text-2xl font-bold text-[#1e293b]">{rechazadas}</span>
                    </div>
                    <p className="text-sm font-semibold text-[#1e293b]">Rechazadas</p>
                    <p className="text-xs text-[#94a3b8] mt-1">No seleccionadas</p>
                </div>
            </div>

            {/* Dashboard principal */}
            <PostulacionesDashboardClient 
                initialData={postulaciones} 
                estadisticas={estadisticas}
                opcionesFiltros={opciones}
            />
        </div>
    );
}
