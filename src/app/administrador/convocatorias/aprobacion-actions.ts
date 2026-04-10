'use server';

import { db } from '@/lib/prisma';
import { EstadoConvocatoria } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

/**
 * Validar permisos de ADMINISTRADOR
 */
async function checkAdministrador() {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMINISTRADOR') {
        throw new Error('No autorizado - Solo administradores');
    }
    return session;
}

/**
 * Obtener convocatorias pendientes de aprobación (ESPERANDO_CONFIRMACION)
 */
export async function getConvocatoriasPendientesAprobacion() {
    await checkAdministrador();

    try {
        return await db.execute(async (prisma) => {
            const convocatorias = await prisma.convocatoria.findMany({
                where: {
                    estado: EstadoConvocatoria.ESPERANDO_CONFIRMACION
                },
                include: {
                    categoria: true,
                    programa: {
                        include: {
                            facultad: true
                        }
                    },
                    publicador: {
                        select: {
                            id: true,
                            primer_nombre: true,
                            primer_apellido: true,
                            correo: true,
                            rol: true,
                        },
                    },
                    _count: {
                        select: {
                            actividades: true
                        }
                    }
                },
                orderBy: {
                    creado_en: 'desc'
                }
            });

            return convocatorias.map(conv => ({
                ...conv,
                horas_totales_ofrecidas: conv.horas_totales_ofrecidas ? Number(conv.horas_totales_ofrecidas) : null,
                programa: conv.programa ? {
                    ...conv.programa,
                    horas_requeridas: conv.programa.horas_requeridas ? Number(conv.programa.horas_requeridas) : null
                } : null
            }));
        }, 'Error al obtener convocatorias pendientes');
    } catch (error) {
        console.error('Error en getConvocatoriasPendientesAprobacion:', error);
        throw error;
    }
}

/**
 * Aprobar convocatoria - cambia estado a PUBLICADA
 */
export async function aprobarConvocatoria(id: string, notas?: string) {
    const session = await checkAdministrador();

    try {
        return await db.execute(async (prisma) => {
            const convocatoria = await prisma.convocatoria.update({
                where: { id },
                data: {
                    estado: EstadoConvocatoria.PUBLICADA,
                    publicado_en: new Date(),
                    actualizado_en: new Date()
                },
                include: {
                    publicador: {
                        select: {
                            primer_nombre: true,
                            primer_apellido: true,
                            correo: true
                        }
                    }
                }
            });

            // TODO: Enviar notificación al creador
            
            revalidatePath('/administrador/convocatorias/pendientes');
            revalidatePath('/administrador/convocatorias');
            
            return {
                ...convocatoria,
                horas_totales_ofrecidas: convocatoria.horas_totales_ofrecidas ? Number(convocatoria.horas_totales_ofrecidas) : null
            };
        }, 'Error al aprobar convocatoria');
    } catch (error) {
        console.error('Error en aprobarConvocatoria:', error);
        throw error;
    }
}

/**
 * Rechazar convocatoria - cambia estado a RECHAZADA
 */
export async function rechazarConvocatoria(id: string, motivo: string) {
    const session = await checkAdministrador();

    if (!motivo || motivo.trim().length === 0) {
        throw new Error('El motivo de rechazo es obligatorio');
    }

    try {
        return await db.execute(async (prisma) => {
            const convocatoria = await prisma.convocatoria.update({
                where: { id },
                data: {
                    estado: EstadoConvocatoria.RECHAZADA,
                    actualizado_en: new Date()
                },
                include: {
                    publicador: {
                        select: {
                            primer_nombre: true,
                            primer_apellido: true,
                            correo: true
                        }
                    }
                }
            });

            // TODO: Enviar notificación al creador con el motivo
            
            revalidatePath('/administrador/convocatorias/pendientes');
            revalidatePath('/administrador/convocatorias');
            
            return {
                ...convocatoria,
                horas_totales_ofrecidas: convocatoria.horas_totales_ofrecidas ? Number(convocatoria.horas_totales_ofrecidas) : null
            };
        }, 'Error al rechazar convocatoria');
    } catch (error) {
        console.error('Error en rechazarConvocatoria:', error);
        throw error;
    }
}

/**
 * Devolver convocatoria a borrador - cambia estado a BORRADOR
 */
export async function devolverConvocatoriaABorrador(id: string, observaciones: string) {
    const session = await checkAdministrador();

    if (!observaciones || observaciones.trim().length === 0) {
        throw new Error('Las observaciones son obligatorias para devolver a borrador');
    }

    try {
        return await db.execute(async (prisma) => {
            const convocatoria = await prisma.convocatoria.update({
                where: { id },
                data: {
                    estado: EstadoConvocatoria.BORRADOR,
                    actualizado_en: new Date()
                },
                include: {
                    publicador: {
                        select: {
                            primer_nombre: true,
                            primer_apellido: true,
                            correo: true
                        }
                    }
                }
            });

            // TODO: Enviar notificación al creador con las observaciones
            
            revalidatePath('/administrador/convocatorias/pendientes');
            revalidatePath('/administrador/convocatorias');
            
            return {
                ...convocatoria,
                horas_totales_ofrecidas: convocatoria.horas_totales_ofrecidas ? Number(convocatoria.horas_totales_ofrecidas) : null
            };
        }, 'Error al devolver convocatoria a borrador');
    } catch (error) {
        console.error('Error en devolverConvocatoriaABorrador:', error);
        throw error;
    }
}

/**
 * Obtener estadísticas de aprobación para dashboard
 */
export async function getEstadisticasAprobacion() {
    await checkAdministrador();

    try {
        return await db.execute(async (prisma) => {
            const [
                pendientes,
                aprobadasMes,
                rechazadasMes
            ] = await Promise.all([
                prisma.convocatoria.count({
                    where: { estado: EstadoConvocatoria.ESPERANDO_CONFIRMACION }
                }),
                prisma.convocatoria.count({
                    where: {
                        estado: EstadoConvocatoria.PUBLICADA,
                        actualizado_en: {
                            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                        }
                    }
                }),
                prisma.convocatoria.count({
                    where: {
                        estado: EstadoConvocatoria.RECHAZADA,
                        actualizado_en: {
                            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                        }
                    }
                })
            ]);

            return {
                pendientes,
                aprobadasMes,
                rechazadasMes
            };
        }, 'Error al obtener estadísticas');
    } catch (error) {
        console.error('Error en getEstadisticasAprobacion:', error);
        throw error;
    }
}
