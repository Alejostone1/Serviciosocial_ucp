'use server';

import { db } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { EstadoPostulacion } from '@prisma/client';

async function checkAdmin() {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMINISTRADOR') {
        throw new Error('No autorizado');
    }
    return session;
}

/**
 * Obtener todas las postulaciones con información completa
 */
export async function getPostulaciones() {
    await checkAdmin();
    
    try {
        return await db.execute(async (prisma) => {
            const postulaciones = await prisma.postulacion.findMany({
                include: {
                    estudiante: {
                        select: {
                            id: true,
                            primer_nombre: true,
                            segundo_nombre: true,
                            primer_apellido: true,
                            segundo_apellido: true,
                            numero_documento: true,
                            correo: true,
                            telefono: true,
                            foto_url: true,
                            esta_bloqueado: true,
                            ultimo_acceso: true,
                            programa: {
                                select: {
                                    id: true,
                                    nombre: true,
                                    codigo: true,
                                    facultad: {
                                        select: {
                                            id: true,
                                            nombre: true,
                                            codigo: true
                                        }
                                    }
                                }
                            },
                            perfil_estudiante: {
                                select: {
                                    semestre_actual: true,
                                    codigo_estudiantil: true,
                                    horas_previas: true,
                                    horas_acumuladas: true,
                                    porcentaje_avance: true
                                }
                            }
                        }
                    },
                    convocatoria: {
                        select: {
                            id: true,
                            titulo: true,
                            estado: true,
                            modalidad: true,
                            fecha_inicio: true,
                            fecha_fin: true,
                            fecha_cierre_postulacion: true,
                            cupo_maximo: true,
                            cupo_disponible: true,
                            horas_totales_ofrecidas: true,
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
                                            nombre: true
                                        }
                                    }
                                }
                            }
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
                orderBy: { postulado_en: 'desc' }
            });

            // Convertir Decimals a numbers
            return postulaciones.map(postulacion => ({
                ...postulacion,
                convocatoria: postulacion.convocatoria ? {
                    ...postulacion.convocatoria,
                    horas_totales_ofrecidas: postulacion.convocatoria.horas_totales_ofrecidas ? 
                        Number(postulacion.convocatoria.horas_totales_ofrecidas) : null
                } : null,
                estudiante: postulacion.estudiante ? {
                    ...postulacion.estudiante,
                    perfil_estudiante: postulacion.estudiante.perfil_estudiante ? {
                        ...postulacion.estudiante.perfil_estudiante,
                        horas_previas: Number(postulacion.estudiante.perfil_estudiante.horas_previas),
                        horas_acumuladas: Number(postulacion.estudiante.perfil_estudiante.horas_acumuladas),
                        porcentaje_avance: Number(postulacion.estudiante.perfil_estudiante.porcentaje_avance)
                    } : null
                } : null
            }));
        }, 'Error al obtener postulaciones');
    } catch (error) {
        console.error('Error en getPostulaciones:', error);
        throw error;
    }
}

/**
 * Obtener postulaciones con filtros avanzados
 */
