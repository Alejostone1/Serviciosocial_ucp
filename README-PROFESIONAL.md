# 🎓 UCP Servicio Social v5 - Sistema de Gestión Integral

Plataforma integral moderna para la gestión del servicio social universitario que facilita la administración de convocatorias, seguimiento de horas de servicio social, generación de certificados y comunicación institucional.

## Descripción del Proyecto

El Sistema de Servicio Social de la Universidad Católica de Pereira (UCP) es una aplicación web fullstack diseñada para digitalizar y optimizar la gestión del servicio social universitario. El sistema permite a los estudiantes participar en convocatorias de servicio social, registrar sus actividades, acumular horas requeridas y obtener certificados válidos, mientras que los administradores pueden gestionar convocatorias, usuarios y generar reportes.

### Objetivo del Sistema
- Centralizar la gestión del servicio social universitario
- Facilitar el seguimiento de horas de servicio de los estudiantes
- Digitalizar el proceso de convocatorias y postulaciones
- Generar certificados automáticos y verificables
- Mejorar la comunicación entre estudiantes y administradores

### Problema que Resuelve
Elimina la gestión manual de procesos administrativos, reduce errores en el seguimiento de horas, proporciona trazabilidad completa de las actividades y ofrece una experiencia moderna tanto para estudiantes como para administradores.

### Tipo de Aplicación
Aplicación web fullstack construida con Next.js 14, TypeScript y PostgreSQL, diseñada para ser escalable y mantenible.

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
- **lucide-react**: Iconos modernos y consistentes (0.294.0)
- **framer-motion**: Animaciones fluidas y micro-interacciones (12.35.1)
- **sonner**: Sistema de notificaciones toast (2.0.7)
- **clsx**: Utilidad para className condicional (2.0.0)

### 📄 **Manejo de Documentos**

- **jspdf**: Generación de PDFs para certificados (4.2.1)
- **jspdf-autotable**: Tablas en PDFs (5.0.7)
- **exceljs**: Exportación de datos a Excel (4.4.0)
- **xlsx**: Manejo de archivos Excel (0.18.5)
- **canvas**: Manipulación de imágenes para evidencias (3.2.1)
- **html2canvas**: Captura de elementos HTML (1.4.1)
- **qrcode**: Generación de códigos QR (1.5.4)

### 🔐 **Seguridad y Autenticación**

- **bcrypt**: Encriptación de contraseñas (6.0.0)
- **bcryptjs**: Encriptación alternativa (3.0.3)
- **next-auth**: Autenticación con múltiples proveedores (4.24.5)

### 📧 **Comunicación y Storage**

- **nodemailer**: Envío de correos electrónicos (7.0.13)
- **resend**: Servicio de email transaccional (2.0.0)
- **next-cloudinary**: Almacenamiento de archivos en la nube (5.10.0)

### 🛠️ **Herramientas de Desarrollo**

- **ESLint**: Linting de código (8.54.0)
- **PostCSS**: Procesamiento de CSS (8.4.32)
- **tsx**: Ejecución de TypeScript (4.4.0)
- **date-fns**: Manipulación de fechas (2.30.0)

## Requisitos Previos

Antes de ejecutar el proyecto, asegúrate de tener instalado:

- **Node.js** (versión 18 o superior)
- **npm** (versión 9 o superior) o **yarn**
- **Git**
- **PostgreSQL** (versión 13 o superior)
- **Prisma CLI** (se instala automáticamente con npm install)

## Clonar el Proyecto

```powershell
git clone https://github.com/tu-usuario/ucp-servicio-social.git ;
cd ucp-servicio-social ;
```

## Instalación de Dependencias

```powershell
npm install ;
```

Este comando instala todas las dependencias necesarias para el proyecto, incluyendo dependencias de producción y desarrollo.

## Configuración de Variables de Entorno

Copia el archivo de ejemplo de variables de entorno:

```powershell
copy .env.example .env.local ;
```

Edita el archivo `.env.local` con tu configuración:

```env
# Base de Datos
DATABASE_URL="postgresql://usuario:password@localhost:5432/nombre_db?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="genera_un_secreto_seguro_con_openssl_rand_base64_32"

# Correo (para recuperación de contraseña)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="notificaciones@ucp.edu.co"
SMTP_PASS="tu_app_password_aqui"
SMTP_FROM="Sistema Servicio Social UCP <notificaciones@ucp.edu.co>"

# Almacenamiento de Archivos
UPLOAD_DIR="./public/uploads"
UPLOAD_BASE_URL="http://localhost:3000/uploads"

# Generación de PDF
CERT_BASE_URL="http://localhost:3000"

# Configuración App
APP_NAME="Sistema de Servicio Social UCP"
APP_URL="http://localhost:3000"
NODE_ENV="development"
```

