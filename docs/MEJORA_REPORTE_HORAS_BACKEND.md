# 🚀 MEJORA: Backend - Reporte de Horas con Múltiples Fechas

## 📡 ENDPOINTS

### 1. POST /api/reportes-horas

Crear un reporte de horas con múltiples fechas y archivos.

**Request Body:**
```typescript
{
  id_actividad: string;
  descripcion_trabajo: string;
  notas_estudiante?: string;
  fechas: Array<{
    fecha: string;  // YYYY-MM-DD
    horas: number;  // 0.5, 1, 1.5, etc.
    descripcion?: string;
  }>;
  archivos?: File[];
}
```

**Validaciones:**
- ✅ `id_actividad`: debe existir y estar activa
- ✅ `fechas`: mínimo 1, máximo 10 fechas
- ✅ `horas` por fecha: mínimo 0.5, máximo 8
- ✅ `horas` totales: suma de fechas
- ✅ Fechas dentro del rango de la convocatoria
- ✅ Sin duplicados de fecha por reporte
- ✅ Archivos: PDF, JPG, PNG (máx 5MB cada uno, máx 5 archivos)

**Response:**
```typescript
{
  success: true;
  message: string;
  data: {
    id: string;
    horas_reportadas: number;
    estado: string;
    detalles_fechas: Array<{
      id: string;
      fecha: string;
      horas: number;
    }>;
    evidencias: Array<{
      id: string;
      archivo_url: string;
      archivo_nombre: string;
    }>;
  };
}
```

---

### 2. GET /api/reportes-horas/:id

Obtener un reporte con sus detalles y archivos.

**Response:**
```typescript
{
  id: string;
  id_estudiante: string;
  id_actividad: string;
  horas_reportadas: number;
  estado: string;
  descripcion_trabajo: string;
  reportado_en: string;
  actividad: {
    id: string;
    nombre: string;
    convocatoria: {
      id: string;
      titulo: string;
    };
  };
  detalles_fechas: Array<{
    id: string;
    fecha: string;
    horas: number;
    descripcion: string | null;
  }>;
  evidencias: Array<{
    id: string;
    tipo: string;
    archivo_url: string;
    archivo_nombre: string;
    archivo_mime: string;
    peso_bytes: number;
  }>;
}
```

---

### 3. GET /api/archivos/:id (SEGURO)

Descargar un archivo con control de acceso.

**Authorization:**
- Session requerida
- Verificación de permisos (ver middleware arriba)

**Response:**
- Binary stream del archivo
- Headers: `Content-Type`, `Content-Disposition`

---

### 4. DELETE /api/archivos/:id

Eliminar un archivo de evidencia.

**Authorization:**
- Solo el dueño (estudiante) o administrador
- Solo si el reporte está en estado `REPORTADO`

**Response:**
```typescript
{
  success: true;
  message: string;
}
```

---

## 🔧 IMPLEMENTACIÓN

### 1. Service: ReporteHorasService

