'use client';

import React, { useState, useEffect } from 'react';
import { 
    Clock, 
    Search, 
    CheckCircle2, 
    XCircle, 
    Loader2,
    Download,
    ShieldCheck,
    ArrowUpRight
} from 'lucide-react';
import { toast } from 'sonner';
import { getReportesParaAprobacionFinal, aprobarReporteFinal, rechazarReporteFinal } from '../../profesor/reportes/actions';
import { cn } from '@/lib/utils';

export default function AliadoValidacionPage() {
    const [loading, setLoading] = useState(true);
    const [reportes, setReportes] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await getReportesParaAprobacionFinal();
            setReportes(data);
        } catch (error) {
            toast.error('Error al cargar reportes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleAprobar = async (id: string, horas: number) => {
        try {
            await aprobarReporteFinal(id, horas, 'Aprobado por Aliado - Entidad externa certifica cumplimiento.');
            toast.success('Horas aprobadas definitivamente');
            loadData();
        } catch (error) {
            toast.error('Error al procesar aprobación');
        }
    };

    const handleRechazar = async (id: string) => {
        const motivo = window.prompt('Motivo del rechazo:');
        if (!motivo) return;
        try {
            await rechazarReporteFinal(id, motivo);
            toast.success('Reporte rechazado');
            loadData();
        } catch (error) {
            toast.error('Error');
        }
    };

    const filtered = reportes.filter(r => 
        r.estudiante.primer_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.actividad.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500 p-6">
            <div className="px-2">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Validación de Actividades - Aliado</h1>
                <p className="text-slate-500 font-medium">Confirma el cumplimiento de horas de los estudiantes asignados a tu entidad.</p>
            </div>

            <div className="relative w-full md:w-96 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#8B1E1E] transition-colors" />
                <input 
                    placeholder="Buscar estudiante..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 h-11 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-[#8B1E1E]/5 focus:border-[#8B1E1E]/20 text-sm transition-all font-medium"
                />
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#8B1E1E]" /></div>
            ) : filtered.length > 0 ? (
                <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-xl shadow-slate-200/40">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <th className="px-8 py-6">Estudiante</th>
                                <th className="px-8 py-6">Actividad</th>
                                <th className="px-8 py-6 text-center">Horas</th>
                                <th className="px-8 py-6">Estado Validation</th>
                                <th className="px-8 py-6 text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filtered.map(r => (
                                <tr key={r.id} className="hover:bg-slate-50/50 transition-all">
                                    <td className="px-8 py-6 text-sm font-bold">{r.estudiante.primer_nombre} {r.estudiante.primer_apellido}</td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-medium">{r.actividad.nombre}</p>
                                        <p className="text-[10px] text-slate-400">{r.actividad.convocatoria.titulo}</p>
                                    </td>
                                    <td className="px-8 py-6 text-center font-black text-lg">{r.horas_reportadas}</td>
                                    <td className="px-8 py-6">
                                        <span className={cn(
                                            "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                                            r.estado === 'VALIDADO_AUXILIAR' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                                        )}>
                                            {r.estado === 'VALIDADO_AUXILIAR' ? 'Pre-validado' : 'Pendiente'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right space-x-2">
                                        <button onClick={() => handleRechazar(r.id)} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"><XCircle className="w-5 h-5" /></button>
                                        <button onClick={() => handleAprobar(r.id, r.horas_reportadas)} className="p-2 text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all"><CheckCircle2 className="w-5 h-5" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed text-slate-400">No hay reportes para validar.</div>
            )}
        </div>
    );
}
