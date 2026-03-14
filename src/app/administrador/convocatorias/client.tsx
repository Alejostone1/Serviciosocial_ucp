'use client';

import React, { useState } from 'react';
import { DataTable, ColumnDef } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Eye, Edit, Play, Pause, XCircle, Settings2 } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { cambiarEstadoConvocatoria } from './actions';
import { EstadoConvocatoria } from '@prisma/client';

// Representación del select en Prisma
type ConvocatoriaRow = {
    id: string;
    titulo: string;
    modalidad: string;
    estado: EstadoConvocatoria;
    cupo_maximo: number | null;
    cupo_disponible: number | null;
    fecha_inicio: Date;
    fecha_fin: Date | null;
    publicador: {
        primer_nombre: string;
        primer_apellido: string;
        rol: string;
    };
    programa: {
        nombre: string;
    } | null;
    _count: {
        postulaciones: number;
    };
};

export function ConvocatoriasTableClient({ initialData }: { initialData: ConvocatoriaRow[] }) {
    const [data, setData] = useState(initialData);
    const [filteredData, setFilteredData] = useState(initialData);

    // Estados modales
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedCon, setSelectedCon] = useState<ConvocatoriaRow | null>(null);
    const [targetState, setTargetState] = useState<EstadoConvocatoria | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Funciones Local Search
    const handleSearch = (query: string) => {
        const q = query.toLowerCase();
        setFilteredData(
            data.filter(c =>
                c.titulo.toLowerCase().includes(q) ||
                c.modalidad.toLowerCase().includes(q) ||
                (c.programa?.nombre && c.programa.nombre.toLowerCase().includes(q))
            )
        );
    };

    const handleStateChangeRequest = (con: ConvocatoriaRow, state: EstadoConvocatoria) => {
        setSelectedCon(con);
        setTargetState(state);
        setIsDialogOpen(true);
    };

    const executeStateChange = async () => {
        if (!selectedCon || !targetState) return;
        setIsProcessing(true);

        try {
            await cambiarEstadoConvocatoria(selectedCon.id, targetState);

            const newData = data.map(c =>
                c.id === selectedCon.id ? { ...c, estado: targetState } : c
            );
            setData(newData);
            setFilteredData(newData);

            toast.success('Estado actualizado', {
                description: `La convocatoria ha cambiado a ${targetState}.`
            });
        } catch (e) {
            toast.error('Error al actualizar', { description: 'Ocurrió un problema de permisos o red.' });
        } finally {
            setIsProcessing(false);
            setIsDialogOpen(false);
        }
    };

    const columns: ColumnDef<ConvocatoriaRow>[] = [
        {
            header: 'Título y Programa',
            cell: (item) => (
                <div className="flex flex-col max-w-[280px]">
                    <span className="font-bold text-[#1e293b] truncate" title={item.titulo}>{item.titulo}</span>
                    <span className="text-xs text-[#64748b] truncate">{item.programa?.nombre || 'General Institucional'}</span>
                </div>
            ),
            sortable: true
        },
        {
            header: 'Publicador',
            cell: (item) => (
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-[#334155]">{item.publicador.primer_nombre} {item.publicador.primer_apellido}</span>
                    <span className="text-[10px] uppercase font-bold text-[#8B1E1E]">{item.publicador.rol}</span>
                </div>
            )
        },
        {
            header: 'Modalidad',
            cell: (item) => <span className="text-xs font-semibold py-1 px-2 bg-gray-100 rounded-md text-gray-600">{item.modalidad}</span>
        },
        {
            header: 'Cupos / Postulaciones',
            cell: (item) => (
                <div className="flex flex-col">
                    <span className="text-sm">
                        <strong className="text-[#1e293b]">{item.cupo_disponible ?? '∞'}</strong> / {item.cupo_maximo ?? '∞'}
                    </span>
                    <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded w-max mt-1">
                        {item._count.postulaciones} postulaciones
                    </span>
                </div>
            )
        },
        {
            header: 'Fechas',
            cell: (item) => (
                <div className="flex flex-col text-xs text-[#64748b]">
                    <span><strong>Ini:</strong> {format(new Date(item.fecha_inicio), 'dd/MM/yy')}</span>
                    <span><strong>Fin:</strong> {item.fecha_fin ? format(new Date(item.fecha_fin), 'dd/MM/yy') : 'N/A'}</span>
                </div>
            )
        },
        {
            header: 'Estado',
            cell: (item) => <StatusBadge status={item.estado} />
        },
        {
            header: 'Acciones',
            cell: (item) => (
                <div className="flex items-center gap-1.5">
                    {item.estado === 'BORRADOR' && (
                        <button onClick={() => handleStateChangeRequest(item, 'PUBLICADA')} className="p-1.5 rounded-lg text-[#94a3b8] hover:text-[#166534] hover:bg-[#166534]/8 border border-transparent hover:border-[#166534]/20 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#166534]/20" title="Publicar">
                            <Play className="w-4 h-4" />
                        </button>
                    )}
                    {item.estado === 'PUBLICADA' && (
                        <button onClick={() => handleStateChangeRequest(item, 'EN_CURSO')} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Marcar En Curso">
                            <Settings2 className="w-4 h-4" />
                        </button>
                    )}
                    {['PUBLICADA', 'EN_CURSO'].includes(item.estado) && (
                        <button onClick={() => handleStateChangeRequest(item, 'CERRADA')} className="p-1.5 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors" title="Cerrar Convocatoria">
                            <Pause className="w-4 h-4" />
                        </button>
                    )}
                    {!['CANCELADA', 'CERRADA'].includes(item.estado) && (
                        <button onClick={() => handleStateChangeRequest(item, 'CANCELADA')} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Cancelar Misión">
                            <XCircle className="w-4 h-4" />
                        </button>
                    )}

                    <div className="w-px h-4 bg-gray-200 mx-1"></div>

                    <button className="p-1.5 text-gray-400 hover:text-[#8B1E1E] hover:bg-red-50 rounded-lg transition-colors" title="Ver Detalles">
                        <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Editar">
                        <Edit className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];

    const getDialogConfig = () => {
        if (targetState === 'PUBLICADA') return { title: 'Publicar Convocatoria', type: 'info' as const, confirm: 'Sí, Publicar' };
        if (targetState === 'EN_CURSO') return { title: 'Iniciar Misión', type: 'info' as const, confirm: 'Sí, Iniciar' };
        if (targetState === 'CERRADA') return { title: 'Cerrar Convocatoria', type: 'warning' as const, confirm: 'Sí, Cerrar' };
        return { title: 'Cancelar Convocatoria', type: 'danger' as const, confirm: 'Sí, Cancelar' };
    };

    const dialogConfig = getDialogConfig();

    return (
        <>
            <DataTable
                columns={columns}
                data={filteredData}
                onSearch={handleSearch}
                searchPlaceholder="Buscar curso o programa..."
                emptyMessage="No hay convocatorias registradas."
            />

            <ConfirmDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onConfirm={executeStateChange}
                title={dialogConfig.title}
                description={`¿Estás seguro que deseas pasar la convocatoria "${selectedCon?.titulo}" a estado ${targetState}? ${targetState === 'CANCELADA' ? 'Esta acción anulará postulaciones pendientes.' : ''}`}
                confirmText={dialogConfig.confirm}
                type={dialogConfig.type}
                isLoading={isProcessing}
            />
        </>
    );
}
