'use server';

import { db } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { TipoActividad, EstadoReporte } from '@prisma/client';

async function checkAdmin() {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMINISTRADOR') throw new Error('No autorizado');
    return session;
}

/**
 * Obtener todas las actividades con información completa
 */
export async function getActividades() {
    await checkAdmin();
    
    try {
        return await db.execute(async (prisma) => {
            const actividades = await prisma.actividad.findMany({
                include: {
                    convocatoria: {
                        select: {
                            id: true,
                            titulo: true,
                            estado: true,
                            modalidad: true,
                            categoria: {
                                select: {
                                    id: true,
                                    nombre: true,
                                    icono: true,
                                    color_hex: true
                                }
                            },
                            programa: {
                                select: {
                                    id: true,
                                    nombre: true,
                                    facultad: {
                                        select: {
                                            id: true,
                                            nombre: true
                                        }
                                    }
                                }
                            }
                        }
                    },
                    creador: {
                        select: {
                            id: true,
                            primer_nombre: true,
                            primer_apellido: true,
                            correo: true,
                            rol: true
                        }
                    },
                    reportes: {
                        select: {
                            id: true,
                            estado: true,
                            horas_reportadas: true,
                            horas_aprobadas: true,
                            reportado_en: true,
                            revisado_en: true,
                            estudiante: {
                                select: {
                                    id: true,
                                    primer_nombre: true,
                                    primer_apellido: true,
                                    correo: true
                                }
                            },
                            revisor: {
                                select: {
                                    id: true,
                                    primer_nombre: true,
                                    primer_apellido: true,
                                    correo: true
                                }
                            }
                        },
                        orderBy: { reportado_en: 'desc' }
                    },
                    _count: {
                        select: { 
                            reportes: true
                        }
                    }
                },
                orderBy: { creado_en: 'desc' }
            });

            return actividades.map(actividad => ({
                ...actividad,
                horas_estimadas: Number(actividad.horas_estimadas),
                horas_maximas: actividad.horas_maximas ? Number(actividad.horas_maximas) : null,
                reportes: actividad.reportes.map(reporte => ({
                    ...reporte,
                    horas_reportadas: Number(reporte.horas_reportadas),
                    horas_aprobadas: reporte.horas_aprobadas ? Number(reporte.horas_aprobadas) : null
                }))
            }));
        }, 'Error al obtener actividades');
    } catch (error) {
        console.error('Error en getActividades:', error);
        throw error;
    }
}

/**
 * Obtener estadísticas completas de actividades
 */
