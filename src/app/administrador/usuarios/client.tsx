'use client';

import React, { useState, useEffect } from 'react';
import { DataTable, ColumnDef } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { 
    Lock, Unlock, Eye, Pencil, Trash2, Power, AlertCircle, 
    ShieldCheck, ArrowRight, UserPlus, LayoutGrid, List, Mail, Contact, FileSpreadsheet
} from 'lucide-react';
import { toast } from 'sonner';
import { eliminarUsuario, cambiarEstadoUsuario } from './actions';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { btn } from '@/lib/btn-variants';
import { cn } from '@/lib/utils';
import { TipoDocumento } from '@prisma/client';

const NuevoUsuarioModal = dynamic(() => import('./nuevo-usuario-modal').then(mod => mod.NuevoUsuarioModal), {
    ssr: false,
    loading: () => <div className="h-20 animate-pulse bg-slate-50 flex items-center justify-center rounded-xl border border-dashed border-slate-200 text-xs text-slate-400">Preparando formulario...</div>
});

const EditarUsuarioModal = dynamic(() => import('./editar-usuario-modal').then(mod => mod.EditarUsuarioModal), {
    ssr: false,
    loading: () => <div className="h-20 animate-pulse bg-slate-50 flex items-center justify-center rounded-xl border border-dashed border-slate-200 text-xs text-slate-400">Preparando editor...</div>
});

const CargaMasivaModal = dynamic(() => import('./carga-masiva-modal').then(mod => mod.CargaMasivaModal), {
    ssr: false,
});

type UsuarioRow = {
    id: string;
    primer_nombre: string;
    segundo_nombre?: string | null;
    primer_apellido: string;
    segundo_apellido?: string | null;
    correo: string;
    telefono?: string | null;
    rol: string;
    estado: 'ACTIVO' | 'BLOQUEADO' | 'DESACTIVADO';
    esta_bloqueado: boolean;
    motivo_bloqueo: string | null;
    ultimo_acceso: Date | null;
    tipo_documento: TipoDocumento;
    numero_documento: string;
    programa?: { nombre: string } | null;
    vinculaciones?: { programa: { nombre: string } }[];
};

type Programa = { id: string; nombre: string; nivel_formacion: string };

