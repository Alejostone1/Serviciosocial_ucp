export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMINISTRADOR') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Obtener solicitudes con datos del usuario
    const solicitudes = await prisma.solicitudCambioPerfil.findMany({
      where: {
        estado: 'PENDIENTE',
      },
      include: {
        usuario: {
          select: {
            id: true,
            primer_nombre: true,
            segundo_nombre: true,
            primer_apellido: true,
            segundo_apellido: true,
            correo: true,
            numero_documento: true,
            tipo_documento: true,
            telefono: true,
          }
        }
      },
      orderBy: { creado_en: 'desc' },
    });

    return NextResponse.json({ solicitudes });

  } catch (error) {
    console.error('[SOLICITUDES_ADMIN] Error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}