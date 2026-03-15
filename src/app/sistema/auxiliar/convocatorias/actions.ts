'use server';

import { db } from '@/lib/prisma';
import { EstadoConvocatoria, Modalidad } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

/**
 * Validar permisos de AUXILIAR
 */
async function checkAuxiliar() {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user.role !== 'AUXILIAR' && session.user.role !== 'ADMINISTRADOR')) {
        throw new Error('No autorizado');
    }
    return session;
}

/**
 * Obtener las convocatorias gestionadas por el auxiliar o todas si es necesario
 */
export async function getConvocatoriasAuxiliar() {
    const session = await checkAuxiliar();

    try {
        return await db.execute(async (prisma) => {
            // Un auxiliar puede ver todas las que ha creado o las de su programa (si tiene)
            // Para ser potente, permitiremos ver todas las del sistema o filtrar por las suyas
            const convocatorias = await prisma.convocatoria.findMany({
                include: {
                    categoria: true,
                    programa: {
                        include: {
                            facultad: true
                        }
                    },
                    publicador: {
                        select: {
                            primer_nombre: true,
                            primer_apellido: true,
                            rol: true
                        }
                    },
                    _count: {
                        select: {
                            postulaciones: true,
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
        }, 'Error al obtener convocatorias del auxiliar');
    } catch (error) {
        console.error('Error en getConvocatoriasAuxiliar:', error);
        throw error;
    }
}

/**
 * Crear convocatoria (Versión Auxiliar)
 */
export async function crearConvocatoriaAuxiliar(data: any) {
    const session = await checkAuxiliar();

    try {
        return await db.execute(async (prisma) => {
            const userId = session.user.id;

            // Obtener el programa del auxiliar si no se especifica
            let id_programa = data.id_programa;
            if (!id_programa) {
                const usuario = await prisma.usuario.findUnique({
                    where: { id: userId },
                    select: { id_programa: true }
                });
                id_programa = usuario?.id_programa;
            }

            // Crear la convocatoria
            const convocatoria = await prisma.convocatoria.create({
                data: {
                    titulo: data.titulo,
                    descripcion: data.descripcion,
                    objetivo: data.objetivo || null,
                    id_categoria: data.id_categoria || null,
                    id_programa: id_programa || null,
                    modalidad: data.modalidad,
                    lugar: data.lugar || null,
                    url_convocatoria_externa: data.url_convocatoria_externa || null,
                    competencias_requeridas: data.competencias_requeridas || [],
                    estado: 'PUBLICADA', // Auxiliares por defecto publican directamente para agilizar
                    fecha_inicio: new Date(data.fecha_inicio),
                    fecha_fin: data.fecha_fin ? new Date(data.fecha_fin) : null,
                    fecha_cierre_postulacion: data.fecha_cierre_postulacion ? new Date(data.fecha_cierre_postulacion) : null,
                    cupo_maximo: data.cupo_maximo || null,
                    cupo_disponible: data.cupo_maximo || null,
                    horas_totales_ofrecidas: data.horas_totales_ofrecidas || null,
                    url_banner: data.url_banner || null,
                    requiere_entrevista: data.requiere_entrevista || false,
                    publicado_por: userId,
                }
            });

            // Si hay actividades, crearlas también
            if (data.actividades && data.actividades.length > 0) {
                await prisma.actividad.createMany({
                    data: data.actividades.map((act: any) => ({
                        id_convocatoria: convocatoria.id,
                        nombre: act.nombre,
                        descripcion: act.descripcion || null,
                        tipo_actividad: act.tipo_actividad,
                        horas_estimadas: act.horas_estimadas,
                        esta_activa: true,
                        creado_por: userId,
                    }))
                });
            }

            revalidatePath('/sistema/auxiliar/convocatorias');
            return convocatoria;
        }, 'Error al crear convocatoria');
    } catch (error) {
        console.error('Error en crearConvocatoriaAuxiliar:', error);
        throw error;
    }
}

/**
 * Obtener opciones para el formulario
 */
export async function getOpcionesAuxiliar() {
    await checkAuxiliar();

    return await db.execute(async (prisma) => {
        const [categorias, programas] = await Promise.all([
            prisma.categoriaServicioSocial.findMany({ where: { esta_activa: true } }),
            prisma.programa.findMany({ where: { esta_activo: true } })
        ]);
        return { 
            categorias, 
            programas: programas.map(p => ({
                ...p,
                horas_requeridas: p.horas_requeridas ? Number(p.horas_requeridas) : null
            }))
        };
    }, 'Error al obtener opciones');
}
/**
 * Obtener detalle de una convocatoria
 */
export async function getConvocatoriaByIdAuxiliar(id: string) {
    await checkAuxiliar();

    try {
        return await db.execute(async (prisma) => {
            const convocatoria = await prisma.convocatoria.findUnique({
                where: { id },
                include: {
                    programa: true,
                    categoria: true,
                    publicador: {
                        select: {
                            primer_nombre: true,
                            primer_apellido: true,
                            rol: true
                        }
                    },
                    actividades: {
                        include: {
                            creador: {
                                select: { primer_nombre: true, primer_apellido: true }
                            },
                            _count: {
                                select: { reportes: true }
                            }
                        },
                        orderBy: { creado_en: 'asc' }
                    },
                    postulaciones: {
                        include: {
                            estudiante: {
                                select: {
                                    primer_nombre: true,
                                    primer_apellido: true,
                                    correo: true,
                                    numero_documento: true
                                }
                            }
                        }
                    }
                }
            });

            if (!convocatoria) return null;

            return {
                ...convocatoria,
                horas_totales_ofrecidas: convocatoria.horas_totales_ofrecidas ? Number(convocatoria.horas_totales_ofrecidas) : null,
                programa: convocatoria.programa ? {
                    ...convocatoria.programa,
                    horas_requeridas: convocatoria.programa.horas_requeridas ? Number(convocatoria.programa.horas_requeridas) : null
                } : null,
                actividades: convocatoria.actividades.map(act => ({
                    ...act,
                    horas_estimadas: act.horas_estimadas ? Number(act.horas_estimadas) : null
                }))
            };
        }, 'Error al obtener detalle de convocatoria');
    } catch (error) {
        console.error('Error en getConvocatoriaByIdAuxiliar:', error);
        throw error;
    }
}