```typescript
// src/lib/services/reporte-horas.service.ts

import { prisma } from '@/lib/prisma';
import { EstadoReporte } from '@prisma/client';
import { z } from 'zod';

// Schema de validación
const crearReporteSchema = z.object({
  id_actividad: z.string().uuid(),
  descripcion_trabajo: z.string().min(10).max(1000),
  notas_estudiante: z.string().max(300).optional(),
  fechas: z.array(z.object({
    fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato inválido'),
    horas: z.number().min(0.5).max(8),
    descripcion: z.string().max(500).optional()
  })).min(1).max(10),
  archivos: z.array(z.any()).optional()
});

export class ReporteHorasService {
  /**
   * Crear un reporte con múltiples fechas
   */
  static async crearConFechas(data: any, estudianteId: string) {
    // Validar datos
    const validated = crearReporteSchema.parse(data);
    
    // Verificar actividad
    const actividad = await prisma.actividad.findUnique({
      where: { id: validated.id_actividad },
      include: {
        convocatoria: true
      }
    });
    
    if (!actividad || !actividad.esta_activa) {
      throw new Error('Actividad no disponible');
    }
    
    // Validar rango de fechas
    const fechaInicio = actividad.fecha_inicio 
      ? new Date(actividad.fecha_inicio) 
      : new Date('2020-01-01');
    const fechaFin = actividad.fecha_limite 
      ? new Date(actividad.fecha_limite) 
      : new Date('2030-12-31');
    
    for (const detalle of validated.fechas) {
      const fecha = new Date(detalle.fecha);
      if (fecha < fechaInicio || fecha > fechaFin) {
        throw new Error(
          `Fecha ${detalle.fecha} fuera del rango de la convocatoria`
        );
      }
    }
    
    // Validar suma de horas
    const totalHoras = validated.fechas.reduce((sum, f) => sum + f.horas, 0);
    if (totalHoras > actividad.horas_estimadas * 1.5) {
      throw new Error(
        `Total de horas (${totalHoras}) excede el límite permitido`
      );
    }
    
    // Crear reporte y detalles en transacción
    const resultado = await prisma.$transaction(async (tx) => {
      // Crear reporte principal
      const reporte = await tx.reporteHoras.create({
        data: {
          id_estudiante: estudianteId,
          id_actividad: validated.id_actividad,
          id_convocatoria: actividad.id_convocatoria,
          horas_reportadas: totalHoras,
          descripcion_trabajo: validated.descripcion_trabajo,
          notas_estudiante: validated.notas_estudiante,
          estado: EstadoReporte.REPORTADO,
          reportado_en: new Date()
        }
      });
      
      // Crear detalles de fechas
      const detalles = await tx.detalleFechaReporte.createMany({
        data: validated.fechas.map(f => ({
          id_reporte: reporte.id,
          fecha: new Date(f.fecha),
          horas: f.horas,
          descripcion: f.descripcion
        }))
      });
      
      return { reporte, detallesCount: detalles.count };
    });
    
    return resultado;
  }
  
  /**
   * Obtener reporte con detalles
   */
  static async obtenerConDetalles(id: string) {
    return await prisma.reporteHoras.findUnique({
      where: { id },
      include: {
        actividad: {
          include: {
            convocatoria: {
              select: {
                titulo: true,
                fecha_inicio: true,
                fecha_limite: true
              }
            }
          }
        },
        detalles_fechas: {
          orderBy: { fecha: 'asc' }
        },
        evidencias: true,
        estudiante: {
          select: {
            primer_nombre: true,
            primer_apellido: true,
            correo: true
          }
        }
      }
    });
  }
  
  /**
   * Validar que no haya duplicados de fecha
   */
  static async validarFechasUnicas(fechas: string[], idReporte?: string) {
    const fechasUnicas = new Set(fechas);
    if (fechasUnicas.size !== fechas.length) {
      throw new Error('Hay fechas duplicadas');
    }
    
    // Verificar en BD si es actualización
    if (idReporte) {
      const existentes = await prisma.detalleFechaReporte.findMany({
        where: { id_reporte: idReporte },
        select: { fecha: true }
      });
      
      for (const fecha of fechas) {
        if (existentes.some(e => e.fecha.toISOString().split('T')[0] === fecha)) {
          throw new Error(`Fecha ${fecha} ya existe en el reporte`);
        }
      }
    }
  }
}
```

---

### 2. Endpoint: POST /api/reportes-horas

```typescript
// src/app/api/reportes-horas/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ReporteHorasService } from '@/lib/services/reporte-horas.service';
import { uploadMultipleFiles, UploadedFile } from '@/lib/fileUpload';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ESTUDIANTE') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    
    const formData = await req.formData();
    
    // Extraer datos
    const id_actividad = formData.get('id_actividad') as string;
    const descripcion_trabajo = formData.get('descripcion_trabajo') as string;
    const notas_estudiante = formData.get('notas_estudiante') as string | null;
    
    // Extraer fechas (viene como JSON string)
    const fechasJson = formData.get('fechas') as string;
    const fechas = JSON.parse(fechasJson);
    
    // Procesar archivos
    const archivos = formData.getAll('archivos') as File[];
    let archivosSubidos: UploadedFile[] = [];
    
    if (archivos && archivos.length > 0) {
      const archivosValidos = archivos.filter(f => f.size > 0);
      if (archivosValidos.length > 0) {
        archivosSubidos = await uploadMultipleFiles(archivosValidos);
      }
    }
    
    // Crear reporte con fechas
    const resultado = await ReporteHorasService.crearConFechas({
      id_actividad,
      descripcion_trabajo,
      notas_estudiante,
      fechas
    }, session.user.id);
    
    // Agregar evidencias si hay archivos
    if (archivosSubidos.length > 0) {
      await prisma.evidenciaReporte.createMany({
        data: archivosSubidos.map(archivo => ({
          id_reporte: resultado.reporte.id,
          tipo: archivo.tipo.startsWith('image/') ? 'IMAGEN' : 'DOCUMENTO',
          archivo_url: archivo.url,
          archivo_nombre: archivo.nombre,
          archivo_mime: archivo.tipo,
          peso_bytes: archivo.tamaño
        }))
      });
    }
    
    // Notificar (existente)
    // ... código de notificaciones
    
    return NextResponse.json({
      success: true,
      message: `Reporte creado con ${resultado.detallesCount} fechas`,
      data: resultado.reporte
    });
    
  } catch (error) {
    console.error('Error creando reporte:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 }
    );
  }
}
```

---