export async function getPostulacionesConFiltros(filtros: {
    estado?: EstadoPostulacion[];
    id_convocatoria?: string[];
    id_programa?: string[];
    id_facultad?: string[];
    fecha_desde?: Date;
    fecha_hasta?: Date;
    busqueda?: string;
}) {
    await checkAdmin();
    
    try {
        return await db.execute(async (prisma) => {
            const whereClause: any = {};

            // Filtro por estado
            if (filtros.estado && filtros.estado.length > 0) {
                whereClause.estado = { in: filtros.estado };
            }

            // Filtro por convocatoria
            if (filtros.id_convocatoria && filtros.id_convocatoria.length > 0) {
                whereClause.id_convocatoria = { in: filtros.id_convocatoria };
            }

            // Filtro por programa
            if (filtros.id_programa && filtros.id_programa.length > 0) {
                whereClause.estudiante = {
                    programa: { id: { in: filtros.id_programa } }
                };
            }

            // Filtro por facultad
            if (filtros.id_facultad && filtros.id_facultad.length > 0) {
                whereClause.estudiante = {
                    programa: {
                        facultad: { id: { in: filtros.id_facultad } }
                    }
                };
            }

            // Filtro por fechas
            if (filtros.fecha_desde || filtros.fecha_hasta) {
                whereClause.postulado_en = {};
                if (filtros.fecha_desde) {
                    whereClause.postulado_en.gte = filtros.fecha_desde;
                }
                if (filtros.fecha_hasta) {
                    whereClause.postulado_en.lte = filtros.fecha_hasta;
                }
            }

            // Búsqueda textual
            if (filtros.busqueda) {
                whereClause.OR = [
                    {
                        estudiante: {
                            primer_nombre: { contains: filtros.busqueda, mode: 'insensitive' }
                        }
                    },
                    {
                        estudiante: {
                            primer_apellido: { contains: filtros.busqueda, mode: 'insensitive' }
                        }
                    },
                    {
                        estudiante: {
                            numero_documento: { contains: filtros.busqueda, mode: 'insensitive' }
                        }
                    },
                    {
                        estudiante: {
                            correo: { contains: filtros.busqueda, mode: 'insensitive' }
                        }
                    },
                    {
                        convocatoria: {
                            titulo: { contains: filtros.busqueda, mode: 'insensitive' }
                        }
                    },
                    {
                        motivacion: { contains: filtros.busqueda, mode: 'insensitive' }
                    }
                ];
            }

            const postulaciones = await prisma.postulacion.findMany({
                where: whereClause,
                include: {
                    estudiante: {
                        select: {
                            id: true,
                            primer_nombre: true,
                            segundo_nombre: true,
                            primer_apellido: true,
                            segundo_apellido: true,
                            numero_documento: true,
                            correo: true,
                            telefono: true,
                            foto_url: true,
                            esta_bloqueado: true,
                            ultimo_acceso: true,
                            programa: {
                                select: {
                                    id: true,
                                    nombre: true,
                                    codigo: true,
                                    facultad: {
                                        select: {
                                            id: true,
                                            nombre: true,
                                            codigo: true
                                        }
                                    }
                                }
                            },
                            perfil_estudiante: {
                                select: {
                                    semestre_actual: true,
                                    codigo_estudiantil: true,
                                    horas_previas: true,
                                    horas_acumuladas: true,
                                    porcentaje_avance: true
                                }
                            }
                        }
                    },
                    convocatoria: {
                        select: {
                            id: true,
                            titulo: true,
                            estado: true,
                            modalidad: true,
                            fecha_inicio: true,
                            fecha_fin: true,
                            fecha_cierre_postulacion: true,
                            cupo_maximo: true,
                            cupo_disponible: true,
                            horas_totales_ofrecidas: true,
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
                                            nombre: true
                                        }
                                    }
                                }
                            }
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
                orderBy: { postulado_en: 'desc' }
            });

            // Convertir Decimals a numbers
            return postulaciones.map(postulacion => ({
                ...postulacion,
                convocatoria: postulacion.convocatoria ? {
                    ...postulacion.convocatoria,
                    horas_totales_ofrecidas: postulacion.convocatoria.horas_totales_ofrecidas ? 
                        Number(postulacion.convocatoria.horas_totales_ofrecidas) : null
                } : null,
                estudiante: postulacion.estudiante ? {
                    ...postulacion.estudiante,
                    perfil_estudiante: postulacion.estudiante.perfil_estudiante ? {
                        ...postulacion.estudiante.perfil_estudiante,
                        horas_previas: Number(postulacion.estudiante.perfil_estudiante.horas_previas),
                        horas_acumuladas: Number(postulacion.estudiante.perfil_estudiante.horas_acumuladas),
                        porcentaje_avance: Number(postulacion.estudiante.perfil_estudiante.porcentaje_avance)
                    } : null
                } : null
            }));
        }, 'Error al obtener postulaciones con filtros');
    } catch (error) {
        console.error('Error en getPostulacionesConFiltros:', error);
        throw error;
    }
}

/**
 * Obtener detalles completos de una postulación
 */