export function UsuariosTableClient({
    initialData,
    programas,
}: {
    initialData: any[];
    programas: Programa[];
}) {
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [data, setData] = useState<UsuarioRow[]>(initialData as UsuarioRow[]);
    const [filteredData, setFilteredData] = useState<UsuarioRow[]>(
        (initialData as UsuarioRow[]).filter(u => u.estado === 'ACTIVO')
    );
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCargaMasivaOpen, setIsCargaMasivaOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<UsuarioRow | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<UsuarioRow | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const [showEstadoDialog, setShowEstadoDialog] = useState(false);
    const [userToChangeEstado, setUserToChangeEstado] = useState<UsuarioRow | null>(null);
    const [nuevoEstado, setNuevoEstado] = useState<'ACTIVO' | 'BLOQUEADO' | 'DESACTIVADO'>('ACTIVO');
    const [motivoBloqueo, setMotivoBloqueo] = useState('');
    const [activeTab, setActiveTab] = useState<'activos' | 'inactivos'>('activos');

    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        rol: 'TODOS',
        programa: 'TODOS',
        estado: 'TODOS'
    });
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        const fetchCount = async () => {
            try {
                const res = await fetch('/api/administrador/solicitudes-perfil/count');
                if (res.ok) {
                    const d = await res.json();
                    setPendingCount(d.count);
                }
            } catch (err) {}
        };
        fetchCount();
        const interval = setInterval(fetchCount, 1000 * 60 * 5);
        return () => clearInterval(interval);
    }, []);

    const applyFiltersWithData = (query: string, f: typeof filters, tab: 'activos' | 'inactivos', currentData: UsuarioRow[]) => {
        const q = query.toLowerCase();
        let filtered = currentData.filter(u =>
            u.correo.toLowerCase().includes(q) ||
            u.primer_nombre.toLowerCase().includes(q) ||
            u.primer_apellido.toLowerCase().includes(q) ||
            u.numero_documento.includes(q)
        );

        if (tab === 'activos') {
            filtered = filtered.filter(u => u.estado === 'ACTIVO');
        } else {
            filtered = filtered.filter(u => u.estado === 'BLOQUEADO' || u.estado === 'DESACTIVADO');
        }

        if (f.rol !== 'TODOS') {
            filtered = filtered.filter(u => u.rol === f.rol);
        }

        if (f.programa !== 'TODOS') {
             filtered = filtered.filter(u => {
                const progName = u.programa?.nombre || u.vinculaciones?.[0]?.programa?.nombre;
                return progName === f.programa;
             });
        }

        setFilteredData(filtered);
    };

    const applyFilters = (query: string, f: typeof filters, tab: 'activos' | 'inactivos' = activeTab) => {
        applyFiltersWithData(query, f, tab, data);
    };

    const handleTabChange = (tab: 'activos' | 'inactivos') => {
        setActiveTab(tab);
        applyFilters(searchQuery, filters, tab);
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        applyFilters(query, filters);
    };

    const handleNuevoUsuario = (newUser: any) => window.location.reload();
    
    const handleEditarUsuario = (usuario: UsuarioRow) => {
        setUserToEdit(usuario);
        setIsEditModalOpen(true);
    };

    const handleUsuarioActualizado = (updatedUser: any) => {
        const newData = data.map(u => u.id === updatedUser.id ? { ...u, ...updatedUser } : u);
        setData(newData);
        applyFiltersWithData(searchQuery, filters, activeTab, newData);
        setIsEditModalOpen(false);
    };

    const confirmarEliminar = (usuario: UsuarioRow) => {
        setUserToDelete(usuario);
        setIsDeleteDialogOpen(true);
    };

    const ejecutarEliminar = async () => {
        if (!userToDelete) return;
        setIsProcessing(true);
        try {
            await eliminarUsuario(userToDelete.id);
            const newData = data.filter(u => u.id !== userToDelete.id);
            setData(newData);
            applyFiltersWithData(searchQuery, filters, activeTab, newData);
            toast.success('Usuario eliminado');
        } catch {
            toast.error('Error al eliminar');
        } finally {
            setIsProcessing(false);
            setIsDeleteDialogOpen(false);
            setUserToDelete(null);
        }
    };

    const confirmarCambioEstado = (usuario: UsuarioRow, estado: 'ACTIVO' | 'BLOQUEADO' | 'DESACTIVADO') => {
        setUserToChangeEstado(usuario);
        setNuevoEstado(estado);
        setShowEstadoDialog(true);
    };

    const ejecutarCambioEstado = async () => {
        if (!userToChangeEstado) return;
        setIsProcessing(true);
        try {
            await cambiarEstadoUsuario(userToChangeEstado.id, nuevoEstado, motivoBloqueo);
            const newData = data.map(u => u.id === userToChangeEstado.id ? { ...u, estado: nuevoEstado, esta_bloqueado: nuevoEstado !== 'ACTIVO', motivo_bloqueo: motivoBloqueo || null } : u);
            setData(newData);
            applyFiltersWithData(searchQuery, filters, activeTab, newData);
            toast.success(`Usuario ${nuevoEstado.toLowerCase()}`);
        } catch {
            toast.error('Error al cambiar estado');
        } finally {
            setIsProcessing(false);
            setShowEstadoDialog(false);
            setMotivoBloqueo('');
        }
    };

    const columns: ColumnDef<UsuarioRow>[] = [
        {
            header: 'Nombre Completo',
            cell: (item) => (
                <div className="flex flex-col">
                    <span className="font-bold text-[#1e293b]">{item.primer_nombre} {item.primer_apellido}</span>
                    <span className="text-xs text-[#64748b]">{item.correo}</span>
                </div>
            ),
            sortable: true,
        },
        { header: 'Identificación', accessorKey: 'numero_documento' },
        { header: 'Tipo', cell: (item) => <StatusBadge status={item.rol} /> },
        {
            header: 'Institución / Programa',
            cell: (item) => {
                const progName = item.programa?.nombre || item.vinculaciones?.[0]?.programa?.nombre || '—';
                return (
                    <span className="text-xs text-[#475569] max-w-[200px] truncate inline-block">
                        {progName}
                    </span>
                );
            },
        },
        { header: 'Estado', cell: (item) => <StatusBadge status={item.estado} /> },
        {
            header: 'Acciones',
            cell: (item) => (
                <div className="flex items-center gap-1">
                    <button className={btn.iconAction} onClick={() => handleEditarUsuario(item)} title="Editar"><Pencil className="w-4 h-4" /></button>
                    {item.estado !== 'DESACTIVADO' && <button className={btn.iconAction} onClick={() => confirmarCambioEstado(item, 'DESACTIVADO')} title="Desactivar"><Power className="w-4 h-4 text-slate-300" /></button>}
                    {item.estado !== 'BLOQUEADO' && <button className={btn.iconDanger} onClick={() => confirmarCambioEstado(item, 'BLOQUEADO')} title="Bloquear"><Lock className="w-4 h-4" /></button>}
                    {item.estado !== 'ACTIVO' && <button className={btn.iconSuccess} onClick={() => confirmarCambioEstado(item, 'ACTIVO')} title="Activar/Desbloquear"><Unlock className="w-4 h-4" /></button>}
                    <button className={btn.iconDanger} onClick={() => confirmarEliminar(item)} title="Eliminar"><Trash2 className="w-4 h-4" /></button>
                    <Link href={`/administrador/usuarios/${item.id}`} className={btn.iconView} title="Ver Detalle"><Eye className="w-4 h-4" /></Link>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6 pb-12">
            <div className="border-b border-stone-200 pb-6">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
                    <div>
                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.25em] mb-2">Administración Central</p>
                        <h1 className="text-3xl font-bold text-stone-900 tracking-tight">Directorio Institucional</h1>
                        <p className="text-sm text-stone-500 mt-2">Gestión fidedigna de usuarios y credenciales académicas</p>
                    </div>

                    <div className="flex w-full lg:w-auto items-center gap-3">
                        <div className="bg-stone-100 p-1 rounded-xl flex items-center gap-1 border border-stone-200">
                            <button onClick={() => setViewMode('table')} className={cn("p-1.5 rounded-lg transition-all", viewMode === 'table' ? "bg-white text-[#8B1E1E] shadow-sm" : "text-stone-400 hover:text-stone-600")}><List className="w-4 h-4" /></button>
                            <button onClick={() => setViewMode('grid')} className={cn("p-1.5 rounded-lg transition-all", viewMode === 'grid' ? "bg-white text-[#8B1E1E] shadow-sm" : "text-stone-400 hover:text-stone-600")}><LayoutGrid className="w-4 h-4" /></button>
                        </div>
                        <Link href="/administrador/solicitudes-perfil" className={cn("flex items-center gap-3 px-5 py-2.5 rounded-xl border font-bold text-sm transition-all shadow-sm", pendingCount > 0 ? "bg-[#8B1E1E]/5 border-[#8B1E1E]/20 text-[#8B1E1E] hover:bg-[#8B1E1E]/10" : "bg-white border-stone-200 text-stone-400 opacity-60 hover:opacity-100")}>
                            <ShieldCheck className="w-4 h-4" />
                            {pendingCount > 0 && <span className="flex items-center gap-2">{pendingCount} Pendientes <div className="w-2 h-2 rounded-full bg-[#8B1E1E] animate-pulse" /></span>}
                        </Link>
                        <button onClick={() => setIsCargaMasivaOpen(true)} className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-md hover:shadow-emerald-900/10"><FileSpreadsheet className="w-4 h-4" /> Carga Masiva</button>
                        <button onClick={() => setIsModalOpen(true)} className="px-6 py-2.5 bg-[#8B1E1E] text-white rounded-xl font-bold text-sm hover:bg-[#721818] transition-all flex items-center gap-2 shadow-md hover:shadow-red-900/10"><UserPlus className="w-4 h-4" /> Nuevo</button>
                    </div>
                </div>
            </div>

            {pendingCount > 0 && (
                <div className="p-5 bg-amber-50 border border-amber-200 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-center gap-4 text-amber-700">
                        <div className="p-3 bg-white rounded-2xl shadow-sm"><AlertCircle className="w-5 h-5" /></div>
                        <div className="space-y-1">
                            <p className="text-sm font-bold">Solicitudes de cambio bajo revisión</p>
                            <p className="text-xs font-medium opacity-80">Hay {pendingCount} estudiantes esperando validación de identidad.</p>
                        </div>
                    </div>
                    <Link href="/administrador/solicitudes-perfil" className="flex items-center gap-2 px-6 py-2.5 bg-amber-600 text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-amber-700 transition-all group">Gestionar ahora <ArrowRight className="w-3 h-3 group-hover:translate-x-1" /></Link>
                </div>
            )}

            <div className="bg-white rounded-xl border border-stone-200 p-1">
                <div className="flex gap-1">
                    <button onClick={() => handleTabChange('activos')} className={cn("flex-1 px-4 py-3 rounded-lg font-bold text-sm transition-all", activeTab === 'activos' ? "bg-[#8B1E1E] text-white shadow-lg" : "bg-stone-50 text-stone-500 hover:bg-stone-100")}>Comunidad Activa ({data.filter(u => u.estado === 'ACTIVO').length})</button>
                    <button onClick={() => handleTabChange('inactivos')} className={cn("flex-1 px-4 py-3 rounded-lg font-bold text-sm transition-all", activeTab === 'inactivos' ? "bg-[#8B1E1E] text-white shadow-lg" : "bg-stone-50 text-stone-500 hover:bg-stone-100")}>Restringidos / Otros ({data.filter(u => u.estado !== 'ACTIVO').length})</button>
                </div>
            </div>

            {viewMode === 'table' ? (
                <div className="bg-white rounded-[2rem] border border-stone-200 overflow-hidden shadow-sm">
                    <DataTable columns={columns} data={filteredData} onSearch={handleSearch} searchPlaceholder="Buscar en el directorio..." />
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-stone-400"><Mail className="w-4 h-4" /></div>
                        <input type="text" placeholder="Filtrar comunidad por nombre o correo..." className="w-full pl-11 pr-4 py-3.5 bg-white border border-stone-200 rounded-[1.5rem] text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/10 focus:border-[#8B1E1E] transition-all shadow-sm" value={searchQuery} onChange={(e) => handleSearch(e.target.value)} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredData.length > 0 ? filteredData.map((u) => (
                            <div key={u.id} className="bg-white p-6 rounded-[2.5rem] border border-stone-200 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4"><StatusBadge status={u.estado} className="text-[10px]" /></div>
                                <div className="flex flex-col h-full">
                                    <div className="mb-4">
                                        <h3 className="font-bold text-stone-900 line-clamp-1">{u.primer_nombre} {u.primer_apellido}</h3>
                                        <div className="flex items-center gap-2 mt-1"><StatusBadge status={u.rol} className="scale-75 origin-left" /></div>
                                    </div>
                                    <div className="space-y-3 flex-grow">
                                        <div className="flex items-center gap-3 text-stone-500 text-sm">
                                            <div className="p-2 bg-stone-50 rounded-xl"><Mail className="w-4 h-4" /></div>
                                            <span className="truncate">{u.correo}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-stone-500 text-sm">
                                            <div className="p-2 bg-stone-50 rounded-xl"><Contact className="w-4 h-4" /></div>
                                            <span>{u.numero_documento}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-stone-500 text-sm">
                                            <div className="p-2 bg-stone-50 rounded-xl text-[#8B1E1E]"><ShieldCheck className="w-4 h-4" /></div>
                                            <span className="font-medium text-stone-700 truncate">{u.programa?.nombre || u.vinculaciones?.[0]?.programa?.nombre || 'General / No Asignado'}</span>
                                        </div>
                                    </div>
                                    <div className="mt-6 pt-5 border-t border-stone-100 flex items-center justify-between gap-1">
                                        <div className="flex items-center gap-1">
                                            <button className={btn.iconAction} onClick={() => handleEditarUsuario(u)} title="Editar"><Pencil className="w-4 h-4" /></button>
                                            {u.estado !== 'DESACTIVADO' && <button className={btn.iconAction} onClick={() => confirmarCambioEstado(u, 'DESACTIVADO')} title="Desactivar"><Power className="w-4 h-4 text-slate-300" /></button>}
                                            {u.estado !== 'BLOQUEADO' && <button className={btn.iconDanger} onClick={() => confirmarCambioEstado(u, 'BLOQUEADO')} title="Bloquear"><Lock className="w-4 h-4" /></button>}
                                            {u.estado !== 'ACTIVO' && <button className={btn.iconSuccess} onClick={() => confirmarCambioEstado(u, 'ACTIVO')} title="Activar"><Unlock className="w-4 h-4" /></button>}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button className={btn.iconDanger} onClick={() => confirmarEliminar(u)} title="Eliminar"><Trash2 className="w-4 h-4" /></button>
                                            <Link href={`/administrador/usuarios/${u.id}`} className={btn.iconView} title="Ver"><Eye className="w-4 h-4" /></Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full py-20 text-center bg-stone-50 rounded-[3rem] border border-dashed border-stone-200">
                                <p className="text-stone-400 font-medium">No se encontraron usuarios fidedignos en esta categoría.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <EditarUsuarioModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSuccess={handleUsuarioActualizado} programas={programas} usuario={userToEdit} />
            <NuevoUsuarioModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={handleNuevoUsuario} programas={programas} />
            <CargaMasivaModal isOpen={isCargaMasivaOpen} onClose={() => setIsCargaMasivaOpen(false)} onSuccess={() => window.location.reload()} />
            <ConfirmDialog isOpen={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)} onConfirm={ejecutarEliminar} title="Eliminar Registro" description={`¿Deseas eliminar permanentemente a ${userToDelete?.correo}?`} confirmText="Sí, Eliminar" type="danger" isLoading={isProcessing} />
            <ConfirmDialog isOpen={showEstadoDialog} onClose={() => setShowEstadoDialog(false)} onConfirm={ejecutarCambioEstado} title={`Cambiar a ${nuevoEstado}`} description={`¿Confirmas cambiar el estado de acceso para ${userToChangeEstado?.correo}?`} confirmText="Sí, Procede" type="warning" isLoading={isProcessing} />
        </div>
    );
}
