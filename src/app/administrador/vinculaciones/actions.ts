'use server';

import { prisma, db } from '@/lib/prisma';
import { EstadoVinculacion } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

async function checkAdmin() {
    const session = await getServerSession(authOptions);
    if (!session?.user || !['ADMINISTRADOR', 'PROFESOR'].includes(session.user.role)) {
        throw new Error('No autorizado');
    }
    return session;
}

/** Obtener vinculaciones con aliado y programa */
export async function getVinculaciones() {
    await checkAdmin();
    return db.execute(async (prisma) => {
        return await prisma.vinculacionAliado.findMany({
            select: {
                id: true,
                estado: true,
                numero_convenio: true,
                fecha_inicio_convenio: true,
                fecha_fin_convenio: true,
                documento_convenio: true,
                creado_en: true,
                revisado_en: true,
                observaciones: true,
                aliado: {
                    select: {
                        primer_nombre: true,
                        primer_apellido: true,
                        correo: true,
                        telefono: true,
                        tipo_documento: true,
                        numero_documento: true
                    }
                },
                programa: {
                    select: {
                        nombre: true,
                        facultad: {
                            select: {
                                nombre: true
                            }
                        }
                    }
                },
                aprobador: {
                    select: {
                        primer_nombre: true,
                        primer_apellido: true,
                        correo: true
                    }
                },
            },
            orderBy: { creado_en: 'desc' },
        });
    }, 'Error al obtener vinculaciones');
}

/** Cambiar estado de la vinculación */
export async function cambiarEstadoVinculacion(id: string, estado: EstadoVinculacion, observaciones?: string) {
    const session = await checkAdmin();

    // Obtener datos anteriores para auditoría
    const vinculacionAnterior = await prisma.vinculacionAliado.findUnique({
        where: { id },
        select: { estado: true, aliado: { select: { primer_nombre: true, primer_apellido: true } } }
    });

    if (!vinculacionAnterior) {
        throw new Error('Vinculación no encontrada');
    }

    // Actualizar vinculación
    const vinculacionActualizada = await prisma.vinculacionAliado.update({
        where: { id },
        data: {
            estado,
            aprobado_por: estado === 'APROBADA' ? session.user.id : undefined,
            revisado_en: new Date(),
            observaciones: observaciones || null,
        },
        include: {
            aliado: { select: { primer_nombre: true, primer_apellido: true, correo: true } },
            programa: { select: { nombre: true } },
        },
    });

    // Registrar log de actividad
    await prisma.logActividad.create({
        data: {
            id_usuario: session.user.id,
            accion: `VINCULACION_${estado}`,
            entidad: 'VinculacionAliado',
            id_entidad: id,
            descripcion: `Vinculación de ${vinculacionActualizada.aliado.primer_nombre} ${vinculacionActualizada.aliado.primer_apellido} con programa ${vinculacionActualizada.programa.nombre} cambió de ${vinculacionAnterior.estado} a ${estado}`,
            datos_anteriores: { estado_anterior: vinculacionAnterior.estado },
            datos_nuevos: { estado_nuevo: estado, observaciones },
            resultado: 'EXITOSO',
        },
    });

    // Crear notificación para el aliado
    if (estado === 'APROBADA') {
        await prisma.notificacion.create({
            data: {
                id_usuario: vinculacionActualizada.id_aliado,
                tipo: 'SISTEMA',
                titulo: '¡Vinculación Aprobada!',
                mensaje: `Tu vinculación con el programa ${vinculacionActualizada.programa.nombre} ha sido aprobada. Ya puedes comenzar a ofrecer actividades.`,
                url_accion: `/aliado/vinculaciones/${id}`,
            },
        });
    } else if (estado === 'RECHAZADA') {
        await prisma.notificacion.create({
            data: {
                id_usuario: vinculacionActualizada.id_aliado,
                tipo: 'SISTEMA',
                titulo: 'Vinculación Rechazada',
                mensaje: `Tu vinculación con el programa ${vinculacionActualizada.programa.nombre} ha sido rechazada. Por favor, contacta al administrador para más detalles.`,
                url_accion: `/aliado/vinculaciones/${id}`,
            },
        });
    }

    revalidatePath('/administrador/vinculaciones');
    return vinculacionActualizada;
}

