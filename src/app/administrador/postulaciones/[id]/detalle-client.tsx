'use client';

import React, { useState } from 'react';
import { ArrowLeft, User, Calendar, Clock, MapPin, Globe, FileText, Award, Edit, Trash2, Eye, CheckCircle, XCircle, AlertCircle, Download, Mail, Phone, Building2, BookOpen, Users } from 'lucide-react';
import { StatusBadge } from '@/components/ui/status-badge';
import { DataTable, ColumnDef } from '@/components/ui/data-table';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { toast } from 'sonner';
import { cambiarEstadoPostulacion, eliminarPostulacion } from '../actions';
import Link from 'next/link';
import { EstadoPostulacion, Modalidad } from '@prisma/client';

type Postulacion = {
    id: string;
    id_convocatoria: string;
    id_estudiante: string;
    estado: EstadoPostulacion;
    motivacion: string | null;
    url_hoja_vida: string | null;
    habilidades_relevantes: string[];
    postulado_en: Date;
    revisado_en: Date | null;
    revisado_por: string | null;
    notas_revision: string | null;
    fecha_entrevista: Date | null;
    url_acta_entrevista: string | null;
    estudiante: {
        id: string;
        primer_nombre: string;
        segundo_nombre: string | null;
        primer_apellido: string;
        segundo_apellido: string | null;
        numero_documento: string;
        correo: string;
        telefono: string | null;
        foto_url: string | null;
        esta_bloqueado: boolean;
        ultimo_acceso: Date | null;
        programa: {
            id: string;
            nombre: string;
            codigo: string | null;
            nivel_formacion: string;
            horas_requeridas: number;
            facultad: {
                id: string;
                nombre: string;
                codigo: string | null;
                decano: string | null;
                correo_contacto: string | null;
            };
        } | null;
        perfil_estudiante: {
            horas_previas: number;
            horas_acumuladas: number;
            porcentaje_avance: number;
            semestre_actual: number | null;
            codigo_estudiantil: string | null;
            creado_en: Date;
            actualizado_en: Date;
        } | null;
    };
    convocatoria: {
        id: string;
        titulo: string;
        descripcion: string;
        objetivo: string | null;
        modalidad: Modalidad;
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
            };
        } | null;
        publicador: {
            id: string;
            primer_nombre: string;
            primer_apellido: string;
            correo: string;
        };
        actividades: Array<{
            id: string;
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
            creador: {
                primer_nombre: string;
                primer_apellido: string;
            };
        }>;
    } | null;
    revisor: {
        id: string;
        primer_nombre: string;
        primer_apellido: string;
        correo: string;
    } | null;
};

