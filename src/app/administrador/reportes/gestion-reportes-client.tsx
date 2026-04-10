'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
    Clock, 
    Calendar, 
    FileText, 
    CheckCircle, 
    XCircle, 
    AlertCircle,
    Eye,
    User,
    Building,
    Download,
    Search,
    Filter,
    ChevronDown,
    ChevronUp
} from 'lucide-react';

interface ReporteHora {
    id: string;
    id_estudiante: string;
    id_actividad: string;
    id_convocatoria: string;
    horas_reportadas: number;
    horas_aprobadas?: number;
    estado: 'PENDIENTE_VALIDACION' | 'APROBADO' | 'RECHAZADO';
    descripcion_trabajo: string;
    fecha_actividad: string;
    reportado_en: string;
    revisado_en?: string;
    notas_estudiante?: string;
    notas_revisor?: string;
    id_revisor?: string;
    revisor?: {
        primer_nombre: string;
        primer_apellido: string;
    };
    evidencias?: Array<{
        id: string;
        tipo: string;
        contenido_texto?: string;
        archivo_url?: string;
        archivo_nombre?: string;
        subido_por?: string;
    }>;
    estudiante: {
        id: string;
        primer_nombre: string;
        primer_apellido: string;
        correo: string;
        numero_documento: string;
        programa?: {
            nombre: string;
            facultad?: {
                nombre: string;
            };
        };
    };
    actividad: {
        id: string;
        nombre: string;
        descripcion: string;
        horas_estimadas: number;
        tipo_actividad: string;
        fecha_inicio: string;
        fecha_limite?: string;
        ubicacion?: string;
    };
    convocatoria: {
        id: string;
        titulo: string;
        descripcion: string;
        modalidad: string;
        estado: string;
        horas_totales_ofrecidas?: number;
    };
}

interface FiltrosReportes {
    estado: string;
    programa: string;
    facultad: string;
    fechaDesde: string;
    fechaHasta: string;
    busqueda: string;
}

