'use client';

import React, { useState, useEffect } from 'react';
import { 
    ClipboardCheck, 
    Search, 
    ChevronRight,
    Loader2,
    Inbox,
    CheckCircle2,
    XCircle,
    User,
    Mail,
    FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getPostulacionesAliado, actualizarEstadoPostulacionAliado } from '../actions';
import { toast } from 'sonner';

export default function AliadoPostulacionesPage() {
    const [loading, setLoading] = useState(true);
    const [postulaciones, setPostulaciones] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('PENDIENTE');

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await getPostulacionesAliado();
            setPostulaciones(data);
        } catch (error) {
            toast.error('Error al cargar postulaciones');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleAction = async (id: string, newStatus: 'ACEPTADA' | 'RECHAZADA') => {
        try {
            await actualizarEstadoPostulacionAliado(id, newStatus, `Revisado por Aliado - ${newStatus}`);
            toast.success(`Postulación ${newStatus.toLowerCase()} correctamente`);
            loadData();
        } catch (error) {
            toast.error('Error al actualizar postulación');
        }
    };

    const filteredPostulaciones = postulaciones.filter(p => {
        const matchesSearch = p.estudiante.primer_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             p.convocatoria.titulo.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'TODOS' || p.estado === filterStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="px-2">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Revisión de Postulaciones</h1>
                <p className="text-slate-500 text-lg font-normal mt-2 leading-relaxed max-w-2xl">
                    Gestiona las solicitudes de los estudiantes que desean vincularse a tus proyectos de servicio social.
                </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between px-2">
                <div className="relative w-full sm:w-80 group">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-[#1E3A8A] transition-colors" />
                    <input 
                        placeholder="Buscar convocatoria o estudiante..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 h-11 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-[#1E3A8A]/5 focus:border-[#1E3A8A]/20 text-sm transition-all font-medium"
                    />
                </div>
                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
                    {['TODOS', 'PENDIENTE', 'ACEPTADA', 'RECHAZADA'].map((st) => (
                        <button
                            key={st}
                            onClick={() => setFilterStatus(st)}
                            className={cn(
                                "flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-tight transition-all",
                                filterStatus === st ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                            )}
                        >
                            {st === 'TODOS' ? 'Todas' : st}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 opacity-30 grayscale">
                    <Loader2 className="w-10 h-10 text-slate-400 animate-spin mb-4" />
                    <p className="font-semibold text-slate-400 uppercase tracking-widest text-[10px]">Cargando solicitudes...</p>
                </div>
            ) : filteredPostulaciones.length > 0 ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {filteredPostulaciones.map((p) => (
                        <div key={p.id} className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row gap-6">
                            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0">
                                <User className="w-6 h-6 text-slate-300" />
                            </div>
                            <div className="flex-1 space-y-4">
                                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 leading-tight">{p.estudiante.primer_nombre} {p.estudiante.primer_apellido}</h3>
                                        <div className="flex items-center gap-3 mt-1.5 text-slate-400">
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
                                                <Mail className="w-3 h-3" />
                                                {p.estudiante.correo}
                                            </div>
                                        </div>
                                    </div>
                                    <span className={cn(
                                        "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                                        p.estado === 'PENDIENTE' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                        p.estado === 'ACEPTADA' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                        'bg-rose-50 text-rose-600 border-rose-100'
                                    )}>
                                        {p.estado}
                                    </span>
                                </div>

                                <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-2">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Proyecto Solicitado</p>
                                    <p className="text-sm font-bold text-slate-700">{p.convocatoria.titulo}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-[10px] font-bold bg-white text-slate-500 px-2 py-0.5 rounded border border-slate-100">{p.convocatoria.modalidad}</span>
                                    </div>
                                </div>

                                {p.estado === 'PENDIENTE' && (
                                    <div className="flex items-center gap-3 pt-2">
                                        <button 
                                            onClick={() => handleAction(p.id, 'ACEPTADA')}
                                            className="flex-1 h-10 bg-emerald-50 text-emerald-600 rounded-xl font-bold text-xs hover:bg-emerald-500 hover:text-white transition-all border border-emerald-100"
                                        >
                                            Aprobar Solicitud
                                        </button>
                                        <button 
                                            onClick={() => handleAction(p.id, 'RECHAZADA')}
                                            className="flex-1 h-10 bg-rose-50 text-rose-600 rounded-xl font-bold text-xs hover:bg-rose-500 hover:text-white transition-all border border-rose-100"
                                        >
                                            Rechazar
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-40 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 border-dashed">
                    <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100">
                        <Inbox className="w-8 h-8 text-slate-200" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Bandeja de Entrada Vacía</h3>
                    <p className="text-slate-400 max-w-xs mx-auto font-medium">
                        No hay postulaciones {filterStatus !== 'TODOS' ? `con estado ${filterStatus}` : ''} por el momento.
                    </p>
                </div>
            )}
        </div>
    );
}
