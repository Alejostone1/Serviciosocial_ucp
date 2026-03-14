'use server';

import { prisma, db } from '@/lib/prisma';
import { Rol } from '@prisma/client';
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
    return session;
}

/**
 * Obtener todos los usuarios con información básica y del programa
 */
export async function getUsuarios() {
    await checkAdmin();

    try {
        return await db.execute(async (prisma) => {
            return await prisma.usuario.findMany({
                select: {
                    id: true,
                    primer_nombre: true,
                    primer_apellido: true,
                    correo: true,
                    rol: true,
                    esta_bloqueado: true,
                    ultimo_acceso: true,
                    numero_documento: true,
                    programa: {
                        select: {
                            nombre: true,
                        }
                    }
                },
                orderBy: {
                    creado_en: 'desc'
                }
            });
        }, 'Error al obtener usuarios');
    } catch (error) {
        console.error('Error en getUsuarios:', error);
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
            return await prisma.usuario.findUnique({
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
        }, 'Error al obtener usuario');
    } catch (error) {
        console.error('Error en getUsuarioById:', error);
        throw error;
    }
}

/**
 * Actualizar datos de un usuario
 */
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

            return usuario;
        }, 'Error al actualizar usuario');
    } catch (error) {
        console.error('Error en updateUsuario:', error);
        throw error;
    }
}