### Explicación de Variables Clave
- `DATABASE_URL`: Cadena de conexión a PostgreSQL
- `NEXTAUTH_SECRET`: Secreto para firmar tokens JWT (genera uno con `openssl rand -base64 32`)
- `SMTP_*`: Configuración para envío de correos de recuperación
- `UPLOAD_*`: Configuración para almacenamiento de archivos

## Configuración de Base de Datos

### 1. Crear Base de Datos
```powershell
createdb nombre_db ;
```

### 2. Generar Cliente Prisma
```powershell
npm run db:generate ;
```

### 3. Ejecutar Migraciones
```powershell
npm run db:migrate ;
```

Este comando crea todas las tablas en la base de datos según el esquema definido en `prisma/schema.prisma`.

## Seeds (Datos Iniciales)

Para poblar la base de datos con datos iniciales:

```powershell
npm run db:seed ;
```

Este comando crea:
- Usuarios de prueba (administrador, estudiantes)
- Facultades y programas académicos
- Convocatorias de ejemplo
- Noticias y actividades iniciales
- Configuración básica del sistema

## Ejecutar el Proyecto

Para iniciar el servidor de desarrollo:

```powershell
npm run dev ;
```

La aplicación estará disponible en `http://localhost:3000`

Para producción:

```powershell
npm run build ;
npm start ;
```

## Estructura del Proyecto

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
│   │   ├── 📁 (autenticacion)/   # Rutas de autenticación (8 archivos)
│   │   ├── 📁 Publico/           # Rutas públicas (6 archivos)
│   │   ├── 📁 administrador/       # Panel administrativo (119 archivos)
│   │   ├── 📁 sistema/            # Sistema interno (111 archivos)
│   │   │   ├── 📁 estudiante/      # Módulo estudiantes
│   │   │   ├── 📁 profesor/        # Módulo profesores
│   │   │   ├── 📁 aliado/          # Módulo aliados
│   │   │   └── 📁 auxiliar/        # Módulo auxiliares
│   │   ├── 📁 api/                # API Routes (55 archivos)
│   │   ├── layout.tsx              # Layout principal
│   │   ├── page.tsx               # Home page
│   │   ├── error.tsx              # Manejo de errores
│   │   └── loading.tsx            # Estados de carga
│   │
│   ├── 📁 components/             # Componentes React (91 archivos)
│   │   ├── 📁 ui/                # Componentes base UI (30 archivos)
│   │   ├── 📁 forms/             # Formularios reutilizables (8 archivos)
│   │   ├── 📁 layout/            # Components de layout (10 archivos)
│   │   ├── 📁 administrador/      # Components admin (1 archivo)
│   │   ├── 📁 certificados/      # Components certificados (3 archivos)
│   │   ├── 📁 convocatorias/      # Components convocatorias (6 archivos)
│   │   ├── 📁 estudiante/        # Components estudiantes (4 archivos)
│   │   ├── 📁 horas/             # Components horas (4 archivos)
│   │   ├── 📁 noticias/          # Components noticias (9 archivos)
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

### Explicación de Carpetas Principales

- **`prisma/`**: Contiene todo lo relacionado con la base de datos (esquema, migraciones, seeds)
- **`src/app/`**: Estructura de rutas usando App Router de Next.js 13+
- **`src/components/`**: Componentes React organizados por funcionalidad
- **`src/lib/`**: Configuraciones y utilidades reutilizables
- **`public/`**: Archivos estáticos y uploads

## Dónde Modificar el Proyecto

### Agregar Nuevas Rutas
1. **API Routes**: Agrega archivos en `src/app/api/nueva-ruta/route.ts`
2. **Páginas**: Crea carpetas en `src/app/nueva-ruta/page.tsx`
3. **Layouts**: Modifica `src/app/layout.tsx` o crea layouts específicos

### Modificar Modelos
1. **Esquema**: Edita `prisma/schema.prisma`
2. **Migración**: Ejecuta `npm run db:migrate`
3. **Tipos**: Actualiza tipos en `src/types/`

