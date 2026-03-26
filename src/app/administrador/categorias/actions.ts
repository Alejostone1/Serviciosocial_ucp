'use server';

import { db } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

async function checkAdmin() {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMINISTRADOR') throw new Error('No autorizado');
    return session;
}

/** Obtener todas las categorías con conteo de convocatorias */
export async function getCategorias() {
    await checkAdmin();
    try {
        return await db.execute(async (prisma) => {
            return await prisma.categoriaServicioSocial.findMany({
                include: { _count: { select: { convocatorias: true } } },
                orderBy: { nombre: 'asc' },
            });
        }, 'Error al obtener categorías');
    } catch (error) {
        console.error('Error en getCategorias:', error);
        throw error;
    }
}

/** Crear una nueva categoría */
export async function crearCategoria(data: {
    nombre: string;
    descripcion?: string;
    icono?: string;
    color_hex?: string;
}) {
    const session = await checkAdmin();
    return await db.execute(async (prisma) => {
        const cat = await prisma.categoriaServicioSocial.create({ data });
        const session = await getServerSession(authOptions);
        await prisma.logActividad.create({
            data: {
                id_usuario: session?.user?.id || undefined,
                accion: 'CREAR_CATEGORIA',
                entidad: 'CategoriaServicioSocial',
                id_entidad: cat.id,
                descripcion: `Categoría '${cat.nombre}' creada`,
                resultado: 'EXITOSO',
            },
        });
        revalidatePath('/administrador/categorias');
        return cat;
    }, 'Error al crear categoría');
}

/** Editar una categoría existente */
export async function editarCategoria(id: string, data: {
    nombre?: string;
    descripcion?: string;
    icono?: string;
    color_hex?: string;
}) {
    const session = await checkAdmin();
    const cat = await db.execute(async (prisma) => {
        const categoria = await prisma.categoriaServicioSocial.update({ where: { id }, data });
        
        await prisma.logActividad.create({
            data: {
                id_usuario: session.user.id,
                accion: 'EDITAR_CATEGORIA',
                entidad: 'CategoriaServicioSocial',
                id_entidad: id,
                descripcion: `Categoría '${categoria.nombre}' actualizada`,
                resultado: 'EXITOSO',
            },
        });

        revalidatePath('/administrador/categorias');
        return categoria;
    }, 'Error al actualizar categoría');
}

/** Activar o desactivar una categoría */
export async function toggleCategoria(id: string, activa: boolean) {
    const session = await checkAdmin();
    return await db.execute(async (prisma) => {
        const cat = await prisma.categoriaServicioSocial.update({
            where: { id },
            data: { esta_activa: activa },
        });
        await prisma.logActividad.create({
            data: {
                id_usuario: session.user.id,
                accion: activa ? 'ACTIVAR_CATEGORIA' : 'DESACTIVAR_CATEGORIA',
                entidad: 'CategoriaServicioSocial',
                id_entidad: id,
                descripcion: `Categoría '${cat.nombre}' ${activa ? 'activada' : 'desactivada'}`,
                resultado: 'EXITOSO',
            },
        });
        revalidatePath('/administrador/categorias');
        return cat;
    }, 'Error al cambiar estado de categoría');
}

/** Obtener detalles completos de una categoría */
export async function getCategoriaById(id: string) {
    await checkAdmin();

    try {
        console.log('Buscando categoría con ID:', id);

        const categoria = await db.execute(async (prisma) => {
            const categoria = await prisma.categoriaServicioSocial.findUnique({
                where: { id },
                include: {
                    convocatorias: {
                        select: {
                            id: true,
                            titulo: true,
                            estado: true,
                            modalidad: true,
                            fecha_inicio: true,
                            fecha_fin: true,
                            cupo_maximo: true,
                            cupo_disponible: true,
                            horas_totales_ofrecidas: true,
                            publicado_por: true,
                            creado_en: true,
                            publicado_en: true,
                            actualizado_en: true,
                            publicador: {
                                select: {
                                    id: true,
                                    primer_nombre: true,
                                    primer_apellido: true,
                                    correo: true
                                }
                            },
                            programa: {
                                select: {
                                    id: true,
                                    nombre: true,
                                    facultad: {
                                        select: {
                                            nombre: true
                                        }
                                    }
                                }
                            },
                            _count: {
                                select: { postulaciones: true }
                            }
                        },
                        orderBy: { creado_en: 'desc' }
                    },
                    _count: {
                        select: { convocatorias: true }
                    }
                }
            });

            if (!categoria) {
                console.log('Categoría no encontrada');
                return null;
            }

            console.log('Categoría encontrada:', categoria.nombre);

            // Convertir Decimals a numbers
            return {
                ...categoria,
                convocatorias: categoria.convocatorias.map(conv => ({
                    ...conv,
                    horas_totales_ofrecidas: conv.horas_totales_ofrecidas ? Number(conv.horas_totales_ofrecidas) : null
                }))
            };
        }, 'Error al obtener detalles de categoría');

        console.log('Resultado final:', categoria ? 'Categoría encontrada' : 'Categoría no encontrada');
        return categoria;
    } catch (error) {
        console.error('Error en getCategoriaById:', error);
        throw error;
    }
}

