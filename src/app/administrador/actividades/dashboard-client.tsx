'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DataTable, ColumnDef } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { toast } from 'sonner';
import { 
    Eye, 
    Edit, 
    Trash2, 
    Power, 
    Clock, 
    User, 
    Calendar, 
    MapPin, 
    Filter, 
    Search,
    Download,
    RefreshCw,
    Users,
    Building2,
    BookOpen,
    AlertCircle,
    CheckCircle,
    XCircle,
    MoreHorizontal,
    Activity,
    FileText,
    TrendingUp
} from 'lucide-react';
import { toggleActividad, eliminarActividad, getActividades, aprobarReporteHoras, rechazarReporteHoras } from './actions';
import { TipoActividad, EstadoReporte } from '@prisma/client';
import Link from 'next/link';

type ActividadRow = {
    id: string;
    id_convocatoria: string;
    nombre: string;
    descripcion: string | null;
    tipo_actividad: TipoActividad;
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
        estado: string;
        modalidad: string;
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
                id: string;
                nombre: string;
            };
        } | null;
    } | null;
    creador: {
        id: string;
        primer_nombre: string;
        primer_apellido: string;
        correo: string;
        rol: string;
    };
    reportes: Array<{
        id: string;
        estado: EstadoReporte;
        horas_reportadas: number;
        horas_aprobadas: number | null;
        reportado_en: Date;
        revisado_en: Date | null;
        estudiante: {
            id: string;
            primer_nombre: string;
            primer_apellido: string;
            correo: string;
        };
        revisor: {
            id: string;
            primer_nombre: string;
            primer_apellido: string;
            correo: string;
        } | null;
    }>;
};

