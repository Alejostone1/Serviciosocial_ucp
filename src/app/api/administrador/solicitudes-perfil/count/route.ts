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

    const count = await prisma.solicitudCambioPerfil.count({
      where: {
        estado: 'PENDIENTE',
      },
    });

    return NextResponse.json({ count });

  } catch (error) {
    console.error('[SOLICITUDES_COUNT] Error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}