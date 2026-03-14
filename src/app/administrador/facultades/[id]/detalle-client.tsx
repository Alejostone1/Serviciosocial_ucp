'use client';

import React, { useState } from 'react';
import { ArrowLeft, Building2, Users, GraduationCap, Calendar, Clock, TrendingUp, Edit, Trash2, BookOpen } from 'lucide-react';
import { StatusBadge } from '@/components/ui/status-badge';
import { DataTable, ColumnDef } from '@/components/ui/data-table';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { EditarFacultadModal } from '../editar-facultad-modal';
import { toast } from 'sonner';
import { eliminarFacultad } from '../actions';
import Link from 'next/link';

type Facultad = {
    id: string;
    nombre: string;
    codigo: string | null;
    descripcion: string | null;
    decano: string | null;
    correo_contacto: string | null;
    telefono_ext: string | null;
    esta_activo: boolean;
    creado_en: Date;
    actualizado_en: Date;
    programas: Array<{
        id: string;
        nombre: string;
        codigo: string | null;
        nivel_formacion: string;
        horas_requeridas: number;
        esta_activo: boolean;
        _count: {
            usuarios: number;
            convocatorias: number;
        };
    }>;
    _count: {
        programas: number;
    };
};

type Estadisticas = {
    totalProgramas: number;
    programasActivos: number;
    programasInactivos: number;
    totalEstudiantes: number;
    estudiantesActivos: number;
    estudiantesInactivos: number;
    estudiantesPorRol: Array<{ rol: string; cantidad: number }>;
    totalHorasRequeridas: number;
    convocatoriasPorEstado: Array<{ estado: string; cantidad: number }>;
};

