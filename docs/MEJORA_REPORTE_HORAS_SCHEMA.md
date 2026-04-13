# 📊 MEJORA: Reporte de Horas con Múltiples Fechas

## 🔄 MIGRACIÓN DE ESQUEMA

### 1. NUEVA TABLA: DetalleFechaReporte

```prisma
/// Detalles de fechas y horas específicas de un reporte
model DetalleFechaReporte {
  id              String        @id @default(uuid()) @db.Uuid
  id_reporte      String        @db.Uuid
  fecha           DateTime      @db.Date
  horas           Decimal       @db.Decimal(5, 2)
  descripcion     String?       @db.Text
  creado_en       DateTime      @default(now()) @db.Timestamptz(6)

  reporte         ReporteHoras  @relation(fields: [id_reporte], references: [id], onDelete: Cascade)

  @@index([id_reporte])
  @@index([fecha])
  @@index([id_reporte, fecha])  // Para evitar duplicados
  @@map("detalles_fechas_reportes")
}
```

### 2. MODIFICACIÓN A ReporteHoras

```prisma
model ReporteHoras {
  id                  String        @id @default(uuid()) @db.Uuid
  id_estudiante       String        @db.Uuid
  id_actividad        String        @db.Uuid
  id_convocatoria     String?       @db.Uuid
  
  // Total de horas (suma de detalles)
  horas_reportadas    Decimal       @db.Decimal(5, 2)
  horas_aprobadas     Decimal?      @db.Decimal(5, 2)
  
  estado              EstadoReporte @default(REPORTADO)
  descripcion_trabajo String?       @db.Text
  
  // ❌ ELIMINAR: fecha_actividad (ahora en DetalleFechaReporte)
  // fecha_actividad     DateTime?     @db.Date  // MIGRAR A DETALLES
  
  notas_estudiante    String?       @db.Text
  id_revisor          String?       @db.Uuid
  notas_revisor       String?
  motivo_rechazo      String?
  reportado_en        DateTime      @default(now()) @db.Timestamptz(6)
  revisado_en         DateTime?     @db.Timestamptz(6)

  actividad           Actividad     @relation(fields: [id_actividad], references: [id])
  convocatoria        Convocatoria? @relation(fields: [id_convocatoria], references: [id])
  estudiante          Usuario       @relation("ReporteEstudiante", fields: [id_estudiante], references: [id])
  revisor             Usuario?      @relation("ReporteRevisor", fields: [id_revisor], references: [id])
  
  // ✅ NUEVA RELACIÓN
  detalles_fechas     DetalleFechaReporte[]
  evidencias          EvidenciaReporte[]
  historial           HistorialHoras[]

  @@index([id_estudiante, estado])
  @@index([id_actividad])
  @@index([id_convocatoria, estado])
  @@index([id_revisor, estado])
  @@index([estado])
  @@index([reportado_en(sort: Desc)])
  @@map("reportes_horas")
}
```

### 3. SCRIPT DE MIGRACIÓN

```sql
-- Paso 1: Crear la nueva tabla
CREATE TABLE "detalles_fechas_reportes" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "id_reporte" UUID NOT NULL,
  "fecha" DATE NOT NULL,
  "horas" DECIMAL(5,2) NOT NULL,
  "descripcion" TEXT,
  "creado_en" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT "detalles_fechas_reportes_id_reporte_fkey" 
    FOREIGN KEY ("id_reporte") REFERENCES "reportes_horas"("id") ON DELETE CASCADE
);

-- Paso 2: Crear índices
CREATE INDEX "detalles_fechas_reportes_id_reporte_idx" ON "detalles_fechas_reportes"("id_reporte");
CREATE INDEX "detalles_fechas_reportes_fecha_idx" ON "detalles_fechas_reportes"("fecha");
CREATE INDEX "detalles_fechas_reportes_id_reporte_fecha_idx" ON "detalles_fechas_reportes"("id_reporte", "fecha");

-- Paso 3: Migrar datos existentes
INSERT INTO "detalles_fechas_reportes" (id_reporte, fecha, horas, descripcion)
SELECT 
  id, 
  COALESCE(fecha_actividad, reportado_en::DATE), 
  horas_reportadas, 
  descripcion_trabajo
FROM "reportes_horas"
WHERE fecha_actividad IS NOT NULL OR reportado_en IS NOT NULL;

-- Paso 4: Eliminar columna fecha_actividad (después de verificar migración)
-- ALTER TABLE "reportes_horas" DROP COLUMN "fecha_actividad";
```