export function GestionReportesClient() {
    const [reportes, setReportes] = useState<ReporteHora[]>([]);
    const [reportesFiltrados, setReportesFiltrados] = useState<ReporteHora[]>([]);
    const [loading, setLoading] = useState(true);
    const [accionando, setAccionando] = useState<string | null>(null);
    const [reporteSeleccionado, setReporteSeleccionado] = useState<ReporteHora | null>(null);
    const [mostrarDetalles, setMostrarDetalles] = useState(false);
    const [ordenarPor, setOrdenarPor] = useState<'fecha' | 'estudiante' | 'horas' | 'estado'>('fecha');
    const [ordenDireccion, setOrdenDireccion] = useState<'asc' | 'desc'>('desc');
    const [filtros, setFiltros] = useState<FiltrosReportes>({
        estado: '',
        programa: '',
        facultad: '',
        fechaDesde: '',
        fechaHasta: '',
        busqueda: ''
    });
    const [mostrarFiltros, setMostrarFiltros] = useState(false);

    // Estados para el formulario de revisión
    const [notasRevision, setNotasRevision] = useState('');
    const [accionSeleccionada, setAccionSeleccionada] = useState<'aprobar' | 'rechazar'>('aprobar');

    // Cargar reportes
    useEffect(() => {
        cargarReportes();
    }, []);

    const cargarReportes = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/reportes/horas');
            if (!response.ok) throw new Error('Error al cargar reportes');
            
            const data = await response.json();
            setReportes(data);
            setReportesFiltrados(data);
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al cargar los reportes');
        } finally {
            setLoading(false);
        }
    };

    // Filtrar reportes
    useEffect(() => {
        let filtrados = [...reportes];

        // Filtrar por estado
        if (filtros.estado) {
            filtrados = filtrados.filter(reporte => reporte.estado === filtros.estado);
        }

        // Filtrar por programa
        if (filtros.programa) {
            filtrados = filtrados.filter(reporte => 
                reporte.estudiante.programa?.nombre?.toLowerCase().includes(filtros.programa.toLowerCase())
            );
        }

        // Filtrar por facultad
        if (filtros.facultad) {
            filtrados = filtrados.filter(reporte => 
                reporte.estudiante.programa?.facultad?.nombre?.toLowerCase().includes(filtros.facultad.toLowerCase())
            );
        }

        // Filtrar por fecha
        if (filtros.fechaDesde) {
            const fechaDesde = new Date(filtros.fechaDesde);
            filtrados = filtrados.filter(reporte => 
                new Date(reporte.fecha_actividad) >= fechaDesde
            );
        }
        if (filtros.fechaHasta) {
            const fechaHasta = new Date(filtros.fechaHasta);
            filtrados = filtrados.filter(reporte => 
                new Date(reporte.fecha_actividad) <= fechaHasta
            );
        }

        // Filtrar por búsqueda
        if (filtros.busqueda) {
            const busqueda = filtros.busqueda.toLowerCase();
            filtrados = filtrados.filter(reporte => 
                reporte.descripcion_trabajo.toLowerCase().includes(busqueda) ||
                reporte.estudiante.primer_nombre.toLowerCase().includes(busqueda) ||
                reporte.estudiante.primer_apellido.toLowerCase().includes(busqueda) ||
                reporte.actividad.nombre.toLowerCase().includes(busqueda) ||
                reporte.convocatoria.titulo.toLowerCase().includes(busqueda)
            );
        }

        // Ordenar
        filtrados.sort((a, b) => {
            let comparacion = 0;
            
            switch (ordenarPor) {
                case 'fecha':
                    comparacion = new Date(b.reportado_en).getTime() - new Date(a.reportado_en).getTime();
                    break;
                case 'estudiante':
                    comparacion = a.estudiante.primer_nombre.localeCompare(b.estudiante.primer_nombre);
                    break;
                case 'horas':
                    comparacion = b.horas_reportadas - a.horas_reportadas;
                    break;
                case 'estado':
                    const ordenEstados = ['PENDIENTE_VALIDACION', 'RECHAZADO', 'APROBADO'];
                    comparacion = ordenEstados.indexOf(a.estado) - ordenEstados.indexOf(b.estado);
                    break;
            }
            
            return ordenDireccion === 'asc' ? comparacion : -comparacion;
        });

        setReportesFiltrados(filtrados);
    }, [reportes, filtros, ordenarPor, ordenDireccion]);

    // Acciones de aprobación/rechazo
    const handleAccion = async (reporteId: string, accion: 'aprobar' | 'rechazar') => {
        if (!notasRevision.trim()) {
            toast.error('Debes agregar notas de revisión');
            return;
        }

        setAccionando(reporteId);
        setAccionSeleccionada(accion);

        try {
            const response = await fetch('/api/admin/reportes/' + accion, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_reporte: reporteId,
                    notas_revisor: notasRevision,
                    estado: accion === 'aprobar' ? 'APROBADO' : 'RECHAZADO'
                })
            });

            if (!response.ok) throw new Error(`Error al ${accion} el reporte`);

            toast.success(`✅ Reporte ${accion === 'aprobar' ? 'aprobado' : 'rechazado'} exitosamente`);
            
            // Actualizar la lista de reportes
            await cargarReportes();
            setNotasRevision('');
            setReporteSeleccionado(null);
            setMostrarDetalles(false);
        } catch (error) {
            console.error('Error:', error);
            toast.error(`Error al ${accion} el reporte`);
        } finally {
            setAccionando(null);
        }
    };

    // Descargar evidencias
    const descargarEvidencias = async (reporteId: string) => {
        try {
            const response = await fetch(`/api/admin/reportes/${reporteId}/evidencias`);
            if (!response.ok) throw new Error('Error al descargar evidencias');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `evidencias-reporte-${reporteId}.zip`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.success('✅ Evidencias descargadas exitosamente');
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al descargar las evidencias');
        }
    };

    // Formatear fecha
    const formatearFecha = (fecha: string) => {
        return new Date(fecha).toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Obtener color del estado
    const getColorEstado = (estado: string) => {
        switch (estado) {
            case 'PENDIENTE_VALIDACION':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'APROBADO':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'RECHAZADO':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    // Obtener icono del estado
    const getIconoEstado = (estado: string) => {
        switch (estado) {
            case 'PENDIENTE_VALIDACION':
                return <AlertCircle className="w-4 h-4" />;
            case 'APROBADO':
                return <CheckCircle className="w-4 h-4" />;
            case 'RECHAZADO':
                return <XCircle className="w-4 h-4" />;
            default:
                return <Clock className="w-4 h-4" />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header con filtros */}
            <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-[#1e293b] flex items-center gap-2">
                            <FileText className="w-6 h-6 text-[#8B1E1E]" />
                            Gestión de Reportes de Horas
                        </h1>
                        <p className="text-[#64748b]">Revisa y gestiona los reportes de horas de servicio social</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setMostrarFiltros(!mostrarFiltros)}
                            className="flex items-center gap-2 px-4 py-2 border border-[#e2e8f0] rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <Filter className="w-4 h-4" />
                            Filtros
                            {mostrarFiltros ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        
                        <select
                            value={ordenarPor}
                            onChange={(e) => setOrdenarPor(e.target.value as any)}
                            className="px-3 py-2 border border-[#e2e8f0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]"
                        >
                            <option value="fecha">Fecha</option>
                            <option value="estudiante">Estudiante</option>
                            <option value="horas">Horas</option>
                            <option value="estado">Estado</option>
                        </select>
                        
                        <button
                            onClick={() => setOrdenDireccion(ordenDireccion === 'asc' ? 'desc' : 'asc')}
                            className="px-3 py-2 border border-[#e2e8f0] rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            {ordenDireccion === 'asc' ? '↑' : '↓'}
                        </button>
                    </div>
                </div>

                {/* Filtros */}
                {mostrarFiltros && (
                    <div className="border-t border-[#e2e8f0] pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-[#374151] mb-1">Estado</label>
                                <select
                                    value={filtros.estado}
                                    onChange={(e) => setFiltros({...filtros, estado: e.target.value})}
                                    className="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]"
                                >
                                    <option value="">Todos los estados</option>
                                    <option value="PENDIENTE_VALIDACION">Pendiente Validación</option>
                                    <option value="APROBADO">Aprobado</option>
                                    <option value="RECHAZADO">Rechazado</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-[#374151] mb-1">Programa</label>
                                <input
                                    type="text"
                                    value={filtros.programa}
                                    onChange={(e) => setFiltros({...filtros, programa: e.target.value})}
                                    placeholder="Buscar programa..."
                                    className="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-[#374151] mb-1">Facultad</label>
                                <input
                                    type="text"
                                    value={filtros.facultad}
                                    onChange={(e) => setFiltros({...filtros, facultad: e.target.value})}
                                    placeholder="Buscar facultad..."
                                    className="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-[#374151] mb-1">Desde</label>
                                <input
                                    type="date"
                                    value={filtros.fechaDesde}
                                    onChange={(e) => setFiltros({...filtros, fechaDesde: e.target.value})}
                                    className="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-[#374151] mb-1">Hasta</label>
                                <input
                                    type="date"
                                    value={filtros.fechaHasta}
                                    onChange={(e) => setFiltros({...filtros, fechaHasta: e.target.value})}
                                    className="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[8B1E1E]"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-[#374151] mb-1">Búsqueda</label>
                                <input
                                    type="text"
                                    value={filtros.busqueda}
                                    onChange={(e) => setFiltros({...filtros, busqueda: e.target.value})}
                                    placeholder="Buscar en descripción, estudiante o actividad..."
                                    className="w-full px-3 py-2 border border-[e2e8f0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]"
                                />
                            </div>
                        </div>
                        
                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                onClick={() => setFiltros({
                                    estado: '',
                                    programa: '',
                                    facultad: '',
                                    fechaDesde: '',
                                    fechaHasta: '',
                                    busqueda: ''
                                })}
                                className="px-4 py-2 text-sm border border-[#e2e8f0] rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Limpiar filtros
                            </button>
                        </div>
                    </div>
                )}

                {/* Estadísticas rápidas */}
                <div className="flex flex-wrap gap-4 mt-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
                        <span className="text-sm font-medium text-yellow-800">
                            PENDIENTE VALIDACIÓN: {reportesFiltrados.filter(r => r.estado === 'PENDIENTE_VALIDACION').length}
                        </span>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                        <span className="text-sm font-medium text-green-800">
                            APROBADOS: {reportesFiltrados.filter(r => r.estado === 'APROBADO').length}
                        </span>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                        <span className="text-sm font-medium text-red-800">
                            RECHAZADOS: {reportesFiltrados.filter(r => r.estado === 'RECHAZADO').length}
                        </span>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                        <span className="text-sm font-medium text-blue-800">
                            TOTAL: {reportesFiltrados.length}
                        </span>
                    </div>
                </div>
            </div>

            {/* Lista de reportes */}
            <div className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                                <th className="text-left py-3 px-4 text-xs font-semibold text-[#374151] uppercase">Estado</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-[#374151] uppercase">Estudiante</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-[#374151] uppercase">Actividad</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-[#374151] uppercase">Horas</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-[#374151] uppercase">Fecha</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-[#374151] uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-8">
                                        <div className="flex items-center justify-center">
                                            <div className="w-8 h-8 border-4 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : reportesFiltrados.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-8">
                                        <div className="text-center">
                                            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                            <p className="text-gray-500">No se encontraron reportes</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                reportesFiltrados.map((reporte) => (
                                    <tr key={reporte.id} className="border-b border-[#e2e8f0] hover:bg-gray-50">
                                        <td className="py-3 px-4">
                                            <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${getColorEstado(reporte.estado)}`}>
                                                {getIconoEstado(reporte.estado)}
                                                <span>{reporte.estado.replace(/_/g, ' ')}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium text-[#1e293b]">
                                                    {reporte.estudiante.primer_nombre} {reporte.estudiante.primer_apellido}
                                                </p>
                                                <p className="text-xs text-[#64748b]">
                                                    {reporte.estudiante.correo}
                                                </p>
                                                <p className="text-xs text-[#64748b]">
                                                    {reporte.estudiante.programa?.nombre || 'Sin programa'}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium text-[#1e293b] line-clamp-1">
                                                    {reporte.actividad.nombre}
                                                </p>
                                                <p className="text-xs text-[#64748b] line-clamp-1">
                                                    {reporte.convocatoria.titulo}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-[#1e293b]">{reporte.horas_reportadas}h</span>
                                                {reporte.horas_aprobadas && (
                                                    <span className="text-xs text-green-600">
                                                        ({reporte.horas_aprobadas}h aprobadas)
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1 text-xs text-[#64748b]">
                                                    <Calendar className="w-3 h-3" />
                                                    <span>{formatearFecha(reporte.fecha_actividad)}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-[#6474b]">
                                                    <Clock className="w-3 h-3" />
                                                    <span>{formatearFecha(reporte.reportado_en)}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        setReporteSeleccionado(reporte);
                                                        setMostrarDetalles(true);
                                                    }}
                                                    className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                                                    title="Ver detalles"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                </button>
                                                
                                                {reporte.estado === 'PENDIENTE_VALIDACION' && (
                                                    <>
                                                        <button
                                                            onClick={() => {
                                                                setReporteSeleccionado(reporte);
                                                                setMostrarDetalles(true);
                                                                setAccionSeleccionada('aprobar');
                                                            }}
                                                            className="p-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors"
                                                            title="Aprobar"
                                                        >
                                                            <CheckCircle className="w-3.5 h-3.5" />
                                                        </button>
                                                        
                                                        <button
                                                            onClick={() => {
                                                                setReporteSeleccionado(reporte);
                                                                setMostrarDetalles(true);
                                                                setAccionSeleccionada('rechazar');
                                                            }}
                                                            className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                                                            title="Rechazar"
                                                        >
                                                            <XCircle className="w-3.5 h-3.5" />
                                                        </button>
                                                    </>
                                                )}
                                                
                                                <button
                                                    onClick={() => descargarEvidencias(reporte.id)}
                                                    className="p-1.5 bg-purple-50 text-purple-600 rounded hover:bg-purple-100 transition-colors"
                                                    title="Descargar evidencias"
                                                >
                                                    <Download className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de detalles */}
            {mostrarDetalles && reporteSeleccionado && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
                        <div className="p-6 border-b border-[#e2e8f0]">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-[#1e293b]">
                                    Detalles del Reporte
                                </h3>
                                <button
                                    onClick={() => {
                                        setMostrarDetalles(false);
                                        setReporteSeleccionado(null);
                                        setNotasRevision('');
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            {/* Información del estudiante */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-semibold text-[#1e293b] mb-3 flex items-center gap-2">
                                    <User className="w-4 h-4 text-[#8B1E1E]" />
                                    Información del Estudiante
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium text-[#374151]">Nombre:</span>
                                        <p className="text-[#1e293b]">
                                            {reporteSeleccionado.estudiante.primer_nombre} {reporteSeleccionado.estudiante.primer_apellido}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-[#374151]">Correo:</span>
                                        <p className="text-[#1e293b]">{reporteSeleccionado.estudiante.correo}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-[#374151]">Documento:</span>
                                        <p className="text-[#1e293b]">{reporteSeleccionado.estudiante.numero_documento}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-[#374151]">Programa:</span>
                                        <p className="text-[#1e293b]">
                                            {reporteSeleccionado.estudiante.programa?.nombre || 'Sin programa'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Información de la actividad */}
                            <div className="bg-blue-50 rounded-lg p-4">
                                <h4 className="font-semibold text-[#1e293b] mb-3 flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-[#8B1E1E]" />
                                    Información de la Actividad
                                </h4>
                                <div className="space-y-2 text-sm">
                                    <div>
                                        <span className="font-medium text-[#374151]">Actividad:</span>
                                        <p className="text-[#1e293b]">{reporteSeleccionado.actividad.nombre}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-[#374151]">Descripción:</span>
                                        <p className="text-[#1e293b]">{reporteSeleccionado.descripcion_trabajo}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-[#374151]">Horas reportadas:</span>
                                        <p className="text-[#1e293b]">{reporteSeleccionado.horas_reportadas}h</p>
                                    </div>
                                    {reporteSeleccionado.actividad.ubicacion && (
                                        <div>
                                            <span className="font-medium text-[#374151]">Ubicación:</span>
                                            <p className="text-[#1e293b]">{reporteSeleccionado.actividad.ubicacion}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Información de la convocatoria */}
                            <div className="bg-purple-50 rounded-lg p-4">
                                <h4 className="font-semibold text-[#1e293b] mb-3 flex items-center gap-2">
                                    <Building className="w-4 h-4 text-[#8B1E1E]" />
                                    Información de la Convocatoria
                                </h4>
                                <div className="space-y-2 text-sm">
                                    <div>
                                        <span className="font-medium text-[#374151]">Convocatoria:</span>
                                        <p className="text-[#1e293b]">{reporteSeleccionado.convocatoria.titulo}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-[#374151]">Modalidad:</span>
                                        <p className="text-[#1e293b]">{reporteSeleccionado.convocatoria.modalidad}</p>
                                    </div>
                                    {reporteSeleccionado.convocatoria.horas_totales_ofrecidas && (
                                        <div>
                                            <span className="font-medium text-[#374151]">Horas ofrecidas:</span>
                                            <p className="text-[#1e293b]">{reporteSeleccionado.convocatoria.horas_totales_ofrecidas}h</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {reporteSeleccionado.evidencias && reporteSeleccionado.evidencias.length > 0 && (
                                <div className="bg-orange-50 rounded-lg p-4">
                                    <h4 className="font-semibold text-[#1e293b] mb-3 flex items-center gap-2">
                                        <Download className="w-4 h-4 text-[#8B1E1E]" />
                                        Evidencias ({reporteSeleccionado.evidencias.length})
                                    </h4>
                                    <div className="space-y-2">
                                        {reporteSeleccionado.evidencias.map((evidencia, index) => (
                                            <div key={evidencia.id} className="bg-white rounded-lg p-3 border border-orange-200 flex items-center justify-between">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-xs font-medium text-orange-600">
                                                            #{index + 1} - {evidencia.tipo}
                                                        </span>
                                                        <span className="text-xs text-gray-500 font-medium">
                                                            {evidencia.archivo_nombre || 'Sin nombre'}
                                                        </span>
                                                    </div>
                                                    {evidencia.contenido_texto && (
                                                        <p className="text-sm text-[#64748b] bg-gray-50 rounded p-2 italic">
                                                            &ldquo;{evidencia.contenido_texto}&rdquo;
                                                        </p>
                                                    )}
                                                </div>
                                                
                                                {evidencia.archivo_url && (
                                                    <a 
                                                        href={evidencia.archivo_url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-1 px-3 py-1.5 bg-[#8B1E1E] text-white text-[10px] font-bold rounded-lg hover:bg-[#a32424] transition-colors"
                                                    >
                                                        <Download className="w-3 h-3" />
                                                        DESCARGAR
                                                    </a>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Formulario de revisión */}
                            {reporteSeleccionado.estado === 'PENDIENTE_VALIDACION' && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <h4 className="font-semibold text-[#1e293b] mb-3 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 text-yellow-600" />
                                        Revisión del Reporte
                                    </h4>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-[#374151] mb-1">
                                                Acción:
                                            </label>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setAccionSeleccionada('aprobar')}
                                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                                        accionSeleccionada === 'aprobar' 
                                                            ? 'bg-green-600 text-white' 
                                                            : 'bg-gray-200 text-gray-700 hover:bg-green-500'
                                                    }`}
                                                >
                                                    Aprobar
                                                </button>
                                                <button
                                                    onClick={() => setAccionSeleccionada('rechazar')}
                                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                                        accionSeleccionada === 'rechazar' 
                                                            ? 'bg-red-600 text-white' 
                                                            : 'bg-gray-200 text-gray-700 hover:bg-red-500'
                                                    }`}
                                                >
                                                    Rechazar
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-[#374151] mb-1">
                                                Notas de revisión:
                                            </label>
                                            <textarea
                                                value={notasRevision}
                                                onChange={(e) => setNotasRevision(e.target.value)}
                                                placeholder="Agregar notas sobre la decisión..."
                                                rows={4}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]"
                                            />
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => {
                                                    setMostrarDetalles(false);
                                                    setReporteSeleccionado(null);
                                                    setNotasRevision('');
                                                }}
                                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                onClick={() => handleAccion(reporteSeleccionado.id, accionSeleccionada)}
                                                disabled={accionando === reporteSeleccionado.id || !notasRevision.trim()}
                                                className="px-4 py-2 rounded-lg font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                style={{
                                                    backgroundColor: accionSeleccionada === 'aprobar' ? '#16a34a' : accionSeleccionada === 'rechazar' ? '#dc2626' : '#6b7280'
                                                }}
                                            >
                                                {accionando ? (
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    accionSeleccionada === 'aprobar' ? 'Aprobar' : 'Rechazar'
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Información de revisión (si ya fue revisado) */}
                            {reporteSeleccionado.estado !== 'PENDIENTE_VALIDACION' && reporteSeleccionado.revisado_en && (
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="font-semibold text-[#1e293b] mb-3 flex items-center gap-2">
                                        {reporteSeleccionado.estado === 'APROBADO' ? (
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                        ) : (
                                            <XCircle className="w-4 h-4 text-red-600" />
                                        )}
                                        Revisión del Reporte
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <span className="font-medium text-[#374151]">Revisado por:</span>
                                            <p className="text-[#1e293b]">
                                                {reporteSeleccionado.revisor?.primer_nombre} {reporteSeleccionado.revisor?.primer_apellido || 'Administrador'}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-[#374151]">Fecha de revisión:</span>
                                            <p className="text-[#1e293b]">
                                                {formatearFecha(reporteSeleccionado.revisado_en!)}
                                            </p>
                                        </div>
                                        {reporteSeleccionado.notas_revisor && (
                                            <div>
                                                <span className="font-medium text-[#374151]">Notas de revisión:</span>
                                                <p className="text-[#1e293b] bg-white rounded p-2 mt-1">
                                                    {reporteSeleccionado.notas_revisor}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
