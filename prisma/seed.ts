import {
  PrismaClient,
  Rol,
  TipoDocumento,
  NivelFormacion,
  Modalidad,
  TipoActividad,
  EstadoConvocatoria,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

type ImagenSeed = {
  url_imagen: string;
  public_id_cloudinary: string;
  orden: number;
};

type NoticiaSeed = {
  titulo: string;
  resumen: string;
  contenido: string;
  autor: string;
  publicada: boolean;
  fecha_publicacion: Date | null;
  imagenes: ImagenSeed[];
};

async function main() {
  console.log('🚀 Iniciando seeding principal UCP...\n');

  // 1) ADMIN
  console.log('👤 Configurando usuario administrador...');
  const adminEmail = 'adminservicio@ucp.edu.co';
  const adminPassword = 'Android.13';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.usuario.upsert({
    where: { correo: adminEmail },
    update: {
      contrasena_hash: hashedPassword,
      rol: Rol.ADMINISTRADOR,
      esta_bloqueado: false,
      requiere_cambio_clave: false,
    },
    create: {
      primer_nombre: 'Administrador',
      segundo_nombre: 'Del',
      primer_apellido: 'Sistema',
      segundo_apellido: 'UCP',
      correo: adminEmail,
      contrasena_hash: hashedPassword,
      numero_documento: '99999999',
      tipo_documento: TipoDocumento.CC,
      rol: Rol.ADMINISTRADOR,
      esta_bloqueado: false,
      requiere_cambio_clave: false,
    },
  });
  console.log(`  ✅ Admin: ${admin.correo}`);

  // 2) CATEGORÍAS
  console.log('\n📁 Creando categorías de servicio social...');
  const categorias = [
    {
      nombre: 'Educación y Pedagogía',
      descripcion:
        'Tutorías, apoyo escolar, talleres pedagógicos y acompañamiento formativo en comunidades vulnerables.',
      icono: 'BookOpen',
      color_hex: '#3B82F6',
    },
    {
      nombre: 'Comunicación y Cultura',
      descripcion:
        'Producción audiovisual comunitaria, periodismo social, radio, eventos culturales, diseño gráfico y expresiones artísticas.',
      icono: 'Megaphone',
      color_hex: '#8B5CF6',
    },
    {
      nombre: 'Bienestar Psicosocial',
      descripcion:
        'Atención psicológica comunitaria, orientación emocional e intervención psicosocial.',
      icono: 'Heart',
      color_hex: '#EF4444',
    },
    {
      nombre: 'Desarrollo Empresarial y Económico',
      descripcion:
        'Asesoría a emprendedores, educación financiera y fortalecimiento de micronegocios.',
      icono: 'TrendingUp',
      color_hex: '#10B981',
    },
    {
      nombre: 'Tecnología e Innovación Social',
      descripcion:
        'Alfabetización digital y desarrollo de soluciones tecnológicas para el bien común.',
      icono: 'Cpu',
      color_hex: '#06B6D4',
    },
    {
      nombre: 'Hábitat, Diseño y Medio Ambiente',
      descripcion:
        'Diseño inclusivo, intervención urbana participativa y sostenibilidad ambiental.',
      icono: 'Leaf',
      color_hex: '#22C55E',
    },
    {
      nombre: 'Derechos Humanos y Ciudadanía',
      descripcion:
        'Formación ciudadana, derechos humanos, convivencia, paz y reconciliación.',
      icono: 'Scale',
      color_hex: '#F59E0B',
    },
    {
      nombre: 'Deporte, Recreación y Vida Saludable',
      descripcion:
        'Promoción de estilos de vida saludables mediante deporte y recreación.',
      icono: 'Trophy',
      color_hex: '#F97316',
    },
  ];

  for (const cat of categorias) {
    await prisma.categoriaServicioSocial.upsert({
      where: { nombre: cat.nombre },
      update: cat,
      create: { ...cat, esta_activa: true },
    });
    console.log(`  ✅ ${cat.nombre}`);
  }

  // 3) FACULTADES
  console.log('\n🏛️ Creando facultades...');
  const facultades = [
    {
      nombre: 'Facultad de Arquitectura y Diseño',
      codigo: 'FAD',
      descripcion: 'Arquitectura, diseño industrial, diseño audiovisual y afines.',
      esta_activo: true,
    },
    {
      nombre: 'Facultad de Ciencias Humanas, Sociales y de la Educación',
      codigo: 'FCHSE',
      descripcion: 'Comunicación, psicología, licenciaturas y educación.',
      esta_activo: true,
    },
    {
      nombre: 'Facultad de Ciencias Básicas e Ingeniería',
      codigo: 'FCBI',
      descripcion: 'Ingenierías y tecnologías.',
      esta_activo: true,
    },
    {
      nombre: 'Facultad de Ciencias Económicas y Administrativas',
      codigo: 'FCEA',
      descripcion: 'Administración, mercadeo, finanzas y negocios.',
      esta_activo: true,
    },
  ];

  for (const fac of facultades) {
    await prisma.facultad.upsert({
      where: { nombre: fac.nombre },
      update: fac,
      create: fac,
    });
    console.log(`  ✅ ${fac.nombre}`);
  }

  const getFacId = async (nombre: string) => {
    const fac = await prisma.facultad.findUnique({ where: { nombre } });
    if (!fac) throw new Error(`Facultad no encontrada: ${nombre}`);
    return fac.id;
  };

  // 4) PROGRAMAS
  console.log('\n🎓 Creando programas...');
  const programas: Array<{
    nombre: string;
    codigo: string;
    nivel_formacion: NivelFormacion;
    horas_requeridas: number;
    facultad: string;
    esta_activo: boolean;
  }> = [
    { nombre: 'Arquitectura', codigo: 'ARQ', nivel_formacion: NivelFormacion.PREGRADO, horas_requeridas: 200, facultad: 'Facultad de Arquitectura y Diseño', esta_activo: true },
    { nombre: 'Diseño Audiovisual', codigo: 'DAV', nivel_formacion: NivelFormacion.PREGRADO, horas_requeridas: 180, facultad: 'Facultad de Arquitectura y Diseño', esta_activo: true },
    { nombre: 'Diseño Industrial', codigo: 'DIN', nivel_formacion: NivelFormacion.PREGRADO, horas_requeridas: 180, facultad: 'Facultad de Arquitectura y Diseño', esta_activo: true },
    { nombre: 'Ingeniería de Sistemas y Telecomunicaciones', codigo: 'IST', nivel_formacion: NivelFormacion.PREGRADO, horas_requeridas: 200, facultad: 'Facultad de Ciencias Básicas e Ingeniería', esta_activo: true },
    { nombre: 'Ingeniería Industrial', codigo: 'IIN', nivel_formacion: NivelFormacion.PREGRADO, horas_requeridas: 200, facultad: 'Facultad de Ciencias Básicas e Ingeniería', esta_activo: true },
    { nombre: 'Tecnología en Desarrollo de Software', codigo: 'TDS', nivel_formacion: NivelFormacion.TECNOLOGICO, horas_requeridas: 120, facultad: 'Facultad de Ciencias Básicas e Ingeniería', esta_activo: true },
    { nombre: 'Psicología', codigo: 'PSI', nivel_formacion: NivelFormacion.PREGRADO, horas_requeridas: 180, facultad: 'Facultad de Ciencias Humanas, Sociales y de la Educación', esta_activo: true },
    { nombre: 'Comunicación Social – Periodismo', codigo: 'CSP', nivel_formacion: NivelFormacion.PREGRADO, horas_requeridas: 160, facultad: 'Facultad de Ciencias Humanas, Sociales y de la Educación', esta_activo: true },
    { nombre: 'Licenciatura en Educación Religiosa', codigo: 'LER', nivel_formacion: NivelFormacion.PREGRADO, horas_requeridas: 160, facultad: 'Facultad de Ciencias Humanas, Sociales y de la Educación', esta_activo: true },
    { nombre: 'Administración de Empresas', codigo: 'ADE', nivel_formacion: NivelFormacion.PREGRADO, horas_requeridas: 160, facultad: 'Facultad de Ciencias Económicas y Administrativas', esta_activo: true },
    { nombre: 'Mercadeo', codigo: 'MER', nivel_formacion: NivelFormacion.PREGRADO, horas_requeridas: 160, facultad: 'Facultad de Ciencias Económicas y Administrativas', esta_activo: true },
    { nombre: 'Negocios Internacionales', codigo: 'NEI', nivel_formacion: NivelFormacion.PREGRADO, horas_requeridas: 160, facultad: 'Facultad de Ciencias Económicas y Administrativas', esta_activo: true },
  ];

  for (const { facultad, ...data } of programas) {
    const id_facultad = await getFacId(facultad);
    await prisma.programa.upsert({
      where: { nombre: data.nombre },
      update: { ...data, id_facultad },
      create: { ...data, id_facultad },
    });
    console.log(`  ✅ [${data.codigo}] ${data.nombre}`);
  }

  // 5) CONVOCATORIAS
  console.log('\n📢 Creando convocatorias...');
  const catMap = Object.fromEntries((await prisma.categoriaServicioSocial.findMany()).map((c) => [c.nombre, c.id]));
  const progMap = Object.fromEntries((await prisma.programa.findMany()).map((p) => [p.codigo ?? '', p.id]));

  const hoy = new Date();
  const en20dias = new Date(hoy); en20dias.setDate(hoy.getDate() + 20);
  const en60dias = new Date(hoy); en60dias.setDate(hoy.getDate() + 60);

  const convocatorias = [
    {
      titulo: 'Tutorías de Matemáticas para Colegios Públicos de Pereira',
      descripcion: 'Acompañamiento académico para secundaria.',
      objetivo: 'Reducir brechas educativas con tutoría universitaria.',
      id_categoria: catMap['Educación y Pedagogía'],
      id_programa: progMap['IST'],
      modalidad: Modalidad.PRESENCIAL,
      lugar: 'Pereira',
      competencias_requeridas: ['Comunicación efectiva', 'Paciencia pedagógica'],
      estado: EstadoConvocatoria.PUBLICADA,
      fecha_inicio: hoy,
      fecha_fin: en60dias,
      fecha_cierre_postulacion: en20dias,
      cupo_maximo: 20,
      cupo_disponible: 20,
      horas_totales_ofrecidas: 40,
      requiere_entrevista: false,
    },
    {
      titulo: 'Alfabetización Digital para Adultos Mayores',
      descripcion: 'Talleres de herramientas digitales básicas.',
      objetivo: 'Reducir brecha digital en población mayor.',
      id_categoria: catMap['Tecnología e Innovación Social'],
      id_programa: progMap['TDS'],
      modalidad: Modalidad.PRESENCIAL,
      lugar: 'Pereira',
      competencias_requeridas: ['Didáctica', 'Conocimientos TIC básicos'],
      estado: EstadoConvocatoria.PUBLICADA,
      fecha_inicio: hoy,
      fecha_fin: en60dias,
      fecha_cierre_postulacion: en20dias,
      cupo_maximo: 12,
      cupo_disponible: 12,
      horas_totales_ofrecidas: 30,
      requiere_entrevista: false,
    },
  ];

  for (const conv of convocatorias) {
    const existente = await prisma.convocatoria.findFirst({ where: { titulo: conv.titulo } });
    if (!existente) {
      await prisma.convocatoria.create({
        data: { ...conv, publicado_por: admin.id, publicado_en: new Date() },
      });
      console.log(`  ✅ ${conv.titulo}`);
    } else {
      console.log(`  ⏭️ Ya existe: ${conv.titulo}`);
    }
  }

  // 6) ACTIVIDADES
  console.log('\n📋 Creando actividades...');
  const actividadesPorConvocatoria: Record<string, {
    nombre: string;
    descripcion: string;
    tipo_actividad: TipoActividad;
    horas_estimadas: number;
    materiales_requeridos: string[];
  }> = {
    'Tutorías de Matemáticas para Colegios Públicos de Pereira': {
      nombre: 'Sesiones de tutoría presencial',
      descripcion: 'Sesiones guiadas de acompañamiento académico.',
      tipo_actividad: TipoActividad.CAPACITACION,
      horas_estimadas: 2,
      materiales_requeridos: ['Guías', 'Marcadores', 'Tablero'],
    },
    'Alfabetización Digital para Adultos Mayores': {
      nombre: 'Taller práctico de celular',
      descripcion: 'Uso básico de apps y navegación segura.',
      tipo_actividad: TipoActividad.CAPACITACION,
      horas_estimadas: 2,
      materiales_requeridos: ['Celulares', 'Guías impresas'],
    },
  };

  const todasConvocatorias = await prisma.convocatoria.findMany({ include: { actividades: true } });
  for (const conv of todasConvocatorias) {
    const act = actividadesPorConvocatoria[conv.titulo];
    if (!act || conv.actividades.length > 0) continue;

    await prisma.actividad.create({
      data: {
        ...act,
        id_convocatoria: conv.id,
        creado_por: admin.id,
        fecha_inicio: conv.fecha_inicio,
        fecha_limite: conv.fecha_fin ?? undefined,
        esta_activa: true,
      },
    });
    console.log(`  ✅ Actividad para: ${conv.titulo}`);
  }

  // 7) ESTUDIANTE + CERTIFICADOS
  console.log('\n📜 Creando estudiante y certificados de ejemplo...');
  const estudiante = await prisma.usuario.upsert({
    where: { correo: 'estudiante.ejemplo@ucp.edu.co' },
    update: {},
    create: {
      primer_nombre: 'Juan',
      primer_apellido: 'Pérez',
      correo: 'estudiante.ejemplo@ucp.edu.co',
      numero_documento: '12345678',
      tipo_documento: TipoDocumento.CC,
      rol: Rol.ESTUDIANTE,
    },
  });

  const convocatoriasActuales = await prisma.convocatoria.findMany({ take: 2 });
  const certificados = [
    {
      id_estudiante: estudiante.id,
      id_convocatoria: convocatoriasActuales[0]?.id,
      emitido_por: admin.id,
      total_horas: 40,
      periodo_desde: new Date('2024-01-01'),
      periodo_hasta: new Date('2024-03-31'),
      descripcion: 'Certificado por participación en tutorías.',
      nombre_aliado: 'Aliado Comunitario',
      nombre_convocatoria: convocatoriasActuales[0]?.titulo ?? 'Tutorías',
      url_pdf: '/uploads/certificado_ejemplo_1.pdf',
    },
    {
      id_estudiante: estudiante.id,
      id_convocatoria: convocatoriasActuales[1]?.id,
      emitido_por: admin.id,
      total_horas: 30,
      periodo_desde: new Date('2024-04-01'),
      periodo_hasta: new Date('2024-05-31'),
      descripcion: 'Certificado por alfabetización digital.',
      nombre_aliado: 'Centro Comunitario',
      nombre_convocatoria: convocatoriasActuales[1]?.titulo ?? 'Alfabetización',
      url_pdf: '/uploads/certificado_ejemplo_2.pdf',
    },
  ];

  for (const cert of certificados) {
    if (!cert.id_convocatoria) continue;
    const existe = await prisma.certificado.findFirst({
      where: {
        id_estudiante: cert.id_estudiante,
        id_convocatoria: cert.id_convocatoria,
      },
    });
    if (!existe) {
      await prisma.certificado.create({ data: cert });
      console.log(`  ✅ Certificado: ${cert.nombre_convocatoria}`);
    } else {
      console.log(`  ⏭️ Certificado existente: ${cert.nombre_convocatoria}`);
    }
  }

  // 8) NOTICIAS (integrado en seed principal)
  console.log('\n📰 Seeding de noticias (integrado)...');

  const noticiasSeed: NoticiaSeed[] = [
    {
      titulo: 'Taller de Sensibilización Social 2025',
      resumen:
        'Metodologías de intervención social para maximizar impacto comunitario.',
      contenido:
        `Taller para estudiantes que buscan profundizar en realidades sociales locales.
Incluye diagnóstico participativo, comunicación intercultural y evaluación de impacto.`,
      autor: 'Dirección de Servicio Social',
      publicada: true,
      fecha_publicacion: new Date('2025-03-10'),
      imagenes: [
        {
          url_imagen:
            'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&auto=format&fit=crop&q=60',
          public_id_cloudinary: 'noticia_taller_sensibilizacion_1',
          orden: 0,
        },
      ],
    },
    {
      titulo: "Programa 'UCP en tu Barrio'",
      resumen:
        'Inscripciones abiertas para alfabetización digital en sectores vulnerables.',
      contenido:
        `Convocatoria de voluntariado estudiantil para cierre de brecha digital.
Incluye talleres prácticos y acompañamiento comunitario.`,
      autor: 'Coordinación de Proyectos Sociales',
      publicada: true,
      fecha_publicacion: new Date('2025-03-08'),
      imagenes: [
        {
          url_imagen:
            'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60',
          public_id_cloudinary: 'noticia_ucp_barrio_1',
          orden: 0,
        },
      ],
    },
    {
      titulo: 'Gala de Premios Excelencia Social',
      resumen:
        'Evento de reconocimiento al compromiso estudiantil en servicio social.',
      contenido:
        `Ceremonia para destacar proyectos de impacto, liderazgo y compromiso social
de estudiantes UCP durante el semestre.`,
      autor: 'Comité de Servicio Social',
      publicada: true,
      fecha_publicacion: new Date('2025-03-05'),
      imagenes: [
        {
          url_imagen:
            'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&auto=format&fit=crop&q=60',
          public_id_cloudinary: 'noticia_gala_premios_1',
          orden: 0,
        },
      ],
    },
  ];

  for (const noticiaData of noticiasSeed) {
    const slug = slugify(noticiaData.titulo);
    const { imagenes, ...noticiaInfo } = noticiaData;

    const noticia = await prisma.noticia.upsert({
      where: { slug },
      update: {
        titulo: noticiaInfo.titulo,
        resumen: noticiaInfo.resumen,
        contenido: noticiaInfo.contenido,
        autor: noticiaInfo.autor,
        publicada: noticiaInfo.publicada,
        fecha_publicacion: noticiaInfo.fecha_publicacion,
      },
      create: {
        titulo: noticiaInfo.titulo,
        slug,
        resumen: noticiaInfo.resumen,
        contenido: noticiaInfo.contenido,
        autor: noticiaInfo.autor,
        publicada: noticiaInfo.publicada,
        fecha_publicacion: noticiaInfo.fecha_publicacion,
      },
    });

    await prisma.imagenNoticia.deleteMany({ where: { id_noticia: noticia.id } });
    if (imagenes.length > 0) {
      await prisma.imagenNoticia.createMany({
        data: imagenes.map((img) => ({
          id_noticia: noticia.id,
          url_imagen: img.url_imagen,
          public_id_cloudinary: img.public_id_cloudinary,
          orden: img.orden,
        })),
      });
    }

    console.log(`  ✅ Noticia: ${noticia.titulo}`);
  }

  // RESUMEN
  const [
    cntFac,
    cntProg,
    cntCat,
    cntConv,
    cntAct,
    cntCert,
    cntNoticias,
    cntImagenesNoticias,
  ] = await Promise.all([
    prisma.facultad.count(),
    prisma.programa.count(),
    prisma.categoriaServicioSocial.count(),
    prisma.convocatoria.count(),
    prisma.actividad.count(),
    prisma.certificado.count(),
    prisma.noticia.count(),
    prisma.imagenNoticia.count(),
  ]);

  console.log('\n═══════════════════════════════════════════════');
  console.log('✨ Seeding principal finalizado.');
  console.log('───────────────────────────────────────────────');
  console.log(`🏛️  Facultades: ${cntFac}`);
  console.log(`🎓 Programas: ${cntProg}`);
  console.log(`📁 Categorías: ${cntCat}`);
  console.log(`📢 Convocatorias: ${cntConv}`);
  console.log(`📋 Actividades: ${cntAct}`);
  console.log(`📜 Certificados: ${cntCert}`);
  console.log(`📰 Noticias: ${cntNoticias}`);
  console.log(`🖼️  Imágenes de noticias: ${cntImagenesNoticias}`);
  console.log('═══════════════════════════════════════════════\n');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('\n❌ Error durante seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
