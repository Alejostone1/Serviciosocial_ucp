'use client';

import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Search, 
  User, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Filter,
  ChevronDown,
  Clock,
  Database,
  Shield,
  Download,
  FileText,
  Calendar,
  Users as UsersIcon
} from 'lucide-react';

type LogRow = {
    id: string;
    accion: string;
    entidad: string | null;
    descripcion: string | null;
    resultado: string;
    creado_en: Date;
    usuario: {
        primer_nombre: string;
        primer_apellido: string;
        correo: string;
        rol: string;
    } | null;
};

export function SimpleAuditoriaTable({ initialData }: { initialData: LogRow[] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAccion, setSelectedAccion] = useState<string>('all');
    const [selectedResultado, setSelectedResultado] = useState<string>('all');
    const [selectedRol, setSelectedRol] = useState<string>('all');
    const [dateRange, setDateRange] = useState<string>('all');
    const [showFilters, setShowFilters] = useState(false);
    const [showExportOptions, setShowExportOptions] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Obtener valores únicos para filtros
    const uniqueAcciones = useMemo(() => {
        const acciones = new Set(initialData.map(log => log.accion));
        return Array.from(acciones).sort();
    }, [initialData]);

    const uniqueResultados = useMemo(() => {
        const resultados = new Set(initialData.map(log => log.resultado));
        return Array.from(resultados).sort();
    }, [initialData]);

    const uniqueRoles = useMemo(() => {
        const roles = new Set(initialData.map(log => log.usuario?.rol).filter(Boolean));
        return Array.from(roles).sort();
    }, [initialData]);

    // Aplicar filtros
    const filteredLogs = useMemo(() => {
        let filtered = initialData;

        // Filtro de búsqueda
        if (searchTerm) {
            const q = searchTerm.toLowerCase();
            filtered = filtered.filter(log =>
                log.accion.toLowerCase().includes(q) ||
                (log.descripcion && log.descripcion.toLowerCase().includes(q)) ||
                (log.usuario && (
                    log.usuario.correo.toLowerCase().includes(q) ||
                    `${log.usuario.primer_nombre} ${log.usuario.primer_apellido}`.toLowerCase().includes(q)
                ))
            );
        }

        // Filtro por acción
        if (selectedAccion !== 'all') {
            filtered = filtered.filter(log => log.accion === selectedAccion);
        }

        // Filtro por resultado
        if (selectedResultado !== 'all') {
            filtered = filtered.filter(log => log.resultado === selectedResultado);
        }

        // Filtro por rol
        if (selectedRol !== 'all') {
            filtered = filtered.filter(log => log.usuario?.rol === selectedRol);
        }

        // Filtro por fecha
        if (dateRange !== 'all') {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            
            filtered = filtered.filter(log => {
                const logDate = new Date(log.creado_en);
                
                switch (dateRange) {
                    case 'today':
                        return logDate >= today;
                    case 'week':
                        const weekAgo = new Date(today);
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        return logDate >= weekAgo;
                    case 'month':
                        const monthAgo = new Date(today);
                        monthAgo.setMonth(monthAgo.getMonth() - 1);
                        return logDate >= monthAgo;
                    default:
                        return true;
                }
            });
        }

        return filtered;
    }, [initialData, searchTerm, selectedAccion, selectedResultado, selectedRol, dateRange]);

    // Paginación
    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedLogs = filteredLogs.slice(startIndex, startIndex + itemsPerPage);

    // Resetear filtros
    const resetFilters = () => {
        setSearchTerm('');
        setSelectedAccion('all');
        setSelectedResultado('all');
        setSelectedRol('all');
        setDateRange('all');
        setCurrentPage(1);
    };

    // Funciones de exportación
    const exportToCSV = (data: LogRow[], filename: string) => {
        const headers = ['Fecha', 'Hora', 'Usuario', 'Correo', 'Rol', 'Acción', 'Entidad', 'Descripción', 'Resultado'];
        const csvContent = [
            headers.join(','),
            ...data.map(log => [
                format(new Date(log.creado_en), 'dd/MM/yyyy', { locale: es }),
                format(new Date(log.creado_en), 'HH:mm:ss', { locale: es }),
                log.usuario ? `${log.usuario.primer_nombre} ${log.usuario.primer_apellido}` : 'Sistema',
                log.usuario?.correo || '',
                log.usuario?.rol || '',
                log.accion.replace(/_/g, ' '),
                log.entidad || '',
                log.descripcion || '',
                log.resultado
            ].map(field => `"${field}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
    };

    const handleExport = (type: 'all' | 'filtered' | 'current-page') => {
        let data: LogRow[];
        let filename: string;

        switch (type) {
            case 'all':
                data = initialData;
                filename = `auditoria_completa_${format(new Date(), 'dd-MM-yyyy')}.csv`;
                break;
            case 'filtered':
                data = filteredLogs;
                filename = `auditoria_filtrada_${format(new Date(), 'dd-MM-yyyy')}.csv`;
                break;
            case 'current-page':
                data = paginatedLogs;
                filename = `auditoria_pagina_${currentPage}_${format(new Date(), 'dd-MM-yyyy')}.csv`;
                break;
        }

        exportToCSV(data, filename);
        setShowExportOptions(false);
    };

    // Obtener icono según resultado
    const getResultIcon = (resultado: string) => {
        switch (resultado) {
            case 'EXITOSO':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'FALLIDO':
                return <XCircle className="w-4 h-4 text-red-500" />;
            case 'PARCIAL':
                return <AlertTriangle className="w-4 h-4 text-amber-500" />;
            default:
                return <Activity className="w-4 h-4 text-gray-500" />;
        }
    };

    // Obtener color según acción
    const getAccionColor = (accion: string) => {
        const colors: Record<string, string> = {
            'CREATE': 'bg-blue-100 text-blue-700',
            'UPDATE': 'bg-amber-100 text-amber-700',
            'DELETE': 'bg-red-100 text-red-700',
            'LOGIN': 'bg-green-100 text-green-700',
            'LOGOUT': 'bg-gray-100 text-gray-700',
            'ACCESS': 'bg-purple-100 text-purple-700',
        };
        
        for (const [key, color] of Object.entries(colors)) {
            if (accion.includes(key)) return color;
        }
        return 'bg-gray-100 text-gray-700';
    };

    return (
        <div className="space-y-4">
            {/* Barra de búsqueda y filtros */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Búsqueda */}
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar por acción, usuario o descripción..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/50 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <Filter className="w-4 h-4" />
                            Filtros
                            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                        </button>
                        
                        <div className="relative">
                            <button
                                onClick={() => setShowExportOptions(!showExportOptions)}
                                className="flex items-center gap-2 px-4 py-2.5 bg-[#8B1E1E] text-white rounded-xl text-sm font-medium hover:bg-[#a32424] transition-all duration-200 shadow-md"
                            >
                                <Download className="w-4 h-4" />
                                Exportar
                                <ChevronDown className={`w-4 h-4 transition-transform ${showExportOptions ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {/* Opciones de exportación */}
                            {showExportOptions && (
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 z-10">
                                    <div className="py-2">
                                        <button
                                            onClick={() => handleExport('all')}
                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                                        >
                                            <FileText className="w-4 h-4 text-blue-600" />
                                            <div>
                                                <div className="font-medium">Todos los datos</div>
                                                <div className="text-xs text-gray-500">{initialData.length} registros</div>
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => handleExport('filtered')}
                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                                        >
                                            <Filter className="w-4 h-4 text-green-600" />
                                            <div>
                                                <div className="font-medium">Datos filtrados</div>
                                                <div className="text-xs text-gray-500">{filteredLogs.length} registros</div>
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => handleExport('current-page')}
                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                                        >
                                            <Calendar className="w-4 h-4 text-purple-600" />
                                            <div>
                                                <div className="font-medium">Página actual</div>
                                                <div className="text-xs text-gray-500">{paginatedLogs.length} registros</div>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {(searchTerm || selectedAccion !== 'all' || selectedResultado !== 'all' || selectedRol !== 'all' || dateRange !== 'all') && (
                            <button
                                onClick={resetFilters}
                                className="px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                            >
                                Limpiar
                            </button>
                        )}
                    </div>
                </div>

                {/* Panel de filtros avanzados */}
                {showFilters && (
                    <div className="mt-4 p-4 bg-white rounded-xl border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            {/* Filtro por acción */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-2">
                                    Acción
                                </label>
                                <select
                                    value={selectedAccion}
                                    onChange={(e) => {
                                        setSelectedAccion(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="all">Todas las acciones</option>
                                    {uniqueAcciones.map(accion => (
                                        <option key={accion} value={accion}>
                                            {accion.replace(/_/g, ' ')}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Filtro por resultado */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-2">
                                    Resultado
                                </label>
                                <select
                                    value={selectedResultado}
                                    onChange={(e) => {
                                        setSelectedResultado(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="all">Todos los resultados</option>
                                    {uniqueResultados.map(resultado => (
                                        <option key={resultado} value={resultado}>
                                            {resultado}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Filtro por rol */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-2">
                                    Rol del Usuario
                                </label>
                                <select
                                    value={selectedRol}
                                    onChange={(e) => {
                                        setSelectedRol(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="all">Todos los roles</option>
                                    {uniqueRoles.map(rol => (
                                        <option key={rol} value={rol}>
                                            {rol}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Filtro por fecha */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-2">
                                    Período
                                </label>
                                <select
                                    value={dateRange}
                                    onChange={(e) => {
                                        setDateRange(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="all">Todo el tiempo</option>
                                    <option value="today">Hoy</option>
                                    <option value="week">Última semana</option>
                                    <option value="month">Último mes</option>
                                </select>
                            </div>

                            {/* Estadísticas */}
                            <div className="bg-red-50/50 rounded-lg p-3 border border-red-100">
                                <div className="text-xs text-[#8B1E1E] font-medium mb-1">Resultados</div>
                                <div className="text-sm text-gray-900">
                                    {filteredLogs.length} de {initialData.length} registros
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Tabla de datos */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Fecha y Hora
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Usuario
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acción
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Descripción
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Resultado
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-gray-50">
                                <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gray-50 rounded-lg">
                                            <Clock className="w-4 h-4 text-gray-500" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {format(new Date(log.creado_en), 'dd MMM yyyy', { locale: es })}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {format(new Date(log.creado_en), 'HH:mm:ss', { locale: es })}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${
                                            log.usuario 
                                                ? 'bg-red-50' 
                                                : 'bg-gray-100'
                                        }`}>
                                            {log.usuario ? (
                                                <User className="w-4 h-4 text-[#8B1E1E]" />
                                            ) : (
                                                <Shield className="w-4 h-4 text-gray-500" />
                                            )}
                                        </div>
                                        <div>
                                            {log.usuario ? (
                                                <>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {log.usuario.primer_nombre} {log.usuario.primer_apellido}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {log.usuario.correo}
                                                    </div>
                                                    <div className="text-xs text-gray-400 mt-0.5">
                                                        {log.usuario.rol}
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="text-sm text-gray-500 italic">
                                                    Sistema Automático
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${getAccionColor(log.accion)}`}>
                                            {log.accion.replace(/_/g, ' ')}
                                        </div>
                                        {log.entidad && (
                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                <Database className="w-3 h-3" />
                                                {log.entidad}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="max-w-xs">
                                        <p className="text-sm text-gray-600 line-clamp-2" title={log.descripcion || ''}>
                                            {log.descripcion || 'Sin descripción detallada'}
                                        </p>
                                    </div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        {getResultIcon(log.resultado)}
                                        <span className={`text-sm font-medium ${
                                            log.resultado === 'EXITOSO' ? 'text-green-600' :
                                            log.resultado === 'FALLIDO' ? 'text-red-600' :
                                            log.resultado === 'PARCIAL' ? 'text-amber-600' :
                                            'text-gray-600'
                                        }`}>
                                            {log.resultado}
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
                <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            Mostrando <span className="font-medium">{startIndex + 1}</span> a{' '}
                            <span className="font-medium">
                                {Math.min(startIndex + itemsPerPage, filteredLogs.length)}
                            </span>{' '}
                            de <span className="font-medium">{filteredLogs.length}</span> resultados
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Anterior
                            </button>
                            <span className="px-3 py-1 bg-[#8B1E1E] text-white rounded-md text-sm font-medium">
                                {currentPage} de {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Estado vacío */}
            {filteredLogs.length === 0 && (
                <div className="text-center py-12">
                    <div className="p-3 bg-gray-100 rounded-full w-12 h-12 mx-auto mb-4">
                        <Activity className="w-6 h-6 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Sin resultados</h3>
                    <p className="text-sm text-gray-500 mb-4">
                        No hay registros que coincidan con los filtros aplicados.
                    </p>
                    <button
                        onClick={resetFilters}
                        className="px-4 py-2 bg-[#8B1E1E] text-white rounded-lg text-sm font-medium hover:bg-[#a32424] transition-colors"
                    >
                        Limpiar filtros
                    </button>
                </div>
            )}
        </div>
    );
}
