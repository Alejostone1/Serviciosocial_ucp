'use client';

import React, { useState } from 'react';
import { ArrowLeft, Activity, Calendar, Clock, MapPin, Users, FileText, Edit, Trash2, Power, CheckCircle, XCircle, Eye, Download, BookOpen, AlertCircle, TrendingUp } from 'lucide-react';
import { StatusBadge } from '@/components/ui/status-badge';
import { DataTable, ColumnDef } from '@/components/ui/data-table';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { toast } from 'sonner';
import { toggleActividad, eliminarActividad, aprobarReporteHoras, rechazarReporteHoras } from '../actions';
import { EstadoReporte } from '@prisma/client';
import Link from 'next/link';

type Actividad = {
    id: string;
    id_convocatoria: string;
    nombre: string;
    descripcion: string | null;
    tipo_actividad: string;
    horas_estimadas: number;
    horas_maximas: number | null;
    fecha_inicio: Date | null;
    fecha_limite: Date | null;
    ubicacion: string | null;
    materiales_requeridos: string[];
    esta_activa: boolean;
    creado_por: string;
    creado_en: Date;
    actualizado_en: Date;
    convocatoria: {
        id: string;
        titulo: string;
        descripcion: string;
        objetivo: string | null;
        modalidad: string;
        lugar: string | null;
        url_convocatoria_externa: string | null;
        competencias_requeridas: string[];
        estado: string;
        fecha_inicio: Date;
        fecha_fin: Date | null;
        fecha_cierre_postulacion: Date | null;
        cupo_maximo: number | null;
        cupo_disponible: number | null;
        horas_totales_ofrecidas: number | null;
        url_banner: string | null;
        url_documento_adicional: string | null;
        requiere_entrevista: boolean;
        creado_en: Date;
        publicado_en: Date | null;
        actualizado_en: Date;
        categoria: {
            id: string;
            nombre: string;
            descripcion: string | null;
            icono: string | null;
            color_hex: string | null;
        } | null;
        programa: {
            id: string;
            nombre: string;
            codigo: string | null;
            facultad: {
                id: string;
                nombre: string;
                codigo: string | null;
                decano: string | null;
                correo_contacto: string | null;
            };
        } | null;
        publicador: {
            id: string;
            primer_nombre: string;
            primer_apellido: string;
            correo: string;
        };
    } | null;
    creador: {
        id: string;
        primer_nombre: string;
        primer_apellido: string;
        correo: string;
        rol: string;
        telefono: string | null;
        foto_url: string | null;
    };
    reportes: Array<{
        id: string;
        estado: EstadoReporte;
        horas_reportadas: number;
        horas_aprobadas: number | null;
        descripcion_trabajo: string | null;
        archivos_soporte: any;
        notas_estudiante: string | null;
        id_revisor: string | null;
        notas_revisor: string | null;
        motivo_rechazo: string | null;
        reportado_en: Date;
        revisado_en: Date | null;
        estudiante: {
            id: string;
            primer_nombre: string;
            primer_apellido: string;
            correo: string;
            numero_documento: string;
            programa: {
                id: string;
                nombre: string;
                facultad: {
                    id: string;
                    nombre: string;
                }
            };
            perfil_estudiante: {
                semestre_actual: number | null;
                codigo_estudiantil: string | null;
                horas_previas: number;
                horas_acumuladas: number;
                porcentaje_avance: number;
            };
        };
        revisor: {
            id: string;
            primer_nombre: string;
            primer_apellido: string;
            correo: string;
        } | null;
        historial: Array<{
            id: string;
            estado_anterior: string | null;
            estado_nuevo: string;
            horas_anteriores: number | null;
            horas_nuevas: number | null;
            razon: string | null;
            modificado_en: Date;
        }>;
    }>;
};

