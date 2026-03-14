import { PrismaClient } from '@prisma/client';
import { TipoNotificacion } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedNotificaciones() {
  console.log('🌱 Iniciando seed de plantillas de notificación...');

  try {
    // Plantillas de notificación predefinidas
    const plantillas = [
      {
        nombre: 'Bienvenida Estudiante',
        tipo: 'SISTEMA' as TipoNotificacion,
        asunto_correo: '¡Bienvenido al Sistema de Servicio Social UCP!',
        mensaje_plantilla: `Hola {{nombre}},

¡Te damos la más cordial bienvenida al Sistema de Servicio Social de la Universidad Católica de Pereira!

Tu cuenta ha sido creada exitosamente y ya puedes comenzar a explorar las convocatorias disponibles para completar tus horas de servicio social.

📚 Programa: {{programa}}
🎓 Semestre: {{semestre}}
📧 Correo: {{correo}}

Próximos pasos:
1. Completa tu perfil de estudiante
2. Explora las convocatorias disponibles
3. Postula a las que más te interesen
4. Reporta tus horas de servicio

Si tienes alguna pregunta, no dudes en contactarnos.

¡Bienvenido a la comunidad UCP!

Atentamente,
Equipo de Servicio Social
Universidad Católica de Pereira`,
        mensaje_whatsapp: `¡Hola {{nombre}}! 🎉 Bienvenido al Sistema de Servicio Social UCP. Tu cuenta está lista. Explora las convocatorias disponibles y completa tus horas.`,
        variables: ['nombre', 'programa', 'semestre', 'correo'],
      },
      {
        nombre: 'Nueva Convocatoria',
        tipo: 'CONVOCATORIA_PUBLICADA' as TipoNotificacion,
        asunto_correo: 'Nueva Convocatoria Disponible: {{titulo}}',
        mensaje_plantilla: `Hola {{nombre},

Tenemos una nueva convocatoria que podría interesarte:

📋 {{titulo}}
🏢 {{modalidad}}
📅 Inicio: {{fecha_inicio}}
📍 {{lugar}}
⏰ Cierre de postulaciones: {{fecha_cierre}}

{{descripcion}}

Horas ofrecidas: {{horas_ofrecidas}}

¡No te quedes sin postular! Las cupas son limitadas.

Ver convocatoria completa: {{url_convocatoria}}

Atentamente,
Sistema de Servicio Social UCP`,
        mensaje_whatsapp: `Nueva convocatoria: {{titulo}}. {{modalidad}} - Inicio: {{fecha_inicio}}. ¡Postula ya!`,
        variables: ['nombre', 'titulo', 'modalidad', 'fecha_inicio', 'lugar', 'fecha_cierre', 'descripcion', 'horas_ofrecidas', 'url_convocatoria'],
      },
      {
        nombre: 'Postulación Aceptada',
        tipo: 'POSTULACION_ACEPTADA' as TipoNotificacion,
        asunto_correo: '¡Felicidades! Tu postulación ha sido aceptada',
        mensaje_plantilla: `¡Hola {{nombre}}! 🎉

Tenemos excelentes noticias: Tu postulación a la convocatoria "{{convocatoria}}" ha sido **ACEPTADA**.

📋 Convocatoria: {{convocatoria}}
🏢 Modalidad: {{modalidad}}
📅 Próxima actividad: {{fecha_actividad}}
📍 Lugar: {{lugar}}

Próximos pasos:
1. Asiste a la actividad programada
2. Reporta tus horas de servicio
3. Completa el requisito de {{horas_requeridas}} horas

¡Felicitaciones por esta oportunidad de servicio!

Para más detalles, contacta al aliado: {{correo_aliado}}

Atentamente,
Sistema de Servicio Social UCP`,
        mensaje_whatsapp: `¡Felicidades {{nombre}}! 🎉 Tu postulación a "{{convocatoria}}" fue ACEPTADA. Revisa tu correo para los detalles.`,
        variables: ['nombre', 'convocatoria', 'modalidad', 'fecha_actividad', 'lugar', 'horas_requeridas', 'correo_aliado'],
      },
      {
        nombre: 'Reporte de Horas Aprobado',
        tipo: 'REPORTE_APROBADO' as TipoNotificacion,
        asunto_correo: 'Tu reporte de horas ha sido aprobado',
        mensaje_plantilla: `Hola {{nombre},

Buenas noticias: Tu reporte de horas ha sido **APROBADO**.

📊 Detalles del reporte:
⏰ Horas reportadas: {{horas_reportadas}}
✅ Horas aprobadas: {{horas_aprobadas}}
📋 Actividad: {{actividad}}
📅 Fecha del reporte: {{fecha_reporte}}

📈 Tu progreso total:
• Horas acumuladas: {{horas_acumuladas}}
• Porcentaje completado: {{porcentaje_avance}}%
• Meta: {{horas_requeridas}} horas

¡Sigue así! Estás cada vez más cerca de completar tu requisito de servicio social.

Sigue reportando tus actividades para acumular más horas.

Atentamente,
Sistema de Servicio Social UCP`,
        mensaje_whatsapp: `¡Hola {{nombre}}! ✅ Tu reporte de {{horas_aprobadas}} horas fue APROBADO. Llevas {{horas_acumuladas}} horas acumuladas ({{porcentaje_avance}}%).`,
        variables: ['nombre', 'horas_reportadas', 'horas_aprobadas', 'actividad', 'fecha_reporte', 'horas_acumuladas', 'porcentaje_avance', 'horas_requeridas'],
      },
      {
        nombre: 'Certificado Emitido',
        tipo: 'CERTIFICADO_EMITIDO' as TipoNotificacion,
        asunto_correo: '¡Felicidades! Tu certificado de servicio social ha sido emitido',
        mensaje_plantilla: `¡Hola {{nombre}}! 🏆

¡FELICITACIONES! Has completado exitosamente tu requisito de servicio social y tu certificado ha sido emitido.

📜 Detalles del certificado:
📋 Total de horas: {{total_horas}}
📅 Período: {{periodo_desde}} a {{periodo_hasta}}
🔢 Código de verificación: {{codigo_verificacion}}
📄 Descargar certificado: {{url_certificado}}

Este certificado acredita que has completado {{total_horas}} horas de servicio social, cumpliendo con el requisito establecido por la Universidad Católica de Pereira.

🎉 ¡Todo un logro! Tu dedicación y compromiso con la comunidad han sido excepcionales.

El certificado quedará disponible permanentemente en tu perfil del sistema para que puedas consultarlo cuando lo necesites.

¡Felicidades por esta gran meta alcanzada!

Atentamente,
Sistema de Servicio Social
Universidad Católica de Pereira`,
        mensaje_whatsapp: `¡FELICITACIONES {{nombre}}! 🏆 Has completado tu servicio social. Tu certificado por {{total_horas}} horas está emitido. ¡Todo un logro!`,
        variables: ['nombre', 'total_horas', 'periodo_desde', 'periodo_hasta', 'codigo_verificacion', 'url_certificado'],
      },
      {
        nombre: 'Recordatorio de Reporte',
        tipo: 'SISTEMA' as TipoNotificacion,
        asunto_correo: 'Recordatorio: Reporta tus horas de servicio social',
        mensaje_plantilla: `Hola {{nombre},

Te recordamos que es importante mantener actualizado tu reporte de horas de servicio social.

📊 Tu estado actual:
• Horas acumuladas: {{horas_acumuladas}}
• Porcentaje completado: {{porcentaje_avance}}%
• Meta: {{horas_requeridas}} horas
• Horas pendientes: {{horas_pendientes}}

📅 Próximo plazo de reporte: {{fecha_limite}}

¿Por qué es importante reportar tus horas?
✅ Cumplimiento de requisitos académicos
📈 Seguimiento de tu progreso
🏆 Acceso a certificaciones
📋 Historial oficial de tu servicio

No esperes al último momento. Reporta tus horas regularmente para mantener tu perfil actualizado.

Si tienes actividades de servicio que aún no has reportado, este es el momento perfecto para hacerlo.

Ingresa al sistema y reporta tus horas ahora.

Atentamente,
Sistema de Servicio Social UCP`,
        mensaje_whatsapp: `Hola {{nombre}}. Recuerda reportar tus horas de servicio. Llevas {{horas_acumuladas}} de {{horas_requeridas}} horas ({{porcentaje_avance}}%).`,
        variables: ['nombre', 'horas_acumuladas', 'porcentaje_avance', 'horas_requeridas', 'horas_pendientes', 'fecha_limite'],
      },
    ];

    // Insertar plantillas
    for (const plantilla of plantillas) {
      await prisma.plantillaNotificacion.upsert({
        where: { nombre: plantilla.nombre },
        update: plantilla,
        create: {
          ...plantilla,
          creado_por: (await prisma.usuario.findFirst({ 
            where: { rol: 'ADMINISTRADOR' } 
          }))?.id || 'admin-placeholder',
        },
      });
    }

    console.log(`✅ ${plantillas.length} plantillas de notificación creadas/actualizadas`);
  } catch (error) {
    console.error('❌ Error en seed de notificaciones:', error);
    throw error;
  }
}

// Ejecutar solo si se llama directamente
if (require.main === module) {
  seedNotificaciones()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
