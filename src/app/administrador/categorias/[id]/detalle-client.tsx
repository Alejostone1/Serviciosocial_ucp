'use client';

import React, { useState } from 'react';
import { ArrowLeft, Tags, Calendar, Clock, Users, TrendingUp, Edit, Trash2, BookOpen, User } from 'lucide-react';
import { StatusBadge } from '@/components/ui/status-badge';
import { DataTable, ColumnDef } from '@/components/ui/data-table';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { EditarCategoriaModal } from '../editar-categoria-modal';
import { toast } from 'sonner';
import { eliminarCategoria } from '../actions';
import Link from 'next/link';
import * as LucideIcons from 'lucide-react';

type Categoria = {
    id: string;
    nombre: string;
    descripcion: string | null;
    icono: string | null;
    color_hex: string | null;
    esta_activa: boolean;
    creado_en: Date;
    convocatorias: Array<{
        id: string;
        titulo: string;
        estado: string;
        modalidad: string;
        fecha_inicio: Date;
        fecha_fin: Date | null;
        cupo_maximo: number | null;
        cupo_disponible: number | null;
        horas_totales_ofrecidas: number | null;
        publicado_por: string;
        creado_en: Date;
        publicado_en: Date | null;
        actualizado_en: Date;
        publicador: {
            id: string;
            primer_nombre: string;
            primer_apellido: string;
            correo: string;
        };
        programa: {
            id: string;
            nombre: string;
            facultad: {
                nombre: string;
            };
        } | null;
        _count: {
            postulaciones: number;
        };
    }>;
    _count: {
        convocatorias: number;
    };
};

type Estadisticas = {
    totalConvocatorias: number;
    convocatoriasPorEstado: Array<{ estado: string; cantidad: number }>;
    convocatoriasPorModalidad: Array<{ modalidad: string; cantidad: number }>;
    totalPostulaciones: number;
    postulacionesPorEstado: Array<{ estado: string; cantidad: number }>;
    totalHorasOfrecidas: number;
    programasInvolucrados: number;
    publicadoresUnicos: number;
};

