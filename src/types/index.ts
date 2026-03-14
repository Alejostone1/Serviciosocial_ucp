// ============================================================
// TIPOS GLOBALES - SISTEMA DE SERVICIO SOCIAL UCP
// Refleja los modelos de Prisma y estructuras de la API
// ============================================================

// ── ENUMERACIONES ───────────────────────────────────────────

export type Rol = 'ADMINISTRADOR' | 'PROFESOR' | 'ALIADO' | 'AUXILIAR' | 'ESTUDIANTE';

export type TipoDocumento = 'CC' | 'TI' | 'CE' | 'PASAPORTE' | 'NIT';

export type NivelFormacion =
  | 'PREGRADO'
  | 'POSGRADO'
  | 'ESPECIALIZACION'
  | 'MAESTRIA'
  | 'DOCTORADO'
  | 'TECNICO'
  | 'TECNOLOGICO';

export type Modalidad = 'PRESENCIAL' | 'VIRTUAL' | 'HIBRIDA';

export type EstadoConvocatoria =
  | 'BORRADOR'
  | 'PUBLICADA'
  | 'EN_CURSO'
  | 'CERRADA'
  | 'CANCELADA';

export type EstadoPostulacion =
  | 'PENDIENTE'
  | 'EN_REVISION'
  | 'ACEPTADA'
  | 'RECHAZADA'
  | 'RETIRADA';

export type EstadoReporte =
  | 'REPORTADO'
  | 'PENDIENTE_VALIDACION'
  | 'EN_REVISION'
  | 'APROBADO'
  | 'RECHAZADO'
  | 'REQUIERE_AJUSTE';

export type EstadoVinculacion =
  | 'PENDIENTE'
  | 'APROBADA'
  | 'RECHAZADA'
  | 'SUSPENDIDA'
  | 'VENCIDA';

export type TipoActividad =
  | 'GENERAL'
  | 'CAPACITACION'
  | 'CAMPO'
  | 'ADMINISTRATIVA'
  | 'INVESTIGACION'
  | 'COMUNITARIA';

export type TipoNotificacion =
  | 'POSTULACION_RECIBIDA'
  | 'POSTULACION_ACEPTADA'
  | 'POSTULACION_RECHAZADA'
  | 'REPORTE_ENVIADO'
  | 'REPORTE_APROBADO'
  | 'REPORTE_RECHAZADO'
  | 'REPORTE_AJUSTE'
  | 'CERTIFICADO_EMITIDO'
  | 'CONVOCATORIA_PUBLICADA'
  | 'SISTEMA';

// ── ENTIDADES BASE ──────────────────────────────────────────

export interface Facultad {
  id: string;
  nombre: string;
  codigo?: string | null;
  descripcion?: string | null;
  decano?: string | null;
  correo_contacto?: string | null;
  telefono_ext?: string | null;
  esta_activo: boolean;
  creado_en: Date;
  actualizado_en: Date;
  programas?: Programa[];
}

export interface Programa {
  id: string;
  nombre: string;
  codigo?: string | null;
  id_facultad: string;
  nivel_formacion: NivelFormacion;
  horas_requeridas: number;
  esta_activo: boolean;
  creado_en: Date;
  actualizado_en: Date;
  facultad?: Facultad;
}

export interface Usuario {
  id: string;
  primer_nombre: string;
  segundo_nombre?: string | null;
  primer_apellido: string;
  segundo_apellido?: string | null;
  tipo_documento: TipoDocumento;
  numero_documento: string;
  correo: string;
  correo_personal?: string | null;
  telefono?: string | null;
  foto_url?: string | null;
  rol: Rol;
  id_programa?: string | null;
  esta_bloqueado: boolean;
  motivo_bloqueo?: string | null;
  ultimo_acceso?: Date | null;
  requiere_cambio_clave: boolean;
  creado_en: Date;
  actualizado_en: Date;
  // Relaciones opcionales
  programa?: Programa | null;
  perfil_estudiante?: PerfilEstudiante | null;
}

