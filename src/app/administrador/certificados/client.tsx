'use client';

import React, { useState } from 'react';
import { DataTable, ColumnDef } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Download, ShieldX } from 'lucide-react';
import { toast } from 'sonner';
import { anularCertificado } from './actions';

type CertificadoRow = {
    id: string;
    total_horas: { toString(): string };
    esta_vigente: boolean;
    codigo_verificacion: string;
    emitido_en: Date;
    nombre_convocatoria: string | null;
    nombre_aliado: string | null;
    motivo_anulacion: string | null;
    url_pdf: string;
    estudiante: { primer_nombre: string; primer_apellido: string; correo: string };
    emisor: { primer_nombre: string; primer_apellido: string };
};

export function CertificadosTableClient({ initialData }: { initialData: CertificadoRow[] }) {
    const [data, setData] = useState(initialData);
    const [filteredData, setFilteredData] = useState(initialData);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selected, setSelected] = useState<CertificadoRow | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSearch = (q: string) => {
        const query = q.toLowerCase();
        setFilteredData(data.filter(c =>
            c.estudiante.correo.toLowerCase().includes(query) ||
            (c.nombre_convocatoria && c.nombre_convocatoria.toLowerCase().includes(query))
        ));
    };

    const requestAnulacion = (item: CertificadoRow) => {
        setSelected(item);
        setIsDialogOpen(true);
    };

    const executeAnulacion = async () => {
        if (!selected) return;
        setIsProcessing(true);
        const toastId = toast.loading('Anulando certificado...');
        try {
            await anularCertificado(selected.id, 'Anulado manualmente por el administrador del sistema.');
            const updated = data.map(c => c.id === selected.id ? { ...c, esta_vigente: false } : c);
            setData(updated);
            setFilteredData(updated);
            toast.warning('Certificado anulado', {
                id: toastId,
                description: `El certificado de ${selected.estudiante.primer_nombre} ha sido marcado como no vigente.`,
            });
        } catch {
            toast.error('Error al anular', { id: toastId, description: 'Verifica tu conexión o permisos.' });
        } finally {
            setIsProcessing(false);
            setIsDialogOpen(false);
        }
    };

    const columns: ColumnDef<CertificadoRow>[] = [
        {
            header: 'Estudiante',
            cell: (c) => (
                <div className="flex flex-col">
                    <span className="font-bold text-[#1e293b]">{c.estudiante.primer_nombre} {c.estudiante.primer_apellido}</span>
                    <span className="text-xs text-[#94a3b8]">{c.estudiante.correo}</span>
                </div>
            ),
        },
        {
            header: 'Convocatoria / Aliado',
            cell: (c) => (
                <div className="max-w-[200px]">
                    <p className="font-semibold text-[#334155] truncate">{c.nombre_convocatoria ?? 'Proceso Institucional'}</p>
                    {c.nombre_aliado && <p className="text-xs text-[#94a3b8] truncate">{c.nombre_aliado}</p>}
                </div>
            ),
        },
        {
            header: 'Total Horas',
            cell: (c) => <span className="font-bold text-[#8B1E1E] text-base">{c.total_horas.toString()}h</span>,
        },
        {
            header: 'Emitido',
            cell: (c) => (
                <div className="flex flex-col text-xs text-[#64748b]">
                    <span>{format(new Date(c.emitido_en), 'dd MMM yyyy', { locale: es })}</span>
                    <span className="text-[10px] font-mono text-[#94a3b8]">{c.codigo_verificacion.substring(0, 8)}...</span>
                </div>
            ),
        },
        { header: 'Estado', cell: (c) => <StatusBadge status={c.esta_vigente ? 'ACTIVO' : 'CANCELADA'} /> },
        {
            header: 'Acciones',
            cell: (c) => (
                <div className="flex items-center gap-2">
                    <a
                        href={c.url_pdf}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
                    >
                        <Download className="w-3.5 h-3.5" /> PDF
                    </a>
                    {c.esta_vigente && (
                        <button
                            onClick={() => requestAnulacion(c)}
                            className="flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-700 transition-colors"
                        >
                            <ShieldX className="w-3.5 h-3.5" /> Anular
                        </button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <>
            <DataTable
                columns={columns}
                data={filteredData}
                onSearch={handleSearch}
                searchPlaceholder="Buscar por estudiante o convocatoria..."
                emptyMessage="No hay certificados emitidos aún."
            />
            <ConfirmDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onConfirm={executeAnulacion}
                title="Anular Certificado"
                description={`¿Confirmas anular el certificado de ${selected?.estudiante.primer_nombre} ${selected?.estudiante.primer_apellido}? Esta acción lo marcará como no vigente en el sistema. El estudiante no podrá usarlo en verificaciones futuras.`}
                confirmText="Sí, Anular Certificado"
                type="danger"
                isLoading={isProcessing}
            />
        </>
    );
}
