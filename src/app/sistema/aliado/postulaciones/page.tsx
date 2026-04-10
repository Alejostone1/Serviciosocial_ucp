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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
            <div className="max-w-6xl mx-auto px-4 py-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Postulaciones Recibidas</h1>
                    <p className="text-slate-500 font-medium leading-relaxed">
                        Revisa las solicitudes de estudiantes interesados en participar en tus proyectos.
                    </p>
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
                    <div className="relative w-full md:w-80 group">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-red-600 transition-colors" />
                        <input 
                            placeholder="Buscar por nombre o proyecto..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 h-11 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm font-medium transition-all placeholder:text-slate-400"
                        />
                    </div>
                    <div className="flex items-center gap-1 bg-white/60 backdrop-blur-sm p-1 rounded-lg w-full md:w-auto shadow-sm border border-slate-200/50">
                        {['TODOS', 'PENDIENTE', 'ACEPTADA', 'RECHAZADA'].map((st) => (
                            <button
                                key={st}
                                onClick={() => setFilterStatus(st)}
                                className={cn(
                                    "flex-1 md:flex-none px-3 py-2 rounded-lg text-sm font-semibold transition-all",
                                    filterStatus === st ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                )}
                            >
                                {st === 'TODOS' ? 'Todas' : st === 'PENDIENTE' ? 'Pendientes' : st === 'ACEPTADA' ? 'Aceptadas' : 'Rechazadas'}
                            </button>
                        ))}
                    </div>
                </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                    </div>
                    <p className="text-slate-600 font-medium">Cargando postulaciones...</p>
                </div>
            ) : filteredPostulaciones.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filteredPostulaciones.map((p) => (
                        <div key={p.id} className="bg-white rounded-xl border border-slate-200/50 p-4 shadow-sm hover:shadow-md transition-all duration-300 hover:border-blue-200/50">
                            <div className="flex items-start gap-3 mb-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200/50 flex-shrink-0">
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-semibold text-slate-900 truncate">{p.estudiante.primer_nombre} {p.estudiante.primer_apellido}</h3>
                                    <div className="flex items-center gap-1.5 text-slate-500">
                                        <Mail className="w-3.5 h-3.5" />
                                        <span className="text-sm font-medium truncate">{p.estudiante.correo}</span>
                                    </div>
                                </div>
                                <span className={cn(
                                    "px-3 py-1.5 rounded-full text-sm font-semibold flex-shrink-0",
                                    p.estado === 'PENDIENTE' ? 'bg-amber-100 text-amber-700' :
                                    p.estado === 'ACEPTADA' ? 'bg-emerald-100 text-emerald-700' :
                                    'bg-rose-100 text-rose-700'
                                )}>
                                    {p.estado === 'PENDIENTE' ? 'Pendiente' : p.estado === 'ACEPTADA' ? 'Aceptada' : 'Rechazada'}
                                </span>
                            </div>

                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-4">
                                <p className="text-sm font-semibold text-slate-600 mb-1 uppercase tracking-wide">Proyecto</p>
                                <p className="text-base font-semibold text-slate-900 mb-2 line-clamp-2">{p.convocatoria.titulo}</p>
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-1 bg-white/80 text-slate-700 rounded-lg text-sm font-medium border border-slate-200">
                                        {p.convocatoria.modalidad}
                                    </span>
                                </div>
                            </div>

                            {p.estado === 'PENDIENTE' && (
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => handleAction(p.id, 'ACEPTADA')}
                                        className="flex-1 h-10 bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-600 transition-all text-sm flex items-center justify-center gap-1.5"
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                        Aceptar
                                    </button>
                                    <button 
                                        onClick={() => handleAction(p.id, 'RECHAZADA')}
                                        className="flex-1 h-10 bg-white text-rose-600 rounded-lg font-semibold hover:bg-rose-50 transition-all border border-rose-200 text-sm flex items-center justify-center gap-1.5"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        Rechazar
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20">
                    <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200">
                        <Inbox className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No hay postulaciones</h3>
                    <p className="text-slate-500 font-medium max-w-md mx-auto">
                        {filterStatus !== 'TODOS' ? `No hay postulaciones con estado "${filterStatus.toLowerCase()}"` : 'No hay postulaciones recibidas por el momento'}
                    </p>
                </div>
            )}
            </div>
        </div>
    );
}
