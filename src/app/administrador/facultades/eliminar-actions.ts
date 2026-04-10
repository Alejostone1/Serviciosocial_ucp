'use server';

import { prisma, db } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { transformDecimalsToNumbers } from '@/lib/decimal-utils';

async function checkAdmin() {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMINISTRADOR') {
        throw new Error('No autorizado');
    }
    return session;
}

/**
 * Obtener datos para la gestión de eliminación de facultad
 */
export async function getDatosGestionEliminacion(id: string) {
    await checkAdmin();
    
    try {
        const facultad = await prisma.facultad.findUnique({
            where: { id },
            include: {
                programas: {
                    include: {
                        _count: {
                            select: { 
                                usuarios: true, 
                                convocatorias: true 
                            }
                        }
                    }
                }
            }
        });

        if (!facultad) throw new Error('Facultad no encontrada');

        const otrasFacultades = await prisma.facultad.findMany({
            where: { 
                id: { not: id },
                esta_activo: true
            },
            select: {
                id: true,
                nombre: true
            },
            orderBy: { nombre: 'asc' }
        });

        return transformDecimalsToNumbers({
            facultad,
            otrasFacultades
        });
    } catch (error) {
        console.error('Error en getDatosGestionEliminacion:', error);
        throw error;
    }
}

/**
 * Ejecutar la eliminación por lotes de una facultad
 * Permite reasignar programas a otras facultades y eliminar los que no tengan vínculos
 */
export async function ejecutarEliminacionGobernanza(
    idFacultad: string, 
    reasignaciones: { idPrograma: string, idNuevaFacultad: string | 'ELIMINAR' }[]
) {
    const session = await checkAdmin();
    
    try {
        return await db.transaction(async (prisma) => {
            // 1. Procesar cada reasignación/eliminación de programa
            for (const item of reasignaciones) {
                if (item.idNuevaFacultad === 'ELIMINAR') {
                    // Verificar si se puede eliminar el programa
                    const prog = await prisma.programa.findUnique({
                        where: { id: item.idPrograma },
                        include: {
                            _count: {
                                select: { usuarios: true, convocatorias: true }
                            }
                        }
                    });
                    
                    if (!prog) continue;
                    if (prog._count.usuarios > 0 || prog._count.convocatorias > 0) {
                        throw new Error(`El programa "${prog.nombre}" no puede eliminarse porque tiene registros vinculados.`);
                    }
                    
                    await prisma.programa.delete({ where: { id: item.idPrograma } });
                } else {
                    // Reasignar a otra facultad
                    await prisma.programa.update({
                        where: { id: item.idPrograma },
                        data: { id_facultad: item.idNuevaFacultad }
                    });
                }
            }

            // 2. Verificar que ya no queden programas en la facultad original
            const conteoFinal = await prisma.programa.count({
                where: { id_facultad: idFacultad }
            });

            if (conteoFinal > 0) {
                throw new Error('Aún quedan programas vinculados a esta facultad.');
            }

            // 3. Eliminar la facultad
            const facultadEliminada = await prisma.facultad.delete({
                where: { id: idFacultad }
            });

            // 4. Registrar en el log
            await prisma.logActividad.create({
                data: {
                    id_usuario: session?.user?.id ?? undefined,
                    accion: 'ELIMINAR_FACULTAD_GOBERNANZA',
                    entidad: 'Facultad',
                    id_entidad: idFacultad,
                    descripcion: `Eliminación completa de facultad '${facultadEliminada.nombre}' con reasignación de programas asociada.`,
                    resultado: 'EXITOSO',
                }
            });

            revalidatePath('/administrador/facultades');
            return { success: true };
        }, 'Error en la operación de gobernanza de facultades');
    } catch (error: any) {
        console.error('Error en ejecutarEliminacionGobernanza:', error);
        throw error;
    }
}
