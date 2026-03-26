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
    TrendingUp,
    Info
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
            sortable: true,
            accessorKey: 'nombre',
            cell: (item) => (
                <div className="min-w-[150px] sm:min-w-0">
                    <p className="font-bold text-[#1e293b] leading-tight">{item.nombre}</p>
                    {item.descripcion && (
                        <p className="text-xs text-[#94a3b8] line-clamp-1 mt-0.5">{item.descripcion}</p>
                    )}
                </div>
            ),
        },
        {
            header: 'Tipo',
            sortable: true,
            accessorKey: 'tipo_actividad',
            cell: (item) => (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-blue-50 text-blue-700 border border-blue-100">
                    {item.tipo_actividad.replace(/_/g, ' ')}
                </span>
            ),
        },
        {
            header: 'Convocatoria',
            sortable: true,
            sortKey: 'convocatoria', // We'll handle nested sort in useMemo if needed, but for now simple keys
            cell: (item) => (
                <div className="min-w-[120px]">
                    {item.convocatoria ? (
                        <>
                            <p className="font-semibold text-[#1e293b] text-xs truncate max-w-[150px]">{item.convocatoria.titulo}</p>
                            <div className="flex flex-wrap items-center gap-1 mt-1">
                                <span className="text-[9px] font-bold px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                                    {item.convocatoria.modalidad.replace(/_/g, ' ')}
                                </span>
                                {item.convocatoria.categoria && (
                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" 
                                        style={{ 
                                            backgroundColor: (item.convocatoria.categoria.color_hex || '#000000') + '15',
                                            color: item.convocatoria.categoria.color_hex || '#000000'
                                        }}>
                                        {item.convocatoria.categoria.nombre}
                                    </span>
                                )}
                            </div>
                        </>
                    ) : (
                        <span className="text-xs text-[#94a3b8] italic">Sin vinculación</span>
                    )}
                </div>
            ),
        },
        {
            header: 'Horas',
            sortable: true,
            accessorKey: 'horas_estimadas',
            cell: (item) => (
                <div className="text-center">
                    <div className="font-bold text-[#8B1E1E] text-base leading-none">{item.horas_estimadas}h</div>
                    {item.horas_maximas && (
                        <div className="text-[10px] text-[#94a3b8] mt-0.5 font-medium">de {item.horas_maximas}h</div>
                    )}
                </div>
            ),
        },
        {
            header: 'Estado',
            sortable: true,
            accessorKey: 'esta_activa',
            cell: (item) => (
                <div className="flex justify-center">
                    <StatusBadge status={item.esta_activa ? 'ACTIVA' : 'INACTIVA'} />
                </div>
            ),
        },
        {
            header: 'Reportes',
            sortable: true, // Will sort by length
            cell: (item) => (
                <div className="text-xs flex flex-col items-center">
                    <div className="font-bold text-[#475569]">{item.reportes.length}</div>
                    <div className="text-[10px] text-green-600 font-semibold bg-green-50 px-1.5 rounded-full border border-green-100 mt-1">
                        {item.reportes.filter(r => r.estado === 'APROBADO').length} ✅
                    </div>
                </div>
            ),
        },
        {
            header: 'Acciones',
            cell: (item) => (
                <div className="flex items-center justify-end gap-1.5">
                    <Link
                        href={`/administrador/actividades/${item.id}`}
                        className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                        title="Ver detalles completo"
                    >
                        <Eye className="w-4 h-4" />
                    </Link>
                    
                    <button
                        onClick={() => {
                            setSelectedActividad(item);
                            setIsToggleDialogOpen(true);
                        }}
                        className={`p-2 rounded-lg transition-all ${
                            item.esta_activa 
                                ? 'text-amber-500 hover:bg-amber-50' 
                                : 'text-emerald-500 hover:bg-emerald-50'
                        }`}
                        title={item.esta_activa ? 'Desactivar para estudiantes' : 'Activar para estudiantes'}
                    >
                        <Power className="w-4 h-4" />
                    </button>
                    
                    <button
                        onClick={() => {
                            setSelectedActividad(item);
                            setIsDeleteDialogOpen(true);
                        }}
                        className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-all"
                        title="Eliminar permanentemente"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
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
            {/* Toolbar Inteligente */}
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-sm overflow-hidden">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1 flex flex-col md:flex-row md:items-center gap-3">
                        <div className="relative group flex-1 max-w-md">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8] transition-colors group-focus-within:text-[#8B1E1E]" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre, descripción o lugar..."
                                value={filtros.busqueda}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-[#8B1E1E]/5 focus:border-[#8B1E1E] focus:bg-white transition-all placeholder:text-[#94a3b8]"
                            />
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowFiltrosAvanzados(!showFiltrosAvanzados)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all shadow-sm ${
                                    showFiltrosAvanzados 
                                    ? 'bg-[#8B1E1E] text-white border-[#8B1E1E]' 
                                    : 'bg-white border-[#e2e8f0] text-[#475569] hover:bg-[#f8fafc]'
                                }`}
                            >
                                <Filter className={`w-4 h-4 ${showFiltrosAvanzados ? 'animate-pulse' : ''}`} />
                                {showFiltrosAvanzados ? 'Ocultar Filtros' : 'Filtros Avanzados'}
                                {(filtros.id_convocatoria.length > 0 || filtros.tipo_actividad.length > 0 || filtros.estado_activa !== undefined) && (
                                    <span className="ml-1 w-2 h-2 bg-blue-400 rounded-full"></span>
                                )}
                            </button>
                            
                            <button
                                onClick={() => window.location.reload()}
                                className="p-2.5 rounded-xl border border-[#e2e8f0] text-[#475569] hover:bg-[#f8fafc] transition-all bg-white shadow-sm"
                                title="Sincronizar datos"
                            >
                                <RefreshCw className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-tighter">Mostrando</p>
                            <p className="text-sm font-bold text-[#1e293b]">{filteredData.length} Actividades</p>
                        </div>
                    </div>
                </div>

                {/* Grid de Filtros Dinámicos */}
                {showFiltrosAvanzados && (
                    <div className="mt-5 pt-5 border-t border-[#f1f5f9] animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Selector de Convocatorias */}
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-xs font-bold text-[#64748b] uppercase tracking-wider">
                                    <BookOpen className="w-3.5 h-3.5" />
                                    Convocatoria
                                </label>
                                <div className="max-h-40 overflow-y-auto pr-2 custom-scrollbar space-y-1.5">
                                    {opcionesFiltros.convocatorias.map(conv => (
                                        <label key={conv.id} className="flex items-center group cursor-pointer">
                                            <div className="relative flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={filtros.id_convocatoria.includes(conv.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setFiltros(prev => ({ ...prev, id_convocatoria: [...prev.id_convocatoria, conv.id] }));
                                                        } else {
                                                            setFiltros(prev => ({ ...prev, id_convocatoria: prev.id_convocatoria.filter(id => id !== conv.id) }));
                                                        }
                                                    }}
                                                    className="w-4 h-4 border-[#e2e8f0] rounded focus:ring-[#8B1E1E] text-[#8B1E1E] transition-all"
                                                />
                                            </div>
                                            <span className="ml-2.5 text-xs text-[#475569] group-hover:text-[#1e293b] transition-colors truncate">
                                                {conv.titulo}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Tipos de Actividad */}
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-xs font-bold text-[#64748b] uppercase tracking-wider">
                                    <Activity className="w-3.5 h-3.5" />
                                    Tipos de Actividad
                                </label>
                                <div className="grid grid-cols-1 gap-1.5">
                                    {Object.entries(tipoActividadLabels).map(([value, label]) => (
                                        <label key={value} className="flex items-center group cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={filtros.tipo_actividad.includes(value as TipoActividad)}
                                                onChange={(e) => {
                                                    const val = value as TipoActividad;
                                                    if (e.target.checked) {
                                                        setFiltros(prev => ({ ...prev, tipo_actividad: [...prev.tipo_actividad, val] }));
                                                    } else {
                                                        setFiltros(prev => ({ ...prev, tipo_actividad: prev.tipo_actividad.filter(t => t !== val) }));
                                                    }
                                                }}
                                                className="w-4 h-4 border-[#e2e8f0] rounded focus:ring-[#8B1E1E] text-[#8B1E1E]"
                                            />
                                            <span className="ml-2.5 text-xs text-[#475569] group-hover:text-[#1e293b]">
                                                {label}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Estado y Disponibilidad */}
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-xs font-bold text-[#64748b] uppercase tracking-wider">
                                    <TrendingUp className="w-3.5 h-3.5" />
                                    Disponibilidad Estudiantes
                                </label>
                                <div className="space-y-2">
                                    {[
                                        { label: 'Todos los estados', value: undefined },
                                        { label: 'Solo Activas (Visible)', value: true, icon: CheckCircle, color: 'text-green-500' },
                                        { label: 'Solo Inactivas (Oculto)', value: false, icon: XCircle, color: 'text-slate-400' }
                                    ].map((opt, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setFiltros(prev => ({ ...prev, estado_activa: opt.value }))}
                                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                                                filtros.estado_activa === opt.value
                                                ? 'bg-[#8B1E1E]/5 text-[#8B1E1E] border border-[#8B1E1E]/20'
                                                : 'text-[#64748b] hover:bg-[#f8fafc] border border-transparent'
                                            }`}
                                        >
                                            <span className="flex items-center gap-2">
                                                {opt.icon && <opt.icon className={`w-3.5 h-3.5 ${opt.color}`} />}
                                                {opt.label}
                                            </span>
                                            {filtros.estado_activa === opt.value && <div className="w-1.5 h-1.5 bg-[#8B1E1E] rounded-full" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Reportes de Horas */}
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-xs font-bold text-[#64748b] uppercase tracking-wider">
                                    <Clock className="w-3.5 h-3.5" />
                                    Reportes de Horas
                                </label>
                                <div className="space-y-2">
                                    {[
                                        { label: 'Cualquier estado', value: undefined },
                                        { label: 'Con reportes pendientes', value: true, icon: AlertCircle, color: 'text-amber-500' },
                                        { label: 'Sin reportes aún', value: false, icon: Info, color: 'text-blue-500' }
                                    ].map((opt, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setFiltros(prev => ({ ...prev, tiene_reportes: opt.value }))}
                                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                                                filtros.tiene_reportes === opt.value
                                                ? 'bg-[#8B1E1E]/5 text-[#8B1E1E] border border-[#8B1E1E]/20'
                                                : 'text-[#64748b] hover:bg-[#f8fafc] border border-transparent'
                                            }`}
                                        >
                                            <span className="flex items-center gap-2">
                                                {opt.icon && <opt.icon className={`w-3.5 h-3.5 ${opt.color}`} />}
                                                {opt.label}
                                            </span>
                                            {filtros.tiene_reportes === opt.value && <div className="w-1.5 h-1.5 bg-[#8B1E1E] rounded-full" />}
                                        </button>
                                    ))}
                                    
                                    <div className="pt-2 border-t border-[#f1f5f9] mt-2">
                                        <button
                                            onClick={limpiarFiltros}
                                            className="w-full py-2 text-[10px] font-bold text-[#8B1E1E] hover:bg-[#8B1E1E]/5 rounded-lg border border-[#8B1E1E]/10 transition-all uppercase tracking-widest"
                                        >
                                            Restablecer Filtros
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Visualización de Datos de Alto Rendimiento */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] overflow-hidden">
                <DataTable
                    columns={columns}
                    data={filteredData}
                    searchPlaceholder="Búsqueda rápida en resultados..."
                    onSearch={(q) => handleSearch(q)}
                    emptyMessage="No encontramos actividades con estos criterios. Prueba ajustando los filtros."
                    onFilterClick={() => setShowFiltrosAvanzados(!showFiltrosAvanzados)}
                    showSearch={false}
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
