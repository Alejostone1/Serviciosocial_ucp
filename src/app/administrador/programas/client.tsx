'use client';

import React, { useState, useMemo } from 'react';
import { StatusBadge } from '@/components/ui/status-badge';
import {
    Plus,
    MoreHorizontal,
    ExternalLink,
    Power,
    Search,
    Filter,
    X,
    ChevronDown,
    ChevronUp,
    ChevronLeft,
    ChevronRight,
    GraduationCap,
    BookOpen,
    Building2,
    Clock,
    Users,
    Activity,
    List,
    LayoutGrid
} from 'lucide-react';
import { toast } from 'sonner';
import { togglePrograma } from './actions';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { NuevoProgramaModal } from './nuevo-programa-modal';
import { transformDecimalsToNumbers } from '@/lib/decimal-utils';
import Link from 'next/link';

type ProgramaRow = {
    id: string;
    nombre: string;
    codigo: string | null;
    nivel_formacion: string;
    horas_requeridas: number;
    esta_activo: boolean;
    facultad: { nombre: string };
    _count: { usuarios: number; convocatorias: number };
};

type Facultad = { id: string; nombre: string };

const NIVEL_LABELS: Record<string, string> = {
    'TECNICO': 'Técnico',
    'TECNOLOGICO': 'Tecnólogo',
    'PREGRADO': 'Pregrado',
    'ESPECIALIZACION': 'Especialización',
    'MAESTRIA': 'Maestría',
    'DOCTORADO': 'Doctorado',
};

