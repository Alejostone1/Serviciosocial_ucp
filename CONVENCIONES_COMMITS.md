# Convenciones de Commits - Sistema de Servicio Social UCP

## Idioma
**Todos los commits deben estar en español**

## Formato de Mensajes de Commit

### Estructura
```
tipo: descripción breve y clara

• Cambio principal 1:
  - detalle específico
  - otro detalle

• Cambio principal 2:
  - detalle específico

Cambios técnicos: X archivos modificados, Y inserciones, Z eliminaciones
```

### Tipos de Commit
- `feat`: Nueva funcionalidad
- `fix`: Corrección de errores
- `refactor`: Reestructuración de código
- `style`: Cambios de formato/estilo
- `docs`: Documentación
- `test`: Pruebas
- `chore`: Mantenimiento

### Ejemplos

#### ✅ Correcto
```
feat: agregar dashboard para estudiantes con estadísticas en tiempo real

• Componentes nuevos:
  - StatsCard con barras de progreso
  - DashboardCard con gráficos interactivos
  - Filtros de búsqueda por estado

• Mejoras de UX:
  - Estados hover con rojo institucional
  - Mejor retroalimentación visual
  - Diseño responsive

Cambios técnicos: 5 archivos modificados, 234 inserciones, 45 eliminaciones
```

```
fix: corregir error de middleware para rol profesor

• Middleware actualizado:
  - Agregar /sistema/profesor a rutas protegidas
  - Incluir PROFESOR en mapeo de roles
  - Actualizar matcher para rutas profesor

• Validaciones mejoradas:
  - Verificación correcta de permisos
  - Mejor manejo de redirecciones

Cambios técnicos: 2 archivos modificados, 15 inserciones, 3 eliminaciones
```

#### ❌ Incorrecto
```
Fix middleware bug
Add new feature
Update colors
```

## Reglas Adicionales

1. **Siempre en español**: Todos los mensajes deben estar en español
2. **Descripción clara**: El título debe ser conciso pero descriptivo
3. **Detalles en viñetas**: Usar viñetas para listar cambios específicos
4. **Resumen técnico**: Incluir estadísticas de cambios al final
5. **Verbos en infinitivo**: Usar "agregar", "corregir", "mejorar" etc.
6. **Tono profesional**: Mantener lenguaje formal pero claro

## Comandos Útiles

```bash
# Ver últimos commits
git log --oneline -5

# Ver detalles de un commit
git show --stat HEAD

# Modificar último commit (si aún no se ha push)
git commit --amend

# Ver historial con formato completo
git log --pretty=format:"%h - %an (%ar): %s"
```

## Ejemplo de Flujo de Trabajo

```bash
# Hacer cambios
git add .

# Commit con mensaje en español
git commit -m "feat: agregar sistema de notificaciones push

• Funcionalidad principal:
  - Integración con Firebase Cloud Messaging
  - Notificaciones en tiempo real
  - Panel de configuración

• Componentes nuevos:
  - NotificationBell con contador
  - NotificationSettings con preferencias
  - Toast notifications mejoradas

Cambios técnicos: 8 archivos modificados, 456 inserciones, 23 eliminaciones"

# Push al repositorio
git push origin main
```

---

**Nota**: Esta convención aplica a todo el equipo de desarrollo del Sistema de Servicio Social UCP.