export interface PerfilEstudiante {
  id_usuario: string;
  semestre_actual?: number | null;
  codigo_estudiantil?: string | null;
  url_hoja_de_vida?: string | null;
  habilidades: string[];
  intereses: string[];
  disponibilidad?: DisponibilidadHoraria | null;
  modalidad_preferida?: Modalidad | null;
  horas_previas: number;
  horas_acumuladas: number;
  porcentaje_avance: number;
  creado_en: Date;
  actualizado_en: Date;
  usuario?: Usuario;
}

/** Estructura del JSON de disponibilidad horaria */
export interface DisponibilidadHoraria {
  lunes?: string[];
  martes?: string[];
  miercoles?: string[];
  jueves?: string[];
  viernes?: string[];
  sabado?: string[];
  domingo?: string[];
}

export interface CategoriaServicioSocial {
  id: string;
  nombre: string;
  descripcion?: string | null;
  icono?: string | null;
  color_hex?: string | null;
  esta_activa: boolean;
  creado_en: Date;
}

export interface Convocatoria {
  id: string;
  titulo: string;
  descripcion: string;
  objetivo?: string | null;
  id_categoria?: string | null;
  publicado_por: string;
  id_programa?: string | null;
  modalidad: Modalidad;
  lugar?: string | null;
  competencias_requeridas: string[];
  estado: EstadoConvocatoria;
  fecha_inicio: Date;
  fecha_fin?: Date | null;
  fecha_cierre_postulacion?: Date | null;
  cupo_maximo?: number | null;
  cupo_disponible?: number | null;
  horas_totales_ofrecidas?: number | null;
  url_banner?: string | null;
  requiere_entrevista: boolean;
  creado_en: Date;
  actualizado_en: Date;
  publicado_en?: Date | null;
  // Relaciones opcionales
  categoria?: CategoriaServicioSocial | null;
  programa?: Programa | null;
  publicador?: Usuario;
  postulaciones?: Postulacion[];
  actividades?: Actividad[];
}

export interface Postulacion {
  id: string;
  id_convocatoria: string;
  id_estudiante: string;
  estado: EstadoPostulacion;
  motivacion?: string | null;
  url_hoja_vida?: string | null;
  habilidades_relevantes: string[];
  postulado_en: Date;
  revisado_en?: Date | null;
  revisado_por?: string | null;
  notas_revision?: string | null;
  fecha_entrevista?: Date | null;
  // Relaciones opcionales
  convocatoria?: Convocatoria;
  estudiante?: Usuario;
  revisor?: Usuario | null;
}

export interface Actividad {
  id: string;
  id_convocatoria: string;
  nombre: string;
  descripcion?: string | null;
  tipo_actividad: TipoActividad;
  horas_estimadas: number;
  horas_maximas?: number | null;
  fecha_inicio?: Date | null;
  fecha_limite?: Date | null;
  ubicacion?: string | null;
  materiales_requeridos: string[];
  esta_activa: boolean;
  creado_por: string;
  creado_en: Date;
  actualizado_en: Date;
  convocatoria?: Convocatoria;
  creador?: Usuario;
}

export interface ReporteHoras {
  id: string;
  id_estudiante: string;
  id_actividad: string;
  horas_reportadas: number;
  horas_aprobadas?: number | null;
  estado: EstadoReporte;
  descripcion_trabajo?: string | null;
  archivos_soporte?: ArchivoSoporte[] | null;
  notas_estudiante?: string | null;
  id_revisor?: string | null;
  notas_revisor?: string | null;
  motivo_rechazo?: string | null;
  reportado_en: Date;
  revisado_en?: Date | null;
  // Relaciones opcionales
  actividad?: Actividad;
  estudiante?: Usuario;
  revisor?: Usuario | null;
}

/** Estructura de cada archivo adjunto en un reporte */
export interface ArchivoSoporte {
  nombre: string;
  url: string;
  tipo: string;          // MIME type: image/jpeg, application/pdf, etc.
  tamanio_bytes: number;
}

