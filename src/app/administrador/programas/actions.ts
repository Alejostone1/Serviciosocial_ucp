'use server';

import { prisma } from '@/lib/prisma';
import { NivelFormacion } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { transformDecimalsToNumbers } from '@/lib/decimal-utils';

async function checkAdmin() {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMINISTRADOR') {
        throw new Error('No autorizado');
    }
}

/** Obtener todos los programas con nombre de facultad */
export async function getProgramas() {
    await checkAdmin();
    const programas = await prisma.programa.findMany({
        include: {
            facultad: { select: { nombre: true } },
            _count: { select: { usuarios: true, convocatorias: true } },
        },
        orderBy: { nombre: 'asc' },
    });
    
    // Convertir todos los Decimals a Numbers recursivamente
    return transformDecimalsToNumbers(programas);
}

/** Obtener solo las facultades activas (para el select del formulario) */
export async function getFacultadesActivas() {
    await checkAdmin();
    return prisma.facultad.findMany({
        where: { esta_activo: true },
        select: { id: true, nombre: true },
        orderBy: { nombre: 'asc' },
    });
}

/** Crear un nuevo programa */
export async function crearPrograma(data: {
    nombre: string;
    id_facultad: string;
    nivel_formacion: NivelFormacion;
    horas_requeridas: number;
    codigo?: string;
}) {
    await checkAdmin();
    const prog = await prisma.programa.create({ data: { ...data, horas_requeridas: data.horas_requeridas } });
    const session = await getServerSession(authOptions);
    await prisma.logActividad.create({
        data: {
            id_usuario: session?.user?.id ?? undefined,
            accion: 'CREAR_PROGRAMA',
            entidad: 'Programa',
            id_entidad: prog.id,
            descripcion: `Programa '${prog.nombre}' creado`,
            resultado: 'EXITOSO',
        }
    });
    revalidatePath('/administrador/programas');
    return prog;
}

/** Activar/Desactivar un programa */
export async function togglePrograma(id: string, estado: boolean) {
    await checkAdmin();
    const prog = await prisma.programa.update({ where: { id }, data: { esta_activo: estado } });
    revalidatePath('/administrador/programas');
    return prog;
}

/** Obtener detalles completos de un programa */
export async function getProgramaById(id: string) {
    await checkAdmin();
    
    try {
        const programa = await prisma.programa.findUnique({
            where: { id },
            include: {
                facultad: {
                    select: {
                        id: true,
                        nombre: true,
                        codigo: true,
                        decano: true,
                        correo_contacto: true
                    }
                },
                usuarios: {
                    where: { rol: 'ESTUDIANTE' },
                    select: {
                        id: true,
                        primer_nombre: true,
                        segundo_nombre: true,
                        primer_apellido: true,
                        segundo_apellido: true,
                        numero_documento: true,
                        correo: true,
                        telefono: true,
                        esta_bloqueado: true,
                        ultimo_acceso: true,
                        perfil_estudiante: {
                            select: {
                                semestre_actual: true,
                                codigo_estudiantil: true,
                                horas_previas: true,
                                horas_acumuladas: true,
                                porcentaje_avance: true
                            }
                        }
                    },
                    orderBy: { primer_apellido: 'asc' }
                },
                convocatorias: {
                    select: {
                        id: true,
                        titulo: true,
                        estado: true,
                        modalidad: true,
                        fecha_inicio: true,
                        fecha_fin: true,
                        cupo_maximo: true,
                        cupo_disponible: true,
                        horas_totales_ofrecidas: true,
                        _count: {
                            select: { postulaciones: true }
                        }
                    },
                    orderBy: { creado_en: 'desc' }
                },
                _count: {
                    select: {
                        usuarios: true,
                        convocatorias: true
                    }
                }
            }
        });

        if (!programa) return null;

        // Convertir Decimals a numbers
        return {
            ...programa,
            horas_requeridas: Number(programa.horas_requeridas),
            usuarios: programa.usuarios.map(usuario => ({
                ...usuario,
                perfil_estudiante: usuario.perfil_estudiante ? {
                    ...usuario.perfil_estudiante,
                    horas_previas: Number(usuario.perfil_estudiante.horas_previas),
                    horas_acumuladas: Number(usuario.perfil_estudiante.horas_acumuladas),
                    porcentaje_avance: Number(usuario.perfil_estudiante.porcentaje_avance)
                } : null
            })),
            convocatorias: programa.convocatorias.map(conv => ({
                ...conv,
                horas_totales_ofrecidas: conv.horas_totales_ofrecidas ? Number(conv.horas_totales_ofrecidas) : null
            }))
        };
    } catch (error) {
        console.error('Error en getProgramaById:', error);
        throw error;
    }
}

