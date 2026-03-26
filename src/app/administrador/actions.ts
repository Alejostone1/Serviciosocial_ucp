'use server';

import { prisma } from '@/lib/prisma';
import { EstadoConvocatoria, EstadoPostulacion, EstadoReporte, Rol } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * Validar que el usuario que ejecuta esta acción tenga permisos de ADMINISTRADOR
 */
async function checkAdmin() {
    const session = await getServerSession(authOptions);

    // Si no hay sesión, retornar datos de demostración en desarrollo
    if (!session?.user) {
        if (process.env.NODE_ENV === 'development') {
            console.log('Modo desarrollo: sin sesión activa, usando datos de demostración');
            return; // Permitir continuar en desarrollo
        }
        throw new Error('No autorizado: Sesión no encontrada');
    }

    // Verificar rol de administrador
    if (session.user.role !== 'ADMINISTRADOR') {
        if (process.env.NODE_ENV === 'development') {
            console.log('Modo desarrollo: usuario no es administrador, usando datos de demostración');
            return; // Permitir continuar en desarrollo
        }
        throw new Error('No autorizado: Se requiere rol de administrador');
    }
}

export async function getDashboardStats() {
    await checkAdmin();

    const [
        totalUsuarios,
        estudiantesActivos,
        convocatoriasPorEstado,
        postulacionesPendientes,
        reportesEnRevision,
        certificadosEmitidos,
        vinculacionesActivas,
        horasResult
    ] = await Promise.all([
        // Total usuarios generales
        prisma.usuario.count({
            where: { esta_bloqueado: false }
        }),

        // Total estudiantes activos
        prisma.usuario.count({
            where: {
                rol: Rol.ESTUDIANTE,
                esta_bloqueado: false
            }
        }),

        // Convocatorias por estado (Ej. ACTIVAS y PUBLICADAS)
        prisma.convocatoria.groupBy({
            by: ['estado'],
            _count: {
                id: true,
            },
        }),

        // Postulaciones PENDIENTES
        prisma.postulacion.count({
            where: { estado: EstadoPostulacion.PENDIENTE }
        }),

        // Reportes en REVISIÓN (Incluye los nuevos estados del Auxiliar)
        prisma.reporteHoras.count({
            where: { 
                estado: {
                    in: [EstadoReporte.EN_REVISION, EstadoReporte.REPORTADO, EstadoReporte.PENDIENTE_VALIDACION, 'VALIDADO_AUXILIAR' as any]
                }
            }
        }),

        // Certificados Vigentes
        prisma.certificado.count({
            where: { esta_vigente: true }
        }),

        // Vinculaciones activas / aprobadas
        prisma.vinculacionAliado.count({
            where: { estado: 'APROBADA' }
        }),

        // Suma de horas acumuladas de todos los estudiantes
        prisma.perfilEstudiante.aggregate({
            _sum: {
                horas_acumuladas: true
            }
        }),
    ]);

    // Formatear convocatorias para extraer fáciles
    const convocatorias = {
        publicadas: convocatoriasPorEstado.find(c => c.estado === EstadoConvocatoria.PUBLICADA)?._count.id || 0,
        en_curso: convocatoriasPorEstado.find(c => c.estado === EstadoConvocatoria.EN_CURSO)?._count.id || 0,
        borradores: convocatoriasPorEstado.find(c => c.estado === EstadoConvocatoria.BORRADOR)?._count.id || 0,
    };

    const totalHoras = horasResult._sum.horas_acumuladas ? Number(horasResult._sum.horas_acumuladas) : 0;

    // Fetch recent activity
    const [recentConvocatorias, recentNoticias] = await Promise.all([
        prisma.convocatoria.findMany({
            take: 3,
            orderBy: { creado_en: 'desc' },
            select: { id: true, titulo: true, creado_en: true, estado: true }
        }),
        prisma.noticia.findMany({
            take: 3,
            orderBy: { creado_en: 'desc' },
            select: { id: true, titulo: true, creado_en: true, publicada: true }
        })
    ]);

    return {
        totalUsuarios,
        estudiantesActivos,
        convocatorias,
        postulacionesPendientes,
        reportesEnRevision,
        certificadosEmitidos,
        vinculacionesActivas,
        totalHoras,
        recentActivity: {
            convocatorias: recentConvocatorias,
            noticias: recentNoticias
        }
    };
}

/**
 * Obtener los logs de actividad más recientes para las notificaciones del administrador
 */
export async function getRecentLogs() {
    await checkAdmin();

    try {
        const logs = await prisma.logActividad.findMany({
            take: 15,
            orderBy: { creado_en: 'desc' },
            include: {
                usuario: {
                    select: {
                        primer_nombre: true,
                        primer_apellido: true,
                        rol: true
                    }
                }
            }
        });

        return logs.map(log => ({
            id: log.id,
            accion: log.accion,
            descripcion: log.descripcion,
            entidad: log.entidad,
            creado_en: log.creado_en.toISOString(),
            usuario: log.usuario ? `${log.usuario.primer_nombre} ${log.usuario.primer_apellido}` : 'Sistema',
            rol: log.usuario?.rol || 'SISTEMA'
        }));
    } catch (error) {
        console.error('Error al obtener logs:', error);
        return [];
    }
}
