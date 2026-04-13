# 📋 RESUMEN EJECUTIVO: Mejora Reporte de Horas

## 🎯 OBJETIVO

Rediseñar el módulo de reporte de horas para permitir:
1. **Múltiples fechas** por reporte (distribución de horas)
2. **Subida robusta de archivos** con control de acceso
3. **Almacenamiento seguro** y estructurado
4. **Validaciones críticas** para integridad de datos
5. **UX mejorada** e intuitiva

---

## 🔍 DIAGNÓSTICO ACTUAL

### Problemas Identificados
| Problema | Severidad | Impacto |
|----------|-----------|---------|
| Solo 1 fecha por reporte | 🔴 Alto | Limita flexibilidad del estudiante |
| Horas no distribuidas | 🔴 Alto | No refleja realidad del trabajo |
| Archivos públicos | 🟡 Medio | Riesgo de seguridad |
| Sin control de acceso | 🔴 Alto | Cualquiera puede ver archivos |
| Validación limitada | 🟡 Medio | Posibles inconsistencias |

### Estado Actual
```prisma
ReporteHoras {
  fecha_actividad: DateTime?  // ❌ Solo 1 fecha
  horas_reportadas: Decimal   // ❌ Valor único
  evidencias: EvidenciaReporte[]  // ✅ Existe pero sin control de acceso
}
```

---

## ✅ SOLUCIÓN PROPUESTA

### 1. Nuevo Modelo de Datos

```prisma
// NUEVA TABLA
model DetalleFechaReporte {
  id       String       @id @default(uuid())
  id_reporte String
  fecha    DateTime     @db.Date
  horas    Decimal      @db.Decimal(5, 2)
  descripcion String?
  reporte  ReporteHoras @relation(...)
}

// MODIFICADO
model ReporteHoras {
  // Eliminar: fecha_actividad
  // Agregar: detalles_fechas DetalleFechaReporte[]
}
```

### 2. Almacenamiento Seguro

```
/uploads/
  /reportes-horas/
    /{id_usuario}/
      /{id_reporte}/
        /{timestamp}-{random}.{ext}
```

**Ventajas:**
- ✅ Aislamiento por usuario y reporte
- ✅ Nombres únicos (no sobrescritura)
- ✅ Fácil limpieza por cascada
- ✅ Escalable

### 3. Control de Acceso

**Middleware de autorización:**
```typescript
canAccessArchivo(archivoId, action) {
  // ADMINISTRADOR: ✅ Total
  // PROFESOR: ✅ Creador de actividad/convocatoria
  // AUXILIAR: ✅ Vinculado a convocatoria
  // ALIADO: ✅ Vinculado a convocatoria
  // ESTUDIANTE: ✅ Solo sus reportes
}
```

### 4. Validaciones Críticas

| Validación | Implementación |
|------------|----------------|
| Suma de detalles = total | Transacción atómica |
| Fechas en rango convocatoria | Comparación de fechas |
| Sin duplicados | Set + índice único |
| Horas por fecha (0.5-8) | Zod schema |
| Archivos válidos | MIME + tamaño |
| Sistema no falla sin archivos | Opcional en BD |

---

## 🚀 PLAN DE IMPLEMENTACIÓN

### Fase 1: Base de Datos (1-2 horas)
1. ✅ Crear tabla `DetalleFechaReporte`
2. ✅ Agregar relación en `ReporteHoras`
3. ✅ Migrar datos existentes
4. ✅ Eliminar `fecha_actividad` (después de verificación)
5. ✅ Crear índices

### Fase 2: Backend (4-6 horas)
1. ✅ Crear `ReporteHorasService`
2. ✅ Implementar `crearConFechas()`
3. ✅ Implementar `obtenerConDetalles()`
4. ✅ Crear middleware `canAccessArchivo()`
5. ✅ Implementar endpoint POST `/api/reportes-horas`
6. ✅ Implementar endpoint GET `/api/archivos/[id]`
7. ✅ Implementar endpoint DELETE `/api/archivos/[id]`
8. ✅ Mejorar `fileUpload.ts` con estructura segura
9. ✅ Actualizar `actions.ts`

