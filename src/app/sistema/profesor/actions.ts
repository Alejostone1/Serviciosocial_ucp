'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

async function checkProfesor() {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user.role !== 'PROFESOR' && session.user.role !== 'ADMINISTRADOR')) {
        throw new Error('No autorizado');
    }
    return session;
}

export async function getDashboardStatsProfesor() {
    const session = await checkProfesor();
    const profesorId = session.user.id;

    // Obtener convocatorias del profesor (publicadas por él)
    const convocatoriasCount = await prisma.convocatoria.count({
        where: { 
            publicado_por: profesorId
        }
    });

    // Obtener actividades relacionadas con convocatorias del profesor
    const actividadesCount = await prisma.actividad.count({
        where: {
            convocatoria: {
                publicado_por: profesorId
            },
            esta_activa: true
        }
    });

    // Obtener reportes pendientes de revisión
    const reportesPendientes = await prisma.reporteHoras.count({
        where: {
            actividad: {
                convocatoria: {
                    publicado_por: profesorId
                }
            },
            estado: 'PENDIENTE_VALIDACION'
        }
    });

    // Obtener estudiantes asociados a convocatorias del profesor
    const estudiantesAsociados = await prisma.postulacion.count({
        where: {
            convocatoria: {
                publicado_por: profesorId
            },
            estado: 'ACEPTADA'
        }
    });

    // Obtener conteos del mes anterior para calcular cambios
    const fechaInicioMes = new Date();
    fechaInicioMes.setDate(1);
    fechaInicioMes.setHours(0, 0, 0, 0);

    const convocatoriasNuevas = await prisma.convocatoria.count({
        where: {
            publicado_por: profesorId,
            creado_en: { gte: fechaInicioMes }
        }
    });

    const actividadesNuevas = await prisma.actividad.count({
        where: {
            convocatoria: { publicado_por: profesorId },
            creado_en: { gte: fechaInicioMes }
        }
    });

    return {
        convocatorias: {
            total: convocatoriasCount,
            nuevas: convocatoriasNuevas,
            change: convocatoriasNuevas > 0 ? `+${convocatoriasNuevas} este mes` : 'Sin cambios'
        },
        actividades: {
            total: actividadesCount,
            nuevas: actividadesNuevas,
            change: actividadesNuevas > 0 ? `+${actividadesNuevas} este mes` : 'Sin cambios'
        },
        pendientes: {
            total: reportesPendientes,
            change: reportesPendientes > 0 ? `${reportesPendientes} por revisar` : 'Al día'
        },
        estudiantes: {
            total: estudiantesAsociados,
            change: estudiantesAsociados > 0 ? `${estudiantesAsociados} activos` : 'Sin estudiantes'
        }
    };
}
