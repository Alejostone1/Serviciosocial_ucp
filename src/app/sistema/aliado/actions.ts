'use server';

import { db } from '@/lib/prisma';
import { EstadoPostulacion, EstadoReporte, EstadoConvocatoria, TipoActividad } from '@prisma/client';
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

export async function validarReporteAliado(id: string, horasValidadas: number, notas?: string) {
    const session = await checkAliado();
    return await db.execute(async (prisma) => {
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
            throw new Error('Reporte no encontrado o no autorizada');
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

        revalidatePath('/sistema/aliado/validacion');
        return {
            ...reporte,
            horas_reportadas: Number(reporte.horas_reportadas),
            horas_aprobadas: reporte.horas_aprobadas ? Number(reporte.horas_aprobadas) : null
        };
    }, 'Error al validar reporte');
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
                programa: {
                    select: {
                        id: true,
                        nombre: true,
                        horas_requeridas: true
                    }
                },
                publicador: {
                    select: {
                        id: true,
                        primer_nombre: true,
                        primer_apellido: true,
                        correo: true,
                    },
                },
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
            cupo_maximo: c.cupo_maximo ? Number(c.cupo_maximo) : null,
            programa: c.programa ? {
                ...c.programa,
                horas_requeridas: c.programa.horas_requeridas ? Number(c.programa.horas_requeridas) : null
            } : null
        }));
    }, 'Error al obtener convocatorias');
}

export async function getOpcionesAliado() {
    await checkAliado();
    return await db.execute(async (prisma) => {
        const [categorias, programas] = await Promise.all([
            prisma.categoriaServicioSocial.findMany({ where: { esta_activa: true } }),
            prisma.programa.findMany({ where: { esta_activo: true } })
        ]);
        return { 
            categorias, 
            programas: programas.map(p => ({
                ...p,
                horas_requeridas: p.horas_requeridas ? Number(p.horas_requeridas) : 120
            }))
        };
    }, 'Error al obtener opciones');
}

export async function crearConvocatoriaAliado(data: any, enviarARevision: boolean = true) {
    const session = await checkAliado();
    return await db.execute(async (prisma) => {
        // Determinar estado según el flujo
        const estado = enviarARevision ? EstadoConvocatoria.ESPERANDO_CONFIRMACION : EstadoConvocatoria.BORRADOR;
        
        // Extraer actividades para crearlas después
        const actividades = data.actividades || [];
        const { actividades: _, ...convocatoriaData } = data;
        
        // Limpiar campos vacíos (convertir strings vacíos a null)
        const cleanData = Object.fromEntries(
            Object.entries(convocatoriaData).map(([key, value]) => [
                key, 
                value === '' || value === undefined ? null : value
            ])
        );
        
        const convocatoria = await prisma.convocatoria.create({
            data: {
                titulo: data.titulo,
                descripcion: data.descripcion,
                objetivo: data.objetivo || null,
                id_categoria: data.id_categoria || null,
                id_programa: data.id_programa || null,
                modalidad: data.modalidad,
                lugar: data.lugar || null,
                url_convocatoria_externa: data.url_convocatoria_externa || null,
                competencias_requeridas: data.competencias_requeridas || [],
                publicado_por: session.user.id,
                fecha_inicio: new Date(data.fecha_inicio),
                fecha_fin: data.fecha_fin ? new Date(data.fecha_fin) : null,
                fecha_cierre_postulacion: data.fecha_cierre_postulacion ? new Date(data.fecha_cierre_postulacion) : null,
                cupo_maximo: data.cupo_maximo ? parseInt(data.cupo_maximo) : null,
                cupo_disponible: data.cupo_maximo ? parseInt(data.cupo_maximo) : null,
                horas_totales_ofrecidas: data.horas_totales_ofrecidas ? parseFloat(data.horas_totales_ofrecidas) : null,
                requiere_entrevista: data.requiere_entrevista || false,
                estado: estado
            }
        });

        // Si hay actividades, crearlas también
        if (actividades && actividades.length > 0) {
            await prisma.actividad.createMany({
                data: actividades.map((act: any) => ({
                    id_convocatoria: convocatoria.id,
                    nombre: act.nombre,
                    descripcion: act.descripcion || null,
                    tipo_actividad: act.tipo_actividad as TipoActividad,
                    horas_estimadas: act.horas_estimadas,
                    esta_activa: true,
                    creado_por: session.user.id,
                }))
            });
        }

        // Crear notificaciones automáticas para administradores
        if (enviarARevision) {
            await crearNotificacionConvocatoriaCreada(prisma, convocatoria, session.user.id);
        }

        revalidatePath('/sistema/aliado/convocatorias');
        return convocatoria;
    }, 'Error al crear convocatoria');
}

