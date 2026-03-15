'use client';

import React, { useState, useEffect } from 'react';
import { 
    Clock, 
    Search, 
    CheckCircle2, 
    XCircle, 
    AlertCircle,
    Loader2,
    Download,
    User,
    ShieldCheck,
    ArrowUpRight,
    MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';
import { getReportesParaAprobacionFinal, aprobarReporteFinal, rechazarReporteFinal } from './actions';
import { cn } from '@/lib/utils';

export default function ReportesPage() {
    const [loading, setLoading] = useState(true);
    const [reportes, setReportes] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('TODOS');

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await getReportesParaAprobacionFinal();
            setReportes(data);
        } catch (error) {
            toast.error('Error al cargar reportes para aprobación');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleAprobar = async (id: string, horas: number) => {
        try {
            await aprobarReporteFinal(id, horas);
            toast.success('Horas aprobadas definitivamente');
            loadData();
        } catch (error) {
            toast.error('Error al procesar aprobación');
        }
    };

    const handleRechazar = async (id: string) => {
        const motivo = window.prompt('Por favor, ingresa el motivo del rechazo:');
        if (!motivo) return;
        
        try {
            await rechazarReporteFinal(id, motivo);
            toast.success('Reporte rechazado');
            loadData();
        } catch (error) {
            toast.error('Error al procesar rechazo');
        }
    };

    const filtered = reportes.filter(r => {
        const matchesSearch = r.estudiante.primer_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             r.actividad.nombre.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'TODOS' || 
                             (filterStatus === 'VALIDADO_AUXILIAR' && r.estado === 'VALIDADO_AUXILIAR') ||
                             (filterStatus === 'DIRECTO' && r.estado !== 'VALIDADO_AUXILIAR');
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Validación Final de Horas</h1>
                    <p className="text-slate-500 font-medium mt-1">
                        Revisa y confirma las horas validadas por Auxiliares o reportadas directamente.
                    </p>
                </div>
                <button className="flex items-center gap-2 bg-[#8B1E1E] text-white px-6 h-12 rounded-xl font-bold shadow-lg shadow-[#8B1E1E]/20 hover:bg-[#a32424] transition-all">
                    <Download className="w-5 h-5" />
                    Exportar Reportes
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-2">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Por aprobar</p>
                    <p className="text-3xl font-black text-slate-900">{reportes.length}</p>
                </div>
                <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 shadow-sm">
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Validadas por Auxiliar</p>
                    <p className="text-3xl font-black text-emerald-700">{reportes.filter(r => r.estado === 'VALIDADO_AUXILIAR').length}</p>
                </div>
                <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 shadow-sm">
                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">Reporte Directo</p>
                    <p className="text-3xl font-black text-amber-700">{reportes.filter(r => r.estado !== 'VALIDADO_AUXILIAR').length}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between px-2">
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#8B1E1E] transition-colors" />
                    <input 
                        placeholder="Buscar por estudiante o actividad..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 h-11 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-[#8B1E1E]/5 focus:border-[#8B1E1E]/20 text-sm transition-all font-medium"
                    />
                </div>
                <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto">
                    {['TODOS', 'VALIDADO_AUXILIAR', 'DIRECTO'].map((st) => (
                        <button
                            key={st}
                            onClick={() => setFilterStatus(st)}
                            className={cn(
                                "flex-1 md:flex-none px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all",
                                filterStatus === st ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                            )}
                        >
                            {st === 'TODOS' ? 'Todas' : st === 'VALIDADO_AUXILIAR' ? 'Validadas Aux' : 'Directas'}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 opacity-30 grayscale">
                    <Loader2 className="w-12 h-12 text-[#8B1E1E] animate-spin mb-4" />
                    <p className="font-black text-[10px] uppercase tracking-widest text-slate-400">Cargando Reportes...</p>
                </div>
            ) : filtered.length > 0 ? (
                <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-xl shadow-slate-200/40">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                    <th className="px-8 py-6">Estudiante</th>
                                    <th className="px-8 py-6">Actividad</th>
                                    <th className="px-8 py-6">Horas</th>
                                    <th className="px-8 py-6">Origen / Validación</th>
                                    <th className="px-8 py-6 text-right">Decisión Final</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filtered.map((r) => (
                                    <tr key={r.id} className="hover:bg-slate-50/50 transition-all group">
                                        <td className="px-8 py-7">
                                            <div className="flex items-center gap-4">
                                                <div className="w-11 h-11 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center font-bold text-slate-500 text-sm group-hover:scale-110 transition-transform">
                                                    {r.estudiante.primer_nombre.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-800 leading-none mb-1.5">{r.estudiante.primer_nombre} {r.estudiante.primer_apellido}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{r.estudiante.numero_documento}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-7">
                                            <div className="max-w-xs">
                                                <p className="text-sm font-bold text-slate-700 truncate">{r.actividad.nombre}</p>
                                                <div className="flex items-center gap-1.5 mt-1.5 opacity-60">
                                                    <ArrowUpRight className="w-3 h-3 text-[#8B1E1E]" />
                                                    <p className="text-[10px] font-medium text-slate-500 truncate">{r.actividad.convocatoria.titulo}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-7">
                                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
                                                <span className="text-lg font-black text-slate-900 tabular-nums leading-none">{r.horas_reportadas}</span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Hrs</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-7">
                                            {r.estado === 'VALIDADO_AUXILIAR' ? (
                                                <div className="space-y-1.5">
                                                    <span className="flex items-center gap-1.5 text-emerald-600 text-[10px] font-black uppercase tracking-widest pl-0.5">
                                                        <ShieldCheck className="w-3.5 h-3.5" />
                                                        Validado Auxiliar
                                                    </span>
                                                    <div className="flex items-center gap-2 px-2.5 py-1.5 bg-emerald-50/50 rounded-lg border border-emerald-100">
                                                        <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-[8px] text-white font-bold">
                                                            {r.revisor?.primer_nombre?.charAt(0)}
                                                        </div>
                                                        <span className="text-[10px] font-bold text-emerald-800">{r.revisor?.primer_nombre} (Aux)</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-1.5">
                                                    <span className="flex items-center gap-1.5 text-amber-600 text-[10px] font-black uppercase tracking-widest pl-0.5">
                                                        <AlertCircle className="w-3.5 h-3.5" />
                                                        Reporte Directo
                                                    </span>
                                                    <p className="text-[10px] font-medium text-slate-400 pl-0.5 italic">Pendiente de revisión inicial</p>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-8 py-7 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <button 
                                                    onClick={() => handleRechazar(r.id)}
                                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all border border-slate-100 shadow-sm"
                                                    title="Rechazar con motivo"
                                                >
                                                    <XCircle className="w-5 h-5" />
                                                </button>
                                                <button 
                                                    onClick={() => handleAprobar(r.id, r.horas_reportadas)}
                                                    className="h-11 px-6 rounded-xl bg-emerald-50 text-emerald-600 font-black text-xs hover:bg-emerald-500 hover:text-white transition-all border border-emerald-100 shadow-sm flex items-center gap-2 uppercase tracking-widest"
                                                >
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    Aprobar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="text-center py-40 bg-slate-50/50 rounded-[4rem] border-4 border-dashed border-slate-100">
                    <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl border border-gray-50">
                        <Clock className="w-10 h-10 text-slate-200" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2">Bandeja de Entrada Limpia</h3>
                    <p className="text-slate-400 max-w-sm mx-auto font-medium">
                        No hay reportes de horas que requieran tu aprobación final en este momento.
                    </p>
                </div>
            )}
        </div>
    );
}
