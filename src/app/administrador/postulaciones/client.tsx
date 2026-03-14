'use client';

import React, { useState } from 'react';
import { DataTable, ColumnDef } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cambiarEstadoPostulacion } from './actions';
import { EstadoPostulacion } from '@prisma/client';

type PostulacionRow = {
    id: string;
    estado: string;
    motivacion: string | null;
    postulado_en: Date;
    revisado_en: Date | null;
    notas_revision: string | null;
    estudiante: { primer_nombre: string; primer_apellido: string; correo: string };
    convocatoria: { titulo: string; modalidad: string };
    revisor: { primer_nombre: string; primer_apellido: string } | null;
};

export function PostulacionesTableClient({ initialData }: { initialData: PostulacionRow[] }) {
    const [data, setData] = useState(initialData);
    const [filteredData, setFilteredData] = useState(initialData);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selected, setSelected] = useState<PostulacionRow | null>(null);
    const [targetDecision, setTargetDecision] = useState<'ACEPTADA' | 'RECHAZADA' | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSearch = (q: string) => {
        const query = q.toLowerCase();
        setFilteredData(data.filter(p =>
            p.estudiante.correo.toLowerCase().includes(query) ||
            p.convocatoria.titulo.toLowerCase().includes(query)
        ));
    };

    const requestRevision = (item: PostulacionRow, decision: 'ACEPTADA' | 'RECHAZADA') => {
        setSelected(item);
        setTargetDecision(decision);
        setIsDialogOpen(true);
    };

    const executeRevision = async () => {
        if (!selected || !targetDecision) return;
        setIsProcessing(true);
        const toastId = toast.loading(`${targetDecision === 'ACEPTADA' ? 'Aceptando' : 'Rechazando'} postulación...`);
        try {
            await cambiarEstadoPostulacion(selected.id, targetDecision, `Decisión tomada por el administrador.`);
            const updated = data.map(p =>
                p.id === selected.id ? { ...p, estado: targetDecision } : p
            );
            setData(updated);
            setFilteredData(updated);
            toast.success(targetDecision === 'ACEPTADA' ? '✅ Postulación Aceptada' : '❌ Postulación Rechazada', {
                id: toastId,
                description: `El estudiante ${selected.estudiante.primer_nombre} ha sido notificado.`,
            });
        } catch {
            toast.error('Error al procesar', { id: toastId, description: 'Verifica tus permisos o conexión.' });
        } finally {
            setIsProcessing(false);
            setIsDialogOpen(false);
        }
    };

    const columns: ColumnDef<PostulacionRow>[] = [
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
            header: 'Convocatoria',
            cell: (item) => (
                <div className="max-w-[220px]">
                    <p className="font-semibold text-[#334155] truncate" title={item.convocatoria.titulo}>{item.convocatoria.titulo}</p>
                    <span className="text-[10px] bg-gray-100 text-gray-600 font-semibold px-1.5 py-0.5 rounded">{item.convocatoria.modalidad}</span>
                </div>
            ),
        },
        {
            header: 'Motivación',
            cell: (item) => (
                <span className="text-xs text-[#64748b] line-clamp-2 max-w-[200px] block" title={item.motivacion ?? ''}>
                    {item.motivacion ?? '—'}
                </span>
            ),
        },
        {
            header: 'Postulado',
            cell: (item) => (
                <span className="text-xs text-[#64748b]">
                    {format(new Date(item.postulado_en), 'dd MMM yyyy', { locale: es })}
                </span>
            ),
        },
        { header: 'Estado', cell: (item) => <StatusBadge status={item.estado} /> },
        {
            header: 'Acciones',
            cell: (item) => {
                if (['ACEPTADA', 'RECHAZADA', 'RETIRADA'].includes(item.estado)) {
                    return (
                        <div className="flex flex-col">
                            <span className="text-xs italic text-[#94a3b8]">Revisada</span>
                            {item.revisor && <span className="text-[10px] text-[#cbd5e1]">por {item.revisor.primer_nombre}</span>}
                        </div>
                    );
                }
                return (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => requestRevision(item, 'ACEPTADA')}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                        >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Aceptar
                        </button>
                        <button
                            onClick={() => requestRevision(item, 'RECHAZADA')}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                        >
                            <XCircle className="w-3.5 h-3.5" /> Rechazar
                        </button>
                    </div>
                );
            },
        },
    ];

    return (
        <>
            <DataTable
                columns={columns}
                data={filteredData}
                onSearch={handleSearch}
                searchPlaceholder="Buscar por estudiante o convocatoria..."
                emptyMessage="No hay postulaciones registradas."
            />
            <ConfirmDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onConfirm={executeRevision}
                title={targetDecision === 'ACEPTADA' ? 'Aceptar Postulación' : 'Rechazar Postulación'}
                description={`¿Confirmas ${targetDecision === 'ACEPTADA' ? 'aceptar' : 'rechazar'} la postulación de ${selected?.estudiante.primer_nombre} ${selected?.estudiante.primer_apellido} a "${selected?.convocatoria.titulo}"?`}
                confirmText={targetDecision === 'ACEPTADA' ? 'Sí, Aceptar' : 'Sí, Rechazar'}
                type={targetDecision === 'ACEPTADA' ? 'info' : 'danger'}
                isLoading={isProcessing}
            />
        </>
    );
}
