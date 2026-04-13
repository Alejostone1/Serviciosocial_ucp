// ============================================================
// SERVICIO DE PARSER DE EXCEL
// Sistema Servicio Social UCP
// Lee y transforma archivos Excel a formato Prisma
// ============================================================

import ExcelJS from 'exceljs';
import { Rol, TipoDocumento, Modalidad } from '@prisma/client';
import { 
  ParsedUser, 
  ValidationResult, 
  ValidationError,
  EXCEL_COLUMNS,
  EXCEL_COLUMN_DEFINITIONS 
} from '../types/user-import.types';
import { validators } from '../security';

/**
 * Servicio para parsear archivos Excel de importación de usuarios
 */
export class ExcelParserService {
  /**
   * Lee un archivo Excel y extrae los datos de usuarios
   */
  static async parseExcelFile(buffer: Buffer): Promise<ParsedUser[]> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as any);

    const worksheet = workbook.getWorksheet('Usuarios');
    if (!worksheet) {
      throw new Error('No se encontró la hoja "Usuarios" en el archivo Excel');
    }

    const users: ParsedUser[] = [];
    const headerRow = worksheet.getRow(1);
    
    // Mapear índices de columnas a nombres de campos
    const columnMap = new Map<string, string>();
    headerRow.eachCell((cell, colNumber) => {
      const header = cell.value?.toString()?.trim().toLowerCase().replace(/\*/g, '');
      if (!header) return;
      // Buscar coincidencia con definiciones de columnas
      for (const def of EXCEL_COLUMN_DEFINITIONS) {
        const defHeader = def.header.toLowerCase().replace(/\*/g, '');
        if (header === defHeader || header.includes(def.key.toLowerCase())) {
          columnMap.set(colNumber.toString(), def.key);
          break;
        }
      }
    });

    // Verificar columnas obligatorias
    const requiredColumns = EXCEL_COLUMN_DEFINITIONS
      .filter(col => col.required)
      .map(col => col.key);
    
    const missingColumns = requiredColumns.filter(col => 
      !Array.from(columnMap.values()).includes(col)
    );

    if (missingColumns.length > 0) {
      throw new Error(
        `Faltan columnas obligatorias en el archivo Excel: ${missingColumns.join(', ')}`
      );
    }

    // Leer filas de datos (empezando desde fila 2)
    let rowNumber = 2;
    for (rowNumber; rowNumber <= worksheet.rowCount; rowNumber++) {
      const row = worksheet.getRow(rowNumber);
      
      // Saltar filas vacías
      if (this.isEmptyRow(row, columnMap)) {
        continue;
      }

      try {
        const user = this.parseRow(row, columnMap, rowNumber);
        users.push(user);
      } catch (error) {
        throw new Error(
          `Error en fila ${rowNumber}: ${error instanceof Error ? error.message : 'Error desconocido'}`
        );
      }
    }

    return users;
  }

  /**
   * Verifica si una fila está vacía
   */
  private static isEmptyRow(
    row: ExcelJS.Row, 
    columnMap: Map<string, string>
  ): boolean {
    let hasData = false;
    columnMap.forEach((fieldName, colIndex) => {
      const cell = row.getCell(parseInt(colIndex));
      const value = cell.value?.toString().trim();
      if (value && value !== '') {
        hasData = true;
      }
    });
    return !hasData;
  }

  /**
   * Parsea una fila individual del Excel
   */
  private static parseRow(
    row: ExcelJS.Row, 
    columnMap: Map<string, string>,
    rowNumber: number
  ): ParsedUser {
    const getCellValue = (fieldName: string): string | undefined => {
      for (const [colIndex, mappedField] of Array.from(columnMap.entries())) {
        if (mappedField === fieldName) {
          const cell = row.getCell(parseInt(colIndex));
          const value = cell.value;
          if (value === null || value === undefined) return undefined;
          return value.toString().trim();
        }
      }
      return undefined;
    };

    const primer_nombre = getCellValue(EXCEL_COLUMNS.PRIMER_NOMBRE);
    const primer_apellido = getCellValue(EXCEL_COLUMNS.PRIMER_APELLIDO);
    const tipo_documento = getCellValue(EXCEL_COLUMNS.TIPO_DOCUMENTO);
    const numero_documento = getCellValue(EXCEL_COLUMNS.NUMERO_DOCUMENTO);
    const correo = getCellValue(EXCEL_COLUMNS.CORREO);
    const rol = getCellValue(EXCEL_COLUMNS.ROL);
    const programa_codigo = getCellValue(EXCEL_COLUMNS.PROGRAMA_CODIGO);

    // Validaciones básicas
    if (!primer_nombre) throw new Error('El campo Primer Nombre es obligatorio');
    if (!primer_apellido) throw new Error('El campo Primer Apellido es obligatorio');
    if (!tipo_documento) throw new Error('El campo Tipo Documento es obligatorio');
    if (!numero_documento) throw new Error('El campo Número Documento es obligatorio');
    if (!correo) throw new Error('El campo Correo es obligatorio');
    if (!rol) throw new Error('El campo Rol es obligatorio');
    if (!programa_codigo) throw new Error('El campo Código Programa es obligatorio');

    // Validar enums
    if (!Object.values(TipoDocumento).includes(tipo_documento.toUpperCase() as TipoDocumento)) {
      throw new Error(`Tipo de documento inválido: ${tipo_documento}. Valores válidos: ${Object.values(TipoDocumento).join(', ')}`);
    }

    if (!Object.values(Rol).includes(rol.toUpperCase() as Rol)) {
      throw new Error(`Rol inválido: ${rol}. Valores válidos: ${Object.values(Rol).join(', ')}`);
    }

    // Parsear campos opcionales
    const segundo_nombre = getCellValue(EXCEL_COLUMNS.SEGUNDO_NOMBRE);
    const segundo_apellido = getCellValue(EXCEL_COLUMNS.SEGUNDO_APELLIDO);
    const correo_personal = getCellValue(EXCEL_COLUMNS.CORREO_PERSONAL);
    const telefono = getCellValue(EXCEL_COLUMNS.TELEFONO);
    const semestreStr = getCellValue(EXCEL_COLUMNS.SEMESTRE);
    const codigo_estudiantil = getCellValue(EXCEL_COLUMNS.CODIGO_ESTUDIANTIL);
    const habilidadesStr = getCellValue(EXCEL_COLUMNS.HABILIDADES);
    const interesesStr = getCellValue(EXCEL_COLUMNS.INTERESES);
    const modalidadStr = getCellValue(EXCEL_COLUMNS.MODALIDAD_PREFERIDA);

    // Parsear semestre
    let semestre: number | undefined;
    if (semestreStr) {
      semestre = parseInt(semestreStr, 10);
      if (isNaN(semestre) || semestre < 1 || semestre > 10) {
        throw new Error(`Semestre inválido: ${semestreStr}. Debe ser un número entre 1 y 10`);
      }
    }

    // Parsear habilidades e intereses (separados por coma)
    const habilidades = habilidadesStr 
      ? habilidadesStr.split(',').map(h => h.trim()).filter(h => h)
      : undefined;
    
    const intereses = interesesStr 
      ? interesesStr.split(',').map(i => i.trim()).filter(i => i)
      : undefined;

    // Parsear modalidad
    let modalidad_preferida: Modalidad | undefined;
    if (modalidadStr) {
      if (!Object.values(Modalidad).includes(modalidadStr.toUpperCase() as Modalidad)) {
        throw new Error(`Modalidad inválida: ${modalidadStr}. Valores válidos: ${Object.values(Modalidad).join(', ')}`);
      }
      modalidad_preferida = modalidadStr.toUpperCase() as Modalidad;
    }

    return {
      rowNumber,
      primer_nombre,
      segundo_nombre,
      primer_apellido,
      segundo_apellido,
      tipo_documento: tipo_documento.toUpperCase() as TipoDocumento,
      numero_documento,
      correo: correo.toLowerCase(),
      correo_personal: correo_personal?.toLowerCase(),
      telefono,
      rol: rol.toUpperCase() as Rol,
      programa_codigo,
      semestre,
      codigo_estudiantil,
      habilidades,
      intereses,
      modalidad_preferida,
    };
  }

  /**
   * Valida un usuario parseado
   */
  static validateUser(user: ParsedUser): ValidationResult {
    const errors: ValidationError[] = [];

    // Validar formato de email
    if (!validators.isValidEmail(user.correo)) {
      errors.push({
        field: EXCEL_COLUMNS.CORREO,
        message: 'Formato de correo inválido',
        severity: 'error',
      });
    }

    // Validar correo personal si está presente
    if (user.correo_personal && !validators.isValidEmail(user.correo_personal)) {
      errors.push({
        field: EXCEL_COLUMNS.CORREO_PERSONAL,
        message: 'Formato de correo personal inválido',
        severity: 'warning',
      });
    }

    // Validar longitud de campos
    if (user.primer_nombre.length > 80) {
      errors.push({
        field: EXCEL_COLUMNS.PRIMER_NOMBRE,
        message: 'El primer nombre no puede exceder 80 caracteres',
        severity: 'error',
      });
    }

    if (user.primer_apellido.length > 80) {
      errors.push({
        field: EXCEL_COLUMNS.PRIMER_APELLIDO,
        message: 'El primer apellido no puede exceder 80 caracteres',
        severity: 'error',
      });
    }

    if (user.numero_documento.length > 20) {
      errors.push({
        field: EXCEL_COLUMNS.NUMERO_DOCUMENTO,
        message: 'El número de documento no puede exceder 20 caracteres',
        severity: 'error',
      });
    }

    // Validar semestre solo para estudiantes
    if (user.rol === Rol.ESTUDIANTE && !user.semestre) {
      errors.push({
        field: EXCEL_COLUMNS.SEMESTRE,
        message: 'El semestre es obligatorio para estudiantes',
        severity: 'error',
      });
    }

    // Validar código estudiantil uniqueness (formato)
    if (user.codigo_estudiantil && user.codigo_estudiantil.length > 30) {
      errors.push({
        field: EXCEL_COLUMNS.CODIGO_ESTUDIANTIL,
        message: 'El código estudiantil no puede exceder 30 caracteres',
        severity: 'error',
      });
    }

    return {
      isValid: errors.filter(e => e.severity === 'error').length === 0,
      errors,
    };
  }

  /**
   * Valida un lote de usuarios
   */
  static validateBatch(users: ParsedUser[]): Map<number, ValidationResult> {
    const results = new Map<number, ValidationResult>();

    for (const user of users) {
      const validation = this.validateUser(user);
      results.set(user.rowNumber, validation);
    }

    return results;
  }

  /**
   * Detecta duplicados dentro del lote
   */
  static detectDuplicates(users: ParsedUser[]): Map<string, number[]> {
    const correoMap = new Map<string, number[]>();
    const documentoMap = new Map<string, number[]>();
    const codigoEstudiantilMap = new Map<string, number[]>();

    for (const user of users) {
      // Duplicados por correo
      if (correoMap.has(user.correo)) {
        correoMap.get(user.correo)!.push(user.rowNumber);
      } else {
        correoMap.set(user.correo, [user.rowNumber]);
      }

      // Duplicados por documento
      if (documentoMap.has(user.numero_documento)) {
        documentoMap.get(user.numero_documento)!.push(user.rowNumber);
      } else {
        documentoMap.set(user.numero_documento, [user.rowNumber]);
      }

      // Duplicados por código estudiantil
      if (user.codigo_estudiantil) {
        if (codigoEstudiantilMap.has(user.codigo_estudiantil)) {
          codigoEstudiantilMap.get(user.codigo_estudiantil)!.push(user.rowNumber);
        } else {
          codigoEstudiantilMap.set(user.codigo_estudiantil, [user.rowNumber]);
        }
      }
    }

    // Filtrar solo los que tienen duplicados
    const duplicates = new Map<string, number[]>();
    
    correoMap.forEach((rows, correo) => {
      if (rows.length > 1) {
        duplicates.set(`CORREO:${correo}`, rows);
      }
    });

    documentoMap.forEach((rows, doc) => {
      if (rows.length > 1) {
        duplicates.set(`DOCUMENTO:${doc}`, rows);
      }
    });

    codigoEstudiantilMap.forEach((rows, codigo) => {
      if (rows.length > 1) {
        duplicates.set(`CODIGO_ESTUDIANTIL:${codigo}`, rows);
      }
    });

    return duplicates;
  }
}
