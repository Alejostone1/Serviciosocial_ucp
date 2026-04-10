'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    ArrowLeft,
    Users,
    Calendar,
    Target,
    FileText,
    Building2,
    Tag,
    Loader2,
    ChevronRight,
    Search,
    Filter
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
    aprobarConvocatoria,
    rechazarConvocatoria,
    devolverConvocatoriaABorrador
} from '../aprobacion-actions';

interface PendientesClientProps {
    convocatorias: any[];
    estadisticas: {
        pendientes: number;
        aprobadasMes: number;
        rechazadasMes: number;
    };
}

export function PendientesClient({ convocatorias, estadisticas }: PendientesClientProps) {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [showRechazarModal, setShowRechazarModal] = useState<string | null>(null);
    const [showDevolverModal, setShowDevolverModal] = useState<string | null>(null);
    const [motivo, setMotivo] = useState('');
    const [observaciones, setObservaciones] = useState('');

    const filteredConvocatorias = convocatorias.filter(conv =>
        conv.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.publicador?.primer_nombre?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAprobar = async (id: string) => {
        setLoadingId(id);
        try {
            await aprobarConvocatoria(id);
            toast.success('Convocatoria aprobada exitosamente');
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || 'Error al aprobar convocatoria');
        } finally {
            setLoadingId(null);
        }
    };

    const handleRechazar = async (id: string) => {
        if (!motivo.trim()) {
            toast.error('El motivo de rechazo es obligatorio');
            return;
        }
        setLoadingId(id);
        try {
            await rechazarConvocatoria(id, motivo);
            toast.success('Convocatoria rechazada');
            setShowRechazarModal(null);
            setMotivo('');
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || 'Error al rechazar convocatoria');
        } finally {
            setLoadingId(null);
        }
    };

    const handleDevolver = async (id: string) => {
        if (!observaciones.trim()) {
            toast.error('Las observaciones son obligatorias');
            return;
        }
        setLoadingId(id);
        try {
            await devolverConvocatoriaABorrador(id, observaciones);
            toast.success('Convocatoria devuelta a borrador');
            setShowDevolverModal(null);
            setObservaciones('');
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || 'Error al devolver convocatoria');
        } finally {
            setLoadingId(null);
        }
    };

    const getRolLabel = (rol: string) => {
        switch (rol) {
            case 'PROFESOR': return 'Profesor';
            case 'AUXILIAR': return 'Auxiliar';
            case 'ALIADO': return 'Aliado';
            default: return rol;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/administrador/convocatorias"
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900">Convocatorias Pendientes</h1>
                                <p className="text-sm text-slate-500">Aprobación de convocatorias esperando confirmación</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white p-5 rounded-xl border border-slate-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                                <Clock className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">{estadisticas.pendientes}</p>
                                <p className="text-xs text-slate-500 font-medium uppercase tracking-tight">Pendientes</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-slate-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">{estadisticas.aprobadasMes}</p>
                                <p className="text-xs text-slate-500 font-medium uppercase tracking-tight">Aprobadas este mes</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-slate-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center">
                                <XCircle className="w-5 h-5 text-rose-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">{estadisticas.rechazadasMes}</p>
                                <p className="text-xs text-slate-500 font-medium uppercase tracking-tight">Rechazadas este mes</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="mb-6">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar convocatorias..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 h-11 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-[#8B1E1E]/5 focus:border-[#8B1E1E]/20 text-sm transition-all font-medium"
                        />
                    </div>
                </div>

                {/* Convocatorias List */}
                {filteredConvocatorias.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
                        <Clock className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">No hay convocatorias pendientes</h3>
                        <p className="text-slate-500">Todas las convocatorias han sido revisadas</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredConvocatorias.map((conv) => (
                            <div key={conv.id} className="bg-white rounded-xl border border-slate-200 p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border bg-amber-50 text-amber-700 border-amber-100">
                                                Esperando Confirmación
                                            </span>
                                            {conv.categoria && (
                                                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                                    {conv.categoria.nombre}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-1">{conv.titulo}</h3>
                                        <p className="text-slate-500 text-sm mb-4 line-clamp-2">{conv.descripcion}</p>

                                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mb-4">
                                            <span className="flex items-center gap-1.5">
                                                <Users className="w-3.5 h-3.5" />
                                                {getRolLabel(conv.publicador?.rol)}: {conv.publicador?.primer_nombre} {conv.publicador?.primer_apellido}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5" />
                                                Inicio: {new Date(conv.fecha_inicio).toLocaleDateString()}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Target className="w-3.5 h-3.5" />
                                                {conv.horas_totales_ofrecidas || 0} horas
                                            </span>
                                            {conv.programa && (
                                                <span className="flex items-center gap-1.5">
                                                    <Building2 className="w-3.5 h-3.5" />
                                                    {conv.programa.nombre}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 ml-4">
                                        <button
                                            onClick={() => handleAprobar(conv.id)}
                                            disabled={loadingId === conv.id}
                                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-all disabled:opacity-50 text-sm"
                                        >
                                            {loadingId === conv.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <CheckCircle className="w-4 h-4" />
                                            )}
                                            Aprobar
                                        </button>
                                        <button
                                            onClick={() => setShowDevolverModal(conv.id)}
                                            disabled={loadingId === conv.id}
                                            className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-lg font-medium hover:bg-amber-200 transition-all disabled:opacity-50 text-sm"
                                        >
                                            <AlertCircle className="w-4 h-4" />
                                            Devolver
                                        </button>
                                        <button
                                            onClick={() => setShowRechazarModal(conv.id)}
                                            disabled={loadingId === conv.id}
                                            className="flex items-center gap-2 px-4 py-2 bg-rose-100 text-rose-700 rounded-lg font-medium hover:bg-rose-200 transition-all disabled:opacity-50 text-sm"
                                        >
                                            <XCircle className="w-4 h-4" />
                                            Rechazar
                                        </button>
                                        <Link
                                            href={`/administrador/convocatorias/revisar/${conv.id}`}
                                            className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-all text-sm"
                                        >
                                            <FileText className="w-4 h-4" />
                                            Revisar
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal Rechazar */}
            {showRechazarModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Rechazar Convocatoria</h3>
                        <p className="text-sm text-slate-500 mb-4">
                            Por favor indique el motivo del rechazo. Esta información será enviada al creador.
                        </p>
                        <textarea
                            value={motivo}
                            onChange={(e) => setMotivo(e.target.value)}
                            placeholder="Motivo del rechazo..."
                            rows={4}
                            className="w-full p-3 rounded-lg border border-slate-200 focus:border-rose-300 focus:ring-2 focus:ring-rose-100 outline-none transition-all resize-none text-sm"
                        />
                        <div className="flex justify-end gap-3 mt-4">
                            <button
                                onClick={() => {
                                    setShowRechazarModal(null);
                                    setMotivo('');
                                }}
                                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => handleRechazar(showRechazarModal)}
                                disabled={loadingId === showRechazarModal}
                                className="px-4 py-2 bg-rose-600 text-white font-medium rounded-lg hover:bg-rose-700 transition-all disabled:opacity-50"
                            >
                                {loadingId === showRechazarModal ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    'Rechazar'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Devolver */}
            {showDevolverModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Devolver a Borrador</h3>
                        <p className="text-sm text-slate-500 mb-4">
                            Indique las correcciones necesarias. La convocatoria volverá a estado BORRADOR.
                        </p>
                        <textarea
                            value={observaciones}
                            onChange={(e) => setObservaciones(e.target.value)}
                            placeholder="Observaciones para el creador..."
                            rows={4}
                            className="w-full p-3 rounded-lg border border-slate-200 focus:border-amber-300 focus:ring-2 focus:ring-amber-100 outline-none transition-all resize-none text-sm"
                        />
                        <div className="flex justify-end gap-3 mt-4">
                            <button
                                onClick={() => {
                                    setShowDevolverModal(null);
                                    setObservaciones('');
                                }}
                                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => handleDevolver(showDevolverModal)}
                                disabled={loadingId === showDevolverModal}
                                className="px-4 py-2 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 transition-all disabled:opacity-50"
                            >
                                {loadingId === showDevolverModal ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    'Devolver'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
