import React from 'react';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { Clock, FileText, Calendar, User, MapPin, CheckCircle, AlertCircle, XCircle, Download, ArrowLeft } from 'lucide-react';
import { db } from '@/lib/prisma';
import { EstadoReporte } from '@prisma/client';

export const metadata = { title: 'Detalles del Reporte | Estudiante' };

async function getReporteDetalles(id: string, userId: string) {
    try {
        const reporte = await db.execute(async (prisma) => {
            return await prisma.reporteHoras.findFirst({
                where: {
                    id,
                    id_estudiante: userId
                },
                include: {
                    actividad: {
                        include: {
                            convocatoria: {
                                include: {
                                    categoria: {
                                        select: {
                                            nombre: true,
                                            color_hex: true
                                        }
                                    }
                                }
                            }
                        }
                    },
                    estudiante: {
                        select: {
                            primer_nombre: true,
                            primer_apellido: true,
                            perfil_estudiante: {
                                select: {
                                    codigo_estudiantil: true
                                }
                            }
                        }
                    },
                    revisor: {
                        select: {
                            primer_nombre: true,
                            primer_apellido: true
                        }
                    }
                }
            });
        }, 'Error al obtener detalles del reporte');

        if (!reporte) {
            return null;
        }

        return reporte;
    } catch (error) {
        console.error('Error en getReporteDetalles:', error);
        throw new Error('No se pudieron cargar los detalles del reporte');
    }
}