### Cambiar Lógica de Negocio
1. **Controllers**: Modifica archivos en `src/app/api/`
2. **Services**: Actualiza funciones en `src/lib/`
3. **Hooks**: Modifica custom hooks en `src/hooks/`

### Modificar Estilos
1. **Globales**: Edita `src/styles/globals.css`
2. **Componentes**: Modifica clases Tailwind en componentes
3. **Configuración**: Actualiza `tailwind.config.ts`

### Modificar Configuración
1. **Base de datos**: Edita `prisma/schema.prisma` y `.env.local`
2. **Autenticación**: Modifica `src/lib/auth.ts`
3. **Next.js**: Actualiza `next.config.js`

## Comandos Útiles del Proyecto

```powershell
# Desarrollo
npm run dev ;                    # Iniciar servidor de desarrollo
npm run build ;                  # Compilar para producción
npm start ;                      # Iniciar servidor de producción
npm run lint ;                   # Ejecutar linting

# Base de Datos
npm run db:generate ;            # Generar cliente Prisma
npm run db:migrate ;             # Ejecutar migraciones
npm run db:deploy ;             # Desplegar migraciones en producción
npm run db:seed ;               # Cargar datos iniciales
npm run db:studio ;             # Abrir Prisma Studio
npm run db:pull ;               # Sincronizar esquema desde BD
npm run db:push ;               # Enviar esquema a BD
npm run db:reset ;              # Resetear base de datos

# Utilidades
npm run type-check ;             # Verificar tipos TypeScript
```

### Explicación de Comandos Clave

- **`npm run dev`**: Inicia servidor en modo desarrollo con hot reload
- **`npm run db:studio`**: Abre interfaz gráfica para explorar la base de datos
- **`npm run db:seed`**: Carga datos de prueba para desarrollo
- **`npm run type-check`**: Verifica errores de TypeScript sin compilar

## Flujo de Trabajo Recomendado

### Desarrollo Local
1. **Crear rama feature**: `git checkout -b feature/nueva-funcionalidad`
2. **Desarrollar**: Hacer cambios con commits frecuentes y descriptivos
3. **Probar**: Verificar funcionalidad con `npm run dev`
4. **Types**: Ejecutar `npm run type-check` antes de commitear
5. **Push y PR**: Crear pull request para revisión de código

### Buenas Prácticas de Commits
```
feat: agregar nueva funcionalidad de convocatorias
fix: corregir error en validación de formularios
refactor: optimizar carga de componentes
docs: actualizar README.md
style: ajustar formato de código
```

### Flujo de Despliegue
1. **Development**: Push a rama `develop`
2. **Staging**: Merge a `main` para pruebas
3. **Production**: Deploy desde `main` con `npm run build`

### Manejo de Base de Datos
1. **Cambios en schema**: Modificar `prisma/schema.prisma`
2. **Migración local**: `npm run db:migrate`
3. **Testing**: Verificar con datos de prueba
4. **Producción**: `npm run db:deploy`

## Notas Importantes

### Seguridad
- **Nunca subir** `.env.local` al repositorio
- **Usar secrets** para variables sensibles en producción
- **Validar inputs** en frontend y backend
- **Sanitizar datos** antes de guardar en base de datos

### Performance
- **Usar Suspense** para carga lazy de componentes
- **Optimizar imágenes** con Next.js Image component
- **Implementar caching** para datos frecuentes
- **Monitorear** con herramientas de análisis

### Base de Datos
- **Hacer backup** regularmente antes de migraciones
- **Usar transacciones** para operaciones complejas
- **Indexar** campos consultados frecuentemente
- **Limpiar** datos obsoletos periódicamente

### Desarrollo
- **Seguir convenciones** de TypeScript y ESLint
- **Documentar** componentes complejos
- **Escribir tests** para funcionalidades críticas
- **Mantener actualizadas** las dependencias

### Troubleshooting Común

**Error de conexión a BD**:
```powershell
# Verificar URL en .env.local
# Asegurar que PostgreSQL está corriendo
# Probar conexión con psql
```

**Error de Prisma**:
```powershell
npm run db:generate ;
npm run db:migrate ;
```

**Error de TypeScript**:
```powershell
npm run type-check ;
# Revisar errores y corregir tipos
```

---

## Licencia

Este proyecto es propiedad de la Universidad Católica de Pereira. Todos los derechos reservados.

## Soporte

Para soporte técnico, contactar al equipo de desarrollo de la UCP o crear un issue en el repositorio del proyecto.
