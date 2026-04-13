// ============================================================
// SERVICIO DE IMPORTACIÓN MASIVA DE USUARIOS
// Sistema Servicio Social UCP
// Orquesta todo el proceso de carga masiva con validaciones robustas
// ============================================================

import { PrismaClient, Rol } from '@prisma/client';
import { SecurityManager } from '../security';
import { db } from '../prisma';
import { 
  ParsedUser, 
  ImportResult, 
  ImportError, 
  ImportOptions,
  EXCEL_COLUMNS 
} from '../types/user-import.types';
import { ExcelParserService } from './excel-parser.service';

/**
 * Servicio principal de importación masiva de usuarios
 */
export class UserImportService {
  /**
   * Importa usuarios desde un archivo Excel
   */
  static async importUsers(
    buffer: Buffer,
    options: ImportOptions = {}
  ): Promise<ImportResult> {
    const {
      generarContrasena = true,
      longitudContrasena = 12,
      requerirCambioClave = true,
      crearPerfilEstudiante = true,
      modoVistaPrevia = false,
    } = options;

    // Paso 1: Parsear Excel
    const parsedUsers = await ExcelParserService.parseExcelFile(buffer);

    // Paso 2: Validar estructura de datos
    const validationResults = ExcelParserService.validateBatch(parsedUsers);
    const invalidUsers = Array.from(validationResults.entries())
      .filter(([_, result]) => !result.isValid)
      .map(([rowNumber, result]) => ({
        fila: rowNumber,
        errores: result.errors.map(e => `${e.field}: ${e.message}`),
      }));

    if (invalidUsers.length > 0) {
      return {
        total: parsedUsers.length,
        exitosos: 0,
        fallidos: invalidUsers.length,
        errores: invalidUsers,
        usuariosCreados: [],
      };
    }

    // Paso 3: Detectar duplicados dentro del archivo
    const duplicates = ExcelParserService.detectDuplicates(parsedUsers);
    const duplicateErrors: ImportError[] = [];
    
    duplicates.forEach((rows, key) => {
      const [type, value] = key.split(':');
      rows.forEach(row => {
        duplicateErrors.push({
          fila: row,
          errores: [`Duplicado detectado: ${type} "${value}" aparece múltiples veces en el archivo`],
        });
      });
    });

    if (duplicateErrors.length > 0) {
      return {
        total: parsedUsers.length,
        exitosos: 0,
        fallidos: duplicateErrors.length,
        errores: duplicateErrors,
        usuariosCreados: [],
      };
    }

    // Paso 4: Validar contra base de datos (duplicados y referencias)
    const dbValidationErrors = await this.validateAgainstDatabase(parsedUsers);
    
    if (dbValidationErrors.length > 0) {
      return {
        total: parsedUsers.length,
        exitosos: 0,
        fallidos: dbValidationErrors.length,
        errores: dbValidationErrors,
        usuariosCreados: [],
      };
    }

    // Paso 5: Si es modo vista previa, retornar sin crear usuarios
    if (modoVistaPrevia) {
      return {
        total: parsedUsers.length,
        exitosos: parsedUsers.length,
        fallidos: 0,
        errores: [],
        usuariosCreados: parsedUsers.map(u => u.correo),
      };
    }

    // Paso 6: Crear usuarios en transacción
    try {
      const result = await db.transaction(async (prisma) => {
        const usuariosCreados: string[] = [];
        const errores: ImportError[] = [];

        for (const user of parsedUsers) {
          try {
            // Buscar programa por código
            const programa = await prisma.programa.findUnique({
              where: { codigo: user.programa_codigo },
            });

            if (!programa) {
              errores.push({
                fila: user.rowNumber,
                numero_documento: user.numero_documento,
                correo: user.correo,
                errores: [`Programa con código "${user.programa_codigo}" no encontrado`],
              });
              continue;
            }

            // Generar contraseña si es necesario
            let contrasena_hash: string | undefined;
            if (generarContrasena) {
              const contrasena = SecurityManager.generateSecureToken(longitudContrasena);
              const { hash } = await SecurityManager.hashPassword(contrasena);
              contrasena_hash = hash;
            }

            // Crear usuario
            const nuevoUsuario = await prisma.usuario.create({
              data: {
                primer_nombre: user.primer_nombre,
                segundo_nombre: user.segundo_nombre,
                primer_apellido: user.primer_apellido,
                segundo_apellido: user.segundo_apellido,
                tipo_documento: user.tipo_documento,
                numero_documento: user.numero_documento,
                correo: user.correo,
                correo_personal: user.correo_personal,
                telefono: user.telefono,
                contrasena_hash,
                rol: user.rol,
                id_programa: programa.id,
                estado: 'ACTIVO',
                requiere_cambio_clave: requerirCambioClave,
              },
            });

            // Crear perfil de estudiante si corresponde
            if (user.rol === Rol.ESTUDIANTE && crearPerfilEstudiante) {
              await prisma.perfilEstudiante.create({
                data: {
                  id_usuario: nuevoUsuario.id,
                  semestre_actual: user.semestre,
                  codigo_estudiantil: user.codigo_estudiantil,
                  habilidades: user.habilidades || [],
                  intereses: user.intereses || [],
                  modalidad_preferida: user.modalidad_preferida,
                  horas_previas: 0,
                  horas_acumuladas: 0,
                  porcentaje_avance: 0,
                },
              });
            }

            usuariosCreados.push(nuevoUsuario.correo);

          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            errores.push({
              fila: user.rowNumber,
              numero_documento: user.numero_documento,
              correo: user.correo,
              errores: [errorMessage],
            });
          }
        }

        return {
          total: parsedUsers.length,
          exitosos: usuariosCreados.length,
          fallidos: errores.length,
          errores,
          usuariosCreados,
        };
      });

      return result;

    } catch (error) {
      throw new Error(
        `Error en transacción de importación: ${error instanceof Error ? error.message : 'Error desconocido'}`
      );
    }
  }

