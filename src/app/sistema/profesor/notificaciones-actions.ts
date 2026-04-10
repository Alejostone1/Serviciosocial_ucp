'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

async function checkProfesor() {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'PROFESOR') {
        throw new Error('No autorizado');
    }
    return session;
}

/**
 * Obtener notificaciones del profesor
 */
export async function getNotificacionesProfesor() {
    const session = await checkProfesor();
    const profesorId = session.user.id;

    const notificaciones = await prisma.notificacion.findMany({
        where: {
            id_usuario: profesorId,
        },
        orderBy: {
            creado_en: 'desc',
        },
        take: 20,
    });

    return notificaciones.map(n => ({
        id: n.id,
        tipo: n.tipo,
        titulo: n.titulo,
        mensaje: n.mensaje,
        url_accion: n.url_accion,
        leida: n.leida,
        creado_en: n.creado_en,
    }));
}

/**
 * Contar notificaciones no leídas
 */
export async function getConteoNotificacionesNoLeidasProfesor() {
    const session = await checkProfesor();
    const profesorId = session.user.id;

    const count = await prisma.notificacion.count({
        where: {
            id_usuario: profesorId,
            leida: false,
        },
    });

    return count;
}

/**
 * Marcar notificación como leída
 */
export async function marcarComoLeidaProfesor(id: string) {
    const session = await checkProfesor();
    const profesorId = session.user.id;

    await prisma.notificacion.updateMany({
        where: {
            id,
            id_usuario: profesorId,
        },
        data: {
            leida: true,
            leida_en: new Date(),
        },
    });

    revalidatePath('/sistema/profesor');
    return { success: true };
}

/**
 * Marcar todas las notificaciones como leídas
 */
export async function marcarTodasComoLeidasProfesor() {
    const session = await checkProfesor();
    const profesorId = session.user.id;

    await prisma.notificacion.updateMany({
        where: {
            id_usuario: profesorId,
            leida: false,
        },
        data: {
            leida: true,
            leida_en: new Date(),
        },
    });

    revalidatePath('/sistema/profesor');
    return { success: true };
}