export function ActividadDetalleClient({ actividad }: { actividad: Actividad }) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isToggleDialogOpen, setIsToggleDialogOpen] = useState(false);
    const [isAprobarDialogOpen, setIsAprobarDialogOpen] = useState(false);
    const [isRechazarDialogOpen, setIsRechazarDialogOpen] = useState(false);
    const [selectedReporte, setSelectedReporte] = useState<Actividad['reportes'][0] | null>(null);
    const [notasAprobacion, setNotasAprobacion] = useState('');
    const [motivoRechazo, setMotivoRechazo] = useState('');

    const handleToggleActividad = async () => {
        setIsProcessing(true);
        const toastId = toast.loading('Actualizando estado...');
        try {
            await toggleActividad(actividad.id, !actividad.esta_activa);
            toast.success('✅ Estado actualizado', { id: toastId });
            window.location.reload();
        } catch (e: any) {
            toast.error('Error al actualizar estado', { id: toastId, description: e.message });
        } finally {
            setIsProcessing(false);
            setIsToggleDialogOpen(false);
        }
    };

    const handleEliminar = async () => {
        setIsProcessing(true);
        const toastId = toast.loading('Eliminando actividad...');
        try {
            await eliminarActividad(actividad.id);
            toast.success('✅ Actividad eliminada', { id: toastId });
            window.location.href = '/administrador/actividades';
        } catch (e: any) {
            toast.error('Error al eliminar', { id: toastId, description: e.message });
        } finally {
            setIsProcessing(false);
            setIsDeleteDialogOpen(false);
        }
    };

    const handleAprobarReporte = async () => {
        if (!selectedReporte) return;
        
        setIsProcessing(true);
        const toastId = toast.loading('Aprobando reporte...');
        try {
            await aprobarReporteHoras(selectedReporte.id, notasAprobacion);
            toast.success('✅ Reporte aprobado', { id: toastId });
            window.location.reload();
        } catch (e: any) {
            toast.error('Error al aprobar reporte', { id: toastId, description: e.message });
        } finally {
            setIsProcessing(false);
            setIsAprobarDialogOpen(false);
            setSelectedReporte(null);
            setNotasAprobacion('');
        }
    };

    const handleRechazarReporte = async () => {
        if (!selectedReporte) return;
        
        setIsProcessing(true);
        const toastId = toast.loading('Rechazando reporte...');
        try {
            await rechazarReporteHoras(selectedReporte.id, motivoRechazo);
            toast.success('✅ Reporte rechazado', { id: toastId });
            window.location.reload();
        } catch (e: any) {
            toast.error('Error al rechazar reporte', { id: toastId, description: e.message });
        } finally {
            setIsProcessing(false);
            setIsRechazarDialogOpen(false);
            setSelectedReporte(null);
            setMotivoRechazo('');
        }
    };

    const reporteColumns: ColumnDef<Actividad['reportes'][0]>[] = [
        {
            header: 'Estudiante',
            cell: (item) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                        {item.estudiante.primer_nombre[0]}{item.estudiante.primer_apellido[0]}
                    </div>
                    <div className="min-w-0">
                        <p className="font-bold text-[#1e293b] truncate">
                            {item.estudiante.primer_nombre} {item.estudiante.primer_apellido}
                        </p>
                        <p className="text-xs text-[#94a3b8] font-mono">{item.estudiante.numero_documento}</p>
                        <p className="text-xs text-[#64748b] truncate">{item.estudiante.correo}</p>
                    </div>
                </div>
            ),
        },
        {
            header: 'Programa',
            cell: (item) => (
                <div className="min-w-0">
                    <p className="font-semibold text-[#1e293b] truncate">{item.estudiante.programa.nombre}</p>
                    <p className="text-xs text-[#64748b]">{item.estudiante.programa.facultad.nombre}</p>
                </div>
            ),
        },
        {
            header: 'Horas',
            cell: (item) => (
                <div className="text-xs">
                    <div className="font-bold text-[#8B1E1E]">{item.horas_reportadas}h</div>
                    {item.horas_aprobadas && (
                        <div className="text-green-600">Aprobadas: {item.horas_aprobadas}h</div>
                    )}
                </div>
            ),
        },
        {
            header: 'Estado',
            cell: (item) => <StatusBadge status={item.estado} />,
        },
        {
            header: 'Fecha Reporte',
            cell: (item) => (
                <div className="text-xs">
                    <div>{new Date(item.reportado_en).toLocaleDateString()}</div>
                    <div className="text-[#94a3b8]">{new Date(item.reportado_en).toLocaleTimeString()}</div>
                </div>
            ),
        },
        {
            header: 'Revisor',
            cell: (item) => (
                <span className="text-xs text-[#64748b]">
                    {item.revisor ? `${item.revisor.primer_nombre} ${item.revisor.primer_apellido}` : 'Sin revisor'}
                </span>
            ),
        },
        {
            header: 'Acciones',
            cell: (item) => (
                <div className="flex items-center gap-2">
                    {item.estado === 'REPORTADO' && (
                        <>
                            <button
                                onClick={() => {
                                    setSelectedReporte(item);
                                    setIsAprobarDialogOpen(true);
                                }}
                                className="flex items-center gap-2 px-3 py-2 bg-[#166534] text-white rounded-lg hover:bg-[#14532d] transition-colors text-sm font-semibold"
                            >
                                <CheckCircle className="w-4 h-4" />
                                Aprobar
                            </button>
                            <button
                                onClick={() => {
                                    setSelectedReporte(item);
                                    setIsRechazarDialogOpen(true);
                                }}
                                className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
                            >
                                <XCircle className="w-4 h-4" />
                                Rechazar
                            </button>
                        </>
                    )}
                </div>
            ),
        },
    ];

    const modalidadLabels: Record<string, string> = {
        PRESENCIAL: 'Presencial',
        VIRTUAL: 'Virtual',
        HIBRIDA: 'Híbrida',
    };

    const tipoActividadLabels: Record<string, string> = {
        GENERAL: 'General',
        CAPACITACION: 'Capacitación',
        CAMPO: 'Campo',
        ADMINISTRATIVA: 'Administrativa',
        INVESTIGACION: 'Investigación',
        COMUNITARIA: 'Comunitaria',
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/administrador/actividades"
                    className="flex items-center gap-2 text-[#64748b] hover:text-[#8B1E1E] transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Volver a Actividades
                </Link>
            </div>

            {/* Información Principal */}
            <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl font-bold text-[#1e293b]">{actividad.nombre}</h1>
                            <StatusBadge status={actividad.esta_activa ? 'ACTIVA' : 'INACTIVA'} />
                            <span className="text-sm font-semibold px-2 py-1 rounded-md bg-blue-50 text-blue-700">
                                {tipoActividadLabels[actividad.tipo_actividad] || actividad.tipo_actividad}
                            </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-[#64748b]">
                            <span className="font-bold text-[#8B1E1E]">{actividad.horas_estimadas} horas ofrecidas</span>
                            <span>Creada el: {new Date(actividad.creado_en).toLocaleDateString()}</span>
                            <span>Por: {actividad.creador.primer_nombre} {actividad.creador.primer_apellido}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsToggleDialogOpen(true)}
                            className="flex items-center gap-2 px-3 py-2 bg-[#8B1E1E] text-white rounded-lg hover:bg-[#731919] transition-colors text-sm font-semibold"
                        >
                            <Power className="w-4 h-4" />
                            {actividad.esta_activa ? 'Desactivar' : 'Activar'}
                        </button>
                        <button
                            onClick={() => setIsDeleteDialogOpen(true)}
                            className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
                        >
                            <Trash2 className="w-4 h-4" />
                            Eliminar
                        </button>
                    </div>
                </div>

                {/* Descripción y Detalles */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h3 className="font-semibold text-[#334155] mb-3">Información General</h3>
                        <div className="space-y-3 text-sm">
                            <div>
                                <span className="text-[#64748b]">Descripción:</span>
                                <p className="mt-1 text-[#1e293b]">{actividad.descripcion || 'Sin descripción'}</p>
                            </div>
                            {actividad.ubicacion && (
                                <div>
                                    <span className="text-[#64748b]">Ubicación:</span>
                                    <span className="ml-2 font-medium">{actividad.ubicacion}</span>
                                </div>
                            )}
                            {actividad.horas_maximas && (
                                <div>
                                    <span className="text-[#64748b]">Horas máximas:</span>
                                    <span className="ml-2 font-medium">{actividad.horas_maximas} horas</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h3 className="font-semibold text-[#334155] mb-3">Fechas</h3>
                        <div className="space-y-3 text-sm">
                            {actividad.fecha_inicio && (
                                <div>
                                    <span className="text-[#64748b]">Fecha de inicio:</span>
                                    <span className="ml-2 font-medium">{new Date(actividad.fecha_inicio).toLocaleDateString()}</span>
                                </div>
                            )}
                            {actividad.fecha_limite && (
                                <div>
                                    <span className="text-[#64748b]">Fecha límite:</span>
                                    <span className="ml-2 font-medium">{new Date(actividad.fecha_limite).toLocaleDateString()}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Materiales Requeridos */}
                {actividad.materiales_requeridos.length > 0 && (
                    <div className="mt-6">
                        <h3 className="font-semibold text-[#334155] mb-3">Materiales Requeridos</h3>
                        <div className="flex flex-wrap gap-2">
                            {actividad.materiales_requeridos.map((material, index) => (
                                <span
                                    key={index}
                                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                                >
                                    {material}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Información de la Convocatoria */}
            {actividad.convocatoria && (
                <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
                    <h2 className="text-xl font-bold text-[#1e293b] mb-4 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-[#8B1E1E]" />
                        Convocatoria Asociada
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-bold text-[#1e293b]">{actividad.convocatoria.titulo}</h3>
                            <p className="text-[#64748b] mt-1">{actividad.convocatoria.descripcion}</p>
                            {actividad.convocatoria.objetivo && (
                                <div className="mt-2">
                                    <span className="text-sm text-[#64748b]">Objetivo:</span>
                                    <p className="text-[#1e293b]">{actividad.convocatoria.objetivo}</p>
                                </div>
                            )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-[#64748b]">Modalidad:</span>
                                <p className="font-medium">{modalidadLabels[actividad.convocatoria.modalidad]}</p>
                            </div>
                            <div>
                                <span className="text-[#64748b]">Horas ofrecidas:</span>
                                <p className="font-medium">{actividad.convocatoria.horas_totales_ofrecidas || 'N/A'} horas</p>
                            </div>
                            <div>
                                <span className="text-[#64748b]">Fechas:</span>
                                <p className="font-medium">
                                    {new Date(actividad.convocatoria.fecha_inicio).toLocaleDateString()} - 
                                    {actividad.convocatoria.fecha_fin ? new Date(actividad.convocatoria.fecha_fin).toLocaleDateString() : 'Sin fecha fin'}
                                </p>
                            </div>
                            <div>
                                <span className="text-[#64748b]">Cupos:</span>
                                <p className="font-medium">
                                    {actividad.convocatoria.cupo_disponible}/{actividad.convocatoria.cupo_maximo}
                                </p>
                            </div>
                        </div>

                        {/* Categoría y Programa */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <span className="text-sm text-[#64748b]">Categoría:</span>
                                {actividad.convocatoria.categoria && (
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-sm font-semibold px-2 py-1 rounded" 
                                            style={{ 
                                                backgroundColor: (actividad.convocatoria.categoria.color_hex || '#000000') + '20',
                                                color: actividad.convocatoria.categoria.color_hex || '#000000'
                                            }}>
                                            {actividad.convocatoria.categoria.nombre}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div>
                                <span className="text-sm text-[#64748b]">Programa:</span>
                                {actividad.convocatoria.programa && (
                                    <div className="mt-1">
                                        <p className="font-medium">{actividad.convocatoria.programa.nombre}</p>
                                        <p className="text-xs text-[#64748b]">{actividad.convocatoria.programa.facultad.nombre}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Reportes de Horas */}
            <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
                <h2 className="text-xl font-bold text-[#1e293b] mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#8B1E1E]" />
                    Reportes de Horas
                </h2>
                
                {/* Estadísticas de reportes */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-[#f8fafc] rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <FileText className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-[#1e293b]">{actividad.reportes.length}</p>
                                <p className="text-sm text-[#94a3b8]">Total Reportes</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-[#f8fafc] rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-50 rounded-lg">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-[#1e293b]">
                                    {actividad.reportes.filter(r => r.estado === 'APROBADO').length}
                                </p>
                                <p className="text-sm text-[#94a3b8]">Aprobados</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-[#f8fafc] rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-50 rounded-lg">
                                <Clock className="w-5 h-5 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-[#1e293b]">
                                    {actividad.reportes.filter(r => r.estado === 'REPORTADO').length}
                                </p>
                                <p className="text-sm text-[#94a3b8]">Pendientes</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-[#f8fafc] rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-50 rounded-lg">
                                <Activity className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-[#1e293b]">
                                    {actividad.reportes.reduce((sum, r) => sum + (r.horas_aprobadas || 0), 0)}
                                </p>
                                <p className="text-sm text-[#94a3b8]">Horas Aprobadas</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabla de reportes */}
                <DataTable
                    columns={reporteColumns}
                    data={actividad.reportes}
                    searchPlaceholder="Buscar reporte..."
                    emptyMessage="No hay reportes de horas registrados para esta actividad."
                />
            </div>

            {/* Diálogos */}
            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleEliminar}
                title="Eliminar Actividad"
                description={`¿Estás seguro que deseas eliminar la actividad "${actividad.nombre}"? Esta acción no se puede deshacer.`}
                confirmText="Sí, Eliminar"
                type="danger"
                isLoading={isProcessing}
            />

            {/* Dialog para cambiar estado */}
            {isToggleDialogOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-bold text-[#1e293b] mb-4">
                            {actividad.esta_activa ? 'Desactivar' : 'Activar'} Actividad
                        </h3>
                        
                        <p className="text-sm text-[#64748b] mb-6">
                            ¿Estás seguro que deseas {actividad.esta_activa ? 'desactivar' : 'activar'} la actividad &quot;{actividad.nombre}&quot;?
                            {actividad.esta_activa ? 'Los estudiantes ya no podrán reportar horas en esta actividad.' : 'Los estudiantes podrán reportar horas en esta actividad.'}
                        </p>
                        
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setIsToggleDialogOpen(false)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleToggleActividad}
                                disabled={isProcessing}
                                className="px-4 py-2 bg-[#8B1E1E] text-white rounded-lg hover:bg-[#731919] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? 'Procesando...' : (actividad.esta_activa ? 'Desactivar' : 'Activar')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Dialog para aprobar reporte */}
            {isAprobarDialogOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-bold text-[#1e293b] mb-4">Aprobar Reporte de Horas</h3>
                        
                        <div className="mb-4">
                            <p className="text-sm text-[#64748b] mb-2">
                                Estudiante: {selectedReporte?.estudiante.primer_nombre} {selectedReporte?.estudiante.primer_apellido}
                            </p>
                            <p className="text-sm text-[#64748b] mb-2">
                                Horas reportadas: {selectedReporte?.horas_reportadas}h
                            </p>
                        </div>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Notas de aprobación (opcional)</label>
                            <textarea
                                value={notasAprobacion}
                                onChange={(e) => setNotasAprobacion(e.target.value)}
                                placeholder="Agregar notas sobre la aprobación..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={3}
                            />
                        </div>
                        
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setIsAprobarDialogOpen(false)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleAprobarReporte}
                                disabled={isProcessing}
                                className="px-4 py-2 bg-[#166534] text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? 'Procesando...' : 'Aprobar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Dialog para rechazar reporte */}
            {isRechazarDialogOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-bold text-[#1e293b] mb-4">Rechazar Reporte de Horas</h3>
                        
                        <div className="mb-4">
                            <p className="text-sm text-[#64748b] mb-2">
                                Estudiante: {selectedReporte?.estudiante.primer_nombre} {selectedReporte?.estudiante.primer_apellido}
                            </p>
                            <p className="text-sm text-[#64748b] mb-2">
                                Horas reportadas: {selectedReporte?.horas_reportadas}h
                            </p>
                        </div>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Motivo de rechazo *</label>
                            <textarea
                                value={motivoRechazo}
                                onChange={(e) => setMotivoRechazo(e.target.value)}
                                placeholder="Especificar el motivo del rechazo..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={3}
                                required
                            />
                        </div>
                        
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setIsRechazarDialogOpen(false)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleRechazarReporte}
                                disabled={isProcessing || !motivoRechazo.trim()}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? 'Procesando...' : 'Rechazar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
