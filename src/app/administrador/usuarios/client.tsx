'use client';

import React, { useState } from 'react';
import { DataTable, ColumnDef } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Lock, Unlock, Eye, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { toggleBloqueoUsuario } from './actions';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { NuevoUsuarioModal } from './nuevo-usuario-modal';
import { EditarUsuarioModal } from './editar-usuario-modal';
import Link from 'next/link';
import { btn } from '@/lib/btn-variants';
import * as XLSX from 'xlsx';
import { Filter, X, FileSpreadsheet, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';

type UsuarioRow = {
    id: string;
    primer_nombre: string;
    primer_apellido: string;
    correo: string;
    rol: string;
    esta_bloqueado: boolean;
    ultimo_acceso: Date | null;
    numero_documento: string;
    programa: { nombre: string } | null;
};

type Programa = { id: string; nombre: string; nivel_formacion: string };

export function UsuariosTableClient({
    initialData,
    programas,
}: {
    initialData: UsuarioRow[];
    programas: Programa[];
}) {
    const [data, setData] = useState(initialData);
    const [filteredData, setFilteredData] = useState(initialData);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UsuarioRow | null>(null);
    const [userToEdit, setUserToEdit] = useState<UsuarioRow | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        rol: 'TODOS',
        programa: 'TODOS',
        estado: 'TODOS'
    });
    const [showFilters, setShowFilters] = useState(false);

    const applyFilters = (query: string, f: typeof filters) => {
        const q = query.toLowerCase();
        let filtered = data.filter(u =>
            u.correo.toLowerCase().includes(q) ||
            u.primer_nombre.toLowerCase().includes(q) ||
            u.primer_apellido.toLowerCase().includes(q) ||
            u.numero_documento.includes(q)
        );

        if (f.rol !== 'TODOS') {
            filtered = filtered.filter(u => u.rol === f.rol);
        }

        if (f.programa !== 'TODOS') {
            filtered = filtered.filter(u => u.programa?.nombre === f.programa);
        }

        if (f.estado !== 'TODOS') {
            if (f.estado === 'BLOQUEADO') filtered = filtered.filter(u => u.esta_bloqueado);
            if (f.estado === 'ACTIVO') filtered = filtered.filter(u => !u.esta_bloqueado);
        }

        setFilteredData(filtered);
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        applyFilters(query, filters);
    };

    const handleFilterChange = (key: keyof typeof filters, value: string) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        applyFilters(searchQuery, newFilters);
    };

    const clearFilters = () => {
        const defaultFilters = { rol: 'TODOS', programa: 'TODOS', estado: 'TODOS' };
        setFilters(defaultFilters);
        applyFilters(searchQuery, defaultFilters);
    };

    const exportToExcel = () => {
        const toastId = toast.loading('Preparando archivo Excel...');
        try {
            const exportData = filteredData.map(u => ({
                'Nombre Completo': `${u.primer_nombre} ${u.primer_apellido}`,
                'Correo Electrónico': u.correo,
                'Nro Documento': u.numero_documento,
                'Rol': u.rol,
                'Programa Académico': u.programa?.nombre || 'N/A',
                'Estado': u.esta_bloqueado ? 'BLOQUEADO' : 'ACTIVO',
                'Último Acceso': u.ultimo_acceso ? new Date(u.ultimo_acceso).toLocaleString() : 'Nunca'
            }));

            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Usuarios_UCP");
            XLSX.writeFile(wb, `Reporte_Usuarios_UCP_${new Date().toISOString().split('T')[0]}.xlsx`);
            toast.success('Excel descargado correctamente', { id: toastId });
        } catch (error) {
            console.error(error);
            toast.error('Error al exportar a Excel', { id: toastId });
        }
    };

    const confirmarToggleBloqueo = (usuario: UsuarioRow) => {
        setSelectedUser(usuario);
        setIsDialogOpen(true);
    };

    const ejecutarToggleBloqueo = async () => {
        if (!selectedUser) return;
        setIsProcessing(true);
        const nuevoEstado = !selectedUser.esta_bloqueado;
        try {
            await toggleBloqueoUsuario(selectedUser.id, nuevoEstado);
            const newData = data.map(u => u.id === selectedUser.id ? { ...u, esta_bloqueado: nuevoEstado } : u);
            setData(newData);
            setFilteredData(newData);
            toast.success(nuevoEstado ? 'Usuario Bloqueado' : 'Usuario Desbloqueado', {
                description: `El acceso de ${selectedUser.correo} ha sido ${nuevoEstado ? 'revocado' : 'restaurado'}.`,
            });
        } catch {
            toast.error('Error al actualizar', { description: 'Verifica tus permisos o conexión.' });
        } finally {
            setIsProcessing(false);
            setIsDialogOpen(false);
        }
    };

    const handleNuevoUsuario = (newUser: any) => {
        const row: UsuarioRow = {
            id: newUser.id,
            primer_nombre: newUser.primer_nombre,
            primer_apellido: newUser.primer_apellido,
            correo: newUser.correo,
            rol: newUser.rol,
            esta_bloqueado: false,
            ultimo_acceso: null,
            numero_documento: newUser.numero_documento,
            programa: newUser.programa || null,
        };
        setData(prev => [row, ...prev]);
        setFilteredData(prev => [row, ...prev]);
        setIsModalOpen(false);
        // Recargar la página para asegurar que los datos se actualicen correctamente
        window.location.reload();
    };

    const handleEditarUsuario = (usuario: UsuarioRow) => {
        setUserToEdit(usuario);
        setIsEditModalOpen(true);
    };

    const handleUsuarioActualizado = (updatedUser: any) => {
        const newData = data.map(u => u.id === updatedUser.id ? { ...u, ...updatedUser } : u);
        setData(newData);
        setFilteredData(newData);
        setIsEditModalOpen(false);
    };

    const columns: ColumnDef<UsuarioRow>[] = [
        {
            header: 'Nombre',
            cell: (item) => (
                <div className="flex flex-col">
                    <span className="font-bold text-[#1e293b]">{item.primer_nombre} {item.primer_apellido}</span>
                    <span className="text-xs text-[#64748b]">{item.correo}</span>
                </div>
            ),
            sortable: true,
        },
        { header: 'Identificación', accessorKey: 'numero_documento' },
        { header: 'Rol', cell: (item) => <StatusBadge status={item.rol} /> },
        {
            header: 'Programa',
            cell: (item) => (
                <span className="text-xs text-[#475569] max-w-[200px] truncate inline-block" title={item.programa?.nombre || 'N/A'}>
                    {item.programa?.nombre || '—'}
                </span>
            ),
        },
        { header: 'Estado', cell: (item) => <StatusBadge status={item.esta_bloqueado ? 'BLOQUEADO' : 'ACTIVO'} /> },
        {
            header: 'Acciones',
            cell: (item) => (
                <div className="flex items-center gap-1">
                    <button
                        className={btn.iconAction}
                        onClick={() => handleEditarUsuario(item)}
                        title="Editar usuario"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button
                        className={item.esta_bloqueado ? btn.iconSuccess : btn.iconDanger}
                        onClick={() => confirmarToggleBloqueo(item)}
                        title={item.esta_bloqueado ? 'Desbloquear' : 'Bloquear'}
                    >
                        {item.esta_bloqueado
                            ? <Unlock className="w-4 h-4" />
                            : <Lock className="w-4 h-4" />}
                    </button>
                    <Link
                        href={`/administrador/usuarios/${item.id}`}
                        prefetch={false}
                        className={btn.iconView}
                        title="Ver detalle"
                    >
                        <Eye className="w-4 h-4" />
                    </Link>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6 pb-12">
            {/* Header & Main Actions */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-[#1e293b] tracking-tight">Gestión de Usuarios</h1>
                    <p className="text-[#64748b] text-sm mt-1 font-medium">Administración estratégica de talento humano, roles y accesos institucionales.</p>
                </div>
                <div className="flex w-full lg:w-auto items-center gap-2">
                    <button
                        onClick={exportToExcel}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-bold text-sm hover:bg-emerald-100 transition-all active:scale-95"
                    >
                        <FileSpreadsheet className="w-4 h-4" />
                        <span>Exportar Excel</span>
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[#8B1E1E] text-white rounded-xl font-bold text-sm hover:bg-[#721818] transition-all shadow-md active:scale-95"
                    >
                        <UserPlus className="w-4 h-4" />
                        <span>Nuevo Usuario</span>
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all font-bold text-sm",
                            showFilters ? "bg-slate-100 border-slate-300 text-slate-900" : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        )}
                    >
                        <Filter className="w-4 h-4" />
                        {showFilters ? 'Ocultar Filtros' : 'Filtros Avanzados'}
                    </button>

                    {showFilters && (
                        <>
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <select
                                    className="px-3 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/10"
                                    value={filters.rol}
                                    onChange={(e) => handleFilterChange('rol', e.target.value)}
                                >
                                    <option value="TODOS">Todos los Roles</option>
                                    <option value="ADMINISTRADOR">Administrador</option>
                                    <option value="PROFESOR">Profesor</option>
                                    <option value="AUXILIAR">Auxiliar</option>
                                    <option value="ALIADO">Aliado</option>
                                    <option value="ESTUDIANTE">Estudiante</option>
                                </select>

                                <select
                                    className="px-3 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/10"
                                    value={filters.programa}
                                    onChange={(e) => handleFilterChange('programa', e.target.value)}
                                >
                                    <option value="TODOS">Todos los Programas</option>
                                    <option value="SIN_ASIGNAR">Sin Asignar</option>
                                    {programas.map(p => (
                                        <option key={p.id} value={p.nombre}>{p.nombre}</option>
                                    ))}
                                </select>

                                <select
                                    className="px-3 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/10"
                                    value={filters.estado}
                                    onChange={(e) => handleFilterChange('estado', e.target.value)}
                                >
                                    <option value="TODOS">Todos los Estados</option>
                                    <option value="ACTIVO">Activos</option>
                                    <option value="BLOQUEADO">Bloqueados</option>
                                </select>
                            </div>
                            <button
                                onClick={clearFilters}
                                className="flex items-center justify-center gap-2 px-4 py-2 text-slate-400 hover:text-red-600 transition-colors text-xs font-bold uppercase tracking-wider"
                            >
                                <X className="w-4 h-4" />
                                Limpiar
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Content: Desktop Table & Mobile Cards */}
            <div className="hidden lg:block">
                <DataTable
                    columns={columns}
                    data={filteredData}
                    onSearch={handleSearch}
                    searchPlaceholder="Buscar por nombre, correo o documento..."
                />
            </div>

            <div className="lg:hidden space-y-4">
                <div className="relative mb-4">
                    <input
                        type="text"
                        placeholder="Buscar usuarios..."
                        className="w-full px-4 py-3 pl-11 bg-white border border-slate-200 rounded-2xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/10"
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>

                {filteredData.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
                        <p className="text-slate-400 font-medium">No se encontraron usuarios con estos filtros.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredData.map(u => (
                            <div key={u.id} className="bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-900 text-base">{u.primer_nombre} {u.primer_apellido}</span>
                                        <span className="text-xs text-slate-500 font-medium">{u.correo}</span>
                                    </div>
                                    <StatusBadge status={u.rol} />
                                </div>
                                <div className="grid grid-cols-2 gap-4 border-y border-slate-50 py-3">
                                    <div>
                                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Identificación</p>
                                        <p className="text-xs text-slate-700 font-bold">{u.numero_documento}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Estado</p>
                                        <StatusBadge status={u.esta_bloqueado ? 'BLOQUEADO' : 'ACTIVO'} />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Programa</p>
                                    <p className="text-xs text-slate-700 font-medium truncate">{u.programa?.nombre || 'General'}</p>
                                </div>
                                <div className="flex justify-end gap-3 pt-2">
                                    <Link href={`/administrador/usuarios/${u.id}`} className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-50 text-slate-600 rounded-xl font-bold text-xs">
                                        <Eye className="w-4 h-4" />
                                        Ver Perfil
                                    </Link>
                                    <button onClick={() => handleEditarUsuario(u)} className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl">
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => confirmarToggleBloqueo(u)}
                                        className={cn(
                                            "p-2.5 rounded-xl",
                                            u.esta_bloqueado ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                                        )}
                                    >
                                        {u.esta_bloqueado ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modals & Dialogs */}
            <ConfirmDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onConfirm={ejecutarToggleBloqueo}
                title={selectedUser?.esta_bloqueado ? 'Desbloquear Usuario' : 'Bloquear Usuario'}
                description={`¿Estás seguro que deseas ${selectedUser?.esta_bloqueado ? 'desbloquear' : 'bloquear'} la cuenta de ${selectedUser?.correo}?`}
                confirmText={selectedUser?.esta_bloqueado ? 'Sí, Desbloquear' : 'Sí, Bloquear'}
                type={selectedUser?.esta_bloqueado ? 'info' : 'warning'}
                isLoading={isProcessing}
            />

            <NuevoUsuarioModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleNuevoUsuario}
                programas={programas}
            />

            <EditarUsuarioModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={handleUsuarioActualizado}
                programas={programas}
                usuario={userToEdit}
            />
        </div>
    );
}
