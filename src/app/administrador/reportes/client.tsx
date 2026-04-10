'use client';

import React, { useState } from 'react';
import { DataTable, ColumnDef } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { aprobarReporteHoras, rechazarReporteHoras } from '../actividades/actions';

type ReporteRow = {
    id: string;
    estado: string;
    horas_reportadas: { toString(): string };
    horas_aprobadas: { toString(): string } | null;
    descripcion_trabajo: string | null;
    notas_revisor: string | null;
    reportado_en: Date;
    revisado_en: Date | null;
    estudiante: { primer_nombre: string; primer_apellido: string; correo: string };
    actividad: { nombre: string; convocatoria: { titulo: string } };
    revisor: { primer_nombre: string; primer_apellido: string } | null;
};

export function ReportesTableClient({ initialData }: { initialData: ReporteRow[] }) {
    const [data, setData] = useState(initialData);
    const [filteredData, setFilteredData] = useState(initialData);
    const [processing, setProcessing] = useState<string | null>(null);

    const handleSearch = (query: string) => {
        const q = query.toLowerCase();
        setFilteredData(data.filter(r =>
            r.estudiante.correo.toLowerCase().includes(q) ||
            r.actividad.nombre.toLowerCase().includes(q) ||
            r.actividad.convocatoria.titulo.toLowerCase().includes(q)
        ));
    };

    const handleRevision = async (id: string, decision: 'APROBADO' | 'RECHAZADO', horasAprobadas?: number) => {
        setProcessing(id);
        const toastId = toast.loading(`${decision === 'APROBADO' ? 'Aprobando' : 'Rechazando'} reporte...`);
        try {
            if (decision === 'APROBADO') {
                await aprobarReporteHoras(id, `Aprobado por el administrador`);
            } else {
                await rechazarReporteHoras(id, 'Reporte rechazado por el administrador');
            }
            const updated = data.map(r => r.id === id ? { ...r, estado: decision, horas_aprobadas: decision === 'APROBADO' && horasAprobadas ? { toString: () => String(horasAprobadas) } : null } : r);
            setData(updated);
            setFilteredData(updated);
            toast.success(decision === 'APROBADO' ? '✅ Reporte Aprobado' : '❌ Reporte Rechazado', {
                id: toastId,
                description: decision === 'APROBADO'
                    ? 'Las horas del estudiante han sido actualizadas automáticamente.'
                    : 'El reporte ha sido marcado como rechazado.',
            });
        } catch (e) {
            toast.error('Error al procesar', { id: toastId, description: 'Verifica tu conexión o permisos.' });
        } finally {
            setProcessing(null);
        }
    };

    const columns: ColumnDef<ReporteRow>[] = [
        {
            header: 'Estudiante',
            cell: (item) => (
                <div className="flex flex-col">
                    <span className="font-bold text-[#1e293b]">{item.estudiante.primer_nombre} {item.estudiante.primer_apellido}</span>
                    <span className="text-xs text-[#94a3b8]">{item.estudiante.correo}</span>
                </div>
            ),
        },
        {
            header: 'Actividad / Convocatoria',
            cell: (item) => (
                <div className="flex flex-col max-w-[220px]">
                    <span className="font-semibold text-[#334155] truncate" title={item.actividad.nombre}>{item.actividad.nombre}</span>
                    <span className="text-xs text-[#94a3b8] truncate">{item.actividad.convocatoria.titulo}</span>
                </div>
            ),
        },
        {
            header: 'Horas',
            cell: (item) => (
                <div className="flex items-center gap-2">
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-[#1e293b]">{item.horas_reportadas.toString()}h <span className="text-xs font-normal text-[#94a3b8]">reportadas</span></span>
                        {item.horas_aprobadas && <span className="text-xs font-bold text-green-600">{item.horas_aprobadas.toString()}h aprobadas</span>}
                    </div>
                </div>
            ),
        },
        {
            header: 'Fecha',
            cell: (item) => (
                <span className="text-xs text-[#64748b]">
                    {format(new Date(item.reportado_en), 'dd MMM yyyy', { locale: es })}
                </span>
            ),
        },
        {
            header: 'Estado',
            cell: (item) => <StatusBadge status={item.estado} />,
        },
        {
            header: 'Acciones',
            cell: (item) => {
                if (['APROBADO', 'RECHAZADO'].includes(item.estado)) {
                    return <span className="text-xs text-[#94a3b8] italic">Revisado</span>;
                }
                const isProcessing = processing === item.id;
                const horas = Number(item.horas_reportadas.toString());
                return (
                    <div className="flex items-center gap-2">
                        <button
                            disabled={isProcessing}
                            onClick={() => handleRevision(item.id, 'APROBADO', horas)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
                        >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Aprobar ({horas}h)
                        </button>
                        <button
                            disabled={isProcessing}
                            onClick={() => handleRevision(item.id, 'RECHAZADO')}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50"
                        >
                            <XCircle className="w-3.5 h-3.5" />
                            Rechazar
                        </button>
                    </div>
                );
            },
        },
    ];

    return (
        <DataTable
            columns={columns}
            data={filteredData}
            onSearch={handleSearch}
            searchPlaceholder="Buscar por estudiante, actividad o convocatoria..."
            emptyMessage="No hay reportes de horas registrados."
        />
    );
}
