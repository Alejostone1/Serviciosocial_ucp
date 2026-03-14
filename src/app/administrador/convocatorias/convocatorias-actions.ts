'use server';

import { prisma, db } from '@/lib/prisma';
import { EstadoConvocatoria, Modalidad } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

/**
 * Validar permisos de ADMINISTRADOR
 */
async function checkAdmin() {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMINISTRADOR') {
        throw new Error('No autorizado');
    }
    return session;
}

/**
 * Obtener todas las convocatorias con información completa
 */
export async function getConvocatoriasAdmin() {
    await checkAdmin();

    try {
        return await db.execute(async (prisma) => {
            const convocatorias = await prisma.convocatoria.findMany({
                select: {
                    id: true,
                    titulo: true,
                    descripcion: true,
                    objetivo: true,
                    modalidad: true,
                    lugar: true,
                    url_convocatoria_externa: true,
                    competencias_requeridas: true,
                    estado: true,
                    fecha_inicio: true,
                    fecha_fin: true,
                    fecha_cierre_postulacion: true,
                    cupo_maximo: true,
                    cupo_disponible: true,
                    horas_totales_ofrecidas: true,
                    url_banner: true,
                    url_documento_adicional: true,
                    requiere_entrevista: true,
                    creado_en: true,
                    publicado_en: true,
                    actualizado_en: true,
                    publicado_por: true,
                    id_categoria: true,
                    id_programa: true,
                    publicador: {
                        select: {
                            id: true,
                            primer_nombre: true,
                            primer_apellido: true,
                            correo: true,
                            rol: true
                        }
                    },
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
                            codigo: true,
                            facultad: {
                                select: {
                                    id: true,
                                    nombre: true
                                }
                            }
                        }
                    },
                    _count: {
                        select: {
                            postulaciones: true,
                            actividades: true,
                            certificados: true
                        }
                    },
                    actividades: {
                        select: {
                            id: true,
                            nombre: true,
                            tipo_actividad: true,
                            horas_estimadas: true,
                            esta_activa: true
                        }
                    }
                },
                orderBy: {
                    creado_en: 'desc'
                }
            });

            // Convertir Decimal a number y asegurar que _count exista
            return convocatorias.map(conv => ({
                ...conv,
                horas_totales_ofrecidas: conv.horas_totales_ofrecidas ? Number(conv.horas_totales_ofrecidas) : null,
                actividades: conv.actividades?.map(act => ({
                    ...act,
                    horas_estimadas: Number(act.horas_estimadas)
                })),
                _count: conv._count || { postulaciones: 0, actividades: 0, certificados: 0 }
            }));
        }, 'Error al obtener convocatorias');
    } catch (error) {
        console.error('Error en getConvocatoriasAdmin:', error);
        throw error;
    }
}

/**
 * Obtener una convocatoria por ID con todos sus detalles
 */
