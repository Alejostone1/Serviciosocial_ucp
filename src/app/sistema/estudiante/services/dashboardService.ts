'use server';

import { db } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { transformDecimalsToNumbers } from '@/lib/decimal-utils';

async function getCurrentStudent() {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ESTUDIANTE') {
        throw new Error('No autorizado');
    }
    return session.user;
}

export async function getStudentProgress() {
    const student = await getCurrentStudent();
    
    // Obtener el perfil del estudiante con programa
    const perfil = await db.execute(async (prisma) => {
        return await prisma.usuario.findUnique({
            where: { id: student.id },
            select: {
                perfil_estudiante: {
                    select: {
                        horas_acumuladas: true,
                        porcentaje_avance: true
                    }
                },
                programa: {
                    select: {
                        horas_requeridas: true
                    }
                }
            }
        });
    }, 'Error al obtener progreso del estudiante');

    const transformedPerfil = transformDecimalsToNumbers(perfil);

    if (!transformedPerfil) {
        // Valores por defecto si no tiene perfil
        return {
            currentHours: 0,
            requiredHours: 180, // Valor estándar
            percentage: 0
        };
    }

    const currentHours = transformedPerfil.perfil_estudiante?.horas_acumuladas || 0;
    const requiredHours = transformedPerfil.programa?.horas_requeridas || 180;
    const percentage = Math.min((currentHours / requiredHours) * 100, 100);

    return {
        currentHours,
        requiredHours,
        percentage
    };
}

export async function getActiveProjects() {
    const student = await getCurrentStudent();
    
    const projects = await db.execute(async (prisma) => {
        return await prisma.postulacion.findMany({
            where: {
                id_estudiante: student.id,
                estado: {
                    in: ['ACEPTADA']
                }
            },
            include: {
                convocatoria: {
                    include: {
                        categoria: true,
                        programa: true
                    }
                }
            }
        });
    }, 'Error al obtener proyectos activos');

    const transformedProjects = transformDecimalsToNumbers(projects);

    return transformedProjects.map((project: any) => {
        // Get actual hours from activities for this postulation
        const horasReportadas = 0; // Would need to join with reportes
        
        return {
            id: project.id,
            nombre: project.convocatoria.titulo,
            organizacion: project.convocatoria.programa?.nombre || 'Programa no asignado',
            fechaInicio: project.convocatoria.fecha_inicio?.toISOString() || new Date().toISOString(),
            fechaFin: project.convocatoria.fecha_fin?.toISOString() || new Date().toISOString(),
            horasAcumuladas: horasReportadas,
            estado: 'EN PROGRESO' as 'EN PROGRESO' | 'ESPERANDO APROBACIÓN' | 'RECHAZADO'
        };
    });
}

export async function getAvailableOpportunities() {
    const student = await getCurrentStudent();
    
    const opportunities = await db.execute(async (prisma) => {
        return await prisma.convocatoria.findMany({
            where: {
                estado: 'PUBLICADA',
                fecha_inicio: {
                    lte: new Date()
                },
                fecha_fin: {
                    gte: new Date()
                }
            },
            include: {
                categoria: true,
                programa: true
            },
            orderBy: { publicado_en: 'desc' },
            take: 6 // Limitar a 6 para el dashboard
        });
    }, 'Error al obtener convocatorias disponibles');

    const transformedOpportunities = transformDecimalsToNumbers(opportunities);

    return transformedOpportunities.map((opportunity: any) => ({
        id: opportunity.id,
        categoria: opportunity.categoria?.nombre || 'SIN CATEGORÍA',
        titulo: opportunity.titulo,
        descripcion: opportunity.descripcion || '',
        horas: opportunity.horas_totales_ofrecidas || 0,
        organizacion: opportunity.programa?.nombre || 'Programa no asignado',
        modalidad: opportunity.modalidad
    }));
}

export async function getDashboardData() {
    const [progress, activeProjects, availableOpportunities] = await Promise.all([
        getStudentProgress(),
        getActiveProjects(),
        getAvailableOpportunities()
    ]);

    return {
        progress,
        activeProjects,
        availableOpportunities
    };
}
