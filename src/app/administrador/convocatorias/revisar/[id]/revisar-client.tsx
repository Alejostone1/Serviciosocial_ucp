'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Users,
    Calendar,
    Target,
    FileText,
    Building2,
    Tag,
    MapPin,
    Loader2,
    Activity,
    ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
    aprobarConvocatoria,
    rechazarConvocatoria,
    devolverConvocatoriaABorrador
} from '../../aprobacion-actions';

interface RevisarClientProps {
    convocatoria: any;
}

export function RevisarClient({ convocatoria }: RevisarClientProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showRechazarModal, setShowRechazarModal] = useState(false);
    const [showDevolverModal, setShowDevolverModal] = useState(false);
    const [motivo, setMotivo] = useState('');
    const [observaciones, setObservaciones] = useState('');

    const getEstadoStyles = (estado: string) => {
        switch (estado) {
            case 'BORRADOR': return 'bg-slate-100 text-slate-600 border-slate-200';
            case 'ESPERANDO_CONFIRMACION': return 'bg-amber-50 text-amber-700 border-amber-100';
            case 'PUBLICADA': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'EN_CURSO': return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'CERRADA': return 'bg-slate-100 text-slate-600 border-slate-200';
            case 'CANCELADA': return 'bg-gray-100 text-gray-600 border-gray-200';
            case 'RECHAZADA': return 'bg-rose-50 text-rose-700 border-rose-100';
            default: return 'bg-slate-50 text-slate-500 border-slate-100';
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

    const handleAprobar = async () => {
        setLoading(true);
        try {
            await aprobarConvocatoria(convocatoria.id);
            toast.success('Convocatoria aprobada exitosamente');
            router.push('/administrador/convocatorias/pendientes');
        } catch (error: any) {
            toast.error(error.message || 'Error al aprobar');
            setLoading(false);
        }
    };

    const handleRechazar = async () => {
        if (!motivo.trim()) {
            toast.error('El motivo es obligatorio');
            return;
        }
        setLoading(true);
        try {
            await rechazarConvocatoria(convocatoria.id, motivo);
            toast.success('Convocatoria rechazada');
            router.push('/administrador/convocatorias/pendientes');
        } catch (error: any) {
            toast.error(error.message || 'Error al rechazar');
            setLoading(false);
        }
    };

    const handleDevolver = async () => {
        if (!observaciones.trim()) {
            toast.error('Las observaciones son obligatorias');
            return;
        }
        setLoading(true);
        try {
            await devolverConvocatoriaABorrador(convocatoria.id, observaciones);
            toast.success('Convocatoria devuelta a borrador');
            router.push('/administrador/convocatorias/pendientes');
        } catch (error: any) {
            toast.error(error.message || 'Error al devolver');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/administrador/convocatorias/pendientes"
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <div>
                                <h1 className="text-lg font-bold text-slate-900">Revisar Convocatoria</h1>
                                <p className="text-sm text-slate-500">{convocatoria.titulo}</p>
                            </div>
                        </div>
                        <span className={cn(
                            "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border",
                            getEstadoStyles(convocatoria.estado)
                        )}>
                            {convocatoria.estado === 'ESPERANDO_CONFIRMACION' ? 'Esperando Confirmación' : convocatoria.estado}
                        </span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Action Buttons */}
                <div className="flex gap-3 mb-8">
                    <button
                        onClick={handleAprobar}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all disabled:opacity-50 shadow-md shadow-emerald-200"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                        Aprobar y Publicar
                    </button>
                    <button
                        onClick={() => setShowDevolverModal(true)}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-3 bg-amber-100 text-amber-700 rounded-xl font-semibold hover:bg-amber-200 transition-all disabled:opacity-50"
                    >
                        <AlertCircle className="w-5 h-5" />
                        Devolver a Borrador
                    </button>
                    <button
                        onClick={() => setShowRechazarModal(true)}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-3 bg-rose-100 text-rose-700 rounded-xl font-semibold hover:bg-rose-200 transition-all disabled:opacity-50"
                    >
                        <XCircle className="w-5 h-5" />
                        Rechazar
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Información General */}
                        <div className="bg-white rounded-xl border border-slate-200 p-6">
                            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-slate-400" />
                                Información General
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Título</label>
                                    <p className="text-slate-900 font-medium mt-1">{convocatoria.titulo}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Descripción</label>
                                    <p className="text-slate-600 text-sm mt-1 leading-relaxed">{convocatoria.descripcion}</p>
                                </div>
                                {convocatoria.objetivo && (
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Objetivo</label>
                                        <p className="text-slate-600 text-sm mt-1 leading-relaxed">{convocatoria.objetivo}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Detalles */}
                        <div className="bg-white rounded-xl border border-slate-200 p-6">
                            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-slate-400" />
                                Detalles del Proyecto
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 rounded-lg">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Calendar className="w-3.5 h-3.5" />
                                        Fecha de Inicio
                                    </label>
                                    <p className="text-slate-900 font-medium mt-1">
                                        {new Date(convocatoria.fecha_inicio).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-lg">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Clock className="w-3.5 h-3.5" />
                                        Fecha de Fin
                                    </label>
                                    <p className="text-slate-900 font-medium mt-1">
                                        {convocatoria.fecha_fin ? new Date(convocatoria.fecha_fin).toLocaleDateString() : 'No definida'}
                                    </p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-lg">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Users className="w-3.5 h-3.5" />
                                        Cupos
                                    </label>
                                    <p className="text-slate-900 font-medium mt-1">
                                        {convocatoria.cupo_disponible || 0} / {convocatoria.cupo_maximo || 0} disponibles
                                    </p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-lg">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Target className="w-3.5 h-3.5" />
                                        Horas a Certificar
                                    </label>
                                    <p className="text-slate-900 font-medium mt-1">{convocatoria.horas_totales_ofrecidas || 0} horas</p>
                                </div>
                            </div>
                            {(convocatoria.modalidad || convocatoria.lugar) && (
                                <div className="p-4 bg-slate-50 rounded-lg mt-4">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <MapPin className="w-3.5 h-3.5" />
                                        Modalidad y Ubicación
                                    </label>
                                    <p className="text-slate-900 font-medium mt-1">
                                        {convocatoria.modalidad}
                                        {convocatoria.lugar && ` - ${convocatoria.lugar}`}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Actividades */}
                        {convocatoria.actividades && convocatoria.actividades.length > 0 && (
                            <div className="bg-white rounded-xl border border-slate-200 p-6">
                                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-slate-400" />
                                    Actividades ({convocatoria.actividades.length})
                                </h2>
                                <div className="space-y-3">
                                    {convocatoria.actividades.map((act: any) => (
                                        <div key={act.id} className="p-4 bg-slate-50 rounded-lg">
                                            <h4 className="font-semibold text-slate-900">{act.nombre}</h4>
                                            {act.descripcion && (
                                                <p className="text-sm text-slate-600 mt-1">{act.descripcion}</p>
                                            )}
                                            <p className="text-xs text-slate-500 mt-2">
                                                {act.horas_estimadas} horas estimadas
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Creador */}
                        <div className="bg-white rounded-xl border border-slate-200 p-6">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Creador</h3>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-[#8B1E1E]/10 flex items-center justify-center">
                                    <Users className="w-5 h-5 text-[#8B1E1E]" />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900">
                                        {convocatoria.publicador?.primer_nombre} {convocatoria.publicador?.primer_apellido}
                                    </p>
                                    <p className="text-sm text-slate-500">{getRolLabel(convocatoria.publicador?.rol)}</p>
                                    <p className="text-xs text-slate-400">{convocatoria.publicador?.correo}</p>
                                </div>
                            </div>
                        </div>

                        {/* Categoría y Programa */}
                        <div className="bg-white rounded-xl border border-slate-200 p-6">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Clasificación</h3>
                            <div className="space-y-3">
                                {convocatoria.categoria && (
                                    <div className="flex items-center gap-2">
                                        <Tag className="w-4 h-4 text-slate-400" />
                                        <span className="text-sm text-slate-600">{convocatoria.categoria.nombre}</span>
                                    </div>
                                )}
                                {convocatoria.programa && (
                                    <div className="flex items-center gap-2">
                                        <Building2 className="w-4 h-4 text-slate-400" />
                                        <span className="text-sm text-slate-600">{convocatoria.programa.nombre}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="bg-white rounded-xl border border-slate-200 p-6">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Historial</h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2" />
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">Creada</p>
                                        <p className="text-xs text-slate-500">
                                            {new Date(convocatoria.creado_en).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                {convocatoria.publicado_en && (
                                    <div className="flex items-start gap-3">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">Publicada</p>
                                            <p className="text-xs text-slate-500">
                                                {new Date(convocatoria.publicado_en).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Rechazar */}
            {showRechazarModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Rechazar Convocatoria</h3>
                        <p className="text-sm text-slate-500 mb-4">
                            Indique el motivo del rechazo. Esta información será enviada al creador.
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
                                    setShowRechazarModal(false);
                                    setMotivo('');
                                }}
                                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleRechazar}
                                disabled={loading}
                                className="px-4 py-2 bg-rose-600 text-white font-medium rounded-lg hover:bg-rose-700 transition-all disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Rechazar'}
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
                                    setShowDevolverModal(false);
                                    setObservaciones('');
                                }}
                                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDevolver}
                                disabled={loading}
                                className="px-4 py-2 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 transition-all disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Devolver'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
