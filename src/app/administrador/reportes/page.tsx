import React from 'react';
import { ReportesDashboardClient } from './reportes-dashboard-client';
import { ReportesTabs } from './reportes-tabs';
import { getDatosReportes } from './actions';
import { FileText, Download, BarChart3, Users, Clock, TrendingUp, Award, BookOpen, Building } from 'lucide-react';

export const metadata = { title: 'Panel de Reportes | Administrador' };

export default async function ReportesPage() {
    const datos = await getDatosReportes();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <FileText className="w-6 h-6 text-[#8B1E1E]" />
                        <h1 className="text-2xl font-bold text-[#1e293b]">Panel de Reportes</h1>
                    </div>
                    <p className="text-[#64748b] text-sm">Sistema integral de generación de reportes y análisis de datos</p>
                </div>
            </div>

            {/* Tarjetas de estadísticas principales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-[#e2e8f0] p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="text-2xl font-bold text-[#1e293b]">{datos.estadisticas.totalEstudiantes}</span>
                    </div>
                    <p className="text-sm font-semibold text-[#1e293b]">Total Estudiantes</p>
                    <p className="text-xs text-[#94a3b8] mt-1">Activos en el sistema</p>
                </div>

                <div className="bg-white rounded-xl border border-[#e2e8f0] p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-green-50 rounded-lg">
                            <BookOpen className="w-5 h-5 text-green-600" />
                        </div>
                        <span className="text-2xl font-bold text-[#1e293b]">{datos.estadisticas.totalConvocatorias}</span>
                    </div>
                    <p className="text-sm font-semibold text-[#1e293b]">Convocatorias</p>
                    <p className="text-xs text-[#94a3b8] mt-1">Publicadas este año</p>
                </div>

                <div className="bg-white rounded-xl border border-[#e2e8f0] p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-purple-50 rounded-lg">
                            <Clock className="w-5 h-5 text-purple-600" />
                        </div>
                        <span className="text-2xl font-bold text-[#1e293b]">{datos.estadisticas.totalHoras}</span>
                    </div>
                    <p className="text-sm font-semibold text-[#1e293b]">Horas Totales</p>
                    <p className="text-xs text-[#94a3b8] mt-1">Acumuladas por estudiantes</p>
                </div>

                <div className="bg-white rounded-xl border border-[#e2e8f0] p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-orange-50 rounded-lg">
                            <Award className="w-5 h-5 text-orange-600" />
                        </div>
                        <span className="text-2xl font-bold text-[#1e293b]">{datos.estadisticas.totalCertificados}</span>
                    </div>
                    <p className="text-sm font-semibold text-[#1e293b]">Certificados</p>
                    <p className="text-xs text-[#94a3b8] mt-1">Emitidos completados</p>
                </div>
            </div>

            {/* Dashboard principal y Gestión */}
            <ReportesTabs datos={datos} />
        </div>
    );
}
