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
    
    // Obtener el perfil del estudiante
    const perfil = await db.execute(async (prisma) => {
        return await prisma.perfilEstudiante.findUnique({
            where: { id_usuario: student.id },
            select: {
                horas_acumuladas: true,
                porcentaje_avance: true
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

    const currentHours = transformedPerfil.horas_acumuladas || 0;
    const requiredHours = 180; // Valor estándar
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
                        categoria: true
                    }
                }
            }
        });
    }, 'Error al obtener proyectos activos');

    const transformedProjects = transformDecimalsToNumbers(projects);

    return transformedProjects.map((project: any) => {
        const estado = 'EN PROGRESO'; // Si está aceptada, está en progreso
        
        return {
            id: project.id,
            nombre: project.convocatoria.titulo,
            organizacion: 'Universidad Catolica de Pereira', // Simulado - debería venir de la relación
            fechaInicio: project.convocatoria.fecha_inicio?.toISOString() || new Date().toISOString(),
            fechaFin: project.convocatoria.fecha_fin?.toISOString() || new Date().toISOString(),
            horasAcumuladas: Math.floor(Math.random() * 50) + 10, // Simulado - debería venir de actividades
            estado: estado as 'EN PROGRESO' | 'ESPERANDO APROBACIÓN' | 'RECHAZADO'
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
                categoria: true
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
        organizacion: 'Universidad Catolica de Pereira', // Simulado - debería venir de la relación
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
