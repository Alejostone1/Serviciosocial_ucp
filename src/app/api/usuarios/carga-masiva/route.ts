// ============================================================
// ENDPOINT DE CARGA MASIVA DE USUARIOS
// Sistema Servicio Social UCP
// API para importar usuarios desde archivos Excel
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { UserImportService } from '@/lib/services/user-import.service';
import { ExcelTemplateService } from '@/lib/services/excel-template.service';
import { SECURITY_CONFIG } from '@/lib/security';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * GET - Descargar plantilla Excel
 */
export async function GET(request: NextRequest) {
  console.log('📥 GET /api/usuarios/carga-masiva - Descargar plantilla');
  try {
    // Verificar autenticación y autorización
    const session = await getServerSession(authOptions);
    console.log('📥 Session:', session?.user?.role, session?.user?.email);
    
    if (!session?.user) {
      console.error('📥 No autenticado');
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Solo administradores pueden descargar la plantilla
    if (session.user.role !== 'ADMINISTRADOR') {
      console.error('📥 No es administrador:', session.user.role);
      return NextResponse.json(
        { error: 'Solo administradores pueden descargar la plantilla' },
        { status: 403 }
      );
    }

    console.log('📥 Generando plantilla...');
    // Generar plantilla Excel
    const buffer = await ExcelTemplateService.generateTemplate();
    console.log('📥 Plantilla generada, size:', buffer.length);

    // Retornar archivo Excel
    return new NextResponse(buffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="plantilla_usuarios_ucp.xlsx"',
        'Content-Length': buffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('📥 Error al generar plantilla:', error);
    return NextResponse.json(
      { error: 'Error al generar plantilla de Excel' },
      { status: 500 }
    );
  }
}

/**
 * POST - Importar usuarios desde archivo Excel
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación y autorización
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Solo administradores pueden importar usuarios
    if (session.user.role !== 'ADMINISTRADOR') {
      return NextResponse.json(
        { error: 'Solo administradores pueden importar usuarios' },
        { status: 403 }
      );
    }

    // Obtener datos del formulario
    const formData = await request.formData();
    const file = formData.get('archivo') as File;
    const modoVistaPrevia = formData.get('modoVistaPrevia') === 'true';
    const generarContrasena = formData.get('generarContrasena') !== 'false';
    const requerirCambioClave = formData.get('requerirCambioClave') !== 'false';
    const crearPerfilEstudiante = formData.get('crearPerfilEstudiante') !== 'false';

    // Validar que se haya enviado un archivo
    if (!file) {
      return NextResponse.json(
        { error: 'No se ha enviado ningún archivo' },
        { status: 400 }
      );
    }

    // Validar tipo de archivo
    if (
      file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' &&
      file.type !== 'application/vnd.ms-excel'
    ) {
      return NextResponse.json(
        { error: 'Tipo de archivo no válido. Se espera un archivo Excel (.xlsx)' },
        { status: 400 }
      );
    }

    // Validar tamaño del archivo (máximo 10MB)
    if (file.size > SECURITY_CONFIG.MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `El archivo excede el tamaño máximo de ${SECURITY_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Convertir archivo a buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Importar usuarios
    const result = await UserImportService.importUsers(buffer, {
      generarContrasena,
      requerirCambioClave,
      crearPerfilEstudiante,
      modoVistaPrevia,
    });

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error('Error en importación masiva:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      { error: 'Error al procesar la importación', details: errorMessage },
      { status: 500 }
    );
  }
}
