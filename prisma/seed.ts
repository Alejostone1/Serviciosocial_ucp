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

  // ─────────────────────────────────────────────
  // 1) ADMIN
  // ─────────────────────────────────────────────
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

  // ─────────────────────────────────────────────
  // 2) CATEGORÍAS
  // ─────────────────────────────────────────────
  console.log('\n📁 Creando categorías de servicio social...');
  const categorias = [
    {
      nombre: 'Educación y Pedagogía',
      descripcion: 'Tutorías, apoyo escolar y acompañamiento formativo en comunidades vulnerables.',
      icono: 'BookOpen',
      color_hex: '#3B82F6',
    },
    {
      nombre: 'Tecnología e Innovación Social',
      descripcion: 'Alfabetización digital y desarrollo de soluciones tecnológicas para el bien común.',
      icono: 'Cpu',
      color_hex: '#06B6D4',
    },
    {
      nombre: 'Bienestar Psicosocial',
      descripcion: 'Atención psicológica comunitaria y orientación emocional.',
      icono: 'Heart',
      color_hex: '#EF4444',
    },
    {
      nombre: 'Desarrollo Empresarial y Económico',
      descripcion: 'Asesoría a emprendedores y educación financiera.',
      icono: 'TrendingUp',
      color_hex: '#10B981',
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

  // ─────────────────────────────────────────────
  // 3) FACULTADES
  // ─────────────────────────────────────────────
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

  /** Helpers para obtener IDs por nombre/código de forma segura */
  const getFacId = async (nombre: string) => {
    const fac = await prisma.facultad.findUnique({ where: { nombre } });
    if (!fac) throw new Error(`Facultad no encontrada: ${nombre}`);
    return fac.id;
  };

  const getProgId = async (codigo: string) => {
    const prog = await prisma.programa.findUnique({ where: { codigo } });
    if (!prog) throw new Error(`Programa no encontrado con código: ${codigo}`);
    return prog.id;
  };

  // ─────────────────────────────────────────────
  // 4) PROGRAMAS
  // ─────────────────────────────────────────────
  console.log('\n🎓 Creando programas...');

  /**
   * Cada programa declara explícitamente:
   *  - su código único
   *  - la facultad a la que pertenece (por nombre)
   *  - horas requeridas según nivel de formación
   */
  const programas: Array<{
    nombre: string;
    codigo: string;
    nivel_formacion: NivelFormacion;
    horas_requeridas: number;
    facultad: string;
    esta_activo: boolean;
  }> = [
    // ── Facultad de Arquitectura y Diseño ──────────────────────────
    {
      nombre: 'Arquitectura',
      codigo: 'ARQ',
      nivel_formacion: NivelFormacion.PREGRADO,
      horas_requeridas: 200,
      facultad: 'Facultad de Arquitectura y Diseño',
      esta_activo: true,
    },
    {
      nombre: 'Diseño Audiovisual',
      codigo: 'DAV',
      nivel_formacion: NivelFormacion.PREGRADO,
      horas_requeridas: 180,
      facultad: 'Facultad de Arquitectura y Diseño',
      esta_activo: true,
    },
    {
      nombre: 'Diseño Industrial',
      codigo: 'DIN',
      nivel_formacion: NivelFormacion.PREGRADO,
      horas_requeridas: 180,
      facultad: 'Facultad de Arquitectura y Diseño',
      esta_activo: true,
    },
    // ── Facultad de Ciencias Básicas e Ingeniería ──────────────────
    {
      nombre: 'Ingeniería de Sistemas y Telecomunicaciones',
      codigo: 'IST',
      nivel_formacion: NivelFormacion.PREGRADO,
      horas_requeridas: 200,
      facultad: 'Facultad de Ciencias Básicas e Ingeniería',
      esta_activo: true,
    },
    {
      nombre: 'Ingeniería Industrial',
      codigo: 'IIN',
      nivel_formacion: NivelFormacion.PREGRADO,
      horas_requeridas: 200,
      facultad: 'Facultad de Ciencias Básicas e Ingeniería',
      esta_activo: true,
    },
    {
      nombre: 'Tecnología en Desarrollo de Software',
      codigo: 'TDS',
      nivel_formacion: NivelFormacion.TECNOLOGICO,
      horas_requeridas: 120,
      facultad: 'Facultad de Ciencias Básicas e Ingeniería',
      esta_activo: true,
    },
    // ── Facultad de Ciencias Humanas, Sociales y de la Educación ───
    {
      nombre: 'Psicología',
      codigo: 'PSI',
      nivel_formacion: NivelFormacion.PREGRADO,
      horas_requeridas: 180,
      facultad: 'Facultad de Ciencias Humanas, Sociales y de la Educación',
      esta_activo: true,
    },
    {
      nombre: 'Comunicación Social – Periodismo',
      codigo: 'CSP',
      nivel_formacion: NivelFormacion.PREGRADO,
      horas_requeridas: 160,
      facultad: 'Facultad de Ciencias Humanas, Sociales y de la Educación',
      esta_activo: true,
    },
    {
      nombre: 'Licenciatura en Educación Religiosa',
      codigo: 'LER',
      nivel_formacion: NivelFormacion.PREGRADO,
      horas_requeridas: 160,
      facultad: 'Facultad de Ciencias Humanas, Sociales y de la Educación',
      esta_activo: true,
    },
    // ── Facultad de Ciencias Económicas y Administrativas ──────────
    {
      nombre: 'Administración de Empresas',
      codigo: 'ADE',
      nivel_formacion: NivelFormacion.PREGRADO,
      horas_requeridas: 160,
      facultad: 'Facultad de Ciencias Económicas y Administrativas',
      esta_activo: true,
    },
    {
      nombre: 'Mercadeo',
      codigo: 'MER',
      nivel_formacion: NivelFormacion.PREGRADO,
      horas_requeridas: 160,
      facultad: 'Facultad de Ciencias Económicas y Administrativas',
      esta_activo: true,
    },
    {
      nombre: 'Negocios Internacionales',
      codigo: 'NEI',
      nivel_formacion: NivelFormacion.PREGRADO,
      horas_requeridas: 160,
      facultad: 'Facultad de Ciencias Económicas y Administrativas',
      esta_activo: true,
    },
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

  // ─────────────────────────────────────────────
  // 5) CONVOCATORIAS
  // ─────────────────────────────────────────────
  console.log('\n📢 Creando convocatorias...');

  const catMap = Object.fromEntries(
    (await prisma.categoriaServicioSocial.findMany()).map((c) => [c.nombre, c.id]),
  );
  const progMap = Object.fromEntries(
    (await prisma.programa.findMany()).map((p) => [p.codigo ?? '', p.id]),
  );

  const hoy = new Date();
  const en30dias = new Date(hoy);
  en30dias.setDate(hoy.getDate() + 30);
  const en90dias = new Date(hoy);
  en90dias.setDate(hoy.getDate() + 90);

  const convocatorias = [
    {
      titulo: 'Tutorías de Matemáticas para Colegios Públicos',
      descripcion: 'Acompañamiento académico para estudiantes de secundaria en matemáticas básicas y avanzadas.',
      objetivo: 'Reducir brechas educativas con tutoría universitaria personalizada.',
      id_categoria: catMap['Educación y Pedagogía'],
      id_programa: progMap['IST'],
      modalidad: Modalidad.PRESENCIAL,
      lugar: 'Institución Educativa San José - Pereira',
      competencias_requeridas: ['Paciencia pedagógica', 'Comunicación efectiva', 'Conocimientos matemáticos'],
      estado: EstadoConvocatoria.PUBLICADA,
      fecha_inicio: hoy,
      fecha_fin: en90dias,
      fecha_cierre_postulacion: en30dias,
      cupo_maximo: 15,
      cupo_disponible: 15,
      horas_totales_ofrecidas: 80,
      requiere_entrevista: false,
    },
    {
      titulo: 'Alfabetización Digital para Adultos Mayores',
      descripcion: 'Enseñar habilidades digitales básicas a personas mayores de 60 años.',
      objetivo: 'Incluir digitalmente a la población adulta mayor en la era tecnológica.',
      id_categoria: catMap['Tecnología e Innovación Social'],
      id_programa: progMap['TDS'],
      modalidad: Modalidad.PRESENCIAL,
      lugar: 'Centro Comunal Las Américas - Pereira',
      competencias_requeridas: ['Paciencia', 'Conocimientos básicos de tecnología', 'Empatía'],
      estado: EstadoConvocatoria.PUBLICADA,
      fecha_inicio: hoy,
      fecha_fin: en90dias,
      fecha_cierre_postulacion: en30dias,
      cupo_maximo: 20,
      cupo_disponible: 20,
      horas_totales_ofrecidas: 60,
      requiere_entrevista: false,
    },
    {
      titulo: 'Acompañamiento Psicológico Comunitario',
      descripcion: 'Brindar apoyo emocional y orientación psicológica a comunidades vulnerables.',
      objetivo: 'Mejorar la salud mental y bienestar emocional de la población.',
      id_categoria: catMap['Bienestar Psicosocial'],
      id_programa: progMap['PSI'],
      modalidad: Modalidad.HIBRIDA,
      lugar: 'Centro de Salud Mental La Esperanza - Pereira',
      competencias_requeridas: ['Empatía', 'Escucha activa', 'Conocimientos psicológicos básicos'],
      estado: EstadoConvocatoria.PUBLICADA,
      fecha_inicio: hoy,
      fecha_fin: en90dias,
      fecha_cierre_postulacion: en30dias,
      cupo_maximo: 12,
      cupo_disponible: 12,
      horas_totales_ofrecidas: 100,
      requiere_entrevista: true,
    },
    {
      titulo: 'Asesoría a Pequeños Emprendedores',
      descripcion: 'Apoyar a pequeños negocios locales con planes de negocio y gestión.',
      objetivo: 'Fortalecer la economía local a través del emprendimiento.',
      id_categoria: catMap['Desarrollo Empresarial y Económico'],
      id_programa: progMap['ADE'],
      modalidad: Modalidad.VIRTUAL,
      lugar: 'Plataforma Virtual UCP',
      competencias_requeridas: ['Conocimientos empresariales', 'Análisis financiero', 'Planeación estratégica'],
      estado: EstadoConvocatoria.PUBLICADA,
      fecha_inicio: hoy,
      fecha_fin: en90dias,
      fecha_cierre_postulacion: en30dias,
      cupo_maximo: 25,
      cupo_disponible: 25,
      horas_totales_ofrecidas: 120,
      requiere_entrevista: true,
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
      console.log(`  ⏭️  Ya existe: ${conv.titulo}`);
    }
  }

  // ─────────────────────────────────────────────
  // 6) ACTIVIDADES
  // ─────────────────────────────────────────────
  console.log('\n📋 Creando actividades...');
  await prisma.actividad.deleteMany({});

  const actividadesPorConvocatoria = [
    {
      titulo: 'Tutorías de Matemáticas para Colegios Públicos',
      actividades: [
        {
          nombre: 'Sesiones de Tutoría Individual',
          descripcion: 'Acompañamiento uno a uno en matemáticas básicas',
          tipo_actividad: TipoActividad.CAPACITACION,
          horas_estimadas: 2,
          materiales_requeridos: ['Guías matemáticas', 'Calculadora', 'Cuadernos'],
        },
        {
          nombre: 'Talleres de Resolución de Problemas',
          descripcion: 'Ejercicios prácticos en grupo para fortalecer habilidades',
          tipo_actividad: TipoActividad.CAPACITACION,
          horas_estimadas: 3,
          materiales_requeridos: ['Pizarras', 'Marcadores', 'Problemas impresos'],
        },
        {
          nombre: 'Evaluaciones y Seguimiento',
          descripcion: 'Evaluación del progreso y ajuste de metodologías',
          tipo_actividad: TipoActividad.ADMINISTRATIVA,
          horas_estimadas: 1,
          materiales_requeridos: ['Formularios', 'Instrumentos de evaluación'],
        },
      ],
    },
    {
      titulo: 'Alfabetización Digital para Adultos Mayores',
      actividades: [
        {
          nombre: 'Uso Básico del Celular',
          descripcion: 'Funciones esenciales del smartphone y aplicaciones',
          tipo_actividad: TipoActividad.CAPACITACION,
          horas_estimadas: 2,
          materiales_requeridos: ['Celulares de muestra', 'Guías visuales'],
        },
        {
          nombre: 'Navegación Segura en Internet',
          descripcion: 'Uso responsable de redes sociales y búsqueda de información',
          tipo_actividad: TipoActividad.CAPACITACION,
          horas_estimadas: 2,
          materiales_requeridos: ['Computadoras', 'Guías de seguridad'],
        },
        {
          nombre: 'Apps de Comunicación',
          descripcion: 'WhatsApp, mensajería y videollamadas para mantener contacto',
          tipo_actividad: TipoActividad.CAPACITACION,
          horas_estimadas: 1,
          materiales_requeridos: ['Tablets', 'Apps instaladas'],
        },
      ],
    },
    {
      titulo: 'Acompañamiento Psicológico Comunitario',
      actividades: [
        {
          nombre: 'Escucha Activa y Apoyo Emocional',
          descripcion: 'Sesiones de acompañamiento psicológico individual',
          tipo_actividad: TipoActividad.GENERAL,
          horas_estimadas: 2,
          materiales_requeridos: ['Fichas técnicas', 'Espacio privado'],
        },
        {
          nombre: 'Talleres de Manejo del Estrés',
          descripcion: 'Técnicas de relajación y manejo de ansiedad',
          tipo_actividad: TipoActividad.CAPACITACION,
          horas_estimadas: 3,
          materiales_requeridos: ['Colchonetas', 'Música relajante', 'Guías'],
        },
        {
          nombre: 'Grupos de Apoyo Mutuo',
          descripcion: 'Sesiones grupales para compartir experiencias',
          tipo_actividad: TipoActividad.COMUNITARIA,
          horas_estimadas: 2,
          materiales_requeridos: ['Sillas en círculo', 'Material de escritura'],
        },
      ],
    },
    {
      titulo: 'Asesoría a Pequeños Emprendedores',
      actividades: [
        {
          nombre: 'Diagnóstico Empresarial',
          descripcion: 'Análisis FODA y evaluación del modelo de negocio',
          tipo_actividad: TipoActividad.ADMINISTRATIVA,
          horas_estimadas: 4,
          materiales_requeridos: ['Plantillas FODA', 'Computadoras'],
        },
        {
          nombre: 'Plan de Negocio',
          descripcion: 'Elaboración de plan estratégico y proyecciones',
          tipo_actividad: TipoActividad.ADMINISTRATIVA,
          horas_estimadas: 4,
          materiales_requeridos: ['Software de planificación', 'Guías'],
        },
        {
          nombre: 'Gestión Financiera Básica',
          descripcion: 'Control de costos, precios y flujo de caja',
          tipo_actividad: TipoActividad.ADMINISTRATIVA,
          horas_estimadas: 3,
          materiales_requeridos: ['Calculadoras', 'Formatos contables'],
        },
      ],
    },
  ];

  const todasConvocatorias = await prisma.convocatoria.findMany();
  for (const convocatoria of todasConvocatorias) {
    const config = actividadesPorConvocatoria.find((a) => a.titulo === convocatoria.titulo);
    if (!config) continue;
    for (const actividad of config.actividades) {
      await prisma.actividad.create({
        data: {
          ...actividad,
          id_convocatoria: convocatoria.id,
          creado_por: admin.id,
          fecha_inicio: convocatoria.fecha_inicio,
          fecha_limite: convocatoria.fecha_fin,
          esta_activa: true,
        },
      });
    }
    console.log(`  ✅ ${config.actividades.length} actividades → ${convocatoria.titulo}`);
  }

  // ─────────────────────────────────────────────
  // 7) USUARIOS (estudiantes · profesores · aliados)
  // ─────────────────────────────────────────────
  console.log('\n👥 Creando usuarios del sistema...');

  // ── 7a. Estudiantes ───────────────────────────
  /**
   * Se asigna id_programa usando el código del programa,
   * que es único y predecible, en lugar de índices de array.
   */
  const estudiantesData = [
    {
      primer_nombre: 'Juan',
      primer_apellido: 'Pérez',
      correo: 'juan.perez@ucp.edu.co',
      numero_documento: '12345678',
      telefono: '3186589765',
      codigoPrograma: 'IST', // Ingeniería de Sistemas – FCBI
      perfil: {
        codigo_estudiantil: '2024IST001',
        semestre_actual: 6,
        horas_acumuladas: 70,
        habilidades: ['Pensamiento lógico', 'Trabajo en equipo', 'Programación básica'],
        intereses: ['Tecnología', 'Educación STEM', 'Voluntariado'],
        modalidad_preferida: Modalidad.PRESENCIAL,
      },
    },
    {
      primer_nombre: 'María',
      primer_apellido: 'García',
      correo: 'maria.garcia@ucp.edu.co',
      numero_documento: '87654321',
      telefono: '3152345678',
      codigoPrograma: 'PSI', // Psicología – FCHSE
      perfil: {
        codigo_estudiantil: '2024PSI002',
        semestre_actual: 4,
        horas_acumuladas: 45,
        habilidades: ['Empatía', 'Escucha activa', 'Comunicación asertiva'],
        intereses: ['Salud mental', 'Comunidades vulnerables', 'Inclusión social'],
        modalidad_preferida: Modalidad.PRESENCIAL,
      },
    },
  ];

  console.log('\n🎓 Creando estudiantes...');
  for (const est of estudiantesData) {
    const id_programa = await getProgId(est.codigoPrograma);
    const programa = await prisma.programa.findUnique({ where: { id: id_programa } });

    const usuario = await prisma.usuario.upsert({
      where: { correo: est.correo },
      update: {},
      create: {
        primer_nombre: est.primer_nombre,
        primer_apellido: est.primer_apellido,
        correo: est.correo,
        numero_documento: est.numero_documento,
        tipo_documento: TipoDocumento.CC,
        rol: Rol.ESTUDIANTE,
        id_programa,
        telefono: est.telefono,
      },
    });

    await prisma.perfilEstudiante.upsert({
      where: { id_usuario: usuario.id },
      update: {},
      create: {
        id_usuario: usuario.id,
        codigo_estudiantil: est.perfil.codigo_estudiantil,
        semestre_actual: est.perfil.semestre_actual,
        horas_previas: 0,
        horas_acumuladas: est.perfil.horas_acumuladas,
        porcentaje_avance: programa
          ? Math.round((est.perfil.horas_acumuladas / Number(programa.horas_requeridas)) * 100)
          : 0,
        habilidades: est.perfil.habilidades,
        intereses: est.perfil.intereses,
        modalidad_preferida: est.perfil.modalidad_preferida,
      },
    });

    console.log(
      `  ✅ Estudiante: ${usuario.primer_nombre} ${usuario.primer_apellido}` +
      ` | Programa: ${programa?.nombre} [${est.codigoPrograma}]` +
      ` | Semestre: ${est.perfil.semestre_actual}° | Horas: ${est.perfil.horas_acumuladas}`,
    );
  }

  // ── 7b. Profesores ────────────────────────────
  /**
   * Cada profesor tiene:
   *  - codigoPrograma: el programa al que pertenece
   *  - nombreFacultad:  referencia explícita para verificación visual en logs
   *
   * Un profesor de Ingeniería no puede quedar asignado a Psicología
   * y viceversa.  Con códigos directos eso es imposible.
   */
  const profesoresData = [
    {
      primer_nombre: 'Carlos',
      primer_apellido: 'Rodríguez',
      correo: 'carlos.rodriguez@ucp.edu.co',
      numero_documento: '11223344',
      telefono: '3209876543',
      codigoPrograma: 'IST',            // Ingeniería de Sistemas
      nombreFacultad: 'Facultad de Ciencias Básicas e Ingeniería',
    },
    {
      primer_nombre: 'Ana',
      primer_apellido: 'Martínez',
      correo: 'ana.martinez@ucp.edu.co',
      numero_documento: '55443322',
      telefono: '3123456789',
      codigoPrograma: 'PSI',            // Psicología
      nombreFacultad: 'Facultad de Ciencias Humanas, Sociales y de la Educación',
    },
    {
      primer_nombre: 'Luis',
      primer_apellido: 'Herrera',
      correo: 'luis.herrera@ucp.edu.co',
      numero_documento: '33445566',
      telefono: '3015678901',
      codigoPrograma: 'ADE',            // Administración de Empresas
      nombreFacultad: 'Facultad de Ciencias Económicas y Administrativas',
    },
    {
      primer_nombre: 'Claudia',
      primer_apellido: 'Ospina',
      correo: 'claudia.ospina@ucp.edu.co',
      numero_documento: '44556677',
      telefono: '3107654321',
      codigoPrograma: 'ARQ',            // Arquitectura
      nombreFacultad: 'Facultad de Arquitectura y Diseño',
    },
  ];

  console.log('\n👨‍🏫 Creando profesores...');
  for (const prof of profesoresData) {
    const id_programa = await getProgId(prof.codigoPrograma);
    const programa = await prisma.programa.findUnique({ where: { id: id_programa } });

    const usuario = await prisma.usuario.upsert({
      where: { correo: prof.correo },
      update: {},
      create: {
        primer_nombre: prof.primer_nombre,
        primer_apellido: prof.primer_apellido,
        correo: prof.correo,
        numero_documento: prof.numero_documento,
        tipo_documento: TipoDocumento.CC,
        rol: Rol.PROFESOR,
        id_programa,
        telefono: prof.telefono,
      },
    });

    console.log(
      `  ✅ Profesor: ${usuario.primer_nombre} ${usuario.primer_apellido}` +
      ` | Programa: ${programa?.nombre} [${prof.codigoPrograma}]` +
      ` | Facultad: ${prof.nombreFacultad}`,
    );
  }

  // ── 7c. Aliados ───────────────────────────────
  const aliadosData = [
    {
      primer_nombre: 'Fundación',
      primer_apellido: 'Educación para Todos',
      correo: 'contacto@educacionparatodos.org',
      numero_documento: '900123456',
      telefono: '3001234567',
    },
    {
      primer_nombre: 'Centro',
      primer_apellido: 'Desarrollo Comunitario',
      correo: 'info@centrocomunitario.org',
      numero_documento: '900789012',
      telefono: '3007890123',
    },
  ];

  console.log('\n🤝 Creando aliados...');
  for (const aliado of aliadosData) {
    const usuario = await prisma.usuario.upsert({
      where: { correo: aliado.correo },
      update: {},
      create: {
        primer_nombre: aliado.primer_nombre,
        primer_apellido: aliado.primer_apellido,
        correo: aliado.correo,
        numero_documento: aliado.numero_documento,
        tipo_documento: TipoDocumento.NIT,
        rol: Rol.ALIADO,
        telefono: aliado.telefono,
      },
    });
    console.log(`  ✅ Aliado: ${usuario.primer_nombre} ${usuario.primer_apellido}`);
  }

  // ─────────────────────────────────────────────
  // 8) CERTIFICADOS
  // ─────────────────────────────────────────────
  console.log('\n📜 Creando certificados de ejemplo...');

  const estudiantesCreados = await prisma.usuario.findMany({
    where: { rol: Rol.ESTUDIANTE },
    take: 2,
  });
  const convocatoriasActuales = await prisma.convocatoria.findMany({ take: 4 });

  const certificados = [
    {
      id_estudiante: estudiantesCreados[0]?.id,
      id_convocatoria: convocatoriasActuales[0]?.id,
      emitido_por: admin.id,
      total_horas: 40,
      periodo_desde: new Date('2024-01-01'),
      periodo_hasta: new Date('2024-03-31'),
      descripcion: 'Certificado por participación en tutorías de matemáticas.',
      nombre_aliado: 'Fundación Educación para Todos',
      nombre_convocatoria: convocatoriasActuales[0]?.titulo ?? 'Tutorías',
      url_pdf: '/uploads/certificado_juan_perez_1.pdf',
      emitido_en: new Date('2024-04-01T10:00:00Z'),
    },
    {
      id_estudiante: estudiantesCreados[1]?.id,
      id_convocatoria: convocatoriasActuales[1]?.id,
      emitido_por: admin.id,
      total_horas: 30,
      periodo_desde: new Date('2023-10-01'),
      periodo_hasta: new Date('2023-12-31'),
      descripcion: 'Certificado por alfabetización digital.',
      nombre_aliado: 'Centro Desarrollo Comunitario',
      nombre_convocatoria: convocatoriasActuales[1]?.titulo ?? 'Alfabetización',
      url_pdf: '/uploads/certificado_maria_garcia_2.pdf',
      emitido_en: new Date('2024-01-15T14:30:00Z'),
    },
  ];

  for (const cert of certificados) {
    if (!cert.id_estudiante || !cert.id_convocatoria) continue;
    const existe = await prisma.certificado.findFirst({
      where: { id_estudiante: cert.id_estudiante, id_convocatoria: cert.id_convocatoria },
    });
    if (!existe) {
      await prisma.certificado.create({ data: cert });
      console.log(`  ✅ Certificado: ${cert.nombre_convocatoria}`);
    } else {
      console.log(`  ⏭️  Certificado existente: ${cert.nombre_convocatoria}`);
    }
  }

  // ─────────────────────────────────────────────
  // 9) NOTICIAS
  // ─────────────────────────────────────────────
  console.log('\n📰 Seeding de noticias...');

  const noticiasSeed: NoticiaSeed[] = [
    {
      titulo: 'Taller de Sensibilización Social 2025',
      resumen: 'Metodologías de intervención social para maximizar impacto comunitario.',
      contenido:
        'Taller para estudiantes que buscan profundizar en realidades sociales locales.\n' +
        'Incluye diagnóstico participativo, comunicación intercultural y evaluación de impacto.',
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
      resumen: 'Inscripciones abiertas para alfabetización digital en sectores vulnerables.',
      contenido:
        'Convocatoria de voluntariado estudiantil para cierre de brecha digital.\n' +
        'Incluye talleres prácticos y acompañamiento comunitario.',
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
      resumen: 'Evento de reconocimiento al compromiso estudiantil en servicio social.',
      contenido:
        'Ceremonia para destacar proyectos de impacto, liderazgo y compromiso social\n' +
        'de estudiantes UCP durante el semestre.',
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

  // ─────────────────────────────────────────────
  // RESUMEN FINAL
  // ─────────────────────────────────────────────
  const [
    cntFac,
    cntProg,
    cntCat,
    cntConv,
    cntAct,
    cntCert,
    cntNoticias,
    cntImagenesNoticias,
    cntUsuarios,
    cntEstudiantes,
    cntProfesores,
    cntAliados,
  ] = await Promise.all([
    prisma.facultad.count(),
    prisma.programa.count(),
    prisma.categoriaServicioSocial.count(),
    prisma.convocatoria.count(),
    prisma.actividad.count(),
    prisma.certificado.count(),
    prisma.noticia.count(),
    prisma.imagenNoticia.count(),
    prisma.usuario.count(),
    prisma.usuario.count({ where: { rol: Rol.ESTUDIANTE } }),
    prisma.usuario.count({ where: { rol: Rol.PROFESOR } }),
    prisma.usuario.count({ where: { rol: Rol.ALIADO } }),
  ]);

  console.log('\n═══════════════════════════════════════════════════');
  console.log('✨ Seeding principal finalizado.');
  console.log('───────────────────────────────────────────────────');
  console.log(`🏛️  Facultades:            ${cntFac}`);
  console.log(`🎓 Programas:             ${cntProg}`);
  console.log(`📁 Categorías:            ${cntCat}`);
  console.log(`📢 Convocatorias:         ${cntConv}`);
  console.log(`📋 Actividades:           ${cntAct}`);
  console.log(`📜 Certificados:          ${cntCert}`);
  console.log(`📰 Noticias:              ${cntNoticias}`);
  console.log(`🖼️  Imágenes de noticias:  ${cntImagenesNoticias}`);
  console.log(`👥 Usuarios totales:      ${cntUsuarios}`);
  console.log(`🎓 Estudiantes:           ${cntEstudiantes}`);
  console.log(`👨‍🏫 Profesores:            ${cntProfesores}`);
  console.log(`🤝 Aliados:               ${cntAliados}`);
  console.log('👨‍💼 Administrador:         1');
  console.log('═══════════════════════════════════════════════════\n');
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