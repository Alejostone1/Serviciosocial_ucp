// ============================================================
// TIPOS PARA IMPORTACIÓN MASIVA DE USUARIOS
// Sistema Servicio Social UCP
// ============================================================

import { Rol, TipoDocumento, Modalidad } from '@prisma/client';

/**
 * Columnas de la plantilla Excel
 * Mapeo entre nombres de columnas en Excel y campos del modelo Prisma
 */
export const EXCEL_COLUMNS = {
  // Datos personales (obligatorios)
  PRIMER_NOMBRE: 'primer_nombre',
  PRIMER_APELLIDO: 'primer_apellido',
  
  // Datos personales (opcionales)
  SEGUNDO_NOMBRE: 'segundo_nombre',
  SEGUNDO_APELLIDO: 'segundo_apellido',
  
  // Identificación (obligatorio)
  TIPO_DOCUMENTO: 'tipo_documento',
  NUMERO_DOCUMENTO: 'numero_documento',
  
  // Contacto (obligatorio)
  CORREO: 'correo',
  CORREO_PERSONAL: 'correo_personal',
  TELEFONO: 'telefono',
  
  // Académico (obligatorio para estudiantes)
  ROL: 'rol',
  PROGRAMA_CODIGO: 'programa_codigo',
  SEMESTRE: 'semestre',
  CODIGO_ESTUDIANTIL: 'codigo_estudiantil',
  
  // Perfil estudiante (opcional)
  HABILIDADES: 'habilidades',
  INTERESES: 'intereses',
  MODALIDAD_PREFERIDA: 'modalidad_preferida',
} as const;

/**
 * Orden de columnas en la plantilla Excel
 */
export const EXCEL_COLUMN_ORDER = [
  EXCEL_COLUMNS.PRIMER_NOMBRE,
  EXCEL_COLUMNS.SEGUNDO_NOMBRE,
  EXCEL_COLUMNS.PRIMER_APELLIDO,
  EXCEL_COLUMNS.SEGUNDO_APELLIDO,
  EXCEL_COLUMNS.TIPO_DOCUMENTO,
  EXCEL_COLUMNS.NUMERO_DOCUMENTO,
  EXCEL_COLUMNS.CORREO,
  EXCEL_COLUMNS.CORREO_PERSONAL,
  EXCEL_COLUMNS.TELEFONO,
  EXCEL_COLUMNS.ROL,
  EXCEL_COLUMNS.PROGRAMA_CODIGO,
  EXCEL_COLUMNS.SEMESTRE,
  EXCEL_COLUMNS.CODIGO_ESTUDIANTIL,
  EXCEL_COLUMNS.HABILIDADES,
  EXCEL_COLUMNS.INTERESES,
  EXCEL_COLUMNS.MODALIDAD_PREFERIDA,
] as const;

/**
 * Definición de columnas para generación de Excel
 */
export const EXCEL_COLUMN_DEFINITIONS = [
  { header: 'Primer Nombre*', key: EXCEL_COLUMNS.PRIMER_NOMBRE, width: 20, required: true },
  { header: 'Segundo Nombre', key: EXCEL_COLUMNS.SEGUNDO_NOMBRE, width: 20, required: false },
  { header: 'Primer Apellido*', key: EXCEL_COLUMNS.PRIMER_APELLIDO, width: 20, required: true },
  { header: 'Segundo Apellido', key: EXCEL_COLUMNS.SEGUNDO_APELLIDO, width: 20, required: false },
  { header: 'Tipo Documento*', key: EXCEL_COLUMNS.TIPO_DOCUMENTO, width: 15, required: true },
  { header: 'Número Documento*', key: EXCEL_COLUMNS.NUMERO_DOCUMENTO, width: 18, required: true },
  { header: 'Correo Institucional*', key: EXCEL_COLUMNS.CORREO, width: 30, required: true },
  { header: 'Correo Personal', key: EXCEL_COLUMNS.CORREO_PERSONAL, width: 30, required: false },
  { header: 'Teléfono', key: EXCEL_COLUMNS.TELEFONO, width: 15, required: false },
  { header: 'Rol*', key: EXCEL_COLUMNS.ROL, width: 15, required: true },
  { header: 'Código Programa*', key: EXCEL_COLUMNS.PROGRAMA_CODIGO, width: 15, required: true },
  { header: 'Semestre', key: EXCEL_COLUMNS.SEMESTRE, width: 10, required: false },
  { header: 'Código Estudiantil', key: EXCEL_COLUMNS.CODIGO_ESTUDIANTIL, width: 15, required: false },
  { header: 'Habilidades (separadas por coma)', key: EXCEL_COLUMNS.HABILIDADES, width: 40, required: false },
  { header: 'Intereses (separados por coma)', key: EXCEL_COLUMNS.INTERESES, width: 40, required: false },
  { header: 'Modalidad Preferida', key: EXCEL_COLUMNS.MODALIDAD_PREFERIDA, width: 18, required: false },
] as const;

/**
 * Fila de ejemplo para la plantilla Excel
 */
export const EXCEL_EXAMPLE_ROW = {
  [EXCEL_COLUMNS.PRIMER_NOMBRE]: 'Juan',
  [EXCEL_COLUMNS.SEGUNDO_NOMBRE]: 'Carlos',
  [EXCEL_COLUMNS.PRIMER_APELLIDO]: 'Pérez',
  [EXCEL_COLUMNS.SEGUNDO_APELLIDO]: 'García',
  [EXCEL_COLUMNS.TIPO_DOCUMENTO]: 'CC',
  [EXCEL_COLUMNS.NUMERO_DOCUMENTO]: '123456789',
  [EXCEL_COLUMNS.CORREO]: 'juan.perez@ucp.edu.co',
  [EXCEL_COLUMNS.CORREO_PERSONAL]: 'juan.personal@gmail.com',
  [EXCEL_COLUMNS.TELEFONO]: '3001234567',
  [EXCEL_COLUMNS.ROL]: 'ESTUDIANTE',
  [EXCEL_COLUMNS.PROGRAMA_CODIGO]: 'ING-SIS',
  [EXCEL_COLUMNS.SEMESTRE]: '6',
  [EXCEL_COLUMNS.CODIGO_ESTUDIANTIL]: '202012345',
  [EXCEL_COLUMNS.HABILIDADES]: 'Programación, Diseño UX, Trabajo en equipo',
  [EXCEL_COLUMNS.INTERESES]: 'Desarrollo web, Inteligencia artificial',
  [EXCEL_COLUMNS.MODALIDAD_PREFERIDA]: 'HIBRIDA',
};

/**
 * Datos de un usuario parseados del Excel
 */
export interface ParsedUser {
  rowNumber: number;
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
  programa_codigo?: string;
  semestre?: number;
  codigo_estudiantil?: string;
  habilidades?: string[];
  intereses?: string[];
  modalidad_preferida?: Modalidad;
}

/**
 * Resultado de validación de una fila
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Error de validación específico
 */
export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

/**
 * Resultado de importación masiva
 */
export interface ImportResult {
  total: number;
  exitosos: number;
  fallidos: number;
  errores: ImportError[];
  usuariosCreados: string[];
}

/**
 * Error de importación por fila
 */
export interface ImportError {
  fila: number;
  numero_documento?: string;
  correo?: string;
  errores: string[];
}

/**
 * Opciones de configuración para la importación
 */
export interface ImportOptions {
  generarContrasena?: boolean;
  longitudContrasena?: number;
  requerirCambioClave?: boolean;
  crearPerfilEstudiante?: boolean;
  modoVistaPrevia?: boolean;
}