export async function getEstadisticasActividades() {
    await checkAdmin();
    
    try {
        return await db.execute(async (prisma) => {
            const [
                totalActividades,
                actividadesPorTipo,
                actividadesPorEstado,
                totalReportes,
                reportesPorEstado,
                estudiantesUnicos,
                actividadesUltimos7Dias,
                totalHorasReportadas,
                totalHorasAprobadas,
                actividadesConLimiteVencido,
                promedioHorasPorActividad
            ] = await Promise.all([
                // Total de actividades
                prisma.actividad.count(),
                
                // Actividades por tipo
                prisma.actividad.groupBy({
                    by: ['tipo_actividad'],
                    _count: true
                }),
                
                // Actividades por estado activa
                prisma.actividad.groupBy({
                    by: ['esta_activa'],
                    _count: true
                }),
                
                // Total de reportes
                prisma.reporteHoras.count(),
                
                // Reportes por estado
                prisma.reporteHoras.groupBy({
                    by: ['estado'],
                    _count: true
                }),
                
                // Estudiantes únicos con reportes
                prisma.reporteHoras.groupBy({
                    by: ['id_estudiante'],
                    _count: true
                }),
                
                // Actividades últimos 7 días
                prisma.actividad.count({
                    where: {
                        creado_en: {
                            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                        }
                    }
                }),
                
                // Total horas reportadas
                prisma.reporteHoras.aggregate({
                    _sum: { horas_reportadas: true }
                }),
                
                // Total horas aprobadas
                prisma.reporteHoras.aggregate({
                    where: {
                        estado: 'APROBADO'
                    },
                    _sum: { horas_aprobadas: true }
                }),
                
                // Actividades con límite vencido
                prisma.actividad.count({
                    where: {
                        fecha_limite: {
                            lt: new Date()
                        }
                    }
                }),
                
                // Promedio horas por actividad
                prisma.actividad.aggregate({
                    _avg: { horas_estimadas: true }
                })
            ]);

            return {
                totalActividades,
                actividadesPorTipo: actividadesPorTipo.map(item => ({
                    tipo: item.tipo_actividad,
                    cantidad: item._count
                })),
                actividadesPorEstado: actividadesPorEstado.map(item => ({
                    estado: item.esta_activa ? 'ACTIVA' : 'INACTIVA',
                    cantidad: item._count
                })),
                totalReportes,
                reportesPorEstado: reportesPorEstado.map(item => ({
                    estado: item.estado,
                    cantidad: item._count
                })),
                estudiantesUnicos: estudiantesUnicos.length,
                actividadesUltimos7Dias,
                totalHorasReportadas: Number(totalHorasReportadas._sum.horas_reportadas || 0),
                totalHorasAprobadas: Number(totalHorasAprobadas._sum.horas_aprobadas || 0),
                actividadesConLimiteVencido,
                promedioHorasPorActividad: Number(promedioHorasPorActividad._avg.horas_estimadas || 0),
                actividadesPorMes: [] // Simplificado por ahora
            };
        }, 'Error al obtener estadísticas de actividades');
    } catch (error) {
        console.error('Error en getEstadisticasActividades:', error);
        throw error;
    }
}

/**
 * Obtener opciones para filtros
 */
export async function getOpcionesFiltros() {
    await checkAdmin();
    
    try {
        return await db.execute(async (prisma) => {
            const [convocatorias, programas, facultades] = await Promise.all([
                prisma.convocatoria.findMany({
                    select: {
                        id: true,
                        titulo: true,
                        estado: true,
                        modalidad: true,
                        categoria: {
                            select: {
                                id: true,
                                nombre: true,
                                icono: true,
                                color_hex: true
                            }
                        },
                        programa: {
                            select: {
                                id: true,
                                nombre: true,
                                facultad: {
                                    select: {
                                        id: true,
                                        nombre: true
                                    }
                                }
                            }
                        }
                    },
                    orderBy: { titulo: 'asc' }
                }),
                prisma.programa.findMany({
                    select: {
                        id: true,
                        nombre: true,
                        codigo: true,
                        facultad: {
                            select: {
                                id: true,
                                nombre: true
                            }
                        }
                    },
                    orderBy: { nombre: 'asc' }
                }),
                prisma.facultad.findMany({
                    select: {
                        id: true,
                        nombre: true,
                        codigo: true
                    },
                    orderBy: { nombre: 'asc' }
                })
            ]);

            return {
                convocatorias,
                programas,
                facultades
            };
        }, 'Error al obtener opciones de filtros');
    } catch (error) {
        console.error('Error en getOpcionesFiltros:', error);
        throw error;
    }
}

/**
 * Obtener actividad por ID con toda la información
 */
export async function getActividadById(id: string) {
    await checkAdmin();
    
    try {
        return await db.execute(async (prisma) => {
            const actividad = await prisma.actividad.findUnique({
                where: { id },
                include: {
                    convocatoria: {
                        include: {
                            categoria: true,
                            programa: {
                                include: {
                                    facultad: true
                                }
                            },
                            publicador: true
                        }
                    },
                    creador: true,
                    reportes: {
                        include: {
                            estudiante: {
                                include: {
                                    programa: {
                                        include: {
                                            facultad: true
                                        }
                                    },
                                    perfil_estudiante: true
                                }
                            },
                            revisor: true,
                            historial: true
                        },
                        orderBy: { reportado_en: 'desc' }
                    }
                }
            });

            if (!actividad) return null;

            return {
                ...actividad,
                horas_estimadas: Number(actividad.horas_estimadas),
                horas_maximas: actividad.horas_maximas ? Number(actividad.horas_maximas) : null,
                reportes: actividad.reportes.map(reporte => ({
                    ...reporte,
                    horas_reportadas: Number(reporte.horas_reportadas),
                    horas_aprobadas: reporte.horas_aprobadas ? Number(reporte.horas_aprobadas) : null
                }))
            };
        }, 'Error al obtener actividad');
    } catch (error) {
        console.error('Error en getActividadById:', error);
        throw error;
    }
}