### Fase 3: Frontend (6-8 horas)
1. ✅ Crear componente `SelectorFechas`
2. ✅ Crear componente `ArchivosUploader`
3. ✅ Integrar en formulario principal
4. ✅ Agregar validaciones en tiempo real
5. ✅ Implementar drag & drop
6. ✅ Agregar feedback visual
7. ✅ Responsive design

### Fase 4: Testing (2-3 horas)
1. ✅ Test de integración BD
2. ✅ Test de validaciones
3. ✅ Test de autorización
4. ✅ Test de subida de archivos
5. ✅ Test de UX (manual)

### Fase 5: Documentación (1 hora)
1. ✅ Documentar API
2. ✅ Documentar componentes
3. ✅ Actualizar README
4. ✅ Crear guía de usuario

**Total estimado: 14-20 horas**

---

## 📊 IMPACTO ESPERADO

### Para el Estudiante
- ✅ Puede distribuir horas en múltiples fechas
- ✅ Más flexibilidad para reportar trabajo
- ✅ UI intuitiva y fácil de usar
- ✅ Feedback inmediato de validaciones

### Para el Administrador
- ✅ Mejor trazabilidad de horas
- ✅ Datos más precisos y completos
- ✅ Control total sobre archivos
- ✅ Auditoría mejorada

### Para el Sistema
- ✅ Datos más consistentes
- ✅ Seguridad mejorada (RBAC)
- ✅ Escalabilidad (estructura de archivos)
- ✅ Mantenibilidad (código modular)

---

## ⚠️ RIESGOS Y MITIGACIÓN

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Migración de datos falla | 🟡 Media | 🔴 Alto | Backup antes de migrar, test en staging |
| Performance con muchos detalles | 🟢 Baja | 🟡 Medio | Índices adecuados, paginación |
| Usuarios confundidos con nuevo UI | 🟡 Media | 🟡 Medio | Guía de usuario, tooltips claros |
| Archivos corruptos | 🟢 Baja | 🟡 Medio | Validación MIME, checksum |
| Acceso no autorizado | 🟢 Baja | 🔴 Alto | Middleware estricto, logs |

---

## 🔄 COMPARATIVO: Antes vs Después

| Aspecto | Antes | Después |
|---------|-------|---------|
| Fechas por reporte | 1 | Múltiples (1-10) |
| Distribución de horas | No | Sí |
| Almacenamiento archivos | `/public/uploads/` | Estructurado por usuario/reporte |
| Control de acceso | No | RBAC completo |
| Validaciones | Básicas | Críticas y robustas |
| UX | Básica | Intuitiva con feedback |
| Escalabilidad | Limitada | Alta |

---

## 🎯 CRITERIOS DE ÉXITO

- ✅ Estudiantes pueden reportar múltiples fechas
- ✅ Suma de horas es consistente
- ✅ Archivos seguros con control de acceso
- ✅ No hay regresiones en funcionalidad existente
- ✅ Performance aceptable (< 500ms por request)
- ✅ UX intuitiva (sin quejas de usuarios)
- ✅ Código limpio y documentado

---

## 📝 PRÓXIMOS PASOS

1. **Aprobación de diseño** por stakeholder
2. **Backup de BD** antes de migración
3. **Implementación Fase 1** (BD)
4. **Test de migración** en staging
5. **Implementación Fase 2-3** (Backend + Frontend)
6. **Testing completo**
7. **Deploy a producción**
8. **Monitoreo post-deploy**

---

## 📞 SOPORTE

Si hay dudas durante la implementación:
1. Revisar documentación detallada en:
   - `MEJORA_REPORTE_HORAS_SCHEMA.md`
   - `MEJORA_REPORTE_HORAS_BACKEND.md`
   - `MEJORA_REPORTE_HORAS_FRONTEND.md`
2. Validar contra requisitos originales
3. Consultar arquitecto senior para decisiones críticas