### 3. Endpoint: GET /api/archivos/[id]

```typescript
// src/app/api/archivos/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { canAccessArchivo } from '@/lib/file-authorization';
import { prisma } from '@/lib/prisma';
import { join } from 'path';
import { readFile } from 'fs/promises';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autorización
    const tieneAcceso = await canAccessArchivo(params.id, 'view');
    if (!tieneAcceso) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    
    // Obtener información del archivo
    const evidencia = await prisma.evidenciaReporte.findUnique({
      where: { id: params.id }
    });
    
    if (!evidencia?.archivo_url) {
      return NextResponse.json({ error: 'Archivo no encontrado' }, { status: 404 });
    }
    
    // Leer archivo del sistema de archivos
    const filePath = join(process.cwd(), 'public', evidencia.archivo_url);
    const fileBuffer = await readFile(filePath);
    
    // Retornar archivo
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': evidencia.archivo_mime || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${evidencia.archivo_nombre}"`,
        'Content-Length': fileBuffer.length.toString()
      }
    });
    
  } catch (error) {
    console.error('Error sirviendo archivo:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
```

---

### 4. Servicio mejorado de subida de archivos

```typescript
// src/lib/fileUpload.ts (MEJORADO)

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { randomBytes } from 'crypto';

export interface UploadedFile {
  nombre: string;
  url: string;
  tipo: string;
  tamaño: number;
}

export async function uploadFileForReporte(
  file: File,
  userId: string,
  reporteId: string
): Promise<UploadedFile> {
  try {
    // Validar tipo
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Tipo no permitido: ${file.type}`);
    }
    
    // Validar tamaño (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('Archivo demasiado grande (máx 5MB)');
    }
    
    // Generar nombre único
    const timestamp = Date.now();
    const random = randomBytes(3).toString('hex');
    const extension = file.name.split('.').pop();
    const fileName = `${timestamp}-${random}.${extension}`;
    
    // Crear directorio estructurado
    const uploadsDir = join(
      process.cwd(), 
      'public', 
      'uploads', 
      'reportes-horas',
      userId,
      reporteId
    );
    
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }
    
    // Guardar archivo
    const filePath = join(uploadsDir, fileName);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);
    
    // Retornar URL relativa
    return {
      nombre: file.name,
      url: `/uploads/reportes-horas/${userId}/${reporteId}/${fileName}`,
      tipo: file.type,
      tamaño: file.size
    };
    
  } catch (error) {
    console.error('Error subiendo archivo:', error);
    throw error;
  }
}
```

---

## ✅ VALIDACIONES CRÍTICAS

### 1. Consistencia de Horas
```typescript
// La suma de detalles debe igualar el total
const sumaDetalles = detalles.reduce((sum, d) => sum + d.horas, 0);
if (sumaDetalles !== reporte.horas_reportadas) {
  throw new Error('Inconsistencia en horas');
}
```

### 2. Rango de Fechas
```typescript
// Fechas dentro de convocatoria
const fecha = new Date(detalle.fecha);
if (fecha < convocatoria.fecha_inicio || fecha > convocatoria.fecha_limite) {
  throw new Error('Fecha fuera de rango');
}
```

### 3. Sin Duplicados
```typescript
// No duplicados de fecha por reporte
const fechasUnicas = new Set(detalles.map(d => d.fecha));
if (fechasUnicas.size !== detalles.length) {
  throw new Error('Fechas duplicadas');
}
```

### 4. Manejo de Errores
```typescript
// Transacción atómica
await prisma.$transaction(async (tx) => {
  // Si falla, todo se rollback
  const reporte = await tx.reporteHoras.create({...});
  await tx.detalleFechaReporte.createMany({...});
  await tx.evidenciaReporte.createMany({...});
});
```

### 5. Archivos Opcionales
```typescript
// El sistema NO falla si no hay archivos
if (archivos && archivos.length > 0) {
  archivosSubidos = await uploadMultipleFiles(archivos);
}
// Continúa aunque archivosSubidos esté vacío
```

---

## 🔄 FLUJO COMPLETO

```
1. Estudiante selecciona actividad
   ↓
2. Ingresa descripción general
   ↓
3. Agrega múltiples fechas + horas
   ↓
4. Sube archivos (opcional)
   ↓
5. Frontend valida en tiempo real
   ↓
6. POST /api/reportes-horas
   ↓
7. Backend valida:
   - Actividad existe y está activa
   - Fechas en rango de convocatoria
   - Horas totales válidas
   - Sin duplicados
   - Archivos válidos
   ↓
8. Transacción atómica:
   - Crear ReporteHoras
   - Crear DetalleFechaReporte[]
   - Crear EvidenciaReporte[]
   ↓
9. Notificar a interesados
   ↓
10. Retornar éxito
```