/**
 * Activar o desactivar actividad
 */
export async function toggleActividad(id: string, activa: boolean) {
    await checkAdmin();
    
    try {
        return await db.execute(async (prisma) => {
            const actividad = await prisma.actividad.update({
                where: { id },
                data: { esta_activa: activa }
            });

            // Registrar log
            await prisma.logActividad.create({
                data: {
                    accion: activa ? 'ACTIVAR_ACTIVIDAD' : 'DESACTIVAR_ACTIVIDAD',
                    entidad: 'ACTIVIDAD',
                    id_entidad: id,
                    descripcion: `Actividad ${actividad.nombre} ${activa ? 'activada' : 'desactivada'}`,
                    id_usuario: (await getServerSession(authOptions))?.user?.id || ''
                }
            });

            revalidatePath('/administrador/actividades');
            return actividad;
        }, 'Error al cambiar estado de actividad');
    } catch (error) {
        console.error('Error en toggleActividad:', error);
        throw error;
    }
}

/**
 * Eliminar actividad
 */
export async function eliminarActividad(id: string) {
    await checkAdmin();
    
    try {
        return await db.execute(async (prisma) => {
            const actividad = await prisma.actividad.findUnique({
                where: { id }
            });

            if (!actividad) {
                throw new Error('Actividad no encontrada');
            }

            await prisma.actividad.delete({
                where: { id }
            });

            // Registrar log
            await prisma.logActividad.create({
                data: {
                    accion: 'ELIMINAR_ACTIVIDAD',
                    entidad: 'ACTIVIDAD',
                    id_entidad: id,
                    descripcion: `Actividad ${actividad.nombre} eliminada`,
                    id_usuario: (await getServerSession(authOptions))?.user?.id || ''
                }
            });

            revalidatePath('/administrador/actividades');
        }, 'Error al eliminar actividad');
    } catch (error) {
        console.error('Error en eliminarActividad:', error);
        throw error;
    }
}

/**
 * Aprobar reporte de horas
 */
export async function aprobarReporteHoras(idReporte: string, notas?: string) {
    await checkAdmin();
    
    try {
        return await db.execute(async (prisma) => {
            const session = await getServerSession(authOptions);
            const reporte = await prisma.reporteHoras.findUnique({
                where: { id: idReporte },
                include: {
                    estudiante: true,
                    actividad: true
                }
            });

            if (!reporte) {
                throw new Error('Reporte no encontrado');
            }

            if (reporte.estado !== 'REPORTADO') {
                throw new Error('El reporte ya fue procesado');
            }

            // Actualizar reporte
            const reporteActualizado = await prisma.reporteHoras.update({
                where: { id: idReporte },
                data: {
                    estado: 'APROBADO',
                    horas_aprobadas: reporte.horas_reportadas,
                    id_revisor: session?.user?.id,
                    revisado_en: new Date(),
                    notas_revisor: notas
                }
            });

            // Actualizar horas acumuladas del estudiante
            const perfilEstudiante = await prisma.perfilEstudiante.findFirst({
                where: { id_usuario: reporte.id_estudiante }
            });
            
            if (perfilEstudiante) {
                await prisma.perfilEstudiante.update({
                    where: { id_usuario: perfilEstudiante.id_usuario },
                    data: {
                        horas_acumuladas: {
                            increment: Number(reporte.horas_reportadas)
                        }
                    }
                });
            }

            // Registrar log
            await prisma.logActividad.create({
                data: {
                    accion: 'APROBAR_REPORTE_HORAS',
                    entidad: 'REPORTE_HORAS',
                    id_entidad: idReporte,
                    descripcion: `Reporte de ${reporte.horas_reportadas}h aprobado para estudiante ${reporte.estudiante.primer_nombre} ${reporte.estudiante.primer_apellido}`,
                    id_usuario: session?.user?.id || ''
                }
            });

            revalidatePath('/administrador/actividades');
            return reporteActualizado;
        }, 'Error al aprobar reporte de horas');
    } catch (error) {
        console.error('Error en aprobarReporteHoras:', error);
        throw error;
    }
}

