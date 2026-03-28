'use server';

import { db } from '@/lib/prisma';
import { EstadoPostulacion, EstadoReporte, EstadoConvocatoria } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

async function checkAliado() {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user.role !== 'ALIADO' && session.user.role !== 'ADMINISTRADOR')) {
        throw new Error('No autorizado');
    }
    return session;
}

/**
 * --- GESTIÓN DE POSTULACIONES ---
 */

export async function getPostulacionesAliado() {
    const session = await checkAliado();
    return await db.execute(async (prisma) => {
        const postulaciones = await prisma.postulacion.findMany({
            where: {
                convocatoria: {
                    publicado_por: session.user.id
                }
            },
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

export async function actualizarEstadoPostulacionAliado(id: string, nuevoEstado: EstadoPostulacion, notas?: string) {
    const session = await checkAliado();
    return await db.execute(async (prisma) => {
        // Verificar que la postulación pertenezca a una convocatoria del aliado
        const postulacion = await prisma.postulacion.findFirst({
            where: { 
                id,
                convocatoria: {
                    publicado_por: session.user.id
                }
            }
        });

        if (!postulacion) {
            throw new Error('Postulación no encontrada o no autorizada');
        }

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
                mensaje: `Tu postulación ha sido marcada como ${nuevoEstado} por el aliado.`,
            }
        });

        revalidatePath('/sistema/aliado/postulaciones');
        return post;
    }, 'Error al actualizar postulación');
}

/**
 * --- GESTIÓN DE HORAS ---
 */

export async function getReportesParaValidarAliado() {
    const session = await checkAliado();
    return await db.execute(async (prisma) => {
        const reportes = await prisma.reporteHoras.findMany({
            where: {
                estado: {
                    in: ['REPORTADO', 'PENDIENTE_VALIDACION']
                },
                actividad: {
                    convocatoria: {
                        publicado_por: session.user.id
                    }
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
 * Validar horas (Paso de Aliado)
 */
export async function validarReporteAliado(id: string, horasValidadas: number, notas?: string) {
    const session = await checkAliado();
    return await db.execute(async (prisma) => {
        // Verificar que el reporte pertenezca a una actividad de convocatoria del aliado
        const reporteExistente = await prisma.reporteHoras.findFirst({
            where: { 
                id,
                actividad: {
                    convocatoria: {
                        publicado_por: session.user.id
                    }
                }
            }
        });

        if (!reporteExistente) {
            throw new Error('Reporte no encontrado o no autorizado');
        }

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
                razon: 'Validación por Aliado'
            }
        });

        revalidatePath('/sistema/aliado/validacion');
        return {
            ...reporte,
            horas_reportadas: Number(reporte.horas_reportadas),
            horas_aprobadas: reporte.horas_aprobadas ? Number(reporte.horas_aprobadas) : null
        };
    }, 'Error al validar reporte');
}

/**
 * Aliado registra horas directamente
 */
export async function registrarHorasEstudianteAliado(data: {
    id_estudiante: string,
    id_actividad: string,
    horas: number,
    descripcion: string
}) {
    const session = await checkAliado();
    return await db.execute(async (prisma) => {
        // Verificar que la actividad pertenezca a una convocatoria del aliado
        const actividad = await prisma.actividad.findFirst({
            where: { 
                id: data.id_actividad,
                convocatoria: {
                    publicado_por: session.user.id
                }
            }
        });

        if (!actividad) {
            throw new Error('Actividad no encontrada o no autorizada');
        }

        const reporte = await prisma.reporteHoras.create({
            data: {
                id_estudiante: data.id_estudiante,
                id_actividad: data.id_actividad,
                id_convocatoria: actividad.id_convocatoria,
                horas_reportadas: data.horas,
                descripcion_trabajo: data.descripcion,
                estado: EstadoReporte.VALIDADO_AUXILIAR,
                id_revisor: session.user.id,
                revisado_en: new Date(),
                notas_revisor: 'Registrado directamente por Aliado'
            }
        });

        revalidatePath('/sistema/aliado/validacion');
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
export async function getEstudiantesActivosAliado() {
    await checkAliado();
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
export async function getActividadesPorConvocatoriaAliado(idConv: string) {
    const session = await checkAliado();
    return await db.execute(async (prisma) => {
        // Verificar que la convocatoria pertenezca al aliado
        const convocatoria = await prisma.convocatoria.findFirst({
            where: { 
                id: idConv,
                publicado_por: session.user.id
            }
        });

        if (!convocatoria) {
            throw new Error('Convocatoria no encontrada o no autorizada');
        }

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
 * --- CONVOCATORIAS DEL ALIADO ---
 */

export async function getConvocatoriasAliado() {
    const session = await checkAliado();
    return await db.execute(async (prisma) => {
        const convocatorias = await prisma.convocatoria.findMany({
            where: {
                publicado_por: session.user.id
            },
            include: {
                categoria: true,
                programa: true,
                _count: {
                    select: {
                        postulaciones: true,
                        actividades: true
                    }
                }
            },
            orderBy: { creado_en: 'desc' }
        });

        return convocatorias.map(c => ({
            ...c,
            horas_totales_ofrecidas: c.horas_totales_ofrecidas ? Number(c.horas_totales_ofrecidas) : null,
            cupo_maximo: c.cupo_maximo ? Number(c.cupo_maximo) : null
        }));
    }, 'Error al obtener convocatorias');
}

export async function getOpcionesAliado() {
    await checkAliado();
    return await db.execute(async (prisma) => {
        const [categorias, programas] = await Promise.all([
            prisma.categoriaServicioSocial.findMany({ where: { esta_activa: true } }),
            prisma.programa.findMany({ 
                where: { esta_activo: true },
                select: {
                    id: true,
                    nombre: true,
                    codigo: true,
                    id_facultad: true,
                    nivel_formacion: true,
                    horas_requeridas: true,
                    esta_activo: true,
                    creado_en: true,
                    actualizado_en: true
                }
            })
        ]);
        return { 
            categorias, 
            programas: programas.map(p => ({
                id: p.id,
                nombre: p.nombre,
                codigo: p.codigo,
                id_facultad: p.id_facultad,
                nivel_formacion: p.nivel_formacion,
                horas_requeridas: p.horas_requeridas ? Number(p.horas_requeridas) : null,
                esta_activo: p.esta_activo,
                creado_en: p.creado_en,
                actualizado_en: p.actualizado_en
            }))
        };
    }, 'Error al obtener opciones');
}

export async function crearConvocatoriaAliado(data: {
    titulo: string;
    descripcion: string;
    objetivo?: string;
    id_categoria?: string;
    id_programa?: string;
    modalidad: string;
    lugar?: string;
    fecha_inicio: string;
    fecha_fin?: string;
    fecha_cierre_postulacion?: string;
    cupo_maximo?: number;
    horas_totales_ofrecidas?: number;
    requiere_entrevista?: boolean;
    competencias_requeridas?: string[];
}) {
    const session = await checkAliado();
    return await db.execute(async (prisma) => {
        const convocatoria = await prisma.convocatoria.create({
            data: {
                titulo: data.titulo,
                descripcion: data.descripcion,
                objetivo: data.objetivo,
                id_categoria: data.id_categoria,
                id_programa: data.id_programa,
                publicado_por: session.user.id,
                modalidad: data.modalidad as any,
                lugar: data.lugar,
                fecha_inicio: new Date(data.fecha_inicio),
                fecha_fin: data.fecha_fin ? new Date(data.fecha_fin) : null,
                fecha_cierre_postulacion: data.fecha_cierre_postulacion ? new Date(data.fecha_cierre_postulacion) : null,
                cupo_maximo: data.cupo_maximo,
                cupo_disponible: data.cupo_maximo,
                horas_totales_ofrecidas: data.horas_totales_ofrecidas,
                requiere_entrevista: data.requiere_entrevista || false,
                competencias_requeridas: data.competencias_requeridas || [],
                estado: EstadoConvocatoria.PUBLICADA
            }
        });

        revalidatePath('/sistema/aliado/convocatorias');
        return convocatoria;
    }, 'Error al crear convocatoria');
}

/**
 * --- DASHBOARD STATS ---
 */

export async function getDashboardStatsAliado() {
    const session = await checkAliado();
    return await db.execute(async (prisma) => {
        const [
            horasPorValidar,
            postulacionesPendientes,
            totalConvocatorias,
            reportesMes
        ] = await Promise.all([
            prisma.reporteHoras.count({ 
                where: { 
                    estado: { in: ['REPORTADO', 'PENDIENTE_VALIDACION'] },
                    actividad: {
                        convocatoria: {
                            publicado_por: session.user.id
                        }
                    }
                } 
            }),
            prisma.postulacion.count({ 
                where: { 
                    estado: 'PENDIENTE',
                    convocatoria: {
                        publicado_por: session.user.id
                    }
                } 
            }),
            prisma.convocatoria.count({ 
                where: { publicado_por: session.user.id } 
            }),
            prisma.reporteHoras.count({ 
                where: { 
                    reportado_en: { 
                        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) 
                    },
                    actividad: {
                        convocatoria: {
                            publicado_por: session.user.id
                        }
                    }
                } 
            })
        ]);

        // Tareas prioritarias (últimos reportes y postulaciones)
        const [ultimosReportes, ultimasPostulaciones] = await Promise.all([
            prisma.reporteHoras.findMany({
                take: 3,
                where: { 
                    estado: 'REPORTADO',
                    actividad: {
                        convocatoria: {
                            publicado_por: session.user.id
                        }
                    }
                },
                include: { estudiante: { select: { primer_nombre: true, primer_apellido: true } } },
                orderBy: { reportado_en: 'desc' }
            }),
            prisma.postulacion.findMany({
                take: 2,
                where: { 
                    estado: 'PENDIENTE',
                    convocatoria: {
                        publicado_por: session.user.id
                    }
                },
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
            stats: { horasPorValidar, postulacionesPendientes, totalConvocatorias, reportesMes },
            prioritarias: mappedPrioritarias
        };
    }, 'Error al obtener estadísticas del dashboard');
}

/**
 * --- ESTUDIANTES ASOCIADOS ---
 */

export async function getEstudiantesAliado() {
    const session = await checkAliado();
    return await db.execute(async (prisma) => {
        // Obtener estudiantes que han postulado a convocatorias del aliado
        const estudiantes = await prisma.usuario.findMany({
            where: { 
                rol: 'ESTUDIANTE',
                postulaciones_enviadas: {
                    some: {
                        convocatoria: {
                            publicado_por: session.user.id
                        }
                    }
                }
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
            horasRequeridas: est.programa?.horas_requeridas ? Number(est.programa.horas_requeridas) : 120
        }));
    }, 'Error al obtener estudiantes');
}

/**
 * --- CERTIFICADOS ---
 */

export async function getCertificadosEmitidosAliado() {
    const session = await checkAliado();
    return await db.execute(async (prisma) => {
        const certificados = await prisma.certificado.findMany({
            where: {
                emitido_por: session.user.id
            },
            include: {
                estudiante: {
                    select: {
                        primer_nombre: true,
                        primer_apellido: true,
                        numero_documento: true,
                        correo: true
                    }
                },
                convocatoria: {
                    select: {
                        titulo: true
                    }
                }
            },
            orderBy: { emitido_en: 'desc' }
        });

        return certificados.map(c => ({
            ...c,
            total_horas: Number(c.total_horas)
        }));
    }, 'Error al obtener certificados');
}
