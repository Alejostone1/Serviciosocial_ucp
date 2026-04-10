import { db } from './prisma';
import { TipoNotificacion } from '@prisma/client';

export async function createAdminNotifications(
  tipo: TipoNotificacion,
  titulo: string,
  mensaje: string,
  url_accion?: string
) {
  try {
    // Obtener todos los administradores activos
    const administradores = await db.execute(async (prisma) => {
      return await prisma.usuario.findMany({
        where: {
          rol: 'ADMINISTRADOR',
          estado: 'ACTIVO'
        },
        select: { id: true }
      });
    }, 'Error obteniendo administradores');

    if (administradores.length === 0) {
      console.warn('No se encontraron administradores para notificar');
      return [];
    }

    // Crear notificación para cada admin
    const notificacionesData = administradores.map(admin => ({
      id_usuario: admin.id,
      tipo,
      titulo,
      mensaje,
      url_accion: url_accion || `/administrador/convocatorias`,
      leida: false
    }));

    const notificaciones = await db.execute(async (prisma) => {
      return await prisma.notificacion.createMany({
        data: notificacionesData
      });
    }, 'Error creando notificaciones admin');

    console.log(`✅ Creadas ${notificacionesData.length} notificaciones para admins`);
    return notificacionesData;
  } catch (error) {
    console.error('Error en createAdminNotifications:', error);
    throw error;
  }
}

export async function createNotificationToUser(
  id_usuario: string,
  tipo: TipoNotificacion,
  titulo: string,
  mensaje: string,
  url_accion?: string
) {
  try {
    const notificacion = await db.execute(async (prisma) => {
      return await prisma.notificacion.create({
        data: {
          id_usuario,
          tipo,
          titulo,
          mensaje,
          url_accion: url_accion || '',
          leida: false
        }
      });
    }, 'Error creando notificación usuario');

    console.log(`✅ Notificación creada para usuario ${id_usuario}`);
    return notificacion;
  } catch (error) {
    console.error('Error en createNotificationToUser:', error);
    throw error;
  }
}

