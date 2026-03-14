'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Search,
    Tags,
    Power,
    Edit3,
    Eye,
    ChevronRight,
    FileText,
    Activity,
    PieChart,
    MoreVertical,
    Trash2,
    Calendar,
    Users,
    Clock,
    X,
    Building2,
    ExternalLink
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/status-badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { InstitutionalLoader } from '@/components/ui/InstitutionalLoader';
import { toggleCategoria, getCategoriaById, eliminarCategoria } from './actions';
import { NuevaCategoriaModal } from './nueva-categoria-modal';
import { EditarCategoriaModal } from './editar-categoria-modal';
import Link from 'next/link';

type CategoriaRow = {
    id: string;
    nombre: string;
    descripcion: string | null;
    icono: string | null;
    color_hex: string | null;
    esta_activa: boolean;
    _count: { convocatorias: number };
};

export function CategoriasTableClient({ initialData }: { initialData: CategoriaRow[] }) {
    const [data, setData] = useState(initialData);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'todas' | 'activas' | 'inactivas'>('todas');

    // Modales y Diálogos
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEliminarConfirmOpen, setIsEliminarConfirmOpen] = useState(false);

    // Estado de selección
    const [selected, setSelected] = useState<CategoriaRow | null>(null);
    const [toEdit, setToEdit] = useState<CategoriaRow | null>(null);
    const [categoryDetails, setCategoryDetails] = useState<any>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Estados de carga
    const [isProcessing, setIsProcessing] = useState(false);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);

    const filtradas = data.filter(c => {
        const busqueda = searchTerm.toLowerCase();
        const coincide = c.nombre.toLowerCase().includes(busqueda) ||
            (c.descripcion && c.descripcion.toLowerCase().includes(busqueda));

        if (activeTab === 'activas') return coincide && c.esta_activa;
        if (activeTab === 'inactivas') return coincide && !c.esta_activa;
        return coincide;
    });

    const stats = {
        total: data.length,
        activas: data.filter(c => c.esta_activa).length,
        totalConvocatorias: data.reduce((acc, curr) => acc + curr._count.convocatorias, 0)
    };

    const handleToggleStatus = async () => {
        if (!selected) return;
        setIsProcessing(true);
        try {
            await toggleCategoria(selected.id, !selected.esta_activa);
            const updated = data.map(c => c.id === selected.id ? { ...c, esta_activa: !c.esta_activa } : c);
            setData(updated);
            toast.success(`Categoría ${selected.esta_activa ? 'desactivada' : 'activada'}`);
            setIsDialogOpen(false);
        } catch {
            toast.error('Error al actualizar estado');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleEliminar = async () => {
        if (!selected) return;
        setIsProcessing(true);
        try {
            await eliminarCategoria(selected.id);
            setData(prev => prev.filter(c => c.id !== selected.id));
            toast.success('Categoría eliminada exitosamente');
            setIsEliminarConfirmOpen(false);
            if (isSidebarOpen) setIsSidebarOpen(false);
        } catch (error: any) {
            toast.error(error.message || 'Error al eliminar');
        } finally {
            setIsProcessing(false);
        }
    };

    const verDetalles = async (cat: CategoriaRow) => {
        setSelected(cat);
        setIsSidebarOpen(true);
        setIsLoadingDetails(true);
        try {
            const details = await getCategoriaById(cat.id);
            setCategoryDetails(details);
        } catch {
            toast.error('Error al cargar convocatorias');
        } finally {
            setIsLoadingDetails(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">

            {/* Header Profesional */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-3xl font-light text-slate-900 tracking-tight">Estructura de <span className="font-bold border-b-2 border-[#8B1E1E]">Categorías</span></h1>
                    <p className="text-sm font-medium text-slate-400">Taxonomía del impacto social y académico de la institución.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="group relative overflow-hidden inline-flex items-center justify-center px-6 py-3 bg-[#8B1E1E] text-white text-sm font-bold rounded-xl shadow-lg hover:shadow-[#8B1E1E]/20 transition-all gap-2 active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    Nueva Categoría
                </button>
            </div>

            {/* Panel de Estadísticas Rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard label="Total Clasificaciones" value={stats.total} icon={<Tags className="w-5 h-5" />} color="slate" />
                <StatCard label="Categorías Operativas" value={stats.activas} icon={<Activity className="w-5 h-5" />} color="green" />
                <StatCard label="Convocatorias Vinculadas" value={stats.totalConvocatorias} icon={<FileText className="w-5 h-5" />} color="ucp" />
            </div>

            {/* Controles de Búsqueda y Filtros */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-200 pb-2">
                <div className="flex items-center gap-1">
                    {['todas', 'activas', 'inactivas'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={cn(
                                "relative px-5 py-3 text-xs font-bold uppercase tracking-widest transition-all",
                                activeTab === tab ? "text-[#8B1E1E]" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            {tab}
                            {activeTab === tab && (
                                <motion.div layoutId="cat-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8B1E1E]" />
                            )}
                        </button>
                    ))}
                </div>
                <div className="relative group lg:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#8B1E1E] transition-colors" />
                    <input
                        type="text"
                        placeholder="Filtrar categorías..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/5 focus:border-[#8B1E1E] transition-all font-light shadow-sm"
                    />
                </div>
            </div>

            {/* Grid de Categorías (Smart Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 min-h-[400px]">
                <AnimatePresence mode="popLayout">
                    {filtradas.map((cat) => (
                        <CategoryCard
                            key={cat.id}
                            cat={cat}
                            onView={() => verDetalles(cat)}
                            onEdit={() => { setToEdit(cat); setIsEditModalOpen(true); }}
                            onToggle={() => { setSelected(cat); setIsDialogOpen(true); }}
                        />
                    ))}
                </AnimatePresence>
                {filtradas.length === 0 && (
                    <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 rounded-3xl">
                        <p className="text-slate-400 font-light italic text-sm">No se encontraron categorías en esta sección.</p>
                    </div>
                )}
            </div>

            {/* Side Panel de Convocatorias (SORPRENDENTE) */}
            <SidePanel
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                title={selected?.nombre || ''}
                loading={isLoadingDetails}
                data={categoryDetails}
                onDelete={() => { setIsEliminarConfirmOpen(true); }}
                sePuedeEliminar={selected?._count.convocatorias === 0}
            />

            {/* Diálogos y Modales */}
            <ConfirmDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onConfirm={handleToggleStatus}
                title={selected?.esta_activa ? 'Desactivar Categoría' : 'Activar Categoría'}
                description={`¿Deseas cambiar el estado de "${selected?.nombre}"?`}
                confirmText="Confirmar Cambio"
                type={selected?.esta_activa ? 'warning' : 'info'}
                isLoading={isProcessing}
            />

            <ConfirmDialog
                isOpen={isEliminarConfirmOpen}
                onClose={() => setIsEliminarConfirmOpen(false)}
                onConfirm={handleEliminar}
                title="Eliminar Categoría"
                description={`Esta acción eliminará "${selected?.nombre}" permanentemente. Solo es posible si no tiene vinculaciones.`}
                confirmText="Eliminar Definitivamente"
                type="danger"
                isLoading={isProcessing}
            />

            <NuevaCategoriaModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={(newCat) => {
                    setData(prev => [{ ...newCat, _count: { convocatorias: 0 } }, ...prev]);
                    setIsModalOpen(false);
                }}
            />

            <EditarCategoriaModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                categoria={toEdit}
                onSuccess={(updated) => {
                    setData(prev => prev.map(c => c.id === updated.id ? { ...c, ...updated } : c));
                    setIsEditModalOpen(false);
                }}
            />
        </div>
    );
}

// --- SUBCOMPONENTES ESTILIZADOS ---

const StatCard = ({ label, value, icon, color }: any) => {
    const colors: any = {
        slate: "bg-slate-50 border-slate-200 text-slate-600",
        green: "bg-green-50 border-green-100 text-green-700",
        ucp: "bg-[#8B1E1E]/5 border-[#8B1E1E]/10 text-[#8B1E1E]",
    };
    return (
        <div className={cn("p-5 rounded-2xl border shadow-sm flex items-center justify-between", colors[color])}>
            <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">{label}</p>
                <p className="text-3xl font-black">{value}</p>
            </div>
            <div className="p-3 bg-white rounded-xl shadow-sm border border-inherit">
                {icon}
            </div>
        </div>
    );
};

const CategoryCard = React.forwardRef<HTMLDivElement, any>(({ cat, onView, onEdit, onToggle }, ref) => {
    const IconComponent = cat.icono ? (LucideIcons as any)[cat.icono] : LucideIcons.Tags;
    const catColor = cat.color_hex || '#8B1E1E';

    return (
        <motion.div
            ref={ref}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="group relative bg-white border border-slate-200 rounded-[2rem] overflow-hidden flex flex-col hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
        >
            <div className="p-7 flex-1 space-y-6">
                <div className="flex justify-between items-start">
                    <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:rotate-12"
                        style={{ backgroundColor: catColor }}
                    >
                        {IconComponent ? <IconComponent className="w-6 h-6" /> : <Tags className="w-6 h-6" />}
                    </div>
                    <StatusBadge status={cat.esta_activa ? 'ACTIVO' : 'INACTIVO'} />
                </div>

                <div className="space-y-2">
                    <h3 className="text-lg font-bold text-slate-900 leading-tight group-hover:text-[#8B1E1E] transition-colors line-clamp-1">{cat.nombre}</h3>
                    <p className="text-xs font-light text-slate-500 line-clamp-3 leading-relaxed min-h-[3rem]">
                        {cat.descripcion || 'Sin descripción detallada.'}
                    </p>
                </div>

                <div className="flex items-center gap-2 pt-2 text-[10px] font-bold text-[#8B1E1E] uppercase tracking-widest border-t border-slate-50">
                    <PieChart className="w-3 h-3" />
                    <span>{cat._count.convocatorias} Convocatorias Vinc.</span>
                </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-2">
                <button
                    onClick={onView}
                    className="flex items-center justify-center gap-2 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-bold text-slate-700 hover:border-[#8B1E1E] hover:text-[#8B1E1E] transition-all uppercase tracking-widest shadow-sm"
                >
                    <Eye className="w-3.5 h-3.5" /> Explorar
                </button>
                <div className="flex items-center gap-1">
                    <button
                        onClick={onEdit}
                        className="flex-1 flex items-center justify-center py-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 transition-all shadow-sm"
                    >
                        <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={onToggle}
                        className={cn(
                            "flex-1 flex items-center justify-center py-2.5 bg-white border rounded-xl transition-all shadow-sm",
                            cat.esta_activa ? "text-slate-400 border-slate-200 hover:text-orange-500" : "text-green-500 border-green-100 hover:bg-green-50"
                        )}
                    >
                        <Power className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
});
CategoryCard.displayName = 'CategoryCard';

const SidePanel = ({ isOpen, onClose, title, loading, data, onDelete, sePuedeEliminar }: any) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[998]"
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-white shadow-2xl z-[999] overflow-hidden flex flex-col"
                    >
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">{title}</h2>
                                <p className="text-xs text-slate-400 font-medium">Radiografía de vinculación social</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={onDelete}
                                    disabled={!sePuedeEliminar}
                                    className={cn(
                                        "p-2.5 rounded-xl transition-all",
                                        sePuedeEliminar ? "text-red-500 hover:bg-red-50 hover:text-red-700" : "text-slate-200 cursor-not-allowed"
                                    )}
                                    title="Eliminar Categoría"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                                <button onClick={onClose} className="p-2.5 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-xl transition-all">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                            {loading ? (
                                <div className="h-full flex flex-col items-center justify-center opacity-50">
                                    <InstitutionalLoader />
                                    <p className="mt-4 text-[10px] font-bold uppercase tracking-widest animate-pulse">Analizando dependencias...</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <section>
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Convocatorias Vinculadas ({data?.convocatorias?.length || 0})</h4>
                                        <div className="space-y-3">
                                            {data?.convocatorias?.length > 0 ? data.convocatorias.map((conv: any) => (
                                                <div key={conv.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-[#8B1E1E]/20 transition-all group">
                                                    <div className="flex justify-between items-start gap-3">
                                                        <div className="space-y-1 flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <StatusBadge status={conv.estado} />
                                                                <span className="text-[9px] font-black text-slate-400 uppercase truncate">{conv.id}</span>
                                                            </div>
                                                            <h5 className="text-sm font-bold text-slate-800">{conv.titulo}</h5>
                                                            <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 font-light">
                                                                <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-[#8B1E1E]" /> {new Date(conv.fecha_inicio).toLocaleDateString()}</div>
                                                                <div className="flex items-center gap-1.5"><Hourglass className="w-3.5 h-3.5 text-[#8B1E1E]" /> {conv.horas_totales_ofrecidas}h</div>
                                                                <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-[#8B1E1E]" /> {conv._count.postulaciones} post.</div>
                                                            </div>
                                                        </div>
                                                        <Link
                                                            href={`/administrador/convocatorias/${conv.id}`}
                                                            className="p-2 bg-white rounded-lg text-slate-400 hover:text-[#8B1E1E] shadow-sm border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <ExternalLink className="w-4 h-4" />
                                                        </Link>
                                                    </div>
                                                </div>
                                            )) : (
                                                <div className="py-10 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                                    <p className="text-slate-400 text-xs italic">Esta categoría aún no tiene convocatorias activas.</p>
                                                </div>
                                            )}
                                        </div>
                                    </section>
                                </div>
                            )}
                        </div>

                        <div className="p-6 bg-slate-50 border-t border-slate-100">
                            <p className="text-[10px] text-slate-400 font-medium italic text-center">La eliminación de categorías solo se permite si no existen rastros históricos de vinculación académica.</p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

const Hourglass = ({ className }: { className?: string }) => (
    <LucideIcons.Hourglass className={className} />
);
