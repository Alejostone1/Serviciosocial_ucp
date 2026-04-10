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
    Activity,
    Target,
    Zap,
    ChevronDown,
    FileCheck,
    ClipboardList,
    Layers,
    ArrowUpRight
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    PieChart as RePieChart,
    Pie,
    Cell,
    LineChart,
    Line
} from 'recharts';

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
    reportesPorEstado: any[];
    estudiantesConHoras: any[];
    programasMasActivos: any[];
    facultadesMasActivas: any[];
}

export function ReportesDashboardClient({ datos }: { datos: DatosReportes }) {
    const [isGenerating, setIsGenerating] = useState<string | null>(null);
    const [selectedPeriod, setSelectedPeriod] = useState('todos');
    const [selectedFormat, setSelectedFormat] = useState<'excel' | 'pdf'>('excel');

    const handleGenerateReport = async (type: string) => {
        setIsGenerating(type);
        const toastId = toast.loading(`Iniciando protocolo de generación: ${type.toUpperCase()}...`);
        
        try {
            const response = await fetch(`/api/reporte/${type}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    format: selectedFormat,
                    period: selectedPeriod 
                })
            });

            if (!response.ok) throw new Error('Error en la comunicación con el servidor de reportes');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            
            // Corrección de extensión: mapear 'excel' a 'xlsx'
            const extension = selectedFormat === 'excel' ? 'xlsx' : selectedFormat;
            const fileName = `UCP_REPORTE_${type.toUpperCase()}_${new Date().toISOString().split('T')[0]}.${extension}`;
            
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.success(`Reporte de ${type} generado con éxito`, { id: toastId });
        } catch (error: any) {
            toast.error(error.message || 'Fallo en la generación del reporte', { id: toastId });
        } finally {
            setIsGenerating(null);
        }
    };

    const COLORS = ['#8B1E1E', '#1e293b', '#64748b', '#94a3b8', '#cbd5e1'];

    return (
        <div className="space-y-12 pb-20 font-sans">
            {/* Seccion de Control Superior - Minimalismo Academico */}
            <header className="bg-white border border-stone-200 rounded-[2.5rem] p-10 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-10 overflow-hidden relative">
                <div className="space-y-3 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="h-0.5 w-8 bg-[#8B1E1E]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#8B1E1E]">Centro de Operaciones</span>
                    </div>
                    <h2 className="text-3xl font-bold tracking-tighter text-stone-900">Gobernanza de <span className="text-stone-400">Datos</span></h2>
                    <p className="text-sm text-stone-500 font-light max-w-md">Genere reportes certificados con validez institucional para la auditoría de horas de servicio social.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
                    <div className="flex flex-col gap-2 w-full sm:w-auto">
                        <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest pl-1">Formato de Salida</label>
                        <select
                            value={selectedFormat}
                            onChange={(e) => setSelectedFormat(e.target.value as 'excel' | 'pdf')}
                            className="bg-stone-50 border border-stone-200 rounded-xl px-5 h-12 text-[11px] font-bold text-stone-600 uppercase tracking-widest focus:ring-1 focus:ring-[#8B1E1E] outline-none cursor-pointer transition-all hover:bg-white"
                        >
                            <option value="excel">Microsoft Excel (.xlsx)</option>
                            <option value="pdf">Documento PDF (.pdf)</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-2 w-full sm:w-auto">
                        <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest pl-1">Rango de Datos</label>
                        <select
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                            className="bg-stone-50 border border-stone-200 rounded-xl px-5 h-12 text-[11px] font-bold text-stone-600 uppercase tracking-widest focus:ring-1 focus:ring-[#8B1E1E] outline-none cursor-pointer transition-all hover:bg-white"
                        >
                            <option value="todos">Histórico Completo</option>
                            <option value="anio_actual">Vigencia Actual ({new Date().getFullYear()})</option>
                            <option value="ultimo_mes">Últimos 30 Días</option>
                        </select>
                    </div>
                </div>
                
                {/* Subtle abstraction in background */}
                <BarChart3 className="absolute -bottom-10 -right-10 w-64 h-64 text-stone-50 opacity-50" />
            </header>

            {/* Rejilla de Reportes Maestra */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { id: 'estudiantes', title: 'Estudiantes', icon: Users, desc: 'Censo completo y avance de horas', color: 'blue' },
                    { id: 'convocatorias', title: 'Convocatorias', icon: ClipboardList, desc: 'Estado de ofertas y vacantes', color: 'green' },
                    { id: 'actividades', title: 'Actividades', icon: Layers, desc: 'Registro de bitácoras y gestión', color: 'purple' },
                    { id: 'certificados', title: 'Certificados', icon: FileCheck, iconColor: 'text-[#8B1E1E]', desc: 'Trazabilidad de validaciones', color: 'orange' }
                ].map((item) => (
                    <button
                        key={item.id}
                        onClick={() => handleGenerateReport(item.id)}
                        disabled={isGenerating === item.id}
                        className="group bg-white border border-stone-200 rounded-[2rem] p-8 text-left hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 relative overflow-hidden"
                    >
                        <div className="space-y-6 relative z-10">
                            <div className="w-14 h-14 bg-stone-50 rounded-[1.2rem] flex items-center justify-center transition-colors group-hover:bg-[#8B1E1E] group-hover:text-white border border-stone-100">
                                <item.icon className={cn("w-6 h-6", item.iconColor)} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg font-bold text-stone-900 leading-none">{item.title}</h3>
                                <p className="text-[11px] text-stone-400 font-medium leading-relaxed uppercase tracking-tight">{item.desc}</p>
                            </div>
                            <div className="pt-4 flex items-center justify-between">
                                <span className="text-[10px] font-black text-[#8B1E1E] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Generar archivo</span>
                                {isGenerating === item.id ? (
                                    <div className="w-4 h-4 border-2 border-[#8B1E1E] border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <ArrowUpRight className="w-4 h-4 text-stone-200 group-hover:text-[#8B1E1E] transition-all group-hover:translate-x-1 group-hover:-translate-y-1" />
                                )}
                            </div>
                        </div>
                    </button>
                ))}
            </section>

            {/* Analitica Visual - Estilo Academico Sobrio */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Grafico de Barras - Programas */}
                <div className="lg:col-span-2 bg-white border border-stone-200 rounded-[2.5rem] p-10 shadow-sm space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-xl font-bold text-stone-900 tracking-tight">Distribución por Programa</h3>
                            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Participación estudiantil activa</p>
                        </div>
                        <BarChart3 className="w-5 h-5 text-stone-200" />
                    </div>
                    
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={datos.estudiantesPorPrograma.slice(0, 10)}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis 
                                    dataKey="nombre" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                    hide
                                />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ fill: '#f8fafc' }}
                                />
                                <Bar dataKey="totalEstudiantes" fill="#8B1E1E" radius={[6, 6, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Grafico circular - Tipos de Actividades */}
                <div className="bg-white border border-stone-200 rounded-[2.5rem] p-10 shadow-sm space-y-8">
                    <div className="space-y-1">
                        <h3 className="text-xl font-bold text-stone-900 tracking-tight">Naturaleza de Actividad</h3>
                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Tipificación de horas reportadas</p>
                    </div>
                    
                    <div className="h-64 w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <RePieChart>
                                <Pie
                                    data={datos.actividadesPorTipo}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={8}
                                    dataKey="cantidad"
                                >
                                    {datos.actividadesPorTipo.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </RePieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-3xl font-black text-stone-900">{datos.estadisticas.totalEstudiantes}</span>
                            <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Actores</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 pt-4">
                        {datos.actividadesPorTipo.slice(0, 4).map((tipo, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                                    <span className="text-[11px] font-bold text-stone-600 uppercase tracking-tighter truncate max-w-[140px] italic">
                                        {tipo.tipo.replace(/_/g, ' ')}
                                    </span>
                                </div>
                                <span className="text-xs font-black text-stone-900">{tipo.cantidad}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tabla de Excelencia Academica - Top Estudiantes */}
            <div className="bg-white border border-stone-200 rounded-[2.5rem] p-10 shadow-sm space-y-8">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h3 className="text-xl font-bold text-stone-900 tracking-tight">Registro de Excelencia Estudiantil</h3>
                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Estudiantes con mayor impacto en servicio social</p>
                    </div>
                    <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100 text-[#8B1E1E]">
                        <Award className="w-5 h-5" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-stone-100">
                                <th className="text-left py-4 px-4 text-[10px] font-black text-stone-300 uppercase tracking-[0.2em]">Rango</th>
                                <th className="text-left py-4 px-4 text-[10px] font-black text-stone-300 uppercase tracking-[0.2em]">Estudiante</th>
                                <th className="text-left py-4 px-4 text-[10px] font-black text-stone-300 uppercase tracking-[0.2em]">Programa Académico</th>
                                <th className="text-right py-4 px-4 text-[10px] font-black text-stone-300 uppercase tracking-[0.2em]">Horas</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-50">
                            {datos.estudiantesConHoras.slice(0, 10).map((est, idx) => (
                                <tr key={est.id} className="group hover:bg-stone-50/50 transition-colors">
                                    <td className="py-5 px-4 font-black text-stone-200 text-lg group-hover:text-[#8B1E1E]/20 transition-colors italic">
                                        {String(idx + 1).padStart(2, '0')}
                                    </td>
                                    <td className="py-5 px-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-stone-800">{est.usuario.primer_nombre} {est.usuario.primer_apellido}</span>
                                            <span className="text-[10px] text-stone-400 font-medium uppercase tracking-tighter">{est.usuario.numero_documento}</span>
                                        </div>
                                    </td>
                                    <td className="py-5 px-4">
                                        <span className="text-[11px] font-bold text-stone-500 uppercase tracking-widest leading-tight block max-w-xs">{est.programa?.nombre || 'N/A'}</span>
                                    </td>
                                    <td className="py-5 px-4 text-right">
                                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-stone-50 rounded-full border border-stone-100">
                                            <span className="text-xs font-black text-[#8B1E1E]">{est.horas_acumuladas}</span>
                                            <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Hrs</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