export default async function ReporteDetallesPage({ params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ESTUDIANTE') {
        redirect('/login');
    }

    const reporte = await getReporteDetalles(params.id, session.user.id);

    if (!reporte) {
        notFound();
    }

    const getEstadoColor = (estado: string) => {
        switch (estado) {
            case 'APROBADO':
                return 'bg-green-100 text-green-800';
            case 'RECHAZADO':
                return 'bg-red-100 text-red-800';
            case 'EN_REVISION':
                return 'bg-blue-100 text-blue-800';
            case 'REQUIERE_AJUSTE':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-yellow-100 text-yellow-800';
        }
    };

    const getEstadoIcon = (estado: string) => {
        switch (estado) {
            case 'APROBADO':
                return <CheckCircle className="w-4 h-4" />;
            case 'RECHAZADO':
                return <XCircle className="w-4 h-4" />;
            case 'EN_REVISION':
                return <Clock className="w-4 h-4" />;
            case 'REQUIERE_AJUSTE':
                return <AlertCircle className="w-4 h-4" />;
            default:
                return <Clock className="w-4 h-4" />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link
                                href="/estudiante/mis-horas"
                                className="text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-[#8B1E1E]/10 rounded-lg">
                                    <FileText className="w-5 h-5 text-[#8B1E1E]" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Detalles del Reporte</h1>
                                    <p className="text-sm text-gray-600">
                                        Reporte #{reporte.id.slice(0, 8)}...
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-full ${getEstadoColor(reporte.estado)}`}>
                            {getEstadoIcon(reporte.estado)}
                            {reporte.estado.replace('_', ' ')}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Información Principal */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Información de la Actividad */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Información de la Actividad</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Actividad</label>
                                    <p className="text-gray-900">{reporte.actividad.nombre}</p>
                                </div>
                                
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Convocatoria</label>
                                    <p className="text-gray-900">{reporte.actividad.convocatoria.titulo}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Modalidad</label>
                                        <p className="text-gray-900">{reporte.actividad.convocatoria.modalidad}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Categoría</label>
                                        <div className="flex items-center gap-2">
                                            {reporte.actividad.convocatoria.categoria && (
                                                <>
                                                    <div 
                                                        className="w-3 h-3 rounded-full" 
                                                        style={{ backgroundColor: reporte.actividad.convocatoria.categoria.color_hex || '#8B1E1E' }}
                                                    />
                                                    <span className="text-gray-900">
                                                        {reporte.actividad.convocatoria.categoria.nombre}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {reporte.actividad.convocatoria.lugar && (
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-gray-500" />
                                        <span className="text-gray-900">{reporte.actividad.convocatoria.lugar}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Descripción del Trabajo */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Descripción del Trabajo Realizado</h2>
                            <div className="prose prose-sm max-w-none">
                                <p className="text-gray-700 whitespace-pre-wrap">
                                    {reporte.descripcion_trabajo}
                                </p>
                            </div>
                        </div>

                        {/* Archivos Adjuntos */}
                        {reporte.archivos_soporte && Array.isArray(reporte.archivos_soporte) && reporte.archivos_soporte.length > 0 && (
                            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Archivos de Soporte</h2>
                                <div className="space-y-3">
                                    {reporte.archivos_soporte.map((archivo: any, index: number) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <FileText className="w-4 h-4 text-gray-500" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{archivo.nombre}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {archivo.tipo} • {(archivo.tamaño / 1024 / 1024).toFixed(2)} MB
                                                    </p>
                                                </div>
                                            </div>
                                            <a
                                                href={archivo.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[#8B1E1E] hover:text-[#731919] transition-colors"
                                            >
                                                <Download className="w-4 h-4" />
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Notas Adicionales */}
                        {reporte.notas_estudiante && (
                            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Notas Adicionales</h2>
                                <p className="text-gray-700">{reporte.notas_estudiante}</p>
                            </div>
                        )}

                        {/* Información de Revisión (si aplica) */}
                        {(reporte.estado === 'APROBADO' || reporte.estado === 'RECHAZADO' || reporte.estado === 'REQUIERE_AJUSTE') && (
                            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Información de Revisión</h2>
                                <div className="space-y-4">
                                    {reporte.revisor && (
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-gray-500" />
                                            <span className="text-gray-700">
                                                Revisado por: {reporte.revisor.primer_nombre} {reporte.revisor.primer_apellido}
                                            </span>
                                        </div>
                                    )}
                                    
                                    {reporte.revisado_en && (
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-gray-500" />
                                            <span className="text-gray-700">
                                                Fecha de revisión: {new Date(reporte.revisado_en).toLocaleDateString('es-PE')}
                                            </span>
                                        </div>
                                    )}

                                    {reporte.notas_revisor && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Comentarios del revisor</label>
                                            <p className="text-gray-700 mt-1">{reporte.notas_revisor}</p>
                                        </div>
                                    )}

                                    {reporte.motivo_rechazo && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Motivo del rechazo</label>
                                            <p className="text-red-700 mt-1">{reporte.motivo_rechazo}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Resumen */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                            <h3 className="font-semibold text-gray-900 mb-4">Resumen del Reporte</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Horas reportadas</span>
                                    <span className="font-semibold text-gray-900">{Number(reporte.horas_reportadas)}h</span>
                                </div>
                                
                                {reporte.horas_aprobadas && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Horas aprobadas</span>
                                        <span className="font-semibold text-green-600">{Number(reporte.horas_aprobadas)}h</span>
                                    </div>
                                )}

                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Estado</span>
                                    <span className={`text-sm font-medium ${getEstadoColor(reporte.estado)}`}>
                                        {reporte.estado.replace('_', ' ')}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Fecha de reporte</span>
                                    <span className="text-sm text-gray-900">
                                        {new Date(reporte.reportado_en).toLocaleDateString('es-PE')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Acciones */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                            <h3 className="font-semibold text-gray-900 mb-4">Acciones</h3>
                            <div className="space-y-3">
                                <Link
                                    href="/estudiante/mis-horas"
                                    className="block w-full text-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Volver a Mis Horas
                                </Link>
                                
                                {reporte.estado === 'REQUIERE_AJUSTE' && (
                                    <Link
                                        href="/estudiante/mis-horas/reportar"
                                        className="block w-full text-center px-4 py-2 bg-[#8B1E1E] text-white rounded-lg font-medium hover:bg-[#731919] transition-colors"
                                    >
                                        Reportar Nuevamente
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Información del Estudiante */}
                        <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Información del Estudiante</h3>
                            <div className="space-y-2">
                                <div>
                                    <label className="text-sm text-gray-600">Nombre</label>
                                    <p className="text-gray-900">
                                        {reporte.estudiante.primer_nombre} {reporte.estudiante.primer_apellido}
                                    </p>
                                </div>
                                {reporte.estudiante.perfil_estudiante?.codigo_estudiantil && (
                                    <div>
                                        <label className="text-sm text-gray-600">Código</label>
                                        <p className="text-gray-900">{reporte.estudiante.perfil_estudiante.codigo_estudiantil}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
