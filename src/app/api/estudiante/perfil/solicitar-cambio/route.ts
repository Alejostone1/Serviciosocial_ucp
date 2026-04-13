import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar si ya tiene una solicitud pendiente
    const existing = await prisma.solicitudCambioPerfil.findFirst({
      where: {
        id_usuario: (session.user as any).id,
        estado: 'PENDIENTE',
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Ya tienes una solicitud bajo revisión' },
        { status: 400 }
      );
    }

    const { 
      // Usuario
      primer_nombre, 
      segundo_nombre, 
      primer_apellido, 
      segundo_apellido, 
      correo_personal,
      telefono,
      foto_url,
      // PerfilEstudiante
      semestre_actual,
      codigo_estudiantil,
      url_hoja_de_vida,
      habilidades,
      intereses,
      disponibilidad,
      modalidad_preferida,
      horas_previas
    } = await req.json();

    // Crear la solicitud y notificaciones en una transacción
    const result = await prisma.$transaction(async (tx) => {
      const sol = await tx.solicitudCambioPerfil.create({
        data: {
          id_usuario: (session.user as any).id,
          datos_nuevos: {
            // Usuario
            primer_nombre,
            segundo_nombre,
            primer_apellido,
            segundo_apellido,
            correo_personal,
            telefono,
            foto_url,
            // PerfilEstudiante
            semestre_actual,
            codigo_estudiantil,
            url_hoja_de_vida,
            habilidades,
            intereses,
            disponibilidad,
            modalidad_preferida,
            horas_previas
          },
          estado: 'PENDIENTE'
        }
      });

      // Notificar a administradores
      const admins = await tx.usuario.findMany({
        where: { rol: 'ADMINISTRADOR' },
        select: { id: true }
      });

      if (admins.length > 0) {
        await tx.notificacion.createMany({
          data: admins.map(admin => ({
            id_usuario: admin.id,
            tipo: 'SISTEMA',
            titulo: 'Nueva Solicitud de Cambio de Perfil',
            mensaje: `El estudiante ${session.user.name} ha solicitado actualizar sus datos institucionales.`,
            url_accion: '/administrador/solicitudes-perfil',
            leida: false,
          }))
        });
      }

      // Registrar en auditoría
      await tx.logActividad.create({
        data: {
          accion: 'SOLICITUD_CAMBIO_PERFIL',
          entidad: 'USUARIO',
          id_entidad: (session.user as any).id,
          id_usuario: (session.user as any).id,
          descripcion: 'El estudiante envió una solicitud de actualización integral de sus datos personales.',
          resultado: 'EXITOSO'
        }
      });

      return sol;
    });

    return NextResponse.json({ 
      message: 'Solicitud enviada correctamente',
      solicitud: result 
    });

  } catch (error) {
    console.error('[SOLICITAR_CAMBIO] Error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