export async function getConvocatoriaById(id: string) {
    await checkAdmin();

    try {
        return await db.execute(async (prisma) => {
            const convocatoria = await prisma.convocatoria.findUnique({
                where: { id },
                include: {
                    publicador: {
                        select: {
                            id: true,
                            primer_nombre: true,
                            primer_apellido: true,
                            correo: true
                        }
                    },
                    categoria: true,
                    programa: {
                        include: {
                            facultad: true
                        }
                    },
                    actividades: {
                        select: {
                            id: true,
                            nombre: true,
                            descripcion: true,
                            tipo_actividad: true,
                            horas_estimadas: true,
                            horas_maximas: true,
                            fecha_inicio: true,
                            fecha_limite: true,
                            ubicacion: true,
                            esta_activa: true,
                            creador: {
                                select: {
                                    primer_nombre: true,
                                    primer_apellido: true
                                }
                            }
                        }
                    },
                    postulaciones: {
                        select: {
                            id: true,
                            estado: true,
                            motivacion: true,
                            postulado_en: true,
                            estudiante: {
                                select: {
                                    id: true,
                                    primer_nombre: true,
                                    primer_apellido: true,
                                    correo: true,
                                    numero_documento: true
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
                        orderBy: {
                            postulado_en: 'desc'
                        }
                    }
                }
            });

            if (!convocatoria) return null;

            // Convertir Decimals a numbers y enums a strings
            return {
                ...convocatoria,
                horas_totales_ofrecidas: convocatoria.horas_totales_ofrecidas ? Number(convocatoria.horas_totales_ofrecidas) : null,
                actividades: convocatoria.actividades.map(act => ({
                    ...act,
                    tipo_actividad: act.tipo_actividad as string,
                    horas_estimadas: Number(act.horas_estimadas),
                    horas_maximas: act.horas_maximas ? Number(act.horas_maximas) : null
                })),
                postulaciones: convocatoria.postulaciones.map(post => ({
                    ...post,
                    estado: post.estado as string
                }))
            };
        }, 'Error al obtener convocatoria');
    } catch (error) {
        console.error('Error en getConvocatoriaById:', error);
        throw error;
    }
}

/**
 * Crear convocatoria con actividades integradas
 */
export async function crearConvocatoriaConActividades(data: any) {
    await checkAdmin();

    try {
        return await db.execute(async (prisma) => {
            // Obtener el ID del usuario
            const session = await getServerSession(authOptions);
            const userId = session?.user?.id;

            if (!userId) {
                throw new Error('Usuario no autenticado');
            }

            // Crear la convocatoria
            const convocatoria = await prisma.convocatoria.create({
                data: {
                    titulo: data.titulo,
                    descripcion: data.descripcion,
                    objetivo: data.objetivo || null,
                    id_categoria: data.id_categoria || null,
                    id_programa: data.programa || null,
                    modalidad: data.modalidad,
                    lugar: data.lugar || null,
                    url_convocatoria_externa: data.url_convocatoria_externa || null,
                    competencias_requeridas: data.competencias_requeridas || [],
                    estado: data.estado || 'BORRADOR',
                    fecha_inicio: new Date(data.fecha_inicio),
                    fecha_fin: data.fecha_fin ? new Date(data.fecha_fin) : null,
                    fecha_cierre_postulacion: data.fecha_cierre_postulacion ? new Date(data.fecha_cierre_postulacion) : null,
                    cupo_maximo: data.cupo_maximo || null,
                    cupo_disponible: data.cupo_disponible || data.cupo_maximo || null,
                    horas_totales_ofrecidas: data.horas_totales_ofrecidas || null,
                    url_banner: data.url_banner || null,
                    url_documento_adicional: data.url_documento_adicional || null,
                    requiere_entrevista: data.requiere_entrevista || false,
                    publicado_por: userId,
                },
                include: {
                    categoria: true,
                    programa: true,
                    publicador: {
                        select: {
                            primer_nombre: true,
                            primer_apellido: true,
                            correo: true,
                        }
                    }
                }
            });

            // Crear actividades si existen
            if (data.actividades && data.actividades.length > 0) {
                // Obtener el ID del usuario una sola vez
                const session = await getServerSession(authOptions);
                const userId = session?.user?.id;

                const actividades = await prisma.actividad.createMany({
                    data: data.actividades.map((actividad: any) => ({
                        id_convocatoria: convocatoria.id,
                        nombre: actividad.nombre,
                        descripcion: actividad.descripcion || null,
                        tipo_actividad: actividad.tipo_actividad,
                        horas_estimadas: actividad.horas_estimadas,
                        horas_maximas: actividad.horas_maximas || null,
                        fecha_inicio: actividad.fecha_inicio ? new Date(actividad.fecha_inicio) : null,
                        fecha_limite: actividad.fecha_limite ? new Date(actividad.fecha_limite) : null,
                        ubicacion: actividad.ubicacion || null,
                        materiales_requeridos: actividad.materiales_requeridos || [],
                        esta_activa: true,
                        creado_por: userId,
                    })),
                });

                // Obtener las actividades creadas con relaciones
                const actividadesCreadas = await prisma.actividad.findMany({
                    where: {
                        id_convocatoria: convocatoria.id
                    },
                    include: {
                        convocatoria: {
                            select: {
                                id: true,
                                titulo: true,
                                modalidad: true,
                            }
                        }
                    }
                });

                // Convertir Decimals a numbers
                const actividadesConvertidas = actividadesCreadas.map(act => ({
                    ...act,
                    horas_estimadas: Number(act.horas_estimadas),
                    horas_maximas: act.horas_maximas ? Number(act.horas_maximas) : null,
                }));

                return {
                    ...convocatoria,
                    horas_totales_ofrecidas: convocatoria.horas_totales_ofrecidas ? Number(convocatoria.horas_totales_ofrecidas) : null,
                    actividades: actividadesConvertidas,
                    total_actividades: actividadesConvertidas.length
                };
            }

            return {
                ...convocatoria,
                horas_totales_ofrecidas: convocatoria.horas_totales_ofrecidas ? Number(convocatoria.horas_totales_ofrecidas) : null,
                actividades: [],
                total_actividades: 0
            };
        }, 'Error al crear convocatoria con actividades');
    } catch (error) {
        console.error('Error en crearConvocatoriaConActividades:', error);
        throw error;
    }
}

/**
 * Crear una nueva convocatoria
 */
export async function crearConvocatoria(data: {
    titulo: string;
    descripcion: string;
    objetivo?: string;
    id_categoria?: string;
    id_programa?: string;
    modalidad: Modalidad;
    lugar?: string;
    url_convocatoria_externa?: string;
    competencias_requeridas: string[];
    fecha_inicio: Date;
    fecha_fin?: Date;
    fecha_cierre_postulacion?: Date;
    cupo_maximo?: number;
    cupo_disponible?: number;
    horas_totales_ofrecidas?: number;
    url_banner?: string;
    url_documento_adicional?: string;
    requiere_entrevista?: boolean;
}) {
    const session = await checkAdmin();

    try {
        return await db.transaction(async (prisma) => {
            const convocatoria = await prisma.convocatoria.create({
                data: {
                    ...data,
                    publicado_por: session.user.id,
                    cupo_disponible: data.cupo_disponible ?? data.cupo_maximo,
                },
                include: {
                    publicador: {
                        select: {
                            primer_nombre: true,
                            primer_apellido: true
                        }
                    },
                    categoria: true,
                    programa: {
                        select: {
                            nombre: true,
                            facultad: {
                                select: { nombre: true }
                            }
                        }
                    }
                }
            });

            // Registrar en log de actividad
            await prisma.logActividad.create({
                data: {
                    id_usuario: session.user.id,
                    accion: 'CREAR_CONVOCATORIA',
                    entidad: 'Convocatoria',
                    id_entidad: convocatoria.id,
                    descripcion: `Convocatoria '${convocatoria.titulo}' creada`,
                    resultado: 'EXITOSO',
                }
            });

            revalidatePath('/administrador/convocatorias');
            // Convertir Decimal a number para evitar problemas de serialización
            return {
                ...convocatoria,
                horas_totales_ofrecidas: convocatoria.horas_totales_ofrecidas ? Number(convocatoria.horas_totales_ofrecidas) : null,
            };
        }, 'Error al crear convocatoria');
    } catch (error) {
        console.error('Error en crearConvocatoria:', error);
        throw error;
    }
}

/**
 * Actualizar una convocatoria existente
 */
export async function actualizarConvocatoria(id: string, data: Partial<{
    titulo: string;
    descripcion: string;
    objetivo: string;
    id_categoria: string;
    id_programa: string;
    modalidad: Modalidad;
    lugar: string;
    url_convocatoria_externa: string;
    competencias_requeridas: string[];
    fecha_inicio: Date;
    fecha_fin: Date;
    fecha_cierre_postulacion: Date;
    cupo_maximo: number;
    cupo_disponible: number;
    horas_totales_ofrecidas: number;
    url_banner: string;
    url_documento_adicional: string;
    requiere_entrevista: boolean;
}>) {
    const session = await checkAdmin();

    try {
        return await db.transaction(async (prisma) => {
            const convocatoria = await prisma.convocatoria.update({
                where: { id },
                data,
                include: {
                    publicador: {
                        select: {
                            primer_nombre: true,
                            primer_apellido: true
                        }
                    },
                    categoria: true,
                    programa: {
                        select: {
                            nombre: true,
                            facultad: {
                                select: { nombre: true }
                            }
                        }
                    }
                }
            });

            // Registrar en log de actividad
            await prisma.logActividad.create({
                data: {
                    id_usuario: session.user.id,
                    accion: 'ACTUALIZAR_CONVOCATORIA',
                    entidad: 'Convocatoria',
                    id_entidad: id,
                    descripcion: `Convocatoria '${convocatoria.titulo}' actualizada`,
                    resultado: 'EXITOSO',
                }
            });

            revalidatePath('/administrador/convocatorias');
            // Convertir Decimal a number para evitar problemas de serialización
            return {
                ...convocatoria,
                horas_totales_ofrecidas: convocatoria.horas_totales_ofrecidas ? Number(convocatoria.horas_totales_ofrecidas) : null,
            };
        }, 'Error al actualizar convocatoria');
    } catch (error) {
        console.error('Error en actualizarConvocatoria:', error);
        throw error;
    }
}

/**
 * Cambiar el estado de una convocatoria (flujo de estados)
 */
export async function cambiarEstadoConvocatoria(id: string, nuevoEstado: EstadoConvocatoria) {
    const session = await checkAdmin();

    try {
        return await db.transaction(async (prisma) => {
            const convocatoria = await prisma.convocatoria.update({
                where: { id },
                data: {
                    estado: nuevoEstado,
                    ...(nuevoEstado === 'PUBLICADA' ? { publicado_en: new Date() } : {}),
                    ...(nuevoEstado === 'CERRADA' ? {
                        cupo_disponible: 0,
                        fecha_cierre_postulacion: new Date()
                    } : {})
                },
                include: {
                    publicador: {
                        select: {
                            id: true,
                            primer_nombre: true,
                            primer_apellido: true,
                            correo: true,
                            rol: true
                        }
                    },
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
                            codigo: true,
                            facultad: {
                                select: {
                                    id: true,
                                    nombre: true
                                }
                            }
                        }
                    }
                }
            });

            // Registrar en log de actividad
            await prisma.logActividad.create({
                data: {
                    id_usuario: session.user.id,
                    accion: 'CAMBIAR_ESTADO_CONVOCATORIA',
                    entidad: 'Convocatoria',
                    id_entidad: id,
                    descripcion: `Convocatoria '${convocatoria.titulo}' cambió a estado ${nuevoEstado}`,
                    resultado: 'EXITOSO',
                }
            });

            revalidatePath('/administrador/convocatorias');
            // Convertir Decimal a number para evitar problemas de serialización
            return {
                ...convocatoria,
                horas_totales_ofrecidas: convocatoria.horas_totales_ofrecidas ? Number(convocatoria.horas_totales_ofrecidas) : null,
            };
        }, 'Error al cambiar estado de convocatoria');
    } catch (error) {
        console.error('Error en cambiarEstadoConvocatoria:', error);
        throw error;
    }
}

/**
 * Eliminar una convocatoria (solo si está en BORRADOR y no tiene postulaciones)
 */
export async function eliminarConvocatoria(id: string) {
    const session = await checkAdmin();

    try {
        return await db.transaction(async (prisma) => {
            // Verificar que la convocatoria exista y esté en estado BORRADOR
            const convocatoria = await prisma.convocatoria.findUnique({
                where: { id },
                include: {
                    _count: {
                        select: { postulaciones: true }
                    }
                }
            });

            if (!convocatoria) {
                return {
                    success: false,
                    message: 'Convocatoria no encontrada'
                };
            }

            if (!['BORRADOR', 'CERRADA', 'CANCELADA'].includes(convocatoria.estado)) {
                return {
                    success: false,
                    message: 'Solo se pueden eliminar convocatorias en estado BORRADOR o desactivadas (CERRADA/CANCELADA)'
                };
            }

            if (convocatoria._count.postulaciones > 0) {
                return {
                    success: false,
                    message: 'No se puede eliminar una convocatoria con postulaciones'
                };
            }

            // Eliminar actividades y certificados asociados
            await prisma.actividad.deleteMany({
                where: { id_convocatoria: id }
            });

            await prisma.certificado.deleteMany({
                where: { id_convocatoria: id }
            });

            // Eliminar la convocatoria
            await prisma.convocatoria.delete({
                where: { id }
            });

            // Registrar en log de actividad
            await prisma.logActividad.create({
                data: {
                    id_usuario: session.user.id,
                    accion: 'ELIMINAR_CONVOCATORIA',
                    entidad: 'Convocatoria',
                    id_entidad: id,
                    descripcion: `Convocatoria '${convocatoria.titulo}' eliminada`,
                    resultado: 'EXITOSO',
                }
            });

            revalidatePath('/administrador/convocatorias');
            return {
                success: true,
                message: 'Convocatoria eliminada correctamente',
                data: convocatoria
            };
        }, 'Error al eliminar convocatoria');
    } catch (error) {
        console.error('Error en eliminarConvocatoria:', error);
        return {
            success: false,
            message: 'Error al eliminar convocatoria'
        };
    }
}

/**
 * Obtener opciones para los selectores (categorías, programas, etc.)
 */
export async function getOpcionesConvocatoria() {
    await checkAdmin();

    try {
        return await db.execute(async (prisma) => {
            const [categorias, programas, facultades] = await Promise.all([
                prisma.categoriaServicioSocial.findMany({
                    where: { esta_activa: true },
                    select: {
                        id: true,
                        nombre: true,
                        icono: true,
                        color_hex: true
                    },
                    orderBy: { nombre: 'asc' }
                }),
                prisma.programa.findMany({
                    where: { esta_activo: true },
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
                    where: { esta_activo: true },
                    select: {
                        id: true,
                        nombre: true,
                        codigo: true
                    },
                    orderBy: { nombre: 'asc' }
                })
            ]);

            return { categorias, programas, facultades };
        }, 'Error al obtener opciones de convocatoria');
    } catch (error) {
        console.error('Error en getOpcionesConvocatoria:', error);
        throw error;
    }
}

/**
 * Obtener estadísticas de convocatorias
 */
export async function getEstadisticasConvocatorias() {
    await checkAdmin();

    try {
        return await db.execute(async (prisma) => {
            const [
                totalConvocatorias,
                porEstado,
                porModalidad,
                recientes,
                conMasPostulaciones
            ] = await Promise.all([
                prisma.convocatoria.count(),
                prisma.convocatoria.groupBy({
                    by: ['estado'],
                    _count: true
                }),
                prisma.convocatoria.groupBy({
                    by: ['modalidad'],
                    _count: true
                }),
                prisma.convocatoria.findMany({
                    select: {
                        id: true,
                        titulo: true,
                        estado: true,
                        creado_en: true,
                        _count: {
                            select: { postulaciones: true }
                        }
                    },
                    orderBy: { creado_en: 'desc' },
                    take: 5
                }),
                prisma.convocatoria.findMany({
                    select: {
                        id: true,
                        titulo: true,
                        _count: {
                            select: { postulaciones: true }
                        }
                    },
                    orderBy: {
                        postulaciones: { _count: 'desc' }
                    },
                    take: 5
                })
            ]);

            return {
                totalConvocatorias,
                porEstado,
                porModalidad,
                recientes,
                conMasPostulaciones
            };
        }, 'Error al obtener estadísticas de convocatorias');
    } catch (error) {
        console.error('Error en getEstadisticasConvocatorias:', error);
        throw error;
    }
}
