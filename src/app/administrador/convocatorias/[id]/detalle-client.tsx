'use client';

import React, { useState } from 'react';
import { ArrowLeft, Calendar, Users, Clock, MapPin, Globe, FileText, Award, Edit, Trash2, Eye, CheckCircle, XCircle, AlertCircle, User } from 'lucide-react';
import { StatusBadge } from '@/components/ui/status-badge';
import { DataTable, ColumnDef } from '@/components/ui/data-table';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { EditarConvocatoriaModal } from '../editar-convocatoria-modal';
import { toast } from 'sonner';
import { cambiarEstadoConvocatoria, eliminarConvocatoria } from '../convocatorias-actions';
import { cambiarEstadoPostulacion } from '../../postulaciones/actions';
import Link from 'next/link';
import { EstadoConvocatoria, Modalidad, EstadoPostulacion } from '@prisma/client';

type Convocatoria = {
    id: string;
    titulo: string;
    descripcion: string;
    objetivo: string | null;
    modalidad: Modalidad;
    lugar: string | null;
    url_convocatoria_externa: string | null;
    competencias_requeridas: string[];
    estado: EstadoConvocatoria;
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
            nombre: string;
        };
    } | null;
    publicador: {
        id: string;
        primer_nombre: string;
        primer_apellido: string;
        correo: string;
    };
    postulaciones: Array<{
        id: string;
        estado: string;
        motivacion: string | null;
        postulado_en: Date;
        estudiante: {
            id: string;
            primer_nombre: string;
            primer_apellido: string;
            correo: string;
            numero_documento: string;
        };
        revisor: {
            primer_nombre: string;
            primer_apellido: string;
        } | null;
    }>;
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
        esta_activa: boolean;
        creador: {
            primer_nombre: string;
            primer_apellido: string;
        };
    }>;
};

