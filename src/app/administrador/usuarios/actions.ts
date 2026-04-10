'use server';

import { prisma, db } from '@/lib/prisma';
import { Rol, EstadoUsuario } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { transformDecimalsToNumbers } from '@/lib/decimal-utils';
import { revalidatePath } from 'next/cache';

/**
 * Validar permisos de ADMINISTRADOR
 */
async function checkAdmin() {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMINISTRADOR') {
        throw new Error('No autorizado');
    }
    return session;
}

/**
 * Obtener todos los usuarios con información básica y del programa
 */
export async function getUsuarios() {
    await checkAdmin();

    try {
        return await db.execute(async (prisma) => {
            const usuarios = await prisma.usuario.findMany({
                include: {
                    programa: {
                        select: { nombre: true }
                    },
                    // Removido entidad_externa ya que no existe en el esquema Prisma
                    vinculaciones: {
                        include: {
                            programa: {
                                select: { nombre: true }
                            }
                        }
                    }
                },
                orderBy: {
                    creado_en: 'desc'
                }
            });
            return transformDecimalsToNumbers(usuarios);
        }, 'Error al obtener usuarios');
    } catch (error) {
        console.error('Error en getUsuarios:', error);
        throw error;
    }
}

/**
 * Obtener todos los usuarios con TODA su información para exportación full
 */
export async function getUsuariosFullExport() {
    await checkAdmin();

    try {
        return await db.execute(async (prisma) => {
            const usuarios = await prisma.usuario.findMany({
                include: {
                    programa: true,
                    perfil_estudiante: true,
                },
                orderBy: {
                    creado_en: 'desc'
                }
            });
            
            return transformDecimalsToNumbers(usuarios);
        }, 'Error al obtener usuarios para exportación');
    } catch (error) {
        console.error('Error en getUsuariosFullExport:', error);
        throw error;
    }
}

/**
 * Toggle para bloquear/desbloquear un usuario
 */
export async function toggleBloqueoUsuario(id: string, estaBloqueado: boolean) {
    await checkAdmin();

    try {
        return await db.transaction(async (prisma) => {
            const usuario = await prisma.usuario.update({
                where: { id },
                data: { esta_bloqueado: estaBloqueado },
            });

            // Generar Log de Actividad
            const session = await getServerSession(authOptions);
            await prisma.logActividad.create({
                data: {
                    id_usuario: session?.user?.id || undefined,
                    accion: estaBloqueado ? 'BLOQUEAR_USUARIO' : 'DESBLOQUEAR_USUARIO',
                    entidad: 'Usuario',
                    id_entidad: id,
                    descripcion: `El administrador ha ${estaBloqueado ? 'bloqueado' : 'desbloqueado'} al usuario ${usuario.correo}`,
                    resultado: 'EXITOSO',
                }
            });

            revalidatePath('/administrador/usuarios');
            revalidatePath(`/administrador/usuarios/${id}`);
            return usuario;
        }, 'Error al actualizar estado de usuario');
    } catch (error) {
        console.error('Error en toggleBloqueoUsuario:', error);
        throw error;
    }
}

/**
 * Obtener un usuario por su ID
 */
export async function getUsuarioById(id: string) {
    await checkAdmin();
    try {
        return await db.execute(async (prisma) => {
            const usuario = await prisma.usuario.findUnique({
                where: { id },
                include: {
                    programa: {
                        select: {
                            id: true,
                            nombre: true,
                        },
                    },
                    perfil_estudiante: true,
                    postulaciones_enviadas: {
                        include: {
                            convocatoria: {
                                select: {
                                    id: true,
                                    titulo: true,
                                    estado: true,
                                    fecha_inicio: true,
                                }
                            }
                        },
                        orderBy: {
                            postulado_en: 'desc'
                        }
                    },
                    reportes_como_estudiante: {
                        include: {
                            actividad: {
                                select: {
                                    id: true,
                                    nombre: true,
                                    horas_estimadas: true,
                                }
                            }
                        },
                        orderBy: {
                            reportado_en: 'desc'
                        },
                        take: 20 // Limit to last 20 reports for performance
                    },
                    certificados_obtenidos: {
                        orderBy: {
                            emitido_en: 'desc'
                        }
                    }
                },
            });
            
            // Transformar Decimals a números antes de retornar
            return transformDecimalsToNumbers(usuario);
        }, 'Error al obtener usuario');
    } catch (error) {
        console.error('Error en getUsuarioById:', error);
        throw error;
    }
}