/** Obtener estadísticas de vinculaciones */
export async function getEstadisticasVinculaciones() {
    await checkAdmin();

    return db.execute(async (prisma) => {
        const [
            total,
            pendientes,
            aprobadas,
            rechazadas,
            suspendidas,
            vencidas
        ] = await Promise.all([
            prisma.vinculacionAliado.count(),
            prisma.vinculacionAliado.count({ where: { estado: 'PENDIENTE' } }),
            prisma.vinculacionAliado.count({ where: { estado: 'APROBADA' } }),
            prisma.vinculacionAliado.count({ where: { estado: 'RECHAZADA' } }),
            prisma.vinculacionAliado.count({ where: { estado: 'SUSPENDIDA' } }),
            prisma.vinculacionAliado.count({ where: { estado: 'VENCIDA' } }),
        ]);

        return {
            total,
            pendientes,
            aprobadas,
            rechazadas,
            suspendidas,
            vencidas,
            tasaAprobacion: total > 0 ? Math.round((aprobadas / total) * 100) : 0,
        };
    }, 'Error al obtener estadísticas de vinculaciones');
}

/** Obtener vinculaciones por estado */
export async function getVinculacionesPorEstado(estado: EstadoVinculacion) {
    await checkAdmin();
    return db.execute(async (prisma) => {
        return await prisma.vinculacionAliado.findMany({
            where: { estado },
            include: {
                aliado: {
                    select: {
                        primer_nombre: true,
                        primer_apellido: true,
                        correo: true,
                        telefono: true
                    }
                },
                programa: {
                    select: {
                        nombre: true,
                        facultad: { select: { nombre: true } }
                    }
                },
                aprobador: {
                    select: {
                        primer_nombre: true,
                        primer_apellido: true
                    }
                },
            },
            orderBy: { creado_en: 'desc' },
        });
    }, `Error al obtener vinculaciones por estado: ${estado}`);
}

/** Actualizar documento de convenio */
export async function actualizarDocumentoConvenio(id: string, urlDocumento: string) {
    const session = await checkAdmin();

    const vinculacion = await prisma.vinculacionAliado.update({
        where: { id },
        data: {
            documento_convenio: urlDocumento,
            revisado_en: new Date(),
        },
        include: {
            aliado: { select: { primer_nombre: true, primer_apellido: true } },
            programa: { select: { nombre: true } },
        },
    });

    // Registrar log
    await prisma.logActividad.create({
        data: {
            id_usuario: session.user.id,
            accion: 'DOCUMENTO_CONVENIO_ACTUALIZADO',
            entidad: 'VinculacionAliado',
            id_entidad: id,
            descripcion: `Documento de convenio actualizado para ${vinculacion.aliado.primer_nombre} ${vinculacion.aliado.primer_apellido} - ${vinculacion.programa.nombre}`,
            resultado: 'EXITOSO',
        },
    });

    revalidatePath('/administrador/vinculaciones');
    return vinculacion;
}

/** Generar reporte de vinculaciones */
export async function generarReporteVinculaciones(formato: 'excel' | 'pdf' = 'excel') {
    await checkAdmin();

    const vinculaciones = await prisma.vinculacionAliado.findMany({
        include: {
            aliado: {
                select: {
                    primer_nombre: true,
                    primer_apellido: true,
                    correo: true,
                    telefono: true,
                    tipo_documento: true,
                    numero_documento: true
                }
            },
            programa: {
                select: {
                    nombre: true,
                    facultad: { select: { nombre: true } }
                }
            },
            aprobador: {
                select: {
                    primer_nombre: true,
                    primer_apellido: true
                }
            },
        },
        orderBy: { creado_en: 'desc' },
    });

    // Aquí iría la lógica para generar el reporte en Excel o PDF
    // Por ahora retornamos los datos para que el frontend los procese
    return {
        datos: vinculaciones,
        formato,
        fechaGeneracion: new Date().toISOString(),
    };
}