export function ProgramasTableClient({
    initialData,
    facultades,
}: {
    initialData: any[];
    facultades: Facultad[];
}) {
    // Convertir todos los Decimals a Numbers recursivamente
    const [data, setData] = useState<ProgramaRow[]>(transformDecimalsToNumbers(initialData));
    const [searchTerm, setSearchTerm] = useState('');
    const [filtrarNivel, setFiltrarNivel] = useState<string>('todos');
    const [filtrarFacultad, setFiltrarFacultad] = useState<string>('todos');
    const [showFilters, setShowFilters] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selected, setSelected] = useState<ProgramaRow | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Modo de vista (table/grid)
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

    // Filtrado de datos
    const filteredData = useMemo(() => {
        // Al filtrar, volvemos a la página 1
        setCurrentPage(1);
        return data.filter(p => {
            const matchesSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.facultad.nombre.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesNivel = filtrarNivel === 'todos' || p.nivel_formacion === filtrarNivel;
            const matchesFacultad = filtrarFacultad === 'todos' || p.facultad.nombre === filtrarFacultad;

            return matchesSearch && matchesNivel && matchesFacultad;
        });
    }, [data, searchTerm, filtrarNivel, filtrarFacultad]);

    // Datos paginados
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(start, start + itemsPerPage);
    }, [filteredData, currentPage]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const requestToggle = (item: ProgramaRow) => {
        setSelected(item);
        setIsDialogOpen(true);
    };

    const executeToggle = async () => {
        if (!selected) return;
        setIsProcessing(true);
        try {
            await togglePrograma(selected.id, !selected.esta_activo);
            const updated = data.map(p => p.id === selected.id ? { ...p, esta_activo: !p.esta_activo } : p);
            setData(updated);
            toast.success(`Programa ${selected.esta_activo ? 'desactivado' : 'activado'} correctamente`);
        } catch {
            toast.error('Ocurrió un error al actualizar el estado del programa');
        } finally {
            setIsProcessing(false);
            setIsDialogOpen(false);
        }
    };

    const handleNuevoPrograma = (newProg: any) => {
        // Convertir todos los Decimals a Numbers del nuevo programa
        const sanitizedProg = transformDecimalsToNumbers(newProg);
        
        const row: ProgramaRow = {
            id: sanitizedProg.id,
            nombre: sanitizedProg.nombre,
            codigo: sanitizedProg.codigo ?? null,
            nivel_formacion: sanitizedProg.nivel_formacion,
            horas_requeridas: sanitizedProg.horas_requeridas,
            esta_activo: true,
            facultad: { nombre: facultades.find(f => f.id === sanitizedProg.id_facultad)?.nombre ?? '...' },
            _count: { usuarios: 0, convocatorias: 0 },
        };
        setData(prev => [row, ...prev]);
        setIsModalOpen(false);
    };

    return (
        <div className="min-h-screen bg-[#fafaf9] -m-4 p-4 lg:-m-8 lg:p-8">
            {/* Header Profesional */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#e7e5e4]">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <GraduationCap className="w-8 h-8 text-[#8B1E1E]" strokeWidth={1.5} />
                            <h1 className="text-2xl font-bold tracking-tight text-[#1c1917]">Programas Académicos</h1>
                        </div>
                        <p className="text-[#78716c] text-sm max-w-2xl">
                            Control centralizado de la oferta académica institucional, requisitos de grado y vinculación estudiantil.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#8B1E1E] text-white rounded-xl font-bold text-sm hover:bg-[#731919] transition-all duration-300 shadow-md shadow-[#8B1E1E]/10"
                    >
                        <Plus className="w-4 h-4" /> Registrar Programa
                    </button>
                </div>
            </div>

            {/* Barra de Herramientas / Filtros */}
            <div className="max-w-7xl mx-auto mb-6">
                <div className="bg-white border border-[#e7e5e4] shadow-sm p-2 flex flex-col lg:flex-row gap-2">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a8a29e]" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, código o facultad..."
                            className="w-full pl-11 pr-4 py-3 bg-transparent border-none focus:ring-0 text-sm font-medium placeholder:text-[#d6d3d1]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex border-t lg:border-t-0 lg:border-l border-[#e7e5e4]">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-6 py-3 text-sm font-bold transition-colors ${showFilters ? 'bg-[#f5f5f4] text-[#8B1E1E]' : 'text-[#78716c] hover:bg-[#fafaf9]'}`}
                        >
                            <Filter className="w-4 h-4" />
                            Filtros Avanzados
                            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                    </div>

                    {/* Selector de Vista */}
                    <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
                        <button
                            onClick={() => setViewMode('table')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? "bg-white text-[#8B1E1E] shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                            title="Vista tabla"
                        >
                            <List className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? "bg-white text-[#8B1E1E] shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                            title="Vista tarjetas"
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Panel de Filtros Expandido */}
                {showFilters && (
                    <div className="bg-white border-x border-b border-[#e7e5e4] p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-top-2 duration-300">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#a8a29e]">Nivel de Formación</label>
                            <select
                                className="w-full p-2.5 bg-[#fafaf9] border border-[#e7e5e4] text-sm font-semibold focus:border-[#8B1E1E] outline-none transition-colors"
                                value={filtrarNivel}
                                onChange={(e) => setFiltrarNivel(e.target.value)}
                            >
                                <option value="todos">Todos los niveles</option>
                                {Object.entries(NIVEL_LABELS).map(([val, label]) => (
                                    <option key={val} value={val}>{label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#a8a29e]">Facultad Responsable</label>
                            <select
                                className="w-full p-2.5 bg-[#fafaf9] border border-[#e7e5e4] text-sm font-semibold focus:border-[#8B1E1E] outline-none transition-colors"
                                value={filtrarFacultad}
                                onChange={(e) => setFiltrarFacultad(e.target.value)}
                            >
                                <option value="todos">Todas las facultades</option>
                                {facultades.map(f => (
                                    <option key={f.id} value={f.nombre}>{f.nombre}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-end pb-1">
                            <button
                                onClick={() => {
                                    setFiltrarNivel('todos');
                                    setFiltrarFacultad('todos');
                                    setSearchTerm('');
                                }}
                                className="text-xs font-bold text-[#8B1E1E] hover:underline flex items-center gap-1"
                            >
                                <X className="w-3 h-3" /> Limpiar filtros
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Vista de Escritorio: Tabla Sólida y Profesional */}
            {viewMode === 'table' ? (
            <div className="max-w-7xl mx-auto hidden md:block">
                <div className="bg-white border border-[#e7e5e4] shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#fafaf9] border-b border-[#e7e5e4]">
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#a8a29e]">Programa / Código</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#a8a29e]">Facultad</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#a8a29e]">Requisito</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#a8a29e]">Estado</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#a8a29e] text-right">Vinculación</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#a8a29e] text-center">Gestión</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e7e5e4]">
                            {paginatedData.length > 0 ? paginatedData.map((programa) => (
                                <tr key={programa.id} className="hover:bg-[#fafaf9] transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-[#1c1917] group-hover:text-[#8B1E1E] transition-colors">{programa.nombre}</span>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs font-mono text-[#a8a29e]">{programa.codigo || 'S/C'}</span>
                                                <span className="w-1 h-1 bg-[#d6d3d1] rounded-full"></span>
                                                <span className="text-[10px] font-bold text-[#78716c] uppercase tracking-wide">{NIVEL_LABELS[programa.nivel_formacion]}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-xs font-semibold text-[#44403c]">{programa.facultad.nombre}</span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5 text-[#8B1E1E]" strokeWidth={2} />
                                            <span className="text-sm font-semibold text-[#1c1917]">{programa.horas_requeridas}h</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <StatusBadge status={programa.esta_activo ? 'ACTIVO' : 'INACTIVO'} />
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="inline-flex items-center gap-3">
                                            <div className="flex flex-col items-end">
                                                <span className="text-xs font-black text-[#1c1917]">{programa._count.usuarios}</span>
                                                <span className="text-[9px] font-bold text-[#a8a29e] uppercase">Estudiantes</span>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="text-xs font-black text-[#1c1917]">{programa._count.convocatorias}</span>
                                                <span className="text-[9px] font-bold text-[#a8a29e] uppercase">Convocatorias</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center justify-center gap-2">
                                            <Link
                                                href={`/administrador/programas/${programa.id}`}
                                                className="p-2 text-[#78716c] hover:text-[#1c1917] hover:bg-white border border-transparent hover:border-[#e7e5e4] transition-all"
                                                title="Detalles"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </Link>
                                            <button
                                                onClick={() => requestToggle(programa)}
                                                className={`p-2 transition-all border border-transparent hover:border-[#e7e5e4] ${programa.esta_activo ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                                                title={programa.esta_activo ? 'Desactivar' : 'Activar'}
                                            >
                                                <Power className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center">
                                            <BookOpen className="w-12 h-12 text-[#d6d3d1] mb-4" strokeWidth={1} />
                                            <h3 className="text-lg font-bold text-[#44403c]">No se encontraron programas</h3>
                                            <p className="text-[#a8a29e] text-sm">Prueba ajustando los filtros o realiza una nueva búsqueda.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            ) : (
            /* Vista Grid: Tarjetas */
            <div className="max-w-7xl mx-auto hidden md:grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {paginatedData.length > 0 ? paginatedData.map((programa) => (
                    <ProgramaGridCard
                        key={programa.id}
                        programa={programa}
                        onToggle={() => requestToggle(programa)}
                    />
                )) : (
                    <div className="col-span-full py-20 text-center bg-white border-2 border-dashed border-[#e7e5e4] rounded-2xl">
                        <BookOpen className="w-12 h-12 text-[#d6d3d1] mx-auto mb-4" strokeWidth={1} />
                        <h3 className="text-lg font-bold text-[#44403c]">No se encontraron programas</h3>
                        <p className="text-[#a8a29e] text-sm">Prueba ajustando los filtros o realiza una nueva búsqueda.</p>
                    </div>
                )}
            </div>
            )}

            {/* Vista Móvil: Tarjetas Premium */}
            <div className="max-w-7xl mx-auto md:hidden grid grid-cols-1 gap-4">
                {paginatedData.length > 0 ? paginatedData.map((programa) => (
                    <div key={programa.id} className="bg-white border border-[#e7e5e4] shadow-sm p-5 space-y-5">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-base font-black tracking-tight text-[#1c1917] mb-1">{programa.nombre}</h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-mono text-[#a8a29e]">{programa.codigo || 'SIN CÓDIGO'}</span>
                                    <span className="px-2 py-0.5 bg-[#f5f5f4] text-[9px] font-bold text-[#78716c] uppercase rounded">
                                        {NIVEL_LABELS[programa.nivel_formacion]}
                                    </span>
                                </div>
                            </div>
                            <StatusBadge status={programa.esta_activo ? 'ACTIVO' : 'INACTIVO'} />
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#f5f5f4]">
                            <div className="space-y-1">
                                <span className="text-[9px] font-black uppercase text-[#a8a29e] tracking-widest block">Facultad</span>
                                <span className="text-xs font-bold text-[#44403c] line-clamp-1">{programa.facultad.nombre}</span>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[9px] font-black uppercase text-[#a8a29e] tracking-widest block">Requisito</span>
                                <span className="text-xs font-black text-[#8B1E1E]">{programa.horas_requeridas} horas</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-[#fafaf9] rounded">
                            <div className="flex gap-6">
                                <div className="flex flex-col">
                                    <span className="text-sm font-black text-[#1c1917]">{programa._count.usuarios}</span>
                                    <span className="text-[9px] font-bold uppercase text-[#a8a29e]">Usuarios</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-black text-[#1c1917]">{programa._count.convocatorias}</span>
                                    <span className="text-[9px] font-bold uppercase text-[#a8a29e]">Conv.</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Link
                                    href={`/administrador/programas/${programa.id}`}
                                    className="px-3 py-2 bg-white border border-[#e7e5e4] text-[#1c1917] text-xs font-bold shadow-sm"
                                >
                                    Detalles
                                </Link>
                                <button
                                    onClick={() => requestToggle(programa)}
                                    className={`p-2 border ${programa.esta_activo ? 'bg-red-50 border-red-100 text-red-600' : 'bg-green-50 border-green-100 text-green-600'}`}
                                >
                                    <Power className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="bg-white border-2 border-dashed border-[#e7e5e4] p-12 text-center">
                        <BookOpen className="w-10 h-10 text-[#d6d3d1] mx-auto mb-3" strokeWidth={1} />
                        <p className="text-sm font-bold text-[#78716c]">Sin resultados encontrados</p>
                    </div>
                )}
            </div>

            {/* Paginación Profesional */}
            {totalPages > 1 && (
                <div className="max-w-7xl mx-auto mt-10 mb-10 border-t border-[#e7e5e4] pt-8 flex flex-col sm:flex-row items-center justify-between gap-6 px-4">
                    <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a8a29e] mb-1">Registro Institucional</span>
                        <p className="text-xs font-bold text-[#78716c]">
                            Mostrando <span className="text-[#1c1917]">{paginatedData.length}</span> de <span className="text-[#1c1917]">{filteredData.length}</span> programas encontrados
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                setCurrentPage(prev => Math.max(1, prev - 1));
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            disabled={currentPage === 1}
                            className="w-10 h-10 flex items-center justify-center border border-[#e7e5e4] hover:bg-[#fafaf9] disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                            title="Anterior"
                        >
                            <ChevronLeft className="w-4 h-4 text-[#1c1917]" />
                        </button>

                        <div className="flex items-center gap-1.5 px-4 font-mono">
                            <span className="text-sm font-black text-[#1c1917] tracking-tighter">{String(currentPage).padStart(2, '0')}</span>
                            <span className="text-[#d6d3d1] text-xs">/</span>
                            <span className="text-sm font-bold text-[#a8a29e]">{String(totalPages).padStart(2, '0')}</span>
                        </div>

                        <button
                            onClick={() => {
                                setCurrentPage(prev => Math.min(totalPages, prev + 1));
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            disabled={currentPage === totalPages}
                            className="w-10 h-10 flex items-center justify-center border border-[#e7e5e4] hover:bg-[#fafaf9] disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                            title="Siguiente"
                        >
                            <ChevronRight className="w-4 h-4 text-[#1c1917]" />
                        </button>
                    </div>
                </div>
            )}

            <ConfirmDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onConfirm={executeToggle}
                title={selected?.esta_activo ? 'Desactivar Programa' : 'Activar Programa'}
                description={`¿Confirmas ${selected?.esta_activo ? 'desactivar' : 'activar'} el programa "${selected?.nombre}"? Esta acción afectará la vinculación de nuevos estudiantes.`}
                confirmText={selected?.esta_activo ? 'Confirmar Desactivación' : 'Confirmar Activación'}
                type={selected?.esta_activo ? 'danger' : 'info'}
                isLoading={isProcessing}
            />

            <NuevoProgramaModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleNuevoPrograma}
                facultades={facultades}
            />
        </div>
    );
}

// Componente de Tarjeta para Vista Grid
function ProgramaGridCard({ programa, onToggle }: { programa: ProgramaRow; onToggle: () => void }) {
    return (
        <div className="group bg-white border border-[#e7e5e4] rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
            {/* Header */}
            <div className="p-6 flex-1 space-y-4">
                <div className="flex justify-between items-start">
                    <div className="px-3 py-1.5 bg-[#8B1E1E]/10 rounded-lg text-[10px] font-bold text-[#8B1E1E] uppercase tracking-wider">
                        {NIVEL_LABELS[programa.nivel_formacion]}
                    </div>
                    <StatusBadge status={programa.esta_activo ? 'ACTIVO' : 'INACTIVO'} />
                </div>

                {/* Título y Código */}
                <div className="space-y-1">
                    <h3 className="text-lg font-bold text-[#1c1917] leading-tight group-hover:text-[#8B1E1E] transition-colors line-clamp-2 min-h-[3rem]">
                        {programa.nombre}
                    </h3>
                    <p className="text-xs font-mono text-[#a8a29e]">
                        Código: {programa.codigo || 'S/C'}
                    </p>
                </div>

                {/* Facultad */}
                <div className="flex items-center gap-2 text-xs text-[#78716c]">
                    <span className="font-semibold">{programa.facultad.nombre}</span>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#f5f5f4]">
                    <div className="text-center">
                        <p className="text-lg font-black text-[#8B1E1E]">{programa.horas_requeridas}h</p>
                        <p className="text-[9px] font-bold text-[#a8a29e] uppercase tracking-wider">Requisito</p>
                    </div>
                    <div className="text-center border-l border-[#f5f5f4]">
                        <p className="text-lg font-black text-[#1c1917]">{programa._count.usuarios}</p>
                        <p className="text-[9px] font-bold text-[#a8a29e] uppercase tracking-wider">Estudiantes</p>
                    </div>
                    <div className="text-center border-l border-[#f5f5f4]">
                        <p className="text-lg font-black text-[#1c1917]">{programa._count.convocatorias}</p>
                        <p className="text-[9px] font-bold text-[#a8a29e] uppercase tracking-wider">Conv.</p>
                    </div>
                </div>
            </div>

            {/* Actions Footer */}
            <div className="p-4 bg-[#fafaf9] border-t border-[#e7e5e4] flex gap-2">
                <Link
                    href={`/administrador/programas/${programa.id}`}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white border border-[#e7e5e4] rounded-xl text-xs font-bold text-[#1c1917] hover:border-[#8B1E1E] hover:text-[#8B1E1E] transition-all shadow-sm"
                >
                    Detalles
                </Link>
                <button
                    onClick={onToggle}
                    className={`p-2.5 rounded-xl border transition-all shadow-sm ${
                        programa.esta_activo 
                            ? 'bg-red-50 border-red-100 text-red-600 hover:bg-red-100' 
                            : 'bg-green-50 border-green-100 text-green-600 hover:bg-green-100'
                    }`}
                    title={programa.esta_activo ? 'Desactivar' : 'Activar'}
                >
                    <Power className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