/**
 * Cambiar el estado de un usuario (ACTIVO, BLOQUEADO, DESACTIVADO)
 */
export async function cambiarEstadoUsuario(id: string, estado: EstadoUsuario, motivo?: string) {
    const session = await checkAdmin();

    try {
        return await db.transaction(async (prisma) => {
            const usuario = await prisma.usuario.update({
                where: { id },
                data: { 
                    estado: estado,
                    motivo_bloqueo: motivo || null,
                    esta_bloqueado: estado === EstadoUsuario.BLOQUEADO || estado === EstadoUsuario.DESACTIVADO,
                },
            });

            // Generar Log de Actividad
            await prisma.logActividad.create({
                data: {
                    id_usuario: session?.user?.id || undefined,
                    accion: 'CAMBIAR_ESTADO_USUARIO',
                    entidad: 'Usuario',
                    id_entidad: id,
                    descripcion: `El administrador ha cambiado el estado de ${usuario.correo} a ${estado}${motivo ? ` - Motivo: ${motivo}` : ''}`,
                    resultado: 'EXITOSO',
                }
            });

            revalidatePath('/administrador/usuarios');
            revalidatePath(`/administrador/usuarios/${id}`);
            return usuario;
        }, 'Error al cambiar estado del usuario');
    } catch (error) {
        console.error('Error en cambiarEstadoUsuario:', error);
        throw error;
    }
}
export async function updateUsuario(id: string, data: any) {
    const session = await checkAdmin();

    try {
        return await db.transaction(async (prisma) => {
            const usuarioAnterior = await prisma.usuario.findUnique({ where: { id } });
            if (!usuarioAnterior) throw new Error('Usuario no encontrado');

            const usuario = await prisma.usuario.update({
                where: { id },
                data: {
                    primer_nombre: data.primer_nombre,
                    segundo_nombre: data.segundo_nombre || null,
                    primer_apellido: data.primer_apellido,
                    segundo_apellido: data.segundo_apellido || null,
                    correo: data.correo,
                    telefono: data.telefono || null,
                    rol: data.rol,
                    id_programa: data.id_programa || null,
                    tipo_documento: data.tipo_documento,
                    numero_documento: data.numero_documento,
                },
                include: { programa: true }
            });

            if (usuarioAnterior.rol !== data.rol && data.rol === 'ESTUDIANTE') {
                const perfil = await prisma.perfilEstudiante.findUnique({ where: { id_usuario: id } });
                if (!perfil) {
                    await prisma.perfilEstudiante.create({ data: { id_usuario: id } });
                }
            }

            await prisma.logActividad.create({
                data: {
                    id_usuario: session?.user?.id || undefined,
                    accion: 'ACTUALIZAR_USUARIO',
                    entidad: 'Usuario',
                    id_entidad: id,
                    descripcion: `Actualización de datos del usuario ${usuario.correo}`,
                    resultado: 'EXITOSO',
                }
            });

            revalidatePath('/administrador/usuarios');
            revalidatePath(`/administrador/usuarios/${id}`);
            return usuario;
        }, 'Error al actualizar usuario');
    } catch (error) {
        console.error('Error en updateUsuario:', error);
        throw error;
    }
}

/**
 * Eliminar un usuario (solo administrador)
 */
export async function eliminarUsuario(id: string, motivo?: string) {
    const session = await checkAdmin();

    try {
        return await db.transaction(async (prisma) => {
            const usuario = await prisma.usuario.findUnique({ where: { id } });
            if (!usuario) throw new Error('Usuario no encontrado');

            // Evitar que el administrador se elimine a sí mismo
            if (id === session?.user?.id) {
                throw new Error('No puedes eliminar tu propia cuenta');
            }

            // Eliminar el usuario (Prisma manejará las relaciones con onDelete: Cascade)
            await prisma.usuario.delete({ where: { id } });

            // Generar Log de Actividad
            await prisma.logActividad.create({
                data: {
                    id_usuario: session?.user?.id || undefined,
                    accion: 'ELIMINAR_USUARIO',
                    entidad: 'Usuario',
                    id_entidad: id,
                    descripcion: `El administrador ha eliminado al usuario ${usuario.correo}${motivo ? ` - Motivo: ${motivo}` : ''}`,
                    resultado: 'EXITOSO',
                }
            });

            revalidatePath('/administrador/usuarios');
            return { success: true, message: 'Usuario eliminado correctamente' };
        }, 'Error al eliminar usuario');
    } catch (error) {
        console.error('Error en eliminarUsuario:', error);
        throw error;
    }
}