/** Actualizar un programa existente */
export async function actualizarPrograma(id: string, data: {
    nombre: string;
    id_facultad: string;
    nivel_formacion: NivelFormacion;
    horas_requeridas: number;
    codigo?: string;
}) {
    await checkAdmin();
    
    try {
        const programa = await prisma.programa.update({
            where: { id },
            data: {
                nombre: data.nombre,
                id_facultad: data.id_facultad,
                nivel_formacion: data.nivel_formacion,
                horas_requeridas: data.horas_requeridas,
                codigo: data.codigo || null,
            },
            include: {
                facultad: { select: { nombre: true } },
                _count: { select: { usuarios: true, convocatorias: true } },
            },
        });

        const session = await getServerSession(authOptions);
        await prisma.logActividad.create({
            data: {
                id_usuario: session?.user?.id ?? undefined,
                accion: 'ACTUALIZAR_PROGRAMA',
                entidad: 'Programa',
                id_entidad: programa.id,
                descripcion: `Programa '${programa.nombre}' actualizado`,
                resultado: 'EXITOSO',
            }
        });

        revalidatePath('/administrador/programas');
        // Convertir Decimal a number
        return {
            ...programa,
            horas_requeridas: Number(programa.horas_requeridas),
        };
    } catch (error) {
        console.error('Error en actualizarPrograma:', error);
        throw error;
    }
}

/** Eliminar un programa (solo si no tiene estudiantes ni convocatorias asociadas) */
export async function eliminarPrograma(id: string) {
    await checkAdmin();
    
    try {
        // Verificar que el programa exista
        const programa = await prisma.programa.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { usuarios: true, convocatorias: true }
                }
            }
        });

        if (!programa) {
            throw new Error('Programa no encontrado');
        }

        if (programa._count.usuarios > 0) {
            throw new Error('No se puede eliminar un programa con estudiantes asociados');
        }

        if (programa._count.convocatorias > 0) {
            throw new Error('No se puede eliminar un programa con convocatorias asociadas');
        }

        // Eliminar el programa
        await prisma.programa.delete({
            where: { id }
        });

        const session = await getServerSession(authOptions);
        await prisma.logActividad.create({
            data: {
                id_usuario: session?.user?.id ?? undefined,
                accion: 'ELIMINAR_PROGRAMA',
                entidad: 'Programa',
                id_entidad: id,
                descripcion: `Programa '${programa.nombre}' eliminado`,
                resultado: 'EXITOSO',
            }
        });

        revalidatePath('/administrador/programas');
        return programa;
    } catch (error) {
        console.error('Error en eliminarPrograma:', error);
        throw error;
    }
}

/** Obtener estadísticas de un programa */
export async function getEstadisticasPrograma(id: string) {
    await checkAdmin();
    
    try {
        const [
            totalEstudiantes,
            estudiantesActivos,
            estudiantesPorSemestre,
            totalHorasAcumuladas,
            convocatoriasActivas,
            postulacionesPendientes
        ] = await Promise.all([
            // Total de estudiantes
            prisma.usuario.count({
                where: { 
                    id_programa: id,
                    rol: 'ESTUDIANTE'
                }
            }),
            // Estudiantes activos (no bloqueados)
            prisma.usuario.count({
                where: { 
                    id_programa: id,
                    rol: 'ESTUDIANTE',
                    esta_bloqueado: false
                }
            }),
            // Distribución por semestre
            prisma.perfilEstudiante.groupBy({
                by: ['semestre_actual'],
                where: {
                    usuario: {
                        id_programa: id,
                        rol: 'ESTUDIANTE'
                    }
                },
                _count: true
            }),
            // Total horas acumuladas
            prisma.perfilEstudiante.aggregate({
                where: {
                    usuario: {
                        id_programa: id,
                        rol: 'ESTUDIANTE'
                    }
                },
                _sum: { horas_acumuladas: true }
            }),
            // Convocatorias activas
            prisma.convocatoria.count({
                where: {
                    id_programa: id,
                    estado: 'PUBLICADA'
                }
            }),
            // Postulaciones pendientes
            prisma.postulacion.count({
                where: {
                    convocatoria: {
                        id_programa: id
                    },
                    estado: 'PENDIENTE'
                }
            })
        ]);

        return {
            totalEstudiantes,
            estudiantesActivos,
            estudiantesInactivos: totalEstudiantes - estudiantesActivos,
            estudiantesPorSemestre: estudiantesPorSemestre.map(item => ({
                semestre: item.semestre_actual,
                cantidad: item._count
            })).filter(item => item.semestre !== null),
            totalHorasAcumuladas: Number(totalHorasAcumuladas._sum.horas_acumuladas || 0),
            convocatoriasActivas,
            postulacionesPendientes
        };
    } catch (error) {
        console.error('Error en getEstadisticasPrograma:', error);
        throw error;
    }
}
