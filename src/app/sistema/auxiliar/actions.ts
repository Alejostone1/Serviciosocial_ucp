'use server';

import { db } from '@/lib/prisma';
import { EstadoPostulacion, EstadoReporte, Rol } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

async function checkAuxiliar() {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user.role !== 'AUXILIAR' && session.user.role !== 'ADMINISTRADOR')) {
        throw new Error('No autorizado');
    }
    return session;
}

/**
 * --- GESTIÓN DE POSTULACIONES ---
 */

export async function getPostulacionesAuxiliar() {
    await checkAuxiliar();
    return await db.execute(async (prisma) => {
        const postulaciones = await prisma.postulacion.findMany({
            include: {
                estudiante: {
                    select: {
                        primer_nombre: true,
                        primer_apellido: true,
                        numero_documento: true,
                        correo: true,
                        programa: true
                    }
                },
                convocatoria: {
                    select: {
                        titulo: true,
                        modalidad: true
                    }
                }
            },
            orderBy: { postulado_en: 'desc' }
        });

        return postulaciones.map(post => ({
            ...post,
            estudiante: {
                ...post.estudiante,
                programa: post.estudiante.programa ? {
                    ...post.estudiante.programa,
                    horas_requeridas: (post.estudiante.programa as any).horas_requeridas ? Number((post.estudiante.programa as any).horas_requeridas) : null
                } : null
            }
        }));
    }, 'Error al obtener postulaciones');
}

export async function actualizarEstadoPostulacion(id: string, nuevoEstado: EstadoPostulacion, notas?: string) {
    const session = await checkAuxiliar();
    return await db.execute(async (prisma) => {
        const post = await prisma.postulacion.update({
            where: { id },
            data: {
                estado: nuevoEstado,
                revisado_por: session.user.id,
                revisado_en: new Date(),
                notas_revision: notas
            }
        });

        // Crear notificación para el estudiante
        await prisma.notificacion.create({
            data: {
                id_usuario: post.id_estudiante,
                tipo: 'SISTEMA',
                titulo: `Estado de postulación actualizado`,
                mensaje: `Tu postulación ha sido marcada como ${nuevoEstado}.`,
            }
        });

        revalidatePath('/sistema/auxiliar/postulaciones');
        return post;
    }, 'Error al actualizar postulación');
}

/**
 * --- GESTIÓN DE HORAS ---
 */

export async function getReportesParaValidar() {
    await checkAuxiliar();
    return await db.execute(async (prisma) => {
        const reportes = await prisma.reporteHoras.findMany({
            where: {
                estado: {
                    in: ['REPORTADO', 'PENDIENTE_VALIDACION']
                }
            },
            include: {
                estudiante: {
                    select: {
                        primer_nombre: true,
                        primer_apellido: true,
                        numero_documento: true
                    }
                },
                actividad: {
                    select: {
                        nombre: true,
                        convocatoria: {
                            select: { titulo: true }
                        }
                    }
                }
            },
            orderBy: { reportado_en: 'desc' }
        });

        return reportes.map(r => ({
            ...r,
            horas_reportadas: Number(r.horas_reportadas)
        }));
    }, 'Error al obtener reportes');
}

/**
 * Validar horas (Paso de Auxiliar)
 */
export async function validarReporteAuxiliar(id: string, horasValidadas: number, notas?: string) {
    const session = await checkAuxiliar();
    return await db.execute(async (prisma) => {
        const reporte = await prisma.reporteHoras.update({
            where: { id },
            data: {
                estado: EstadoReporte.VALIDADO_AUXILIAR,
                horas_aprobadas: horasValidadas,
                id_revisor: session.user.id,
                revisado_en: new Date(),
                notas_revisor: notas
            }
        });

        // Registrar en historial
        await prisma.historialHoras.create({
            data: {
                id_reporte_horas: id,
                modificado_por: session.user.id,
                estado_anterior: 'REPORTADO',
                estado_nuevo: 'VALIDADO_AUXILIAR',
                horas_anteriores: null,
                horas_nuevas: horasValidadas,
                razon: 'Validación por Auxiliar'
            }
        });

        revalidatePath('/sistema/auxiliar/validacion');
        return {
            ...reporte,
            horas_reportadas: Number(reporte.horas_reportadas),
            horas_aprobadas: reporte.horas_aprobadas ? Number(reporte.horas_aprobadas) : null
        };
    }, 'Error al validar reporte');
}

/**
 * Auxiliar registra horas directamente (Soporte)
 */
export async function registrarHorasEstudianteAuxiliar(data: {
    id_estudiante: string,
    id_actividad: string,
    horas: number,
    descripcion: string
}) {
    const session = await checkAuxiliar();
    return await db.execute(async (prisma) => {
        const reporte = await prisma.reporteHoras.create({
            data: {
                id_estudiante: data.id_estudiante,
                id_actividad: data.id_actividad,
                horas_reportadas: data.horas,
                descripcion_trabajo: data.descripcion,
                estado: EstadoReporte.VALIDADO_AUXILIAR,
                id_revisor: session.user.id,
                revisado_en: new Date(),
                notas_revisor: 'Registrado directamente por Auxiliar Administrativo'
            }
        });

        revalidatePath('/sistema/auxiliar/validacion');
        return {
            ...reporte,
            horas_reportadas: Number(reporte.horas_reportadas),
            horas_aprobadas: reporte.horas_aprobadas ? Number(reporte.horas_aprobadas) : null
        };
    }, 'Error al registrar horas');
}

/**
 * Obtener lista de estudiantes activos para autocompletar formularios
 */
