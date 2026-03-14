'use server';

import { prisma } from '@/lib/prisma';
import { Rol, TipoDocumento } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { transformDecimalsToNumbers } from '@/lib/decimal-utils';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

async function checkAdmin() {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMINISTRADOR') throw new Error('No autorizado');
    return session;
}

export async function crearUsuario(data: {
    primer_nombre: string;
    segundo_nombre?: string;
    primer_apellido: string;
    segundo_apellido?: string;
    correo: string;
    numero_documento: string;
    tipo_documento: TipoDocumento;
    rol: Rol;
    id_programa?: string;
    telefono?: string;
    contrasena: string;
}) {
    const session = await checkAdmin();
    const hash = await bcrypt.hash(data.contrasena, 10);

    const usuario = await prisma.usuario.create({
        data: {
            primer_nombre: data.primer_nombre,
            segundo_nombre: data.segundo_nombre || undefined,
            primer_apellido: data.primer_apellido,
            segundo_apellido: data.segundo_apellido || undefined,
            correo: data.correo,
            numero_documento: data.numero_documento,
            tipo_documento: data.tipo_documento,
            rol: data.rol,
            id_programa: data.id_programa || null,
            telefono: data.telefono || undefined,
            contrasena_hash: hash,
            requiere_cambio_clave: true,
        },
    });

    // Si es ESTUDIANTE, crear su perfil automáticamente
    if (data.rol === Rol.ESTUDIANTE) {
        await prisma.perfilEstudiante.create({
            data: { id_usuario: usuario.id },
        });
    }

    await prisma.logActividad.create({
        data: {
            id_usuario: session.user.id,
            accion: 'CREAR_USUARIO',
            entidad: 'Usuario',
            id_entidad: usuario.id,
            descripcion: `Usuario ${usuario.correo} creado con rol ${usuario.rol}`,
            resultado: 'EXITOSO',
        },
    });

    revalidatePath('/administrador/usuarios');
    return usuario;
}

/** Obtener programas activos para el select */
export async function getProgramasActivos() {
    await checkAdmin();
    const programas = await prisma.programa.findMany({
        where: { esta_activo: true },
        select: { id: true, nombre: true, nivel_formacion: true },
        orderBy: { nombre: 'asc' },
    });
    return transformDecimalsToNumbers(programas);
}