export function ConvocatoriaDetalleClient({ convocatoria }: { convocatoria: Convocatoria }) {
    const [activeTab, setActiveTab] = useState<'informacion' | 'postulaciones' | 'actividades'>('informacion');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleEditConvocatoria = () => {
        setIsEditModalOpen(true);
    };

    const handleDeleteConvocatoria = () => {
        setIsDeleteDialogOpen(true);
    };

    const confirmDeleteConvocatoria = async () => {
        setIsProcessing(true);
        const toastId = toast.loading('Eliminando convocatoria...');
        try {
            await eliminarConvocatoria(convocatoria.id);
            toast.success('✅ Convocatoria eliminada', {
                id: toastId,
                description: `'${convocatoria.titulo}' ha sido eliminada correctamente.`
            });
            // Redirigir a la lista de convocatorias
            window.location.href = '/administrador/convocatorias';
        } catch (e: any) {
            toast.error('Error al eliminar', {
                id: toastId,
                description: e.message || 'No se pudo eliminar la convocatoria.'
            });
        } finally {
            setIsProcessing(false);
            setIsDeleteDialogOpen(false);
        }
    };

    const handleCambiarEstado = async (nuevoEstado: EstadoConvocatoria) => {
        const toastId = toast.loading('Cambiando estado...');
        try {
            await cambiarEstadoConvocatoria(convocatoria.id, nuevoEstado);
            toast.success('✅ Estado actualizado', {
                id: toastId,
                description: `La convocatoria ahora está ${nuevoEstado}.`
            });
            // Recargar la página
            window.location.reload();
        } catch (e: any) {
            toast.error('Error al cambiar estado', {
                id: toastId,
                description: e.message || 'No se pudo cambiar el estado.'
            });
        }
    };

    const handleCambiarEstadoPostulacion = async (idPostulacion: string, nuevoEstado: EstadoPostulacion) => {
        const toastId = toast.loading('Actualizando estado del estudiante...');
        try {
            await cambiarEstadoPostulacion(idPostulacion, nuevoEstado);
            toast.success('✅ Estado actualizado', {
                id: toastId,
                description: `El estudiante ha sido marcado como ${nuevoEstado}.`
            });
            // Recargar para ver cambios
            window.location.reload();
        } catch (e: any) {
            toast.error('Error al actualizar', {
                id: toastId,
                description: e.message || 'No se pudo actualizar el estado.'
            });
        }
    };

    const postulacionColumns: ColumnDef<Convocatoria['postulaciones'][0]>[] = [
        {
            header: 'Estudiante',
            cell: (item) => (
                <div className="flex items-center gap-3">
                    <div className="flex-1">
                        <p className="font-bold text-[#1e293b]">
                            {item.estudiante.primer_nombre} {item.estudiante.primer_apellido}
                        </p>
                        <p className="text-xs text-[#94a3b8]">{item.estudiante.correo}</p>
                    </div>
                </div>
            ),
        },
        {
            header: 'Estado',
            cell: (item) => <StatusBadge status={item.estado} />,
        },
        {
            header: 'Postulado',
            cell: (item) => (
                <span className="text-xs text-[#64748b]">
                    {new Date(item.postulado_en).toLocaleDateString()}
                </span>
            ),
        },
        {
            header: 'Acciones',
            cell: (item) => (
                <div className="flex items-center gap-1">
                    {item.estado === 'PENDIENTE' && (
                        <>
                            <button
                                onClick={() => handleCambiarEstadoPostulacion(item.id, 'ACEPTADA')}
                                className="p-1.5 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                                title="Aceptar Estudiante"
                            >
                                <CheckCircle className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => handleCambiarEstadoPostulacion(item.id, 'RECHAZADA')}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                title="Rechazar Estudiante"
                            >
                                <XCircle className="w-5 h-5" />
                            </button>
                        </>
                    )}
                    {item.estado !== 'PENDIENTE' && (
                        <button
                            onClick={() => handleCambiarEstadoPostulacion(item.id, 'PENDIENTE')}
                            className="p-1.5 text-slate-400 hover:bg-slate-50 rounded-md transition-colors text-[10px] font-bold uppercase"
                            title="Revertir a Pendiente"
                        >
                            Reset
                        </button>
                    )}
                    <Link
                        href={`/administrador/usuarios/${item.estudiante.id}`}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="Ver Perfil Detallado"
                    >
                        <User className="w-5 h-5" />
                    </Link>
                </div>
            ),
        },
    ];

    const actividadColumns: ColumnDef<Convocatoria['actividades'][0]>[] = [
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

    const modalidadLabels: Record<Modalidad, string> = {
        PRESENCIAL: 'Presencial',
        VIRTUAL: 'Virtual',
        HIBRIDA: 'Híbrida',
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/administrador/convocatorias"
                    className="flex items-center gap-2 text-[#64748b] hover:text-[#8B1E1E] transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Volver a Convocatorias
                </Link>
            </div>

            {/* Información Principal */}
            <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl font-bold text-[#1e293b]">{convocatoria.titulo}</h1>
                            <StatusBadge status={convocatoria.estado} />
                        </div>
                        <div className="flex items-center gap-4 text-sm text-[#64748b]">
                            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded">
                                {modalidadLabels[convocatoria.modalidad]}
                            </span>
                            {convocatoria.horas_totales_ofrecidas && (
                                <span className="font-bold text-[#8B1E1E]">
                                    {convocatoria.horas_totales_ofrecidas} horas ofrecidas
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleEditConvocatoria}
                            className="flex items-center gap-2 px-3 py-2 bg-[#8B1E1E] text-white rounded-lg hover:bg-[#731919] transition-colors text-sm font-semibold"
                        >
                            <Edit className="w-4 h-4" />
                            Editar
                        </button>
                        <button
                            onClick={handleDeleteConvocatoria}
                            className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
                        >
                            <Trash2 className="w-4 h-4" />
                            Eliminar
                        </button>
                    </div>
                </div>

                {/* Información Detallada */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h3 className="font-semibold text-[#334155] mb-3">Información General</h3>
                        <div className="space-y-3 text-sm">
                            <div>
                                <span className="text-[#64748b]">Descripción:</span>
                                <p className="mt-1 text-[#1e293b]">{convocatoria.descripcion}</p>
                            </div>
                            {convocatoria.objetivo && (
                                <div>
                                    <span className="text-[#64748b]">Objetivo:</span>
                                    <p className="mt-1 text-[#1e293b]">{convocatoria.objetivo}</p>
                                </div>
                            )}
                            {convocatoria.lugar && (
                                <div>
                                    <span className="text-[#64748b]">Lugar:</span>
                                    <span className="ml-2 font-medium">{convocatoria.lugar}</span>
                                </div>
                            )}
                            {convocatoria.url_convocatoria_externa && (
                                <div>
                                    <span className="text-[#64748b]">URL Externa:</span>
                                    <a
                                        href={convocatoria.url_convocatoria_externa}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="ml-2 font-medium text-blue-600 hover:underline"
                                    >
                                        Ver convocatoria externa
                                    </a>
                                </div>
                            )}
                            <div>
                                <span className="text-[#64748b]">Requiere entrevista:</span>
                                <span className="ml-2 font-medium">{convocatoria.requiere_entrevista ? 'Sí' : 'No'}</span>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h3 className="font-semibold text-[#334155] mb-3">Fechas y Plazos</h3>
                        <div className="space-y-3 text-sm">
                            <div>
                                <span className="text-[#64748b]">Fecha de inicio:</span>
                                <span className="ml-2 font-medium">{new Date(convocatoria.fecha_inicio).toLocaleDateString()}</span>
                            </div>
                            {convocatoria.fecha_fin && (
                                <div>
                                    <span className="text-[#64748b]">Fecha de fin:</span>
                                    <span className="ml-2 font-medium">{new Date(convocatoria.fecha_fin).toLocaleDateString()}</span>
                                </div>
                            )}
                            {convocatoria.fecha_cierre_postulacion && (
                                <div>
                                    <span className="text-[#64748b]">Cierre de postulaciones:</span>
                                    <span className="ml-2 font-medium">{new Date(convocatoria.fecha_cierre_postulacion).toLocaleDateString()}</span>
                                </div>
                            )}
                            <div>
                                <span className="text-[#64748b]">Publicado:</span>
                                <span className="ml-2 font-medium">
                                    {convocatoria.publicado_en ? new Date(convocatoria.publicado_en).toLocaleDateString() : 'No publicado'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Categoría y Programa */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h3 className="font-semibold text-[#334155] mb-3">Asignación</h3>
                        <div className="space-y-3 text-sm">
                            {convocatoria.categoria && (
                                <div>
                                    <span className="text-[#64748b]">Categoría:</span>
                                    <span className="ml-2 font-medium">{convocatoria.categoria.nombre}</span>
                                </div>
                            )}
                            {convocatoria.programa && (
                                <div>
                                    <span className="text-[#64748b]">Programa:</span>
                                    <span className="ml-2 font-medium">{convocatoria.programa.nombre}</span>
                                    {convocatoria.programa.codigo && (
                                        <span className="text-xs text-[#94a3b8] ml-1">({convocatoria.programa.codigo})</span>
                                    )}
                                </div>
                            )}
                            {convocatoria.programa?.facultad && (
                                <div>
                                    <span className="text-[#64748b]">Facultad:</span>
                                    <span className="ml-2 font-medium">{convocatoria.programa.facultad.nombre}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h3 className="font-semibold text-[#334155] mb-3">Cupos y Publicador</h3>
                        <div className="space-y-3 text-sm">
                            {convocatoria.cupo_maximo && (
                                <div>
                                    <span className="text-[#64748b]">Cupos:</span>
                                    <span className="ml-2 font-medium">
                                        {convocatoria.cupo_disponible}/{convocatoria.cupo_maximo}
                                    </span>
                                </div>
                            )}
                            <div>
                                <span className="text-[#64748b]">Publicado por:</span>
                                <span className="ml-2 font-medium">
                                    {convocatoria.publicador.primer_nombre} {convocatoria.publicador.primer_apellido}
                                </span>
                            </div>
                            <div>
                                <span className="text-[#64748b]">Email publicador:</span>
                                <span className="ml-2 font-medium">{convocatoria.publicador.correo}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Competencias */}
                {convocatoria.competencias_requeridas.length > 0 && (
                    <div className="mt-6">
                        <h3 className="font-semibold text-[#334155] mb-3">Competencias Requeridas</h3>
                        <div className="flex flex-wrap gap-2">
                            {convocatoria.competencias_requeridas.map((competencia, index) => (
                                <span
                                    key={index}
                                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                                >
                                    {competencia}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Documentos */}
                <div className="mt-6 flex gap-4">
                    {convocatoria.url_banner && (
                        <a
                            href={convocatoria.url_banner}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-semibold"
                        >
                            <Eye className="w-4 h-4" />
                            Ver Banner
                        </a>
                    )}
                    {convocatoria.url_documento_adicional && (
                        <a
                            href={convocatoria.url_documento_adicional}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-semibold"
                        >
                            <FileText className="w-4 h-4" />
                            Ver Documento
                        </a>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl border border-[#e2e8f0]">
                <div className="border-b border-[#e2e8f0]">
                    <nav className="flex gap-6 px-6">
                        <button
                            onClick={() => setActiveTab('informacion')}
                            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'informacion'
                                ? 'border-[#8B1E1E] text-[#8B1E1E]'
                                : 'border-transparent text-[#64748b] hover:text-[#1e293b]'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Información
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('postulaciones')}
                            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'postulaciones'
                                ? 'border-[#8B1E1E] text-[#8B1E1E]'
                                : 'border-transparent text-[#64748b] hover:text-[#1e293b]'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                Postulaciones ({convocatoria.postulaciones.length})
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('actividades')}
                            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'actividades'
                                ? 'border-[#8B1E1E] text-[#8B1E1E]'
                                : 'border-transparent text-[#64748b] hover:text-[#1e293b]'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Actividades ({convocatoria.actividades.length})
                            </div>
                        </button>
                    </nav>
                </div>

                <div className="p-6">
                    {activeTab === 'informacion' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-[#f8fafc] rounded-lg p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-50 rounded-lg">
                                            <Users className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-[#1e293b]">{convocatoria.postulaciones.length}</p>
                                            <p className="text-sm text-[#64748b]">Total Postulaciones</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-[#f8fafc] rounded-lg p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-green-50 rounded-lg">
                                            <Calendar className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-[#1e293b]">{convocatoria.actividades.length}</p>
                                            <p className="text-sm text-[#64748b]">Actividades</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-[#f8fafc] rounded-lg p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-[#8B1E1E] rounded-lg">
                                            <Clock className="w-5 h-5 text-[#8B1E1E]" />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-[#1e293b]">
                                                {convocatoria.horas_totales_ofrecidas || 0}
                                            </p>
                                            <p className="text-sm text-[#64748b]">Horas Ofrecidas</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Acciones rápidas */}
                            <div className="flex gap-3">
                                {convocatoria.estado === 'BORRADOR' && (
                                    <button
                                        onClick={() => handleCambiarEstado('PUBLICADA')}
                                        className="flex items-center gap-2 px-4 py-2 bg-[#166534] text-white rounded-lg hover:bg-[#14532d] transition-colors text-sm font-semibold"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        Publicar
                                    </button>
                                )}
                                {convocatoria.estado === 'PUBLICADA' && (
                                    <button
                                        onClick={() => handleCambiarEstado('EN_CURSO')}
                                        className="flex items-center gap-2 px-4 py-2 bg-[#8B1E1E] text-white rounded-lg hover:bg-[#731919] transition-colors text-sm font-semibold"
                                    >
                                        <Clock className="w-4 h-4" />
                                        Iniciar
                                    </button>
                                )}
                                {convocatoria.estado === 'EN_CURSO' && (
                                    <button
                                        onClick={() => handleCambiarEstado('CERRADA')}
                                        className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-semibold"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        Cerrar
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'postulaciones' && (
                        <div className="space-y-4">
                            {/* Desktop Table View */}
                            <div className="hidden md:block shadow-sm border border-slate-100 rounded-lg overflow-hidden">
                                <DataTable
                                    columns={postulacionColumns}
                                    data={convocatoria.postulaciones}
                                    searchPlaceholder="Buscar por nombre o correo..."
                                    emptyMessage="No hay postulaciones registradas."
                                />
                            </div>

                            {/* Mobile Card View */}
                            <div className="md:hidden space-y-3">
                                {convocatoria.postulaciones.length === 0 ? (
                                    <div className="text-center py-8 text-slate-400 text-sm font-medium italic">
                                        No hay postulaciones registradas.
                                    </div>
                                ) : (
                                    convocatoria.postulaciones.map((p) => (
                                        <div key={p.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-1">
                                                    <p className="font-bold text-slate-900">{p.estudiante.primer_nombre} {p.estudiante.primer_apellido}</p>
                                                    <p className="text-xs text-slate-500 font-medium">{p.estudiante.correo}</p>
                                                    <div className="pt-1">
                                                        <StatusBadge status={p.estado} />
                                                    </div>
                                                </div>
                                                <Link
                                                    href={`/administrador/usuarios/${p.estudiante.id}`}
                                                    className="p-2 bg-slate-50 border border-slate-100 rounded-lg text-slate-400"
                                                >
                                                    <User className="w-5 h-5" />
                                                </Link>
                                            </div>

                                            <div className="bg-slate-50 rounded-lg p-3">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Acciones Rápidas de Estado</p>
                                                <div className="flex gap-2">
                                                    {p.estado === 'PENDIENTE' ? (
                                                        <>
                                                            <button
                                                                onClick={() => handleCambiarEstadoPostulacion(p.id, 'ACEPTADA')}
                                                                className="flex-1 py-2 bg-green-600 text-white rounded-lg text-xs font-bold shadow-sm hover:bg-green-700 transition"
                                                            >
                                                                ACEPTAR
                                                            </button>
                                                            <button
                                                                onClick={() => handleCambiarEstadoPostulacion(p.id, 'RECHAZADA')}
                                                                className="flex-1 py-2 bg-red-600 text-white rounded-lg text-xs font-bold shadow-sm hover:bg-red-700 transition"
                                                            >
                                                                RECHAZAR
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleCambiarEstadoPostulacion(p.id, 'PENDIENTE')}
                                                            className="w-full py-2 bg-white border border-slate-300 text-slate-600 rounded-lg text-xs font-bold shadow-sm"
                                                        >
                                                            REVERTIR A PENDIENTE
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'actividades' && (
                        <DataTable
                            columns={actividadColumns}
                            data={convocatoria.actividades}
                            searchPlaceholder="Buscar actividad..."
                            emptyMessage="No hay actividades registradas."
                        />
                    )}
                </div>
            </div>

            {/* Modales */}
            <EditarConvocatoriaModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={() => window.location.reload()}
                convocatoria={convocatoria}
            />

            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={confirmDeleteConvocatoria}
                title="Eliminar Convocatoria"
                description={`¿Estás seguro que deseas eliminar la convocatoria "${convocatoria.titulo}"? Esta acción no se puede deshacer.`}
                confirmText="Sí, Eliminar"
                type="danger"
                isLoading={isProcessing}
            />
        </div>
    );
}