export function CategoriaDetalleClient({ categoria, estadisticas }: { categoria: Categoria; estadisticas: Estadisticas }) {
    const [activeTab, setActiveTab] = useState<'convocatorias' | 'estadisticas'>('convocatorias');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleEditCategoria = () => {
        setIsEditModalOpen(true);
    };

    const handleDeleteCategoria = () => {
        setIsDeleteDialogOpen(true);
    };

    const confirmDeleteCategoria = async () => {
        setIsProcessing(true);
        const toastId = toast.loading('Eliminando categoría...');
        try {
            await eliminarCategoria(categoria.id);
            toast.success('✅ Categoría eliminada', { 
                id: toastId, 
                description: `'${categoria.nombre}' ha sido eliminada correctamente.` 
            });
            // Redirigir a la lista de categorías
            window.location.href = '/administrador/categorias';
        } catch (e: any) {
            toast.error('Error al eliminar', { 
                id: toastId, 
                description: e.message || 'No se pudo eliminar la categoría.' 
            });
        } finally {
            setIsProcessing(false);
            setIsDeleteDialogOpen(false);
        }
    };

    const handleCategoriaActualizada = (categoriaActualizada: any) => {
        // Recargar la página para mostrar los datos actualizados
        window.location.reload();
    };

    const convocatoriaColumns: ColumnDef<Categoria['convocatorias'][0]>[] = [
        {
            header: 'Convocatoria',
            cell: (item) => (
                <div>
                    <p className="font-bold text-[#1e293b]">{item.titulo}</p>
                    <p className="text-xs text-[#94a3b8]">{item.modalidad.replace(/_/g, ' ')}</p>
                </div>
            ),
        },
        {
            header: 'Programa',
            cell: (item) => (
                <div>
                    {item.programa ? (
                        <>
                            <p className="font-medium text-[#1e293b]">{item.programa.nombre}</p>
                            <p className="text-xs text-[#64748b]">{item.programa.facultad.nombre}</p>
                        </>
                    ) : (
                        <span className="text-[#94a3b8]">Sin programa asignado</span>
                    )}
                </div>
            ),
        },
        {
            header: 'Estado',
            cell: (item) => <StatusBadge status={item.estado} />,
        },
        {
            header: 'Fechas',
            cell: (item) => (
                <div className="text-xs">
                    <div>Inicio: {new Date(item.fecha_inicio).toLocaleDateString()}</div>
                    {item.fecha_fin && <div>Fin: {new Date(item.fecha_fin).toLocaleDateString()}</div>}
                </div>
            ),
        },
        {
            header: 'Cupos / Post.',
            cell: (item) => (
                <div className="text-xs">
                    {item.cupo_maximo && (
                        <div>
                            {item.cupo_disponible}/{item.cupo_maximo}
                        </div>
                    )}
                    <div className="text-[#94a3b8]">{item._count.postulaciones} postulaciones</div>
                </div>
            ),
        },
        {
            header: 'Horas',
            cell: (item) => (
                <span className="text-sm font-bold text-[#8B1E1E]">
                    {item.horas_totales_ofrecidas ? `${item.horas_totales_ofrecidas}h` : 'N/A'}
                </span>
            ),
        },
        {
            header: 'Publicado por',
            cell: (item) => (
                <div>
                    <p className="font-medium text-[#1e293b]">
                        {item.publicador.primer_nombre} {item.publicador.primer_apellido}
                    </p>
                    <p className="text-xs text-[#64748b]">{item.publicador.correo}</p>
                </div>
            ),
        },
        {
            header: 'Acciones',
            cell: (item) => (
                <Link
                    href={`/administrador/convocatorias/${item.id}`}
                    className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                >
                    <BookOpen className="w-3.5 h-3.5" /> Ver detalles
                </Link>
            ),
        },
    ];

    const IconComponent = categoria.icono ? (LucideIcons as any)[categoria.icono] : Tags;
    const categoryColor = categoria.color_hex || '#8B1E1E';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/administrador/categorias"
                    className="flex items-center gap-2 text-[#64748b] hover:text-[#8B1E1E] transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Volver a Categorías
                </Link>
            </div>

            {/* Información Principal */}
            <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="relative group">
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center border-2 shadow-md shrink-0"
                                    style={{
                                        backgroundColor: categoryColor,
                                        borderColor: categoryColor,
                                        color: 'white'
                                    }}
                                >
                                    {IconComponent ? <IconComponent className="w-6 h-6 drop-shadow-sm" /> : <Tags className="w-6 h-6" />}
                                </div>
                            </div>
                            <h1 className="text-2xl font-bold text-[#1e293b]">{categoria.nombre}</h1>
                            <StatusBadge status={categoria.esta_activa ? 'ACTIVO' : 'INACTIVO'} />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleEditCategoria}
                            className="flex items-center gap-2 px-3 py-2 bg-[#8B1E1E] text-white rounded-lg hover:bg-[#731919] transition-colors text-sm font-semibold"
                        >
                            <Edit className="w-4 h-4" />
                            Editar
                        </button>
                        <button
                            onClick={handleDeleteCategoria}
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
                            {categoria.descripcion && (
                                <div>
                                    <span className="text-[#64748b]">Descripción:</span>
                                    <p className="mt-1 text-[#1e293b]">{categoria.descripcion}</p>
                                </div>
                            )}
                            <div>
                                <span className="text-[#64748b]">Icono:</span>
                                <span className="ml-2 font-medium">{categoria.icono || 'Tags (por defecto)'}</span>
                            </div>
                            <div>
                                <span className="text-[#64748b]">Color:</span>
                                <div className="ml-2 inline-flex items-center gap-2">
                                    <div 
                                        className="w-6 h-6 rounded border border-gray-300"
                                        style={{ backgroundColor: categoryColor }}
                                    />
                                    <span className="font-mono text-xs text-[#64748b]">{categoryColor}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h3 className="font-semibold text-[#334155] mb-3">Información del Sistema</h3>
                        <div className="space-y-3 text-sm">
                            <div>
                                <span className="text-[#64748b]">Fecha de Creación:</span>
                                <span className="ml-2 font-medium">{new Date(categoria.creado_en).toLocaleDateString()}</span>
                            </div>
                            <div>
                                <span className="text-[#64748b]">Total de Convocatorias:</span>
                                <span className="ml-2 font-bold text-[#8B1E1E]">{categoria._count.convocatorias}</span>
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
                            <Calendar className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-[#1e293b]">{estadisticas.totalConvocatorias}</p>
                            <p className="text-sm text-[#64748b]">Total Convocatorias</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-[#e2e8f0] p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-50 rounded-lg">
                            <Users className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-[#1e293b]">{estadisticas.totalPostulaciones}</p>
                            <p className="text-sm text-[#64748b]">Total Postulaciones</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-[#e2e8f0] p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#8B1E1E] rounded-lg">
                            <Clock className="w-5 h-5 text-[#8B1E1E]" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-[#1e293b]">{estadisticas.totalHorasOfrecidas}</p>
                            <p className="text-sm text-[#64748b]">Total Horas Ofrecidas</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-[#e2e8f0] p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-50 rounded-lg">
                            <User className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-[#1e293b]">{estadisticas.publicadoresUnicos}</p>
                            <p className="text-sm text-[#64748b]">Publicadores Únicos</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl border border-[#e2e8f0]">
                <div className="border-b border-[#e2e8f0]">
                    <nav className="flex gap-6 px-6">
                        <button
                            onClick={() => setActiveTab('convocatorias')}
                            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === 'convocatorias'
                                    ? 'border-[#8B1E1E] text-[#8B1E1E]'
                                    : 'border-transparent text-[#64748b] hover:text-[#1e293b]'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Convocatorias ({categoria.convocatorias.length})
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
                    {activeTab === 'convocatorias' && (
                        <DataTable
                            columns={convocatoriaColumns}
                            data={categoria.convocatorias}
                            searchPlaceholder="Buscar convocatoria..."
                            emptyMessage="No hay convocatorias en esta categoría."
                        />
                    )}

                    {activeTab === 'estadisticas' && (
                        <div className="space-y-6">
                            {/* Convocatorias por Estado */}
                            <div>
                                <h3 className="text-lg font-semibold text-[#1e293b] mb-4">Convocatorias por Estado</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {estadisticas.convocatoriasPorEstado.map((item) => (
                                        <div key={item.estado} className="bg-[#f8fafc] rounded-lg p-3 text-center">
                                            <div className="text-xl font-bold text-[#8B1E1E]">{item.cantidad}</div>
                                            <div className="text-xs text-[#64748b]">{item.estado}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Convocatorias por Modalidad */}
                            <div>
                                <h3 className="text-lg font-semibold text-[#1e293b] mb-4">Convocatorias por Modalidad</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {estadisticas.convocatoriasPorModalidad.map((item) => (
                                        <div key={item.modalidad} className="bg-[#f8fafc] rounded-lg p-3 text-center">
                                            <div className="text-xl font-bold text-blue-600">{item.cantidad}</div>
                                            <div className="text-xs text-[#64748b]">{item.modalidad.replace(/_/g, ' ')}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Métricas Adicionales */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-[#f8fafc] rounded-lg p-4">
                                    <h4 className="font-semibold text-[#334155] mb-3">Postulaciones</h4>
                                    <div className="space-y-2">
                                        {estadisticas.postulacionesPorEstado.map((item) => (
                                            <div key={item.estado} className="flex justify-between items-center">
                                                <span className="text-sm text-[#64748b]">{item.estado}:</span>
                                                <span className="font-bold text-blue-600">{item.cantidad}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-[#f8fafc] rounded-lg p-4">
                                    <h4 className="font-semibold text-[#334155] mb-3">Alcance</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-[#64748b]">Programas involucrados:</span>
                                            <span className="font-bold text-purple-600">{estadisticas.programasInvolucrados}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-[#64748b]">Publicadores únicos:</span>
                                            <span className="font-bold text-green-600">{estadisticas.publicadoresUnicos}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modales */}
            <EditarCategoriaModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={handleCategoriaActualizada}
                categoria={categoria}
            />

            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={confirmDeleteCategoria}
                title="Eliminar Categoría"
                description={`¿Estás seguro que deseas eliminar la categoría "${categoria.nombre}"? Esta acción no se puede deshacer.`}
                confirmText="Sí, Eliminar"
                type="danger"
                isLoading={isProcessing}
            />
        </div>
    );
}
