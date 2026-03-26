# TODO: Implementar Generación de Certificados PDF para Estudiantes (Igual al Admin)

## ✅ Plan Aprobado por Usuario
**Estado**: Usuario confirmó el plan completo. Proceder paso a paso.

## 📋 Pasos del Plan (Marcar al completar)

### 1. Crear Generador PDF Compartido ✅ **COMPLETADO**
- `src/lib/certificado-pdf.ts` **creado**
  - ✅ Copiada función `generarPDFCertificado(id)`
  - ✅ Base64 output, QR, diseño profesional idéntico admin
  - ✅ Usando `db.execute` para fetch data completa

### 2. Crear Acción Server Estudiante ✅ **COMPLETADO**
- `src/app/sistema/estudiante/certificados/actions-client.ts` **creado**
  - ✅ `'use server'` + `generarPDFEstudiante(id)`
  - ✅ Validación: solo estudiante propietario del cert
  - ✅ Llama shared `generarPDFCertificado(id)`
  - ✅ Retorna Base64 limpio

### 3. Actualizar Admin Actions (Reutilizar Shared) [PENDIENTE]
- `src/app/administrador/certificados/actions.ts`
  - Cambiar import local → `src/lib/certificado-pdf`
  - Actualizar `generarPDFCertificado` call

### 4. Actualizar `src/app/sistema/estudiante/certificados/page.tsx` [PENDIENTE]
- Agregar `'use client'`
- Estado: certificados[], loading, isGenerating
- Botón Download por cert → `handleGeneratePDF(cert)` (igual admin client)
- Base64 → Blob download

### 5. Actualizar `src/app/sistema/estudiante/mis-certificados/page.tsx` [PENDIENTE]
- Cambiar API fetch → server action `generarPDFEstudiante`
- `handleGeneratePDF` como admin (Base64 Blob)
- UI consistente

### 6. Testing & Cleanup [PENDIENTE]
- Test: Student login → Mis Certificados → Download PDF (verificar diseño/QR)
- Eliminar TODO.md
- ✅ Completado

## 📊 Progreso Actual: 0/6 completados

**Siguiente paso: Crear `src/lib/certificado-pdf.ts`**
