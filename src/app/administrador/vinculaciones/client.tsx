'use client';

import React, { useState } from 'react';
import { DataTable, ColumnDef } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CheckCircle2, XCircle, ExternalLink, AlertTriangle, Clock, FileText, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { cambiarEstadoVinculacion } from './actions';
import { EstadoVinculacion } from '@prisma/client';

type VinculacionRow = {
    id: string;
    estado: string;
    numero_convenio: string | null;
    fecha_inicio_convenio: Date | null;
    fecha_fin_convenio: Date | null;
    documento_convenio: string | null;
    creado_en: Date;
    observaciones: string | null;
    aliado: { 
        primer_nombre: string; 
        primer_apellido: string; 
        correo: string;
        telefono: string;
        tipo_documento: string;
        numero_documento: string;
    };
    programa: { 
        nombre: string;
        facultad: { nombre: string };
    };
    aprobador: { primer_nombre: string; primer_apellido: string; correo: string } | null;
};

export function VinculacionesTableClient({ initialData }: { initialData: VinculacionRow[] }) {
    const [data, setData] = useState(initialData);
    const [filteredData, setFilteredData] = useState(initialData);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selected, setSelected] = useState<VinculacionRow | null>(null);
    const [targetEstado, setTargetEstado] = useState<EstadoVinculacion | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [observaciones, setObservaciones] = useState('');

    const handleSearch = (q: string) => {
        const query = q.toLowerCase();
        setFilteredData(data.filter(v =>
            v.aliado.correo.toLowerCase().includes(query) ||
            v.programa.nombre.toLowerCase().includes(query) ||
            v.programa.facultad.nombre.toLowerCase().includes(query) ||
            (v.numero_convenio && v.numero_convenio.toLowerCase().includes(query)) ||
            (v.observaciones && v.observaciones.toLowerCase().includes(query))
        ));
    };

    const requestEstadoChange = (item: VinculacionRow, estado: EstadoVinculacion) => {
        setSelected(item);
        setTargetEstado(estado);
        setObservaciones('');
        setIsDialogOpen(true);
    };

    const executeEstadoChange = async () => {
        if (!selected || !targetEstado) return;
        setIsProcessing(true);
        const toastId = toast.loading(`Actualizando vinculación...`);
        try {
            await cambiarEstadoVinculacion(selected.id, targetEstado, observaciones);
            const updated = data.map(v =>
                v.id === selected.id ? { ...v, estado: targetEstado, observaciones } : v
            );
            setData(updated);
            setFilteredData(updated);
            toast.success('Vinculación actualizada', {
                id: toastId,
                description: `El convenio pasó al estado ${targetEstado}.`,
            });
        } catch {
            toast.error('Error al actualizar', { id: toastId, description: 'Verifica tus permisos.' });
        } finally {
            setIsProcessing(false);
            setIsDialogOpen(false);
            setObservaciones('');
        }
    };

    const getEstadoColor = (estado: string) => {
        switch (estado) {
            case 'PENDIENTE': return 'warning';
            case 'APROBADA': return 'success';
            case 'RECHAZADA': return 'danger';
            case 'SUSPENDIDA': return 'info';
            case 'VENCIDA': return 'default';
            default: return 'default';
        }
    };

    const getEstadoIcon = (estado: string) => {
        switch (estado) {
            case 'PENDIENTE': return <Clock className="w-4 h-4" />;
            case 'APROBADA': return <CheckCircle2 className="w-4 h-4" />;
            case 'RECHAZADA': return <XCircle className="w-4 h-4" />;
            case 'SUSPENDIDA': return <AlertTriangle className="w-4 h-4" />;
            case 'VENCIDA': return <Clock className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    const columns: ColumnDef<VinculacionRow>[] = [
        {
            header: 'Aliado',
            cell: (item) => (
                <div className="flex flex-col">
                    <span className="font-bold text-[#1e293b]">{item.aliado.primer_nombre} {item.aliado.primer_apellido}</span>
                    <span className="text-xs text-[#94a3b8]">{item.aliado.correo}</span>
                    <span className="text-xs text-[#64748b]">{item.aliado.tipo_documento}: {item.aliado.numero_documento}</span>
                    {item.aliado.telefono && (
                        <span className="text-xs text-[#64748b]">{item.aliado.telefono}</span>
                    )}
                </div>
            ),
        },
        {
            header: 'Programa',
            cell: (item) => (
                <div className="flex flex-col">
                    <span className="text-sm font-semibold text-[#1e293b] max-w-[180px] truncate" title={item.programa.nombre}>{item.programa.nombre}</span>
                    <span className="text-xs text-[#64748b]">{item.programa.facultad.nombre}</span>
                </div>
            ),
        },
        {
            header: 'Convenio',
            cell: (item) => (
                <div className="flex flex-col">
                    <span className="text-sm font-mono text-[#1e293b]">{item.numero_convenio ?? '—'}</span>
                    {item.fecha_inicio_convenio && (
                        <span className="text-xs text-[#64748b]">
                            {format(new Date(item.fecha_inicio_convenio), 'dd/MM/yyyy')}
                            {item.fecha_fin_convenio && ` - ${format(new Date(item.fecha_fin_convenio), 'dd/MM/yyyy')}`}
                        </span>
                    )}
                </div>
            ),
        },
        {
            header: 'Estado',
            cell: (item) => (
                <div className="flex items-center gap-2">
                    {getEstadoIcon(item.estado)}
                    <StatusBadge status={item.estado} />
                </div>
            ),
        },
        {
            header: 'Aprobado por',
            cell: (item) => item.aprobador
                ? (
                    <div className="flex flex-col">
                        <span className="text-sm text-[#64748b]">{item.aprobador.primer_nombre} {item.aprobador.primer_apellido}</span>
                        <span className="text-xs text-[#94a3b8]">{item.aprobador.correo}</span>
                    </div>
                )
                : <span className="text-sm italic text-[#94a3b8]">Pendiente</span>,
        },
        {
            header: 'Creado',
            cell: (item) => (
                <div className="flex flex-col text-xs">
                    <span className="text-[#64748b]">
                        {format(new Date(item.creado_en), 'dd/MM/yyyy')}
                    </span>
                    <span className="text-[#94a3b8]">
                        {format(new Date(item.creado_en), 'HH:mm')}
                    </span>
                </div>
            ),
        },
        {
            header: 'Acciones',
            cell: (item) => (
                <div className="flex items-center gap-2 flex-wrap">
                    {item.estado === 'PENDIENTE' && (
                        <>
                            <button
                                onClick={() => requestEstadoChange(item, EstadoVinculacion.APROBADA)}
                                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                            >
                                <CheckCircle2 className="w-3.5 h-3.5" /> Aprobar
                            </button>
                            <button
                                onClick={() => requestEstadoChange(item, EstadoVinculacion.RECHAZADA)}
                                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                            >
                                <XCircle className="w-3.5 h-3.5" /> Rechazar
                            </button>
                        </>
                    )}
                    {item.estado === 'APROBADA' && (
                        <>
                            <button
                                onClick={() => requestEstadoChange(item, EstadoVinculacion.SUSPENDIDA)}
                                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-yellow-700 bg-yellow-100 hover:bg-yellow-200 rounded-lg transition-colors"
                            >
                                <AlertTriangle className="w-3.5 h-3.5" /> Suspender
                            </button>
                            <button
                                onClick={() => requestEstadoChange(item, EstadoVinculacion.VENCIDA)}
                                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                <Clock className="w-3.5 h-3.5" /> Vencer
                            </button>
                        </>
                    )}
                    {item.estado === 'SUSPENDIDA' && (
                        <>
                            <button
                                onClick={() => requestEstadoChange(item, EstadoVinculacion.APROBADA)}
                                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-green-700 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
                            >
                                <CheckCircle2 className="w-3.5 h-3.5" /> Reactivar
                            </button>
                            <button
                                onClick={() => requestEstadoChange(item, EstadoVinculacion.VENCIDA)}
                                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                <Clock className="w-3.5 h-3.5" /> Vencer
                            </button>
                        </>
                    )}
                    {item.documento_convenio && (
                        <a
                            href={item.documento_convenio}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
                        >
                            <FileText className="w-3.5 h-3.5" /> Doc.
                        </a>
                    )}
                </div>
            ),
        },
    ];

    const dialogConfig = {
        APROBADA: { 
            title: 'Aprobar Vinculación', 
            type: 'info' as const, 
            confirm: 'Sí, Aprobar',
            description: 'Esta acción aprobará el convenio y el aliado podrá comenzar a ofrecer actividades en el programa.'
        },
        RECHAZADA: { 
            title: 'Rechazar Vinculación', 
            type: 'danger' as const, 
            confirm: 'Sí, Rechazar',
            description: 'Esta acción rechazará el convenio y el aliado no podrá ofrecer actividades en el programa.'
        },
        SUSPENDIDA: { 
            title: 'Suspender Vinculación', 
            type: 'warning' as const, 
            confirm: 'Sí, Suspender',
            description: 'Esta acción suspenderá temporalmente el convenio. El aliado no podrá ofrecer actividades hasta que se reactive.'
        },
        VENCIDA: { 
            title: 'Vencer Vinculación', 
            type: 'info' as const, 
            confirm: 'Sí, Vencer',
            description: 'Esta acción marcará el convenio como vencido. El aliado no podrá ofrecer más actividades.'
        },
    };

    const cfg = targetEstado ? dialogConfig[targetEstado as keyof typeof dialogConfig] : dialogConfig.RECHAZADA;

    return (
        <>
            <DataTable
                columns={columns}
                data={filteredData}
                onSearch={handleSearch}
                searchPlaceholder="Buscar por aliado, programa, facultad, convenio u observaciones..."
                emptyMessage="No hay vinculaciones registradas."
            />
            <ConfirmDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onConfirm={executeEstadoChange}
                title={cfg.title}
                description={`${cfg.description} ¿Confirmas cambiar el estado del convenio de "${selected?.aliado.primer_nombre} ${selected?.aliado.primer_apellido}" con el programa "${selected?.programa.nombre}" a ${targetEstado}?`}
                confirmText={cfg.confirm}
                type={cfg.type}
                isLoading={isProcessing}
            />
        </>
    );
}
