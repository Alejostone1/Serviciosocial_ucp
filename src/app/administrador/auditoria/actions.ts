'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * Validar permisos de ADMINISTRADOR
 */
async function checkAdmin() {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMINISTRADOR') {
        throw new Error('No autorizado');
    }
}

/**
 * Obtener logs de actividad (Auditoría)
 */
export async function getAuditoriaLogs() {
    await checkAdmin();

    const logs = await prisma.logActividad.findMany({
        select: {
            id: true,
            accion: true,
            entidad: true,
            descripcion: true,
            resultado: true,
            creado_en: true,
            usuario: {
                select: {
                    primer_nombre: true,
                    primer_apellido: true,
                    correo: true,
                    rol: true
                }
            }
        },
        orderBy: {
            creado_en: 'desc'
        },
        take: 100 // Límite inicial de 100 registros recientes
    });

    return logs;
}