type OpcionesFiltros = {
    convocatorias: Array<{
        id: string;
        titulo: string;
        estado: string;
        modalidad: string;
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

interface ActividadesDashboardClientProps {
    initialData: ActividadRow[];
    estadisticas: {
        totalActividades: number;
        actividadesPorTipo: Array<{ tipo: string; cantidad: number }>;
        actividadesPorEstado: Array<{ estado: string; cantidad: number }>;
        totalReportes: number;
        reportesPorEstado: Array<{ estado: string; cantidad: number }>;
        estudiantesUnicos: number;
        actividadesUltimos7Dias: number;
        totalHorasReportadas: number;
        totalHorasAprobadas: number;
        actividadesConLimiteVencido: number;
        promedioHorasPorActividad: number;
        actividadesPorMes: Array<{ mes: number; cantidad: number }>;
    };
    opcionesFiltros: OpcionesFiltros;
}

export function ActividadesDashboardClient({ 
    initialData, 
    estadisticas, 
    opcionesFiltros 
}: ActividadesDashboardClientProps) {
    const [data, setData] = useState(initialData);
    const [filteredData, setFilteredData] = useState(initialData);
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedActividad, setSelectedActividad] = useState<ActividadRow | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isToggleDialogOpen, setIsToggleDialogOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // Estados para filtros avanzados
    const [filtros, setFiltros] = useState({
        id_convocatoria: [] as string[],
        tipo_actividad: [] as TipoActividad[],
        estado_activa: undefined as boolean | undefined,
        fecha_desde: null as Date | null,
        fecha_hasta: null as Date | null,
        busqueda: '',
        tiene_reportes: undefined as boolean | undefined
    });

    const [showFiltrosAvanzados, setShowFiltrosAvanzados] = useState(false);

    const aplicarFiltros = useCallback(async () => {
        let filtered = data;

        // Filtro por convocatoria
        if (filtros.id_convocatoria.length > 0) {
            filtered = filtered.filter(a => a.convocatoria && filtros.id_convocatoria.includes(a.convocatoria.id));
        }

        // Filtro por tipo de actividad
        if (filtros.tipo_actividad.length > 0) {
            filtered = filtered.filter(a => filtros.tipo_actividad.includes(a.tipo_actividad));
        }

        // Filtro por estado activa
        if (filtros.estado_activa !== undefined) {
            filtered = filtered.filter(a => a.esta_activa === filtros.estado_activa);
        }

        // Filtro por fechas
        if (filtros.fecha_desde) {
            filtered = filtered.filter(a => a.fecha_inicio && new Date(a.fecha_inicio) >= filtros.fecha_desde!);
        }

        if (filtros.fecha_hasta) {
            filtered = filtered.filter(a => a.fecha_inicio && new Date(a.fecha_inicio) <= filtros.fecha_hasta!);
        }

        // Filtro por búsqueda
        if (filtros.busqueda) {
            filtered = filtered.filter(a => 
                a.nombre.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
                a.descripcion?.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
                a.convocatoria?.titulo.toLowerCase().includes(filtros.busqueda.toLowerCase())
            );
        }

        // Filtro por reportes
        if (filtros.tiene_reportes !== undefined) {
            filtered = filtered.filter(a => {
                const tieneReportes = a.reportes && a.reportes.length > 0;
                return filtros.tiene_reportes ? tieneReportes : !tieneReportes;
            });
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

    const handleToggleActividad = async (id: string, activa: boolean) => {
        setIsProcessing(true);
        const toastId = toast.loading('Actualizando estado...');
        try {
            await toggleActividad(id, activa);
            
            // Actualizar datos locales
            const updated = data.map(a => 
                a.id === id ? { ...a, esta_activa: activa } : a
            );
            setData(updated);
            setFilteredData(updated);
            
            toast.success('✅ Estado actualizado', { id: toastId });
        } catch (e: any) {
            toast.error('Error al actualizar estado', { id: toastId, description: e.message });
        } finally {
            setIsProcessing(false);
            setIsToggleDialogOpen(false);
        }
    };

    const handleEliminar = async (id: string) => {
        setIsProcessing(true);
        const toastId = toast.loading('Eliminando actividad...');
        try {
            await eliminarActividad(id);
            
            // Actualizar datos locales
            const updated = data.filter(a => a.id !== id);
            setData(updated);
            setFilteredData(updated);
            
            toast.success('✅ Actividad eliminada', { id: toastId });
        } catch (e: any) {
            toast.error('Error al eliminar', { id: toastId, description: e.message });
        } finally {
            setIsProcessing(false);
            setIsDeleteDialogOpen(false);
        }
    };

    const handleAprobarReporte = async (idReporte: string, notas?: string) => {
        setIsProcessing(true);
        const toastId = toast.loading('Aprobando reporte...');
        try {
            await aprobarReporteHoras(idReporte, notas);
            toast.success('✅ Reporte aprobado', { id: toastId });
            // Recargar datos
            window.location.reload();
        } catch (e: any) {
            toast.error('Error al aprobar reporte', { id: toastId, description: e.message });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRechazarReporte = async (idReporte: string, motivo: string) => {
        setIsProcessing(true);
        const toastId = toast.loading('Rechazando reporte...');
        try {
            await rechazarReporteHoras(idReporte, motivo);
            toast.success('✅ Reporte rechazado', { id: toastId });
            // Recargar datos
            window.location.reload();
        } catch (e: any) {
            toast.error('Error al rechazar reporte', { id: toastId, description: e.message });
        } finally {
            setIsProcessing(false);
        }
    };

    const columns: ColumnDef<ActividadRow>[] = [
        {
            header: 'Actividad',
            cell: (item) => (
                <div className="min-w-0">
                    <p className="font-bold text-[#1e293b] truncate">{item.nombre}</p>
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
            header: 'Convocatoria',
            cell: (item) => (
                <div className="min-w-0">
                    {item.convocatoria ? (
                        <>
                            <p className="font-semibold text-[#1e293b] truncate">{item.convocatoria.titulo}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs px-2 py-0.5 bg-gray-50 text-gray-700 rounded">
                                    {item.convocatoria.modalidad.replace(/_/g, ' ')}
                                </span>
                                {item.convocatoria.categoria && (
                                    <span className="text-xs px-2 py-0.5 rounded" 
                                        style={{ 
                                            backgroundColor: (item.convocatoria.categoria.color_hex || '#000000') + '20',
                                            color: item.convocatoria.categoria.color_hex || '#000000'
                                        }}>
                                        {item.convocatoria.categoria.nombre}
                                    </span>
                                )}
                            </div>
                        </>
                    ) : (
                        <span className="text-xs text-[#94a3b8]">Sin convocatoria</span>
                    )}
                </div>
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
            header: 'Reportes',
            cell: (item) => (
                <div className="text-xs">
                    <div className="font-bold">{item.reportes.length} reportes</div>
                    <div className="text-[#94a3b8]">
                        {item.reportes.filter(r => r.estado === 'APROBADO').length} aprobados
                    </div>
                </div>
            ),
        },
        {
            header: 'Estado',
            cell: (item) => <StatusBadge status={item.esta_activa ? 'ACTIVA' : 'INACTIVA'} />,
        },
        {
            header: 'Acciones',
            cell: (item) => (
                <div className="flex items-center gap-2">
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
                    
                    <Link
                        href={`/administrador/actividades/${item.id}`}
                        className="p-1.5 rounded-lg text-[#94a3b8] hover:text-[#8B1E1E] hover:bg-[#8B1E1E]/8 border border-transparent hover:border-[#8B1E1E]/20 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/20"
                        title="Ver detalles"
                    >
                        <Eye className="w-4 h-4" />
                    </Link>
                    
                    <div className="relative group">
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg transition-colors">
                            <MoreHorizontal className="w-4 h-4" />
                        </button>
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                            <div className="py-1">
                                <button
                                    onClick={() => {
                                        setSelectedActividad(item);
                                        setIsToggleDialogOpen(true);
                                    }}
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                >
                                    <Power className="w-4 h-4" />
                                    {item.esta_activa ? 'Desactivar' : 'Activar'}
                                </button>
                                <button
                                    onClick={() => {
                                        setSelectedActividad(item);
                                        setIsDeleteDialogOpen(true);
                                    }}
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-red-700 hover:bg-red-50 w-full text-left"
                                >
                                    <Trash2 className="w-4 h-4" />
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
            id_convocatoria: [],
            tipo_actividad: [],
            estado_activa: undefined,
            fecha_desde: null,
            fecha_hasta: null,
            busqueda: '',
            tiene_reportes: undefined
        });
    };

    const tipoActividadLabels: Record<TipoActividad, string> = {
        GENERAL: 'General',
        CAPACITACION: 'Capacitación',
        CAMPO: 'Campo',
        ADMINISTRATIVA: 'Administrativa',
        INVESTIGACION: 'Investigación',
        COMUNITARIA: 'Comunitaria'
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
                                placeholder="Buscar por nombre, descripción, ubicación o materiales..."
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

                            {/* Tipos de actividad */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Tipos de Actividad</label>
                                <div className="space-y-2">
                                    {Object.entries(tipoActividadLabels).map(([value, label]) => (
                                        <label key={value} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={filtros.tipo_actividad.includes(value as TipoActividad)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setFiltros(prev => ({ ...prev, tipo_actividad: [...prev.tipo_actividad, value as TipoActividad] }));
                                                    } else {
                                                        setFiltros(prev => ({ ...prev, tipo_actividad: prev.tipo_actividad.filter(t => t !== value) }));
                                                    }
                                                }}
                                                className="rounded border-gray-300 mr-2"
                                            />
                                            <span className="text-sm">{label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Estado y Reportes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Estado y Reportes</label>
                                <div className="space-y-2">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            checked={filtros.estado_activa === undefined}
                                            onChange={() => setFiltros(prev => ({ ...prev, estado_activa: undefined }))}
                                            className="mr-2"
                                        />
                                        <span className="text-sm">Todos los estados</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            checked={filtros.estado_activa === true}
                                            onChange={() => setFiltros(prev => ({ ...prev, estado_activa: true }))}
                                            className="mr-2"
                                        />
                                        <span className="text-sm">Solo activas</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            checked={filtros.estado_activa === false}
                                            onChange={() => setFiltros(prev => ({ ...prev, estado_activa: false }))}
                                            className="mr-2"
                                        />
                                        <span className="text-sm">Solo inactivas</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            checked={filtros.tiene_reportes === true}
                                            onChange={() => setFiltros(prev => ({ ...prev, tiene_reportes: true }))}
                                            className="mr-2"
                                        />
                                        <span className="text-sm">Con reportes</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            checked={filtros.tiene_reportes === false}
                                            onChange={() => setFiltros(prev => ({ ...prev, tiene_reportes: false }))}
                                            className="mr-2"
                                        />
                                        <span className="text-sm">Sin reportes</span>
                                    </label>
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
                    searchPlaceholder="Buscar actividad..."
                    emptyMessage="No hay actividades que coincidan con los filtros aplicados."
                />
            </div>

            {/* Diálogos */}
            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={() => selectedActividad && handleEliminar(selectedActividad.id)}
                title="Eliminar Actividad"
                description={`¿Estás seguro que deseas eliminar la actividad "${selectedActividad?.nombre}"? Esta acción no se puede deshacer.`}
                confirmText="Sí, Eliminar"
                type="danger"
                isLoading={isProcessing}
            />

            {/* Dialog para cambiar estado */}
            {isToggleDialogOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-bold text-[#1e293b] mb-4">
                            {selectedActividad?.esta_activa ? 'Desactivar' : 'Activar'} Actividad
                        </h3>
                        
                        <p className="text-sm text-[#64748b] mb-6">
                            ¿Estás seguro que deseas {selectedActividad?.esta_activa ? 'desactivar' : 'activar'} la actividad &quot;{selectedActividad?.nombre}&quot;?
                            {selectedActividad?.esta_activa ? 'Los estudiantes ya no podrán reportar horas en esta actividad.' : 'Los estudiantes podrán reportar horas en esta actividad.'}
                        </p>
                        
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setIsToggleDialogOpen(false)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => selectedActividad && handleToggleActividad(selectedActividad.id, !selectedActividad.esta_activa)}
                                disabled={isProcessing}
                                className="px-4 py-2 bg-[#8B1E1E] text-white rounded-lg hover:bg-[#731919] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? 'Procesando...' : (selectedActividad?.esta_activa ? 'Desactivar' : 'Activar')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
