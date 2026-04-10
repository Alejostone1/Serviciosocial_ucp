export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Buscar cualquier solicitud activa (PENDIENTE) del estudiante
    const solicitud = await prisma.solicitudCambioPerfil.findFirst({
      where: {
        id_usuario: session.user.id,
        estado: 'PENDIENTE',
      },
      orderBy: { creado_en: 'desc' },
    });

    return NextResponse.json({ solicitud });

  } catch (error) {
    console.error('[SOLICITUDES_PENDIENTES] Error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}