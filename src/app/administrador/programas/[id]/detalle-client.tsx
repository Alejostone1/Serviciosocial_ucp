'use client';

import React, { useState } from 'react';
import { ArrowLeft, Users, Calendar, Clock, BookOpen, Award, TrendingUp, AlertCircle, CheckCircle, XCircle, Edit, Trash2 } from 'lucide-react';
import { StatusBadge } from '@/components/ui/status-badge';
import { DataTable, ColumnDef } from '@/components/ui/data-table';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { EditarProgramaModal } from '../editar-programa-modal';
import { toast } from 'sonner';
import { eliminarPrograma } from '../actions';
import { NivelFormacion } from '@prisma/client';
import Link from 'next/link';

type Programa = {
    id: string;
    nombre: string;
    codigo: string | null;
    id_facultad: string;
    nivel_formacion: NivelFormacion;
    horas_requeridas: number;
    esta_activo: boolean;
    creado_en: Date;
    actualizado_en: Date;
    facultad: {
        id: string;
        nombre: string;
        codigo: string | null;
        decano: string | null;
        correo_contacto: string | null;
    };
    usuarios: Array<{
        id: string;
        primer_nombre: string;
        segundo_nombre: string | null;
        primer_apellido: string;
        segundo_apellido: string | null;
        numero_documento: string;
        correo: string;
        telefono: string | null;
        esta_bloqueado: boolean;
        ultimo_acceso: Date | null;
        perfil_estudiante: {
            semestre_actual: number | null;
            codigo_estudiantil: string | null;
            horas_previas: number;
            horas_acumuladas: number;
            porcentaje_avance: number;
        } | null;
    }>;
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
        _count: { postulaciones: number };
    }>;
    _count: {
        usuarios: number;
        convocatorias: number;
    };
};

type Estadisticas = {
    totalEstudiantes: number;
    estudiantesActivos: number;
    estudiantesInactivos: number;
    estudiantesPorSemestre: Array<{ semestre: number | null; cantidad: number }>;
    totalHorasAcumuladas: number;
    convocatoriasActivas: number;
    postulacionesPendientes: number;
};

type Facultad = { id: string; nombre: string };