export interface Certificado {
  id: string;
  id_estudiante: string;
  id_convocatoria?: string | null;
  emitido_por: string;
  total_horas: number;
  periodo_desde?: Date | null;
  periodo_hasta?: Date | null;
  codigo_verificacion: string;
  url_pdf: string;
  descripcion?: string | null;
  nombre_aliado?: string | null;
  nombre_convocatoria?: string | null;
  emitido_en: Date;
  esta_vigente: boolean;
  motivo_anulacion?: string | null;
  // Relaciones opcionales
  estudiante?: Usuario;
  emisor?: Usuario;
  convocatoria?: Convocatoria | null;
}

export interface VinculacionAliado {
  id: string;
  id_aliado: string;
  id_programa: string;
  aprobado_por?: string | null;
  estado: EstadoVinculacion;
  documento_convenio?: string | null;
  numero_convenio?: string | null;
  fecha_inicio_convenio?: Date | null;
  fecha_fin_convenio?: Date | null;
  observaciones?: string | null;
  creado_en: Date;
  revisado_en?: Date | null;
  aliado?: Usuario;
  programa?: Programa;
}

export interface Notificacion {
  id: string;
  id_usuario: string;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  url_accion?: string | null;
  leida: boolean;
  leida_en?: Date | null;
  creado_en: Date;
}

// ── TIPOS DE API ────────────────────────────────────────────

/** Respuesta estándar de la API */
export interface ApiRespuesta<T = unknown> {
  exito: boolean;
  datos?: T;
  mensaje?: string;
  errores?: string[];
}

/** Respuesta paginada */
export interface ApiRespuestaPaginada<T> extends ApiRespuesta<T[]> {
  total: number;
  pagina: number;
  limite: number;
  total_paginas: number;
}

/** Parámetros de paginación */
export interface ParametrosPaginacion {
  pagina?: number;
  limite?: number;
  busqueda?: string;
  orden?: string;
  direccion?: 'asc' | 'desc';
}

// ── TIPOS DE FORMULARIOS ────────────────────────────────────

export interface FormularioLogin {
  correo: string;
  contrasena: string;
}

export interface FormularioUsuario {
  primer_nombre: string;
  segundo_nombre?: string;
  primer_apellido: string;
  segundo_apellido?: string;
  tipo_documento: TipoDocumento;
  numero_documento: string;
  correo: string;
  correo_personal?: string;
  telefono?: string;
  rol: Rol;
  id_programa?: string;
}

export interface FormularioConvocatoria {
  titulo: string;
  descripcion: string;
  objetivo?: string;
  id_categoria?: string;
  id_programa?: string;
  modalidad: Modalidad;
  lugar?: string;
  competencias_requeridas: string[];
  fecha_inicio: string;
  fecha_fin?: string;
  fecha_cierre_postulacion?: string;
  cupo_maximo?: number;
  horas_totales_ofrecidas?: number;
  requiere_entrevista: boolean;
}

export interface FormularioReporteHoras {
  id_actividad: string;
  horas_reportadas: number;
  descripcion_trabajo: string;
  notas_estudiante?: string;
  archivos_soporte?: File[];
}

// ── TIPOS DEL DASHBOARD ─────────────────────────────────────

export interface EstadisticasDashboard {
  total_estudiantes: number;
  total_convocatorias_activas: number;
  total_horas_aprobadas: number;
  total_certificados_emitidos: number;
  postulaciones_pendientes: number;
  reportes_pendientes: number;
}

export interface ResumenAvanceEstudiante {
  id: string;
  nombre_completo: string;
  numero_documento: string;
  correo: string;
  programa: string;
  facultad: string;
  horas_previas: number;
  horas_acumuladas: number;
  horas_requeridas: number;
  porcentaje_avance: number;
  codigo_estudiantil?: string | null;
  semestre_actual?: number | null;
}