export function FacultadDetalleClient({ facultad, estadisticas }: { facultad: Facultad; estadisticas: Estadisticas }) {
    const [activeTab, setActiveTab] = useState<'programas' | 'estadisticas'>('programas');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleEditFacultad = () => {
        setIsEditModalOpen(true);
    };

    const handleDeleteFacultad = () => {
        setIsDeleteDialogOpen(true);
    };

    const confirmDeleteFacultad = async () => {
        setIsProcessing(true);
        const toastId = toast.loading('Eliminando facultad...');
        try {
            await eliminarFacultad(facultad.id);
            toast.success('✅ Facultad eliminada', { 
                id: toastId, 
                description: `'${facultad.nombre}' ha sido eliminada correctamente.` 
            });
            // Redirigir a la lista de facultades
            window.location.href = '/administrador/facultades';
        } catch (e: any) {
            toast.error('Error al eliminar', { 
                id: toastId, 
                description: e.message || 'No se pudo eliminar la facultad.' 
            });
        } finally {
            setIsProcessing(false);
            setIsDeleteDialogOpen(false);
        }
    };

    const handleFacultadActualizada = (facultadActualizada: any) => {
        // Recargar la página para mostrar los datos actualizados
        window.location.reload();
    };

    const programaColumns: ColumnDef<Facultad['programas'][0]>[] = [
        {
            header: 'Programa',
            cell: (item) => (
                <div>
                    <p className="font-bold text-[#1e293b]">{item.nombre}</p>
                    {item.codigo && <p className="text-xs font-mono text-[#94a3b8]">Código: {item.codigo}</p>}
                </div>
            ),
        },
        {
            header: 'Nivel',
            cell: (item) => (
                <span className="text-xs font-semibold px-2 py-1 rounded-md bg-blue-50 text-blue-700">
                    {item.nivel_formacion.replace(/_/g, ' ')}
                </span>
            ),
        },
        {
            header: 'Horas Req.',
            cell: (item) => (
                <span className="font-bold text-[#8B1E1E]">{item.horas_requeridas}h</span>
            ),
        },
        {
            header: 'Estudiantes / Conv.',
            cell: (item) => (
                <div className="flex gap-2 text-xs font-semibold">
                    <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded">{item._count.usuarios} est.</span>
                    <span className="text-green-700 bg-green-50 px-2 py-0.5 rounded">{item._count.convocatorias} conv.</span>
                </div>
            ),
        },
        { header: 'Estado', cell: (item) => <StatusBadge status={item.esta_activo ? 'ACTIVO' : 'INACTIVO'} /> },
        {
            header: 'Acciones',
            cell: (item) => (
                <Link
                    href={`/administrador/programas/${item.id}`}
                    className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                >
                    <BookOpen className="w-3.5 h-3.5" /> Ver detalles
                </Link>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/administrador/facultades"
                    className="flex items-center gap-2 text-[#64748b] hover:text-[#8B1E1E] transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Volver a Facultades
                </Link>
            </div>

            {/* Información Principal */}
            <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl font-bold text-[#1e293b]">{facultad.nombre}</h1>
                            {facultad.codigo && (
                                <span className="text-sm font-mono px-2 py-1 bg-gray-100 text-gray-600 rounded">
                                    {facultad.codigo}
                                </span>
                            )}
                            <StatusBadge status={facultad.esta_activo ? 'ACTIVO' : 'INACTIVO'} />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleEditFacultad}
                            className="flex items-center gap-2 px-3 py-2 bg-[#8B1E1E] text-white rounded-lg hover:bg-[#731919] transition-colors text-sm font-semibold"
                        >
                            <Edit className="w-4 h-4" />
                            Editar
                        </button>
                        <button
                            onClick={handleDeleteFacultad}
                            className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
                        >
                            <Trash2 className="w-4 h-4" />
                            Eliminar
                        </button>
                    </div>
                </div>

                {/* Información Detallada */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h3 className="font-semibold text-[#334155] mb-3">Información General</h3>
                        <div className="space-y-3 text-sm">
                            {facultad.descripcion && (
                                <div>
                                    <span className="text-[#64748b]">Descripción:</span>
                                    <p className="mt-1 text-[#1e293b]">{facultad.descripcion}</p>
                                </div>
                            )}
                            {facultad.decano && (
                                <div>
                                    <span className="text-[#64748b]">Decano(a):</span>
                                    <span className="ml-2 font-medium">{facultad.decano}</span>
                                </div>
                            )}
                            {facultad.correo_contacto && (
                                <div>
                                    <span className="text-[#64748b]">Correo de Contacto:</span>
                                    <span className="ml-2 font-medium">{facultad.correo_contacto}</span>
                                </div>
                            )}
                            {facultad.telefono_ext && (
                                <div>
                                    <span className="text-[#64748b]">Teléfono Extensión:</span>
                                    <span className="ml-2 font-medium">{facultad.telefono_ext}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h3 className="font-semibold text-[#334155] mb-3">Información del Sistema</h3>
                        <div className="space-y-3 text-sm">
                            <div>
                                <span className="text-[#64748b]">Fecha de Creación:</span>
                                <span className="ml-2 font-medium">{new Date(facultad.creado_en).toLocaleDateString()}</span>
                            </div>
                            <div>
                                <span className="text-[#64748b]">Última Actualización:</span>
                                <span className="ml-2 font-medium">{new Date(facultad.actualizado_en).toLocaleDateString()}</span>
                            </div>
                            <div>
                                <span className="text-[#64748b]">Total de Programas:</span>
                                <span className="ml-2 font-bold text-[#8B1E1E]">{facultad._count.programas}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tarjetas de Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg border border-[#e2e8f0] p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <GraduationCap className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-[#1e293b]">{estadisticas.totalProgramas}</p>
                            <p className="text-sm text-[#64748b]">Total Programas</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-[#e2e8f0] p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-50 rounded-lg">
                            <Users className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-[#1e293b]">{estadisticas.totalEstudiantes}</p>
                            <p className="text-sm text-[#64748b]">Total Estudiantes</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-[#e2e8f0] p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#8B1E1E] rounded-lg">
                            <Clock className="w-5 h-5 text-[#8B1E1E]" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-[#1e293b]">{estadisticas.totalHorasRequeridas}</p>
                            <p className="text-sm text-[#64748b]">Total Horas Requeridas</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-[#e2e8f0] p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-50 rounded-lg">
                            <Calendar className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-[#1e293b]">
                                {estadisticas.convocatoriasPorEstado.find(c => c.estado === 'PUBLICADA')?.cantidad || 0}
                            </p>
                            <p className="text-sm text-[#64748b]">Convocatorias Activas</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl border border-[#e2e8f0]">
                <div className="border-b border-[#e2e8f0]">
                    <nav className="flex gap-6 px-6">
                        <button
                            onClick={() => setActiveTab('programas')}
                            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === 'programas'
                                    ? 'border-[#8B1E1E] text-[#8B1E1E]'
                                    : 'border-transparent text-[#64748b] hover:text-[#1e293b]'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <GraduationCap className="w-4 h-4" />
                                Programas ({facultad.programas.length})
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('estadisticas')}
                            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === 'estadisticas'
                                    ? 'border-[#8B1E1E] text-[#8B1E1E]'
                                    : 'border-transparent text-[#64748b] hover:text-[#1e293b]'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" />
                                Estadísticas
                            </div>
                        </button>
                    </nav>
                </div>

                <div className="p-6">
                    {activeTab === 'programas' && (
                        <DataTable
                            columns={programaColumns}
                            data={facultad.programas}
                            searchPlaceholder="Buscar programa..."
                            emptyMessage="No hay programas registrados en esta facultad."
                        />
                    )}

                    {activeTab === 'estadisticas' && (
                        <div className="space-y-6">
                            {/* Estadísticas de Programas */}
                            <div>
                                <h3 className="text-lg font-semibold text-[#1e293b] mb-4">Programas</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-[#f8fafc] rounded-lg p-4">
                                        <div className="text-2xl font-bold text-green-600">{estadisticas.programasActivos}</div>
                                        <div className="text-sm text-[#64748b]">Programas Activos</div>
                                    </div>
                                    <div className="bg-[#f8fafc] rounded-lg p-4">
                                        <div className="text-2xl font-bold text-red-600">{estadisticas.programasInactivos}</div>
                                        <div className="text-sm text-[#64748b]">Programas Inactivos</div>
                                    </div>
                                    <div className="bg-[#f8fafc] rounded-lg p-4">
                                        <div className="text-2xl font-bold text-[#8B1E1E]">{estadisticas.totalHorasRequeridas}</div>
                                        <div className="text-sm text-[#64748b]">Total Horas Requeridas</div>
                                    </div>
                                </div>
                            </div>

                            {/* Estadísticas de Estudiantes */}
                            <div>
                                <h3 className="text-lg font-semibold text-[#1e293b] mb-4">Estudiantes</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-[#f8fafc] rounded-lg p-4">
                                        <h4 className="font-semibold text-[#334155] mb-3">Distribución por Estado</h4>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-[#64748b]">Activos:</span>
                                                <span className="font-bold text-green-600">{estadisticas.estudiantesActivos}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-[#64748b]">Inactivos/Bloqueados:</span>
                                                <span className="font-bold text-red-600">{estadisticas.estudiantesInactivos}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-[#f8fafc] rounded-lg p-4">
                                        <h4 className="font-semibold text-[#334155] mb-3">Distribución por Rol</h4>
                                        <div className="space-y-2">
                                            {estadisticas.estudiantesPorRol.map((item) => (
                                                <div key={item.rol} className="flex justify-between items-center">
                                                    <span className="text-sm text-[#64748b]">{item.rol}:</span>
                                                    <span className="font-bold text-blue-600">{item.cantidad}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Convocatorias por Estado */}
                            <div>
                                <h3 className="text-lg font-semibold text-[#1e293b] mb-4">Convocatorias</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {estadisticas.convocatoriasPorEstado.map((item) => (
                                        <div key={item.estado} className="bg-[#f8fafc] rounded-lg p-3 text-center">
                                            <div className="text-xl font-bold text-[#8B1E1E]">{item.cantidad}</div>
                                            <div className="text-xs text-[#64748b]">{item.estado}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modales */}
            <EditarFacultadModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={handleFacultadActualizada}
                facultad={facultad}
            />

            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={confirmDeleteFacultad}
                title="Eliminar Facultad"
                description={`¿Estás seguro que deseas eliminar la facultad "${facultad.nombre}"? Esta acción no se puede deshacer.`}
                confirmText="Sí, Eliminar"
                type="danger"
                isLoading={isProcessing}
            />
        </div>
    );
}
