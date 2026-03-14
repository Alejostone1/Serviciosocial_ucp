'use server';

import { prisma, db } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

async function checkAdmin() {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMINISTRADOR') {
        throw new Error('No autorizado');
    }
}

/** Obtener todas las facultades con conteo de programas */
export async function getFacultades() {
    await checkAdmin();
    try {
        return await db.execute(async (prisma) => {
            return await prisma.facultad.findMany({
                include: { _count: { select: { programas: true } } },
                orderBy: { nombre: 'asc' },
            });
        }, 'Error al obtener facultades');
    } catch (error) {
        console.error('Error en getFacultades:', error);
        throw error;
    }
}

/** Crear una nueva facultad */
export async function crearFacultad(data: { nombre: string; codigo?: string; decano?: string; correo_contacto?: string }) {
    await checkAdmin();
    try {
        return await db.transaction(async (prisma) => {
            const facultad = await prisma.facultad.create({ data });
            const session = await getServerSession(authOptions);
            await prisma.logActividad.create({
                data: {
                    id_usuario: session?.user?.id ?? undefined,
                    accion: 'CREAR_FACULTAD',
                    entidad: 'Facultad',
                    id_entidad: facultad.id,
                    descripcion: `Facultad '${facultad.nombre}' creada`,
                    resultado: 'EXITOSO',
                }
            });
            revalidatePath('/administrador/facultades');
            return facultad;
        }, 'Error al crear facultad');
    } catch (error) {
        console.error('Error en crearFacultad:', error);
        throw error;
    }
}

/** Actualizar una facultad */
export async function actualizarFacultad(id: string, data: { nombre?: string; codigo?: string; decano?: string; correo_contacto?: string; esta_activo?: boolean }) {
    await checkAdmin();
    try {
        return await db.execute(async (prisma) => {
            const facultad = await prisma.facultad.update({ where: { id }, data });
            revalidatePath('/administrador/facultades');
            return facultad;
        }, 'Error al actualizar facultad');
    } catch (error) {
        console.error('Error en actualizarFacultad:', error);
        throw error;
    }
}

/** Togglear activo/inactivo de una facultad */
export async function toggleFacultad(id: string, estado: boolean) {
    await checkAdmin();
    return actualizarFacultad(id, { esta_activo: estado });
}

/** Obtener detalles completos de una facultad */
export async function getFacultadById(id: string) {
    await checkAdmin();
    
    try {
        const facultad = await prisma.facultad.findUnique({
            where: { id },
            include: {
                programas: {
                    select: {
                        id: true,
                        nombre: true,
                        codigo: true,
                        nivel_formacion: true,
                        horas_requeridas: true,
                        esta_activo: true,
                        _count: {
                            select: { usuarios: true, convocatorias: true }
                        }
                    },
                    orderBy: { nombre: 'asc' }
                },
                _count: {
                    select: { programas: true }
                }
            }
        });

        if (!facultad) return null;

        // Convertir Decimals a numbers
        return {
            ...facultad,
            programas: facultad.programas.map(programa => ({
                ...programa,
                horas_requeridas: Number(programa.horas_requeridas)
            }))
        };
    } catch (error) {
        console.error('Error en getFacultadById:', error);
        throw error;
    }
}

/** Obtener estadísticas de una facultad */
export async function getEstadisticasFacultad(id: string) {
    await checkAdmin();
    
    try {
        const [
            totalProgramas,
            programasActivos,
            totalEstudiantes,
            estudiantesActivos,
            estudiantesPorRol,
            totalHorasRequeridas,
            convocatoriasPorFacultad
        ] = await Promise.all([
            // Total de programas
            prisma.programa.count({
                where: { id_facultad: id }
            }),
            // Programas activos
            prisma.programa.count({
                where: { 
                    id_facultad: id,
                    esta_activo: true
                }
            }),
            // Total de estudiantes
            prisma.usuario.count({
                where: { 
                    programa: { id_facultad: id },
                    rol: 'ESTUDIANTE'
                }
            }),
            // Estudiantes activos
            prisma.usuario.count({
                where: { 
                    programa: { id_facultad: id },
                    rol: 'ESTUDIANTE',
                    esta_bloqueado: false
                }
            }),
            // Distribución por rol
            prisma.usuario.groupBy({
                by: ['rol'],
                where: { 
                    programa: { id_facultad: id }
                },
                _count: true
            }),
            // Total horas requeridas
            prisma.programa.aggregate({
                where: { id_facultad: id },
                _sum: { horas_requeridas: true }
            }),
            // Convocatorias por programas de la facultad
            prisma.convocatoria.groupBy({
                by: ['estado'],
                where: {
                    programa: { id_facultad: id }
                },
                _count: true
            })
        ]);

        return {
            totalProgramas,
            programasActivos,
            programasInactivos: totalProgramas - programasActivos,
            totalEstudiantes,
            estudiantesActivos,
            estudiantesInactivos: totalEstudiantes - estudiantesActivos,
            estudiantesPorRol: estudiantesPorRol.map(item => ({
                rol: item.rol,
                cantidad: item._count
            })),
            totalHorasRequeridas: Number(totalHorasRequeridas._sum.horas_requeridas || 0),
            convocatoriasPorEstado: convocatoriasPorFacultad.map(item => ({
                estado: item.estado,
                cantidad: item._count
            }))
        };
    } catch (error) {
        console.error('Error en getEstadisticasFacultad:', error);
        throw error;
    }
}

/** Eliminar una facultad (solo si no tiene programas asociados) */
export async function eliminarFacultad(id: string) {
    await checkAdmin();
    
    try {
        // Verificar que la facultad exista
        const facultad = await prisma.facultad.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { programas: true }
                }
            }
        });

        if (!facultad) {
            throw new Error('Facultad no encontrada');
        }

        if (facultad._count.programas > 0) {
            throw new Error('No se puede eliminar una facultad con programas asociados');
        }

        // Eliminar la facultad
        await prisma.facultad.delete({
            where: { id }
        });

        const session = await getServerSession(authOptions);
        await prisma.logActividad.create({
            data: {
                id_usuario: session?.user?.id ?? undefined,
                accion: 'ELIMINAR_FACULTAD',
                entidad: 'Facultad',
                id_entidad: id,
                descripcion: `Facultad '${facultad.nombre}' eliminada`,
                resultado: 'EXITOSO',
            }
        });

        revalidatePath('/administrador/facultades');
        return facultad;
    } catch (error) {
        console.error('Error en eliminarFacultad:', error);
        throw error;
    }
}
