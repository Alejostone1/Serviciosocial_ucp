# 📐 Arquitectura del Proyecto — UCP Servicio Social v5

> **Stack:** Next.js 14.2.15 (App Router) · TypeScript 5.3.2 · Prisma 5.22.0 · PostgreSQL · NextAuth.js 4.24.5 · Tailwind CSS 3.3.6

---

## 📋 Tabla de Contenidos

1. [Visión General](#1-visión-general)
2. [Estructura de Carpetas](#2-estructura-de-carpetas)
3. [Capa de Base de Datos](#3-capa-de-base-de-datos)
4. [Autenticación y Roles](#4-autenticación-y-roles)
5. [Rutas y Páginas](#5-rutas-y-páginas)
6. [API Routes](#6-api-routes)
7. [Componentes Compartidos](#7-componentes-compartidos)
8. [Librerías y Utilidades](#8-librerías-y-utilidades)
9. [Archivos de Configuración Raíz](#9-archivos-de-configuración-raíz)
10. [Archivos que NO tocar / ignorar](#10-archivos-que-no-tocar--ignorar)
11. [Flujos Principales del Sistema](#11-flujos-principales-del-sistema)
12. [Guía de Cambios Frecuentes](#12-guía-de-cambios-frecuentes)
13. [Variables de Entorno](#13-variables-de-entorno)
14. [Convenciones del Proyecto](#14-convenciones-del-proyecto)

---

## 1. Visión General

El sistema gestiona el **servicio social universitario** de la UCP. Los actores son:

| Rol | Qué puede hacer |
|-----|----------------|
| `ADMINISTRADOR` | Control total: usuarios, facultades, programas, reportes, auditoría |
| `PROFESOR` | Ver estudiantes de su programa, validar horas, emitir certificados |
| `ALIADO` | Crear convocatorias, revisar postulaciones, validar actividades |
| `ESTUDIANTE` | Postularse, reportar horas, descargar certificados |
| `AUXILIAR` | Validación básica de reportes (rol de apoyo) |

El ciclo de vida central es:

```
Convocatoria publicada
  → Estudiante se postula
    → Aliado/Profesor acepta postulación
      → Estudiante reporta horas
        → Aliado/Profesor valida horas
          → Admin/Profesor emite certificado
```

---

## 2. Estructura de Carpetas

```
/
├── prisma/                        ← Todo lo relacionado con la base de datos
│   ├── schema.prisma              ← Definición de modelos y relaciones
│   ├── seed.ts                    ← Datos iniciales del sistema
│   ├── seed-notificaciones.ts     ← Plantillas de notificación
│   └── modelo.sql                 ← SQL generado (referencia, no editar directo)
│
├── public/                        ← Archivos estáticos servidos tal cual
│   ├── logo-ucp.png
│   ├── favicon.ico
│   ├── grid.svg
│   └── uploads/                   ← Carpeta para archivos subidos localmente
│
├── src/
│   ├── app/                       ← Rutas Next.js (App Router) - 303 archivos
│   │   ├── (autenticacion)/       ← Grupo de rutas públicas de auth (8 archivos)
│   │   ├── Publico/              ← Rutas públicas (6 archivos)
│   │   ├── administrador/         ← Panel admin (protegido) - 119 archivos
│   │   ├── sistema/               ← Paneles por rol (protegidos) - 111 archivos
│   │   │   ├── estudiante/       ← Módulo estudiantes
│   │   │   ├── profesor/         ← Módulo profesores
│   │   │   ├── aliado/           ← Módulo aliados
│   │   │   └── auxiliar/         ← Módulo auxiliares
│   │   ├── api/                   ← API Routes (endpoints REST internos) - 55 archivos
│   │   ├── layout.tsx             ← Layout principal
│   │   ├── page.tsx               ← Landing page pública
│   │   ├── error.tsx              ← Manejo de errores
│   │   └── loading.tsx            ← Estados de carga
│   │
│   ├── components/                ← Componentes reutilizables - 91 archivos
│   │   ├── ui/                    ← Primitivos de UI (30 archivos) - botones, inputs, cards...
│   │   ├── forms/                 ← Formularios completos (8 archivos)
│   │   ├── layout/                ← Header, Sidebar, Breadcrumb... (10 archivos)
│   │   ├── administrador/          ← Components admin (1 archivo)
│   │   ├── certificados/          ← Vista previa, QR, verificador (3 archivos)
│   │   ├── convocatorias/         ← Componentes específicos de convocatorias (6 archivos)
│   │   ├── horas/                 ← Bandeja, historial, evidencia (4 archivos)
│   │   ├── noticias/              ← Formularios y dashboard de noticias (9 archivos)
│   │   ├── data-display/          ← Tablas, estados vacíos, loaders (6 archivos)
│   │   ├── home/                  ← Secciones de la landing page (10 archivos)
│   │   └── estudiante/            ← Components estudiantes (4 archivos)
│   │
│   ├── contexts/                  ← React Contexts globales (1 archivo)
│   ├── hooks/                     ← Custom hooks de React (8 archivos)
│   ├── lib/                       ← Utilidades, configuración de librerías (18 archivos)
│   ├── styles/                    ← CSS global y design tokens (3 archivos)
│   └── types/                     ← Tipos TypeScript globales (3 archivos)
│
├── scripts/                       ← Scripts de utilidad (no son parte del app)
├── middleware.ts                  ← Protección de rutas (Next.js middleware)
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 3. Capa de Base de Datos

### 3.1 Archivo principal: `prisma/schema.prisma`

Es **la fuente de verdad** de la estructura de datos. Cualquier cambio en la BD pasa por aquí.

**Workflow para modificar la BD:**
```bash
# 1. Editar schema.prisma
# 2. Crear migración
npx prisma migrate dev --name descripcion_del_cambio
# 3. Regenerar cliente
npx prisma generate
# 4. Si cambiaron modelos usados en el seed, actualizar seed.ts también
```

### 3.2 Modelos principales y sus relaciones

```
Facultad (1) ──── (N) Programa
Programa  (1) ──── (N) Usuario
                   (N) Convocatoria
                   (N) VinculacionAliado

Usuario   (1) ──── (1) PerfilEstudiante   ← solo si rol = ESTUDIANTE
          (1) ──── (N) Postulacion         ← como estudiante
          (1) ──── (N) Postulacion         ← como revisor
          (1) ──── (N) ReporteHoras        ← como estudiante
          (1) ──── (N) ReporteHoras        ← como revisor
          (1) ──── (N) Certificado         ← como emisor
          (1) ──── (N) Certificado         ← como receptor
          (1) ──── (N) Convocatoria        ← como publicador

Convocatoria (1) ──── (N) Actividad
             (1) ──── (N) Postulacion
             (1) ──── (N) Certificado

Actividad (1) ──── (N) ReporteHoras

ReporteHoras (1) ──── (N) HistorialHoras

Noticia (1) ──── (N) ImagenNoticia
PlantillaNotificacion (1) ──── (N) NotificacionMasiva
NotificacionMasiva    (1) ──── (N) HistorialEnvioNotif
```

### 3.3 Seeds

| Archivo | Propósito | Cuándo ejecutar |
|---------|-----------|-----------------|
| `prisma/seed.ts` | Datos base: admin, facultades, programas, categorías, convocatorias, actividades, usuarios de prueba, certificados, noticias | Primera instalación o reset total |
| `prisma/seed-notificaciones.ts` | Plantillas de notificación | Después del seed principal |

**Ejecutar seeds:**
```bash
# Seed principal
npx prisma db seed

# Seed de notificaciones directamente
npx ts-node prisma/seed-notificaciones.ts
```

**⚠️ El seed principal borra todas las actividades** (`prisma.actividad.deleteMany({})`) antes de recrearlas. Tenerlo en cuenta si se ejecuta en producción.

---

## 4. Autenticación y Roles

### 4.1 Configuración: `src/lib/auth.ts`

Usa **NextAuth.js**. La sesión incluye `id`, `rol`, `nombre`, `correo` e `id_programa` del usuario. Si necesitas agregar un campo nuevo a la sesión:

1. Editar `src/lib/auth.ts` → callback `jwt` y `session`
2. Editar `src/types/next-auth.d.ts` → extender los tipos de Session y JWT

### 4.2 Protección de rutas: `middleware.ts`

Es el **guardián de todas las rutas**. Define qué roles pueden acceder a qué prefijos de URL. Si creas una nueva sección, agrégala aquí.

```
/administrador/**  → solo ADMINISTRADOR
/sistema/profesor/**  → solo PROFESOR
/sistema/aliado/**    → solo ALIADO
/sistema/estudiante/** → solo ESTUDIANTE
/sistema/auxiliar/**  → solo AUXILIAR
```

### 4.3 Guard de componentes: `src/components/layout/role-guard.tsx`

Úsalo para ocultar/mostrar partes de la UI según el rol, sin redireccionar.

---

## 5. Rutas y Páginas

### 5.1 Rutas públicas

| Ruta | Archivo | Descripción |
|------|---------|-------------|
| `/` | `src/app/page.tsx` | Landing page principal |
| `/convocatorias` | `src/app/convocatorias/page.tsx` | Lista pública de convocatorias |
| `/convocatorias/[id]` | `src/app/convocatorias/[id]/page.tsx` | Detalle de una convocatoria |
| `/noticias` | `src/app/noticias/page.tsx` | Lista de noticias |
| `/noticias/[slug]` | `src/app/noticias/[slug]/page.tsx` | Detalle de noticia |
| `/validar-certificado` | `src/app/validar-certificado/page.tsx` | Verificar un certificado por código |
| `/reglamentos` | `src/app/reglamentos/page.tsx` | Página de reglamentos |

### 5.2 Rutas de autenticación `(autenticacion)/`

> El paréntesis indica **grupo de rutas** — no aparece en la URL.

| Ruta URL | Archivo | Descripción |
|----------|---------|-------------|
| `/login` | `.../login/page.tsx` | Formulario de login |
| `/registro` | `.../registro/page.tsx` | Registro de nuevos usuarios |
| `/recuperar-contrasena` | `.../recuperar-contrasena/page.tsx` | Solicitar recuperación |
| `/restablecer-contrasena` | `.../restablecer-contrasena/page.tsx` | Nueva contraseña con token |

### 5.3 Panel Administrador `/administrador/`

Cada módulo sigue el patrón: `page.tsx` (server) + `client.tsx` (interactividad) + `actions.ts` (Server Actions).

| Módulo | Ruta | Qué gestiona |
|--------|------|--------------|
| Dashboard | `/administrador` | Métricas globales |
| Usuarios | `/administrador/usuarios` | CRUD de todos los usuarios |
| Facultades | `/administrador/facultades` | CRUD de facultades |
| Programas | `/administrador/programas` | CRUD de programas académicos |
| Categorías | `/administrador/categorias` | Categorías de servicio social |
| Convocatorias | `/administrador/convocatorias` | Gestión completa de convocatorias |
| Actividades | `/administrador/actividades` | Actividades dentro de convocatorias |
| Postulaciones | `/administrador/postulaciones` | Revisión de postulaciones |
| Reportes de horas | `/administrador/reportes` | Validación de horas reportadas |
| Certificados | `/administrador/certificados` | Emisión y gestión de certificados |
| Noticias | `/administrador/noticias` | CMS de noticias institucionales |
| Notificaciones | `/administrador/notificaciones` | Plantillas y envíos masivos |
| Vinculaciones | `/administrador/vinculaciones` | Aliados ↔ Programas |
| Auditoría | `/administrador/auditoria` | Logs de actividad del sistema |
| Configuración | `/administrador/configuracion` | Config del sistema |

### 5.4 Panel Estudiante `/sistema/estudiante/`

| Ruta | Descripción |
|------|-------------|
| `/sistema/estudiante` | Dashboard personal |
| `/sistema/estudiante/convocatorias` | Explorar y postularse |
| `/sistema/estudiante/mis-postulaciones` | Estado de postulaciones |
| `/sistema/estudiante/mis-actividades` | Actividades activas |
| `/sistema/estudiante/mis-horas` | Historial de reportes |
| `/sistema/estudiante/mis-horas/reportar` | Reportar nuevas horas |
| `/sistema/estudiante/mis-certificados` | Descargar certificados |
| `/sistema/estudiante/perfil` | Editar perfil |

### 5.5 Panel Profesor `/sistema/profesor/`

| Ruta | Descripción |
|------|-------------|
| `/sistema/profesor` | Dashboard |
| `/sistema/profesor/dashboard` | Vista detallada |
| `/sistema/profesor/estudiantes` | Estudiantes de su programa |
| `/sistema/profesor/estudiantes/carga-masiva` | Importar estudiantes CSV |
| `/sistema/profesor/convocatorias` | Convocatorias de su programa |
| `/sistema/profesor/reportes` | Validar reportes de horas |
| `/sistema/profesor/reportes/exportar` | Exportar reportes |
| `/sistema/profesor/certificados/emitidos` | Certificados emitidos |

### 5.6 Panel Aliado `/sistema/aliado/`

| Ruta | Descripción |
|------|-------------|
| `/sistema/aliado` | Dashboard |
| `/sistema/aliado/convocatorias` | Sus convocatorias |
| `/sistema/aliado/convocatorias/nueva` | Crear convocatoria |
| `/sistema/aliado/convocatorias/[id]/editar` | Editar convocatoria |
| `/sistema/aliado/convocatorias/[id]/actividades` | Gestionar actividades |
| `/sistema/aliado/postulaciones` | Revisar postulaciones |
| `/sistema/aliado/validacion` | Validar reportes de horas |
| `/sistema/aliado/certificados/emitir` | Emitir certificados |
| `/sistema/aliado/certificados/emitidos` | Historial de emisiones |

---

## 6. API Routes

Todas viven en `src/app/api/`. Son endpoints REST usados desde el cliente o desde Server Actions.

### Patrón de carpetas

```
src/app/api/
├── auth/
│   ├── [...nextauth]/route.ts     ← Manejo de sesión NextAuth
│   └── recuperar/route.ts         ← Envío de email de recuperación
│
├── usuarios/
│   ├── route.ts                   ← GET lista / POST crear
│   ├── [id]/route.ts              ← GET uno / PUT / DELETE
│   └── carga-masiva/route.ts      ← POST importación masiva CSV
│
├── convocatorias/
│   ├── route.ts                   ← GET / POST
│   ├── [id]/route.ts              ← GET / PUT / DELETE
│   ├── [id]/postular/route.ts     ← POST postularse
│   └── public/route.ts            ← GET sin autenticación (landing)
│
├── horas/
│   ├── route.ts                   ← GET / POST reporte
│   ├── [id]/validar/route.ts      ← POST aprobar horas
│   └── [id]/rechazar/route.ts     ← POST rechazar horas
│
├── certificados/
│   ├── route.ts                   ← GET / POST
│   └── [id]/descargar/route.ts    ← GET PDF
│
├── noticias/
│   ├── route.ts
│   ├── [id]/route.ts
│   └── upload-image/route.ts      ← POST subir imagen (Cloudinary)
│
├── postulaciones/
│   ├── route.ts
│   ├── [id]/aceptar/route.ts
│   └── [id]/rechazar/route.ts
│
├── reporte/                       ← Reportes exportables (Excel/PDF)
│   ├── actividades/route.ts
│   ├── certificados/route.ts
│   ├── convocatorias/route.ts
│   └── estudiantes/route.ts
│
├── facultades/                    ← CRUD facultades
├── programas/                     ← CRUD programas
├── actividades/                   ← CRUD actividades
└── admin/                         ← Endpoints exclusivos admin
    ├── usuarios/route.ts
    ├── programas/route.ts
    ├── facultades/route.ts
    └── notificaciones/route.ts
```

### Convención de respuestas API

```typescript
// Éxito
return NextResponse.json({ data: resultado }, { status: 200 });

// Error de validación
return NextResponse.json({ error: "Mensaje" }, { status: 400 });

// No autorizado
return NextResponse.json({ error: "Sin permisos" }, { status: 403 });

// No encontrado
return NextResponse.json({ error: "No existe" }, { status: 404 });
```

---

## 7. Componentes Compartidos

### 7.1 `src/components/ui/` — Primitivos de UI

Son los bloques más básicos. Generalmente son adaptaciones de **shadcn/ui**.

| Componente | Uso |
|-----------|-----|
| `button.tsx` | Botones con variantes (primary, outline, ghost...) |
| `input.tsx` | Input de texto base |
| `card.tsx` | Contenedor de card básico |
| `dialog.tsx` | Modal genérico |
| `table.tsx` | Tabla HTML estilizada |
| `badge.tsx` | Etiquetas de estado |
| `toast.tsx` + `toaster.tsx` | Notificaciones toast |
| `select.tsx` | Dropdown de selección |
| `tabs.tsx` | Pestañas de navegación |
| `pagination.tsx` | Paginación de tablas |
| `confirm-dialog.tsx` | Modal de confirmación de acciones destructivas |
| `form-modal.tsx` | Wrapper para modales con formulario |
| `status-badge.tsx` | Badge con colores según estado (ACEPTADA, RECHAZADA...) |
| `metric-card.tsx` | Card de métrica con número grande |
| `skeleton.tsx` | Loading skeleton |
| `progress.tsx` | Barra de progreso |
| `data-table.tsx` | Tabla con filtros y paginación integrados |

### 7.2 `src/components/forms/` — Formularios completos

Cada archivo es un formulario reutilizable que puede usarse en páginas y modales.

| Formulario | Entidad |
|-----------|---------|
| `usuario-form.tsx` | Crear/editar usuario |
| `convocatoria-form.tsx` | Crear/editar convocatoria |
| `actividad-form.tsx` | Crear/editar actividad |
| `postulacion-form.tsx` | Datos de postulación |
| `reporte-horas-form.tsx` | Reporte de horas |
| `perfil-estudiante-form.tsx` | Perfil del estudiante |
| `login-form.tsx` | Login |
| `carga-masiva-form.tsx` | Importación CSV |

### 7.3 `src/components/layout/` — Estructura de página

| Componente | Qué hace |
|-----------|---------|
| `admin-sidebar.tsx` | Sidebar del panel administrador |
| `admin-header.tsx` | Header del panel administrador |
| `sidebar.tsx` | Sidebar genérico |
| `header.tsx` | Header genérico |
| `breadcrumb.tsx` | Migas de pan |
| `user-nav.tsx` | Menú de usuario (avatar + logout) |
| `providers.tsx` | Wrapper de SessionProvider y otros providers globales |
| `role-guard.tsx` | Muestra/oculta contenido según rol |
| `nav-links.tsx` | Links de navegación del sidebar |

### 7.4 `src/components/data-display/`

| Componente | Uso |
|-----------|-----|
| `data-table.tsx` | Tabla de datos genérica con búsqueda |
| `empty-state.tsx` | Pantalla de "no hay datos" |
| `loading-table.tsx` | Skeleton de tabla cargando |
| `stats-cards.tsx` | Grupo de cards de estadísticas |
| `progress-horas.tsx` | Barra de progreso de horas |
| `timeline-auditoria.tsx` | Timeline de historial de cambios |

---

## 8. Librerías y Utilidades

### `src/lib/`

| Archivo | Qué hace |
|---------|---------|
| `prisma.ts` | Instancia singleton de PrismaClient |
| `auth.ts` | Configuración de NextAuth 4.24.5 (providers, callbacks, JWT) |
| `email.ts` | Envío de correos (Nodemailer 7.0.13 + Resend 2.0.0) |
| `whatsapp.ts` | Integración con WhatsApp para notificaciones |
| `fileUpload.ts` | Subida de archivos a Cloudinary (next-cloudinary 5.10.0) |
| `formatters.ts` | Formateo de fechas, números, monedas (date-fns 2.30.0) |
| `validations.ts` | Esquemas Zod 3.25.76 de validación |
| `utils.ts` | Funciones de utilidad generales (`cn()`, etc.) |
| `constants.ts` | Constantes del sistema (estados, roles, textos) |
| `security.ts` | Funciones de seguridad (bcrypt 6.0.0 + bcryptjs 3.0.3) |
| `decimal-utils.ts` | Manejo de tipos Decimal de Prisma |
| `api-client.ts` | Cliente HTTP para llamadas fetch desde el cliente |
| `env.ts` | Validación y tipado de variables de entorno |
| `btn-variants.ts` | Variantes de botones para clases Tailwind |
| `pdf-utils.ts` | Generación de PDFs (jspdf 4.2.1 + jspdf-autotable 5.0.7) |
| `excel-utils.ts` | Exportación a Excel (exceljs 4.4.0 + xlsx 0.18.5) |
| `qr-utils.ts` | Generación de códigos QR (qrcode 1.5.4) |
| `canvas-utils.ts` | Manipulación de imágenes (canvas 3.2.1 + html2canvas 1.4.1) |

### `src/hooks/`

Custom hooks que encapsulan lógica de fetch y estado:

| Hook | Qué provee |
|------|-----------|
| `use-auth.ts` | Acceso a la sesión y datos del usuario |
| `use-convocatorias.ts` | Lista y operaciones de convocatorias |
| `use-postulaciones.ts` | Postulaciones del estudiante actual |
| `use-horas.ts` | Reportes de horas |
| `use-reportes.ts` | Reportes administrativos |
| `use-certificados.ts` | Certificados |
| `use-usuarios.ts` | Lista de usuarios (admin) |
| `use-toast.ts` | Disparar toasts de notificación |

### `src/contexts/`

| Contexto | Qué provee |
|---------|-----------|
| `NotificationContext.tsx` | Notificaciones en tiempo real / polling |

### `src/types/`

| Archivo | Contenido |
|---------|----------|
| `index.ts` (raíz) | Tipos globales duplicados (legacy, preferir `src/types/`) |
| `src/types/index.ts` | Tipos principales: DTOs, respuestas API, tipos de UI |
| `src/types/api.ts` | Tipos específicos de respuestas API |
| `src/types/next-auth.d.ts` | Extensión de tipos de NextAuth (sesión, JWT) |

---

## 9. Archivos de Configuración Raíz

| Archivo | Propósito | ¿Editar? |
|---------|-----------|---------|
| `next.config.js` | Config de Next.js (imágenes remotas, redirects, env...) | Sí, con cuidado |
| `tailwind.config.ts` | Tema, colores, fuentes, plugins de Tailwind | Sí para ajustar diseño |
| `tsconfig.json` | Config de TypeScript (paths, strict, etc.) | Rara vez |
| `postcss.config.js` | Pipeline CSS (Tailwind + Autoprefixer) | No tocar |
| `middleware.ts` | Protección de rutas, redirecciones | Sí al agregar rutas |
| `components.json` | Config de shadcn/ui (rutas de componentes, estilos) | No tocar |
| `.env.example` | Plantilla de variables de entorno | Documentar variables nuevas aquí |
| `.gitignore` | Archivos ignorados por Git | Agregar si es necesario |
| `.eslintrc.json` | Reglas de linting | Ajustar según preferencia |
| `package.json` | Dependencias y scripts | Sí para instalar paquetes |

---

## 10. Archivos que NO tocar / Ignorar

Estos archivos son basura acumulada, backups o archivos de entorno local. **No editar, no commit:**

```
# Backups de desarrollo (no eliminar por si acaso, pero ignorar)
src/app/administrador/layout.tsx.backup
src/middleware.ts.backup

# Páginas duplicadas/experimentales en noticias (hay muchas variantes)
src/app/administrador/noticias/page-backup.tsx
src/app/administrador/noticias/page-broken.tsx
src/app/administrador/noticias/nueva/simple-page.tsx
src/app/administrador/noticias/[id]/editar/simple-page.tsx
src/app/administrador/noticias/[id]/vista-previa/page-modern.tsx
src/app/administrador/noticias/[id]/vista-previa/simple-page.tsx
src/app/administrador/noticias-directas/page.tsx         ← ruta experimental

# Componentes de noticias duplicados (hay 7 variantes del mismo form)
src/components/noticias/enhanced-noticia-form.tsx        ← variante
src/components/noticias/modern-noticia-form.tsx          ← variante
src/components/noticias/professional-noticia-form.tsx    ← variante
src/components/noticias/simple-noticia-form.tsx          ← variante
# → El que se usa realmente es: noticia-form.tsx

# Página de test admin
src/app/administrador/test-simple/page.tsx

# Scripts de utilidad puntual (no son parte del app)
scripts/create-multiple-test-news.ts
scripts/create-test-news.ts
scripts/replace-btn-classes.ps1

# SQL temporal
temp.sql

# Archivo de Windows (ignorar completamente)
desktop.ini

# Nunca subir al repo
.env
node_modules/
.next/
```

**Recomendación:** Crear un issue o tarea para limpiar los archivos duplicados de noticias cuando haya tiempo.

---

## 11. Flujos Principales del Sistema

### Flujo 1: Crear una convocatoria nueva

```
Admin o Aliado
  → POST /api/convocatorias  (con datos del formulario)
    → Prisma crea Convocatoria + Actividades
      → Sistema envía notificación masiva a estudiantes del programa
        → Convocatoria aparece en /convocatorias (pública)
```

**Archivos involucrados:**
- `src/components/forms/convocatoria-form.tsx`
- `src/app/administrador/convocatorias/nueva-convocatoria-integrada-modal.tsx`
- `src/app/api/convocatorias/route.ts`
- `src/app/administrador/convocatorias/actions.ts`

### Flujo 2: Estudiante reporta horas

```
Estudiante
  → /sistema/estudiante/mis-horas/reportar
    → POST /api/horas (horas + actividad + evidencia)
      → Estado: REPORTADO
        → Notificación al Profesor/Aliado revisor
          → Revisor valida → POST /api/horas/[id]/validar
            → Estado: APROBADO
              → PerfilEstudiante.horas_acumuladas += horas_aprobadas
                → HistorialHoras registra el cambio
```

**Archivos involucrados:**
- `src/app/sistema/estudiante/mis-horas/reportar/reportar-client.tsx`
- `src/app/api/horas/route.ts`
- `src/app/api/horas/[id]/validar/route.ts`
- `src/components/horas/bandeja-validacion.tsx`

### Flujo 3: Emitir un certificado

```
Admin o Profesor
  → /administrador/certificados  o  /sistema/profesor/certificados/emitir
    → POST /api/certificados (id_estudiante + id_convocatoria + horas)
      → Prisma crea Certificado con codigo_verificacion UUID único
        → GET /api/certificado/[id]/generar-pdf
          → PDF generado con QR que apunta a /validar-certificado/[codigo]
            → Notificación email al estudiante
```

**Archivos involucrados:**
- `src/app/api/certificados/route.ts`
- `src/app/api/certificado/[id]/generar-pdf/route.ts`
- `src/components/certificados/certificado-preview.tsx`
- `src/components/certificados/generador-qr.tsx`

---

## 12. Guía de Cambios Frecuentes

### ➕ Agregar un campo nuevo a un modelo

```bash
# 1. Editar prisma/schema.prisma
# 2. Crear migración
npx prisma migrate dev --name add_campo_x_a_modelo_y
# 3. Si el campo tiene valor por defecto, actualizar seed.ts
# 4. Actualizar el tipo TS en src/types/index.ts
# 5. Agregar al formulario correspondiente en src/components/forms/
# 6. Agregar a la API route correspondiente
```

### ➕ Agregar una nueva página al panel admin

```
1. Crear carpeta: src/app/administrador/mi-modulo/
2. Crear: page.tsx (Server Component, obtiene datos)
3. Crear: client.tsx (Client Component, interactividad)
4. Crear: actions.ts (Server Actions)
5. Agregar el link al sidebar: src/components/layout/admin-sidebar.tsx
```

### ➕ Agregar un nuevo rol

```
1. Agregar al enum Rol en prisma/schema.prisma
2. npx prisma migrate dev --name add_rol_x
3. Agregar al middleware.ts las rutas que puede acceder
4. Crear carpeta: src/app/sistema/nuevo-rol/
5. Crear layout.tsx con verificación de sesión
6. Actualizar src/types/next-auth.d.ts si es necesario
```

### ➕ Agregar un nuevo tipo de notificación

```
1. Agregar al enum TipoNotificacion en schema.prisma
2. npx prisma migrate dev
3. Crear plantilla en prisma/seed-notificaciones.ts
4. Re-ejecutar el seed de notificaciones
5. Usar la función de envío en el lugar del negocio que lo dispara
```

### 🔧 Cambiar el diseño de una página existente

- Los archivos `page.tsx` son **Server Components** → no pueden tener estado ni eventos
- Los archivos `client.tsx` o `*-client.tsx` son **Client Components** → pueden tener `useState`, `useEffect`, etc.
- Para cambiar datos que se muestran: editar la query en `page.tsx`
- Para cambiar la UI interactiva: editar el `client.tsx` correspondiente

---

## 13. Variables de Entorno

Basado en `.env.example`. Crear un `.env` local con estos valores:

```bash
# Base de datos
DATABASE_URL="postgresql://usuario:password@localhost:5432/ucp_servicio_social"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="tu-secret-aleatorio-largo"

# Email (Nodemailer / Resend)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="tu-correo@gmail.com"
EMAIL_PASS="tu-app-password"
EMAIL_FROM="Sistema UCP <no-reply@ucp.edu.co>"

# Cloudinary (subida de imágenes)
CLOUDINARY_CLOUD_NAME="tu-cloud-name"
CLOUDINARY_API_KEY="tu-api-key"
CLOUDINARY_API_SECRET="tu-api-secret"

# WhatsApp (opcional)
WHATSAPP_API_URL="https://..."
WHATSAPP_TOKEN="..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 14. Convenciones del Proyecto

### Nomenclatura de archivos

| Tipo | Convención | Ejemplo |
|------|-----------|---------|
| Página server | `page.tsx` | `src/app/admin/usuarios/page.tsx` |
| Componente client | `*-client.tsx` o `client.tsx` | `usuarios-client.tsx` |
| Server Actions | `actions.ts` | `src/app/admin/usuarios/actions.ts` |
| Componente UI | PascalCase | `UserCard.tsx` |
| Hook | `use-*.ts` | `use-usuarios.ts` |
| Utilidad | kebab-case | `decimal-utils.ts` |

### Patrón Server/Client en módulos admin

```tsx
// page.tsx → Server Component
export default async function UsuariosPage() {
  const usuarios = await prisma.usuario.findMany(); // query directa
  return <UsuariosClient usuarios={usuarios} />;
}

// client.tsx → Client Component
'use client';
export function UsuariosClient({ usuarios }) {
  const [filtro, setFiltro] = useState('');
  // toda la interactividad aquí
}

// actions.ts → Server Actions
'use server';
export async function crearUsuario(data: FormData) {
  // validar + prisma + revalidatePath
}
```

### Manejo de errores en API Routes

```typescript
try {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  
  // lógica...
  
} catch (error) {
  console.error('[RUTA] Error:', error);
  return NextResponse.json({ error: 'Error interno' }, { status: 500 });
}
```

### Tipos Decimal de Prisma

Prisma devuelve `Decimal` (no `number`) para campos `@db.Decimal`. Usar el helper:

```typescript
import { toNumber } from '@/lib/decimal-utils';
const horas = toNumber(perfil.horas_acumuladas); // convierte a number
```

---

> Última actualización: generado automáticamente desde la estructura del proyecto.
> Actualizar este documento cuando se agreguen módulos, rutas o cambios estructurales importantes.
