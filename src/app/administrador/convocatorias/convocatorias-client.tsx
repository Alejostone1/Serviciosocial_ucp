'use client';

import React from 'react';
import { useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { FormModal } from '@/components/ui/form-modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { toast } from 'sonner';
import { Plus, Edit3, Trash2, Power, Users, Calendar, Clock, Megaphone, MapPin, Globe, Filter, Eye } from 'lucide-react';
import { NuevaConvocatoriaModal } from './nueva-convocatoria-modal';
import { EditarConvocatoriaModal } from './editar-convocatoria-modal';
import { crearConvocatoria, actualizarConvocatoria, cambiarEstadoConvocatoria, eliminarConvocatoria, getOpcionesConvocatoria, getConvocatoriaById } from './convocatorias-actions';
import { StatusBadge } from '@/components/ui/status-badge';
import { EstadoConvocatoria } from '@/types';
import Link from 'next/link';

type ConvocatoriaRow = {
    id: string;
    titulo: string;
    descripcion: string;
    objetivo: string | null;
    modalidad: 'PRESENCIAL' | 'VIRTUAL' | 'HIBRIDA';
    lugar: string | null;
    url_convocatoria_externa: string | null;
    competencias_requeridas: string[];
    estado: EstadoConvocatoria;
    fecha_inicio: string;
    fecha_fin: string | null;
    fecha_cierre_postulacion: string | null;
    cupo_maximo: number | null;
    cupo_disponible: number | null;
    horas_totales_ofrecidas: number | null;
    url_banner: string | null;
    url_documento_adicional: string | null;
    requiere_entrevista: boolean;
    creado_en: string;
    publicado_en: string | null;
    actualizado_en: string;
    publicado_por: string;
    id_categoria: string | null;
    id_programa: string | null;
    publicador: {
        id: string;
        primer_nombre: string;
        primer_apellido: string;
        correo: string;
        rol: string;
    };
    categoria: {
        id: string;
        nombre: string;
        icono: string | null;
        color_hex: string | null;
    } | null;
    programa: {
        id: string;
        nombre: string;
        codigo: string | null;
        facultad: {
            id: string;
            nombre: string;
        };
    } | null;
    _count: {
        postulaciones: number;
        actividades: number;
        certificados: number;
    };
};

interface Props {
    initialData: ConvocatoriaRow[];
    estadisticas: any;
}

export function ConvocatoriasAdminClient({ initialData, estadisticas }: Props) {
    const [data, setData] = useState(initialData);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [toEdit, setToEdit] = useState<ConvocatoriaRow | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEstadoModalOpen, setIsEstadoModalOpen] = useState(false);
    const [selected, setSelected] = useState<ConvocatoriaRow | null>(null);
    const [nuevoEstado, setNuevoEstado] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [filter, setFilter] = useState('todos');

    const handleNuevaConvocatoria = (newConv: any) => {
        const formattedConv: ConvocatoriaRow = {
            ...newConv,
            fecha_inicio: typeof newConv.fecha_inicio === 'string' ? newConv.fecha_inicio : newConv.fecha_inicio.toISOString(),
            fecha_fin: newConv.fecha_fin ? (typeof newConv.fecha_fin === 'string' ? newConv.fecha_fin : newConv.fecha_fin.toISOString()) : null,
            fecha_cierre_postulacion: newConv.fecha_cierre_postulacion ? (typeof newConv.fecha_cierre_postulacion === 'string' ? newConv.fecha_cierre_postulacion : newConv.fecha_cierre_postulacion.toISOString()) : null,
            creado_en: typeof newConv.creado_en === 'string' ? newConv.creado_en : newConv.creado_en.toISOString(),
            publicado_en: newConv.publicado_en ? (typeof newConv.publicado_en === 'string' ? newConv.publicado_en : newConv.publicado_en.toISOString()) : null,
            actualizado_en: typeof newConv.actualizado_en === 'string' ? newConv.actualizado_en : newConv.actualizado_en.toISOString(),
            _count: { postulaciones: 0, actividades: 0, certificados: 0 }
        };
        setData(prev => [formattedConv, ...prev]);
        setIsModalOpen(false);
    };

    const handleEditar = (convocatoria: ConvocatoriaRow) => {
        setToEdit(convocatoria);
        setIsEditModalOpen(true);
    };

    const handleConvocatoriaActualizada = (updated: any) => {
        const formattedUpdated: ConvocatoriaRow = {
            ...updated,
            ...selected, // Mantener los datos que no vienen en la actualización
            fecha_inicio: typeof updated.fecha_inicio === 'string' ? updated.fecha_inicio : updated.fecha_inicio.toISOString(),
            fecha_fin: updated.fecha_fin ? (typeof updated.fecha_fin === 'string' ? updated.fecha_fin : updated.fecha_fin.toISOString()) : null,
            fecha_cierre_postulacion: updated.fecha_cierre_postulacion ? (typeof updated.fecha_cierre_postulacion === 'string' ? updated.fecha_cierre_postulacion : updated.fecha_cierre_postulacion.toISOString()) : null,
            creado_en: typeof updated.creado_en === 'string' ? updated.creado_en : updated.creado_en.toISOString(),
            publicado_en: updated.publicado_en ? (typeof updated.publicado_en === 'string' ? updated.publicado_en : updated.publicado_en.toISOString()) : null,
            actualizado_en: typeof updated.actualizado_en === 'string' ? updated.actualizado_en : updated.actualizado_en.toISOString(),
            _count: selected?._count || { postulaciones: 0, actividades: 0, certificados: 0 }
        };
        setData(prev => prev.map(c => c.id === updated.id ? formattedUpdated : c));
        setIsEditModalOpen(false);
    };

    const requestEstadoChange = (convocatoria: ConvocatoriaRow) => {
        setSelected(convocatoria);
        setNuevoEstado(convocatoria.estado); // Preseleccionar el estado actual
        setIsEstadoModalOpen(true);
    };

    const executeEstadoChange = async () => {
        if (!selected || !nuevoEstado) return;
        
        setIsProcessing(true);
        const toastId = toast.loading('Actualizando estado...');

        try {
            const actualizada = await cambiarEstadoConvocatoria(selected.id, nuevoEstado as EstadoConvocatoria);
            
            // Formatear la respuesta actualizada con todos los datos necesarios
            const formattedActualizada: ConvocatoriaRow = {
                id: actualizada.id,
                titulo: actualizada.titulo,
                descripcion: actualizada.descripcion,
                objetivo: actualizada.objetivo,
                modalidad: actualizada.modalidad,
                lugar: actualizada.lugar,
                url_convocatoria_externa: actualizada.url_convocatoria_externa,
                competencias_requeridas: actualizada.competencias_requeridas,
                estado: actualizada.estado, // ESTE ES EL CAMPO CLAVE - ACTUALIZADO DESDE BD
                fecha_inicio: typeof actualizada.fecha_inicio === 'string' ? actualizada.fecha_inicio : actualizada.fecha_inicio.toISOString(),
                fecha_fin: actualizada.fecha_fin ? (typeof actualizada.fecha_fin === 'string' ? actualizada.fecha_fin : actualizada.fecha_fin.toISOString()) : null,
                fecha_cierre_postulacion: actualizada.fecha_cierre_postulacion ? (typeof actualizada.fecha_cierre_postulacion === 'string' ? actualizada.fecha_cierre_postulacion : actualizada.fecha_cierre_postulacion.toISOString()) : null,
                cupo_maximo: actualizada.cupo_maximo,
                cupo_disponible: actualizada.cupo_disponible,
                horas_totales_ofrecidas: actualizada.horas_totales_ofrecidas ? Number(actualizada.horas_totales_ofrecidas) : null,
                url_banner: actualizada.url_banner,
                url_documento_adicional: actualizada.url_documento_adicional,
                requiere_entrevista: actualizada.requiere_entrevista,
                creado_en: typeof actualizada.creado_en === 'string' ? actualizada.creado_en : actualizada.creado_en.toISOString(),
                publicado_en: actualizada.publicado_en ? (typeof actualizada.publicado_en === 'string' ? actualizada.publicado_en : actualizada.publicado_en.toISOString()) : null,
                actualizado_en: typeof actualizada.actualizado_en === 'string' ? actualizada.actualizado_en : actualizada.actualizado_en.toISOString(),
                publicado_por: actualizada.publicado_por,
                id_categoria: actualizada.id_categoria,
                id_programa: actualizada.id_programa,
                publicador: actualizada.publicador, // USAR DATOS ACTUALIZADOS DEL SERVIDOR
                categoria: actualizada.categoria,
                programa: actualizada.programa,
                _count: selected?._count || { postulaciones: 0, actividades: 0, certificados: 0 }
            };
            
            // Actualizar el estado local con los datos actualizados
            setData(prev => prev.map(c => c.id === selected.id ? formattedActualizada : c));
            
            toast.success('Estado actualizado', {
                id: toastId,
                description: `La convocatoria ahora está ${nuevoEstado}`
            });
        } catch (error: any) {
            console.error('Error al cambiar estado:', error);
            toast.error('Error al actualizar', {
                id: toastId,
                description: error.message || 'Intenta de nuevo'
            });
        } finally {
            setIsProcessing(false);
            setIsEstadoModalOpen(false);
        }
    };

    const requestEliminar = (convocatoria: ConvocatoriaRow) => {
        if (convocatoria.estado !== 'BORRADOR') {
            toast.error('Solo se pueden eliminar convocatorias en estado BORRADOR');
            return;
        }
        setSelected(convocatoria);
        setIsDialogOpen(true);
    };

    const executeEliminar = async () => {
        if (!selected) return;
        
        setIsProcessing(true);
        const toastId = toast.loading('Eliminando convocatoria...');

        try {
            await eliminarConvocatoria(selected.id);
            setData(prev => prev.filter(c => c.id !== selected.id));
            
            toast.success('Convocatoria eliminada', {
                id: toastId,
                description: `'${selected.titulo}' ha sido eliminada`
            });
        } catch (error: any) {
            toast.error('Error al eliminar', {
                id: toastId,
                description: error.message || 'Intenta de nuevo'
            });
        } finally {
            setIsProcessing(false);
            setIsDialogOpen(false);
        }
    };

    const getEstadoColor = (estado: string) => {
        switch (estado) {
            case 'BORRADOR': return 'bg-gray-100 text-gray-700';
            case 'PUBLICADA': return 'bg-blue-100 text-blue-700';
            case 'EN_CURSO': return 'bg-green-100 text-green-700';
            case 'CERRADA': return 'bg-yellow-100 text-yellow-700';
            case 'CANCELADA': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getModalidadIcon = (modalidad: string) => {
        switch (modalidad) {
            case 'PRESENCIAL': return <MapPin className="w-4 h-4" />;
            case 'VIRTUAL': return <Globe className="w-4 h-4" />;
            case 'HIBRIDA': return <Users className="w-4 h-4" />;
            default: return <MapPin className="w-4 h-4" />;
        }
    };

    const filteredData = data.filter(convocatoria => {
        if (filter === 'todos') return true;
        return convocatoria.estado === filter;
    });

    const columns = [
        {
            header: 'Convocatoria',
            cell: (item: ConvocatoriaRow) => (
                <div className="space-y-3">
                    <div className="flex items-start gap-3">
                        <div className="p-2.5 rounded-lg bg-[#8B1E1E]/10 flex-shrink-0">
                            <Megaphone className="w-5 h-5 text-[#8B1E1E]" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-[#1e293b] text-sm leading-tight">{item.titulo}</h3>
                            <p className="text-xs text-[#64748b] line-clamp-2 mt-1">{item.descripcion}</p>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                {item.categoria && (
                                    <span 
                                        className="text-xs px-2 py-1 rounded-full text-white font-medium"
                                        style={{ backgroundColor: item.categoria.color_hex || '#8B1E1E' }}
                                    >
                                        {item.categoria.nombre}
                                    </span>
                                )}
                                {item.programa && (
                                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-md font-medium">
                                        {item.programa.nombre}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ),
            sortable: true,
            responsive: true // Oculta en móvil, se muestra en vista detallada
        },
        {
            header: 'Modalidad',
            cell: (item: ConvocatoriaRow) => (
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-md bg-blue-50">
                            {getModalidadIcon(item.modalidad)}
                        </div>
                        <span className="text-sm font-semibold text-[#1e293b]">{item.modalidad}</span>
                    </div>
                    {item.lugar && (
                        <div className="flex items-center gap-1 text-xs text-[#64748b]">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate" title={item.lugar}>{item.lugar}</span>
                        </div>
                    )}
                    {item.url_convocatoria_externa && (
                        <div className="flex items-center gap-1 text-xs text-blue-600">
                            <Globe className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">Virtual</span>
                        </div>
                    )}
                </div>
            ),
            sortable: true,
            responsive: true // Oculta en móvil
        },
        {
            header: 'Fechas',
            cell: (item: ConvocatoriaRow) => (
                <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 bg-green-50 rounded-md">
                        <Calendar className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <div className="min-w-0">
                            <span className="text-xs font-medium text-green-800">Inicio:</span>
                            <div className="text-xs text-green-700 font-semibold">
                                {new Date(item.fecha_inicio).toLocaleDateString('es-CO')}
                            </div>
                        </div>
                    </div>
                    {item.fecha_fin && (
                        <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-md">
                            <Clock className="w-4 h-4 text-blue-600 flex-shrink-0" />
                            <div className="min-w-0">
                                <span className="text-xs font-medium text-blue-800">Fin:</span>
                                <div className="text-xs text-blue-700 font-semibold">
                                    {new Date(item.fecha_fin).toLocaleDateString('es-CO')}
                                </div>
                            </div>
                        </div>
                    )}
                    {item.fecha_cierre_postulacion && (
                        <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-md">
                            <Calendar className="w-4 h-4 text-orange-600 flex-shrink-0" />
                            <div className="min-w-0">
                                <span className="text-xs font-medium text-orange-800">Cierre:</span>
                                <div className="text-xs text-orange-700 font-semibold">
                                    {new Date(item.fecha_cierre_postulacion).toLocaleDateString('es-CO')}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ),
            responsive: true // Oculta en móvil
        },
        {
            header: 'Cupo',
            cell: (item: ConvocatoriaRow) => (
                <div className="space-y-2">
                    {item.cupo_maximo && (
                        <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-md">
                            <Users className="w-4 h-4 text-purple-600 flex-shrink-0" />
                            <div className="min-w-0">
                                <span className="text-xs font-medium text-purple-800">Cupo:</span>
                                <div className="text-sm font-bold text-purple-700">
                                    {item.cupo_disponible || 0} / {item.cupo_maximo}
                                </div>
                            </div>
                        </div>
                    )}
                    {item.horas_totales_ofrecidas && (
                        <div className="flex items-center gap-2 p-2 bg-indigo-50 rounded-md">
                            <Clock className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                            <div className="min-w-0">
                                <span className="text-xs font-medium text-indigo-800">Horas:</span>
                                <div className="text-sm font-bold text-indigo-700">
                                    {item.horas_totales_ofrecidas}h
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                        <Users className="w-4 h-4 text-gray-600 flex-shrink-0" />
                        <div className="min-w-0">
                            <span className="text-xs font-medium text-gray-800">Postulaciones:</span>
                            <div className="text-sm font-bold text-gray-700">
                                {item._count?.postulaciones || 0}
                            </div>
                        </div>
                    </div>
                </div>
            ),
            responsive: true // Oculta en móvil
        },
        {
            header: 'Estado',
            cell: (item: ConvocatoriaRow) => (
                <button
                    onClick={() => requestEstadoChange(item)}
                    className="group cursor-pointer"
                    title="Click para cambiar estado"
                >
                    <StatusBadge 
                        status={item.estado}
                        className={`${getEstadoColor(item.estado)} group-hover:scale-105 transition-transform cursor-pointer`}
                    />
                </button>
            ),
            sortable: true
        },
        {
            header: 'Publicado por',
            cell: (item: ConvocatoriaRow) => (
                <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 bg-[#8B1E1E]/5 rounded-md">
                        <div className="w-8 h-8 bg-[#8B1E1E] rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-bold">
                                {item.publicador.primer_nombre.charAt(0)}{item.publicador.primer_apellido.charAt(0)}
                            </span>
                        </div>
                        <div className="min-w-0">
                            <div className="text-sm font-semibold text-[#1e293b] truncate">
                                {item.publicador.primer_nombre} {item.publicador.primer_apellido}
                            </div>
                            <div className="text-xs text-[#64748b] truncate">
                                {item.publicador.correo}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-[#64748b] px-2">
                        <Calendar className="w-3 h-3 flex-shrink-0" />
                        <span>{new Date(item.creado_en).toLocaleDateString('es-CO')}</span>
                    </div>
                </div>
            ),
            sortable: true,
            responsive: true // Oculta en móvil
        },
        {
            header: 'Acciones',
            cell: (item: ConvocatoriaRow) => (
                <div className="flex items-center gap-3 py-2">
                    <Link
                        href={`/administrador/convocatorias/${item.id}`}
                        className="p-1.5 rounded-lg text-[#94a3b8] hover:text-[#8B1E1E] hover:bg-[#8B1E1E]/8 border border-transparent hover:border-[#8B1E1E]/20 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/20"
                        title="Ver detalles"
                    >
                        <Eye className="w-4 h-4" />
                    </Link>
                    <button
                        onClick={() => handleEditar(item)}
                        className="group relative px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all duration-200 flex items-center gap-2 min-w-[100px]"
                        title="Editar convocatoria"
                    >
                        <Edit3 className="w-5 h-5 text-gray-600 group-hover:text-emerald-600 transition-colors" />
                        <span className="text-sm font-semibold text-gray-600 group-hover:text-emerald-600 transition-colors">
                            Editar
                        </span>
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                    
                    <button
                        onClick={() => requestEstadoChange(item)}
                        className="group relative px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-amber-500 hover:bg-amber-50 transition-all duration-200 flex items-center gap-2 min-w-[100px]"
                        title="Cambiar estado de la convocatoria"
                    >
                        <Power className="w-5 h-5 text-gray-600 group-hover:text-amber-600 transition-colors" />
                        <span className="text-sm font-semibold text-gray-600 group-hover:text-amber-600 transition-colors">
                            Cambiar
                        </span>
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>

                    {item.estado === 'BORRADOR' && (
                        <button
                            onClick={() => requestEliminar(item)}
                            className="group relative px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-rose-500 hover:bg-rose-50 transition-all duration-200 flex items-center gap-2 min-w-[100px]"
                            title="Eliminar convocatoria"
                        >
                            <Trash2 className="w-5 h-5 text-gray-600 group-hover:text-rose-600 transition-colors" />
                            <span className="text-sm font-semibold text-gray-600 group-hover:text-rose-600 transition-colors">
                                Eliminar
                            </span>
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                    )}
                </div>
            ),
            responsive: false // Siempre visible
        }
    ];

    return (
        <div className="space-y-6">
            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg border border-[#e2e8f0] p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-[#64748b]">Total Convocatorias</p>
                            <p className="text-2xl font-bold text-[#1e293b]">{estadisticas.totalConvocatorias}</p>
                        </div>
                        <Megaphone className="w-8 h-8 text-[#8B1E1E]/20" />
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-[#e2e8f0] p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-[#64748b]">Publicadas</p>
                            <p className="text-2xl font-bold text-blue-600">
                                {estadisticas.porEstado.find((e: any) => e.estado === 'PUBLICADA')?._count || 0}
                            </p>
                        </div>
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Globe className="w-4 h-4 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-[#e2e8f0] p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-[#64748b]">En Curso</p>
                            <p className="text-2xl font-bold text-green-600">
                                {estadisticas.porEstado.find((e: any) => e.estado === 'EN_CURSO')?._count || 0}
                            </p>
                        </div>
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <Clock className="w-4 h-4 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-[#e2e8f0] p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-[#64748b]">Cerradas</p>
                            <p className="text-2xl font-bold text-yellow-600">
                                {estadisticas.porEstado.find((e: any) => e.estado === 'CERRADA')?._count || 0}
                            </p>
                        </div>
                        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-yellow-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Header con filtros y acciones */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-[#64748b]" />
                    <span className="text-sm font-medium text-[#64748b]">Filtrar por estado:</span>
                    <div className="flex gap-2">
                        {['todos', 'BORRADOR', 'PUBLICADA', 'EN_CURSO', 'CERRADA', 'CANCELADA'].map(estado => (
                            <button
                                key={estado}
                                onClick={() => setFilter(estado)}
                                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                                    filter === estado 
                                        ? 'bg-[#8B1E1E] text-white' 
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {estado === 'todos' ? 'Todos' : estado}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#8B1E1E] rounded-lg text-sm font-semibold text-white hover:bg-[#731919] transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    Nueva Convocatoria
                </button>
            </div>

            {/* Tabla de convocatorias - Desktop */}
            <div className="hidden lg:block">
                <DataTable
                    data={filteredData}
                    columns={columns}
                    searchPlaceholder="Buscar convocatoria..."
                />
            </div>

            {/* Vista de tarjetas móvil */}
            <div className="lg:hidden space-y-4">
                {filteredData.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                        <Megaphone className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">No hay convocatorias registradas.</p>
                    </div>
                ) : (
                    filteredData.map(conv => (
                        <div key={conv.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3">
                            {/* Header: Título y estado */}
                            <div className="flex items-start justify-between gap-2">
                                <h3 className="font-bold text-[#1e293b] text-sm leading-tight flex-1">{conv.titulo}</h3>
                                <StatusBadge status={conv.estado} className={getEstadoColor(conv.estado)} />
                            </div>
                            
                            {/* Descripción */}
                            <p className="text-xs text-gray-500 line-clamp-2">{conv.descripcion}</p>
                            
                            {/* Publicador - Nombre y Rol */}
                            <div className="flex items-center gap-2 p-2 bg-[#8B1E1E]/5 rounded-lg">
                                <div className="w-8 h-8 bg-[#8B1E1E] rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-white text-xs font-bold">
                                        {conv.publicador.primer_nombre.charAt(0)}{conv.publicador.primer_apellido.charAt(0)}
                                    </span>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="text-sm font-semibold text-[#1e293b] truncate">
                                        {conv.publicador.primer_nombre} {conv.publicador.primer_apellido}
                                    </div>
                                    <div className="text-[10px] uppercase font-bold text-[#8B1E1E]">
                                        {conv.publicador.rol}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Info adicional */}
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="flex items-center gap-1 text-gray-600">
                                    <Calendar className="w-3 h-3" />
                                    <span>{new Date(conv.fecha_inicio).toLocaleDateString('es-CO')}</span>
                                </div>
                                <div className="flex items-center gap-1 text-gray-600">
                                    <Users className="w-3 h-3" />
                                    <span>{conv._count?.postulaciones || 0} postulaciones</span>
                                </div>
                                {conv.cupo_maximo && (
                                    <div className="flex items-center gap-1 text-gray-600">
                                        <span className="font-medium">Cupo:</span>
                                        <span>{conv.cupo_disponible || 0}/{conv.cupo_maximo}</span>
                                    </div>
                                )}
                                {conv.programa && (
                                    <div className="flex items-center gap-1 text-gray-600 truncate">
                                        <span className="truncate">{conv.programa.nombre}</span>
                                    </div>
                                )}
                            </div>
                            
                            {/* Acciones */}
                            <div className="flex gap-2 pt-2 border-t border-gray-100">
                                <Link
                                    href={`/administrador/convocatorias/${conv.id}`}
                                    className="flex-1 flex items-center justify-center gap-1 py-2 bg-gray-50 text-gray-600 rounded-lg text-xs font-medium"
                                >
                                    <Eye className="w-3 h-3" />
                                    Ver
                                </Link>
                                <button
                                    onClick={() => handleEditar(conv)}
                                    className="flex-1 flex items-center justify-center gap-1 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-medium"
                                >
                                    <Edit3 className="w-3 h-3" />
                                    Editar
                                </button>
                                <button
                                    onClick={() => requestEstadoChange(conv)}
                                    className="flex-1 flex items-center justify-center gap-1 py-2 bg-amber-50 text-amber-600 rounded-lg text-xs font-medium"
                                >
                                    <Power className="w-3 h-3" />
                                    Estado
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modales */}
            <NuevaConvocatoriaModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleNuevaConvocatoria}
            />

            <EditarConvocatoriaModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={handleConvocatoriaActualizada}
                convocatoria={toEdit}
            />

            {/* Diálogo de confirmación */}
            <ConfirmDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onConfirm={executeEliminar}
                title="Eliminar Convocatoria"
                description={`¿Estás seguro de eliminar la convocatoria "${selected?.titulo}"? Esta acción no se puede deshacer.`}
                confirmText="Sí, Eliminar"
                type="warning"
                isLoading={isProcessing}
            />

            {/* Modal para seleccionar estado */}
            <FormModal
                isOpen={isEstadoModalOpen}
                onClose={() => setIsEstadoModalOpen(false)}
                title="Cambiar Estado de Convocatoria"
            >
                <div className="space-y-4">
                    <div className="text-sm text-gray-600 mb-4">
                        Selecciona el nuevo estado para &quot;{selected?.titulo}&quot;
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Estado Actual
                        </label>
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <StatusBadge 
                                status={selected?.estado || ''}
                                className={getEstadoColor(selected?.estado || '')}
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nuevo Estado
                        </label>
                        <select
                            value={nuevoEstado}
                            onChange={(e) => setNuevoEstado(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B1E1E] focus:border-[#8B1E1E]"
                        >
                            <option value="">Selecciona un estado</option>
                            <option value="BORRADOR">BORRADOR</option>
                            <option value="PUBLICADA">PUBLICADA</option>
                            <option value="EN_CURSO">EN CURSO</option>
                            <option value="CERRADA">CERRADA</option>
                            <option value="CANCELADA">CANCELADA</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            onClick={() => setIsEstadoModalOpen(false)}
                            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={executeEstadoChange}
                            disabled={!nuevoEstado || nuevoEstado === selected?.estado || isProcessing}
                            className="px-4 py-2 bg-[#8B1E1E] text-white rounded-lg hover:bg-[#731919] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isProcessing ? 'Actualizando...' : 'Cambiar Estado'}
                        </button>
                    </div>
                </div>
            </FormModal>
        </div>
    );
}
