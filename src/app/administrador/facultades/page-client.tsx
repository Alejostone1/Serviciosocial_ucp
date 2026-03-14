'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Search,
    Building2,
    Power,
    Edit3,
    Eye,
    List,
    LayoutGrid,
    ChevronRight,
    Users,
    GraduationCap,
    Mail,
    X,
    ExternalLink,
    PieChart,
    Building,
    Trash2,
    CheckCircle2,
    MoreVertical
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/status-badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { InstitutionalLoader } from '@/components/ui/InstitutionalLoader';
import { toggleFacultad, getFacultadById, eliminarFacultad } from './actions';
import { NuevaFacultadModal } from './nueva-facultad-modal';
import { EditarFacultadModal } from './editar-facultad-modal';
import Link from 'next/link';

type FacultadRow = {
    id: string;
    nombre: string;
    codigo: string | null;
    decano: string | null;
    correo_contacto: string | null;
    esta_activo: boolean;
    _count: { programas: number };
};

export function FacultadesPageClient({ initialData }: { initialData: FacultadRow[] }) {
    const [data, setData] = useState(initialData);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [activeTab, setActiveTab] = useState<'todas' | 'activas' | 'inactivas'>('todas');

    // Modales y Diálogos
    const [isNuevaModalOpen, setIsNuevaModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isToggleDialogOpen, setIsToggleDialogOpen] = useState(false);
    const [isEliminarConfirmOpen, setIsEliminarConfirmOpen] = useState(false);

    // Estado de selección y detalles
    const [selected, setSelected] = useState<FacultadRow | null>(null);
    const [toEdit, setToEdit] = useState<FacultadRow | null>(null);
    const [facultadDetails, setFacultadDetails] = useState<any>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Estados de carga
    const [isProcessing, setIsProcessing] = useState(false);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);

    const filtradas = data.filter(f => {
        const q = searchTerm.toLowerCase();
        const coincide = f.nombre.toLowerCase().includes(q) ||
            (f.codigo && f.codigo.toLowerCase().includes(q)) ||
            (f.decano && f.decano.toLowerCase().includes(q));

        if (activeTab === 'activas') return coincide && f.esta_activo;
        if (activeTab === 'inactivas') return coincide && !f.esta_activo;
        return coincide;
    });

    const stats = {
        total: data.length,
        activas: data.filter(f => f.esta_activo).length,
        totalProgramas: data.reduce((acc, curr) => acc + curr._count.programas, 0)
    };

    const handleToggleStatus = async () => {
        if (!selected) return;
        setIsProcessing(true);
        try {
            await toggleFacultad(selected.id, !selected.esta_activo);
            const updated = data.map(f => f.id === selected.id ? { ...f, esta_activo: !f.esta_activo } : f);
            setData(updated);
            toast.success(`Facultad ${selected.esta_activo ? 'desactivada' : 'activada'}`);
            setIsToggleDialogOpen(false);
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
            await eliminarFacultad(selected.id);
            setData(prev => prev.filter(f => f.id !== selected.id));
            toast.success('Facultad eliminada exitosamente');
            setIsEliminarConfirmOpen(false);
            if (isSidebarOpen) setIsSidebarOpen(false);
        } catch (error: any) {
            toast.error(error.message || 'Error al eliminar');
        } finally {
            setIsProcessing(false);
        }
    };

    const verDetalles = async (fac: FacultadRow) => {
        setSelected(fac);
        setIsSidebarOpen(true);
        setIsLoadingDetails(true);
        try {
            const details = await getFacultadById(fac.id);
            setFacultadDetails(details);
        } catch {
            toast.error('Error al cargar programas');
        } finally {
            setIsLoadingDetails(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

            {/* Header / Hero Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-light text-slate-900 tracking-tight">Gestión de <span className="font-bold border-b-2 border-[#8B1E1E]">Facultades</span></h1>
                    <p className="text-sm font-medium text-slate-400">Administración de unidades académicas y gobernanza institucional.</p>
                </div>
                <button
                    onClick={() => setIsNuevaModalOpen(true)}
                    className="group flex items-center justify-center px-6 py-3 bg-[#8B1E1E] text-white text-sm font-bold rounded-xl shadow-lg hover:shadow-[#8B1E1E]/20 transition-all gap-2 active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    Nueva Facultad
                </button>
            </div>

            {/* Quick Stats Panel */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatBox label="Total Facultades" value={stats.total} icon={<Building2 className="w-5 h-5" />} color="slate" />
                <StatBox label="Facultades Activas" value={stats.activas} icon={<CheckCircle2 className="w-5 h-5" />} color="green" />
                <StatBox label="Programas Académicos" value={stats.totalProgramas} icon={<GraduationCap className="w-5 h-5" />} color="ucp" />
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-200 pb-2">
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                    {[
                        { id: 'todas', label: 'Todas' },
                        { id: 'activas', label: 'Activas' },
                        { id: 'inactivas', label: 'Inactivas' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={cn(
                                "relative px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all",
                                activeTab === tab.id ? "text-[#8B1E1E]" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            {tab.label}
                            {activeTab === tab.id && (
                                <motion.div layoutId="fac-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8B1E1E]" />
                            )}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group lg:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#8B1E1E] transition-colors" />
                        <input
                            type="text"
                            placeholder="Buscar facultad o deccano..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/5 focus:border-[#8B1E1E] transition-all font-light shadow-sm"
                        />
                    </div>

                    <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={cn("p-2 rounded-lg transition-all", viewMode === 'grid' ? "bg-white text-[#8B1E1E] shadow-sm" : "text-slate-400 hover:text-slate-600")}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={cn("p-2 rounded-lg transition-all", viewMode === 'list' ? "bg-white text-[#8B1E1E] shadow-sm" : "text-slate-400 hover:text-slate-600")}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Display */}
            <div className="min-h-[400px]">
                {filtradas.length === 0 ? (
                    <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-[2.5rem]">
                        <Building2 className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400 font-light italic">No se encontraron facultades con los criterios seleccionados.</p>
                    </div>
                ) : (
                    <div className={cn(
                        "grid gap-6 transition-all",
                        viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
                    )}>
                        <AnimatePresence mode="popLayout">
                            {filtradas.map((fac) => (
                                viewMode === 'grid'
                                    ? <FacultadGridCard
                                        key={fac.id}
                                        fac={fac}
                                        onView={() => verDetalles(fac)}
                                        onEdit={() => { setToEdit(fac); setIsEditModalOpen(true); }}
                                        onToggle={() => { setSelected(fac); setIsToggleDialogOpen(true); }}
                                    />
                                    : <FacultadListRow
                                        key={fac.id}
                                        fac={fac}
                                        onView={() => verDetalles(fac)}
                                        onEdit={() => { setToEdit(fac); setIsEditModalOpen(true); }}
                                        onToggle={() => { setSelected(fac); setIsToggleDialogOpen(true); }}
                                    />
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Side Panel for Programs Exploration */}
            <FacultySidePanel
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                data={facultadDetails}
                loading={isLoadingDetails}
                onDelete={() => setIsEliminarConfirmOpen(true)}
                sePuedeEliminar={selected?._count.programas === 0}
            />

            {/* Modals & Dialogs */}
            <ConfirmDialog
                isOpen={isToggleDialogOpen}
                onClose={() => setIsToggleDialogOpen(false)}
                onConfirm={handleToggleStatus}
                title={selected?.esta_activo ? 'Desactivar Facultad' : 'Activar Facultad'}
                description={`¿Confirmas cambiar el estado de "${selected?.nombre}"?`}
                confirmText="Confirmar Acción"
                type={selected?.esta_activo ? 'warning' : 'info'}
                isLoading={isProcessing}
            />

            <ConfirmDialog
                isOpen={isEliminarConfirmOpen}
                onClose={() => setIsEliminarConfirmOpen(false)}
                onConfirm={handleEliminar}
                title="Eliminar Facultad"
                description={`Esta acción es permanente. Solo se permite eliminarlas si no existen registros vinculados.`}
                confirmText="Eliminar Permanentemente"
                type="danger"
                isLoading={isProcessing}
            />

            <NuevaFacultadModal
                isOpen={isNuevaModalOpen}
                onClose={() => setIsNuevaModalOpen(false)}
                onSuccess={(newFac) => {
                    setData(prev => [{ ...newFac, _count: { programas: 0 } }, ...prev]);
                    setIsNuevaModalOpen(false);
                }}
            />

            <EditarFacultadModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                facultad={toEdit}
                onSuccess={(updated) => {
                    setData(prev => prev.map(f => f.id === updated.id ? { ...f, ...updated } : f));
                    setIsEditModalOpen(false);
                }}
            />
        </div>
    );
}

// --- STYLED SUB-COMPONENTS ---

const StatBox = ({ label, value, icon, color }: any) => {
    const variants: any = {
        slate: "bg-slate-50 border-slate-200 text-slate-600",
        green: "bg-green-50 border-green-100 text-green-700",
        ucp: "bg-[#8B1E1E]/5 border-[#8B1E1E]/10 text-[#8B1E1E]",
    };
    return (
        <div className={cn("p-6 rounded-[2rem] border shadow-sm flex items-center justify-between", variants[color])}>
            <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">{label}</p>
                <p className="text-3xl font-black">{value}</p>
            </div>
            <div className="p-4 bg-white rounded-2xl shadow-sm border border-inherit transition-transform hover:scale-105 active:scale-95">
                {icon}
            </div>
        </div>
    );
};

const FacultadGridCard = React.forwardRef<HTMLDivElement, any>(({ fac, onView, onEdit, onToggle }, ref) => {
    return (
        <motion.div
            ref={ref}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="group relative bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden flex flex-col hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
        >
            <div className="p-7 flex-1 space-y-6">
                <div className="flex justify-between items-start">
                    <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl shadow-sm text-[#8B1E1E] group-hover:bg-[#8B1E1E] group-hover:text-white transition-all duration-300">
                        <Building2 className="w-6 h-6" />
                    </div>
                    <StatusBadge status={fac.esta_activo ? 'ACTIVO' : 'INACTIVO'} />
                </div>

                <div className="space-y-3">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 group-hover:text-[#8B1E1E]/40 transition-colors">
                            Cod. {fac.codigo || 'S/N'}
                        </p>
                        <h3 className="text-xl font-bold text-slate-900 leading-tight group-hover:text-[#8B1E1E] transition-colors line-clamp-2 min-h-[3.2rem]">
                            {fac.nombre}
                        </h3>
                    </div>
                    <div className="space-y-1.5 pt-2">
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                            <Users className="w-3.5 h-3.5 text-[#8B1E1E]" />
                            <span className="truncate">{fac.decano || 'No asignado'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-light text-slate-400">
                            <Mail className="w-3.5 h-3.5 text-slate-300" />
                            <span className="truncate">{fac.correo_contacto || 'sin-correo@ucp.edu.co'}</span>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <GraduationCap className="w-4 h-4 text-[#8B1E1E]" />
                        <span>{fac._count.programas} Programas</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-200 group-hover:translate-x-1 group-hover:text-[#8B1E1E] transition-all" />
                </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 flex gap-2">
                <button
                    onClick={onView}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-bold text-slate-700 hover:border-[#8B1E1E] hover:text-[#8B1E1E] transition-all uppercase tracking-widest shadow-sm active:scale-95"
                >
                    <Eye className="w-3.5 h-3.5" /> Explorar
                </button>
                <div className="flex gap-1.5">
                    <button
                        onClick={onEdit}
                        className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-blue-600 transition-all shadow-sm active:scale-95"
                    >
                        <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onToggle}
                        className={cn(
                            "p-3 bg-white border rounded-2xl transition-all shadow-sm active:scale-95",
                            fac.esta_activo ? "text-slate-400 border-slate-200 hover:text-orange-500" : "text-green-500 border-green-100 hover:bg-green-50"
                        )}
                    >
                        <Power className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
});
FacultadGridCard.displayName = 'FacultadGridCard';

const FacultadListRow = React.forwardRef<HTMLDivElement, any>(({ fac, onView, onEdit, onToggle }, ref) => {
    return (
        <motion.div
            ref={ref}
            layout
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="group bg-white border border-slate-100 rounded-3xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-xl hover:border-[#8B1E1E]/10 transition-all"
        >
            <div className="flex items-center gap-6 flex-1 min-w-0">
                <div className="hidden sm:flex w-14 h-14 bg-slate-50 rounded-2xl items-center justify-center text-[#8B1E1E] group-hover:bg-[#8B1E1E] group-hover:text-white transition-all shadow-sm shrink-0">
                    <Building2 className="w-7 h-7" />
                </div>
                <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-1">
                        <h3 className="text-lg font-bold text-slate-900 truncate max-w-md group-hover:text-[#8B1E1E] transition-colors">{fac.nombre}</h3>
                        <StatusBadge status={fac.esta_activo ? 'ACTIVO' : 'INACTIVO'} />
                    </div>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-slate-500 font-light">
                        <div className="flex items-center gap-2"><span className="font-bold text-[#8B1E1E] uppercase text-[9px]">Decano:</span> {fac.decano || 'Pte. Asignación'}</div>
                        <div className="flex items-center gap-2"><span className="font-bold text-slate-300 uppercase text-[9px]">Cod:</span> {fac.codigo || '--'}</div>
                        <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-slate-300" /> {fac.correo_contacto}</div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4 bg-slate-50/50 p-2 rounded-2xl border border-slate-50 md:bg-transparent md:p-0 md:border-0">
                <div className="px-4 border-r border-slate-200 md:text-right hidden sm:block">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Programas</p>
                    <p className="text-xl font-black text-slate-900">{fac._count.programas}</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={onView} className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-[#8B1E1E] uppercase tracking-widest shadow-sm hover:shadow-md active:scale-95 transition-all">
                        Explorar
                    </button>
                    <button onClick={onEdit} className="p-2.5 text-slate-400 hover:text-blue-600 transition-colors"><Edit3 className="w-5 h-5" /></button>
                    <button onClick={onToggle} className={cn("p-2.5 transition-colors", fac.esta_activo ? "text-slate-400 hover:text-orange-500" : "text-green-500")}><Power className="w-5 h-5" /></button>
                </div>
            </div>
        </motion.div>
    );
});
FacultadListRow.displayName = 'FacultadListRow';

const FacultySidePanel = ({ isOpen, onClose, data, loading, onDelete, sePuedeEliminar }: any) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[998]"
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 28, stiffness: 220 }}
                        className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-white shadow-3xl z-[999] overflow-hidden flex flex-col"
                    >
                        {/* Panel Header */}
                        <div className="p-7 border-b border-slate-100 flex items-center justify-between bg-white relative">
                            <div className="space-y-1">
                                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">{data?.nombre || 'Perfil de Facultad'}</h2>
                                <p className="text-xs font-bold text-[#8B1E1E] uppercase tracking-[0.2em] opacity-60">Gobernanza y Estructura</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={onDelete}
                                    disabled={!sePuedeEliminar}
                                    className={cn(
                                        "p-2.5 rounded-xl transition-all border border-transparent",
                                        sePuedeEliminar ? "text-red-500 hover:bg-red-50 hover:border-red-100" : "text-slate-200 cursor-not-allowed opacity-30"
                                    )}
                                    title="Eliminar de forma permanente"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                                <button onClick={onClose} className="p-2.5 bg-slate-50 text-slate-400 hover:text-slate-950 rounded-xl transition-all active:scale-95 shadow-sm">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Panel Content */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {loading ? (
                                <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-40">
                                    <InstitutionalLoader />
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Analizando Organización...</p>
                                </div>
                            ) : (
                                <div className="p-7 space-y-10">
                                    {/* Stats Grid inside panel */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Programas</p>
                                            <p className="text-2xl font-black text-slate-900">{data?.programas?.length || 0}</p>
                                        </div>
                                        <div className="p-5 bg-blue-50/50 rounded-3xl border border-blue-100">
                                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Docencia</p>
                                            <p className="text-2xl font-black text-blue-900">Alta</p>
                                        </div>
                                    </div>

                                    {/* Programs Hierarchy */}
                                    <section className="space-y-5">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                                <GraduationCap className="w-4 h-4 text-[#8B1E1E]" />
                                                Oferta Académica Vinculada
                                            </h4>
                                            <StatusBadge status={data?.esta_activo ? 'DISPONIBLE' : 'LIMITADO'} />
                                        </div>

                                        <div className="space-y-4">
                                            {data?.programas?.length > 0 ? data.programas.map((prog: any) => (
                                                <div key={prog.id} className="group p-5 bg-white border border-slate-200 rounded-[2rem] hover:border-[#8B1E1E]/30 hover:shadow-lg transition-all">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <p className="text-[10px] font-black text-[#8B1E1E] uppercase tracking-tighter mb-1 opacity-60">{prog.nivel_formacion}</p>
                                                            <h5 className="font-bold text-slate-800 group-hover:text-[#8B1E1E] transition-colors">{prog.nombre}</h5>
                                                        </div>
                                                        <StatusBadge status={prog.esta_activo ? 'OPERATIVO' : 'SUSPENDIDO'} />
                                                    </div>
                                                    <div className="flex items-center justify-between text-[11px] font-light text-slate-500 border-t border-slate-50 pt-3">
                                                        <div className="flex items-center gap-4">
                                                            <span>{prog.horas_requeridas}h Req.</span>
                                                            <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 opacity-50" /> {prog._count.usuarios} Est.</div>
                                                        </div>
                                                        <Link
                                                            href={`/administrador/programas?facultad=${data.id}`}
                                                            className="flex items-center gap-1 text-[#8B1E1E] font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            Detalles <ExternalLink className="w-3 h-3" />
                                                        </Link>
                                                    </div>
                                                </div>
                                            )) : (
                                                <div className="py-20 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                                                    <Building className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                                                    <p className="text-slate-400 text-xs italic">No existen programas académicos registrados en esta facultad.</p>
                                                </div>
                                            )}
                                        </div>
                                    </section>
                                </div>
                            )}
                        </div>

                        {/* Panel Footer */}
                        <div className="p-7 bg-slate-900 border-t border-slate-800 text-white">
                            <p className="text-[10px] font-medium italic text-slate-400 text-center tracking-wide leading-relaxed">
                                Los cambios en el núcleo de la facultad impactan la coherencia de todos los programas vinculados. Administre con rigor institucional.
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