export async function getPostulacionById(id: string) {
    await checkAdmin();
    
    try {
        return await db.execute(async (prisma) => {
            const postulacion = await prisma.postulacion.findUnique({
                where: { id },
                include: {
                    estudiante: {
                        select: {
                            id: true,
                            primer_nombre: true,
                            segundo_nombre: true,
                            primer_apellido: true,
                            segundo_apellido: true,
                            numero_documento: true,
                            correo: true,
                            telefono: true,
                            foto_url: true,
                            esta_bloqueado: true,
                            ultimo_acceso: true,
                            programa: {
                                select: {
                                    id: true,
                                    nombre: true,
                                    codigo: true,
                                    nivel_formacion: true,
                                    horas_requeridas: true,
                                    facultad: {
                                        select: {
                                            id: true,
                                            nombre: true,
                                            codigo: true,
                                            decano: true,
                                            correo_contacto: true
                                        }
                                    }
                                }
                            },
                            perfil_estudiante: {
                                select: {
                                    semestre_actual: true,
                                    codigo_estudiantil: true,
                                    url_hoja_de_vida: true,
                                    habilidades: true,
                                    intereses: true,
                                    disponibilidad: true,
                                    modalidad_preferida: true,
                                    horas_previas: true,
                                    horas_acumuladas: true,
                                    porcentaje_avance: true,
                                    creado_en: true,
                                    actualizado_en: true
                                }
                            }
                        }
                    },
                    convocatoria: {
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
                            categoria: {
                                select: {
                                    id: true,
                                    nombre: true,
                                    descripcion: true,
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
                                            nombre: true,
                                            codigo: true
                                        }
                                    }
                                }
                            },
                            publicador: {
                                select: {
                                    id: true,
                                    primer_nombre: true,
                                    primer_apellido: true,
                                    correo: true
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
                                    materiales_requeridos: true,
                                    esta_activa: true,
                                    creador: {
                                        select: {
                                            primer_nombre: true,
                                            primer_apellido: true
                                        }
                                    }
                                },
                                orderBy: { creado_en: 'desc' }
                            }
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
                }
            });

            if (!postulacion) return null;

            // Convertir Decimals a numbers
            return {
                ...postulacion,
                convocatoria: postulacion.convocatoria ? {
                    ...postulacion.convocatoria,
                    horas_totales_ofrecidas: postulacion.convocatoria.horas_totales_ofrecidas ? 
                        Number(postulacion.convocatoria.horas_totales_ofrecidas) : null,
                    actividades: postulacion.convocatoria.actividades.map(actividad => ({
                        ...actividad,
                        horas_estimadas: Number(actividad.horas_estimadas),
                        horas_maximas: actividad.horas_maximas ? Number(actividad.horas_maximas) : null
                    }))
                } : null,
                estudiante: {
                    ...postulacion.estudiante,
                    programa: postulacion.estudiante.programa ? {
                        ...postulacion.estudiante.programa,
                        horas_requeridas: Number(postulacion.estudiante.programa.horas_requeridas)
                    } : null,
                    perfil_estudiante: postulacion.estudiante.perfil_estudiante ? {
                        ...postulacion.estudiante.perfil_estudiante,
                        horas_previas: Number(postulacion.estudiante.perfil_estudiante.horas_previas),
                        horas_acumuladas: Number(postulacion.estudiante.perfil_estudiante.horas_acumuladas),
                        porcentaje_avance: Number(postulacion.estudiante.perfil_estudiante.porcentaje_avance)
                    } : null
                }
            };
        }, 'Error al obtener detalles de postulación');
    } catch (error) {
        console.error('Error en getPostulacionById:', error);
        throw error;
    }
}

/**
 * Obtener estadísticas de postulaciones
 */
