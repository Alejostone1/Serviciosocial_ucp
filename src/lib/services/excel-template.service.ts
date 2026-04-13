// ============================================================
// SERVICIO DE GENERACIÓN DE PLANTILLA EXCEL
// Sistema Servicio Social UCP
// Genera plantillas descargables para carga masiva de usuarios
// ============================================================

import ExcelJS from 'exceljs';
import { 
  EXCEL_COLUMN_DEFINITIONS, 
  EXCEL_EXAMPLE_ROW, 
  EXCEL_COLUMNS 
} from '../types/user-import.types';
import { createUCPExcelReport } from '../excel-utils';

/**
 * Servicio para generar plantillas Excel de importación
 */
export class ExcelTemplateService {
  /**
   * Genera una plantilla Excel vacía con encabezados y ejemplo
   */
  static async generateTemplate(): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Usuarios');

    // Definir columnas
    worksheet.columns = EXCEL_COLUMN_DEFINITIONS.map(col => ({
      header: col.header,
      key: col.key,
      width: col.width,
    }));

    // Estilo de encabezados (UCP Red #8B1E1E)
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF8B1E1E' }
      };
      cell.font = {
        name: 'Arial',
        color: { argb: 'FFFFFFFF' },
        bold: true,
        size: 11
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
    headerRow.height = 30;

    // Fila de ejemplo con datos de muestra
    const exampleRow = worksheet.addRow(EXCEL_EXAMPLE_ROW);
    exampleRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF0F0F0' }
      };
      cell.font = {
        name: 'Arial',
        color: { argb: 'FF333333' },
        size: 10
      };
      cell.alignment = { vertical: 'middle', horizontal: 'left' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
    exampleRow.height = 25;

    // Añadir hoja de instrucciones
    const instructionsSheet = workbook.addWorksheet('Instrucciones');
    this.addInstructionsSheet(instructionsSheet);

    // Añadir hoja de valores válidos
    const valuesSheet = workbook.addWorksheet('Valores Válidos');
    this.addValidValuesSheet(valuesSheet);

    // Proteger la hoja de usuarios (solo permitir edición en filas de datos)
    worksheet.protect('UCP2024', {
      selectLockedCells: false,
      selectUnlockedCells: true,
    });

    // Desbloquear celdas de datos (excepto encabezados)
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.eachCell((cell) => {
          cell.protection = { locked: false };
        });
      }
    });

    // Generar buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /**
   * Añade hoja de instrucciones a la plantilla
   */
  private static addInstructionsSheet(worksheet: ExcelJS.Worksheet): void {
    worksheet.columns = [
      { header: 'Sección', key: 'section', width: 30 },
      { header: 'Instrucción', key: 'instruction', width: 80 },
    ];

    const instructions = [
      {
        section: '📋 INFORMACIÓN GENERAL',
        instruction: 'Esta plantilla permite cargar usuarios masivamente al sistema de Servicio Social UCP.',
      },
      {
        section: '⚠️ IMPORTANTE',
        instruction: 'Los campos marcados con * son OBLIGATORIOS. El archivo no se procesará si faltan datos obligatorios.',
      },
      {
        section: '📧 CORREO ELECTRÓNICO',
        instruction: 'Use correos institucionales para estudiantes (ej: nombre@ucp.edu.co). Debe ser único.',
      },
      {
        section: '🆔 DOCUMENTO',
        instruction: 'El número de documento debe ser único. No se permiten duplicados en el sistema.',
      },
      {
        section: '🎓 ROL',
        instruction: 'Valores permitidos: ESTUDIANTE, PROFESOR, ADMINISTRADOR, ALIADO, AUXILIAR.',
      },
      {
        section: '📚 PROGRAMA',
        instruction: 'Use el CÓDIGO del programa (ej: ING-SIS), no el nombre. Debe existir en el sistema.',
      },
      {
        section: '🔐 CONTRASEÑA',
        instruction: 'Se generará automáticamente una contraseña temporal para cada usuario creado.',
      },
      {
        section: '📊 SEMESTRE',
        instruction: 'Solo para estudiantes. Valor numérico entre 1 y 10.',
      },
      {
        section: '💼 HABILIDADES/INTERESES',
        instruction: 'Separe múltiples valores con comas (ej: Programación, Diseño, Liderazgo).',
      },
      {
        section: '🏢 MODALIDAD',
        instruction: 'Valores permitidos: PRESENCIAL, VIRTUAL, HIBRIDA.',
      },
      {
        section: '✅ VALIDACIONES',
        instruction: 'El sistema validará: formato de email, duplicados, existencia de programa, valores de enums.',
      },
      {
        section: '📤 RESULTADO',
        instruction: 'Recibirá un reporte con usuarios exitosos y fallidos con detalles de errores.',
      },
    ];

    instructions.forEach((inst) => {
      worksheet.addRow(inst);
    });

    // Estilo de encabezados
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF8B1E1E' }
      };
      cell.font = { name: 'Arial', color: { argb: 'FFFFFFFF' }, bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });
    headerRow.height = 30;

    // Estilo de filas
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.eachCell((cell) => {
          cell.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
        row.height = 60;
      }
    });
  }

  /**
   * Añade hoja de valores válidos para enums y referencias
   */
  private static addValidValuesSheet(worksheet: ExcelJS.Worksheet): void {
    worksheet.columns = [
      { header: 'Campo', key: 'field', width: 25 },
      { header: 'Valores Permitidos', key: 'values', width: 60 },
      { header: 'Descripción', key: 'description', width: 40 },
    ];

    const validValues = [
      {
        field: 'tipo_documento',
        values: 'CC, TI, CE, PASAPORTE, NIT',
        description: 'Tipo de documento de identidad',
      },
      {
        field: 'rol',
        values: 'ESTUDIANTE, PROFESOR, ADMINISTRADOR, ALIADO, AUXILIAR',
        description: 'Rol del usuario en el sistema',
      },
      {
        field: 'modalidad_preferida',
        values: 'PRESENCIAL, VIRTUAL, HIBRIDA',
        description: 'Modalidad de trabajo preferida (solo estudiantes)',
      },
      {
        field: 'programa_codigo',
        values: 'Consultar con administrador',
        description: 'Código del programa académico (debe existir en BD)',
      },
      {
        field: 'semestre',
        values: '1-10',
        description: 'Número de semestre actual (solo estudiantes)',
      },
    ];

    validValues.forEach((value) => {
      worksheet.addRow(value);
    });

    // Estilo de encabezados
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF8B1E1E' }
      };
      cell.font = { name: 'Arial', color: { argb: 'FFFFFFFF' }, bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });
    headerRow.height = 30;

    // Estilo de filas
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.eachCell((cell) => {
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
        row.height = 25;
      }
    });
  }

  /**
   * Genera un reporte Excel con resultados de importación
   */
  static async generateImportReport(results: any[]): Promise<Buffer> {
    const columns = [
      { header: 'Fila', key: 'fila', width: 10 },
      { header: 'Estado', key: 'estado', width: 15 },
      { header: 'Documento', key: 'documento', width: 18 },
      { header: 'Nombre', key: 'nombre', width: 30 },
      { header: 'Correo', key: 'correo', width: 30 },
      { header: 'Errores', key: 'errores', width: 50 },
    ];

    return await createUCPExcelReport('Reporte Importación', columns, results);
  }
}
