'use server';

import { prisma, db } from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/mail';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

/**
 * Solicitar recuperación de contraseña
 * Genera un token y envía correo con el enlace
 */
export async function solicitarRecuperacionContrasena(correo: string) {
    try {
        // Buscar usuario por correo
        const usuario = await prisma.usuario.findUnique({
            where: { correo },
            select: {
                id: true,
                correo: true,
                primer_nombre: true,
                primer_apellido: true,
            },
        });

        // Si no existe el usuario, no revelar información por seguridad
        if (!usuario) {
            return {
                success: true,
                message: 'Si el correo existe en nuestra base de datos, recibirás instrucciones para recuperar tu contraseña.',
            };
        }

        // Generar token seguro
        const token = crypto.randomBytes(32).toString('hex');
        const expiraEn = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

        // Guardar token en la base de datos
        await prisma.tokenRecuperacion.create({
            data: {
                id_usuario: usuario.id,
                token,
                expira_en: expiraEn,
                tipo: 'RECUPERACION',
            },
        });

        // Generar URL de recuperación
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const resetUrl = `${baseUrl}/restablecer-contrasena?token=${token}`;

        // Enviar correo
        const nombre = `${usuario.primer_nombre} ${usuario.primer_apellido}`;
        await sendPasswordResetEmail(usuario.correo, resetUrl, nombre);

        return {
            success: true,
            message: 'Si el correo existe en nuestra base de datos, recibirás instrucciones para recuperar tu contraseña.',
        };
    } catch (error) {
        console.error('Error en solicitarRecuperacionContrasena:', error);
        throw new Error('Error al procesar la solicitud de recuperación');
    }
}

/**
 * Validar token de recuperación
 */
export async function validarTokenRecuperacion(token: string) {
    try {
        const tokenRecuperacion = await prisma.tokenRecuperacion.findUnique({
            where: { token },
            include: {
                usuario: {
                    select: {
                        id: true,
                        correo: true,
                        primer_nombre: true,
                        primer_apellido: true,
                    },
                },
            },
        });

        if (!tokenRecuperacion) {
            return { valid: false, message: 'Token inválido' };
        }

        // Verificar si el token ya fue usado
        if (tokenRecuperacion.usado_en) {
            return { valid: false, message: 'Este enlace ya fue utilizado' };
        }

        // Verificar si el token expiró
        if (new Date() > tokenRecuperacion.expira_en) {
            return { valid: false, message: 'Este enlace ha expirado' };
        }

        return {
            valid: true,
            userId: tokenRecuperacion.id_usuario,
            email: tokenRecuperacion.usuario.correo,
            nombre: `${tokenRecuperacion.usuario.primer_nombre} ${tokenRecuperacion.usuario.primer_apellido}`,
        };
    } catch (error) {
        console.error('Error en validarTokenRecuperacion:', error);
        return { valid: false, message: 'Error al validar el token' };
    }
}

/**
 * Restablecer contraseña
 */
export async function restablecerContrasena(token: string, nuevaContrasena: string) {
    try {
        // Validar token primero
        const tokenRecuperacion = await prisma.tokenRecuperacion.findUnique({
            where: { token },
            include: {
                usuario: true,
            },
        });

        if (!tokenRecuperacion) {
            return { success: false, message: 'Token inválido' };
        }

        if (tokenRecuperacion.usado_en) {
            return { success: false, message: 'Este enlace ya fue utilizado' };
        }

        if (new Date() > tokenRecuperacion.expira_en) {
            return { success: false, message: 'Este enlace ha expirado' };
        }

        // Validar requisitos de contraseña
        if (nuevaContrasena.length < 8) {
            return {
                success: false,
                message: 'La contraseña debe tener al menos 8 caracteres',
            };
        }

        // Encriptar nueva contraseña
        const hashedPassword = await bcrypt.hash(nuevaContrasena, 10);

        // Actualizar contraseña del usuario
        await db.transaction(async (prisma) => {
            await prisma.usuario.update({
                where: { id: tokenRecuperacion.id_usuario },
                data: {
                    contrasena_hash: hashedPassword,
                    requiere_cambio_clave: false,
                },
            });

            // Marcar token como usado
            await prisma.tokenRecuperacion.update({
                where: { id: tokenRecuperacion.id },
                data: { usado_en: new Date() },
            });

            // Registrar en log de actividad
            await prisma.logActividad.create({
                data: {
                    id_usuario: tokenRecuperacion.id_usuario,
                    accion: 'RESTABLECER_CONTRASENA',
                    entidad: 'Usuario',
                    id_entidad: tokenRecuperacion.id_usuario,
                    descripcion: `El usuario ${tokenRecuperacion.usuario.correo} restableció su contraseña mediante recuperación`,
                    resultado: 'EXITOSO',
                },
            });
        });

        return {
            success: true,
            message: 'Contraseña restablecida exitosamente',
        };
    } catch (error) {
        console.error('Error en restablecerContrasena:', error);
        return {
            success: false,
            message: 'Error al restablecer la contraseña',
        };
    }
}
