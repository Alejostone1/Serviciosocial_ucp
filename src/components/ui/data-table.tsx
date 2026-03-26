import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, SlidersHorizontal, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export interface ColumnDef<T> {
    header: string;
    accessorKey?: keyof T;
    cell?: (item: T) => React.ReactNode;
    sortable?: boolean;
    sortKey?: string; // Llave por la cual ordenar si es distinta al accessorKey
}

interface DataTableProps<T> {
    data: T[];
    columns: ColumnDef<T>[];
    searchPlaceholder?: string;
    onSearch?: (query: string) => void;
    isLoading?: boolean;
    emptyMessage?: string;
    // Para compaginación simple (opcional)
    pageCount?: number;
    currentPage?: number;
    onPageChange?: (page: number) => void;
    // Control de filtros externos
    onFilterClick?: () => void;
    showSearch?: boolean;
}

export function DataTable<T>({
    data,
    columns,
    searchPlaceholder = 'Buscar...',
    onSearch,
    isLoading = false,
    emptyMessage = 'No se encontraron resultados.',
    pageCount = 1,
    currentPage = 1,
    onPageChange,
    onFilterClick,
    showSearch = true,
}: DataTableProps<T>) {
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedData = useMemo(() => {
        if (!sortConfig) return data;

        return [...data].sort((a: any, b: any) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

            if (aValue === bValue) return 0;
            if (aValue === null || aValue === undefined) return 1;
            if (bValue === null || bValue === undefined) return -1;

            const comparison = aValue < bValue ? -1 : 1;
            return sortConfig.direction === 'asc' ? comparison : -comparison;
        });
    }, [data, sortConfig]);

    return (
        <div className="w-full bg-white rounded-2xl shadow-sm border border-[#e2e8f0] overflow-hidden flex flex-col">
            {/* Table Toolbar */}
            {(showSearch || onFilterClick) && (
                <div className="p-4 sm:p-5 border-b border-[#e2e8f0] flex flex-col sm:flex-row gap-4 justify-between items-center bg-white/50">
                    {showSearch && (
                        <div className="relative w-full sm:max-w-xs">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-[#94a3b8]" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-9 pr-3 py-2 border border-[#e2e8f0] rounded-lg text-sm bg-[#f8fafc] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/20 focus:border-[#8B1E1E] transition-colors placeholder:text-[#94a3b8] text-[#1e293b]"
                                placeholder={searchPlaceholder}
                                onChange={(e) => onSearch?.(e.target.value)}
                            />
                        </div>
                    )}
                    <div className="w-full sm:w-auto flex gap-2 ml-auto">
                        {onFilterClick && (
                            <button 
                                onClick={onFilterClick}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-white border border-[#e2e8f0] rounded-lg text-sm font-semibold text-[#475569] hover:bg-[#f8fafc] hover:text-[#1e293b] transition-colors shadow-sm"
                            >
                                <SlidersHorizontal className="h-4 w-4" />
                                <span>Filtros</span>
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Table Container */}
            <div className="overflow-x-auto min-h-[300px] relative">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-[#64748b] uppercase bg-[#f8fafc] border-b border-[#e2e8f0]">
                        <tr>
                            {columns.map((col, idx) => {
                                const sortKey = col.sortKey || col.accessorKey;
                                const isSorted = sortConfig?.key === sortKey;

                                return (
                                    <th 
                                        key={idx} 
                                        scope="col" 
                                        className={`px-4 sm:px-6 py-3 sm:py-4 font-bold tracking-wider ${col.sortable ? 'cursor-pointer hover:bg-slate-100 transition-colors' : ''}`}
                                        onClick={() => col.sortable && sortKey && handleSort(sortKey as string)}
                                    >
                                        <div className="flex items-center gap-1.5">
                                            {col.header}
                                            {col.sortable && (
                                                <div className="text-[#94a3b8]">
                                                    {isSorted && sortConfig ? (
                                                        sortConfig.direction === 'asc' ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />
                                                    ) : (
                                                        <ArrowUpDown className="h-3.5 w-3.5" />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e2e8f0]">
                        {isLoading ? (
                            // Loading State
                            Array.from({ length: 5 }).map((_, idx) => (
                                <tr key={`skeleton-${idx}`} className="animate-pulse">
                                    {columns.map((_, colIdx) => (
                                        <td key={colIdx} className="px-4 sm:px-6 py-4 sm:py-5">
                                            <div className="h-4 bg-[#f1f5f9] rounded w-3/4"></div>
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : sortedData.length === 0 ? (
                            // Empty State
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center justify-center text-[#64748b]">
                                        <Search className="h-8 w-8 text-[#cbd5e1] mb-3" />
                                        <p className="font-medium text-[13px]">{emptyMessage}</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            // Data Rows
                            sortedData.map((row, rowIdx) => (
                                <tr key={rowIdx} className="bg-white hover:bg-[#f8fafc] transition-colors group">
                                    {columns.map((col, colIdx) => (
                                        <td key={colIdx} className="px-4 sm:px-6 py-3 sm:py-4 whitespace-normal break-words text-[#334155] font-medium align-middle">
                                            {col.cell
                                                ? col.cell(row)
                                                : col.accessorKey
                                                    ? String(row[col.accessorKey])
                                                    : null}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Table Pagination */}
            {pageCount > 1 && (
                <div className="px-4 py-3 border-t border-[#e2e8f0] flex items-center justify-between sm:px-6 bg-white/50">
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-[13px] text-[#64748b] font-medium">
                                Mostrando página <span className="font-bold text-[#1e293b]">{currentPage}</span> de <span className="font-bold text-[#1e293b]">{pageCount}</span>
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                <button
                                    onClick={() => onPageChange?.(currentPage - 1)}
                                    disabled={currentPage <= 1 || isLoading}
                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-[#e2e8f0] bg-white text-sm font-medium text-[#64748b] hover:bg-[#f8fafc] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <span className="sr-only">Anterior</span>
                                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                                </button>
                                <button
                                    onClick={() => onPageChange?.(currentPage + 1)}
                                    disabled={currentPage >= pageCount || isLoading}
                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-[#e2e8f0] bg-white text-sm font-medium text-[#64748b] hover:bg-[#f8fafc] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <span className="sr-only">Siguiente</span>
                                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