export async function getEstudiantesActivos() {
    await checkAuxiliar();
    return await db.execute(async (prisma) => {
        return await prisma.usuario.findMany({
            where: { rol: 'ESTUDIANTE' },
            select: {
                id: true,
                primer_nombre: true,
                primer_apellido: true,
                numero_documento: true
            }
        });
    }, 'Error al obtener estudiantes');
}

/**
 * Obtener actividades de una convocatoria para registro
 */
export async function getActividadesPorConvocatoria(idConv: string) {
    await checkAuxiliar();
    return await db.execute(async (prisma) => {
        const actividades = await prisma.actividad.findMany({
            where: { id_convocatoria: idConv, esta_activa: true }
        });
        return actividades.map(act => ({
            ...act,
            horas_estimadas: act.horas_estimadas ? Number(act.horas_estimadas) : 0
        }));
    }, 'Error al obtener actividades');
}

/**
 * Obtener estadísticas para el dashboard del auxiliar
 */
export async function getDashboardStatsAuxiliar() {
    await checkAuxiliar();
    return await db.execute(async (prisma) => {
        const [
            horasPorValidar,
            postulacionesPendientes,
            estudiantesActivos,
            reportesMes
        ] = await Promise.all([
            prisma.reporteHoras.count({ where: { estado: { in: ['REPORTADO', 'PENDIENTE_VALIDACION'] } } }),
            prisma.postulacion.count({ where: { estado: 'PENDIENTE' } }),
            prisma.usuario.count({ where: { rol: 'ESTUDIANTE', esta_bloqueado: false } }),
            prisma.reporteHoras.count({ 
                where: { 
                    reportado_en: { 
                        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) 
                    } 
                } 
            })
        ]);

        // Tareas prioritarias (últimos reportes y postulaciones)
        const [ultimosReportes, ultimasPostulaciones] = await Promise.all([
            prisma.reporteHoras.findMany({
                take: 3,
                where: { estado: 'REPORTADO' },
                include: { estudiante: { select: { primer_nombre: true, primer_apellido: true } } },
                orderBy: { reportado_en: 'desc' }
            }),
            prisma.postulacion.findMany({
                take: 2,
                where: { estado: 'PENDIENTE' },
                include: { 
                    estudiante: { select: { primer_nombre: true, primer_apellido: true } },
                    convocatoria: { select: { titulo: true } }
                },
                orderBy: { postulado_en: 'desc' }
            })
        ]);

        const mappedPrioritarias = [
            ...ultimosReportes.map(r => ({
                title: `Validar ${Number(r.horas_reportadas)}h - ${r.estudiante.primer_nombre}`,
                desc: 'Nuevo reporte de horas',
                time: r.reportado_en,
                priority: 'High',
                type: 'HORAS'
            })),
            ...ultimasPostulaciones.map(p => ({
                title: `Postulación: ${p.estudiante.primer_nombre}`,
                desc: p.convocatoria.titulo,
                time: p.postulado_en,
                priority: 'Medium',
                type: 'POSTULACION'
            }))
        ];

        return {
            stats: { horasPorValidar, postulacionesPendientes, estudiantesActivos, reportesMes },
            prioritarias: mappedPrioritarias
        };
    }, 'Error al obtener estadísticas del dashboard');
}

/**
 * Obtener lista detallada de estudiantes con sus horas y programas
 */
export async function getEstudiantesDetalladosAuxiliar() {
    await checkAuxiliar();
    return await db.execute(async (prisma) => {
        const estudiantes = await prisma.usuario.findMany({
            where: { 
                rol: 'ESTUDIANTE',
                esta_bloqueado: false 
            },
            include: {
                programa: {
                    select: {
                        nombre: true,
                        horas_requeridas: true
                    }
                },
                perfil_estudiante: {
                    select: {
                        horas_acumuladas: true
                    }
                }
            },
            orderBy: { primer_apellido: 'asc' }
        });

        return estudiantes.map(est => ({
            id: est.id,
            nombreCompleto: `${est.primer_nombre} ${est.primer_apellido}`,
            documento: est.numero_documento,
            correo: est.correo,
            programa: est.programa?.nombre || 'No asignado',
            horasAcumuladas: est.perfil_estudiante?.horas_acumuladas ? Number(est.perfil_estudiante.horas_acumuladas) : 0,
            horasRequeridas: est.programa?.horas_requeridas ? Number(est.programa.horas_requeridas) : 120,
        }));
    }, 'Error al obtener directorio de estudiantes');
}

/**
 * Crear una nueva actividad para una convocatoria
 */
export async function crearActividadAuxiliar(data: {
    id_convocatoria: string;
    nombre: string;
    descripcion: string;
    tipo_actividad: string;
    horas_estimadas: number;
    ubicacion?: string;
}) {
    const session = await checkAuxiliar();
    return await db.execute(async (prisma) => {
        const actividad = await prisma.actividad.create({
            data: {
                id_convocatoria: data.id_convocatoria,
                nombre: data.nombre,
                descripcion: data.descripcion,
                tipo_actividad: data.tipo_actividad as any,
                horas_estimadas: data.horas_estimadas,
                ubicacion: data.ubicacion,
                creado_por: session.user.id
            }
        });

        revalidatePath('/sistema/auxiliar/actividades');
        revalidatePath(`/sistema/auxiliar/convocatorias/${data.id_convocatoria}`);
        
        return {
            ...actividad,
            horas_estimadas: Number(actividad.horas_estimadas)
        };
    }, 'Error al crear actividad');
}
