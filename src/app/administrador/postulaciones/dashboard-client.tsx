'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { DataTable, ColumnDef } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { toast } from 'sonner';
import {
    Eye,
    CheckCircle,
    XCircle,
    Clock,
    User,
    Calendar,
    Filter,
    Search,
    Download,
    RefreshCw,
    Users,
    Building2,
    BookOpen,
    AlertCircle,
    CheckSquare,
    XSquare,
    MoreHorizontal
} from 'lucide-react';
import { cambiarEstadoPostulacion, eliminarPostulacion, getPostulacionesConFiltros } from './actions';
import { EstadoPostulacion } from '@prisma/client';
import Link from 'next/link';
import * as LucideIcons from 'lucide-react';

type PostulacionRow = {
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
            facultad: {
                nombre: string;
            };
        } | null;
        perfil_estudiante: {
            horas_previas: number;
            horas_acumuladas: number;
            porcentaje_avance: number;
            semestre_actual: number | null;
            codigo_estudiantil: string | null;
        } | null;
    } | null;
    convocatoria: {
        id: string;
        titulo: string;
        estado: string;
        modalidad: string;
        fecha_inicio: Date;
        fecha_fin: Date | null;
        fecha_cierre_postulacion: Date | null;
        cupo_maximo: number | null;
        cupo_disponible: number | null;
        horas_totales_ofrecidas: number | null;
        categoria: {
            id: string;
            nombre: string;
            icono: string | null;
            color_hex: string | null;
        } | null;
        programa: {
            id: string;
            nombre: string;
            facultad: {
                nombre: string;
            };
        } | null;
    } | null;
    revisor: {
        id: string;
        primer_nombre: string;
        primer_apellido: string;
        correo: string;
    } | null;
};

type OpcionesFiltros = {
    convocatorias: Array<{
        id: string;
        titulo: string;
        estado: string;
        programa: {
            id: string;
            nombre: string;
            facultad: {
                id: string;
                nombre: string;
            };
        } | null;
    }>;
    programas: Array<{
        id: string;
        nombre: string;
        codigo: string | null;
        facultad: {
            id: string;
            nombre: string;
        };
    }>;
    facultades: Array<{
        id: string;
        nombre: string;
        codigo: string | null;
    }>;
};

interface PostulacionesDashboardClientProps {
    initialData: PostulacionRow[];
    estadisticas: {
        totalPostulaciones: number;
        postulacionesPorEstado: Array<{ estado: string; cantidad: number }>;
        postulacionesUltimos7Dias: number;
        estudiantesUnicos: number;
        convocatoriasActivas: number;
        programasInvolucrados: number;
        facultadesInvolucradas: number;
        promedioHorasAcumuladas: number;
        postulacionesConEntrevista: number;
        tiempoPromedioRevision: number;
    };
    opcionesFiltros: OpcionesFiltros;
}

