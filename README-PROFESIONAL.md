# Sistema de Servicio Social - Universidad Católica de Pereira

Plataforma integral para la gestión del servicio social universitario que facilita la administración de convocatorias, seguimiento de horas de servicio social, generación de certificados y comunicación institucional.

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

## Tecnologías Utilizadas

### Frontend
- **Next.js 14** - Framework React con renderizado del lado del servidor
- **TypeScript** - Tipado estático para mayor robustez
- **TailwindCSS** - Framework de CSS para diseño rápido y responsive
- **shadcn/ui** - Sistema de componentes UI reutilizables
- **Lucide React** - Biblioteca de iconos
- **React Hook Form** - Manejo de formularios con validación
- **Framer Motion** - Animaciones y transiciones
- **Recharts** - Gráficos y visualizaciones

### Backend
- **Next.js API Routes** - Endpoints RESTful
- **Prisma ORM** - Mapeo objeto-relacional para base de datos
- **NextAuth.js** - Autenticación y gestión de sesiones
- **bcrypt.js** - Encriptación de contraseñas
- **Zod** - Validación de datos
- **Nodemailer** - Envío de correos electrónicos
- **Resend** - Servicio de email transaccional

### Base de Datos
- **PostgreSQL** - Base de datos relacional
- **Prisma** - ORM y migraciones

### Desarrollo
- **ESLint** - Linting de código
- **PostCSS** - Procesamiento de CSS
- **tsx** - Ejecución de TypeScript

### Utilidades
- **date-fns** - Manipulación de fechas
- **jsPDF** - Generación de PDFs
- **html2canvas** - Captura de elementos HTML
- **xlsx** - Manejo de archivos Excel
- **QRCode** - Generación de códigos QR

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
ucp-servicio-social/
├── prisma/                     # Base de datos
│   ├── schema.prisma          # Esquema de la base de datos
│   ├── seed.ts                # Datos iniciales
│   ├── migrations/            # Historial de migraciones
│   └── modelo.sql             # Script SQL completo
├── src/
│   ├── app/                   # App Router (Next.js 13+)
│   │   ├── (autenticacion)/   # Rutas de autenticación
│   │   ├── administrador/     # Panel administrativo
│   │   ├── api/               # API Routes
│   │   ├── convocatorias/      # Gestión de convocatorias
│   │   ├── noticias/          # Gestión de noticias
│   │   ├── sistema/           # Sistema y configuración
│   │   ├── layout.tsx         # Layout principal
│   │   └── page.tsx           # Página de inicio
│   ├── components/            # Componentes React
│   │   ├── ui/                # Componentes UI base (shadcn/ui)
│   │   ├── forms/             # Formularios reutilizables
│   │   ├── layout/            # Componentes de layout
│   │   ├── home/              # Componentes de página principal
│   │   ├── certificados/      # Componentes de certificados
│   │   ├── convocatorias/     # Componentes de convocatorias
│   │   ├── noticias/          # Componentes de noticias
│   │   └── horas/             # Componentes de gestión de horas
│   ├── lib/                   # Utilidades y configuración
│   │   ├── prisma.ts          # Configuración de Prisma
│   │   ├── auth.ts            # Configuración de NextAuth
│   │   ├── utils.ts           # Funciones utilitarias
│   │   ├── whatsapp.ts        # Integración WhatsApp
│   │   └── email.ts           # Funciones de email
│   ├── hooks/                 # Custom React hooks
│   ├── types/                 # Definiciones de tipos TypeScript
│   ├── contexts/              # React Context providers
│   └── styles/                # Estilos globales
├── public/                    # Archivos estáticos
│   └── uploads/               # Archivos subidos por usuarios
├── scripts/                   # Scripts de utilidad
├── tailwind.config.ts         # Configuración de TailwindCSS
├── next.config.js             # Configuración de Next.js
├── tsconfig.json              # Configuración de TypeScript
├── components.json            # Configuración de shadcn/ui
└── middleware.ts              # Middleware de Next.js
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
