import React from 'react';
import { getActividades, getEstadisticasActividades, getOpcionesFiltros } from './actions';
import { ActividadesDashboardClient } from './dashboard-client';
import { Calendar, Clock, Users, TrendingUp, CheckCircle, AlertCircle, Activity } from 'lucide-react';

export const metadata = { title: 'Gestión de Actividades | Administrador' };

export default async function ActividadesPage() {
    const [actividades, estadisticas, opciones] = await Promise.all([
        getActividades(),
        getEstadisticasActividades(),
        getOpcionesFiltros()
    ]);

    const actividadesActivas = actividades.filter(a => a.esta_activa).length;
    const actividadesInactivas = actividades.filter(a => !a.esta_activa).length;
    const actividadesConReportes = actividades.filter(a => a.reportes.length > 0).length;
    const actividadesSinReportes = actividades.filter(a => a.reportes.length === 0).length;

    return (
        <div className="space-y-6">
            {/* Header con métricas principales */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Activity className="w-6 h-6 text-[#8B1E1E]" />
                        <h1 className="text-2xl font-bold text-[#1e293b]">Gestión de Actividades</h1>
                    </div>
                    <p className="text-[#64748b] text-sm">Sistema integral de gestión de actividades de servicio social y seguimiento de horas.</p>
                </div>
                {estadisticas.actividadesConLimiteVencido > 0 && (
                    <span className="shrink-0 text-sm font-bold px-4 py-2 bg-red-100 text-red-800 rounded-xl border border-red-200 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {estadisticas.actividadesConLimiteVencido} con límite vencido
                    </span>
                )}
            </div>

            {/* Tarjetas de estadísticas principales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-[#e2e8f0] p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <Activity className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="text-2xl font-bold text-[#1e293b]">{estadisticas.totalActividades}</span>
                    </div>
                    <p className="text-sm font-semibold text-[#1e293b]">Total Actividades</p>
                    <p className="text-xs text-[#94a3b8] mt-1">En el sistema</p>
                </div>

                <div className="bg-white rounded-xl border border-[#e2e8f0] p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-green-50 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <span className="text-2xl font-bold text-[#1e293b]">{actividadesActivas}</span>
                    </div>
                    <p className="text-sm font-semibold text-[#1e293b]">Activas</p>
                    <p className="text-xs text-[#94a3b8] mt-1">Disponibles para estudiantes</p>
                </div>

                <div className="bg-white rounded-xl border border-[#e2e8f0] p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-orange-50 rounded-lg">
                            <Users className="w-5 h-5 text-orange-600" />
                        </div>
                        <span className="text-2xl font-bold text-[#1e293b]">{estadisticas.estudiantesUnicos}</span>
                    </div>
                    <p className="text-sm font-semibold text-[#1e293b]">Estudiantes</p>
                    <p className="text-xs text-[#94a3b8] mt-1">Con reportes de horas</p>
                </div>

                <div className="bg-white rounded-xl border border-[#e2e8f0] p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-purple-50 rounded-lg">
                            <Clock className="w-5 h-5 text-purple-600" />
                        </div>
                        <span className="text-2xl font-bold text-[#1e293b]">{estadisticas.totalHorasAprobadas}</span>
                    </div>
                    <p className="text-sm font-semibold text-[#1e293b]">Horas Aprobadas</p>
                    <p className="text-xs text-[#94a3b8] mt-1">Total acumulado</p>
                </div>
            </div>

            {/* Dashboard principal */}
            <ActividadesDashboardClient 
                initialData={actividades} 
                estadisticas={estadisticas}
                opcionesFiltros={opciones}
            />
        </div>
    );
}
