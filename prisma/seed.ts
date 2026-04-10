import {
  PrismaClient,
  Rol,
  TipoDocumento,
  NivelFormacion,
  Modalidad,
  TipoActividad,
  EstadoConvocatoria,
  EstadoPostulacion,
  EstadoReporte,
} from '@prisma/client';
import bcrypt from 'bcryptjs';
import { seedNotificaciones } from './seed-notificaciones';

const prisma = new PrismaClient();

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

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

async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🚀 Iniciando seeding UCP — Sistema de Servicio Social\n');

  const DEFAULT_PASSWORD = 'Ucpservicio123';
  const defaultHash = await hashPassword(DEFAULT_PASSWORD);

  // ───────────────────────────────────────────────────────────────────────────
  // 1. CATEGORÍAS DE SERVICIO SOCIAL
  //    Modelo: CategoriaServicioSocial → tabla "categorias_servicio_social"
  //    Campos cubiertos: nombre, descripcion, icono, color_hex, esta_activa
  // ───────────────────────────────────────────────────────────────────────────
  console.log('📁 Creando categorías de servicio social...');

  const categoriasData = [
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

  for (const cat of categoriasData) {
    await prisma.categoriaServicioSocial.upsert({
      where: { nombre: cat.nombre },
      update: cat,
      create: { ...cat, esta_activa: true },
    });
    console.log(`  ✅ ${cat.nombre}`);
  }

  const catMap = Object.fromEntries(
    (await prisma.categoriaServicioSocial.findMany()).map((c) => [c.nombre, c.id]),
  );

  // ───────────────────────────────────────────────────────────────────────────
  // 2. FACULTADES
  //    Modelo: Facultad → tabla "facultades"
  //    Campos cubiertos: nombre, codigo, descripcion, esta_activo
  //    Campos opcionales no seteados: decano, correo_contacto, telefono_ext
  // ───────────────────────────────────────────────────────────────────────────
  console.log('\n🏛️  Creando facultades...');

  const facultadesData = [
    {
      nombre: 'Facultad de Ciencias Básicas e Ingeniería',
      codigo: 'FCBI',
      descripcion: 'Ingenierías y tecnologías.',
      esta_activo: true,
    },
    {
      nombre: 'Facultad de Ciencias Humanas, Sociales y de la Educación',
      codigo: 'FCHSE',
      descripcion: 'Comunicación, psicología, licenciaturas y educación.',
      esta_activo: true,
    },
    {
      nombre: 'Facultad de Ciencias Económicas y Administrativas',
      codigo: 'FCEA',
      descripcion: 'Administración, mercadeo, finanzas y negocios.',
      esta_activo: true,
    },
    {
      nombre: 'Facultad de Arquitectura y Diseño',
      codigo: 'FAD',
      descripcion: 'Arquitectura, diseño industrial, diseño audiovisual y afines.',
      esta_activo: true,
    },
  ];

  for (const fac of facultadesData) {
    await prisma.facultad.upsert({
      where: { nombre: fac.nombre },
      update: fac,
      create: fac,
    });
    console.log(`  ✅ ${fac.nombre}`);
  }

  const getFacId = async (nombre: string): Promise<string> => {
    const fac = await prisma.facultad.findUnique({ where: { nombre } });
    if (!fac) throw new Error(`Facultad no encontrada: "${nombre}"`);
    return fac.id;
  };

  // ───────────────────────────────────────────────────────────────────────────
  // 3. PROGRAMAS ACADÉMICOS
  //    Modelo: Programa → tabla "programas" (sin @@map en el schema → nombre real "Programa")
  //    Campos cubiertos: nombre, codigo, nivel_formacion, horas_requeridas,
  //                      id_facultad, esta_activo
  // ───────────────────────────────────────────────────────────────────────────
  console.log('\n🎓 Creando programas académicos...');

  const programasData = [
    {
      nombre: 'Ingeniería de Sistemas y Telecomunicaciones',
      codigo: 'IST',
      nivel_formacion: NivelFormacion.PREGRADO,
      horas_requeridas: 120,
      facultad: 'Facultad de Ciencias Básicas e Ingeniería',
      esta_activo: true,
    },
    {
      nombre: 'Psicología',
      codigo: 'PSI',
      nivel_formacion: NivelFormacion.PREGRADO,
      horas_requeridas: 120,
      facultad: 'Facultad de Ciencias Humanas, Sociales y de la Educación',
      esta_activo: true,
    },
    {
      nombre: 'Administración de Empresas',
      codigo: 'ADE',
      nivel_formacion: NivelFormacion.PREGRADO,
      horas_requeridas: 120,
      facultad: 'Facultad de Ciencias Económicas y Administrativas',
      esta_activo: true,
    },
    {
      nombre: 'Arquitectura',
      codigo: 'ARQ',
      nivel_formacion: NivelFormacion.PREGRADO,
      horas_requeridas: 120,
      facultad: 'Facultad de Arquitectura y Diseño',
      esta_activo: true,
    },
    {
      nombre: 'Comunicación Social – Periodismo',
      codigo: 'CSP',
      nivel_formacion: NivelFormacion.PREGRADO,
      horas_requeridas: 120,
      facultad: 'Facultad de Ciencias Humanas, Sociales y de la Educación',
      esta_activo: true,
    },
  ];

  for (const { facultad, ...data } of programasData) {
    const id_facultad = await getFacId(facultad);
    await prisma.programa.upsert({
      where: { nombre: data.nombre },
      update: { ...data, id_facultad },
      create: { ...data, id_facultad },
    });
    console.log(`  ✅ [${data.codigo}] ${data.nombre}`);
  }

  const getProgId = async (codigo: string): Promise<string> => {
    const prog = await prisma.programa.findUnique({ where: { codigo } });
    if (!prog) throw new Error(`Programa no encontrado con código: "${codigo}"`);
    return prog.id;
  };

  // ───────────────────────────────────────────────────────────────────────────
  // 4. USUARIOS
  //    Modelo: Usuario → tabla "usuarios"
  //    Campos cubiertos: primer_nombre, segundo_nombre?, primer_apellido,
  //                      segundo_apellido?, tipo_documento, numero_documento,
  //                      correo, contrasena_hash, telefono?, rol, id_programa?,
  //                      esta_bloqueado, requiere_cambio_clave
  //    Campos opcionales no seteados: correo_personal, foto_url, motivo_bloqueo,
  //                                   ultimo_acceso
  //    PerfilEstudiante cubre: id_usuario, codigo_estudiantil, semestre_actual,
  //                            horas_previas, horas_acumuladas, porcentaje_avance,
  //                            habilidades, intereses, modalidad_preferida
  //    No seteados en perfil: url_hoja_de_vida, disponibilidad (Json? opcional)
  // ───────────────────────────────────────────────────────────────────────────
  console.log('\n👤 Creando usuarios del sistema...');

  // ── 4.1 Administrador ───────────────────────────────────────────────────
  const adminEmail = 'administrador@ucp.edu.co';
  const adminPassword = 'Android.13';
  const adminHash = await hashPassword(adminPassword);

  const admin = await prisma.usuario.upsert({
    where: { correo: adminEmail },
    update: {
      contrasena_hash: adminHash,
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
      contrasena_hash: adminHash,
      numero_documento: '99999999',
      tipo_documento: TipoDocumento.CC,
      rol: Rol.ADMINISTRADOR,
      esta_bloqueado: false,
      requiere_cambio_clave: false,
    },
  });
  console.log(`  ✅ [ADMINISTRADOR] ${admin.correo}`);

  // ── 4.2 Profesor ────────────────────────────────────────────────────────
  const idProgIST = await getProgId('IST');

  const profesor = await prisma.usuario.upsert({
    where: { correo: 'profesor@ucp.edu.co' },
    update: { contrasena_hash: defaultHash },
    create: {
      primer_nombre: 'Carlos',
      primer_apellido: 'Rivera',
      correo: 'profesor@ucp.edu.co',
      contrasena_hash: defaultHash,
      numero_documento: '11223344',
      tipo_documento: TipoDocumento.CC,
      rol: Rol.PROFESOR,
      id_programa: idProgIST,
      telefono: '3209876543',
    },
  });
  console.log(`  ✅ [PROFESOR] ${profesor.correo}`);

  // ── 4.3 Auxiliar ────────────────────────────────────────────────────────
  const auxiliar = await prisma.usuario.upsert({
    where: { correo: 'auxiliar@ucp.edu.co' },
    update: { contrasena_hash: defaultHash },
    create: {
      primer_nombre: 'Andrea',
      primer_apellido: 'Castro',
      correo: 'auxiliar@ucp.edu.co',
      contrasena_hash: defaultHash,
      numero_documento: '1098765432',
      tipo_documento: TipoDocumento.CC,
      rol: Rol.AUXILIAR,
      telefono: '3112223344',
    },
  });
  console.log(`  ✅ [AUXILIAR] ${auxiliar.correo}`);

  // ── 4.4 Aliado ──────────────────────────────────────────────────────────
  //    tipo_documento: NIT — correcto, el enum TipoDocumento incluye NIT
  const aliado = await prisma.usuario.upsert({
    where: { correo: 'aliado@ucp.edu.co' },
    update: { contrasena_hash: defaultHash },
    create: {
      primer_nombre: 'Fundación',
      primer_apellido: 'Comunidad Activa',
      correo: 'aliado@ucp.edu.co',
      contrasena_hash: defaultHash,
      numero_documento: '900123456',
      tipo_documento: TipoDocumento.NIT,
      rol: Rol.ALIADO,
      telefono: '3001234567',
    },
  });
  console.log(`  ✅ [ALIADO] ${aliado.correo}`);

  // ── 4.5 Estudiante 1 (flujo completo) ───────────────────────────────────
  const idProgPSI = await getProgId('PSI');

  const estudiante1 = await prisma.usuario.upsert({
    where: { correo: 'estudiante1@ucp.edu.co' },
    update: { contrasena_hash: defaultHash },
    create: {
      primer_nombre: 'Nicolas',
      primer_apellido: 'Cardona',
      correo: 'estudiante1@ucp.edu.co',
      contrasena_hash: defaultHash,
      numero_documento: '87654321',
      tipo_documento: TipoDocumento.CC,
      rol: Rol.ESTUDIANTE,
      id_programa: idProgPSI,
      telefono: '3152345678',
    },
  });

  // PerfilEstudiante — relación 1:1 con Usuario (onDelete: Cascade)
  await prisma.perfilEstudiante.upsert({
    where: { id_usuario: estudiante1.id },
    update: {},
    create: {
      id_usuario: estudiante1.id,
      codigo_estudiantil: '2026PSI001',
      semestre_actual: 5,
      horas_previas: 0,
      horas_acumuladas: 0,
      porcentaje_avance: 0,
      habilidades: ['Empatía', 'Escucha activa', 'Comunicación asertiva'],
      intereses: ['Salud mental', 'Comunidades vulnerables', 'Inclusión social'],
      modalidad_preferida: Modalidad.PRESENCIAL,
    },
  });
  console.log(`  ✅ [ESTUDIANTE] ${estudiante1.correo}`);

  // ── 4.6 Estudiante 2 (sin inscripciones) ────────────────────────────────
  const idProgADE = await getProgId('ADE');

  const estudiante2 = await prisma.usuario.upsert({
    where: { correo: 'estudiante2@ucp.edu.co' },
    update: { contrasena_hash: defaultHash },
    create: {
      primer_nombre: 'Daniel',
      primer_apellido: 'Garzon',
      correo: 'estudiante2@ucp.edu.co',
      contrasena_hash: defaultHash,
      numero_documento: '12345678',
      tipo_documento: TipoDocumento.CC,
      rol: Rol.ESTUDIANTE,
      id_programa: idProgADE,
      telefono: '3186589765',
    },
  });

  await prisma.perfilEstudiante.upsert({
    where: { id_usuario: estudiante2.id },
    update: {},
    create: {
      id_usuario: estudiante2.id,
      codigo_estudiantil: '2026ADE002',
      semestre_actual: 3,
      horas_previas: 0,
      horas_acumuladas: 0,
      porcentaje_avance: 0,
      habilidades: ['Análisis financiero', 'Trabajo en equipo', 'Liderazgo'],
      intereses: ['Emprendimiento', 'Desarrollo económico', 'Finanzas'],
      modalidad_preferida: Modalidad.VIRTUAL,
    },
  });
  console.log(`  ✅ [ESTUDIANTE] ${estudiante2.correo}  (sin inscripciones)`);

  // ───────────────────────────────────────────────────────────────────────────
  // 5. CONVOCATORIAS
  //    Modelo: Convocatoria → tabla "convocatorias"
  //    Campos cubiertos: titulo, descripcion, objetivo, id_categoria,
  //                      publicado_por, id_programa, modalidad, lugar,
  //                      competencias_requeridas, estado, fecha_inicio,
  //                      fecha_fin, fecha_cierre_postulacion, cupo_maximo,
  //                      cupo_disponible, horas_totales_ofrecidas,
  //                      requiere_entrevista, publicado_en
  //    Campos opcionales no seteados: url_convocatoria_externa, url_banner,
  //                                   url_documento_adicional, revisado_por,
  //                                   revisado_en, motivo_rechazo
  //    NOTA: EstadoConvocatoria cubre BORRADOR, ESPERANDO_CONFIRMACION,
  //           PUBLICADA, EN_CURSO, CERRADA, CANCELADA, RECHAZADA — todos válidos
  // ───────────────────────────────────────────────────────────────────────────
  console.log('\n📢 Creando convocatorias...');

  const idProgARQ = await getProgId('ARQ');
  const idProgCSP = await getProgId('CSP');

  type ConvocatoriaInput = {
    titulo: string;
    descripcion: string;
    objetivo: string;
    id_categoria: string;
    publicado_por: string;
    id_programa: string;
    modalidad: Modalidad;
    lugar: string;
    competencias_requeridas: string[];
    estado: EstadoConvocatoria;
    fecha_inicio: Date;
    fecha_fin: Date;
    fecha_cierre_postulacion: Date;
    cupo_maximo: number;
    cupo_disponible: number;
    horas_totales_ofrecidas: number;
    requiere_entrevista: boolean;
  };

  const hoy = new Date();
  const en30d = new Date(hoy); en30d.setDate(hoy.getDate() + 30);
  const en90d = new Date(hoy); en90d.setDate(hoy.getDate() + 90);
  const hace60d = new Date(hoy); hace60d.setDate(hoy.getDate() - 60);
  const hace30d = new Date(hoy); hace30d.setDate(hoy.getDate() - 30);

  const convocatoriasData: ConvocatoriaInput[] = [
    // C1 — Principal de Estudiante 1 (CERRADA, 120 h = requisito PSI completo)
    {
      titulo: 'Acompañamiento Psicológico Comunitario',
      descripcion: 'Brindar apoyo emocional y orientación psicológica a comunidades vulnerables del eje cafetero.',
      objetivo: 'Mejorar la salud mental y bienestar emocional de la población mediante atención directa.',
      id_categoria: catMap['Bienestar Psicosocial'],
      publicado_por: admin.id,
      id_programa: idProgPSI,
      modalidad: Modalidad.HIBRIDA,
      lugar: 'Centro de Salud Mental La Esperanza – Pereira',
      competencias_requeridas: ['Empatía', 'Escucha activa', 'Conocimientos psicológicos básicos'],
      estado: EstadoConvocatoria.CERRADA,
      fecha_inicio: hace60d,
      fecha_fin: hace30d,
      fecha_cierre_postulacion: new Date(hace60d.getTime() - 7 * 86_400_000),
      cupo_maximo: 10,
      cupo_disponible: 0,
      horas_totales_ofrecidas: 120,
      requiere_entrevista: true,
    },
    // C2 — Profesor / IST / PUBLICADA
    {
      titulo: 'Tutorías de Programación para Colegios',
      descripcion: 'Enseñar fundamentos de programación a estudiantes de secundaria en colegios públicos de Pereira.',
      objetivo: 'Reducir la brecha digital en jóvenes de educación básica con acompañamiento universitario.',
      id_categoria: catMap['Educación y Pedagogía'],
      publicado_por: profesor.id,
      id_programa: idProgIST,
      modalidad: Modalidad.PRESENCIAL,
      lugar: 'Institución Educativa Técnica – Pereira',
      competencias_requeridas: ['Programación básica', 'Paciencia pedagógica', 'Comunicación clara'],
      estado: EstadoConvocatoria.PUBLICADA,
      fecha_inicio: hoy,
      fecha_fin: en90d,
      fecha_cierre_postulacion: en30d,
      cupo_maximo: 15,
      cupo_disponible: 15,
      horas_totales_ofrecidas: 80,
      requiere_entrevista: false,
    },
    // C3 — Aliado / CSP / PUBLICADA
    {
      titulo: 'Alfabetización Digital para Adultos Mayores',
      descripcion: 'Enseñar habilidades digitales básicas a personas mayores de 60 años en centros comunales.',
      objetivo: 'Incluir digitalmente a la población adulta mayor de la ciudad.',
      id_categoria: catMap['Tecnología e Innovación Social'],
      publicado_por: aliado.id,
      id_programa: idProgCSP,
      modalidad: Modalidad.PRESENCIAL,
      lugar: 'Centro Comunal Las Américas – Pereira',
      competencias_requeridas: ['Paciencia', 'Didáctica', 'Conocimientos básicos de tecnología'],
      estado: EstadoConvocatoria.PUBLICADA,
      fecha_inicio: hoy,
      fecha_fin: en90d,
      fecha_cierre_postulacion: en30d,
      cupo_maximo: 20,
      cupo_disponible: 20,
      horas_totales_ofrecidas: 60,
      requiere_entrevista: false,
    },
    // C4 — Administrador / ADE / PUBLICADA
    {
      titulo: 'Asesoría a Pequeños Emprendedores',
      descripcion: 'Apoyar a pequeños negocios locales con elaboración de planes de negocio y gestión financiera básica.',
      objetivo: 'Fortalecer la economía local a través del emprendimiento con acompañamiento universitario.',
      id_categoria: catMap['Desarrollo Empresarial y Económico'],
      publicado_por: admin.id,
      id_programa: idProgADE,
      modalidad: Modalidad.VIRTUAL,
      lugar: 'Plataforma Virtual UCP',
      competencias_requeridas: ['Conocimientos empresariales', 'Análisis financiero', 'Planeación estratégica'],
      estado: EstadoConvocatoria.PUBLICADA,
      fecha_inicio: hoy,
      fecha_fin: en90d,
      fecha_cierre_postulacion: en30d,
      cupo_maximo: 25,
      cupo_disponible: 25,
      horas_totales_ofrecidas: 90,
      requiere_entrevista: true,
    },
    // C5 — Profesor / ARQ / PUBLICADA
    {
      titulo: 'Rehabilitación de Espacios Comunitarios',
      descripcion: 'Diseño y mejora de espacios públicos en comunidades vulnerables de Pereira con enfoque participativo.',
      objetivo: 'Dignificar entornos comunitarios mediante el diseño arquitectónico y la participación ciudadana.',
      id_categoria: catMap['Educación y Pedagogía'],
      publicado_por: profesor.id,
      id_programa: idProgARQ,
      modalidad: Modalidad.PRESENCIAL,
      lugar: 'Barrio El Jardín – Pereira',
      competencias_requeridas: ['Diseño arquitectónico', 'Trabajo comunitario', 'Planimetría básica'],
      estado: EstadoConvocatoria.PUBLICADA,
      fecha_inicio: hoy,
      fecha_fin: en90d,
      fecha_cierre_postulacion: en30d,
      cupo_maximo: 12,
      cupo_disponible: 12,
      horas_totales_ofrecidas: 100,
      requiere_entrevista: false,
    },
  ];

  for (const conv of convocatoriasData) {
    const existente = await prisma.convocatoria.findFirst({ where: { titulo: conv.titulo } });
    if (!existente) {
      await prisma.convocatoria.create({
        data: { ...conv, publicado_en: new Date() },
      });
      console.log(`  ✅ ${conv.titulo}`);
    } else {
      console.log(`  ⏭️  Ya existe: ${conv.titulo}`);
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 6. ACTIVIDADES
  //    Modelo: Actividad → tabla "actividades"
  //    Campos cubiertos: nombre, descripcion, tipo_actividad, horas_estimadas,
  //                      materiales_requeridos, id_convocatoria, creado_por,
  //                      fecha_inicio, fecha_limite, esta_activa
  //    Campo opcional no seteado: horas_maximas, ubicacion
  //    NOTA: deleteMany({}) antes del create para evitar duplicados en re-runs.
  //    ADVERTENCIA: si ya hay ReporteHoras vinculados a actividades previas,
  //    esto los romperá por FK. En BD fresca está bien; en staging usar con cuidado.
  // ───────────────────────────────────────────────────────────────────────────
  console.log('\n📋 Creando actividades (2 por convocatoria)...');

  const actividadesPorConvocatoria: Record<
    string,
    Array<{
      nombre: string;
      descripcion: string;
      tipo_actividad: TipoActividad;
      horas_estimadas: number;
      materiales_requeridos: string[];
    }>
  > = {
    'Acompañamiento Psicológico Comunitario': [
      {
        nombre: 'Sesiones de Escucha Terapéutica Individual',
        descripcion: 'Atención psicológica individual a miembros de la comunidad en situación de vulnerabilidad.',
        tipo_actividad: TipoActividad.GENERAL,
        horas_estimadas: 60,
        materiales_requeridos: ['Fichas técnicas', 'Espacio privado', 'Material de relajación'],
      },
      {
        nombre: 'Talleres Grupales de Bienestar Emocional',
        descripcion: 'Actividades grupales de manejo emocional, técnicas de relajación y construcción de redes de apoyo.',
        tipo_actividad: TipoActividad.COMUNITARIA,
        horas_estimadas: 60,
        materiales_requeridos: ['Material lúdico', 'Guías de trabajo', 'Espacio amplio', 'Colchonetas'],
      },
    ],

    'Tutorías de Programación para Colegios': [
      {
        nombre: 'Clases de Lógica y Pensamiento Computacional',
        descripcion: 'Fundamentos de algoritmos, diagramas de flujo y pseudocódigo.',
        tipo_actividad: TipoActividad.CAPACITACION,
        horas_estimadas: 40,
        materiales_requeridos: ['Computadoras', 'Guías de ejercicios', 'Proyector'],
      },
      {
        nombre: 'Prácticas de Codificación en Python',
        descripcion: 'Ejercicios prácticos de programación en Python con proyectos de aplicación real.',
        tipo_actividad: TipoActividad.CAPACITACION,
        horas_estimadas: 40,
        materiales_requeridos: ['IDEs instalados', 'Ejemplos de código', 'Cuadernos de trabajo'],
      },
    ],

    'Alfabetización Digital para Adultos Mayores': [
      {
        nombre: 'Uso Básico del Celular e Internet',
        descripcion: 'Funciones esenciales del smartphone, navegación segura en internet y búsqueda de información.',
        tipo_actividad: TipoActividad.CAPACITACION,
        horas_estimadas: 30,
        materiales_requeridos: ['Celulares de práctica', 'Guías visuales', 'Computadoras'],
      },
      {
        nombre: 'Aplicaciones de Comunicación y Servicios Digitales',
        descripcion: 'Uso de WhatsApp, videollamadas, correo electrónico y servicios gubernamentales en línea.',
        tipo_actividad: TipoActividad.CAPACITACION,
        horas_estimadas: 30,
        materiales_requeridos: ['Tablets', 'Apps instaladas', 'Manual de usuario impreso'],
      },
    ],

    'Asesoría a Pequeños Emprendedores': [
      {
        nombre: 'Diagnóstico Empresarial y Plan de Negocio',
        descripcion: 'Análisis FODA, modelo Canvas y elaboración de plan estratégico con proyecciones financieras.',
        tipo_actividad: TipoActividad.ADMINISTRATIVA,
        horas_estimadas: 50,
        materiales_requeridos: ['Plantillas Canvas y FODA', 'Software de planificación', 'Computadoras'],
      },
      {
        nombre: 'Gestión Financiera y Control de Costos',
        descripcion: 'Control de costos, fijación de precios, flujo de caja y fundamentos de contabilidad básica.',
        tipo_actividad: TipoActividad.ADMINISTRATIVA,
        horas_estimadas: 40,
        materiales_requeridos: ['Calculadoras', 'Formatos contables', 'Plantillas de flujo de caja'],
      },
    ],

    'Rehabilitación de Espacios Comunitarios': [
      {
        nombre: 'Diagnóstico Participativo y Levantamiento Arquitectónico',
        descripcion: 'Talleres comunitarios de identificación de necesidades, diagnóstico espacial y planimetría básica.',
        tipo_actividad: TipoActividad.CAMPO,
        horas_estimadas: 60,
        materiales_requeridos: ['Cintas métricas', 'Planos base', 'Fichas de diagnóstico', 'Cámara fotográfica'],
      },
      {
        nombre: 'Diseño y Ejecución de Intervenciones',
        descripcion: 'Elaboración de propuestas de diseño, presentación a la comunidad e implementación de mejoras.',
        tipo_actividad: TipoActividad.COMUNITARIA,
        horas_estimadas: 40,
        materiales_requeridos: ['Software de diseño', 'Materiales de construcción básicos', 'Herramientas manuales'],
      },
    ],
  };

  // Limpiar actividades previas para evitar duplicados en re-ejecuciones
  await prisma.actividad.deleteMany({});

  const todasConvocatorias = await prisma.convocatoria.findMany();

  for (const convocatoria of todasConvocatorias) {
    const actividadesConfig = actividadesPorConvocatoria[convocatoria.titulo];
    if (!actividadesConfig) {
      console.log(`  ⚠️  Sin configuración de actividades para: ${convocatoria.titulo}`);
      continue;
    }

    for (const act of actividadesConfig) {
      await prisma.actividad.create({
        data: {
          ...act,
          id_convocatoria: convocatoria.id,
          creado_por: convocatoria.publicado_por,
          fecha_inicio: convocatoria.fecha_inicio,
          fecha_limite: convocatoria.fecha_fin ?? undefined,
          esta_activa: true,
        },
      });
    }

    const totalHoras = actividadesConfig.reduce((s, a) => s + a.horas_estimadas, 0);
    console.log(
      `  ✅ ${actividadesConfig.length} actividades (${totalHoras} h total) → "${convocatoria.titulo}"`,
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 7. POSTULACIÓN
  //    Modelo: Postulacion → tabla "postulaciones"
  //    @@unique([id_convocatoria, id_estudiante]) — upsert seguro con findFirst
  //    Campos cubiertos: id_estudiante, id_convocatoria, estado, motivacion,
  //                      habilidades_relevantes, postulado_en, revisado_en,
  //                      revisado_por, notas_revision
  //    Campos opcionales no seteados: url_hoja_vida, fecha_entrevista,
  //                                   url_acta_entrevista
  // ───────────────────────────────────────────────────────────────────────────
  console.log('\n📝 Creando postulación de Estudiante 1...');

  const convC1 = await prisma.convocatoria.findFirst({
    where: { titulo: 'Acompañamiento Psicológico Comunitario' },
  });

  if (!convC1) throw new Error('Convocatoria C1 no encontrada.');

  const postulacionExistente = await prisma.postulacion.findFirst({
    where: { id_estudiante: estudiante1.id, id_convocatoria: convC1.id },
  });

  if (!postulacionExistente) {
    await prisma.postulacion.create({
      data: {
        id_estudiante: estudiante1.id,
        id_convocatoria: convC1.id,
        estado: EstadoPostulacion.ACEPTADA,
        motivacion: 'Quiero aplicar mis conocimientos de psicología para ayudar a comunidades vulnerables y fortalecer mi perfil profesional.',
        habilidades_relevantes: ['Empatía', 'Escucha activa', 'Manejo de grupos', 'Primeros auxilios psicológicos'],
        postulado_en: new Date(hace60d.getTime() - 10 * 86_400_000),
        revisado_en: new Date(hace60d.getTime() - 8 * 86_400_000),
        revisado_por: admin.id,
        notas_revision: 'Excelente candidata con gran vocación de servicio y sólidas competencias en el área.',
      },
    });
    console.log(`  ✅ Postulación ACEPTADA: ${estudiante1.correo} → ${convC1.titulo}`);
  } else {
    console.log(`  ⏭️  Postulación ya existe: ${estudiante1.correo} → ${convC1.titulo}`);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 8. REPORTES DE HORAS
  //    Modelo: ReporteHoras → tabla "reportes_horas"
  //    Campos cubiertos: id_estudiante, id_actividad, id_convocatoria (denorm.),
  //                      horas_reportadas, horas_aprobadas, estado,
  //                      descripcion_trabajo, notas_estudiante, fecha_actividad,
  //                      reportado_en, revisado_en, id_revisor, notas_revisor
  //    Campos opcionales no seteados: motivo_rechazo
  //    EvidenciaReporte: no se crean evidencias en el seed (relación opcional)
  //    HistorialHoras: no se crea historial en el seed (relación opcional)
  //    EstadoReporte.APROBADO es un valor válido del enum
  // ───────────────────────────────────────────────────────────────────────────
  console.log('\n⏱️  Creando reportes de horas de Estudiante 1...');

  const actividadesC1 = await prisma.actividad.findMany({
    where: { id_convocatoria: convC1.id },
    orderBy: { creado_en: 'asc' },
  });

  if (actividadesC1.length !== 2) {
    throw new Error(`Se esperaban 2 actividades en C1, se encontraron ${actividadesC1.length}.`);
  }

  let totalHorasAprobadas = 0;

  const fechasActividad = [
    new Date(hace60d.getTime() + 7 * 86_400_000),
    new Date(hace60d.getTime() + 21 * 86_400_000),
  ];

  for (let i = 0; i < actividadesC1.length; i++) {
    const actividad = actividadesC1[i];
    const fechaActividad = fechasActividad[i];
    const horasReportadas = Number(actividad.horas_estimadas);

    const reporteExistente = await prisma.reporteHoras.findFirst({
      where: { id_estudiante: estudiante1.id, id_actividad: actividad.id },
    });

    if (!reporteExistente) {
      await prisma.reporteHoras.create({
        data: {
          id_estudiante: estudiante1.id,
          id_actividad: actividad.id,
          id_convocatoria: convC1.id,
          horas_reportadas: horasReportadas,
          horas_aprobadas: horasReportadas,
          estado: EstadoReporte.APROBADO,
          descripcion_trabajo: `Participación completa en "${actividad.nombre}". Se cumplieron todas las actividades planificadas y los objetivos de intervención comunitaria.`,
          notas_estudiante: 'Experiencia muy enriquecedora. Se lograron los objetivos propuestos con la comunidad.',
          fecha_actividad: fechaActividad,
          reportado_en: new Date(fechaActividad.getTime() + 86_400_000),
          revisado_en: new Date(fechaActividad.getTime() + 3 * 86_400_000),
          id_revisor: admin.id,
          notas_revisor: 'Trabajo excelente. Cumplió con todos los objetivos establecidos. Horas aprobadas en su totalidad.',
        },
      });
      totalHorasAprobadas += horasReportadas;
      console.log(`  ✅ Reporte APROBADO: "${actividad.nombre}" — ${horasReportadas} h`);
    } else {
      totalHorasAprobadas += Number(reporteExistente.horas_aprobadas ?? 0);
      console.log(`  ⏭️  Reporte ya existe: "${actividad.nombre}"`);
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 9. ACTUALIZAR PERFIL DEL ESTUDIANTE 1
  //    horas_acumuladas y porcentaje_avance se calculan sobre horas aprobadas
  //    y horas_requeridas del programa PSI (120 h).
  // ───────────────────────────────────────────────────────────────────────────
  console.log('\n🔄 Actualizando perfil de Estudiante 1...');

  const progPSI = await prisma.programa.findUnique({ where: { codigo: 'PSI' } });
  const horasRequeridas = Number(progPSI?.horas_requeridas ?? 120);
  const porcentajeAvance = Math.min(
    Math.round((totalHorasAprobadas / horasRequeridas) * 100),
    100,
  );

  await prisma.perfilEstudiante.update({
    where: { id_usuario: estudiante1.id },
    data: {
      horas_acumuladas: totalHorasAprobadas,
      porcentaje_avance: porcentajeAvance,
    },
  });

  console.log(
    `  ✅ Perfil actualizado: ${totalHorasAprobadas} h acumuladas` +
    ` / ${horasRequeridas} h requeridas` +
    ` → ${porcentajeAvance}% de avance`,
  );

  // ───────────────────────────────────────────────────────────────────────────
  // 10. CERTIFICADO
  //     Modelo: Certificado → tabla "certificados"
  //     Campos cubiertos: id_estudiante, id_convocatoria, emitido_por,
  //                       total_horas, periodo_desde, periodo_hasta,
  //                       descripcion, nombre_aliado, nombre_convocatoria,
  //                       url_pdf, emitido_en, esta_vigente
  //     Campo opcional no seteado: motivo_anulacion
  //     codigo_verificacion: @default(uuid()) — generado automáticamente
  //     Solo se emite si el estudiante alcanzó el 100% de avance
  // ───────────────────────────────────────────────────────────────────────────
  console.log('\n📜 Emitiendo certificado de Estudiante 1...');

  if (porcentajeAvance >= 100) {
    const certExistente = await prisma.certificado.findFirst({
      where: { id_estudiante: estudiante1.id, id_convocatoria: convC1.id },
    });

    if (!certExistente) {
      await prisma.certificado.create({
        data: {
          id_estudiante: estudiante1.id,
          id_convocatoria: convC1.id,
          emitido_por: admin.id,
          total_horas: totalHorasAprobadas,
          periodo_desde: convC1.fecha_inicio,
          periodo_hasta: convC1.fecha_fin ?? hace30d,
          descripcion: `Certificado de cumplimiento de ${totalHorasAprobadas} horas de servicio social en el programa de ${convC1.titulo}.`,
          nombre_aliado: 'Dirección de Servicio Social UCP',
          nombre_convocatoria: convC1.titulo,
          url_pdf: `/certificados/${slugify(convC1.titulo)}_${estudiante1.id}.pdf`,
          emitido_en: new Date(hace30d.getTime() + 2 * 86_400_000),
          esta_vigente: true,
        },
      });
      console.log(`  ✅ Certificado emitido: ${totalHorasAprobadas} h — ${convC1.titulo}`);
    } else {
      console.log(`  ⏭️  Certificado ya existe para: ${estudiante1.correo}`);
    }
  } else {
    console.log(
      `  ⚠️  Certificado NO emitido: Estudiante 1 solo tiene ${porcentajeAvance}%` +
      ' (requiere 100%).',
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 11. NOTICIAS
  //     Modelo: Noticia → tabla "noticias"
  //             ImagenNoticia → tabla "imagenes_noticias"
  //     Campos Noticia: titulo, slug (generado via slugify), resumen, contenido,
  //                     autor, publicada, fecha_publicacion
  //     Campos ImagenNoticia: id_noticia, url_imagen, public_id_cloudinary, orden
  // ───────────────────────────────────────────────────────────────────────────
  console.log('\n📰 Creando noticias institucionales...');

  const noticiasData = [
    {
      titulo: 'Taller de Sensibilización Social 2025',
      resumen: 'Metodologías de intervención social para maximizar el impacto comunitario de los estudiantes.',
      contenido:
        'Taller dirigido a estudiantes que buscan profundizar en las realidades sociales locales.\n' +
        'Incluye módulos de diagnóstico participativo, comunicación intercultural y evaluación de impacto.',
      autor: 'Dirección de Servicio Social',
      publicada: true,
      fecha_publicacion: new Date('2025-03-10'),
      imagenes: [
        {
          url_imagen: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&auto=format&fit=crop&q=60',
          public_id_cloudinary: 'noticia_taller_sensibilizacion_1',
          orden: 0,
        },
      ],
    },
    {
      titulo: "Programa 'UCP en tu Barrio'",
      resumen: 'Inscripciones abiertas para alfabetización digital en sectores vulnerables de Pereira.',
      contenido:
        'Convocatoria de voluntariado estudiantil para cerrar la brecha digital en comunidades vulnerables.\n' +
        'Incluye talleres prácticos semanales y acompañamiento comunitario continuo.',
      autor: 'Coordinación de Proyectos Sociales',
      publicada: true,
      fecha_publicacion: new Date('2025-03-08'),
      imagenes: [
        {
          url_imagen: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60',
          public_id_cloudinary: 'noticia_ucp_barrio_1',
          orden: 0,
        },
      ],
    },
    {
      titulo: 'Gala de Premios a la Excelencia en Servicio Social',
      resumen: 'Reconocimiento al compromiso y liderazgo estudiantil en proyectos de impacto social.',
      contenido:
        'Ceremonia anual de premiación para destacar proyectos de impacto comunitario, liderazgo y compromiso social\n' +
        'de los estudiantes UCP durante el semestre. Se entregarán reconocimientos a las mejores iniciativas.',
      autor: 'Comité de Servicio Social UCP',
      publicada: true,
      fecha_publicacion: new Date('2025-03-05'),
      imagenes: [
        {
          url_imagen: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&auto=format&fit=crop&q=60',
          public_id_cloudinary: 'noticia_gala_premios_1',
          orden: 0,
        },
      ],
    },
  ];

  for (const noticiaData of noticiasData) {
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

    // Siempre recrear imágenes para mantener consistencia en re-runs
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

    console.log(`  ✅ ${noticia.titulo}`);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 12. PLANTILLAS DE NOTIFICACIÓN
  //     Delegado a seedNotificaciones(prisma)
  //     Cubre: PlantillaNotificacion, y opcionalmente NotificacionMasiva
  //            e HistorialEnvioNotif si el helper los crea
  // ───────────────────────────────────────────────────────────────────────────
  await seedNotificaciones(prisma);

  // ───────────────────────────────────────────────────────────────────────────
  // RESUMEN FINAL
  // ───────────────────────────────────────────────────────────────────────────
  const [
    cntFac,
    cntProg,
    cntCat,
    cntConv,
    cntAct,
    cntPost,
    cntReportes,
    cntCert,
    cntNoticias,
    cntUsuarios,
    cntEstudiantes,
    cntProfesores,
    cntAliados,
    cntAuxiliares,
    cntAdmins,
  ] = await Promise.all([
    prisma.facultad.count(),
    prisma.programa.count(),
    prisma.categoriaServicioSocial.count(),
    prisma.convocatoria.count(),
    prisma.actividad.count(),
    prisma.postulacion.count(),
    prisma.reporteHoras.count(),
    prisma.certificado.count(),
    prisma.noticia.count(),
    prisma.usuario.count(),
    prisma.usuario.count({ where: { rol: Rol.ESTUDIANTE } }),
    prisma.usuario.count({ where: { rol: Rol.PROFESOR } }),
    prisma.usuario.count({ where: { rol: Rol.ALIADO } }),
    prisma.usuario.count({ where: { rol: Rol.AUXILIAR } }),
    prisma.usuario.count({ where: { rol: Rol.ADMINISTRADOR } }),
  ]);

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('✨  Seeding UCP finalizado con éxito.');
  console.log('───────────────────────────────────────────────────────');
  console.log(`🏛️   Facultades:             ${cntFac}`);
  console.log(`🎓  Programas:              ${cntProg}`);
  console.log(`📁  Categorías:             ${cntCat}`);
  console.log(`📢  Convocatorias:          ${cntConv}`);
  console.log(`📋  Actividades:            ${cntAct}`);
  console.log(`📝  Postulaciones:          ${cntPost}`);
  console.log(`⏱️   Reportes de horas:      ${cntReportes}`);
  console.log(`📜  Certificados:           ${cntCert}`);
  console.log(`📰  Noticias:               ${cntNoticias}`);
  console.log('───────────────────────────────────────────────────────');
  console.log(`👥  Usuarios totales:       ${cntUsuarios}`);
  console.log(`👨‍💼  Administradores:        ${cntAdmins}   administrador@ucp.edu.co`);
  console.log(`👨‍🏫  Profesores:             ${cntProfesores}   profesor@ucp.edu.co`);
  console.log(`👨‍💼  Auxiliares:             ${cntAuxiliares}   auxiliar@ucp.edu.co`);
  console.log(`🤝  Aliados:                ${cntAliados}   aliado@ucp.edu.co`);
  console.log(`🎓  Estudiantes:            ${cntEstudiantes}   estudiante1@ucp.edu.co / estudiante2@ucp.edu.co`);
  console.log('───────────────────────────────────────────────────────');
  console.log('🔑  Contraseña por defecto (todos excepto admin): Ucpservicio123');
  console.log('🔑  Contraseña administrador:                     Android.13');
  console.log('───────────────────────────────────────────────────────');
  console.log('📊  Flujo Estudiante 1 (estudiante1@ucp.edu.co):');
  console.log(`     Convocatoria:    ${convC1.titulo}`);
  console.log(`     Horas aprobadas: ${totalHorasAprobadas} / ${horasRequeridas}`);
  console.log(`     Avance:          ${porcentajeAvance}%`);
  console.log(`     Certificado:     ${porcentajeAvance >= 100 ? '✅ Emitido' : '⏳ Pendiente'}`);
  console.log('📊  Flujo Estudiante 2 (estudiante2@ucp.edu.co):');
  console.log('     Sin inscripciones ni actividades — solo usuario en sistema.');
  console.log('═══════════════════════════════════════════════════════\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// BOOTSTRAP
// ─────────────────────────────────────────────────────────────────────────────

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('\n❌ Error durante el seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });