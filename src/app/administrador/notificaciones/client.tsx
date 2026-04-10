'use client';

import React, { useState, useEffect } from 'react';
import { DataTable, ColumnDef } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Bell, Check, Trash2, ExternalLink, Mail, MailOpen, Send, Plus, Users, FileText, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { marcarComoLeida, eliminarNotificacion, marcarTodasComoLeidas, getPlantillas, eliminarPlantilla, toggleEstadoPlantilla, getNotificacionesMasivas } from './actions';
import { ToggleLeft, ToggleRight } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { CrearNotificacionModal } from './components/crear-notificacion-modal';
import { CrearPlantillaModal } from './components/crear-plantilla-modal';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

type NotificacionRow = {
    id: string;
    tipo: string;
    titulo: string;
    mensaje: string;
    url_accion: string | null;
    leida: boolean;
    creado_en: Date;
};

type NotificacionMasivaRow = {
    id: string;
    titulo: string;
    canales: string[];
    destinatarios_count: number;
    enviados_count: number;
    fallidos_count: number;
    estado: string;
    creado_en: Date;
    enviado_en?: Date;
};

type PlantillaRow = {
    id: string;
    nombre: string;
    tipo: string;
    asunto_correo: string | null;
    mensaje_plantilla: string;
    mensaje_whatsapp: string | null;
    variables: any;
    esta_activa: boolean;
    creado_en: Date;
};

interface NotificacionesTabsClientProps {
    initialData: NotificacionRow[];
}

