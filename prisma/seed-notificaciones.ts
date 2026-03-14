import { PrismaClient, TipoNotificacion } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedNotificaciones() {
  console.log('\n🔔 Iniciando seed de plantillas de notificación...');

  // El admin DEBE existir antes de correr este seed (lo crea el seed principal)
  const admin = await prisma.usuario.findFirst({ where: { rol: 'ADMINISTRADOR' } });
  if (!admin) {
    throw new Error(
      '❌ No se encontró un usuario ADMINISTRADOR. Ejecuta el seed principal primero.',
    );
  }

  /**
   * CORRECCIONES respecto al archivo original:
   *  1. `{{nombre}` → `{{nombre}}` (llave de cierre faltante, varios mensajes)
   *  2. `{{cupas}}` → `{{cupos}}` (error tipográfico en mensaje Nueva Convocatoria)
   *  3. creado_por se resolvía dentro del loop con una query extra por cada plantilla;
   *     ahora se resuelve una sola vez antes del loop.
   *  4. El fallback `'admin-placeholder'` era un string inválido como UUID,
   *     causaría error de FK en Postgres; reemplazado por el throw arriba.
   *  5. variables declarada como string[] coincide con el campo Json? del schema;
   *     se mantiene el array y Prisma lo serializa correctamente.
   */
  const plantillas: Array<{
    nombre: string;
    tipo: TipoNotificacion;
    asunto_correo: string;
    mensaje_plantilla: string;
    mensaje_whatsapp: string;
    variables: string[];
    esta_activa: boolean;
  }> = [
    // ─────────────────────────────────────────────
    // 1. Bienvenida al sistema
    // ─────────────────────────────────────────────
    {
      nombre: 'Bienvenida Estudiante',
      tipo: TipoNotificacion.SISTEMA,
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
      esta_activa: true,
    },

    // ─────────────────────────────────────────────
    // 2. Nueva convocatoria publicada
    // ─────────────────────────────────────────────
    {
      nombre: 'Nueva Convocatoria',
      tipo: TipoNotificacion.CONVOCATORIA_PUBLICADA,
      asunto_correo: 'Nueva Convocatoria Disponible: {{titulo}}',
      // BUG ORIGINAL: "Hola {{nombre},"  →  faltaba la llave de cierre
      mensaje_plantilla: `Hola {{nombre}},

Tenemos una nueva convocatoria que podría interesarte:

📋 {{titulo}}
🏢 Modalidad: {{modalidad}}
📅 Inicio: {{fecha_inicio}}
📍 Lugar: {{lugar}}
⏰ Cierre de postulaciones: {{fecha_cierre}}

{{descripcion}}

⏱️ Horas ofrecidas: {{horas_ofrecidas}}

¡No te quedes sin postular! Los cupos son limitados.

Ver convocatoria completa: {{url_convocatoria}}

Atentamente,
Sistema de Servicio Social UCP`,
      // BUG ORIGINAL: "cupas" → "cupos"
      mensaje_whatsapp: `Nueva convocatoria: {{titulo}}. {{modalidad}} - Inicio: {{fecha_inicio}}. ¡Los cupos son limitados, postula ya!`,
      variables: [
        'nombre',
        'titulo',
        'modalidad',
        'fecha_inicio',
        'lugar',
        'fecha_cierre',
        'descripcion',
        'horas_ofrecidas',
        'url_convocatoria',
      ],
      esta_activa: true,
    },

    // ─────────────────────────────────────────────
    // 3. Postulación recibida (confirmación)
    // ─────────────────────────────────────────────
    {
      nombre: 'Postulación Recibida',
      tipo: TipoNotificacion.POSTULACION_RECIBIDA,
      asunto_correo: 'Hemos recibido tu postulación: {{convocatoria}}',
      mensaje_plantilla: `Hola {{nombre}},

Hemos recibido tu postulación a la convocatoria "{{convocatoria}}" exitosamente.

📋 Estado actual: EN REVISIÓN
📅 Fecha de postulación: {{fecha_postulacion}}

Estaremos revisando tu solicitud y te notificaremos el resultado a la brevedad posible.

Mientras tanto, puedes hacer seguimiento a tu postulación desde el sistema.

Atentamente,
Sistema de Servicio Social UCP`,
      mensaje_whatsapp: `Hola {{nombre}}, recibimos tu postulación a "{{convocatoria}}". 📋 Pronto tendrás noticias. ¡Mucho ánimo!`,
      variables: ['nombre', 'convocatoria', 'fecha_postulacion'],
      esta_activa: true,
    },

    // ─────────────────────────────────────────────
    // 4. Postulación aceptada
    // ─────────────────────────────────────────────
    {
      nombre: 'Postulación Aceptada',
      tipo: TipoNotificacion.POSTULACION_ACEPTADA,
      asunto_correo: '¡Felicidades! Tu postulación ha sido aceptada',
      mensaje_plantilla: `¡Hola {{nombre}}! 🎉

Tenemos excelentes noticias: Tu postulación a la convocatoria "{{convocatoria}}" ha sido ACEPTADA.

📋 Convocatoria: {{convocatoria}}
🏢 Modalidad: {{modalidad}}
📅 Próxima actividad: {{fecha_actividad}}
📍 Lugar: {{lugar}}

Próximos pasos:
1. Asiste a la actividad programada
2. Reporta tus horas de servicio
3. Completa el requisito de {{horas_requeridas}} horas

Para más detalles, contacta al aliado: {{correo_aliado}}

¡Felicitaciones por esta oportunidad de servicio!

Atentamente,
Sistema de Servicio Social UCP`,
      mensaje_whatsapp: `¡Felicidades {{nombre}}! 🎉 Tu postulación a "{{convocatoria}}" fue ACEPTADA. Revisa tu correo para los detalles.`,
      variables: [
        'nombre',
        'convocatoria',
        'modalidad',
        'fecha_actividad',
        'lugar',
        'horas_requeridas',
        'correo_aliado',
      ],
      esta_activa: true,
    },

    // ─────────────────────────────────────────────
    // 5. Postulación rechazada
    // ─────────────────────────────────────────────
    {
      nombre: 'Postulación Rechazada',
      tipo: TipoNotificacion.POSTULACION_RECHAZADA,
      asunto_correo: 'Actualización sobre tu postulación: {{convocatoria}}',
      mensaje_plantilla: `Hola {{nombre}},

Lamentamos informarte que tu postulación a la convocatoria "{{convocatoria}}" no fue seleccionada en esta ocasión.

📋 Motivo: {{motivo_rechazo}}

No te desanimes. Hay muchas otras convocatorias disponibles en las que puedes participar.

Te invitamos a seguir explorando las oportunidades de servicio social disponibles en el sistema.

Atentamente,
Sistema de Servicio Social UCP`,
      mensaje_whatsapp: `Hola {{nombre}}, tu postulación a "{{convocatoria}}" no fue seleccionada. 💪 ¡Sigue adelante, hay más oportunidades esperándote!`,
      variables: ['nombre', 'convocatoria', 'motivo_rechazo'],
      esta_activa: true,
    },

    // ─────────────────────────────────────────────
    // 6. Reporte de horas enviado (confirmación)
    // ─────────────────────────────────────────────
    {
      nombre: 'Reporte de Horas Enviado',
      tipo: TipoNotificacion.REPORTE_ENVIADO,
      asunto_correo: 'Tu reporte de horas ha sido enviado',
      mensaje_plantilla: `Hola {{nombre}},

Hemos recibido tu reporte de horas correctamente.

📊 Detalles del reporte:
⏰ Horas reportadas: {{horas_reportadas}}
📋 Actividad: {{actividad}}
📅 Fecha: {{fecha_reporte}}
🔄 Estado: EN REVISIÓN

Te notificaremos cuando el reporte sea revisado.

Atentamente,
Sistema de Servicio Social UCP`,
      mensaje_whatsapp: `Hola {{nombre}}, recibimos tu reporte de {{horas_reportadas}} horas para "{{actividad}}". ✅ Pronto será revisado.`,
      variables: ['nombre', 'horas_reportadas', 'actividad', 'fecha_reporte'],
      esta_activa: true,
    },

    // ─────────────────────────────────────────────
    // 7. Reporte de horas aprobado
    // ─────────────────────────────────────────────
    {
      nombre: 'Reporte de Horas Aprobado',
      tipo: TipoNotificacion.REPORTE_APROBADO,
      asunto_correo: 'Tu reporte de horas ha sido aprobado ✅',
      // BUG ORIGINAL: "Hola {{nombre},"  →  faltaba la llave de cierre
      mensaje_plantilla: `Hola {{nombre}},

Buenas noticias: Tu reporte de horas ha sido APROBADO.

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

Atentamente,
Sistema de Servicio Social UCP`,
      mensaje_whatsapp: `¡Hola {{nombre}}! ✅ Tu reporte de {{horas_aprobadas}} horas fue APROBADO. Llevas {{horas_acumuladas}} horas acumuladas ({{porcentaje_avance}}%).`,
      variables: [
        'nombre',
        'horas_reportadas',
        'horas_aprobadas',
        'actividad',
        'fecha_reporte',
        'horas_acumuladas',
        'porcentaje_avance',
        'horas_requeridas',
      ],
      esta_activa: true,
    },

    // ─────────────────────────────────────────────
    // 8. Reporte rechazado / requiere ajuste
    // ─────────────────────────────────────────────
    {
      nombre: 'Reporte de Horas Rechazado',
      tipo: TipoNotificacion.REPORTE_RECHAZADO,
      asunto_correo: 'Tu reporte de horas requiere atención',
      mensaje_plantilla: `Hola {{nombre}},

Tu reporte de horas para la actividad "{{actividad}}" ha sido RECHAZADO.

📋 Motivo: {{motivo_rechazo}}
📝 Notas del revisor: {{notas_revisor}}

Por favor revisa los comentarios y vuelve a enviar el reporte con las correcciones indicadas.

Si tienes dudas, comunícate con el coordinador de servicio social.

Atentamente,
Sistema de Servicio Social UCP`,
      mensaje_whatsapp: `Hola {{nombre}}, tu reporte para "{{actividad}}" fue rechazado. 📋 Motivo: {{motivo_rechazo}}. Por favor corrígelo y vuelve a enviarlo.`,
      variables: ['nombre', 'actividad', 'motivo_rechazo', 'notas_revisor'],
      esta_activa: true,
    },

    // ─────────────────────────────────────────────
    // 9. Certificado emitido
    // ─────────────────────────────────────────────
    {
      nombre: 'Certificado Emitido',
      tipo: TipoNotificacion.CERTIFICADO_EMITIDO,
      asunto_correo: '¡Felicidades! Tu certificado de servicio social ha sido emitido 🏆',
      mensaje_plantilla: `¡Hola {{nombre}}! 🏆

¡FELICITACIONES! Has completado exitosamente tu requisito de servicio social y tu certificado ha sido emitido.

📜 Detalles del certificado:
📋 Total de horas: {{total_horas}}
📅 Período: {{periodo_desde}} a {{periodo_hasta}}
🔢 Código de verificación: {{codigo_verificacion}}
📄 Descargar certificado: {{url_certificado}}

Este certificado acredita que has completado {{total_horas}} horas de servicio social, cumpliendo con el requisito establecido por la Universidad Católica de Pereira.

El certificado quedará disponible permanentemente en tu perfil para que puedas consultarlo cuando lo necesites.

🎉 ¡Tu dedicación y compromiso con la comunidad son un ejemplo a seguir!

Atentamente,
Sistema de Servicio Social
Universidad Católica de Pereira`,
      mensaje_whatsapp: `¡FELICITACIONES {{nombre}}! 🏆 Has completado tu servicio social. Tu certificado por {{total_horas}} horas está listo. ¡Descárgalo desde el sistema!`,
      variables: [
        'nombre',
        'total_horas',
        'periodo_desde',
        'periodo_hasta',
        'codigo_verificacion',
        'url_certificado',
      ],
      esta_activa: true,
    },

    // ─────────────────────────────────────────────
    // 10. Recordatorio de reporte pendiente
    // ─────────────────────────────────────────────
    {
      nombre: 'Recordatorio de Reporte',
      tipo: TipoNotificacion.SISTEMA,
      asunto_correo: 'Recordatorio: Reporta tus horas de servicio social',
      // BUG ORIGINAL: "Hola {{nombre},"  →  faltaba la llave de cierre
      mensaje_plantilla: `Hola {{nombre}},

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

No esperes al último momento. Reporta tus horas regularmente.

Atentamente,
Sistema de Servicio Social UCP`,
      mensaje_whatsapp: `Hola {{nombre}} 👋. Recuerda reportar tus horas de servicio. Llevas {{horas_acumuladas}} de {{horas_requeridas}} horas ({{porcentaje_avance}}%). ¡Vas muy bien!`,
      variables: [
        'nombre',
        'horas_acumuladas',
        'porcentaje_avance',
        'horas_requeridas',
        'horas_pendientes',
        'fecha_limite',
      ],
      esta_activa: true,
    },
  ];

  // Insertar/actualizar plantillas — admin resuelto una sola vez antes del loop
  let creadas = 0;
  let actualizadas = 0;

  for (const plantilla of plantillas) {
    const existente = await prisma.plantillaNotificacion.findUnique({
      where: { nombre: plantilla.nombre },
    });

    if (existente) {
      await prisma.plantillaNotificacion.update({
        where: { nombre: plantilla.nombre },
        data: plantilla,
      });
      actualizadas++;
    } else {
      await prisma.plantillaNotificacion.create({
        data: { ...plantilla, creado_por: admin.id },
      });
      creadas++;
    }

    console.log(`  ${existente ? '⏭️  Actualizada' : '✅ Creada'}  → ${plantilla.nombre}`);
  }

  console.log(
    `\n  📊 Resultado: ${creadas} creadas · ${actualizadas} actualizadas · ${plantillas.length} total`,
  );
}

// Ejecutar directamente con: npx ts-node prisma/seeds/seed.notificaciones.ts
if (require.main === module) {
  seedNotificaciones()
    .catch((e) => {
      console.error('❌ Error en seed de notificaciones:', e);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}