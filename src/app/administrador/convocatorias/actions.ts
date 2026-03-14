'use server';

import { prisma } from '@/lib/prisma';
import { EstadoConvocatoria } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * Validar permisos
 */
async function checkAdmin() {
    const session = await getServerSession(authOptions);
    if (!session?.user || !['ADMINISTRADOR', 'PROFESOR', 'ALIADO'].includes(session.user.role)) {
        throw new Error('No autorizado');
    }
}

/**
 * Obtener listado de todas las convocatorias
 */
export async function getConvocatorias() {
    await checkAdmin();

    const convocatorias = await prisma.convocatoria.findMany({
        select: {
            id: true,
            titulo: true,
            modalidad: true,
            estado: true,
            cupo_maximo: true,
            cupo_disponible: true,
            fecha_inicio: true,
            fecha_fin: true,
            creado_en: true,
            publicador: {
                select: {
                    primer_nombre: true,
                    primer_apellido: true,
                    rol: true
                }
            },
            programa: {
                select: { nombre: true }
            },
            _count: {
                select: { postulaciones: true }
            }
        },
        orderBy: {
            creado_en: 'desc'
        }
    });

    return convocatorias;
}

/**
 * Cambiar el estado de una convocatoria (Flujo)
 */
export async function cambiarEstadoConvocatoria(id: string, nuevoEstado: EstadoConvocatoria) {
    await checkAdmin();
    const session = await getServerSession(authOptions);

    const con = await prisma.convocatoria.update({
        where: { id },
        data: {
            estado: nuevoEstado,
            ...(nuevoEstado === 'PUBLICADA' ? { publicado_en: new Date() } : {})
        },
    });

    // Trazabilidad — session.user existe porque checkAdmin() ya lo validó
    const userId = session?.user?.id ?? undefined;
    await prisma.logActividad.create({
        data: {
            id_usuario: userId,
            accion: 'CAMBIAR_ESTADO_CONVOCATORIA',
            entidad: 'Convocatoria',
            id_entidad: id,
            descripcion: `Convocatoria '${con.titulo}' cambió a estado ${nuevoEstado}`,
            datos_nuevos: { estado: nuevoEstado },
            resultado: 'EXITOSO',
        }
    });

    return con;
}