export function NotificacionesTabsClient({ initialData }: NotificacionesTabsClientProps) {
    const [activeTab, setActiveTab] = useState<'mis-notifs' | 'todas' | 'enviar-masivo' | 'plantillas'>('mis-notifs');
    const [misNotificaciones, setMisNotificaciones] = useState(initialData);
    const [todasNotificaciones, setTodasNotificaciones] = useState<NotificacionRow[]>([]);
    const [notificacionesMasivas, setNotificacionesMasivas] = useState<NotificacionMasivaRow[]>([]);
    const [plantillas, setPlantillas] = useState<PlantillaRow[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedNotif, setSelectedNotif] = useState<NotificacionRow | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isCrearModalOpen, setIsCrearModalOpen] = useState(false);
    const [isPlantillaModalOpen, setIsPlantillaModalOpen] = useState(false);
    const [selectedPlantilla, setSelectedPlantilla] = useState<PlantillaRow | null>(null);
    const [isDeletePlantillaOpen, setIsDeletePlantillaOpen] = useState(false);
    const [editingPlantilla, setEditingPlantilla] = useState<PlantillaRow | null>(null);

    // Cargar plantillas cuando se abre la pestaña
    useEffect(() => {
        if (activeTab === 'plantillas') {
            cargarPlantillas();
        } else if (activeTab === 'todas') {
            cargarMasivas();
        }
    }, [activeTab]);

    const handleSearch = (q: string, data: any[], setter: any) => {
        const query = q.toLowerCase();
        setter(data.filter((item: any) =>
            item.titulo.toLowerCase().includes(query) ||
            item.mensaje.toLowerCase().includes(query)
        ));
    };

    const handleMarcarLeida = async (id: string) => {
        setIsProcessing(true);
        try {
            await marcarComoLeida(id);
            const newData = misNotificaciones.map(n => n.id === id ? { ...n, leida: true } : n);
            setMisNotificaciones(newData);
            toast.success('Notificación marcada como leída');
        } catch {
            toast.error('Error al actualizar notificación');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleMarcarTodasLeidas = async () => {
        setIsProcessing(true);
        try {
            await marcarTodasComoLeidas();
            const newData = misNotificaciones.map(n => ({ ...n, leida: true }));
            setMisNotificaciones(newData);
            toast.success('Todas las notificaciones marcadas como leídas');
        } catch {
            toast.error('Error al actualizar notificaciones');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleEliminar = async () => {
        if (!selectedNotif) return;
        setIsProcessing(true);
        try {
            await eliminarNotificacion(selectedNotif.id);
            const newData = misNotificaciones.filter(n => n.id !== selectedNotif.id);
            setMisNotificaciones(newData);
            toast.success('Notificación eliminada');
        } catch {
            toast.error('Error al eliminar notificación');
        } finally {
            setIsProcessing(false);
            setIsDeleteDialogOpen(false);
        }
    };

    const cargarPlantillas = async () => {
        try {
            const data = await getPlantillas();
            setPlantillas(data as any);
        } catch {
            toast.error('Error al cargar plantillas');
        }
    };

    const cargarMasivas = async () => {
        try {
            const data = await getNotificacionesMasivas();
            setNotificacionesMasivas(data as any);
        } catch {
            toast.error('Error al cargar historial de envíos');
        }
    };

    const handleEliminarPlantilla = async () => {
        if (!selectedPlantilla) return;
        setIsProcessing(true);
        try {
            await eliminarPlantilla(selectedPlantilla.id);
            setPlantillas(prev => prev.filter(p => p.id !== selectedPlantilla.id));
            toast.success('Plantilla eliminada exitosamente');
        } catch {
            toast.error('Error al eliminar plantilla');
        } finally {
            setIsProcessing(false);
            setIsDeletePlantillaOpen(false);
        }
    };

    const handleToggleEstado = async (id: string, actual: boolean) => {
        setIsProcessing(true);
        try {
            await toggleEstadoPlantilla(id, actual);
            setPlantillas(prev => prev.map(p => p.id === id ? { ...p, esta_activa: !actual } : p));
            toast.success('Estado actualizado');
        } catch {
            toast.error('Error al cambiar estado');
        } finally {
            setIsProcessing(false);
        }
    };

    const misNotificacionesColumns: ColumnDef<NotificacionRow>[] = [
        {
            header: 'Estado',
            cell: (item) => (
                <div className="flex justify-center">
                    {item.leida ? (
                        <MailOpen className="w-5 h-5 text-gray-400" />
                    ) : (
                        <Mail className="w-5 h-5 text-[#8B1E1E]" />
                    )}
                </div>
            )
        },
        {
            header: 'Notificación',
            cell: (item) => (
                <div className="flex flex-col gap-0.5">
                    <span className={`font-semibold ${item.leida ? 'text-gray-500' : 'text-[#1e293b]'}`}>
                        {item.titulo}
                    </span>
                    <span className="text-xs text-gray-400 line-clamp-1">
                        {item.mensaje}
                    </span>
                </div>
            )
        },
        {
            header: 'Tipo',
            cell: (item) => <StatusBadge status={item.tipo} />
        },
        {
            header: 'Fecha',
            cell: (item) => (
                <span className="text-xs text-gray-500">
                    {format(new Date(item.creado_en), "d 'de' MMMM, HH:mm", { locale: es })}
                </span>
            )
        },
        {
            header: 'Acciones',
            cell: (item) => (
                <div className="flex items-center gap-2">
                    {!item.leida && (
                        <button
                            onClick={() => handleMarcarLeida(item.id)}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-transparent hover:border-green-100"
                            title="Marcar como leída"
                        >
                            <Check className="w-4 h-4" />
                        </button>
                    )}
                    {item.url_accion && (
                        <Link
                            href={item.url_accion}
                            prefetch={false}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                            title="Ver detalle"
                        >
                            <ExternalLink className="w-4 h-4" />
                        </Link>
                    )}
                    <button
                        onClick={() => { setSelectedNotif(item); setIsDeleteDialogOpen(true); }}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                        title="Eliminar"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];

    const notificacionesMasivasColumns: ColumnDef<NotificacionMasivaRow>[] = [
        {
            header: 'Título',
            cell: (item) => (
                <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-[#1e293b]">{item.titulo}</span>
                    <span className="text-xs text-gray-400">
                        {item.canales.join(', ')}
                    </span>
                </div>
            )
        },
        {
            header: 'Destinatarios',
            cell: (item) => (
                <div className="text-sm">
                    <div className="font-medium">{item.destinatarios_count}</div>
                    <div className="text-xs text-gray-500">
                        {item.enviados_count} enviados, {item.fallidos_count} fallidos
                    </div>
                </div>
            )
        },
        {
            header: 'Estado',
            cell: (item) => (
                <StatusBadge 
                    status={item.estado} 
                    variant={item.estado === 'ENVIADO' ? 'success' : item.estado === 'FALLIDO' ? 'error' : 'warning'}
                />
            )
        },
        {
            header: 'Fecha',
            cell: (item) => (
                <span className="text-xs text-gray-500">
                    {format(new Date(item.creado_en), "d 'de' MMMM, HH:mm", { locale: es })}
                </span>
            )
        },
        {
            header: 'Acciones',
            cell: (item) => (
                <div className="flex items-center gap-2">
                    <button
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                        title="Ver detalles"
                    >
                        <ExternalLink className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];

    const plantillasColumns: ColumnDef<PlantillaRow>[] = [
        {
            header: 'Nombre',
            cell: (item) => (
                <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-[#1e293b]">{item.nombre}</span>
                    {item.asunto_correo && (
                        <span className="text-xs text-gray-400">{item.asunto_correo}</span>
                    )}
                </div>
            )
        },
        {
            header: 'Tipo',
            cell: (item) => <StatusBadge status={item.tipo} />
        },
        {
            header: 'Estado',
            cell: (item) => (
                <StatusBadge 
                    status={item.esta_activa ? 'ACTIVA' : 'INACTIVA'} 
                    variant={item.esta_activa ? 'success' : 'default'}
                />
            )
        },
        {
            header: 'Fecha',
            cell: (item) => (
                <span className="text-xs text-gray-500">
                    {format(new Date(item.creado_en), "d 'de' MMMM, HH:mm", { locale: es })}
                </span>
            )
        },
        {
            header: 'Acciones',
            cell: (item) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            setEditingPlantilla(item);
                            setIsPlantillaModalOpen(true);
                        }}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                        title="Editar"
                    >
                        <Settings className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleToggleEstado(item.id, item.esta_activa)}
                        className={`p-1.5 rounded-lg transition-colors border border-transparent ${
                            item.esta_activa 
                                ? 'text-green-600 hover:bg-green-50 hover:border-green-100' 
                                : 'text-gray-400 hover:bg-gray-50 hover:border-gray-200'
                        }`}
                        title={item.esta_activa ? "Desactivar" : "Activar"}
                    >
                        {item.esta_activa ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                    </button>
                    <button
                        onClick={() => {
                            setSelectedPlantilla(item);
                            setIsDeletePlantillaOpen(true);
                        }}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                        title="Eliminar"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];

    const tabs = [
        { id: 'mis-notifs', label: 'Mis Notificaciones', icon: Bell },
        { id: 'todas', label: 'Todas las Notificaciones', icon: Users },
        { id: 'enviar-masivo', label: 'Enviar Masivo', icon: Send },
        { id: 'plantillas', label: 'Plantillas', icon: FileText },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Bell className="w-6 h-6 text-[#8B1E1E]" />
                        <h1 className="text-2xl font-bold text-[#1e293b]">Centro de Notificaciones</h1>
                    </div>
                    <p className="text-[#64748b] text-sm italic">Gestiona todas las notificaciones del sistema.</p>
                </div>
                {activeTab === 'mis-notifs' && (
                    <button
                        onClick={handleMarcarTodasLeidas}
                        disabled={isProcessing || misNotificaciones.filter(n => !n.leida).length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-[#e2e8f0] rounded-lg text-sm font-semibold text-[#475569] hover:bg-[#f8fafc] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Check className="w-4 h-4" /> Marcar todas como leídas
                    </button>
                )}
                {activeTab === 'enviar-masivo' && (
                    <button
                        onClick={() => setIsCrearModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#8B1E1E] text-white rounded-lg text-sm font-semibold hover:bg-[#7a1818] transition-all shadow-sm"
                    >
                        <Plus className="w-4 h-4" /> Nueva Notificación Masiva
                    </button>
                )}
                {activeTab === 'plantillas' && (
                    <button
                        onClick={() => setIsPlantillaModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#8B1E1E] text-white rounded-lg text-sm font-semibold hover:bg-[#7a1818] transition-all shadow-sm"
                    >
                        <Plus className="w-4 h-4" /> Nueva Plantilla
                    </button>
                )}
            </div>

            {/* Tabs Navigation */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === tab.id
                                        ? 'border-[#8B1E1E] text-[#8B1E1E]'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="mt-6">
                {activeTab === 'mis-notifs' && (
                    <DataTable
                        columns={misNotificacionesColumns}
                        data={misNotificaciones}
                        onSearch={(q) => handleSearch(q, misNotificaciones, setMisNotificaciones)}
                        searchPlaceholder="Filtrar por título o contenido..."
                        emptyMessage="Parece que no tienes notificaciones por ahora."
                    />
                )}

                {activeTab === 'todas' && (
                    <DataTable
                        columns={misNotificacionesColumns}
                        data={todasNotificaciones}
                        onSearch={(q) => handleSearch(q, todasNotificaciones, setTodasNotificaciones)}
                        searchPlaceholder="Filtrar por título o contenido..."
                        emptyMessage="No hay notificaciones en el sistema."
                    />
                )}

                {activeTab === 'enviar-masivo' && (
                    <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                        <Send className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Envío Masivo de Notificaciones</h3>
                        <p className="text-gray-600 mb-6">
                            Crea y envía notificaciones a grupos específicos de usuarios por programa, rol o facultad.
                        </p>
                        <button 
                            onClick={() => setIsCrearModalOpen(true)}
                            className="px-6 py-3 bg-[#8B1E1E] text-white rounded-lg font-medium hover:bg-[#7a1818] transition-colors"
                        >
                            Crear Nueva Notificación Masiva
                        </button>
                    </div>
                )}

                {activeTab === 'plantillas' && (
                    <DataTable
                        columns={plantillasColumns}
                        data={plantillas}
                        onSearch={(q) => handleSearch(q, plantillas, setPlantillas)}
                        searchPlaceholder="Filtrar por nombre o tipo..."
                        emptyMessage="No hay plantillas creadas."
                    />
                )}
            </div>

            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleEliminar}
                title="Eliminar Notificación"
                description="¿Estás seguro de que deseas eliminar esta notificación de forma permanente?"
                confirmText="Sí, eliminar"
                type="danger"
                isLoading={isProcessing}
            />

            <CrearNotificacionModal
                isOpen={isCrearModalOpen}
                onClose={() => setIsCrearModalOpen(false)}
                onSuccess={() => {
                    setIsCrearModalOpen(false);
                    toast.success('Notificación creada exitosamente');
                    // Aquí podrías recargar los datos si es necesario
                }}
                plantillas={plantillas}
            />

            <CrearPlantillaModal
                isOpen={isPlantillaModalOpen}
                onClose={() => {
                    setIsPlantillaModalOpen(false);
                    setEditingPlantilla(null);
                }}
                onSuccess={() => {
                    setIsPlantillaModalOpen(false);
                    setEditingPlantilla(null);
                    toast.success(editingPlantilla ? 'Plantilla actualizada' : 'Plantilla creada');
                    cargarPlantillas();
                }}
                initialData={editingPlantilla}
            />

            <ConfirmDialog
                isOpen={isDeletePlantillaOpen}
                onClose={() => setIsDeletePlantillaOpen(false)}
                onConfirm={handleEliminarPlantilla}
                title="Eliminar Plantilla"
                description="¿Estás seguro de que deseas eliminar esta plantilla? Esta acción no se puede deshacer."
                confirmText="Sí, eliminar"
                type="danger"
                isLoading={isProcessing}
            />
        </div>
    );
}
