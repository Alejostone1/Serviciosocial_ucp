import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Datos incompletos' },
        { status: 400 }
      );
    }

    // Buscar el usuario en la base de datos
    const user = await prisma.usuario.findUnique({
      where: { id: session.user.id },
    });

    if (!user || !user.contrasena_hash) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Verificar contraseña actual
    const isPaswordCorrect = await bcrypt.compare(currentPassword, user.contrasena_hash);
    
    if (!isPaswordCorrect) {
      return NextResponse.json(
        { error: 'La contraseña actual es incorrecta' },
        { status: 401 }
      );
    }

    // Encriptar la nueva contraseña
    const salt = await bcrypt.genSalt(12);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    // Actualizar en la base de datos
    await prisma.usuario.update({
      where: { id: session.user.id },
      data: { 
        contrasena_hash: newPasswordHash,
        requiere_cambio_clave: false,
        actualizado_en: new Date()
      },
    });

    // Registrar en el log de actividad
    await prisma.logActividad.create({
      data: {
        accion: 'CAMBIO_CONTRASENA',
        entidad: 'USUARIO',
        id_entidad: session.user.id,
        id_usuario: session.user.id,
        descripcion: 'El usuario cambió su contraseña institucional exitosamente',
        resultado: 'EXITOSO'
      }
    });

    return NextResponse.json({ message: 'Contraseña actualizada correctamente' });

  } catch (error) {
    console.error('[CAMBIO_PASS] Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
