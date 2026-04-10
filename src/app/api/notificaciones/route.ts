import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const soloNoLeidas = searchParams.get('solo_no_leidas') === 'true';
    const limite = parseInt(searchParams.get('limite') || '10');

    // Construir filtro
    const where: any = {
      id_usuario: session.user.id
    };

    if (soloNoLeidas) {
      where.leida = false;
    }

    const notificaciones = await prisma.notificacion.findMany({
      where,
      orderBy: { creado_en: 'desc' },
      take: limite,
      select: {
        id: true,
        tipo: true,
        titulo: true,
        mensaje: true,
        url_accion: true,
        leida: true,
        leida_en: true,
        creado_en: true
      }
    });

    // Obtener conteo de no leídas
    const noLeidasCount = await prisma.notificacion.count({
      where: {
        id_usuario: session.user.id,
        leida: false
      }
    });

    return NextResponse.json({
      notificaciones,
      noLeidasCount,
      total: notificaciones.length
    });

  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    return NextResponse.json(
      { error: 'Error al obtener notificaciones' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { ids, marcarComoLeida } = body;

    // Validar que sea un array de IDs
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Se requiere un array de IDs de notificaciones' },
        { status: 400 }
      );
    }

    // Actualizar notificaciones
    const updateData: any = {};
    
    if (marcarComoLeida) {
      updateData.leida = true;
      updateData.leida_en = new Date();
    } else {
      updateData.leida = false;
      updateData.leida_en = null;
    }

    const result = await prisma.notificacion.updateMany({
      where: {
        id: { in: ids },
        id_usuario: session.user.id
      },
      data: updateData
    });

    return NextResponse.json({
      message: `Se actualizaron ${result.count} notificaciones`,
      actualizadas: result.count
    });

  } catch (error) {
    console.error('Error al actualizar notificaciones:', error);
    return NextResponse.json(
      { error: 'Error al actualizar notificaciones' },
      { status: 500 }
    );
  }
}

// Marcar todas como leídas
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const result = await prisma.notificacion.updateMany({
      where: {
        id_usuario: session.user.id,
        leida: false
      },
      data: {
        leida: true,
        leida_en: new Date()
      }
    });

    return NextResponse.json({
      message: `Se marcaron ${result.count} notificaciones como leídas`,
      marcadas: result.count
    });

  } catch (error) {
    console.error('Error al marcar notificaciones como leídas:', error);
    return NextResponse.json(
      { error: 'Error al marcar notificaciones como leídas' },
      { status: 500 }
    );
  }
}
