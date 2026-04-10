'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

async function getSession() {
    return await getServerSession(authOptions);
}

function checkAuth() {
    return async function() {
        const session = await getSession();
        if (!session?.user?.id) throw new Error('No autorizado');
        if (session.user.role !== 'AUXILIAR' && session.user.role !== 'ADMINISTRADOR') {
            throw new Error('No tiene permisos de auxiliar');
        }
        return session;
    };
}

const checkAuxiliar = checkAuth();

export async function getNotificacionesAuxiliar() {
    const session = await checkAuxiliar();
    
    return await prisma.notificacion.findMany({
        where: { 
            id_usuario: session.user.id,
            leida: false 
        },
        orderBy: { creado_en: 'desc' },
        take: 10,
    });
}

export async function getTodasNotificacionesAuxiliar() {
    const session = await checkAuxiliar();
    
    return await prisma.notificacion.findMany({
        where: { 
            id_usuario: session.user.id 
        },
        orderBy: { creado_en: 'desc' },
        take: 50,
    });
}

export async function marcarComoLeidaAuxiliar(id: string) {
    const session = await checkAuxiliar();

    const notif = await prisma.notificacion.update({
        where: { id, id_usuario: session.user.id },
        data: { leida: true, leida_en: new Date() },
    });

    revalidatePath('/sistema/auxiliar/dashboard');
    return notif;
}

export async function marcarTodasComoLeidasAuxiliar() {
    const session = await checkAuxiliar();

    const result = await prisma.notificacion.updateMany({
        where: { id_usuario: session.user.id, leida: false },
        data: { leida: true, leida_en: new Date() },
    });

    revalidatePath('/sistema/auxiliar/dashboard');
    return result;
}

export async function getConteoNotificacionesNoLeidas() {
    const session = await getSession();
    if (!session?.user?.id) return 0;
    
    const count = await prisma.notificacion.count({
        where: { 
            id_usuario: session.user.id,
            leida: false 
        },
    });
    
    return count;
}