/** Obtener estadísticas de una categoría */
export async function getEstadisticasCategoria(id: string) {
    await checkAdmin();

    try {
        const [
            totalConvocatorias,
            convocatoriasPorEstado,
            convocatoriasPorModalidad,
            totalPostulaciones,
            postulacionesPorEstado,
            totalHorasOfrecidas,
            programasInvolucrados,
            publicadoresUnicos
        ] = await db.execute(async (prisma) => {
            // Total de convocatorias
            const totalConvocatorias = await prisma.convocatoria.count({
                where: { id_categoria: id }
            });
            // Convocatorias por estado
            const convocatoriasPorEstado = await prisma.convocatoria.groupBy({
                by: ['estado'],
                where: { id_categoria: id },
                _count: true
            });
            // Convocatorias por modalidad
            const convocatoriasPorModalidad = await prisma.convocatoria.groupBy({
                by: ['modalidad'],
                where: { id_categoria: id },
                _count: true
            });
            // Total de postulaciones
            const totalPostulaciones = await prisma.postulacion.count({
                where: {
                    convocatoria: {
                        id_categoria: id
                    }
                }
            });
            // Postulaciones por estado
            const postulacionesPorEstado = await prisma.postulacion.groupBy({
                by: ['estado'],
                where: {
                    convocatoria: {
                        id_categoria: id
                    }
                },
                _count: true
            });
            // Total horas ofrecidas
            const totalHorasOfrecidas = await prisma.convocatoria.aggregate({
                where: { id_categoria: id },
                _sum: { horas_totales_ofrecidas: true }
            });
            // Programas involucrados
            const programasInvolucrados = await prisma.convocatoria.groupBy({
                by: ['id_programa'],
                where: { id_categoria: id },
                _count: true
            });
            // Publicadores únicos
            const publicadoresUnicos = await prisma.convocatoria.groupBy({
                by: ['publicado_por'],
                where: { id_categoria: id },
                _count: true
            });

            return [
                totalConvocatorias,
                convocatoriasPorEstado,
                convocatoriasPorModalidad,
                totalPostulaciones,
                postulacionesPorEstado,
                totalHorasOfrecidas,
                programasInvolucrados,
                publicadoresUnicos
            ];
        }, 'Error al obtener estadísticas de categoría');

        return {
            totalConvocatorias,
            convocatoriasPorEstado: convocatoriasPorEstado.map(item => ({
                estado: item.estado,
                cantidad: item._count
            })),
            convocatoriasPorModalidad: convocatoriasPorModalidad.map(item => ({
                modalidad: item.modalidad,
                cantidad: item._count
            })),
            totalPostulaciones,
            postulacionesPorEstado: postulacionesPorEstado.map(item => ({
                estado: item.estado,
                cantidad: item._count
            })),
            totalHorasOfrecidas: Number(totalHorasOfrecidas._sum.horas_totales_ofrecidas || 0),
            programasInvolucrados: programasInvolucrados.length,
            publicadoresUnicos: publicadoresUnicos.length
        };
    } catch (error) {
        console.error('Error en getEstadisticasCategoria:', error);
        throw error;
    }
}

/** Eliminar una categoría (solo si no tiene convocatorias asociadas) */
export async function eliminarCategoria(id: string) {
    await checkAdmin();

    try {
        const categoria = await db.execute(async (prisma) => {
            // Verificar que la categoría exista
            const categoria = await prisma.categoriaServicioSocial.findUnique({
                where: { id },
                include: {
                    _count: {
                        select: { convocatorias: true }
                    }
                }
            });

            if (!categoria) {
                throw new Error('Categoría no encontrada');
            }

            if (categoria._count.convocatorias > 0) {
                throw new Error('No se puede eliminar una categoría con convocatorias asociadas');
            }

            // Eliminar la categoría
            await prisma.categoriaServicioSocial.delete({
                where: { id }
            });

            const session = await getServerSession(authOptions);
            await prisma.logActividad.create({
                data: {
                    id_usuario: session?.user?.id || undefined,
                    accion: 'ELIMINAR_CATEGORIA',
                    entidad: 'CategoriaServicioSocial',
                    id_entidad: id,
                    descripcion: `Categoría '${categoria.nombre}' eliminada`,
                    resultado: 'EXITOSO',
                }
            });

            revalidatePath('/administrador/categorias');
            return categoria;
        }, 'Error al eliminar categoría');
    } catch (error) {
        console.error('Error en eliminarCategoria:', error);
        throw error;
    }
}
