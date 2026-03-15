'use server';

import { db } from '@/lib/prisma';
import { EstadoReporte } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

async function checkAuth() {
    const session = await getServerSession(authOptions);
    if (!session?.user || !['PROFESOR', 'ALIADO', 'ADMINISTRADOR'].includes(session.user.role)) {
        throw new Error('No autorizado');
    }
    return session;
}

/**
 * Obtener reportes que necesitan aprobación final
 * (Incluye los que ya fueron validados por un Auxiliar)
 */
export async function getReportesParaAprobacionFinal() {
    await checkAuth();
    return await db.execute(async (prisma) => {
        const reportes = await prisma.reporteHoras.findMany({
            where: {
                estado: {
                    in: ['REPORTADO', 'PENDIENTE_VALIDACION', 'VALIDADO_AUXILIAR' as any, 'EN_REVISION']
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
                            select: { 
                                titulo: true,
                                publicador: {
                                    select: {
                                        primer_nombre: true,
                                        rol: true
                                    }
                                }
                            }
                        }
                    }
                },
                revisor: {
                    select: {
                        primer_nombre: true,
                        rol: true
                    }
                }
            },
            orderBy: { reportado_en: 'desc' }
        });

        return reportes.map(r => ({
            ...r,
            horas_reportadas: Number(r.horas_reportadas),
            horas_aprobadas: r.horas_aprobadas ? Number(r.horas_aprobadas) : null
        }));
    }, 'Error al obtener reportes');
}

/**
 * Aprobación final de horas
 */
export async function aprobarReporteFinal(id: string, horasFinales: number, notas?: string) {
    const session = await checkAuth();
    return await db.execute(async (prisma) => {
        const reporte = await prisma.reporteHoras.update({
            where: { id },
            data: {
                estado: 'APROBADO',
                horas_aprobadas: horasFinales,
                id_revisor: session.user.id,
                revisado_en: new Date(),
                notas_revisor: notas || 'Aprobación final concedida.'
            },
            include: {
                estudiante: {
                    select: { id: true }
                }
            }
        });

        // Actualizar horas acumuladas del estudiante
        const perfil = await prisma.perfilEstudiante.findUnique({
            where: { id_usuario: reporte.id_estudiante }
        });

        if (perfil) {
            const nuevasHoras = Number(perfil.horas_acumuladas) + horasFinales;
            await prisma.perfilEstudiante.update({
                where: { id_usuario: reporte.id_estudiante },
                data: {
                    horas_acumuladas: nuevasHoras,
                    // Deberíamos recalcular el porcentaje aquí si tenemos el total requerido
                }
            });
        }

        // Notificación de éxito
        await prisma.notificacion.create({
            data: {
                id_usuario: reporte.id_estudiante,
                tipo: 'SISTEMA',
                titulo: 'Horas Aprobadas',
                mensaje: `Se han aprobado ${horasFinales} horas de tu reporte en la actividad.`,
            }
        });

        revalidatePath('/sistema/profesor/reportes');
        revalidatePath('/sistema/aliado/validacion');
        return reporte;
    }, 'Error en aprobación final');
}

/**
 * Rechazo de horas con motivo
 */
export async function rechazarReporteFinal(id: string, motivo: string) {
    const session = await checkAuth();
    return await db.execute(async (prisma) => {
        const reporte = await prisma.reporteHoras.update({
            where: { id },
            data: {
                estado: 'RECHAZADO',
                motivo_rechazo: motivo,
                id_revisor: session.user.id,
                revisado_en: new Date()
            }
        });

        await prisma.notificacion.create({
            data: {
                id_usuario: reporte.id_estudiante,
                tipo: 'SISTEMA',
                titulo: 'Reporte de Horas Rechazado',
                mensaje: `Tu reporte de horas ha sido rechazado. Motivo: ${motivo}`,
            }
        });

        revalidatePath('/sistema/profesor/reportes');
        return reporte;
    }, 'Error al rechazar reporte');
}