  /**
   * Valida usuarios contra la base de datos (duplicados y referencias)
   */
  private static async validateAgainstDatabase(
    users: ParsedUser[]
  ): Promise<ImportError[]> {
    const errores: ImportError[] = [];

    // Extraer todos los correos y documentos para validar
    const correos = users.map(u => u.correo);
    const documentos = users.map(u => u.numero_documento);
    const codigosEstudiantil = users
      .map(u => u.codigo_estudiantil)
      .filter((c): c is string => c !== undefined);
    const codigosPrograma = Array.from(new Set(users.map(u => u.programa_codigo).filter((c): c is string => c !== undefined)));

    try {
      // Validar duplicados por correo
      const existingCorreos = await db.execute(async (prisma) => {
        return await prisma.usuario.findMany({
          where: {
            correo: { in: correos },
          },
          select: {
            correo: true,
          },
        });
      });

      const existingCorreoSet = new Set(existingCorreos.map(u => u.correo));
      users.forEach(user => {
        if (existingCorreoSet.has(user.correo)) {
          errores.push({
            fila: user.rowNumber,
            numero_documento: user.numero_documento,
            correo: user.correo,
            errores: ['El correo ya está registrado en el sistema'],
          });
        }
      });

      // Validar duplicados por documento
      const existingDocumentos = await db.execute(async (prisma) => {
        return await prisma.usuario.findMany({
          where: {
            numero_documento: { in: documentos },
          },
          select: {
            numero_documento: true,
          },
        });
      });

      const existingDocumentoSet = new Set(existingDocumentos.map(u => u.numero_documento));
      users.forEach(user => {
        if (existingDocumentoSet.has(user.numero_documento)) {
          errores.push({
            fila: user.rowNumber,
            numero_documento: user.numero_documento,
            correo: user.correo,
            errores: ['El número de documento ya está registrado en el sistema'],
          });
        }
      });

      // Validar duplicados por código estudiantil
      if (codigosEstudiantil.length > 0) {
        const existingCodigos = await db.execute(async (prisma) => {
          return await prisma.perfilEstudiante.findMany({
            where: {
              codigo_estudiantil: { in: codigosEstudiantil },
            },
            select: {
              codigo_estudiantil: true,
            },
          });
        });

        const existingCodigoSet = new Set(existingCodigos.map(u => u.codigo_estudiantil));
        users.forEach(user => {
          if (user.codigo_estudiantil && existingCodigoSet.has(user.codigo_estudiantil)) {
            errores.push({
              fila: user.rowNumber,
              numero_documento: user.numero_documento,
              correo: user.correo,
              errores: ['El código estudiantil ya está registrado en el sistema'],
            });
          }
        });
      }

      // Validar existencia de programas
      const existingProgramas = await db.execute(async (prisma) => {
        return await prisma.programa.findMany({
          where: {
            codigo: { in: codigosPrograma },
          },
          select: {
            codigo: true,
          },
        });
      });

      const existingProgramaSet = new Set(existingProgramas.map(p => p.codigo));
      users.forEach(user => {
        if (user.programa_codigo && !existingProgramaSet.has(user.programa_codigo)) {
          errores.push({
            fila: user.rowNumber,
            numero_documento: user.numero_documento,
            correo: user.correo,
            errores: [`El programa con código "${user.programa_codigo}" no existe en el sistema`],
          });
        }
      });

    } catch (error) {
      throw new Error(
        `Error al validar contra base de datos: ${error instanceof Error ? error.message : 'Error desconocido'}`
      );
    }

    return errores;
  }

  /**
   * Obtiene estadísticas de importación para dashboard
   */
  static async getImportStats() {
    const totalUsuarios = await db.execute(async (prisma) => {
      return await prisma.usuario.count();
    });

    const totalEstudiantes = await db.execute(async (prisma) => {
      return await prisma.usuario.count({
        where: { rol: Rol.ESTUDIANTE },
      });
    });

    const totalProgramas = await db.execute(async (prisma) => {
      return await prisma.programa.count();
    });

    return {
      totalUsuarios,
      totalEstudiantes,
      totalProgramas,
    };
  }
}
