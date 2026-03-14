'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

async function getSession() {
    return await getServerSession(authOptions);
}

export async function getNotificaciones() {
    const session = await getSession();
    if (!session?.user?.id) throw new Error('No autorizado');

    return await prisma.notificacion.findMany({
        where: { id_usuario: session.user.id },
        orderBy: { creado_en: 'desc' },
    });
}

export async function marcarComoLeida(id: string) {
    const session = await getSession();
    if (!session?.user?.id) throw new Error('No autorizado');

    const notif = await prisma.notificacion.update({
        where: { id, id_usuario: session.user.id },
        data: { leida: true, leida_en: new Date() },
    });

    revalidatePath('/administrador/notificaciones');
    return notif;
}

export async function marcarTodasComoLeidas() {
    const session = await getSession();
    if (!session?.user?.id) throw new Error('No autorizado');

    const result = await prisma.notificacion.updateMany({
        where: { id_usuario: session.user.id, leida: false },
        data: { leida: true, leida_en: new Date() },
    });

    revalidatePath('/administrador/notificaciones');
    return result;
}

export async function eliminarNotificacion(id: string) {
    const session = await getSession();
    if (!session?.user?.id) throw new Error('No autorizado');

    await prisma.notificacion.delete({
        where: { id, id_usuario: session.user.id },
    });

    revalidatePath('/administrador/notificaciones');
}
