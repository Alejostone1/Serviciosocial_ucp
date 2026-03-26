'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/prisma';

export async function getCertificadosEstudiante() {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ESTUDIANTE') {
        throw new Error('No autorizado');
    }

    const userId = session.user.id;

    const certificados = await db.execute(async (prisma) => {
        return await prisma.certificado.findMany({
            where: { id_estudiante: userId },
            include: {
                convocatoria: {
                    select: { 
                        titulo: true, 
                        descripcion: true, 
                        categoria: { 
                            select: { nombre: true, color_hex: true } 
                        } 
                    }
                },
                emisor: {
                    select: { primer_nombre: true, primer_apellido: true }
                }
            },
            orderBy: { emitido_en: 'desc' }
        });
    }, 'Error al obtener certificados');

    // Convert Decimal to Number for serialization
    return certificados.map(cert => ({
        ...cert,
        total_horas: Number(cert.total_horas)
    }));
}

export async function getEstadisticasCertificados() {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ESTUDIANTE') {
        throw new Error('No autorizado');
    }

    const userId = session.user.id;

    return await db.execute(async (prisma) => {
        const total = await prisma.certificado.count({ where: { id_estudiante: userId } });
        const horas = await prisma.certificado.aggregate({ 
            where: { id_estudiante: userId }, 
            _sum: { total_horas: true } 
        });
        const esteAno = await prisma.certificado.count({ 
            where: { 
                id_estudiante: userId, 
                emitido_en: { gte: new Date(new Date().getFullYear(), 0, 1) } 
            } 
        });
        const ultimo = await prisma.certificado.findFirst({ 
            where: { id_estudiante: userId }, 
            orderBy: { emitido_en: 'desc' }, 
            select: { emitido_en: true } 
        });

        return {
            totalCertificados: total,
            totalHorasCertificadas: Number(horas._sum.total_horas || 0),
            certificadosEsteAnio: esteAno,
            ultimoCertificado: ultimo?.emitido_en || null
        };
    }, 'Error al obtener estadísticas');
}

export async function getProgresoCertificacion() {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ESTUDIANTE') {
        throw new Error('No autorizado');
    }

    const userId = session.user.id;

    const perfil = await db.execute(async (prisma) => {
        return await prisma.perfilEstudiante.findUnique({
            where: { id_usuario: userId },
            select: { horas_acumuladas: true, porcentaje_avance: true }
        });
    }, 'Error al obtener perfil');

    const horasRequeridas = 180;
    const horasAcumuladas = Number(perfil?.horas_acumuladas || 0);
    const porcentajeAvance = Number(perfil?.porcentaje_avance || 0);
    const completado = horasAcumuladas >= horasRequeridas;

    return {
        horasRequeridas,
        horasAcumuladas,
        porcentajeAvance,
        horasRestantes: Math.max(0, horasRequeridas - horasAcumuladas),
        completado
    };
}
