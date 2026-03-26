'use server';

import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/prisma';
import { EstadoReporte } from '@prisma/client';
import { z } from 'zod';
import { uploadMultipleFiles, UploadedFile } from '@/lib/fileUpload';

// Schema de validación para el reporte de horas
const reporteSchema = z.object({
    id_actividad: z.string().uuid('Actividad inválida'),
    horas_reportadas: z.number().min(0.5, 'Mínimo 0.5 horas').max(8, 'Máximo 8 horas por día'),
    descripcion_trabajo: z.string().min(10, 'Descripción muy corta').max(500, 'Descripción muy larga'),
    notas_estudiante: z.string().max(300, 'Notas muy largas').optional(),
    archivos_soporte: z.array(z.string()).optional(),
});

// Obtener actividades disponibles para el estudiante
export async function getActividadesDisponibles() {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ESTUDIANTE') {
        throw new Error('No autorizado');
    }

    const estudianteId = session.user.id;

    try {
        // Primero obtener las postulaciones aceptadas del estudiante
        const postulacionesAceptadas = await db.execute(async (prisma) => {
            return await prisma.postulacion.findMany({
                where: {
                    id_estudiante: estudianteId,
                    estado: 'ACEPTADA',
                    convocatoria: {
                        estado: { in: ['PUBLICADA', 'EN_CURSO'] },
                        OR: [
                            { fecha_cierre_postulacion: null },
                            { fecha_cierre_postulacion: { gt: new Date() } }
                        ]
                    }
                },
                select: {
                    id_convocatoria: true
                }
            });
        }, 'Error al obtener postulaciones');

        // Si no tiene postulaciones aceptadas, retornar array vacío
        if (postulacionesAceptadas.length === 0) {
            return [];
        }

        const convocatoriasIds = postulacionesAceptadas.map(p => p.id_convocatoria);

        const actividades = await db.execute(async (prisma) => {
            return await prisma.actividad.findMany({
                where: {
                    esta_activa: true,
                    id_convocatoria: { in: convocatoriasIds },
                    convocatoria: {
                        estado: { in: ['PUBLICADA', 'EN_CURSO'] },
                        OR: [
                            { fecha_cierre_postulacion: null },
                            { fecha_cierre_postulacion: { gt: new Date() } }
                        ]
                    }
                },
                include: {
                    convocatoria: {
                        select: {
                            titulo: true,
                            descripcion: true,
                            modalidad: true,
                            lugar: true,
                            horas_totales_ofrecidas: true,
                            categoria: {
                                select: {
                                    id: true,
                                    nombre: true,
                                    color_hex: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    convocatoria: {
                        fecha_inicio: 'desc'
                    }
                }
            });
        }, 'Error al obtener actividades disponibles');

        // Transform Decimal and Date fields to match interface
        return actividades.map(actividad => ({
            ...actividad,
            horas_estimadas: Number(actividad.horas_estimadas),
            horas_maximas: actividad.horas_maximas ? Number(actividad.horas_maximas) : null,
            fecha_inicio: actividad.fecha_inicio ? actividad.fecha_inicio.toISOString() : null,
            fecha_limite: actividad.fecha_limite ? actividad.fecha_limite.toISOString() : null,
            convocatoria: {
                ...actividad.convocatoria,
                horas_totales_ofrecidas: actividad.convocatoria.horas_totales_ofrecidas ? Number(actividad.convocatoria.horas_totales_ofrecidas) : null
            }
        }));
    } catch (error) {
        console.error('Error en getActividadesDisponibles:', error);
        throw new Error('No se pudieron cargar las actividades disponibles');
    }
}

// Obtener reportes recientes del estudiante (para evitar duplicados)
export async function getReportesRecientes() {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ESTUDIANTE') {
        throw new Error('No autorizado');
    }

    try {
        const reportes = await db.execute(async (prisma) => {
            return await prisma.reporteHoras.findMany({
                where: {
                    id_estudiante: session.user.id,
                    reportado_en: {
                        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Últimos 7 días
                    }
                },
                include: {
                    actividad: {
                        select: {
                            nombre: true,
                            fecha_limite: true
                        }
                    }
                },
                orderBy: {
                    reportado_en: 'desc'
                },
                take: 10
            });
        }, 'Error al obtener reportes recientes');

        return reportes;
    } catch (error) {
        console.error('Error en getReportesRecientes:', error);
        throw new Error('No se pudieron cargar los reportes recientes');
    }
}

// Crear un nuevo reporte de horas
export async function crearReporteHoras(formData: FormData) {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ESTUDIANTE') {
        throw new Error('No autorizado');
    }

    try {
        // Extraer y validar datos del formulario
        const data = {
            id_actividad: formData.get('id_actividad') as string,
            horas_reportadas: parseFloat(formData.get('horas_reportadas') as string),
            descripcion_trabajo: formData.get('descripcion_trabajo') as string,
            notas_estudiante: formData.get('notas_estudiante') as string || undefined,
        };

        // Procesar archivos adjuntos
        const archivos = formData.getAll('archivos') as File[];
        let archivos_soporte: UploadedFile[] = [];

        if (archivos && archivos.length > 0) {
            // Filtrar archivos válidos
            const archivosValidos = archivos.filter(file => file.size > 0);
            
            if (archivosValidos.length > 0) {
                archivos_soporte = await uploadMultipleFiles(archivosValidos);
            }
        }

        // Validar datos
        const validatedData = reporteSchema.parse({
            ...data,
            archivos_soporte: archivos_soporte.length > 0 ? archivos_soporte : undefined
        });

        // Verificar que la actividad exista y esté disponible
        const actividad = await db.execute(async (prisma) => {
            return await prisma.actividad.findUnique({
                where: { id: validatedData.id_actividad },
                include: {
                    convocatoria: {
                        select: {
                            estado: true,
                            fecha_cierre_postulacion: true
                        }
                    }
                }
            });
        }, 'Error al verificar actividad');

        if (!actividad || !actividad.esta_activa) {
            throw new Error('La actividad no está disponible');
        }

        if (actividad.convocatoria?.estado !== 'PUBLICADA') {
            throw new Error('La convocatoria no está activa');
        }

        if (actividad.convocatoria?.fecha_cierre_postulacion && 
            actividad.convocatoria.fecha_cierre_postulacion < new Date()) {
            throw new Error('La convocatoria ha cerrado el período de postulación');
        }

        // Verificar que no exista un reporte duplicado para la misma fecha y actividad
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const manana = new Date(hoy);
        manana.setDate(manana.getDate() + 1);

        const reporteExistente = await db.execute(async (prisma) => {
            return await prisma.reporteHoras.findFirst({
                where: {
                    id_estudiante: session.user.id,
                    id_actividad: validatedData.id_actividad,
                    reportado_en: {
                        gte: hoy,
                        lt: manana
                    }
                }
            });
        }, 'Error al verificar reporte existente');

        if (reporteExistente) {
            throw new Error('Ya has reportado horas para esta actividad hoy');
        }

        const fecha_actividad = formData.get('fecha_actividad') as string | null;

        // Crear el reporte
        const nuevoReporte = await db.execute(async (prisma) => {
            return await prisma.reporteHoras.create({
                data: {
                    id_estudiante: session.user.id,
                    id_actividad: validatedData.id_actividad,
                    id_convocatoria: actividad.id_convocatoria,
                    horas_reportadas: validatedData.horas_reportadas,
                    descripcion_trabajo: validatedData.descripcion_trabajo,
                    notas_estudiante: validatedData.notas_estudiante,
                    fecha_actividad: fecha_actividad ? new Date(fecha_actividad) : null,
                    estado: 'REPORTADO' as any,
                    reportado_en: new Date()
                } as any,
                include: {
                    actividad: {
                        select: {
                            nombre: true,
                            convocatoria: { select: { titulo: true } }
                        }
                    }
                }
            });
        }, 'Error al crear reporte de horas');

        // Registrar en el log de actividad
        await db.execute(async (prisma) => {
            return await prisma.logActividad.create({
                data: {
                    id_usuario: session.user.id,
                    accion: 'CREAR_REPORTE_HORAS',
                    entidad: 'ReporteHoras',
                    id_entidad: nuevoReporte.id,
                    descripcion: `Reporte de ${validatedData.horas_reportadas} horas para actividad ${actividad.nombre}`,
                    resultado: 'EXITOSO',
                    metadata: {
                        horas_reportadas: validatedData.horas_reportadas,
                        id_actividad: validatedData.id_actividad,
                        archivos_adjuntos: archivos_soporte.length,
                        nombres_archivos: archivos_soporte.map(a => a.nombre)
                    }
                }
            });
        }, 'Error al registrar log de actividad');

        // Revalidar rutas correctas
        revalidatePath('/sistema/estudiante/mis-horas');
        revalidatePath('/sistema/estudiante/mis-horas/reportar');

        return {
            success: true,
            message: `Reporte de horas enviado exitosamente${archivos_soporte.length > 0 ? ` con ${archivos_soporte.length} archivo(s) adjunto(s)` : ''}`,
            data: nuevoReporte
        };

    } catch (error) {
        console.error('Error en crearReporteHoras:', error);
        
        if (error instanceof z.ZodError) {
            throw new Error(`Datos inválidos: ${error.errors.map(e => e.message).join(', ')}`);
        }
        
        throw new Error(error instanceof Error ? error.message : 'Error al crear el reporte de horas');
    }
}

// Obtener actividades de convocatorias completadas/finalizadas del estudiante
export async function getActividadesConvocatoriasPasadas() {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ESTUDIANTE') {
        throw new Error('No autorizado');
    }

    const estudianteId = session.user.id;

    try {
        // Obtener postulaciones aceptadas de convocatorias que ya cerraron o finalizaron
        const postulacionesPasadas = await db.execute(async (prisma) => {
            return await prisma.postulacion.findMany({
                where: {
                    id_estudiante: estudianteId,
                    estado: 'ACEPTADA',
                    convocatoria: {
                        OR: [
                            { estado: { in: ['CERRADA', 'CANCELADA'] } },
                            { 
                                fecha_cierre_postulacion: { 
                                    lt: new Date(),
                                    not: null
                                } 
                            }
                        ]
                    }
                },
                select: {
                    id_convocatoria: true,
                    convocatoria: {
                        select: {
                            titulo: true,
                            estado: true,
                            fecha_cierre_postulacion: true
                        }
                    }
                }
            });
        }, 'Error al obtener postulaciones pasadas');

        if (postulacionesPasadas.length === 0) {
            return [];
        }

        const convocatoriasIds = postulacionesPasadas.map(p => p.id_convocatoria);

        const actividades = await db.execute(async (prisma) => {
            return await prisma.actividad.findMany({
                where: {
                    id_convocatoria: { in: convocatoriasIds }
                },
                include: {
                    convocatoria: {
                        select: {
                            titulo: true,
                            descripcion: true,
                            modalidad: true,
                            lugar: true,
                            estado: true,
                            fecha_cierre_postulacion: true,
                            horas_totales_ofrecidas: true,
                            categoria: {
                                select: {
                                    id: true,
                                    nombre: true,
                                    color_hex: true
                                }
                            }
                        }
                    },
                    reportes: {
                        where: { id_estudiante: estudianteId },
                        select: {
                            id: true,
                            horas_reportadas: true,
                            estado: true,
                            reportado_en: true
                        },
                        orderBy: { reportado_en: 'desc' }
                    }
                },
                orderBy: {
                    convocatoria: {
                        fecha_cierre_postulacion: 'desc'
                    }
                }
            });
        }, 'Error al obtener actividades de convocatorias pasadas');

        // Transformar los datos
        return actividades.map((actividad: any) => ({
            ...actividad,
            horas_estimadas: Number(actividad.horas_estimadas),
            horas_maximas: actividad.horas_maximas ? Number(actividad.horas_maximas) : null,
            fecha_inicio: actividad.fecha_inicio ? actividad.fecha_inicio.toISOString() : null,
            fecha_limite: actividad.fecha_limite ? actividad.fecha_limite.toISOString() : null,
            horas_reportadas_total: actividad.reportes.reduce((sum: number, r: any) => sum + Number(r.horas_reportadas), 0),
            reportes: actividad.reportes.map((r: any) => ({
                ...r,
                horas_reportadas: Number(r.horas_reportadas),
                reportado_en: r.reportado_en.toISOString()
            })),
            convocatoria: {
                ...actividad.convocatoria,
                horas_totales_ofrecidas: actividad.convocatoria.horas_totales_ofrecidas ? Number(actividad.convocatoria.horas_totales_ofrecidas) : null
            }
        }));
    } catch (error) {
        console.error('Error en getActividadesConvocatoriasPasadas:', error);
        throw new Error('No se pudieron cargar las actividades de convocatorias pasadas');
    }
}