export function ProgramaDetalleClient({ 
    programa, 
    estadisticas, 
    facultades 
}: { 
    programa: Programa; 
    estadisticas: Estadisticas; 
    facultades: Facultad[];
}) {
    const [activeTab, setActiveTab] = useState<'estudiantes' | 'convocatorias' | 'estadisticas'>('estudiantes');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleEditPrograma = () => {
        setIsEditModalOpen(true);
    };

    const handleDeletePrograma = () => {
        setIsDeleteDialogOpen(true);
    };

    const confirmDeletePrograma = async () => {
        setIsProcessing(true);
        const toastId = toast.loading('Eliminando programa...');
        try {
            await eliminarPrograma(programa.id);
            toast.success('✅ Programa eliminado', { 
                id: toastId, 
                description: `'${programa.nombre}' ha sido eliminado correctamente.` 
            });
            // Redirigir a la lista de programas
            window.location.href = '/administrador/programas';
        } catch (e: any) {
            toast.error('Error al eliminar', { 
                id: toastId, 
                description: e.message || 'No se pudo eliminar el programa.' 
            });
        } finally {
            setIsProcessing(false);
            setIsDeleteDialogOpen(false);
        }
    };

    const handleProgramaActualizado = (programaActualizado: any) => {
        // Recargar la página para mostrar los datos actualizados
        window.location.reload();
    };

    const estudianteColumns: ColumnDef<Programa['usuarios'][0]>[] = [
        {
            header: 'Estudiante',
            cell: (item) => (
                <div>
                    <p className="font-bold text-[#1e293b]">
                        {item.primer_nombre} {item.segundo_nombre} {item.primer_apellido} {item.segundo_apellido}
                    </p>
                    <p className="text-xs text-[#94a3b8]">{item.correo}</p>
                    {item.perfil_estudiante?.codigo_estudiantil && (
                        <p className="text-xs font-mono text-[#64748b]">Código: {item.perfil_estudiante.codigo_estudiantil}</p>
                    )}
                </div>
            ),
        },
        {
            header: 'Documento',
            accessorKey: 'numero_documento',
        },
        {
            header: 'Semestre',
            cell: (item) => (
                <span className="text-sm font-semibold px-2 py-1 rounded-md bg-blue-50 text-blue-700">
                    {item.perfil_estudiante?.semestre_actual || 'N/A'}
                </span>
            ),
        },
        {
            header: 'Horas',
            cell: (item) => (
                <div className="text-xs">
                    <div className="font-bold text-[#8B1E1E]">{item.perfil_estudiante?.horas_acumuladas || 0}h</div>
                    <div className="text-[#94a3b8]">de {programa.horas_requeridas}h</div>
                    <div className="text-[#64748b]">{item.perfil_estudiante?.porcentaje_avance || 0}%</div>
                </div>
            ),
        },
        {
            header: 'Estado',
            cell: (item) => (
                <StatusBadge status={item.esta_bloqueado ? 'BLOQUEADO' : 'ACTIVO'} />
            ),
        },
        {
            header: 'Último Acceso',
            cell: (item) => (
                <span className="text-xs text-[#64748b]">
                    {item.ultimo_acceso ? new Date(item.ultimo_acceso).toLocaleDateString() : 'Nunca'}
                </span>
            ),
        },
    ];

    const convocatoriaColumns: ColumnDef<Programa['convocatorias'][0]>[] = [
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
            header: 'Cupos',
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
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/administrador/programas"
                    className="flex items-center gap-2 text-[#64748b] hover:text-[#8B1E1E] transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Volver a Programas
                </Link>
            </div>

            {/* Información Principal */}
            <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl font-bold text-[#1e293b]">{programa.nombre}</h1>
                            {programa.codigo && (
                                <span className="text-sm font-mono px-2 py-1 bg-gray-100 text-gray-600 rounded">
                                    {programa.codigo}
                                </span>
                            )}
                            <StatusBadge status={programa.esta_activo ? 'ACTIVO' : 'INACTIVO'} />
                        </div>
                        <div className="flex items-center gap-4 text-sm text-[#64748b]">
                            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded">
                                {programa.nivel_formacion.replace(/_/g, ' ')}
                            </span>
                            <span className="font-bold text-[#8B1E1E]">
                                {programa.horas_requeridas} horas requeridas
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleEditPrograma}
                            className="flex items-center gap-2 px-3 py-2 bg-[#8B1E1E] text-white rounded-lg hover:bg-[#731919] transition-colors text-sm font-semibold"
                        >
                            <Edit className="w-4 h-4" />
                            Editar
                        </button>
                        <button
                            onClick={handleDeletePrograma}
                            className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
                        >
                            <Trash2 className="w-4 h-4" />
                            Eliminar
                        </button>
                    </div>
                </div>

                {/* Información de Facultad */}
                <div className="mt-6 p-4 bg-[#f8fafc] rounded-lg">
                    <h3 className="font-semibold text-[#334155] mb-2">Facultad</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-[#64748b]">Nombre:</span>
                            <span className="ml-2 font-medium">{programa.facultad.nombre}</span>
                        </div>
                        {programa.facultad.codigo && (
                            <div>
                                <span className="text-[#64748b]">Código:</span>
                                <span className="ml-2 font-medium">{programa.facultad.codigo}</span>
                            </div>
                        )}
                        {programa.facultad.decano && (
                            <div>
                                <span className="text-[#64748b]">Decano:</span>
                                <span className="ml-2 font-medium">{programa.facultad.decano}</span>
                            </div>
                        )}
                        {programa.facultad.correo_contacto && (
                            <div>
                                <span className="text-[#64748b]">Contacto:</span>
                                <span className="ml-2 font-medium">{programa.facultad.correo_contacto}</span>
                            </div>
                        )}
                        <div>
                            <span className="text-[#64748b]">Creado:</span>
                            <span className="ml-2 font-medium">{new Date(programa.creado_en).toLocaleDateString()}</span>
                        </div>
                        <div>
                            <span className="text-[#64748b]">Actualizado:</span>
                            <span className="ml-2 font-medium">{new Date(programa.actualizado_en).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tarjetas de Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg border border-[#e2e8f0] p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-[#1e293b]">{estadisticas.totalEstudiantes}</p>
                            <p className="text-sm text-[#64748b]">Total Estudiantes</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-[#e2e8f0] p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-50 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-[#1e293b]">{estadisticas.estudiantesActivos}</p>
                            <p className="text-sm text-[#64748b]">Estudiantes Activos</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-[#e2e8f0] p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#8B1E1E] rounded-lg">
                            <Clock className="w-5 h-5 text-[#8B1E1E]" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-[#1e293b]">{estadisticas.totalHorasAcumuladas}</p>
                            <p className="text-sm text-[#64748b]">Horas Acumuladas</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-[#e2e8f0] p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-50 rounded-lg">
                            <Calendar className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-[#1e293b]">{estadisticas.convocatoriasActivas}</p>
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
                            onClick={() => setActiveTab('estudiantes')}
                            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === 'estudiantes'
                                    ? 'border-[#8B1E1E] text-[#8B1E1E]'
                                    : 'border-transparent text-[#64748b] hover:text-[#1e293b]'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                Estudiantes ({programa.usuarios.length})
                            </div>
                        </button>
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
                                Convocatorias ({programa.convocatorias.length})
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
                    {activeTab === 'estudiantes' && (
                        <DataTable
                            columns={estudianteColumns}
                            data={programa.usuarios}
                            searchPlaceholder="Buscar estudiante..."
                            emptyMessage="No hay estudiantes registrados en este programa."
                        />
                    )}

                    {activeTab === 'convocatorias' && (
                        <DataTable
                            columns={convocatoriaColumns}
                            data={programa.convocatorias}
                            searchPlaceholder="Buscar convocatoria..."
                            emptyMessage="No hay convocatorias para este programa."
                        />
                    )}

                    {activeTab === 'estadisticas' && (
                        <div className="space-y-6">
                            {/* Distribución por Semestre */}
                            <div>
                                <h3 className="text-lg font-semibold text-[#1e293b] mb-4">Distribución por Semestre</h3>
                                {estadisticas.estudiantesPorSemestre.length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                        {estadisticas.estudiantesPorSemestre.map((item) => (
                                            <div key={item.semestre || 'sin-semestre'} className="bg-[#f8fafc] rounded-lg p-3 text-center">
                                                <div className="text-2xl font-bold text-[#8B1E1E]">{item.cantidad}</div>
                                                <div className="text-sm text-[#64748b]">Semestre {item.semestre || 'N/A'}</div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-[#64748b]">No hay datos de distribución por semestre.</p>
                                )}
                            </div>

                            {/* Métricas Adicionales */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-[#f8fafc] rounded-lg p-4">
                                    <h4 className="font-semibold text-[#334155] mb-3">Estado de Estudiantes</h4>
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
                                    <h4 className="font-semibold text-[#334155] mb-3">Actividad del Programa</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-[#64748b]">Convocatorias Activas:</span>
                                            <span className="font-bold text-blue-600">{estadisticas.convocatoriasActivas}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-[#64748b]">Postulaciones Pendientes:</span>
                                            <span className="font-bold text-orange-600">{estadisticas.postulacionesPendientes}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modales */}
            <EditarProgramaModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={handleProgramaActualizado}
                programa={programa}
                facultades={facultades}
            />

            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={confirmDeletePrograma}
                title="Eliminar Programa"
                description={`¿Estás seguro que deseas eliminar el programa "${programa.nombre}"? Esta acción no se puede deshacer.`}
                confirmText="Sí, Eliminar"
                type="danger"
                isLoading={isProcessing}
            />
        </div>
    );
}