export function PostulacionesDashboardClient({
    initialData,
    estadisticas,
    opcionesFiltros
}: PostulacionesDashboardClientProps) {
    const [data, setData] = useState(initialData);
    const [filteredData, setFilteredData] = useState(initialData);
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedPostulacion, setSelectedPostulacion] = useState<PostulacionRow | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isBulkActionDialogOpen, setIsBulkActionDialogOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [bulkAction, setBulkAction] = useState<'aceptar' | 'rechazar' | null>(null);

    // Estados para filtros avanzados
    const [filtros, setFiltros] = useState({
        estados: [] as EstadoPostulacion[],
        id_convocatoria: [] as string[],
        id_programa: [] as string[],
        id_facultad: [] as string[],
        fecha_desde: null as Date | null,
        fecha_hasta: null as Date | null,
        busqueda: ''
    });

    const [showFiltrosAvanzados, setShowFiltrosAvanzados] = useState(false);

    const aplicarFiltros = useCallback(async () => {
        let filtered = data;

        // Filtro por convocatoria
        if (filtros.id_convocatoria.length > 0) {
            filtered = filtered.filter(p => p.convocatoria && filtros.id_convocatoria.includes(p.convocatoria.id));
        }

        // Filtro por estado
        if (filtros.estados.length > 0) {
            filtered = filtered.filter(p => filtros.estados.includes(p.estado));
        }

        // Filtro por fechas
        if (filtros.fecha_desde) {
            filtered = filtered.filter(p => new Date(p.postulado_en) >= filtros.fecha_desde!);
        }

        if (filtros.fecha_hasta) {
            filtered = filtered.filter(p => new Date(p.postulado_en) <= filtros.fecha_hasta!);
        }

        // Filtro por búsqueda
        if (filtros.busqueda) {
            filtered = filtered.filter(p =>
                p.estudiante && (
                    p.estudiante.primer_nombre.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
                    p.estudiante.primer_apellido.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
                    p.estudiante.correo.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
                    (p.convocatoria && p.convocatoria.titulo.toLowerCase().includes(filtros.busqueda.toLowerCase()))
                )
            );
        }

        setFilteredData(filtered);
    }, [data, filtros]);

    // Aplicar filtros
    useEffect(() => {
        aplicarFiltros();
    }, [aplicarFiltros]);

    const handleSearch = (query: string) => {
        setFiltros(prev => ({ ...prev, busqueda: query }));
    };

    const handleEstadoChange = async (id: string, nuevoEstado: EstadoPostulacion, notas?: string) => {
        setIsProcessing(true);
        const toastId = toast.loading('Actualizando estado...');
        try {
            await cambiarEstadoPostulacion(id, nuevoEstado, notas);

            // Actualizar datos locales
            const updated = data.map(p =>
                p.id === id
                    ? { ...p, estado: nuevoEstado, revisado_en: new Date(), notas_revision: notas || null }
                    : p
            );
            setData(updated);
            setFilteredData(updated);

            toast.success('✅ Estado actualizado', { id: toastId });
        } catch (e: any) {
            toast.error('Error al actualizar estado', { id: toastId, description: e.message });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleEliminar = async (id: string) => {
        setIsProcessing(true);
        const toastId = toast.loading('Eliminando postulación...');
        try {
            await eliminarPostulacion(id);

            // Actualizar datos locales
            const updated = data.filter(p => p.id !== id);
            setData(updated);
            setFilteredData(updated);

            toast.success('✅ Postulación eliminada', { id: toastId });
        } catch (e: any) {
            toast.error('Error al eliminar', { id: toastId, description: e.message });
        } finally {
            setIsProcessing(false);
            setIsDeleteDialogOpen(false);
        }
    };

    const handleBulkAction = async () => {
        if (!bulkAction || selectedIds.length === 0) return;

        setIsProcessing(true);
        const toastId = toast.loading(`Ejecutando acción masiva...`);

        try {
            for (const id of selectedIds) {
                await cambiarEstadoPostulacion(id, bulkAction === 'aceptar' ? 'ACEPTADA' : 'RECHAZADA');
            }

            // Recargar datos
            const newData = await getPostulacionesConFiltros({
                ...filtros,
                fecha_desde: filtros.fecha_desde || undefined,
                fecha_hasta: filtros.fecha_hasta || undefined
            });
            setData(newData);
            setFilteredData(newData);
            setSelectedIds([]);

            toast.success(`✅ ${bulkAction === 'aceptar' ? 'Postulaciones aceptadas' : 'Postulaciones rechazadas'}`, { id: toastId });
        } catch (e: any) {
            toast.error('Error en acción masiva', { id: toastId, description: e.message });
        } finally {
            setIsProcessing(false);
            setIsBulkActionDialogOpen(false);
            setBulkAction(null);
        }
    };

    const columns: ColumnDef<PostulacionRow>[] = [
        {
            header: 'Estudiante',
            cell: (item) => (
                <div className="min-w-0">
                    <p className="font-bold text-[#1e293b]">
                        {item.estudiante ? `${item.estudiante.primer_nombre} ${item.estudiante.primer_apellido}` : 'Estudiante no disponible'}
                    </p>
                    <p className="text-xs text-[#94a3b8] font-mono break-all">{item.estudiante?.numero_documento || 'N/A'}</p>
                    <p className="text-xs text-[#64748b] break-all">{item.estudiante?.correo || 'N/A'}</p>
                </div>
            ),
        },
        {
            header: 'Programa/Facultad',
            cell: (item) => (
                <div className="min-w-0">
                    {item.estudiante?.programa && (
                        <>
                            <p className="font-medium text-[#1e293b]">{item.estudiante.programa.nombre}</p>
                            <p className="text-xs text-[#64748b]">{item.estudiante.programa.facultad.nombre}</p>
                        </>
                    )}
                    {!item.estudiante?.programa && (
                        <span className="text-[#94a3b8]">Sin programa</span>
                    )}
                </div>
            ),
        },
        {
            header: 'Convocatoria',
            cell: (item) => (
                <div className="min-w-0">
                    {item.convocatoria && (
                        <>
                            <p className="font-semibold text-[#1e293b] truncate">{item.convocatoria.titulo}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded">
                                    {item.convocatoria.modalidad.replace(/_/g, ' ')}
                                </span>
                                {item.convocatoria.horas_totales_ofrecidas && (
                                    <span className="text-xs text-[#8B1E1E] font-bold">
                                        {item.convocatoria.horas_totales_ofrecidas}h
                                    </span>
                                )}
                            </div>
                        </>
                    )}
                </div>
            ),
        },
        {
            header: 'Motivación',
            cell: (item) => (
                <div className="max-w-xs">
                    <p className="text-sm text-[#1e293b] line-clamp-2" title={item.motivacion || 'Sin motivación'}>
                        {item.motivacion || 'Sin motivación especificada'}
                    </p>
                </div>
            ),
        },
        {
            header: 'Estado',
            cell: (item) => <StatusBadge status={item.estado} />,
        },
        {
            header: 'Fecha Postulación',
            cell: (item) => {
                const fecha = new Date(item.postulado_en);
                return (
                    <div className="text-xs">
                        <div>{format(fecha, 'dd/MM/yyyy', { locale: es })}</div>
                        <div className="text-[#94a3b8]">{format(fecha, 'HH:mm:ss', { locale: es })}</div>
                    </div>
                );
            },
        },
        {
            header: 'Acciones',
            cell: (item) => (
                <div className="flex flex-wrap items-center gap-2">
                    <label className="inline-flex items-center justify-center w-7 h-7 rounded border border-gray-200 bg-white">
                        <input
                            type="checkbox"
                            checked={selectedIds.includes(item.id)}
                            onChange={(e) => {
                                if (e.target.checked) {
                                    setSelectedIds(prev => [...prev, item.id]);
                                } else {
                                    setSelectedIds(prev => prev.filter(id => id !== item.id));
                                }
                            }}
                            className="rounded border-gray-300"
                        />
                    </label>

                    <Link
                        href={`/administrador/postulaciones/${item.id}`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#8B1E1E] bg-[#8B1E1E]/10 hover:bg-[#8B1E1E]/15 border border-[#8B1E1E]/20 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/20"
                        title="Ver detalles"
                    >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver</span>
                    </Link>

                    <div className="relative group">
                        <button className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors border border-gray-200">
                            <MoreHorizontal className="w-3.5 h-3.5" />
                            <span>Más</span>
                        </button>
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                            <div className="py-1">
                                {item.estado === 'PENDIENTE' && (
                                    <button
                                        onClick={() => handleEstadoChange(item.id, 'EN_REVISION')}
                                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                    >
                                        <Clock className="w-4 h-4" />
                                        Iniciar revisión
                                    </button>
                                )}
                                {item.estado === 'EN_REVISION' && (
                                    <>
                                        <button
                                            onClick={() => handleEstadoChange(item.id, 'ACEPTADA')}
                                            className="flex items-center gap-2 px-3 py-2 text-sm text-green-700 hover:bg-green-50 w-full text-left"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            Aceptar
                                        </button>
                                        <button
                                            onClick={() => handleEstadoChange(item.id, 'RECHAZADA')}
                                            className="flex items-center gap-2 px-3 py-2 text-sm text-red-700 hover:bg-red-50 w-full text-left"
                                        >
                                            <XCircle className="w-4 h-4" />
                                            Rechazar
                                        </button>
                                    </>
                                )}
                                <button
                                    onClick={() => {
                                        setSelectedPostulacion(item);
                                        setIsDeleteDialogOpen(true);
                                    }}
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-red-700 hover:bg-red-50 w-full text-left"
                                >
                                    <XCircle className="w-4 h-4" />
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ),
        },
    ];

    const limpiarFiltros = () => {
        setFiltros({
            estados: [],
            id_convocatoria: [],
            id_programa: [],
            id_facultad: [],
            fecha_desde: null,
            fecha_hasta: null,
            busqueda: ''
        });
    };

    return (
        <div className="space-y-6">
            {/* Barra de herramientas */}
            <div className="bg-white rounded-xl border border-[#e2e8f0] p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Búsqueda */}
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre, documento, correo o convocatoria..."
                                value={filtros.busqueda}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowFiltrosAvanzados(!showFiltrosAvanzados)}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            <Filter className="w-4 h-4" />
                            Filtros
                        </button>

                        {selectedIds.length > 0 && (
                            <>
                                <button
                                    onClick={() => {
                                        setBulkAction('aceptar');
                                        setIsBulkActionDialogOpen(true);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 bg-[#166534] text-white rounded-lg hover:bg-[#14532d] transition-colors"
                                >
                                    <CheckSquare className="w-4 h-4" />
                                    Aceptar ({selectedIds.length})
                                </button>
                                <button
                                    onClick={() => {
                                        setBulkAction('rechazar');
                                        setIsBulkActionDialogOpen(true);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    <XSquare className="w-4 h-4" />
                                    Rechazar ({selectedIds.length})
                                </button>
                            </>
                        )}

                        <button
                            onClick={() => window.location.reload()}
                            className="flex items-center gap-2 px-4 py-2 bg-[#8B1E1E] text-white rounded-lg hover:bg-[#731919] transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Actualizar
                        </button>
                    </div>
                </div>

                {/* Filtros avanzados */}
                {showFiltrosAvanzados && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Estados */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Estados</label>
                                <div className="space-y-2">
                                    {['PENDIENTE', 'EN_REVISION', 'ACEPTADA', 'RECHAZADA', 'RETIRADA'].map(estado => (
                                        <label key={estado} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={filtros.estados.includes(estado as EstadoPostulacion)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setFiltros(prev => ({ ...prev, estados: [...prev.estados, estado as EstadoPostulacion] }));
                                                    } else {
                                                        setFiltros(prev => ({ ...prev, estados: prev.estados.filter(e => e !== estado) }));
                                                    }
                                                }}
                                                className="rounded border-gray-300 mr-2"
                                            />
                                            <span className="text-sm">{estado.replace(/_/g, ' ')}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Convocatorias */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Convocatorias</label>
                                <div className="max-h-32 overflow-y-auto space-y-1">
                                    {opcionesFiltros.convocatorias.map(convocatoria => (
                                        <label key={convocatoria.id} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={filtros.id_convocatoria.includes(convocatoria.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setFiltros(prev => ({ ...prev, id_convocatoria: [...prev.id_convocatoria, convocatoria.id] }));
                                                    } else {
                                                        setFiltros(prev => ({ ...prev, id_convocatoria: prev.id_convocatoria.filter(id => id !== convocatoria.id) }));
                                                    }
                                                }}
                                                className="rounded border-gray-300 mr-2"
                                            />
                                            <span className="text-sm truncate">{convocatoria.titulo}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Fechas */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Rango de fechas</label>
                                <div className="space-y-2">
                                    <input
                                        type="date"
                                        value={filtros.fecha_desde ? filtros.fecha_desde.toISOString().split('T')[0] : ''}
                                        onChange={(e) => setFiltros(prev => ({ ...prev, fecha_desde: e.target.value ? new Date(e.target.value) : null }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                        placeholder="Desde"
                                    />
                                    <input
                                        type="date"
                                        value={filtros.fecha_hasta ? filtros.fecha_hasta.toISOString().split('T')[0] : ''}
                                        onChange={(e) => setFiltros(prev => ({ ...prev, fecha_hasta: e.target.value ? new Date(e.target.value) : null }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                        placeholder="Hasta"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                onClick={limpiarFiltros}
                                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                            >
                                Limpiar filtros
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Tabla principal */}
            <div className="bg-white rounded-xl border border-[#e2e8f0]">
                <DataTable
                    columns={columns}
                    data={filteredData}
                    searchPlaceholder="Buscar postulación..."
                    emptyMessage="No hay postulaciones que coincidan con los filtros aplicados."
                />
            </div>

            {/* Diálogos */}
            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={() => selectedPostulacion && handleEliminar(selectedPostulacion.id)}
                title="Eliminar Postulación"
                description={`¿Estás seguro que deseas eliminar la postulación de ${selectedPostulacion?.estudiante?.primer_nombre || ''} ${selectedPostulacion?.estudiante?.primer_apellido || ''}? Esta acción no se puede deshacer.`}
                confirmText="Sí, Eliminar"
                type="danger"
                isLoading={isProcessing}
            />

            <ConfirmDialog
                isOpen={isBulkActionDialogOpen}
                onClose={() => setIsBulkActionDialogOpen(false)}
                onConfirm={handleBulkAction}
                title={`Acción Masiva: ${bulkAction === 'aceptar' ? 'Aceptar' : 'Rechazar'}`}
                description={`¿Estás seguro que deseas ${bulkAction === 'aceptar' ? 'aceptar' : 'rechazar'} las ${selectedIds.length} postulaciones seleccionadas?`}
                confirmText={`Sí, ${bulkAction === 'aceptar' ? 'Aceptar' : 'Rechazar'}`}
                type={bulkAction === 'aceptar' ? 'info' : 'warning'}
                isLoading={isProcessing}
            />
        </div>
    );
}