// Obtener estadísticas del estudiante para el dashboard
export async function getEstadisticasReportes() {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ESTUDIANTE') {
        throw new Error('No autorizado');
    }

    try {
        const stats = await db.execute(async (prisma) => {
            const totalReportes = await prisma.reporteHoras.count({
                where: { id_estudiante: session.user.id }
            });

            const totalHoras = await prisma.reporteHoras.aggregate({
                where: { id_estudiante: session.user.id },
                _sum: { horas_reportadas: true }
            });

            const horasAprobadas = await prisma.reporteHoras.aggregate({
                where: { 
                    id_estudiante: session.user.id,
                    estado: EstadoReporte.APROBADO
                },
                _sum: { horas_reportadas: true }
            });

            const reportesEsteMes = await prisma.reporteHoras.count({
                where: {
                    id_estudiante: session.user.id,
                    reportado_en: {
                        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                    }
                }
            });

            return {
                totalReportes,
                totalHoras: Number(totalHoras._sum.horas_reportadas || 0),
                horasAprobadas: Number(horasAprobadas._sum.horas_reportadas || 0),
                reportesEsteMes
            };
        }, 'Error al obtener estadísticas');

        return stats;
    } catch (error) {
        console.error('Error en getEstadisticasReportes:', error);
        throw new Error('No se pudieron obtener las estadísticas');
    }
}