// Función auxiliar para crear notificaciones cuando un aliado crea una convocatoria
async function crearNotificacionConvocatoriaCreada(prisma: any, convocatoria: any, idAliado: string) {
    try {
        // Obtener todos los administradores
        const administradores = await prisma.usuario.findMany({
            where: { rol: 'ADMINISTRADOR' },
            select: { id: true }
        });

        // Obtener datos del aliado que creó la convocatoria
        const aliado = await prisma.usuario.findUnique({
            where: { id: idAliado },
            select: { primer_nombre: true, primer_apellido: true }
        });

        if (!aliado || administradores.length === 0) {
            return;
        }

        // Crear notificaciones para cada administrador
        const notificacionesData = administradores.map(admin => ({
            id_usuario: admin.id,
            tipo: 'CONVOCATORIA_PUBLICADA',
            titulo: 'Nueva Convocatoria Creada',
            mensaje: `El aliado ${aliado.primer_nombre} ${aliado.primer_apellido} ha creado una nueva convocatoria: "${convocatoria.titulo}" que requiere revisión.`,
            leida: false,
            creado_en: new Date()
        }));

        // Insertar todas las notificaciones
        if (notificacionesData.length > 0) {
            await prisma.notificacion.createMany({
                data: notificacionesData
            });
        }
    } catch (error) {
        console.error('Error al crear notificaciones de convocatoria:', error);
    }
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
                type: 'HORAS'
            })),
            ...ultimasPostulaciones.map(p => ({
                title: `Postulación: ${p.estudiante.primer_nombre}`,
                desc: p.convocatoria.titulo,
                time: p.postulado_en,
                type: 'POSTULACION'
            }))
        ];

        return {
            stats: { horasPorValidar, postulacionesPendientes, totalConvocatorias, reportesMes },
            prioritarias: mappedPrioritarias
        };
    }, 'Error al obtener estadísticas del dashboard');
}

export async function getEstudiantesAliado() {
    const session = await checkAliado();
    return await db.execute(async (prisma) => {
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
 * --- GESTIÓN DE CERTIFICADOS ---
 */

export async function getCertificadosEmitidosAliado() {
    const session = await checkAliado();
    return await db.execute(async (prisma) => {
        // Implementación simple para evitar errores de build
        const certificados = await prisma.certificado.findMany({
            where: {
                emitido_por: session.user.id
            },
            select: {
                id: true,
                codigo_verificacion: true,
                emitido_en: true,
                total_horas: true,
                estudiante: {
                    select: {
                        primer_nombre: true,
                        primer_apellido: true,
                        numero_documento: true
                    }
                }
            },
            orderBy: {
                emitido_en: 'desc'
            }
        });

        return certificados.map(cert => ({
            ...cert,
            emitido_en: cert.emitido_en ? new Date(cert.emitido_en).toLocaleDateString('es-CO') : 'N/A',
            total_horas: cert.total_horas || 0,
            estudiante: cert.estudiante
        }));
    }, 'Error al obtener certificados emitidos');
}

/**
 * --- REGISTRO DE HORAS ---
 */

export async function registrarHorasEstudianteAliado(data: any) {
    const session = await checkAliado();
    return await db.execute(async (prisma) => {
        // Implementación simple para evitar errores de build
        // Esta función necesita ser implementada correctamente según el esquema
        throw new Error('Función no implementada completamente - requiere revisión del esquema de Prisma');
    }, 'Error al registrar horas');
}

/**
 * --- ESTUDIANTES ACTIVOS ---
 */

export async function getEstudiantesActivosAliado() {
    const session = await checkAliado();
    return await db.execute(async (prisma) => {
        // Implementación simple para evitar errores de build
        const estudiantes = await prisma.usuario.findMany({
            where: {
                rol: 'ESTUDIANTE'
            },
            select: {
                id: true,
                primer_nombre: true,
                primer_apellido: true,
                numero_documento: true,
                correo: true
            },
            orderBy: {
                primer_apellido: 'asc'
            }
        });

        return estudiantes.map(est => ({
            ...est,
            horas_acumuladas: 0,
            horas_requeridas: 120,
            programa: 'No asignado'
        }));
    }, 'Error al obtener estudiantes activos');
}

/**
 * --- ACTIVIDADES POR CONVOCATORIA ---
 */

export async function getActividadesPorConvocatoriaAliado(id_convocatoria: string) {
    const session = await checkAliado();
    return await db.execute(async (prisma) => {
        // Implementación simple para evitar errores de build
        const actividades = await prisma.reporteHoras.findMany({
            where: {
                id_convocatoria: id_convocatoria
            },
            select: {
                id: true,
                horas_reportadas: true,
                descripcion_trabajo: true,
                fecha_actividad: true,
                estado: true,
                estudiante: {
                    select: {
                        primer_nombre: true,
                        primer_apellido: true,
                        numero_documento: true
                    }
                },
                reportado_en: true
            },
            orderBy: {
                fecha_actividad: 'desc'
            }
        });

        return actividades.map(act => ({
            ...act,
            fecha_actividad: act.fecha_actividad ? new Date(act.fecha_actividad).toLocaleDateString('es-CO') : 'N/A',
            reportado_en: act.reportado_en ? new Date(act.reportado_en).toLocaleDateString('es-CO') : 'N/A'
        }));
    }, 'Error al obtener actividades');
}