/**
 * Rechazar reporte de horas
 */
export async function rechazarReporteHoras(idReporte: string, motivo: string) {
    await checkAdmin();
    
    try {
        return await db.execute(async (prisma) => {
            const session = await getServerSession(authOptions);
            const reporte = await prisma.reporteHoras.findUnique({
                where: { id: idReporte },
                include: {
                    estudiante: true
                }
            });

            if (!reporte) {
                throw new Error('Reporte no encontrado');
            }

            if (reporte.estado !== 'REPORTADO') {
                throw new Error('El reporte ya fue procesado');
            }

            // Actualizar reporte
            const reporteActualizado = await prisma.reporteHoras.update({
                where: { id: idReporte },
                data: {
                    estado: 'RECHAZADO',
                    id_revisor: session?.user?.id,
                    revisado_en: new Date(),
                    motivo_rechazo: motivo
                }
            });

            // Registrar log
            await prisma.logActividad.create({
                data: {
                    accion: 'RECHAZAR_REPORTE_HORAS',
                    entidad: 'REPORTE_HORAS',
                    id_entidad: idReporte,
                    descripcion: `Reporte rechazado para estudiante ${reporte.estudiante.primer_nombre} ${reporte.estudiante.primer_apellido}. Motivo: ${motivo}`,
                    id_usuario: session?.user?.id || ''
                }
            });

            revalidatePath('/administrador/actividades');
            return reporteActualizado;
        }, 'Error al rechazar reporte de horas');
    } catch (error) {
        console.error('Error en rechazarReporteHoras:', error);
        throw error;
    }
}

/**
 * Crear una nueva actividad
 */
export async function crearActividad(data: {
    id_convocatoria: string;
    nombre: string;
    descripcion: string | null;
    tipo_actividad: TipoActividad;
    horas_estimadas: number;
    horas_maximas: number | null;
    fecha_inicio: Date | null;
    fecha_limite: Date | null;
    ubicacion: string | null;
    materiales_requeridos: string[];
    creado_por: string;
}) {
    await checkAdmin();
    
    try {
        const nuevaActividad = await db.execute(async (prisma) => {
            const result = await prisma.actividad.create({
                data: {
                    id_convocatoria: data.id_convocatoria,
                    nombre: data.nombre,
                    descripcion: data.descripcion,
                    tipo_actividad: data.tipo_actividad,
                    horas_estimadas: data.horas_estimadas,
                    horas_maximas: data.horas_maximas,
                    fecha_inicio: data.fecha_inicio,
                    fecha_limite: data.fecha_limite,
                    ubicacion: data.ubicacion,
                    materiales_requeridos: data.materiales_requeridos,
                    creado_por: data.creado_por,
                    esta_activa: true,
                },
                include: {
                    convocatoria: {
                        include: {
                            categoria: true,
                            programa: true,
                        },
                    },
                    creador: {
                        select: {
                            id: true,
                            primer_nombre: true,
                            primer_apellido: true,
                            correo: true,
                        },
                    },
                },
            });

            const session = await getServerSession(authOptions);
            await prisma.logActividad.create({
                data: {
                    id_usuario: session?.user?.id || data.creado_por,
                    accion: 'CREAR_ACTIVIDAD',
                    entidad: 'ACTIVIDAD',
                    id_entidad: result.id,
                    descripcion: `Nueva actividad '${result.nombre}' creada para la convocatoria '${result.convocatoria.titulo}'`,
                    resultado: 'EXITOSO',
                }
            });

            return result;
        }, 'Error al crear actividad');

        revalidatePath('/administrador/actividades');
        return nuevaActividad;
    } catch (error) {
        console.error('Error en crearActividad:', error);
        throw error;
    }
}
