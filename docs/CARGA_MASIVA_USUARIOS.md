# Documentación: Sistema de Carga Masiva de Usuarios

## 📋 Tabla de Contenidos

1. [Overview](#overview)
2. [Arquitectura](#arquitectura)
3. [Plantilla Excel](#plantilla-excel)
4. [Flujo del Sistema](#flujo-del-sistema)
5. [Validaciones](#validaciones)
6. [API Endpoints](#api-endpoints)
7. [Seguridad](#seguridad)
8. [Manejo de Errores](#manejo-de-errores)
9. [Frontend Integration](#frontend-integration)
10. [Testing](#testing)

---

## Overview

El sistema de carga masiva de usuarios permite a los administradores importar múltiples usuarios desde archivos Excel al sistema de Servicio Social UCP. Esta solución está diseñada para ser escalable, segura y fácil de usar.

### Características Principales

- ✅ Generación automática de plantillas Excel con validaciones
- ✅ Carga masiva con transacciones atómicas
- ✅ Validaciones robustas (formato, duplicados, integridad referencial)
- ✅ Modo vista previa antes de confirmar importación
- ✅ Reporte detallado de errores por fila
- ✅ Generación automática de contraseñas
- ✅ Creación automática de perfiles de estudiantes
- ✅ Seguridad basada en roles (solo administradores)

---

## Arquitectura

### Estructura de Archivos

```
src/
├── lib/
│   ├── services/
│   │   ├── excel-template.service.ts    # Generación de plantillas Excel
│   │   ├── excel-parser.service.ts       # Parseo y validación de Excel
│   │   └── user-import.service.ts       # Orquestación de importación
│   ├── types/
│   │   └── user-import.types.ts         # Tipos TypeScript
│   ├── excel-utils.ts                   # Utilidades Excel (existente)
│   ├── security.ts                      # Utilidades de seguridad (existente)
│   └── prisma.ts                        # Cliente Prisma (existente)
└── app/
    └── api/
        └── usuarios/
            └── carga-masiva/
                └── route.ts              # Endpoints API
```

### Componentes

#### 1. **ExcelTemplateService** (`excel-template.service.ts`)

Responsable de generar plantillas Excel descargables.

**Métodos:**
- `generateTemplate()`: Genera plantilla con encabezados, ejemplo y hojas de instrucciones
- `generateImportReport()`: Genera reporte de resultados de importación

**Características:**
- Estilo UCP (colores institucionales)
- Hoja de instrucciones detallada
- Hoja de valores válidos (enums)
- Fila de ejemplo con datos de muestra
- Protección de celdas (solo datos editables)

#### 2. **ExcelParserService** (`excel-parser.service.ts`)

Responsable de leer y validar archivos Excel.

**Métodos:**
- `parseExcelFile(buffer)`: Parsea archivo Excel a objetos ParsedUser
- `validateUser(user)`: Valida un usuario individual
- `validateBatch(users)`: Valida un lote de usuarios
- `detectDuplicates(users)`: Detecta duplicados dentro del archivo

**Validaciones:**
- Formato de email
- Longitud de campos
- Valores de enums (TipoDocumento, Rol, Modalidad)
- Campos obligatorios
- Duplicados internos (correo, documento, código estudiantil)

#### 3. **UserImportService** (`user-import.service.ts`)

Orquestador principal del proceso de importación.

**Métodos:**
- `importUsers(buffer, options)`: Importa usuarios con todas las validaciones
- `validateAgainstDatabase(users)`: Valida contra base de datos
- `getImportStats()`: Estadísticas de importación

**Proceso:**
1. Parsear Excel
2. Validar estructura de datos
3. Detectar duplicados internos
4. Validar contra base de datos
5. (Opcional) Vista previa
6. Crear usuarios en transacción
7. Crear perfiles de estudiantes (si aplica)

#### 4. **API Endpoint** (`route.ts`)

Endpoints HTTP para la funcionalidad.

**Métodos:**
- `GET`: Descargar plantilla Excel
- `POST`: Importar usuarios desde archivo

---

## Plantilla Excel

### Columnas

| Columna | Header | Requerido | Tipo | Descripción |
|---------|--------|-----------|------|-------------|
| primer_nombre | Primer Nombre* | ✅ | String (max 80) | Nombre del usuario |
| segundo_nombre | Segundo Nombre | ❌ | String (max 80) | Segundo nombre |
| primer_apellido | Primer Apellido* | ✅ | String (max 80) | Primer apellido |
| segundo_apellido | Segundo Apellido | ❌ | String (max 80) | Segundo apellido |
| tipo_documento | Tipo Documento* | ✅ | Enum | CC, TI, CE, PASAPORTE, NIT |
| numero_documento | Número Documento* | ✅ | String (max 20, unique) | Documento de identidad |
| correo | Correo Institucional* | ✅ | String (max 200, unique) | Email institucional |
| correo_personal | Correo Personal | ❌ | String (max 200) | Email personal |
| telefono | Teléfono | ❌ | String (max 20) | Número de teléfono |
| rol | Rol* | ✅ | Enum | ESTUDIANTE, PROFESOR, ADMINISTRADOR, ALIADO, AUXILIAR |
| programa_codigo | Código Programa* | ✅ | String | Código del programa académico |
| semestre | Semestre | ❌ | Number (1-10) | Semestre actual (obligatorio para estudiantes) |
| codigo_estudiantil | Código Estudiantil | ❌ | String (max 30, unique) | Código estudiantil |
| habilidades | Habilidades | ❌ | String[] | Lista separada por comas |
| intereses | Intereses | ❌ | String[] | Lista separada por comas |
| modalidad_preferida | Modalidad Preferida | ❌ | Enum | PRESENCIAL, VIRTUAL, HIBRIDA |

### Ejemplo de Fila

```
Juan, Carlos, Pérez, García, CC, 123456789, juan.perez@ucp.edu.co, juan@gmail.com, 3001234567, ESTUDIANTE, ING-SIS, 6, 202012345, Programación, Diseño, HIBRIDA
```

### Hojas de la Plantilla

1. **Usuarios**: Hoja principal con datos
2. **Instrucciones**: Guía detallada de uso
3. **Valores Válidos**: Referencia de enums y códigos

---

## Flujo del Sistema

### Diagrama de Flujo

```
┌─────────────────┐
│ Administrador   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│ 1. Descargar Plantilla  │
│    GET /api/usuarios/   │
│    carga-masiva         │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ 2. Llenar Excel         │
│    (Manual o sistema    │
│    externo)             │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ 3. Subir Archivo        │
│    POST /api/usuarios/  │
│    carga-masiva         │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ 4. Parsear Excel        │
│    ExcelParserService   │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ 5. Validar Estructura   │
│    Campos obligatorios  │
│    Formato de datos     │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ 6. Detectar Duplicados  │
│    Internos (archivo)   │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ 7. Validar contra BD    │
│    Correos existentes   │
│    Documentos           │
│    Códigos estudiantil  │
│    Programas            │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ 8. Modo Vista Previa?   │
│    (Opcional)           │
└────────┬────────────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
   SÍ        NO
    │         │
    ▼         ▼
┌───────┐  ┌─────────────────┐
│Retornar│  │ 9. Transacción  │
│Preview │  │    Prisma       │
└───────┘  └────────┬────────┘
                  │
                  ▼
         ┌─────────────────┐
         │ 10. Crear        │
         │     Usuarios     │
         └────────┬────────┘
                  │
                  ▼
         ┌─────────────────┐
         │ 11. Crear        │
         │     Perfiles     │
         │     (Estudiantes)│
         └────────┬────────┘
                  │
                  ▼
         ┌─────────────────┐
         │ 12. Generar     │
         │     Contraseñas │
         └────────┬────────┘
                  │
                  ▼
         ┌─────────────────┐
         │ 13. Retornar     │
         │     Resultado   │
         └─────────────────┘
```

### Opciones de Importación

```typescript
{
  generarContrasena: true,           // Generar contraseña automática
  longitudContrasena: 12,           // Longitud de contraseña
  requerirCambioClave: true,         // Forzar cambio en primer login
  crearPerfilEstudiante: true,      // Crear PerfilEstudiante para rol ESTUDIANTE
  modoVistaPrevia: false            // Solo validar sin crear usuarios
}
```

---

## Validaciones

### 1. Validaciones de Estructura

- **Campos obligatorios**: Verifica que todos los campos marcados con * estén presentes
- **Tipo de datos**: Valida que los datos tengan el tipo correcto
- **Longitud de campos**: Verifica límites de longitud según schema Prisma
- **Formato de email**: Valida formato RFC 5322

### 2. Validaciones de Enums

- **TipoDocumento**: CC, TI, CE, PASAPORTE, NIT
- **Rol**: ESTUDIANTE, PROFESOR, ADMINISTRADOR, ALIADO, AUXILIAR
- **Modalidad**: PRESENCIAL, VIRTUAL, HIBRIDA

### 3. Validaciones de Duplicados (Internos)

Detecta duplicados dentro del mismo archivo:
- Correos duplicados
- Números de documento duplicados
- Códigos estudiantil duplicados

### 4. Validaciones contra Base de Datos

Verifica integridad referencial:
- **Correos existentes**: No permitir correos ya registrados
- **Documentos existentes**: No permitir documentos ya registrados
- **Códigos estudiantil**: No permitir códigos ya usados
- **Programas**: Verificar que el código de programa exista en BD

### 5. Validaciones de Negocio

- **Semestre**: Obligatorio para estudiantes, valor 1-10
- **Código estudiantil**: Máximo 30 caracteres
- **Habilidades/Intereses**: Parseados como arrays desde strings separados por coma

---

## API Endpoints

### GET /api/usuarios/carga-masiva

Descarga la plantilla Excel.

**Requisitos:**
- Autenticado ✅
- Rol: ADMINISTRADOR ✅

**Response:**
```http
HTTP/1.1 200 OK
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="plantilla_usuarios_ucp.xlsx"

[Binary Excel File]
```

**Errores:**
- `401`: No autenticado
- `403`: No autorizado (rol incorrecto)
- `500`: Error al generar plantilla

---

### POST /api/usuarios/carga-masiva

Importa usuarios desde archivo Excel.

**Requisitos:**
- Autenticado ✅
- Rol: ADMINISTRADOR ✅
- Content-Type: multipart/form-data

**Request Body:**
```typescript
FormData {
  archivo: File,                    // Archivo Excel (.xlsx)
  modoVistaPrevia?: boolean,        // Default: false
  generarContrasena?: boolean,      // Default: true
  requerirCambioClave?: boolean,    // Default: true
  crearPerfilEstudiante?: boolean   // Default: true
}
```

**Response Exitoso:**
```json
{
  "total": 100,
  "exitosos": 85,
  "fallidos": 15,
  "errores": [
    {
      "fila": 3,
      "numero_documento": "987654321",
      "correo": "error@ucp.edu.co",
      "errores": ["El correo ya está registrado en el sistema"]
    }
  ],
  "usuariosCreados": [
    "juan.perez@ucp.edu.co",
    "maria.garcia@ucp.edu.co"
  ]
}
```

**Errores:**
- `400`: Archivo no enviado, tipo inválido, tamaño excedido
- `401`: No autenticado
- `403`: No autorizado (rol incorrecto)
- `500`: Error al procesar importación

---

## Seguridad

### Autenticación y Autorización

- **NextAuth**: Sistema de autenticación basado en JWT
- **Role-Based Access Control**: Solo administradores pueden usar la funcionalidad
- **Session Validation**: Verificación de sesión en cada request

### Validaciones de Seguridad

- **File Type Validation**: Solo archivos Excel (.xlsx, .xls)
- **File Size Limit**: Máximo 10MB (configurable en SECURITY_CONFIG)
- **Input Sanitization**: Limpieza de inputs usando SecurityManager
- **SQL Injection Protection**: Prisma ORM con parameterized queries
- **Rate Limiting**: Protección contra abuso (configurable)

### Password Security

- **Hash Algorithm**: PBKDF2 con SHA-256
- **Iterations**: 10,000 (configurable en SECURITY_CONFIG)
- **Salt Generation**: Salt único por usuario
- **Force Password Change**: Opción para requerir cambio en primer login

### Headers de Seguridad

```typescript
{
  'X-XSS-Protection': '1; mode=block',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Strict-Transport-Security': 'max-age=31536000',
  'Content-Security-Policy': '...',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
}
```

---

## Manejo de Errores

### Tipos de Errores

#### 1. Errores de Validación de Estructura

```json
{
  "fila": 5,
  "errores": [
    "primer_nombre: El campo Primer Nombre es obligatorio",
    "correo: Formato de correo inválido"
  ]
}
```

#### 2. Errores de Duplicados Internos

```json
{
  "fila": 10,
  "errores": [
    "Duplicado detectado: CORREO "juan@ucp.edu.co" aparece múltiples veces en el archivo"
  ]
}
```

#### 3. Errores de Base de Datos

```json
{
  "fila": 7,
  "numero_documento": "123456789",
  "correo": "pedro@ucp.edu.co",
  "errores": [
    "El número de documento ya está registrado en el sistema"
  ]
}
```

#### 4. Errores de Integridad Referencial

```json
{
  "fila": 12,
  "errores": [
    "El programa con código "ING-INVALID" no existe en el sistema"
  ]
}
```

### Estrategia de Rollback

- **Transacciones Atómicas**: Todo el proceso está envuelto en una transacción Prisma
- **All-or-Nothing**: Si falla cualquier usuario, se hace rollback de toda la transacción
- **Error Isolation**: Errores de un usuario no afectan a otros (cuando no es transacción completa)

---

## Frontend Integration

### Ejemplo de Implementación (React)

```typescript
// Componente de carga masiva
import { useState } from 'react';

export function UserImportForm() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Descargar plantilla
  const downloadTemplate = async () => {
    window.location.href = '/api/usuarios/carga-masiva';
  };

  // Subir archivo
  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('archivo', file);
    formData.append('modoVistaPrevia', preview.toString());
    formData.append('generarContrasena', 'true');
    formData.append('requerirCambioClave', 'true');
    formData.append('crearPerfilEstudiante', 'true');

    try {
      const response = await fetch('/api/usuarios/carga-masiva', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1>Carga Masiva de Usuarios</h1>
      
      {/* Descargar plantilla */}
      <button onClick={downloadTemplate}>
        📥 Descargar Plantilla Excel
      </button>

      {/* Upload */}
      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      {/* Opciones */}
      <label>
        <input
          type="checkbox"
          checked={preview}
          onChange={(e) => setPreview(e.target.checked)}
        />
        Modo Vista Previa
      </label>

      {/* Submit */}
      <button onClick={handleUpload} disabled={!file || loading}>
        {loading ? 'Procesando...' : 'Importar Usuarios'}
      </button>

      {/* Resultados */}
      {result && (
        <div className="mt-4">
          <h2>Resultados</h2>
          <p>Total: {result.total}</p>
          <p>Exitosos: {result.exitosos}</p>
          <p>Fallidos: {result.fallidos}</p>
          
          {result.errores.length > 0 && (
            <div>
              <h3>Errores</h3>
              {result.errores.map((error: any, idx: number) => (
                <div key={idx} className="text-red-500">
                  Fila {error.fila}: {error.errores.join(', ')}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

### UX Recommendations

1. **Flujo Claro**:
   - Paso 1: Descargar plantilla
   - Paso 2: Llenar datos
   - Paso 3: Subir archivo
   - Paso 4: Revisar resultados

2. **Indicadores de Progreso**:
   - Spinner durante procesamiento
   - Barra de progreso si es posible
   - Notificaciones de éxito/error

3. **Manejo de Errores**:
   - Mostrar errores específicos por fila
   - Permitir descargar reporte de errores
   - Sugerir correcciones

4. **Validación en Cliente**:
   - Validar tipo de archivo antes de subir
   - Validar tamaño de archivo
   - Preview del archivo si es posible

---

## Testing

### Casos de Prueba

#### 1. Prueba de Plantilla

```typescript
describe('ExcelTemplateService', () => {
  it('debe generar plantilla con todas las columnas', async () => {
    const buffer = await ExcelTemplateService.generateTemplate();
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
  });
});
```

#### 2. Prueba de Parseo

```typescript
describe('ExcelParserService', () => {
  it('debe parsear archivo Excel correctamente', async () => {
    const buffer = fs.readFileSync('test-data.xlsx');
    const users = await ExcelParserService.parseExcelFile(buffer);
    expect(users.length).toBeGreaterThan(0);
    expect(users[0]).toHaveProperty('primer_nombre');
  });

  it('debe detectar duplicados internos', async () => {
    const users = [/* datos con duplicados */];
    const duplicates = ExcelParserService.detectDuplicates(users);
    expect(duplicates.size).toBeGreaterThan(0);
  });
});
```

#### 3. Prueba de Validación

```typescript
describe('UserImportService', () => {
  it('debe validar contra base de datos', async () => {
    const users = [/* usuarios de prueba */];
    const errors = await UserImportService['validateAgainstDatabase'](users);
    // Verificar errores esperados
  });
});
```

#### 4. Prueba de Endpoint

```typescript
describe('POST /api/usuarios/carga-masiva', () => {
  it('debe requerir autenticación', async () => {
    const response = await fetch('/api/usuarios/carga-masiva', {
      method: 'POST',
    });
    expect(response.status).toBe(401);
  });

  it('debe importar usuarios correctamente', async () => {
    const formData = new FormData();
    formData.append('archivo', testFile);
    
    const response = await fetch('/api/usuarios/carga-masiva', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer valid-token',
      },
      body: formData,
    });
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('total');
  });
});
```

### Testing de Integración

1. **Test con base de datos real**: Usar Prisma Migrate para crear DB de prueba
2. **Test con archivos reales**: Crear archivos Excel de prueba con varios escenarios
3. **Test de carga**: Probar con archivos grandes (100+ usuarios)
4. **Test de concurrencia**: Múltiples importaciones simultáneas

---

## Performance Considerations

### Optimizaciones Implementadas

1. **Batch Queries**: Validaciones en lote en lugar de una por una
2. **Transaction Efficiency**: Transacción única para todos los usuarios
3. **Memory Management**: Stream processing para archivos grandes
4. **Index Usage**: Aprovechamiento de índices Prisma (correo, documento, etc.)

### Límites Recomendados

- **Máximo usuarios por archivo**: 500 (configurable)
- **Tamaño máximo archivo**: 10MB
- **Timeout de transacción**: 10 segundos (configurable en PrismaManager)

### Monitoreo

```typescript
// Agregar logs de performance
console.time('importacion');
const result = await UserImportService.importUsers(buffer, options);
console.timeEnd('importacion');
// Output: importacion: 2345ms
```

---

## Troubleshooting

### Problema Comunes

#### 1. "No se encontró la hoja 'Usuarios'"

**Causa**: El archivo Excel no tiene la hoja con el nombre correcto.

**Solución**: Usar la plantilla generada por el sistema, no renombrar hojas.

#### 2. "Faltan columnas obligatorias"

**Causa**: El archivo no tiene todas las columnas requeridas.

**Solución**: Descargar la plantilla actualizada y llenarla completamente.

#### 3. "El programa con código X no existe"

**Causa**: El código de programa no está en la base de datos.

**Solución**: Verificar códigos en la tabla `programas` o crear el programa primero.

#### 4. "Timeout de transacción"

**Causa**: Archivo muy grande o base de datos lenta.

**Solución**: 
- Reducir tamaño del archivo
- Aumentar timeout en PrismaManager
- Optimizar índices de base de datos

---

## Future Enhancements

### Características Futuras

1. **Soporte para actualización masiva**: Actualizar usuarios existentes
2. **Importación asíncrona**: Para archivos muy grandes con notificaciones
3. **Soporte CSV**: Alternativa a Excel
4. **Validación avanzada**: Reglas de negocio customizables
5. **Historial de importaciones**: Auditoría completa
6. **Deshacer importación**: Rollback de importaciones recientes
7. **Templates por rol**: Plantillas específicas por tipo de usuario
8. **Importación programada**: Automatización con cron jobs

---

## Changelog

### v1.0.0 (2024-04-12)

- ✅ Implementación inicial de carga masiva
- ✅ Generación de plantillas Excel
- ✅ Validaciones robustas
- ✅ Transacciones atómicas
- ✅ Modo vista previa
- ✅ Seguridad basada en roles
- ✅ Documentación completa

---

## Contacto

Para dudas o sugerencias sobre este módulo, contactar al equipo de desarrollo.

**Última actualización**: 12 de abril de 2024