export async function getEstadisticasPostulaciones(filtros?: {
    id_convocatoria?: string;
    id_programa?: string;
    id_facultad?: string;
}) {
    await checkAdmin();
    
    try {
        return await db.execute(async (prisma) => {
            const whereClause: any = {};
            
            if (filtros?.id_convocatoria) {
                whereClause.id_convocatoria = filtros.id_convocatoria;
            }
            
            if (filtros?.id_programa) {
                whereClause.estudiante = { programa: { id: filtros.id_programa } };
            }
            
            if (filtros?.id_facultad) {
                whereClause.estudiante = {
                    programa: {
                        facultad: { id: filtros.id_facultad }
                    }
                }
            }

            const [
                totalPostulaciones,
                postulacionesPorEstado,
                postulacionesUltimos7Dias,
                estudiantesUnicos,
                convocatoriasActivas,
                postulacionesConEntrevista
            ] = await Promise.all([
                // Total de postulaciones
                prisma.postulacion.count({ where: whereClause }),
                
                // Postulaciones por estado
                prisma.postulacion.groupBy({
                    by: ['estado'],
                    where: whereClause,
                    _count: true
                }),
                
                // Postulaciones últimos 7 días
                prisma.postulacion.count({
                    where: {
                        ...whereClause,
                        postulado_en: {
                            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                        }
                    }
                }),
                
                // Estudiantes únicos
                prisma.postulacion.groupBy({
                    by: ['id_estudiante'],
                    where: whereClause,
                    _count: true
                }),
                
                // Convocatorias activas
                prisma.convocatoria.count({
                    where: {
                        estado: 'PUBLICADA',
                        ...(filtros?.id_programa && { programa: { id: filtros.id_programa } }),
                        ...(filtros?.id_facultad && { 
                            programa: { facultad: { id: filtros.id_facultad } }
                        })
                    }
                }),
                
                // Postulaciones con entrevista
                prisma.postulacion.count({
                    where: {
                        ...whereClause,
                        fecha_entrevista: { not: null }
                    }
                })
            ]);

            // Obtener programas y facultades involucrados de forma simple
            const postulaciones = await prisma.postulacion.findMany({
                where: whereClause,
                select: {
                    estudiante: {
                        select: {
                            programa: {
                                select: {
                                    id: true,
                                    facultad: {
                                        select: {
                                            id: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            const programasInvolucrados = new Set(
                postulaciones.map(p => p.estudiante?.programa?.id).filter(Boolean)
            );
            const facultadesInvolucradas = new Set(
                postulaciones.map(p => p.estudiante?.programa?.facultad?.id).filter(Boolean)
            );

            // Calcular promedio de horas acumuladas
            const estudiantesConPerfil = await prisma.perfilEstudiante.findMany({
                where: {
                    usuario: {
                        postulaciones_enviadas: {
                            some: whereClause
                        }
                    }
                },
                select: { horas_acumuladas: true }
            });

            const promedioHorasAcumuladas = estudiantesConPerfil.length > 0
                ? estudiantesConPerfil.reduce((sum, p) => sum + Number(p.horas_acumuladas), 0) / estudiantesConPerfil.length
                : 0;

            return {
                totalPostulaciones,
                postulacionesPorEstado: postulacionesPorEstado.map(item => ({
                    estado: item.estado,
                    cantidad: item._count
                })),
                postulacionesUltimos7Dias,
                estudiantesUnicos: estudiantesUnicos.length,
                convocatoriasActivas,
                programasInvolucrados: programasInvolucrados.size,
                facultadesInvolucradas: facultadesInvolucradas.size,
                promedioHorasAcumuladas,
                postulacionesConEntrevista,
                tiempoPromedioRevision: 0 // Simplificado por ahora
            };
        }, 'Error al obtener estadísticas de postulaciones');
    } catch (error) {
        console.error('Error en getEstadisticasPostulaciones:', error);
        throw error;
    }
}

/**
 * Cambiar estado de una postulación
 */
export async function cambiarEstadoPostulacion(id: string, nuevoEstado: EstadoPostulacion, notasRevision?: string) {
    await checkAdmin();
    
    try {
        return await db.execute(async (prisma) => {
            const postulacion = await prisma.postulacion.update({
                where: { id },
                data: {
                    estado: nuevoEstado,
                    revisado_en: nuevoEstado !== 'PENDIENTE' ? new Date() : null,
                    revisado_por: nuevoEstado !== 'PENDIENTE' ? (await getServerSession(authOptions))?.user?.id : null,
                    notas_revision: notasRevision,
                    fecha_entrevista: nuevoEstado === 'ACEPTADA' ? new Date() : null
                },
                include: {
                    estudiante: {
                        select: {
                            primer_nombre: true,
                            primer_apellido: true,
                            correo: true
                        }
                    },
                    convocatoria: {
                        select: {
                            titulo: true
                        }
                    }
                }
            });

            // Log de actividad
            const session = await getServerSession(authOptions);
            await prisma.logActividad.create({
                data: {
                    id_usuario: session?.user?.id || undefined,
                    accion: `CAMBIAR_ESTADO_POSTULACION_${nuevoEstado}`,
                    entidad: 'Postulacion',
                    id_entidad: id,
                    descripcion: `Postulación cambiada a ${nuevoEstado}: ${postulacion.estudiante.primer_nombre} ${postulacion.estudiante.primer_apellido} - ${postulacion.convocatoria.titulo}`,
                    resultado: 'EXITOSO',
                }
            });

            revalidatePath('/administrador/postulaciones');
            return postulacion;
        }, 'Error al cambiar estado de postulación');
    } catch (error) {
        console.error('Error en cambiarEstadoPostulacion:', error);
        throw error;
    }
}

/**
 * Eliminar una postulación
 */
export async function eliminarPostulacion(id: string) {
    await checkAdmin();
    
    try {
        return await db.execute(async (prisma) => {
            const postulacion = await prisma.postulacion.delete({
                where: { id }
            });

            // Log de actividad
            const session = await getServerSession(authOptions);
            await prisma.logActividad.create({
                data: {
                    id_usuario: session?.user?.id || undefined,
                    accion: 'ELIMINAR_POSTULACION',
                    entidad: 'Postulacion',
                    id_entidad: id,
                    descripcion: `Postulación eliminada: ${id}`,
                    resultado: 'EXITOSO',
                }
            });

            revalidatePath('/administrador/postulaciones');
            return postulacion;
        }, 'Error al eliminar postulación');
    } catch (error) {
        console.error('Error en eliminarPostulacion:', error);
        throw error;
    }
}

/**
 * Obtener opciones para filtros (convocatorias, programas, facultades)
 */
export async function getOpcionesFiltros() {
    await checkAdmin();
    
    try {
        return await db.execute(async (prisma) => {
            const [convocatorias, programas, facultades] = await Promise.all([
                // Convocatorias activas
                prisma.convocatoria.findMany({
                    where: { estado: 'PUBLICADA' },
                    select: {
                        id: true,
                        titulo: true,
                        estado: true,
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
                
                // Programas activos
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
                
                // Facultades activas
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