export function PostulacionDetalleClient({ postulacion }: { postulacion: Postulacion }) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isEstadoDialogOpen, setIsEstadoDialogOpen] = useState(false);
    const [nuevoEstado, setNuevoEstado] = useState<EstadoPostulacion | null>(null);
    const [notasRevision, setNotasRevision] = useState('');

    const handleCambiarEstado = async () => {
        if (!nuevoEstado) return;

        setIsProcessing(true);
        const toastId = toast.loading('Actualizando estado...');
        try {
            await cambiarEstadoPostulacion(postulacion.id, nuevoEstado, notasRevision);
            toast.success('✅ Estado actualizado', { id: toastId });
            window.location.reload();
        } catch (e: any) {
            toast.error('Error al cambiar estado', { id: toastId, description: e.message });
        } finally {
            setIsProcessing(false);
            setIsEstadoDialogOpen(false);
            setNuevoEstado(null);
            setNotasRevision('');
        }
    };

    const handleEliminar = async () => {
        setIsProcessing(true);
        const toastId = toast.loading('Eliminando postulación...');
        try {
            await eliminarPostulacion(postulacion.id);
            toast.success('✅ Postulación eliminada', { id: toastId });
            window.location.href = '/administrador/postulaciones';
        } catch (e: any) {
            toast.error('Error al eliminar', { id: toastId, description: e.message });
        } finally {
            setIsProcessing(false);
            setIsDeleteDialogOpen(false);
        }
    };

    const modalidadLabels: Record<Modalidad, string> = {
        PRESENCIAL: 'Presencial',
        VIRTUAL: 'Virtual',
        HIBRIDA: 'Híbrida',
    };

    const actividadColumns: ColumnDef<NonNullable<Postulacion['convocatoria']>['actividades'][0]>[] = [
        {
            header: 'Actividad',
            cell: (item) => (
                <div>
                    <p className="font-bold text-[#1e293b]">{item.nombre}</p>
                    {item.descripcion && (
                        <p className="text-xs text-[#94a3b8] line-clamp-1">{item.descripcion}</p>
                    )}
                </div>
            ),
        },
        {
            header: 'Tipo',
            cell: (item) => (
                <span className="text-xs font-semibold px-2 py-1 rounded-md bg-blue-50 text-blue-700">
                    {item.tipo_actividad.replace(/_/g, ' ')}
                </span>
            ),
        },
        {
            header: 'Horas',
            cell: (item) => (
                <div className="text-xs">
                    <div className="font-bold text-[#8B1E1E]">{item.horas_estimadas}h</div>
                    {item.horas_maximas && (
                        <div className="text-[#94a3b8]">máx: {item.horas_maximas}h</div>
                    )}
                </div>
            ),
        },
        {
            header: 'Fechas',
            cell: (item) => (
                <div className="text-xs">
                    {item.fecha_inicio && <div>Inicio: {new Date(item.fecha_inicio).toLocaleDateString()}</div>}
                    {item.fecha_limite && <div>Límite: {new Date(item.fecha_limite).toLocaleDateString()}</div>}
                </div>
            ),
        },
        {
            header: 'Ubicación',
            cell: (item) => (
                <span className="text-xs text-[#64748b]">
                    {item.ubicacion || 'No especificada'}
                </span>
            ),
        },
        {
            header: 'Estado',
            cell: (item) => <StatusBadge status={item.esta_activa ? 'ACTIVA' : 'INACTIVA'} />,
        },
        {
            header: 'Creador',
            cell: (item) => (
                <span className="text-xs text-[#64748b]">
                    {item.creador.primer_nombre} {item.creador.primer_apellido}
                </span>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/administrador/postulaciones"
                    className="flex items-center gap-2 text-[#64748b] hover:text-[#8B1E1E] transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Volver a Postulaciones
                </Link>
            </div>

            {/* Información Principal */}
            <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl font-bold text-[#1e293b]">Postulación</h1>
                            <StatusBadge status={postulacion.estado} />
                        </div>
                        <div className="flex items-center gap-4 text-sm text-[#64748b]">
                            <span>Postulado el: {new Date(postulacion.postulado_en).toLocaleDateString()}</span>
                            {postulacion.revisado_en && (
                                <span>Revisado el: {new Date(postulacion.revisado_en).toLocaleDateString()}</span>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                        <button
                            onClick={() => setIsEstadoDialogOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#8B1E1E] text-white rounded-lg hover:bg-[#731919] transition-colors text-sm font-semibold w-full sm:w-auto justify-center"
                        >
                            <Edit className="w-4 h-4" />
                            Cambiar Estado
                        </button>
                        <button
                            onClick={() => setIsDeleteDialogOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold w-full sm:w-auto justify-center"
                        >
                            <Trash2 className="w-4 h-4" />
                            Eliminar
                        </button>
                    </div>
                </div>
            </div>

            {/* Información del Estudiante */}
            <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
                <h2 className="text-xl font-bold text-[#1e293b] mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-[#8B1E1E]" />
                    Información del Estudiante
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-4 sm:p-5">
                            <h3 className="text-lg font-bold text-[#1e293b] leading-tight">
                                {postulacion.estudiante.primer_nombre} {postulacion.estudiante.segundo_nombre} {postulacion.estudiante.primer_apellido} {postulacion.estudiante.segundo_apellido}
                            </h3>
                            <p className="text-sm text-[#94a3b8] font-mono mt-1 break-all">{postulacion.estudiante.numero_documento}</p>

                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="flex items-center gap-2 min-w-0">
                                    <Mail className="w-4 h-4 text-[#64748b] shrink-0" />
                                    <span className="text-sm text-[#64748b] break-all">{postulacion.estudiante.correo}</span>
                                </div>
                                {postulacion.estudiante.telefono && (
                                    <div className="flex items-center gap-2 min-w-0">
                                        <Phone className="w-4 h-4 text-[#64748b] shrink-0" />
                                        <span className="text-sm text-[#64748b] break-all">{postulacion.estudiante.telefono}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {postulacion.estudiante.programa && (
                            <div>
                                <span className="text-sm text-[#64748b]">Programa:</span>
                                <p className="font-medium text-[#1e293b]">
                                    {postulacion.estudiante.programa.nombre}
                                    {postulacion.estudiante.programa.codigo && (
                                        <span className="text-xs text-[#94a3b8] ml-1">({postulacion.estudiante.programa.codigo})</span>
                                    )}
                                </p>
                                <p className="text-sm text-[#64748b]">
                                    {postulacion.estudiante.programa.facultad.nombre}
                                </p>
                            </div>
                        )}
                        {postulacion.estudiante.perfil_estudiante && (
                            <div>
                                <span className="text-sm text-[#64748b]">Información Académica:</span>
                                <div className="space-y-1 text-sm">
                                    <p>Semestre: {postulacion.estudiante.perfil_estudiante.semestre_actual || 'N/A'}</p>
                                    <p>Código: {postulacion.estudiante.perfil_estudiante.codigo_estudiantil || 'N/A'}</p>
                                    <p>Horas acumuladas: {postulacion.estudiante.perfil_estudiante.horas_acumuladas}h</p>
                                    <p>Progreso: {postulacion.estudiante.perfil_estudiante.porcentaje_avance.toFixed(1)}%</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Información de la Convocatoria */}
            {postulacion.convocatoria && (
                <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
                    <h2 className="text-xl font-bold text-[#1e293b] mb-4 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-[#8B1E1E]" />
                        Convocatoria
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-bold text-[#1e293b]">{postulacion.convocatoria.titulo}</h3>
                            <p className="text-[#64748b] mt-1">{postulacion.convocatoria.descripcion}</p>
                            {postulacion.convocatoria.objetivo && (
                                <div className="mt-2">
                                    <span className="text-sm text-[#64748b]">Objetivo:</span>
                                    <p className="text-[#1e293b]">{postulacion.convocatoria.objetivo}</p>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-[#64748b]">Modalidad:</span>
                                <p className="font-medium">{modalidadLabels[postulacion.convocatoria.modalidad]}</p>
                            </div>
                            <div>
                                <span className="text-[#64748b]">Horas ofrecidas:</span>
                                <p className="font-medium">{postulacion.convocatoria.horas_totales_ofrecidas || 'N/A'} horas</p>
                            </div>
                            <div>
                                <span className="text-[#64748b]">Fechas:</span>
                                <p className="font-medium">
                                    {new Date(postulacion.convocatoria.fecha_inicio).toLocaleDateString()} -
                                    {postulacion.convocatoria.fecha_fin ? new Date(postulacion.convocatoria.fecha_fin).toLocaleDateString() : 'Sin fecha fin'}
                                </p>
                            </div>
                            <div>
                                <span className="text-[#64748b]">Cupos:</span>
                                <p className="font-medium">
                                    {postulacion.convocatoria.cupo_disponible}/{postulacion.convocatoria.cupo_maximo}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Motivación y Habilidades */}
            <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
                <h2 className="text-xl font-bold text-[#1e293b] mb-4">Motivación y Habilidades</h2>
                <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold text-[#334155] mb-2">Motivación</h3>
                        <p className="text-[#1e293b]">
                            {postulacion.motivacion || 'No se proporcionó una motivación'}
                        </p>
                    </div>

                    {postulacion.habilidades_relevantes.length > 0 && (
                        <div>
                            <h3 className="font-semibold text-[#334155] mb-2">Habilidades Relevantes</h3>
                            <div className="flex flex-wrap gap-2">
                                {postulacion.habilidades_relevantes.map((habilidad, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                                    >
                                        {habilidad}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Actividades de la Convocatoria */}
            {postulacion.convocatoria && postulacion.convocatoria.actividades.length > 0 && (
                <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
                    <h2 className="text-xl font-bold text-[#1e293b] mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-[#8B1E1E]" />
                        Actividades de la Convocatoria
                    </h2>
                    <DataTable
                        columns={actividadColumns}
                        data={postulacion.convocatoria.actividades}
                        searchPlaceholder="Buscar actividad..."
                        emptyMessage="No hay actividades registradas."
                    />
                </div>
            )}

            {/* Información de Revisión */}
            <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
                <h2 className="text-xl font-bold text-[#1e293b] mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#8B1E1E]" />
                    Información de Revisión
                </h2>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <span className="text-sm text-[#64748b]">Revisor:</span>
                            <p className="font-medium">
                                {postulacion.revisor
                                    ? `${postulacion.revisor.primer_nombre} ${postulacion.revisor.primer_apellido}`
                                    : 'Sin asignar'
                                }
                            </p>
                        </div>
                        <div>
                            <span className="text-sm text-[#64748b]">Fecha de revisión:</span>
                            <p className="font-medium">
                                {postulacion.revisado_en
                                    ? new Date(postulacion.revisado_en).toLocaleDateString()
                                    : 'No revisado'
                                }
                            </p>
                        </div>
                    </div>

                    {postulacion.notas_revision && (
                        <div>
                            <span className="text-sm text-[#64748b]">Notas de revisión:</span>
                            <p className="text-[#1e293b] mt-1">{postulacion.notas_revision}</p>
                        </div>
                    )}

                    {postulacion.fecha_entrevista && (
                        <div>
                            <span className="text-sm text-[#64748b]">Fecha de entrevista:</span>
                            <p className="font-medium">
                                {new Date(postulacion.fecha_entrevista).toLocaleDateString()}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Documentos */}
            <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
                <h2 className="text-xl font-bold text-[#1e293b] mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#8B1E1E]" />
                    Documentos
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {postulacion.url_hoja_vida && (
                        <a
                            href={postulacion.url_hoja_vida}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-semibold border border-blue-100"
                        >
                            <Download className="w-4 h-4" />
                            Ver Hoja de Vida
                        </a>
                    )}
                    {postulacion.url_acta_entrevista && (
                        <a
                            href={postulacion.url_acta_entrevista}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-semibold border border-green-100"
                        >
                            <Download className="w-4 h-4" />
                            Ver Acta de Entrevista
                        </a>
                    )}
                </div>
            </div>

            {/* Diálogos */}
            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleEliminar}
                title="Eliminar Postulación"
                description={`¿Estás seguro que deseas eliminar la postulación de ${postulacion.estudiante.primer_nombre} ${postulacion.estudiante.primer_apellido}? Esta acción no se puede deshacer.`}
                confirmText="Sí, Eliminar"
                type="danger"
                isLoading={isProcessing}
            />

            {/* Dialog para cambiar estado */}
            {isEstadoDialogOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-bold text-[#1e293b] mb-4">Cambiar Estado</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Nuevo estado</label>
                                <select
                                    value={nuevoEstado || ''}
                                    onChange={(e) => setNuevoEstado(e.target.value as EstadoPostulacion)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Seleccionar estado</option>
                                    <option value="EN_REVISION">En Revisión</option>
                                    <option value="ACEPTADA">Aceptada</option>
                                    <option value="RECHAZADA">Rechazada</option>
                                    <option value="RETIRADA">Retirada</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Notas de revisión</label>
                                <textarea
                                    value={notasRevision}
                                    onChange={(e) => setNotasRevision(e.target.value)}
                                    placeholder="Agregar notas sobre la decisión..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={3}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                onClick={() => setIsEstadoDialogOpen(false)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCambiarEstado}
                                disabled={!nuevoEstado || isProcessing}
                                className="px-4 py-2 bg-[#8B1E1E] text-white rounded-lg hover:bg-[#731919] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? 'Procesando...' : 'Cambiar Estado'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
