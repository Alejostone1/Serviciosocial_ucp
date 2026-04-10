# 🎓 UCP Servicio Social - Sistema de Gestión Integral

<div align="center">
  <img src="https://img.icons8.com/color/gradient/256/university.png" alt="UCP Logo" width="120"/>
</div>

**Sistema web moderno para la gestión integral del servicio social universitario**  
Desarrollado con tecnología de última generación para optimizar el proceso administrativo y mejorar la experiencia de estudiantes, administradores y aliados.

---

## 📋 Tabla de Contenidos

- [🏗️ Arquitectura del Sistema](#arquitectura-del-sistema)
- [🛠️ Tecnologías Utilizadas](#tecnologías-utilizadas)
- [📁 Estructura del Proyecto](#estructura-del-proyecto)
- [🚀 Instalación y Configuración](#instalación-y-configuración)
- [⚡ Scripts Disponibles](#scripts-disponibles)
- [🔧 Variables de Entorno](#variables-de-entorno)
- [🔄 Flujo del Sistema](#flujo-del-sistema)
- [✅ Buenas Prácticas](#buenas-prácticas)
- [🏛️ Convenciones del Proyecto](#convenciones-del-proyecto)
- [📊 Estado del Proyecto](#estado-del-proyecto)
- [🔮 Posibles Mejoras](#posibles-mejoras)

---

## 🏗️ Arquitectura del Sistema

### 🎯 **Arquitectura Modular y Escalable**

El sistema implementa una **arquitectura limpia y modular** siguiendo las mejores prácticas de desarrollo web moderno:

```
┌─────────────────────────────────────────────────────┐
│                 🎓 UCP SERVICIO SOCIAL               │
├─────────────────────────────────────────────────────┤
│  Frontend (Next.js 14)    │    Backend (API Routes)    │
│  ┌─────────────────────┐    │    ┌─────────────────────┐    │
│  │  React 18        │    │    │  PostgreSQL       │    │
│  │  TypeScript       │    │    │  Prisma ORM      │    │
│  │  Tailwind CSS     │    │    │  NextAuth.js      │    │
│  └─────────────────────┘    │    └─────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

### 🏛️ **Patrones Arquitectónicos Implementados**

- **✨ Component-Based Architecture**: Componentes reutilizables y atómicos
- **🔀 Next.js App Router**: Routing basado en sistema de archivos
- **🔐 Server-Side Authentication**: Manejo seguro de sesiones
- **📡 API Routes**: Endpoints RESTful en `/api/*`
- **🗄️ Type Safety**: TypeScript estricto en todo el stack
- **🎨 Atomic Design**: Sistema de diseño UI consistente

---

## 🛠️ Tecnologías Utilizadas

### 🎯 **Core Stack**

| Categoría | Tecnología | Versión | Propósito |
|-----------|------------|----------|-----------|
| **Framework Frontend** | ![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js) | 14.2.15 | Framework full-stack con SSR |
| **UI Library** | ![React](https://img.shields.io/badge/React-2020AEE?style=for-the-badge&logo=react) | 18.2.0 | Librería de componentes |
| **Language** | ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript) | 5.3.2 | Tipado estático estricto |
| **Styling** | ![Tailwind](https://img.shields.io/badge/Tailwind-06B6D4?style=for-the-badge&logo=tailwind-css) | 3.3.6 | Utility-first CSS |
| **Database** | ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql) | 15+ | Base de datos relacional |

### 🛠️ **Librerías Principales**

| Tipo | Librería | Versión | Uso Principal |
|-------|------------|----------|----------------|
| **ORM** | @prisma/client | 5.22.0 | Mapeo objeto-relacional |
| **Auth** | next-auth | 4.24.5 | Gestión de sesiones |
| **Forms** | react-hook-form | 7.71.2 | Manejo de formularios |
| **Validation** | zod | 3.25.76 | Validación de datos |
| **UI Components** | @radix-ui | 1.3.0 | Componentes accesibles |
| **Charts** | recharts | 2.10.3 | Visualizaciones de datos |
| **HTTP Client** | axios | 1.7.9 | Peticiones API |

### 🎨 **Librerías UI y Estilo**

- **@/ui**: Componentes personalizados con diseño consistente
- **lucide-react**: Iconos modernos y consistentes
- **framer-motion**: Animaciones fluidas y micro-interacciones
- **sonner**: Sistema de notificaciones toast
- **clsx**: Utilidad para className condicional

### 📄 **Manejo de Documentos**

- **jspdf**: Generación de PDFs para certificados
- **exceljs**: Exportación de datos a Excel
- **canvas**: Manipulación de imágenes para evidencias
- **qrcode**: Generación de códigos QR

---

## 📁 Estructura del Proyecto

### 🌳 **Árbol de Directorios**

```
ServicioUCP_v5/
├── 📁 prisma/                    # Base de datos y migraciones
│   ├── schema.prisma           # Modelo de datos completo
│   ├── modelo.sql              # Script SQL de creación
│   ├── seed.ts                 # Datos iniciales
│   └── seed-notificaciones.ts  # Notificaciones iniciales
│
├── 📁 src/                       # Código fuente principal
│   ├── 📁 app/                    # Next.js App Router (303 archivos)
│   │   ├── 📁 (autenticacion)/   # Rutas de autenticación
│   │   ├── 📁 Publico/           # Rutas públicas
│   │   ├── 📁 administrador/       # Panel administrativo (119 archivos)
│   │   ├── 📁 sistema/            # Sistema interno (111 archivos)
│   │   │   ├── 📁 aliado/          # Módulo aliados
│   │   │   ├── 📁 auxiliar/        # Módulo auxiliares
│   │   │   ├── 📁 estudiante/      # Módulo estudiantes
│   │   │   └── 📁 profesor/        # Módulo profesores
│   │   ├── 📁 api/                # API Routes (55 archivos)
│   │   ├── layout.tsx              # Layout principal
│   │   └── page.tsx               # Home page
│   │
│   ├── 📁 components/             # Componentes React (91 archivos)
│   │   ├── 📁 ui/                # Componentes base UI (30 archivos)
│   │   ├── 📁 forms/             # Formularios reutilizables (8 archivos)
│   │   ├── 📁 layout/            # Components de layout (10 archivos)
│   │   ├── 📁 administrador/      # Components admin
│   │   ├── 📁 certificados/      # Components certificados (3 archivos)
│   │   ├── 📁 convocatorias/      # Components convocatorias (6 archivos)
│   │   ├── 📁 estudiante/        # Components estudiantes (4 archivos)
│   │   ├── 📁 horas/             # Components horas (4 archivos)
│   │   ├── 📁 noticias/           # Components noticias (9 archivos)
│   │   ├── 📁 home/              # Components home (10 archivos)
│   │   └── 📁 data-display/      # Visualización de datos (6 archivos)
│   │
│   ├── 📁 lib/                    # Utilidades y configuración (18 archivos)
│   │   ├── auth.ts               # Configuración NextAuth
│   │   ├── 📁 hooks/                  # Custom React hooks (8 archivos)
│   │   ├── 📁 types/                 # Tipos TypeScript (3 archivos)
│   │   └── 📁 styles/                # Estilos globales (3 archivos)
│   │
├── 📄 package.json                # Dependencias y scripts
├── 📄 tailwind.config.ts           # Configuración Tailwind
├── 📄 tsconfig.json               # Configuración TypeScript
├── 📄 middleware.ts                # Middleware de Next.js
├── 📄 components.json              # Configuración shadcn/ui
└── 📄 README.md                  # Documentación del proyecto
```

### 📂 **Propósito de Directorios Principales**

| Directorio | Propósito | Contenido Clave |
|-------------|-------------|------------------|
| **`src/app/`** | Rutas de la aplicación | Pages, layouts, API routes |
| **`src/components/`** | Componentes UI | Elementos reutilizables de interfaz |
| **`src/lib/`** | Lógica compartida | Utilidades, auth, helpers |
| **`src/hooks/`** | Lógica de estado | Custom hooks React |
| **`src/types/`** | Definiciones de tipos | Interfaces TypeScript |
| **`prisma/`** | Base de datos | Schema, migraciones, seeds |

---

## 🚀 Instalación y Configuración

### 📋 **Requisitos Previos**

- **Node.js** >= 18.0.0
- **npm** >= 8.0.0
- **PostgreSQL** >= 13
- **Git** para control de versiones

### ⚙️ **Pasos de Instalación**

```bash
# 1. Clonar el repositorio
git clone https://github.com/Alejostone1/Serviciosocial_ucp.git

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# 4. Generar cliente Prisma
npm run db:generate

# 5. Ejecutar migraciones
npm run db:migrate

# 6. Iniciar servidor de desarrollo
npm run dev
```

### 🔧 **Configuración de Variables de Entorno**

Crear archivo `.env` en la raíz del proyecto:

```env
# Base de datos
DATABASE_URL="postgresql://usuario:password@localhost:5432/servicio_social_ucp"

# NextAuth.js
NEXTAUTH_SECRET="tu_secreto_super_seguro_aqui"
NEXTAUTH_URL="http://localhost:3000"

# API externas
CLOUDINARY_CLOUD_NAME="tu_cloudinary_name"
CLOUDINARY_API_KEY="tu_api_key"
CLOUDINARY_API_SECRET="tu_api_secret"

# Email (opcional)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="tu_email@gmail.com"
EMAIL_PASS="tu_app_password"
```

---

## ⚡ Scripts Disponibles

### 🎯 **Scripts de Desarrollo**

```json
{
  "scripts": {
    "dev": "next dev",           // Servidor desarrollo (http://localhost:3000)
    "build": "next build",       // Build producción optimizado
    "start": "next start",       // Servidor producción
    "lint": "next lint",         // Análisis de código ESLint
    "type-check": "tsc --noEmit"  // Verificación tipos TypeScript
  }
}
```

### 🗄️ **Scripts de Base de Datos**

```json
{
  "scripts": {
    "db:generate": "prisma generate",    // Generar cliente Prisma
    "db:migrate": "prisma migrate dev",   // Aplicar migraciones
    "db:deploy": "prisma migrate deploy", // Migraciones producción
    "db:seed": "tsx prisma/seed.ts",     // Poblar datos iniciales
    "db:studio": "prisma studio",       // Interfaz visual BD
    "db:pull": "prisma db pull",       // Sincronizar schema remoto
    "db:push": "prisma db push",       // Subir cambios schema
    "db:reset": "prisma migrate reset"   // Resetear base de datos
  }
}
```

### 📊 **Uso Recomendado**

```bash
# Flujo de trabajo típico
npm run dev                    # Iniciar desarrollo
npm run db:studio              # Explorar base de datos
npm run build                   # Verificar build producción
npm run lint                     # Revisar calidad código
```

---

## 🔄 Flujo del Sistema

### 🎭 **Actores del Sistema**

```mermaid
graph TD
    A[Estudiante] --> B[Postulación a Convocatorias]
    A --> C[Reporte de Horas]
    A --> D[Solicitud Certificado]
    
    E[Aliado] --> F[Publicar Convocatorias]
    E --> G[Validar Reportes]
    E --> H[Emitir Certificados]
    
    I[Administrador] --> J[Gestión Usuarios]
    I --> K[Gestión Convocatorias]
    I --> L[Reportes y Auditoría]
    
    M[Profesor] --> N[Validar Actividades]
    M --> O[Supervisión Estudiantes]
    
    P[Auxiliar] --> Q[Soporte General]
    P --> R[Validación Preliminar]
```

### 🔄 **Flujo de Autenticación**

```mermaid
sequenceDiagram
    participant U as Usuario
    participant A as App
    participant D as Database
    participant G as Google/Email
    
    U->>A: Login con credenciales
    A->>G: Verificar identidad
    G-->>A: Token de autenticación
    A->>D: Consultar datos usuario
    D-->>A: Información del perfil
    A-->>U: Sesión iniciada con éxito
```

### 📋 **Proceso de Servicio Social**

1. **📝 Postulación**: Estudiante aplica a convocatorias publicadas
2. **✅ Aceptación**: Aliado revisa y acepta postulaciones
3. **⏰ Registro de Horas**: Estudiante reporta actividades realizadas
4. **🔍 Validación**: Auxiliar/Profesor valida las horas reportadas
5. **📜 Certificación**: Aliado emite certificado oficial
6. **📊 Seguimiento**: Administrador supervisa todo el proceso

---

## ✅ Buenas Prácticas

### 🏗️ **Principios de Diseño**

- **🎨 Atomic Design**: Componentes pequeños y reutilizables
- **📱 Mobile-First**: Diseño responsivo prioritario
- **♿ Accesibilidad**: Cumplimiento WCAG 2.1 AA
- **🎯 Performance**: Optimización de carga y renderizado
- **🔒 Security**: Validación de datos y sanitización

### 💻 **Calidad de Código**

- **📝 TypeScript**: Tipado estricto en todo el proyecto
- **🔍 ESLint**: Reglas de calidad consistentes
- **🎨 Prettier**: Formato de código automatizado
- **🧪 Testing**: Componentes probados individualmente

### 🗄️ **Base de Datos**

- **📊 Normalización**: Diseño normalizado hasta 3FN
- **🔗 Integridad Referencial**: Claves foráneas bien definidas
- **⚡ Índices Optimizados**: Consultas eficientes
- **🔄 Migraciones Versionadas**: Control de cambios schema

### 🚀 **Desarrollo**

- **🌿 Git Flow**: Branches feature y pull requests
- **📦 SemVer**: Versionamiento semántico
- **📋 Code Review**: Revisión por pares obligatoria
- **🚢 CI/CD**: Integración y despliegue continuos

---

## 🏛️ Convenciones del Proyecto

### 📝 **Nomenclatura de Archivos**

| Tipo | Formato | Ejemplo |
|-------|----------|---------|
| **Componentes** | PascalCase | `UserProfile.tsx` |
| **Hooks** | camelCase | `useAuth.ts` |
| **Utilidades** | camelCase | `formatDate.ts` |
| **Páginas** | kebab-case | `gestion-usuarios/` |
| **Constantes** | UPPER_SNAKE_CASE | `API_BASE_URL` |

### 🎨 **Guías de Estilo**

- **🎨 Tailwind Classes**: Nomenclatura consistente
- **📱 Component Props**: Interfaces tipadas
- **🔧 Custom Hooks**: Prefijo `use` obligatorio
- **📦 Exportaciones**: Named exports preferidas

### 🗄️ **Base de Datos**

- **📊 Tablas**: Plural en español (`usuarios`, `convocatorias`)
- **🔑 Claves Primarias**: UUID estándar
- **🔗 Relaciones**: Nombres descriptivos y consistentes

---

## 📊 Estado del Proyecto

### 🟢 **Estado Actual: Producción**

- **✅ Build**: Compilación exitosa sin errores
- **🔍 Lint**: Código limpio y optimizado
- **📱 Responsive**: Diseño adaptativo completo
- **🔐 Seguridad**: Autenticación robusta implementada
- **📊 BD**: Schema completo y migraciones funcionales

### 🎯 **Características Implementadas**

#### 👥 **Módulos Completados**

- **✅ Gestión de Usuarios**: Registro, autenticación, perfiles
- **✅ Sistema de Convocatorias**: Publicación, postulación, gestión
- **✅ Reporte de Horas**: Registro, validación, aprobación
- **✅ Certificados Digitales**: Generación PDF con QR
- **✅ Panel Administrativo**: Dashboard completo para administradores
- **✅ Sistema de Notificaciones**: Email e internas
- **✅ Gestión de Noticias**: CRUD completo de noticias institucionales

#### 🛠️ **Funcionalidades Técnicas**

- **🔐 NextAuth.js**: Autenticación con múltiples proveedores
- **📤 Upload de Archivos**: Cloudinary integration
- **📊 Exportaciones**: Excel y PDF
- **🔍 Búsqueda Avanzada**: Filtros múltiples y búsqueda
- **📱 PWA Ready**: Capacidad de instalación como app
- **🎨 Tema Personalizable**: Sistema de temas UI

---

## 🔮 Posibles Mejoras

### 🚀 **Mejoras Técnicas Sugeridas**

#### 🏗️ **Arquitectura**

1. **🔄 Microservicios**: Separar frontend/backend en servicios independientes
2. **⚡ Caching Layer**: Redis para sesiones y consultas frecuentes
3. **📊 Analytics**: Integración con Google Analytics 4
4. **🔄 WebSockets**: Notificaciones en tiempo real
5. **🔍 Elasticsearch**: Búsqueda avanzada y全文検索

#### 🎨 **Experiencia de Usuario**

1. **🌐 Internacionalización**: i18n para múltiples idiomas
2. **🎨 Tema Oscuro**: Dark mode completo
3. **📱 App Móvil**: React Native o Flutter version
4. **🔔 Push Notifications**: Service Workers implementados
5. **🎯 Personalización**: Perfiles personalizables avanzados

#### 🛡️ **Seguridad y Performance**

1. **🔐 2FA**: Autenticación de dos factores
2. **🚨 Rate Limiting**: Protección contra ataques
3. **📊 Monitoring**: Sentry o similar para errores
4. **⚡ CDN**: CloudFlare para assets estáticos
5. **🔒 HTTPS Only**: Forzar SSL en producción

### 📈 **Roadmap Futuro**

```mermaid
gantt
    title Roadmap de Mejoras
    dateFormat  YYYY-MM-DD
    section Mejoras Inmediatas
    Caching Layer         :done,    des1, 2024-12-01
    Analytics Integration  :active,  des2, 2024-12-15
    Dark Mode            :         des3, 2025-01-01
    section Mejanzas Medias
    2FA Implementation    :         med1, 2025-02-01
    Mobile App           :         med2, 2025-03-01
    section Mejanzas Largas
    Microservices         :         lon1, 2025-06-01
    WebSockets           :         lon2, 2025-09-01
```

---

## 🤝 Contribución

### 👥 **Guía para Desarrolladores**

1. **🍴 Fork** el repositorio
2. **🌿 Crear Branch**: `feature/tu-nueva-funcionalidad`
3. **📝 Commits Atómicos**: Cambios pequeños y descriptivos
4. **🔄 Pull Request**: Con descripción detallada y tests
5. **📋 Code Review**: Revisión por pares obligatoria

### 📧 **Estándares de Código**

- **📝 Seguir convenciones** de nomenclatura establecidas
- **🧪 Escribir tests** para nuevas funcionalidades
- **📊 Documentar cambios** en comentarios y README
- **🎨 Mantener consistencia** en diseño y UX

### 📞 **Contacto y Soporte**

- **👤 Maintainer**: **UCP Desarrollo**
- **📧 Email**: `alejostone.100@gmail.com`
- **🌐 Repositorio**: https://github.com/Alejostone1/Serviciosocial_ucp
- **📋 Issues**: Reportar problemas en GitHub Issues

---

## 📄 Licencia

**MIT License** - Este proyecto es open source y puede ser utilizado libremente para fines educativos y comerciales.

---

<div align="center">
  <strong>🎓 Universidad Católica de Pereira - Sistema de Servicio Social</strong><br>
  <em>Desarrollado con ❤️ para la comunidad educativa</em>
</div>