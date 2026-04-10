'use client';

import React, { useState } from 'react';
import { DataTable, ColumnDef } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { toggleActividad } from './actions';
import { NuevaActividadModal } from './nueva-actividad-modal';
import { CalendarDays, Plus, Power, Users } from 'lucide-react';
import { toast } from 'sonner';

type ActividadRow = {
    id: string;
    nombre: string;
    tipo_actividad: string;
    horas_estimadas: { toString(): string };
    esta_activa: boolean;
    convocatoria: { titulo: string };
    creador: { primer_nombre: string; primer_apellido: string };
    _count: { reportes: number };
};

export function ActividadesTableClient({
    initialData,
    convocatorias,
}: {
    initialData: ActividadRow[];
    convocatorias: { id: string; titulo: string }[];
}) {
    const [data, setData] = useState(initialData);
    const [filteredData, setFilteredData] = useState(initialData);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selected, setSelected] = useState<ActividadRow | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSearch = (q: string) => {
        const query = q.toLowerCase();
        setFilteredData(data.filter(a =>
            a.nombre.toLowerCase().includes(query) || a.convocatoria.titulo.toLowerCase().includes(query)
        ));
    };

    const requestToggle = (item: ActividadRow) => {
        setSelected(item);
        setIsDialogOpen(true);
    };

    const executeToggle = async () => {
        if (!selected) return;
        setIsProcessing(true);
        try {
            await toggleActividad(selected.id, !selected.esta_activa);
            const updated = data.map(a => a.id === selected.id ? { ...a, esta_activa: !a.esta_activa } : a);
            setData(updated);
            setFilteredData(updated);
            toast.success(`Actividad ${selected.esta_activa ? 'desactivada' : 'activada'}`);
        } catch {
            toast.error('Error al actualizar');
        } finally {
            setIsProcessing(false);
            setIsDialogOpen(false);
        }
    };

    const handleNuevaActividad = (newAct: any) => {
        const conv = convocatorias.find(c => c.id === newAct.id_convocatoria);
        const row: ActividadRow = {
            ...newAct,
            horas_estimadas: { toString: () => String(newAct.horas_estimadas) },
            convocatoria: { titulo: conv?.titulo || '...' },
            creador: { primer_nombre: 'Admin', primer_apellido: '' }, // Optimist feedback
            esta_activa: true,
            _count: { reportes: 0 }
        };
        setData(prev => [row, ...prev]);
        setFilteredData(prev => [row, ...prev]);
        setIsModalOpen(false);
    };

    const columns: ColumnDef<ActividadRow>[] = [
        {
            header: 'Actividad',
            cell: (item) => (
                <div className="flex flex-col">
                    <span className="font-bold text-[#1e293b]">{item.nombre}</span>
                    <span className="text-xs text-[#64748b] truncate max-w-[250px]" title={item.convocatoria.titulo}>
                        📍 {item.convocatoria.titulo}
                    </span>
                </div>
            ),
            sortable: true
        },
        { header: 'Tipo', cell: (item) => <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 font-semibold">{item.tipo_actividad}</span> },
        { header: 'Horas', cell: (item) => <span className="font-bold text-[#8B1E1E]">{item.horas_estimadas.toString()}h</span> },
        {
            header: 'Reportes',
            cell: (item) => (
                <div className="flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-md max-w-fit border border-blue-100">
                    <Users className="w-3.5 h-3.5" /> {item._count.reportes}
                </div>
            ),
        },
        { header: 'Estado', cell: (item) => <StatusBadge status={item.esta_activa ? 'ACTIVO' : 'INACTIVO'} /> },
        {
            header: 'Acciones',
            cell: (item) => (
                <button
                    onClick={() => requestToggle(item)}
                    className={`flex items-center gap-1 text-xs font-semibold transition-colors ${item.esta_activa ? 'text-red-500 hover:text-red-700' : 'text-green-600 hover:text-green-800'}`}
                >
                    <Power className="w-3.5 h-3.5" /> {item.esta_activa ? 'Desactivar' : 'Activar'}
                </button>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <CalendarDays className="w-6 h-6 text-[#8B1E1E]" />
                        <h1 className="text-2xl font-bold text-[#1e293b]">Gestión de Actividades</h1>
                    </div>
                    <p className="text-[#64748b] text-sm">Registro y control de tareas asociadas a las convocatorias.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#8B1E1E] rounded-lg text-sm font-semibold text-white hover:bg-[#731919] transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" /> Nueva Actividad
                </button>
            </div>

            <DataTable
                columns={columns}
                data={filteredData}
                onSearch={handleSearch}
                searchPlaceholder="Buscar por nombre o convocatoria..."
                emptyMessage="No hay actividades registradas."
            />

            <ConfirmDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onConfirm={executeToggle}
                title={selected?.esta_activa ? 'Desactivar Actividad' : 'Activar Actividad'}
                description={`¿Estás seguro de ${selected?.esta_activa ? 'desactivar' : 'activar'} la actividad "${selected?.nombre}"?`}
                confirmText={selected?.esta_activa ? 'Sí, Desactivar' : 'Sí, Activar'}
                type={selected?.esta_activa ? 'warning' : 'info'}
                isLoading={isProcessing}
            />

            <NuevaActividadModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleNuevaActividad}
                convocatorias={convocatorias}
            />
        </div>
    );
}