---

## 📁 ESTRUCTURA DE ALMACENAMIENTO DE ARCHIVOS

### Estructura Segura

```
/uploads/
  /reportes-horas/
    /{id_usuario}/
      /{id_reporte}/
        /{timestamp}-{random}.{ext}
```

### Ejemplo

```
/uploads/
  /reportes-horas/
    /550e8400-e29b-41d4-a716-446655440000/
      /123e4567-e89b-12d3-a456-426614174000/
        /1712934567890-abc123.pdf
        /1712934567891-def456.png
```

### Ventajas

✅ Aislamiento por usuario y reporte  
✅ Nombres únicos (timestamp + random)  
✅ Fácil limpieza por cascada  
✅ No sobrescritura  
✅ Escalable  

---

## 🔐 CONTROL DE ACCESO A ARCHIVOS

### Roles con Acceso

| Rol | Puede Ver | Puede Descargar | Razón |
|-----|-----------|-----------------|--------|
| ADMINISTRADOR | ✅ | ✅ | Acceso total al sistema |
| PROFESOR (creador actividad) | ✅ | ✅ | Necesita validar reportes |
| AUXILIAR | ✅ | ✅ | Valida reportes de su convocatoria |
| ALIADO vinculado | ✅ | ✅ | Participa en la convocatoria |
| ESTUDIANTE (dueño) | ✅ | ✅ | Solo sus propios reportes |

### Middleware de Autorización

```typescript
// src/lib/file-authorization.ts

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function canAccessArchivo(
  archivoId: string,
  action: 'view' | 'download' | 'delete'
): Promise<boolean> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) return false;
  
  const userId = session.user.id;
  const userRole = session.user.role;
  
  // ADMINISTRADOR: Acceso total
  if (userRole === 'ADMINISTRADOR') return true;
  
  // Obtener el reporte asociado al archivo
  const evidencia = await prisma.evidenciaReporte.findUnique({
    where: { id: archivoId },
    include: {
      reporte: {
        include: {
          estudiante: true,
          actividad: {
            include: {
              convocatoria: {
                include: {
                  creador: true
                }
              }
            }
          }
        }
      }
    }
  });
  
  if (!evidencia) return false;
  
  const reporte = evidencia.reporte;
  
  // ESTUDIANTE: Solo sus propios reportes
  if (userRole === 'ESTUDIANTE') {
    return reporte.id_estudiante === userId;
  }
  
  // PROFESOR: Creador de la actividad/convocatoria
  if (userRole === 'PROFESOR') {
    return reporte.actividad.creado_por === userId ||
           reporte.actividad.convocatoria.creado_por === userId;
  }
  
  // AUXILIAR: Verificar si está vinculado a la convocatoria
  if (userRole === 'AUXILIAR') {
    const vinculado = await prisma.vinculacion.findFirst({
      where: {
        id_usuario: userId,
        id_convocatoria: reporte.id_convocatoria,
        estado: 'APROBADA'
      }
    });
    return !!vinculado;
  }
  
  // ALIADO: Verificar vinculación
  if (userRole === 'ALIADO') {
    const vinculado = await prisma.vinculacion.findFirst({
      where: {
        id_usuario: userId,
        id_convocatoria: reporte.id_convocatoria,
        estado: 'APROBADA'
      }
    });
    return !!vinculado;
  }
  
  return false;
}
```
