'use server';

import { db } from '@/lib/prisma';
import { transformDecimalsToNumbers } from '@/lib/decimal-utils';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';

interface RegisterFormData {
    primer_nombre: string;
    segundo_nombre?: string;
    primer_apellido: string;
    segundo_apellido?: string;
    numero_documento: string;
    correo: string;
    telefono: string;
    contrasena: string;
    programa: string;
    codigo_estudiantil: string;
}

export async function registerStudent(formData: RegisterFormData) {
    try {
        // Verificar si el correo ya existe
        const existingUser = await db.execute(async (prisma) => {
            return await prisma.usuario.findUnique({
                where: { correo: formData.correo }
            });
        }, 'Error al verificar correo existente');

        if (existingUser) {
            return { success: false, error: 'El correo ya está registrado' };
        }

        // Verificar si el documento ya existe
        const existingDocument = await db.execute(async (prisma) => {
            return await prisma.usuario.findUnique({
                where: { numero_documento: formData.numero_documento }
            });
        }, 'Error al verificar documento existente');

        if (existingDocument) {
            return { success: false, error: 'El número de documento ya está registrado' };
        }

        // Verificar si el código estudiantil ya existe
        const existingCode = await db.execute(async (prisma) => {
            return await prisma.perfilEstudiante.findUnique({
                where: { codigo_estudiantil: formData.codigo_estudiantil }
            });
        }, 'Error al verificar código estudiantil existente');

        if (existingCode) {
            return { success: false, error: 'El código estudiantil ya está registrado' };
        }

        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(formData.contrasena, 12);

        // Crear el usuario
        const newUser = await db.execute(async (prisma) => {
            return await prisma.usuario.create({
                data: {
                    primer_nombre: formData.primer_nombre,
                    segundo_nombre: formData.segundo_nombre || null,
                    primer_apellido: formData.primer_apellido,
                    segundo_apellido: formData.segundo_apellido || null,
                    numero_documento: formData.numero_documento,
                    correo: formData.correo,
                    telefono: formData.telefono,
                    contrasena_hash: hashedPassword,
                    rol: 'ESTUDIANTE',
                    esta_bloqueado: false,
                    id_programa: formData.programa,
                    creado_en: new Date(),
                    actualizado_en: new Date()
                }
            });
        }, 'Error al crear usuario');

        // Crear el perfil del estudiante
        await db.execute(async (prisma) => {
            return await prisma.perfilEstudiante.create({
                data: {
                    id_usuario: newUser.id,
                    codigo_estudiantil: formData.codigo_estudiantil,
                    horas_acumuladas: 0,
                    horas_previas: 0,
                    porcentaje_avance: 0,
                    semestre_actual: null,
                    habilidades: [],
                    intereses: [],
                    disponibilidad: {},
                    modalidad_preferida: null,
                    creado_en: new Date(),
                    actualizado_en: new Date()
                }
            });
        }, 'Error al crear perfil de estudiante');

        // Crear log de actividad
        await db.execute(async (prisma) => {
            return await prisma.logActividad.create({
                data: {
                    id_usuario: newUser.id,
                    accion: 'REGISTRO',
                    entidad: 'USUARIO',
                    id_entidad: newUser.id,
                    descripcion: `Estudiante ${formData.primer_nombre} ${formData.primer_apellido} se registró en el sistema`,
                    datos_anteriores: {},
                    datos_nuevos: {
                        correo: formData.correo,
                        programa: formData.programa,
                        codigo_estudiantil: formData.codigo_estudiantil
                    },
                    ip_origen: '127.0.0.1', // Debería obtenerse del request
                    resultado: 'EXITOSO',
                    creado_en: new Date()
                }
            });
        }, 'Error al crear log de actividad');

        revalidatePath('/login');
        
        return { 
            success: true, 
            message: 'Cuenta creada exitosamente. Redirigiendo al login...',
            userId: newUser.id
        };

    } catch (error) {
        console.error('Error en registro:', error);
        return { 
            success: false, 
            error: 'Error al crear la cuenta. Por favor, intenta nuevamente.' 
        };
    }
}

export async function getProgramas() {
    try {
        const programas = await db.execute(async (prisma) => {
            return await prisma.programa.findMany({
                where: { esta_activo: true },
                include: {
                    facultad: {
                        select: {
                            nombre: true
                        }
                    }
                },
                orderBy: { nombre: 'asc' }
            });
        }, 'Error al obtener programas');

        const transformedProgramas = transformDecimalsToNumbers(programas);

        return transformedProgramas.map((programa: any) => ({
            id: programa.id,
            nombre: programa.nombre,
            codigo: programa.codigo,
            facultad: programa.facultad?.nombre || 'Sin facultad',
            horas_requeridas: programa.horas_requeridas
        }));

    } catch (error) {
        console.error('Error al obtener programas:', error);
        return [];
    }
}
