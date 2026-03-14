'use client';

import React, { useState } from 'react';
import { 
    Download, 
    FileSpreadsheet, 
    FileText, 
    Filter, 
    Calendar,
    Users,
    BookOpen,
    Clock,
    Award,
    TrendingUp,
    Building,
    BarChart3,
    PieChart,
    Activity,
    Target,
    Zap
} from 'lucide-react';
import { toast } from 'sonner';

interface DatosReportes {
    estadisticas: {
        totalEstudiantes: number;
        totalConvocatorias: number;
        totalHoras: number;
        totalCertificados: number;
    };
    estudiantesPorFacultad: any[];
    estudiantesPorPrograma: any[];
    convocatoriasPorEstado: any[];
    horasPorMes: any[];
    actividadesPorTipo: any[];
    certificadosPorMes: any[];
    estudiantesConHoras: any[];
    reportesPorEstado: any[];
    programasMasActivos: any[];
    facultadesMasActivas: any[];
}

interface ReportesDashboardClientProps {
    datos: DatosReportes;
}

export function ReportesDashboardClient({ datos }: ReportesDashboardClientProps) {
    const [isGenerating, setIsGenerating] = useState<string | null>(null);
    const [selectedPeriod, setSelectedPeriod] = useState('todos');
    const [selectedFormat, setSelectedFormat] = useState<'excel' | 'pdf'>('excel');

    const handleGenerateReport = async (type: string) => {
        setIsGenerating(type);
        const toastId = toast.loading(`Generando reporte de ${type}...`);
        
        try {
            let response;
            switch (type) {
                case 'estudiantes':
                    response = await fetch('/api/reporte/estudiantes', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ format: selectedFormat })
                    });
                    break;
                case 'convocatorias':
                    response = await fetch('/api/reporte/convocatorias', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ format: selectedFormat })
                    });
                    break;
                case 'actividades':
                    response = await fetch('/api/reporte/actividades', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ format: selectedFormat })
                    });
                    break;
                case 'certificados':
                    response = await fetch('/api/reporte/certificados', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ format: selectedFormat })
                    });
                    break;
                default:
                    throw new Error('Tipo de reporte no válido');
            }

            if (!response.ok) throw new Error('Error al generar reporte');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `reporte-${type}-${new Date().toISOString().split('T')[0]}.${selectedFormat}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.success(`✅ Reporte de ${type} generado exitosamente`, { id: toastId });
        } catch (error) {
            toast.error(`Error al generar reporte de ${type}`, { id: toastId });
        } finally {
            setIsGenerating(null);
        }
    };

    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    const coloresChart = [
        '#8B1E1E', '#2563eb', '#16a34a', '#ca8a04', '#9333ea', '#dc2626',
        '#0891b2', '#ea580c', '#4f46e5', '#15803d', '#be123c', '#7c3aed'
    ];

    return (
        <div className="space-y-6">
            {/* Panel de Control */}
            <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-[#1e293b] flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-[#8B1E1E]" />
                        Panel de Generación de Reportes
                    </h2>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-[#64748b]">Formato:</label>
                            <select
                                value={selectedFormat}
                                onChange={(e) => setSelectedFormat(e.target.value as 'excel' | 'pdf')}
                                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="excel">Excel</option>
                                <option value="pdf">PDF</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-[#64748b]">Período:</label>
                            <select
                                value={selectedPeriod}
                                onChange={(e) => setSelectedPeriod(e.target.value)}
                                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="todos">Todos los tiempos</option>
                                <option value="ultimo_mes">Último mes</option>
                                <option value="ultimo_trimestre">Último trimestre</option>
                                <option value="ultimo_ano">Último año</option>
                                <option value="anio_actual">Año actual</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Botones de Reportes */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button
                        onClick={() => handleGenerateReport('estudiantes')}
                        disabled={isGenerating === 'estudiantes'}
                        className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        <div className="flex flex-col items-center gap-3">
                            <div className="p-3 bg-[#8B1E1E] text-white rounded-lg group-hover:scale-110 transition-transform">
                                <Users className="w-6 h-6" />
                            </div>
                            <div className="text-center">
                                <h3 className="font-bold text-blue-900">Reporte de Estudiantes</h3>
                                <p className="text-xs text-blue-700 mt-1">Información completa de todos los estudiantes</p>
                            </div>
                            {isGenerating === 'estudiantes' ? (
                                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Download className="w-4 h-4 text-blue-600" />
                            )}
                        </div>
                    </button>

                    <button
                        onClick={() => handleGenerateReport('convocatorias')}
                        disabled={isGenerating === 'convocatorias'}
                        className="p-6 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl hover:from-green-100 hover:to-green-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        <div className="flex flex-col items-center gap-3">
                            <div className="p-3 bg-[#166534] text-white rounded-lg group-hover:scale-110 transition-transform">
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <div className="text-center">
                                <h3 className="font-bold text-green-900">Reporte de Convocatorias</h3>
                                <p className="text-xs text-green-700 mt-1">Detalles de todas las convocatorias</p>
                            </div>
                            {isGenerating === 'convocatorias' ? (
                                <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Download className="w-4 h-4 text-green-600" />
                            )}
                        </div>
                    </button>

                    <button
                        onClick={() => handleGenerateReport('actividades')}
                        disabled={isGenerating === 'actividades'}
                        className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl hover:from-purple-100 hover:to-purple-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        <div className="flex flex-col items-center gap-3">
                            <div className="p-3 bg-purple-600 text-white rounded-lg group-hover:scale-110 transition-transform">
                                <Activity className="w-6 h-6" />
                            </div>
                            <div className="text-center">
                                <h3 className="font-bold text-purple-900">Reporte de Actividades</h3>
                                <p className="text-xs text-purple-700 mt-1">Actividades y horas reportadas</p>
                            </div>
                            {isGenerating === 'actividades' ? (
                                <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Download className="w-4 h-4 text-purple-600" />
                            )}
                        </div>
                    </button>

                    <button
                        onClick={() => handleGenerateReport('certificados')}
                        disabled={isGenerating === 'certificados'}
                        className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl hover:from-orange-100 hover:to-orange-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        <div className="flex flex-col items-center gap-3">
                            <div className="p-3 bg-orange-600 text-white rounded-lg group-hover:scale-110 transition-transform">
                                <Award className="w-6 h-6" />
                            </div>
                            <div className="text-center">
                                <h3 className="font-bold text-orange-900">Reporte de Certificados</h3>
                                <p className="text-xs text-orange-700 mt-1">Certificados emitidos y validados</p>
                            </div>
                            {isGenerating === 'certificados' ? (
                                <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Download className="w-4 h-4 text-orange-600" />
                            )}
                        </div>
                    </button>
                </div>
            </div>

            {/* Estadísticas Detalladas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Estudiantes por Programa */}
                <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
                    <h3 className="text-lg font-bold text-[#1e293b] mb-4 flex items-center gap-2">
                        <Building className="w-5 h-5 text-[#8B1E1E]" />
                        Estudiantes por Programa
                    </h3>
                    <div className="space-y-3">
                        {datos.estudiantesPorPrograma.slice(0, 8).map((programa, index) => (
                            <div key={programa.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div 
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: coloresChart[index % coloresChart.length] }}
                                    />
                                    <span className="text-sm font-medium text-[#1e293b]">{programa.nombre}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-[#8B1E1E]">{programa.totalEstudiantes}</span>
                                    <div className="w-24 bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="h-2 rounded-full bg-[#8B1E1E]"
                                            style={{ 
                                                width: `${(programa.totalEstudiantes / Math.max(...datos.estudiantesPorPrograma.map(p => p.totalEstudiantes))) * 100}%` 
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actividades por Tipo */}
                <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
                    <h3 className="text-lg font-bold text-[#1e293b] mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5 text-[#8B1E1E]" />
                        Actividades por Tipo
                    </h3>
                    <div className="space-y-3">
                        {datos.actividadesPorTipo.map((tipo, index) => (
                            <div key={tipo.tipo} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div 
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: coloresChart[index % coloresChart.length] }}
                                    />
                                    <span className="text-sm font-medium text-[#1e293b]">
                                        {tipo.tipo.replace(/_/g, ' ')}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-[#8B1E1E]">{tipo.cantidad}</span>
                                    <div className="w-24 bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="h-2 rounded-full bg-[#8B1E1E]"
                                            style={{ 
                                                width: `${(tipo.cantidad / Math.max(...datos.actividadesPorTipo.map(a => a.cantidad))) * 100}%` 
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Top Estudiantes con Horas */}
            <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
                <h3 className="text-lg font-bold text-[#1e293b] mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#8B1E1E]" />
                    Top Estudiantes - Horas Acumuladas
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-2 px-3 text-xs font-semibold text-[#64748b] uppercase">Posición</th>
                                <th className="text-left py-2 px-3 text-xs font-semibold text-[#64748b] uppercase">Estudiante</th>
                                <th className="text-left py-2 px-3 text-xs font-semibold text-[#64748b] uppercase">Documento</th>
                                <th className="text-left py-2 px-3 text-xs font-semibold text-[#64748b] uppercase">Programa</th>
                                <th className="text-left py-2 px-3 text-xs font-semibold text-[#64748b] uppercase">Facultad</th>
                                <th className="text-right py-2 px-3 text-xs font-semibold text-[#64748b] uppercase">Horas</th>
                            </tr>
                        </thead>
                        <tbody>
                            {datos.estudiantesConHoras.slice(0, 10).map((estudiante, index) => (
                                <tr key={estudiante.id_usuario} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-3">
                                        <div className="flex items-center gap-2">
                                            {index < 3 && (
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                                                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-600'
                                                }`}>
                                                    {index + 1}
                                                </div>
                                            )}
                                            {index >= 3 && (
                                                <span className="text-sm font-bold text-gray-600 w-6 text-center">{index + 1}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-3 px-3">
                                        <div>
                                            <p className="text-sm font-medium text-[#1e293b]">
                                                {estudiante.usuario.primer_nombre} {estudiante.usuario.primer_apellido}
                                            </p>
                                            <p className="text-xs text-[#64748b]">{estudiante.usuario.correo}</p>
                                        </div>
                                    </td>
                                    <td className="py-3 px-3 text-sm text-[#64748b]">{estudiante.usuario.numero_documento}</td>
                                    <td className="py-3 px-3 text-sm text-[#1e293b]">{estudiante.programa?.nombre || 'N/A'}</td>
                                    <td className="py-3 px-3 text-sm text-[#1e293b]">{estudiante.programa?.facultad?.nombre || 'N/A'}</td>
                                    <td className="py-3 px-3 text-right">
                                        <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">
                                            {estudiante.horas_acumuladas}h
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Métricas Adicionales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Reportes por Estado */}
                <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
                    <h3 className="text-lg font-bold text-[#1e293b] mb-4 flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-[#8B1E1E]" />
                        Reportes por Estado
                    </h3>
                    <div className="space-y-3">
                        {datos.reportesPorEstado.map((estado, index) => (
                            <div key={estado.estado} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div 
                                        className={`w-3 h-3 rounded-full ${
                                            estado.estado === 'APROBADO' ? 'bg-green-500' :
                                            estado.estado === 'RECHAZADO' ? 'bg-red-500' :
                                            estado.estado === 'REPORTADO' ? 'bg-blue-500' :
                                            'bg-yellow-500'
                                        }`}
                                    />
                                    <span className="text-sm font-medium text-[#1e293b]">
                                        {estado.estado.replace(/_/g, ' ')}
                                    </span>
                                </div>
                                <span className="text-sm font-bold text-[#8B1E1E]">{estado.cantidad}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Programas Más Activos */}
                <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
                    <h3 className="text-lg font-bold text-[#1e293b] mb-4 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-[#8B1E1E]" />
                        Programas Más Activos
                    </h3>
                    <div className="space-y-3">
                        {datos.programasMasActivos.slice(0, 5).map((programa, index) => (
                            <div key={programa.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-[#8B1E1E]">#{index + 1}</span>
                                    <span className="text-sm font-medium text-[#1e293b]">{programa.nombre}</span>
                                </div>
                                <span className="text-sm font-bold text-[#8B1E1E]">{programa.totalConvocatorias}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Facultades Más Activas */}
                <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
                    <h3 className="text-lg font-bold text-[#1e293b] mb-4 flex items-center gap-2">
                        <Building className="w-5 h-5 text-[#8B1E1E]" />
                        Facultades Más Activas
                    </h3>
                    <div className="space-y-3">
                        {datos.facultadesMasActivas.slice(0, 5).map((facultad, index) => (
                            <div key={facultad.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-[#8B1E1E]">#{index + 1}</span>
                                    <span className="text-sm font-medium text-[#1e293b]">{facultad.nombre}</span>
                                </div>
                                <span className="text-sm font-bold text-[#8B1E1E]">{facultad.totalActividad}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
