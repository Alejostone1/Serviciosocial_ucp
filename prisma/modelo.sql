-- ============================================================
-- SCRIPT SQL - SISTEMA DE SERVICIO SOCIAL
-- Universidad Católica de Pereira (UCP)
-- Base de datos: bdserviciosocialucp
-- Motor: PostgreSQL 15+
-- Compatible con: pgAdmin 4
-- Adaptado 100% al schema Prisma (modelo canónico)
-- ============================================================

-- Crear base de datos (ejecutar como superusuario si no existe)
-- CREATE DATABASE bdserviciosocialucp
--     WITH ENCODING = 'UTF8'
--     LC_COLLATE = 'es_CO.UTF-8'
--     LC_CTYPE = 'es_CO.UTF-8'
--     TEMPLATE = template0;

-- Conectarse a la base de datos
-- \c bdserviciosocialucp

-- Habilitar extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TIPOS ENUMERADOS
-- (alineados exactamente con los enums del schema Prisma)
-- ============================================================

-- Roles del sistema
-- CAMBIO: DIRECTOR → PROFESOR (según Prisma)
CREATE TYPE "Rol" AS ENUM (
    'ADMINISTRADOR',
    'PROFESOR',
    'ALIADO',
    'AUXILIAR',
    'ESTUDIANTE'
);

CREATE TYPE "TipoDocumento" AS ENUM (
    'CC',
    'TI',
    'CE',
    'PASAPORTE',
    'NIT'
);

CREATE TYPE "NivelFormacion" AS ENUM (
    'PREGRADO',
    'POSGRADO',
    'ESPECIALIZACION',
    'MAESTRIA',
    'DOCTORADO',
    'TECNICO',
    'TECNOLOGICO'
);

CREATE TYPE "Modalidad" AS ENUM (
    'PRESENCIAL',
    'VIRTUAL',
    'HIBRIDA'
);

-- Estados de usuario
-- NUEVO: Este enum no existía en el SQL anterior
CREATE TYPE "EstadoUsuario" AS ENUM (
    'ACTIVO',
    'BLOQUEADO',
    'DESACTIVADO'
);

-- Estados de convocatoria
-- CAMBIO: Se añaden ESPERANDO_CONFIRMACION y RECHAZADA (según Prisma)
CREATE TYPE "EstadoConvocatoria" AS ENUM (
    'BORRADOR',
    'ESPERANDO_CONFIRMACION',
    'PUBLICADA',
    'EN_CURSO',
    'CERRADA',
    'CANCELADA',
    'RECHAZADA'
);

CREATE TYPE "EstadoPostulacion" AS ENUM (
    'PENDIENTE',
    'EN_REVISION',
    'ACEPTADA',
    'RECHAZADA',
    'RETIRADA'
);

-- Estados de reporte de horas
-- CAMBIO: Se añaden VALIDADO_AUXILIAR y PENDIENTE_APROBACION_FINAL (según Prisma)
CREATE TYPE "EstadoReporte" AS ENUM (
    'REPORTADO',
    'PENDIENTE_VALIDACION',
    'VALIDADO_AUXILIAR',
    'PENDIENTE_APROBACION_FINAL',
    'EN_REVISION',
    'APROBADO',
    'RECHAZADO',
    'REQUIERE_AJUSTE'
);

CREATE TYPE "EstadoVinculacion" AS ENUM (
    'PENDIENTE',
    'APROBADA',
    'RECHAZADA',
    'SUSPENDIDA',
    'VENCIDA'
);

CREATE TYPE "TipoToken" AS ENUM (
    'RECUPERACION',
    'ACTIVACION',
    'VERIFICACION'
);

CREATE TYPE "TipoActividad" AS ENUM (
    'GENERAL',
    'CAPACITACION',
    'CAMPO',
    'ADMINISTRATIVA',
    'INVESTIGACION',
    'COMUNITARIA'
);

-- Tipos de evidencia para reportes
-- NUEVO: Este enum no existía en el SQL anterior
CREATE TYPE "TipoEvidencia" AS ENUM (
    'TEXTO',
    'IMAGEN',
    'DOCUMENTO'
);

CREATE TYPE "TipoNotificacion" AS ENUM (
    'POSTULACION_RECIBIDA',
    'POSTULACION_ACEPTADA',
    'POSTULACION_RECHAZADA',
    'REPORTE_ENVIADO',
    'REPORTE_APROBADO',
    'REPORTE_RECHAZADO',
    'REPORTE_AJUSTE',
    'CERTIFICADO_EMITIDO',
    'CONVOCATORIA_PUBLICADA',
    'SISTEMA'
);

CREATE TYPE "CanalNotificacion" AS ENUM (
    'INTERNA',
    'CORREO',
    'WHATSAPP',
    'SMS'
);

CREATE TYPE "EstadoEnvio" AS ENUM (
    'PENDIENTE',
    'ENVIADO',
    'FALLIDO',
    'REINTENTANDO'
);

CREATE TYPE "ResultadoAccion" AS ENUM (
    'EXITOSO',
    'FALLIDO',
    'PARCIAL'
);

-- Estado de solicitudes de cambio de perfil
-- NUEVO: Este enum no existía en el SQL anterior
CREATE TYPE "EstadoSolicitud" AS ENUM (
    'PENDIENTE',
    'APROBADA',
    'RECHAZADA'
);

-- ============================================================
-- MÓDULO: ESTRUCTURA ACADÉMICA
-- ============================================================

-- Tabla: facultades
CREATE TABLE IF NOT EXISTS "facultades" (
    "id"                UUID            NOT NULL DEFAULT uuid_generate_v4(),
    "nombre"            VARCHAR(150)    NOT NULL,
    "codigo"            VARCHAR(20)     UNIQUE,
    "descripcion"       TEXT,
    "decano"            VARCHAR(200),
    "correo_contacto"   VARCHAR(200),
    "telefono_ext"      VARCHAR(10),
    "esta_activo"       BOOLEAN         NOT NULL DEFAULT TRUE,
    "creado_en"         TIMESTAMPTZ(6)  NOT NULL DEFAULT NOW(),
    "actualizado_en"    TIMESTAMPTZ(6)  NOT NULL DEFAULT NOW(),

    CONSTRAINT "facultades_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "facultades_nombre_unique" UNIQUE ("nombre")
);

COMMENT ON TABLE "facultades" IS 'Facultades académicas de la Universidad Católica de Pereira';
COMMENT ON COLUMN "facultades"."decano" IS 'Nombre del decano o jefe de facultad vigente';
COMMENT ON COLUMN "facultades"."correo_contacto" IS 'Correo institucional de contacto de la facultad';

CREATE INDEX IF NOT EXISTS "idx_facultades_nombre" ON "facultades" ("nombre");
CREATE INDEX IF NOT EXISTS "idx_facultades_activo" ON "facultades" ("esta_activo");

-- ─────────────────────────────────────────────────────────────

-- Tabla: programas
-- (sin @@map en Prisma, el nombre de tabla es "programas" por convención)
CREATE TABLE IF NOT EXISTS "programas" (
    "id"                UUID             NOT NULL DEFAULT uuid_generate_v4(),
    "nombre"            VARCHAR(150)     NOT NULL,
    "codigo"            VARCHAR(20)      UNIQUE,
    "id_facultad"       UUID             NOT NULL,
    "nivel_formacion"   "NivelFormacion" NOT NULL DEFAULT 'PREGRADO',
    "horas_requeridas"  DECIMAL(6,2)     NOT NULL DEFAULT 120,
    "esta_activo"       BOOLEAN          NOT NULL DEFAULT TRUE,
    "creado_en"         TIMESTAMPTZ(6)   NOT NULL DEFAULT NOW(),
    "actualizado_en"    TIMESTAMPTZ(6)   NOT NULL DEFAULT NOW(),

    CONSTRAINT "programas_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "programas_nombre_unique" UNIQUE ("nombre"),
    CONSTRAINT "programas_facultad_fkey" FOREIGN KEY ("id_facultad")
        REFERENCES "facultades" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

COMMENT ON TABLE "programas" IS 'Programas académicos asociados a cada facultad';
COMMENT ON COLUMN "programas"."horas_requeridas" IS 'Total de horas de servicio social requeridas para completar el requisito';

CREATE INDEX IF NOT EXISTS "idx_programas_facultad" ON "programas" ("id_facultad");
CREATE INDEX IF NOT EXISTS "idx_programas_codigo"   ON "programas" ("codigo");
CREATE INDEX IF NOT EXISTS "idx_programas_activo"   ON "programas" ("esta_activo");

-- ============================================================
-- MÓDULO: USUARIOS Y AUTENTICACIÓN
-- ============================================================

-- Tabla: usuarios
-- CAMBIOS vs versión anterior:
--   + campo "estado EstadoUsuario" (era implícito con "esta_bloqueado")
--   - se elimina "esta_bloqueado" solo a nivel de restricción de enum; sigue en Prisma como campo independiente
CREATE TABLE IF NOT EXISTS "usuarios" (
    "id"                    UUID             NOT NULL DEFAULT uuid_generate_v4(),
    "primer_nombre"         VARCHAR(80)      NOT NULL,
    "segundo_nombre"        VARCHAR(80),
    "primer_apellido"       VARCHAR(80)      NOT NULL,
    "segundo_apellido"      VARCHAR(80),
    "tipo_documento"        "TipoDocumento"  NOT NULL DEFAULT 'CC',
    "numero_documento"      VARCHAR(20)      NOT NULL,
    "correo"                VARCHAR(200)     NOT NULL,
    "correo_personal"       VARCHAR(200),
    "contrasena_hash"       VARCHAR(255),
    "telefono"              VARCHAR(20),
    "foto_url"              VARCHAR(500),
    "rol"                   "Rol"            NOT NULL,
    "estado"                "EstadoUsuario"  NOT NULL DEFAULT 'ACTIVO',  -- NUEVO campo Prisma
    "id_programa"           UUID,
    "esta_bloqueado"        BOOLEAN          NOT NULL DEFAULT FALSE,
    "motivo_bloqueo"        TEXT,
    "ultimo_acceso"         TIMESTAMPTZ(6),
    "requiere_cambio_clave" BOOLEAN          NOT NULL DEFAULT FALSE,
    "creado_en"             TIMESTAMPTZ(6)   NOT NULL DEFAULT NOW(),
    "actualizado_en"        TIMESTAMPTZ(6)   NOT NULL DEFAULT NOW(),

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "usuarios_documento_unique" UNIQUE ("numero_documento"),
    CONSTRAINT "usuarios_correo_unique" UNIQUE ("correo"),
    CONSTRAINT "usuarios_programa_fkey" FOREIGN KEY ("id_programa")
        REFERENCES "programas" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

COMMENT ON TABLE "usuarios" IS 'Usuarios del sistema: administradores, profesores, aliados, auxiliares y estudiantes';
COMMENT ON COLUMN "usuarios"."estado" IS 'Estado general del usuario: ACTIVO, BLOQUEADO o DESACTIVADO';
COMMENT ON COLUMN "usuarios"."correo" IS 'Correo institucional, usado como identificador de acceso';
COMMENT ON COLUMN "usuarios"."ultimo_acceso" IS 'Timestamp del último login exitoso';
COMMENT ON COLUMN "usuarios"."requiere_cambio_clave" IS 'Si es true, se obliga al usuario a cambiar contraseña al iniciar sesión';

CREATE INDEX IF NOT EXISTS "idx_usuarios_correo"    ON "usuarios" ("correo");
CREATE INDEX IF NOT EXISTS "idx_usuarios_rol"       ON "usuarios" ("rol");
CREATE INDEX IF NOT EXISTS "idx_usuarios_programa"  ON "usuarios" ("id_programa");
CREATE INDEX IF NOT EXISTS "idx_usuarios_documento" ON "usuarios" ("numero_documento");
CREATE INDEX IF NOT EXISTS "idx_usuarios_apellido"  ON "usuarios" ("primer_apellido", "primer_nombre");
CREATE INDEX IF NOT EXISTS "idx_usuarios_bloqueado" ON "usuarios" ("esta_bloqueado");

-- ─────────────────────────────────────────────────────────────

-- Tabla: perfiles_estudiante
CREATE TABLE IF NOT EXISTS "perfiles_estudiante" (
    "id_usuario"            UUID           NOT NULL,
    "semestre_actual"       INT,
    "codigo_estudiantil"    VARCHAR(30)    UNIQUE,
    "url_hoja_de_vida"      VARCHAR(500),
    "habilidades"           TEXT[]         NOT NULL DEFAULT '{}',
    "intereses"             TEXT[]         NOT NULL DEFAULT '{}',
    "disponibilidad"        JSONB,
    "modalidad_preferida"   "Modalidad",
    "horas_previas"         DECIMAL(6,2)   NOT NULL DEFAULT 0,
    "horas_acumuladas"      DECIMAL(6,2)   NOT NULL DEFAULT 0,
    "porcentaje_avance"     DECIMAL(5,2)   NOT NULL DEFAULT 0,
    "creado_en"             TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
    "actualizado_en"        TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),

    CONSTRAINT "perfiles_estudiante_pkey" PRIMARY KEY ("id_usuario"),
    CONSTRAINT "perfiles_estudiante_usuario_fkey" FOREIGN KEY ("id_usuario")
        REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

COMMENT ON TABLE "perfiles_estudiante" IS 'Perfil extendido con información académica y preferencias de los estudiantes';
COMMENT ON COLUMN "perfiles_estudiante"."disponibilidad" IS 'JSON con horarios: {"lunes": ["08:00-10:00"], "martes": ["14:00-16:00"]}';
COMMENT ON COLUMN "perfiles_estudiante"."horas_previas" IS 'Horas de servicio social realizadas antes de ingresar al sistema, validadas manualmente';
COMMENT ON COLUMN "perfiles_estudiante"."porcentaje_avance" IS 'Calculado: (horas_previas + horas_acumuladas) / horas_requeridas_programa * 100';

CREATE INDEX IF NOT EXISTS "idx_perfiles_codigo"  ON "perfiles_estudiante" ("codigo_estudiantil");
CREATE INDEX IF NOT EXISTS "idx_perfiles_horas"   ON "perfiles_estudiante" ("horas_acumuladas");
CREATE INDEX IF NOT EXISTS "idx_perfiles_avance"  ON "perfiles_estudiante" ("porcentaje_avance");

-- ─────────────────────────────────────────────────────────────

-- Tabla: tokens_recuperacion
CREATE TABLE IF NOT EXISTS "tokens_recuperacion" (
    "id"            UUID           NOT NULL DEFAULT uuid_generate_v4(),
    "id_usuario"    UUID           NOT NULL,
    "token"         VARCHAR(255)   NOT NULL,
    "tipo"          "TipoToken"    NOT NULL DEFAULT 'RECUPERACION',
    "expira_en"     TIMESTAMPTZ(6) NOT NULL,
    "usado_en"      TIMESTAMPTZ(6),
    "ip_origen"     VARCHAR(45),
    "creado_en"     TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),

    CONSTRAINT "tokens_recuperacion_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "tokens_recuperacion_token_unique" UNIQUE ("token"),
    CONSTRAINT "tokens_recuperacion_usuario_fkey" FOREIGN KEY ("id_usuario")
        REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

COMMENT ON TABLE "tokens_recuperacion" IS 'Tokens de seguridad para recuperación de contraseña y activación de cuentas';

CREATE INDEX IF NOT EXISTS "idx_tokens_usuario" ON "tokens_recuperacion" ("id_usuario");
CREATE INDEX IF NOT EXISTS "idx_tokens_token"   ON "tokens_recuperacion" ("token");
CREATE INDEX IF NOT EXISTS "idx_tokens_expira"  ON "tokens_recuperacion" ("expira_en");

-- ─────────────────────────────────────────────────────────────

-- Tabla: sesiones_usuario
CREATE TABLE IF NOT EXISTS "sesiones_usuario" (
    "id"            UUID           NOT NULL DEFAULT uuid_generate_v4(),
    "id_usuario"    UUID           NOT NULL,
    "token_sesion"  VARCHAR(500)   NOT NULL,
    "ip_origen"     VARCHAR(45),
    "user_agent"    TEXT,
    "dispositivo"   VARCHAR(100),
    "esta_activa"   BOOLEAN        NOT NULL DEFAULT TRUE,
    "creado_en"     TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
    "expira_en"     TIMESTAMPTZ(6) NOT NULL,
    "cerrada_en"    TIMESTAMPTZ(6),

    CONSTRAINT "sesiones_usuario_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "sesiones_token_unique" UNIQUE ("token_sesion"),
    CONSTRAINT "sesiones_usuario_fkey" FOREIGN KEY ("id_usuario")
        REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

COMMENT ON TABLE "sesiones_usuario" IS 'Registro de sesiones activas e historial de acceso al sistema';

CREATE INDEX IF NOT EXISTS "idx_sesiones_usuario_activa" ON "sesiones_usuario" ("id_usuario", "esta_activa");
CREATE INDEX IF NOT EXISTS "idx_sesiones_token"          ON "sesiones_usuario" ("token_sesion");
CREATE INDEX IF NOT EXISTS "idx_sesiones_expira"         ON "sesiones_usuario" ("expira_en");

-- ============================================================
-- MÓDULO: CONVOCATORIAS Y POSTULACIONES
-- ============================================================

-- Tabla: categorias_servicio_social
-- CAMBIO: se añade "actualizado_en" (presente en Prisma, faltaba en SQL anterior)
CREATE TABLE IF NOT EXISTS "categorias_servicio_social" (
    "id"            UUID           NOT NULL DEFAULT uuid_generate_v4(),
    "nombre"        VARCHAR(100)   NOT NULL,
    "descripcion"   TEXT,
    "icono"         VARCHAR(100),
    "color_hex"     VARCHAR(7),
    "esta_activa"   BOOLEAN        NOT NULL DEFAULT TRUE,
    "creado_en"     TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
    "actualizado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),  -- NUEVO campo Prisma

    CONSTRAINT "categorias_ss_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "categorias_ss_nombre_unique" UNIQUE ("nombre")
);

COMMENT ON TABLE "categorias_servicio_social" IS 'Categorías para clasificar y filtrar convocatorias de servicio social';
COMMENT ON COLUMN "categorias_servicio_social"."color_hex" IS 'Color en formato hexadecimal para representación visual en la UI';

-- ─────────────────────────────────────────────────────────────

-- Tabla: convocatorias
-- CAMBIOS:
--   + revisado_por  UUID (FK a usuarios)
--   + revisado_en   TIMESTAMPTZ
--   + motivo_rechazo VARCHAR(500)
CREATE TABLE IF NOT EXISTS "convocatorias" (
    "id"                        UUID                 NOT NULL DEFAULT uuid_generate_v4(),
    "titulo"                    VARCHAR(200)         NOT NULL,
    "descripcion"               TEXT                 NOT NULL,
    "objetivo"                  TEXT,
    "id_categoria"              UUID,
    "publicado_por"             UUID                 NOT NULL,
    "id_programa"               UUID,
    "modalidad"                 "Modalidad"          NOT NULL,
    "lugar"                     VARCHAR(200),
    "url_convocatoria_externa"  VARCHAR(500),
    "competencias_requeridas"   TEXT[]               NOT NULL DEFAULT '{}',
    "estado"                    "EstadoConvocatoria" NOT NULL DEFAULT 'BORRADOR',
    "fecha_inicio"              DATE                 NOT NULL,
    "fecha_fin"                 DATE,
    "fecha_cierre_postulacion"  DATE,
    "cupo_maximo"               INT,
    "cupo_disponible"           INT,
    "horas_totales_ofrecidas"   DECIMAL(6,2),
    "url_banner"                VARCHAR(500),
    "url_documento_adicional"   VARCHAR(500),
    "requiere_entrevista"       BOOLEAN              NOT NULL DEFAULT FALSE,
    "creado_en"                 TIMESTAMPTZ(6)       NOT NULL DEFAULT NOW(),
    "actualizado_en"            TIMESTAMPTZ(6)       NOT NULL DEFAULT NOW(),
    "publicado_en"              TIMESTAMPTZ(6),
    "revisado_por"              UUID,                -- NUEVO campo Prisma
    "revisado_en"               TIMESTAMPTZ(6),      -- NUEVO campo Prisma
    "motivo_rechazo"            VARCHAR(500),        -- NUEVO campo Prisma

    CONSTRAINT "convocatorias_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "convocatorias_categoria_fkey" FOREIGN KEY ("id_categoria")
        REFERENCES "categorias_servicio_social" ("id") ON DELETE SET NULL,
    CONSTRAINT "convocatorias_programa_fkey" FOREIGN KEY ("id_programa")
        REFERENCES "programas" ("id") ON DELETE SET NULL,
    CONSTRAINT "convocatorias_publicador_fkey" FOREIGN KEY ("publicado_por")
        REFERENCES "usuarios" ("id") ON DELETE RESTRICT,
    CONSTRAINT "convocatorias_revisor_fkey" FOREIGN KEY ("revisado_por")
        REFERENCES "usuarios" ("id") ON DELETE SET NULL   -- NUEVO FK Prisma
);

COMMENT ON TABLE "convocatorias" IS 'Convocatorias de servicio social publicadas por aliados externos';
COMMENT ON COLUMN "convocatorias"."publicado_por" IS 'Usuario con rol ALIADO que gestiona la convocatoria';
COMMENT ON COLUMN "convocatorias"."cupo_disponible" IS 'Se actualiza mediante trigger cuando se aceptan postulaciones';
COMMENT ON COLUMN "convocatorias"."requiere_entrevista" IS 'Si es true, el aliado programa entrevista antes de aceptar';
COMMENT ON COLUMN "convocatorias"."revisado_por" IS 'Usuario (ADMINISTRADOR/AUXILIAR) que revisó la convocatoria';
COMMENT ON COLUMN "convocatorias"."motivo_rechazo" IS 'Razón del rechazo si estado = RECHAZADA';

CREATE INDEX IF NOT EXISTS "idx_convocatorias_estado"     ON "convocatorias" ("estado");
CREATE INDEX IF NOT EXISTS "idx_convocatorias_programa"   ON "convocatorias" ("id_programa");
CREATE INDEX IF NOT EXISTS "idx_convocatorias_publicador" ON "convocatorias" ("publicado_por");
CREATE INDEX IF NOT EXISTS "idx_convocatorias_fechas"     ON "convocatorias" ("fecha_inicio", "fecha_fin");
CREATE INDEX IF NOT EXISTS "idx_convocatorias_cierre"     ON "convocatorias" ("fecha_cierre_postulacion");
CREATE INDEX IF NOT EXISTS "idx_convocatorias_modalidad"  ON "convocatorias" ("modalidad");
CREATE INDEX IF NOT EXISTS "idx_convocatorias_revisor"    ON "convocatorias" ("revisado_por");   -- NUEVO índice Prisma
CREATE INDEX IF NOT EXISTS "idx_convocatorias_categoria"  ON "convocatorias" ("id_categoria");  -- NUEVO índice Prisma

-- ─────────────────────────────────────────────────────────────

-- Tabla: postulaciones
CREATE TABLE IF NOT EXISTS "postulaciones" (
    "id"                        UUID                NOT NULL DEFAULT uuid_generate_v4(),
    "id_convocatoria"           UUID                NOT NULL,
    "id_estudiante"             UUID                NOT NULL,
    "estado"                    "EstadoPostulacion" NOT NULL DEFAULT 'PENDIENTE',
    "motivacion"                TEXT,
    "url_hoja_vida"             VARCHAR(500),
    "habilidades_relevantes"    TEXT[]              NOT NULL DEFAULT '{}',
    "postulado_en"              TIMESTAMPTZ(6)      NOT NULL DEFAULT NOW(),
    "revisado_en"               TIMESTAMPTZ(6),
    "revisado_por"              UUID,
    "notas_revision"            TEXT,
    "fecha_entrevista"          TIMESTAMPTZ(6),
    "url_acta_entrevista"       VARCHAR(500),

    CONSTRAINT "postulaciones_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "postulaciones_unica" UNIQUE ("id_convocatoria", "id_estudiante"),
    CONSTRAINT "postulaciones_convocatoria_fkey" FOREIGN KEY ("id_convocatoria")
        REFERENCES "convocatorias" ("id") ON DELETE RESTRICT,
    CONSTRAINT "postulaciones_estudiante_fkey" FOREIGN KEY ("id_estudiante")
        REFERENCES "usuarios" ("id") ON DELETE RESTRICT,
    CONSTRAINT "postulaciones_revisor_fkey" FOREIGN KEY ("revisado_por")
        REFERENCES "usuarios" ("id") ON DELETE SET NULL
);

COMMENT ON TABLE "postulaciones" IS 'Solicitudes de estudiantes para participar en convocatorias de servicio social';

CREATE INDEX IF NOT EXISTS "idx_postulaciones_conv_estado" ON "postulaciones" ("id_convocatoria", "estado");
CREATE INDEX IF NOT EXISTS "idx_postulaciones_est_estado"  ON "postulaciones" ("id_estudiante", "estado");
CREATE INDEX IF NOT EXISTS "idx_postulaciones_revisor"     ON "postulaciones" ("revisado_por");

-- ============================================================
-- MÓDULO: ACTIVIDADES Y HORAS
-- ============================================================

-- Tabla: actividades
CREATE TABLE IF NOT EXISTS "actividades" (
    "id"                    UUID            NOT NULL DEFAULT uuid_generate_v4(),
    "id_convocatoria"       UUID            NOT NULL,
    "nombre"                VARCHAR(200)    NOT NULL,
    "descripcion"           TEXT,
    "tipo_actividad"        "TipoActividad" NOT NULL DEFAULT 'GENERAL',
    "horas_estimadas"       DECIMAL(5,2)    NOT NULL,
    "horas_maximas"         DECIMAL(5,2),
    "fecha_inicio"          DATE,
    "fecha_limite"          DATE,
    "ubicacion"             VARCHAR(200),
    "materiales_requeridos" TEXT[]          NOT NULL DEFAULT '{}',
    "esta_activa"           BOOLEAN         NOT NULL DEFAULT TRUE,
    "creado_por"            UUID            NOT NULL,
    "creado_en"             TIMESTAMPTZ(6)  NOT NULL DEFAULT NOW(),
    "actualizado_en"        TIMESTAMPTZ(6)  NOT NULL DEFAULT NOW(),

    CONSTRAINT "actividades_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "actividades_convocatoria_fkey" FOREIGN KEY ("id_convocatoria")
        REFERENCES "convocatorias" ("id") ON DELETE CASCADE,
    CONSTRAINT "actividades_creador_fkey" FOREIGN KEY ("creado_por")
        REFERENCES "usuarios" ("id") ON DELETE RESTRICT
);

COMMENT ON TABLE "actividades" IS 'Tareas o actividades específicas dentro de cada convocatoria de servicio social';
COMMENT ON COLUMN "actividades"."horas_maximas" IS 'Si se define, el estudiante no puede reportar más horas que este tope por actividad';

CREATE INDEX IF NOT EXISTS "idx_actividades_convocatoria" ON "actividades" ("id_convocatoria");
CREATE INDEX IF NOT EXISTS "idx_actividades_activa"       ON "actividades" ("esta_activa");
CREATE INDEX IF NOT EXISTS "idx_actividades_limite"       ON "actividades" ("fecha_limite");

-- ─────────────────────────────────────────────────────────────

-- Tabla: reportes_horas
-- CAMBIOS vs versión anterior:
--   + id_convocatoria UUID (desnormalizado, FK a convocatorias)
--   + fecha_actividad DATE
--   - Se elimina "archivos_soporte JSONB" → reemplazado por tabla evidencias_reporte
CREATE TABLE IF NOT EXISTS "reportes_horas" (
    "id"                    UUID            NOT NULL DEFAULT uuid_generate_v4(),
    "id_estudiante"         UUID            NOT NULL,
    "id_actividad"          UUID            NOT NULL,
    "id_convocatoria"       UUID,           -- NUEVO: campo desnormalizado Prisma
    "horas_reportadas"      DECIMAL(5,2)    NOT NULL,
    "horas_aprobadas"       DECIMAL(5,2),
    "estado"                "EstadoReporte" NOT NULL DEFAULT 'REPORTADO',
    "descripcion_trabajo"   TEXT,
    "fecha_actividad"       DATE,           -- NUEVO campo Prisma
    "notas_estudiante"      TEXT,
    "id_revisor"            UUID,
    "notas_revisor"         TEXT,
    "motivo_rechazo"        TEXT,
    "reportado_en"          TIMESTAMPTZ(6)  NOT NULL DEFAULT NOW(),
    "revisado_en"           TIMESTAMPTZ(6),

    CONSTRAINT "reportes_horas_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "reportes_actividad_fkey" FOREIGN KEY ("id_actividad")
        REFERENCES "actividades" ("id") ON DELETE RESTRICT,
    CONSTRAINT "reportes_convocatoria_fkey" FOREIGN KEY ("id_convocatoria")
        REFERENCES "convocatorias" ("id") ON DELETE SET NULL,  -- NUEVO FK Prisma
    CONSTRAINT "reportes_estudiante_fkey" FOREIGN KEY ("id_estudiante")
        REFERENCES "usuarios" ("id") ON DELETE RESTRICT,
    CONSTRAINT "reportes_revisor_fkey" FOREIGN KEY ("id_revisor")
        REFERENCES "usuarios" ("id") ON DELETE SET NULL
);

COMMENT ON TABLE "reportes_horas" IS 'Registros de horas de servicio social reportadas por estudiantes, sujetas a validación';
COMMENT ON COLUMN "reportes_horas"."id_convocatoria" IS 'Desnormalizado para consultas directas por convocatoria sin JOIN adicional';
COMMENT ON COLUMN "reportes_horas"."fecha_actividad" IS 'Fecha real en que se realizó la actividad (puede diferir de reportado_en)';

CREATE INDEX IF NOT EXISTS "idx_reportes_est_estado"       ON "reportes_horas" ("id_estudiante", "estado");
CREATE INDEX IF NOT EXISTS "idx_reportes_actividad"        ON "reportes_horas" ("id_actividad");
CREATE INDEX IF NOT EXISTS "idx_reportes_convocatoria_est" ON "reportes_horas" ("id_convocatoria", "estado");  -- NUEVO índice Prisma
CREATE INDEX IF NOT EXISTS "idx_reportes_revisor_estado"   ON "reportes_horas" ("id_revisor", "estado");
CREATE INDEX IF NOT EXISTS "idx_reportes_estado"           ON "reportes_horas" ("estado");
CREATE INDEX IF NOT EXISTS "idx_reportes_fecha"            ON "reportes_horas" ("reportado_en" DESC);
CREATE INDEX IF NOT EXISTS "idx_reportes_fecha_actividad"  ON "reportes_horas" ("fecha_actividad");  -- NUEVO índice Prisma

-- ─────────────────────────────────────────────────────────────

-- Tabla: evidencias_reporte
-- NUEVA: reemplaza el campo JSONB "archivos_soporte" del SQL anterior
CREATE TABLE IF NOT EXISTS "evidencias_reporte" (
    "id"              UUID            NOT NULL DEFAULT uuid_generate_v4(),
    "id_reporte"      UUID            NOT NULL,
    "tipo"            "TipoEvidencia" NOT NULL DEFAULT 'TEXTO',
    "contenido_texto" TEXT,                          -- Para evidencias de tipo TEXTO
    "archivo_url"     VARCHAR(500),                  -- URL del archivo en almacenamiento
    "archivo_nombre"  VARCHAR(200),                  -- Nombre original del archivo
    "archivo_mime"    VARCHAR(100),                  -- Tipo MIME (image/png, application/pdf…)
    "peso_bytes"      INT,                           -- Tamaño en bytes (MAX: 5 242 880 = 5 MB)
    "public_id"       VARCHAR(255),                  -- ID en Cloudinary u otro proveedor
    "subido_en"       TIMESTAMPTZ(6)  NOT NULL DEFAULT NOW(),

    CONSTRAINT "evidencias_reporte_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "evidencias_reporte_reporte_fkey" FOREIGN KEY ("id_reporte")
        REFERENCES "reportes_horas" ("id") ON DELETE CASCADE
);

COMMENT ON TABLE "evidencias_reporte" IS 'Evidencias adjuntas a un reporte de horas (texto, imagen o documento)';
COMMENT ON COLUMN "evidencias_reporte"."peso_bytes" IS 'Tamaño máximo permitido: 5 242 880 bytes (5 MB)';
COMMENT ON COLUMN "evidencias_reporte"."public_id" IS 'ID del recurso en Cloudinary u otro proveedor de almacenamiento externo';

CREATE INDEX IF NOT EXISTS "idx_evidencias_reporte" ON "evidencias_reporte" ("id_reporte");
CREATE INDEX IF NOT EXISTS "idx_evidencias_tipo"    ON "evidencias_reporte" ("tipo");

-- ─────────────────────────────────────────────────────────────

-- Tabla: historial_horas
CREATE TABLE IF NOT EXISTS "historial_horas" (
    "id"                UUID           NOT NULL DEFAULT uuid_generate_v4(),
    "id_reporte_horas"  UUID           NOT NULL,
    "modificado_por"    UUID           NOT NULL,
    "estado_anterior"   VARCHAR(50),
    "estado_nuevo"      VARCHAR(50)    NOT NULL,
    "horas_anteriores"  DECIMAL(5,2),
    "horas_nuevas"      DECIMAL(5,2),
    "razon"             TEXT,
    "modificado_en"     TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),

    CONSTRAINT "historial_horas_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "historial_reporte_fkey" FOREIGN KEY ("id_reporte_horas")
        REFERENCES "reportes_horas" ("id") ON DELETE CASCADE,
    CONSTRAINT "historial_modificador_fkey" FOREIGN KEY ("modificado_por")
        REFERENCES "usuarios" ("id") ON DELETE RESTRICT
);

COMMENT ON TABLE "historial_horas" IS 'Trazabilidad completa de todos los cambios realizados en los reportes de horas';

CREATE INDEX IF NOT EXISTS "idx_historial_reporte"     ON "historial_horas" ("id_reporte_horas");
CREATE INDEX IF NOT EXISTS "idx_historial_modificador" ON "historial_horas" ("modificado_por");
CREATE INDEX IF NOT EXISTS "idx_historial_fecha"       ON "historial_horas" ("modificado_en" DESC);

-- ============================================================
-- MÓDULO: CERTIFICADOS
-- ============================================================

-- Tabla: certificados
CREATE TABLE IF NOT EXISTS "certificados" (
    "id"                    UUID           NOT NULL DEFAULT uuid_generate_v4(),
    "id_estudiante"         UUID           NOT NULL,
    "id_convocatoria"       UUID,
    "emitido_por"           UUID           NOT NULL,
    "total_horas"           DECIMAL(6,2)   NOT NULL,
    "periodo_desde"         DATE,
    "periodo_hasta"         DATE,
    "codigo_verificacion"   UUID           NOT NULL DEFAULT uuid_generate_v4(),
    "url_pdf"               VARCHAR(500)   NOT NULL,
    "descripcion"           TEXT,
    "nombre_aliado"         VARCHAR(200),
    "nombre_convocatoria"   VARCHAR(200),
    "emitido_en"            TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
    "esta_vigente"          BOOLEAN        NOT NULL DEFAULT TRUE,
    "motivo_anulacion"      TEXT,

    CONSTRAINT "certificados_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "certificados_verificacion_unique" UNIQUE ("codigo_verificacion"),
    CONSTRAINT "certificados_estudiante_fkey" FOREIGN KEY ("id_estudiante")
        REFERENCES "usuarios" ("id") ON DELETE RESTRICT,
    CONSTRAINT "certificados_convocatoria_fkey" FOREIGN KEY ("id_convocatoria")
        REFERENCES "convocatorias" ("id") ON DELETE SET NULL,
    CONSTRAINT "certificados_emisor_fkey" FOREIGN KEY ("emitido_por")
        REFERENCES "usuarios" ("id") ON DELETE RESTRICT
);

COMMENT ON TABLE "certificados" IS 'Certificados digitales de servicio social emitidos a estudiantes con verificación QR';
COMMENT ON COLUMN "certificados"."codigo_verificacion" IS 'UUID único embebido en el QR para verificación pública del certificado';
COMMENT ON COLUMN "certificados"."nombre_aliado" IS 'Snapshot del nombre del aliado al momento de emisión';

CREATE INDEX IF NOT EXISTS "idx_certificados_codigo"       ON "certificados" ("codigo_verificacion");
CREATE INDEX IF NOT EXISTS "idx_certificados_estudiante"   ON "certificados" ("id_estudiante");
CREATE INDEX IF NOT EXISTS "idx_certificados_convocatoria" ON "certificados" ("id_convocatoria");
CREATE INDEX IF NOT EXISTS "idx_certificados_fecha"        ON "certificados" ("emitido_en" DESC);
CREATE INDEX IF NOT EXISTS "idx_certificados_vigente"      ON "certificados" ("esta_vigente");
CREATE INDEX IF NOT EXISTS "idx_certificados_emisor"       ON "certificados" ("emitido_por");  -- NUEVO índice Prisma

-- ============================================================
-- MÓDULO: ALIADOS
-- ============================================================

-- Tabla: vinculaciones_aliado_programa
-- CAMBIO: se añade "actualizado_en" (presente en Prisma, faltaba en SQL anterior)
CREATE TABLE IF NOT EXISTS "vinculaciones_aliado_programa" (
    "id"                    UUID                NOT NULL DEFAULT uuid_generate_v4(),
    "id_aliado"             UUID                NOT NULL,
    "id_programa"           UUID                NOT NULL,
    "aprobado_por"          UUID,
    "estado"                "EstadoVinculacion" NOT NULL DEFAULT 'PENDIENTE',
    "documento_convenio"    VARCHAR(500),
    "numero_convenio"       VARCHAR(100),
    "fecha_inicio_convenio" DATE,
    "fecha_fin_convenio"    DATE,
    "observaciones"         TEXT,
    "creado_en"             TIMESTAMPTZ(6)      NOT NULL DEFAULT NOW(),
    "revisado_en"           TIMESTAMPTZ(6),
    "actualizado_en"        TIMESTAMPTZ(6)      NOT NULL DEFAULT NOW(),  -- NUEVO campo Prisma

    CONSTRAINT "vinculaciones_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "vinculaciones_unica" UNIQUE ("id_aliado", "id_programa"),
    CONSTRAINT "vinculaciones_aliado_fkey" FOREIGN KEY ("id_aliado")
        REFERENCES "usuarios" ("id") ON DELETE CASCADE,
    CONSTRAINT "vinculaciones_programa_fkey" FOREIGN KEY ("id_programa")
        REFERENCES "programas" ("id") ON DELETE RESTRICT,
    CONSTRAINT "vinculaciones_aprobador_fkey" FOREIGN KEY ("aprobado_por")
        REFERENCES "usuarios" ("id") ON DELETE SET NULL
);

COMMENT ON TABLE "vinculaciones_aliado_programa" IS 'Convenios o vinculaciones entre aliados externos y programas académicos';
COMMENT ON COLUMN "vinculaciones_aliado_programa"."numero_convenio" IS 'Número de radicado o consecutivo del convenio en la institución';

CREATE INDEX IF NOT EXISTS "idx_vinculaciones_estado"   ON "vinculaciones_aliado_programa" ("estado");
CREATE INDEX IF NOT EXISTS "idx_vinculaciones_aliado"   ON "vinculaciones_aliado_programa" ("id_aliado");
CREATE INDEX IF NOT EXISTS "idx_vinculaciones_programa" ON "vinculaciones_aliado_programa" ("id_programa");

-- ============================================================
-- MÓDULO: SOLICITUDES DE CAMBIO DE PERFIL
-- NUEVA: Esta tabla no existía en el SQL anterior
-- ============================================================

CREATE TABLE IF NOT EXISTS "solicitudes_cambio_perfil" (
    "id"             UUID             NOT NULL DEFAULT uuid_generate_v4(),
    "id_usuario"     UUID             NOT NULL,
    "datos_nuevos"   JSONB            NOT NULL,  -- Campos que el estudiante quiere cambiar
    "estado"         "EstadoSolicitud" NOT NULL DEFAULT 'PENDIENTE',
    "motivo_rechazo" TEXT,
    "creado_en"      TIMESTAMPTZ(6)   NOT NULL DEFAULT NOW(),
    "revisado_en"    TIMESTAMPTZ(6),
    "revisado_por"   UUID,
    "actualizado_en" TIMESTAMPTZ(6)   NOT NULL DEFAULT NOW(),

    CONSTRAINT "solicitudes_cambio_perfil_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "solicitudes_usuario_fkey" FOREIGN KEY ("id_usuario")
        REFERENCES "usuarios" ("id") ON DELETE CASCADE,
    CONSTRAINT "solicitudes_revisor_fkey" FOREIGN KEY ("revisado_por")
        REFERENCES "usuarios" ("id") ON DELETE SET NULL
);

COMMENT ON TABLE "solicitudes_cambio_perfil" IS 'Solicitudes de cambio de datos de perfil por parte de estudiantes';
COMMENT ON COLUMN "solicitudes_cambio_perfil"."datos_nuevos" IS 'JSON con los campos que el estudiante quiere modificar: { primer_nombre?, telefono?, ... }';

CREATE INDEX IF NOT EXISTS "idx_solicitudes_perfil_usuario"   ON "solicitudes_cambio_perfil" ("id_usuario");
CREATE INDEX IF NOT EXISTS "idx_solicitudes_perfil_estado"    ON "solicitudes_cambio_perfil" ("estado");
CREATE INDEX IF NOT EXISTS "idx_solicitudes_perfil_revisor"   ON "solicitudes_cambio_perfil" ("revisado_por");

-- ============================================================
-- MÓDULO: NOTICIAS
-- NUEVA: Esta tabla no existía en el SQL anterior
-- ============================================================

CREATE TABLE IF NOT EXISTS "noticias" (
    "id"                UUID           NOT NULL DEFAULT uuid_generate_v4(),
    "titulo"            VARCHAR(200)   NOT NULL,
    "slug"              VARCHAR(250)   NOT NULL,
    "resumen"           TEXT           NOT NULL,
    "contenido"         TEXT           NOT NULL,
    "autor"             VARCHAR(150)   NOT NULL,
    "publicada"         BOOLEAN        NOT NULL DEFAULT FALSE,
    "fecha_publicacion" TIMESTAMPTZ(6),
    "creado_en"         TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
    "actualizado_en"    TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),

    CONSTRAINT "noticias_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "noticias_slug_unique" UNIQUE ("slug")
);

COMMENT ON TABLE "noticias" IS 'Noticias institucionales del sistema';

CREATE INDEX IF NOT EXISTS "idx_noticias_publicada"    ON "noticias" ("publicada");
CREATE INDEX IF NOT EXISTS "idx_noticias_fecha"        ON "noticias" ("fecha_publicacion" DESC);
CREATE INDEX IF NOT EXISTS "idx_noticias_slug"         ON "noticias" ("slug");

-- ─────────────────────────────────────────────────────────────

-- Tabla: imagenes_noticias
-- NUEVA: Esta tabla no existía en el SQL anterior
CREATE TABLE IF NOT EXISTS "imagenes_noticias" (
    "id"                    UUID           NOT NULL DEFAULT uuid_generate_v4(),
    "id_noticia"            UUID           NOT NULL,
    "url_imagen"            VARCHAR(500)   NOT NULL,
    "public_id_cloudinary"  VARCHAR(255)   NOT NULL,
    "orden"                 INT            NOT NULL DEFAULT 0,
    "creado_en"             TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),

    CONSTRAINT "imagenes_noticias_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "imagenes_noticias_noticia_fkey" FOREIGN KEY ("id_noticia")
        REFERENCES "noticias" ("id") ON DELETE CASCADE
);

COMMENT ON TABLE "imagenes_noticias" IS 'Imágenes asociadas a noticias institucionales';

CREATE INDEX IF NOT EXISTS "idx_imagenes_noticias_noticia" ON "imagenes_noticias" ("id_noticia");
CREATE INDEX IF NOT EXISTS "idx_imagenes_noticias_orden"   ON "imagenes_noticias" ("orden");

-- ============================================================
-- MÓDULO: NOTIFICACIONES
-- ============================================================

-- Tabla: notificaciones
CREATE TABLE IF NOT EXISTS "notificaciones" (
    "id"            UUID                NOT NULL DEFAULT uuid_generate_v4(),
    "id_usuario"    UUID                NOT NULL,
    "tipo"          "TipoNotificacion"  NOT NULL,
    "titulo"        VARCHAR(200)        NOT NULL,
    "mensaje"       TEXT                NOT NULL,
    "url_accion"    VARCHAR(500),
    "leida"         BOOLEAN             NOT NULL DEFAULT FALSE,
    "leida_en"      TIMESTAMPTZ(6),
    "creado_en"     TIMESTAMPTZ(6)      NOT NULL DEFAULT NOW(),

    CONSTRAINT "notificaciones_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "notificaciones_usuario_fkey" FOREIGN KEY ("id_usuario")
        REFERENCES "usuarios" ("id") ON DELETE CASCADE
);

COMMENT ON TABLE "notificaciones" IS 'Sistema interno de notificaciones para informar a los usuarios de eventos relevantes';

CREATE INDEX IF NOT EXISTS "idx_notificaciones_usuario_leida" ON "notificaciones" ("id_usuario", "leida");
CREATE INDEX IF NOT EXISTS "idx_notificaciones_usuario_fecha" ON "notificaciones" ("id_usuario", "creado_en" DESC);

-- ─────────────────────────────────────────────────────────────

-- Tabla: plantillas_notificacion
CREATE TABLE IF NOT EXISTS "plantillas_notificacion" (
    "id"                UUID               NOT NULL DEFAULT uuid_generate_v4(),
    "nombre"            VARCHAR(100)       NOT NULL,
    "tipo"              "TipoNotificacion" NOT NULL,
    "asunto_correo"     VARCHAR(200),
    "mensaje_plantilla" TEXT               NOT NULL,
    "mensaje_whatsapp"  TEXT,
    "variables"         JSONB,
    "esta_activa"       BOOLEAN            NOT NULL DEFAULT TRUE,
    "creado_por"        UUID               NOT NULL,
    "creado_en"         TIMESTAMPTZ(6)     NOT NULL DEFAULT NOW(),
    "actualizado_en"    TIMESTAMPTZ(6)     NOT NULL DEFAULT NOW(),

    CONSTRAINT "plantillas_notif_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "plantillas_notif_nombre_unique" UNIQUE ("nombre"),
    CONSTRAINT "plantillas_notif_creador_fkey" FOREIGN KEY ("creado_por")
        REFERENCES "usuarios" ("id") ON DELETE RESTRICT
);

COMMENT ON TABLE "plantillas_notificacion" IS 'Plantillas reutilizables para envío de notificaciones masivas';
COMMENT ON COLUMN "plantillas_notificacion"."variables" IS 'JSON con lista de variables: ["{{nombre}}", "{{programa}}", "{{fecha}}"]';

CREATE INDEX IF NOT EXISTS "idx_plantillas_tipo"   ON "plantillas_notificacion" ("tipo");
CREATE INDEX IF NOT EXISTS "idx_plantillas_activa" ON "plantillas_notificacion" ("esta_activa");

-- ─────────────────────────────────────────────────────────────

-- Tabla: notificaciones_masivas
CREATE TABLE IF NOT EXISTS "notificaciones_masivas" (
    "id"                    UUID                   NOT NULL DEFAULT uuid_generate_v4(),
    "id_plantilla"          UUID,
    "titulo"                VARCHAR(200)           NOT NULL,
    "mensaje"               TEXT                   NOT NULL,
    "canales"               "CanalNotificacion"[]  NOT NULL DEFAULT '{INTERNA}',
    "creado_por"            UUID                   NOT NULL,
    "fecha_programada"      TIMESTAMPTZ(6),
    "destinatarios_filtro"  JSONB,
    "destinatarios_count"   INT                    NOT NULL DEFAULT 0,
    "enviados_count"        INT                    NOT NULL DEFAULT 0,
    "fallidos_count"        INT                    NOT NULL DEFAULT 0,
    "estado"                "EstadoEnvio"          NOT NULL DEFAULT 'PENDIENTE',
    "enviado_en"            TIMESTAMPTZ(6),
    "creado_en"             TIMESTAMPTZ(6)         NOT NULL DEFAULT NOW(),
    "actualizado_en"        TIMESTAMPTZ(6)         NOT NULL DEFAULT NOW(),

    CONSTRAINT "notif_masivas_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "notif_masivas_plantilla_fkey" FOREIGN KEY ("id_plantilla")
        REFERENCES "plantillas_notificacion" ("id") ON DELETE SET NULL,
    CONSTRAINT "notif_masivas_creador_fkey" FOREIGN KEY ("creado_por")
        REFERENCES "usuarios" ("id") ON DELETE RESTRICT
);

COMMENT ON TABLE "notificaciones_masivas" IS 'Envíos masivos de notificaciones a grupos de usuarios';
COMMENT ON COLUMN "notificaciones_masivas"."destinatarios_filtro" IS 'JSON con filtros: {"programas": ["uuid1"], "roles": ["ESTUDIANTE"], "facultades": ["uuid2"]}';

CREATE INDEX IF NOT EXISTS "idx_notif_masivas_estado"  ON "notificaciones_masivas" ("estado");
CREATE INDEX IF NOT EXISTS "idx_notif_masivas_creador" ON "notificaciones_masivas" ("creado_por");
CREATE INDEX IF NOT EXISTS "idx_notif_masivas_fecha"   ON "notificaciones_masivas" ("creado_en" DESC);

-- ─────────────────────────────────────────────────────────────

-- Tabla: historial_envio_notif
CREATE TABLE IF NOT EXISTS "historial_envio_notif" (
    "id"                        UUID                NOT NULL DEFAULT uuid_generate_v4(),
    "id_notificacion_masiva"    UUID                NOT NULL,
    "id_usuario_destino"        UUID                NOT NULL,
    "canal"                     "CanalNotificacion" NOT NULL,
    "estado"                    "EstadoEnvio"       NOT NULL DEFAULT 'PENDIENTE',
    "direccion_envio"           VARCHAR(300),
    "mensaje_enviado"           TEXT,
    "error_detalle"             TEXT,
    "intentos"                  INT                 NOT NULL DEFAULT 1,
    "enviado_en"                TIMESTAMPTZ(6),
    "creado_en"                 TIMESTAMPTZ(6)      NOT NULL DEFAULT NOW(),

    CONSTRAINT "historial_envio_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "historial_envio_masiva_fkey" FOREIGN KEY ("id_notificacion_masiva")
        REFERENCES "notificaciones_masivas" ("id") ON DELETE CASCADE,
    CONSTRAINT "historial_envio_destino_fkey" FOREIGN KEY ("id_usuario_destino")
        REFERENCES "usuarios" ("id") ON DELETE CASCADE
);

COMMENT ON TABLE "historial_envio_notif" IS 'Historial detallado de cada envío individual de notificaciones masivas';

CREATE INDEX IF NOT EXISTS "idx_historial_envio_masiva"  ON "historial_envio_notif" ("id_notificacion_masiva");
CREATE INDEX IF NOT EXISTS "idx_historial_envio_destino" ON "historial_envio_notif" ("id_usuario_destino");
CREATE INDEX IF NOT EXISTS "idx_historial_envio_estado"  ON "historial_envio_notif" ("estado");
CREATE INDEX IF NOT EXISTS "idx_historial_envio_canal"   ON "historial_envio_notif" ("canal");

-- ============================================================
-- MÓDULO: AUDITORÍA
-- ============================================================

-- Tabla: logs_actividad
CREATE TABLE IF NOT EXISTS "logs_actividad" (
    "id"                UUID                NOT NULL DEFAULT uuid_generate_v4(),
    "id_usuario"        UUID,
    "accion"            VARCHAR(100)        NOT NULL,
    "entidad"           VARCHAR(100),
    "id_entidad"        UUID,
    "descripcion"       TEXT,
    "datos_anteriores"  JSONB,
    "datos_nuevos"      JSONB,
    "ip_origen"         VARCHAR(45),
    "user_agent"        TEXT,
    "resultado"         "ResultadoAccion"   NOT NULL DEFAULT 'EXITOSO',
    "metadata"          JSONB,
    "creado_en"         TIMESTAMPTZ(6)      NOT NULL DEFAULT NOW(),

    CONSTRAINT "logs_actividad_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "logs_usuario_fkey" FOREIGN KEY ("id_usuario")
        REFERENCES "usuarios" ("id") ON DELETE SET NULL
);

COMMENT ON TABLE "logs_actividad" IS 'Registro de auditoría de todas las acciones realizadas en el sistema';
COMMENT ON COLUMN "logs_actividad"."datos_anteriores" IS 'Snapshot del estado del objeto ANTES de la modificación';
COMMENT ON COLUMN "logs_actividad"."datos_nuevos" IS 'Snapshot del estado del objeto DESPUÉS de la modificación';

CREATE INDEX IF NOT EXISTS "idx_logs_usuario"   ON "logs_actividad" ("id_usuario");
CREATE INDEX IF NOT EXISTS "idx_logs_accion"    ON "logs_actividad" ("accion");
CREATE INDEX IF NOT EXISTS "idx_logs_fecha"     ON "logs_actividad" ("creado_en" DESC);
CREATE INDEX IF NOT EXISTS "idx_logs_entidad"   ON "logs_actividad" ("entidad", "id_entidad");
CREATE INDEX IF NOT EXISTS "idx_logs_resultado" ON "logs_actividad" ("resultado");

-- ============================================================
-- TRIGGERS: ACTUALIZACIÓN AUTOMÁTICA DE "actualizado_en"
-- ============================================================

CREATE OR REPLACE FUNCTION fn_actualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "trg_facultades_actualizar"
    BEFORE UPDATE ON "facultades"
    FOR EACH ROW EXECUTE FUNCTION fn_actualizar_timestamp();

CREATE TRIGGER "trg_programas_actualizar"
    BEFORE UPDATE ON "programas"
    FOR EACH ROW EXECUTE FUNCTION fn_actualizar_timestamp();

CREATE TRIGGER "trg_usuarios_actualizar"
    BEFORE UPDATE ON "usuarios"
    FOR EACH ROW EXECUTE FUNCTION fn_actualizar_timestamp();

CREATE TRIGGER "trg_perfiles_actualizar"
    BEFORE UPDATE ON "perfiles_estudiante"
    FOR EACH ROW EXECUTE FUNCTION fn_actualizar_timestamp();

-- NUEVO: trigger para categorias_servicio_social (campo actualizado_en añadido en Prisma)
CREATE TRIGGER "trg_categorias_ss_actualizar"
    BEFORE UPDATE ON "categorias_servicio_social"
    FOR EACH ROW EXECUTE FUNCTION fn_actualizar_timestamp();

CREATE TRIGGER "trg_convocatorias_actualizar"
    BEFORE UPDATE ON "convocatorias"
    FOR EACH ROW EXECUTE FUNCTION fn_actualizar_timestamp();

CREATE TRIGGER "trg_actividades_actualizar"
    BEFORE UPDATE ON "actividades"
    FOR EACH ROW EXECUTE FUNCTION fn_actualizar_timestamp();

-- NUEVO: trigger para vinculaciones_aliado_programa (campo actualizado_en añadido en Prisma)
CREATE TRIGGER "trg_vinculaciones_actualizar"
    BEFORE UPDATE ON "vinculaciones_aliado_programa"
    FOR EACH ROW EXECUTE FUNCTION fn_actualizar_timestamp();

-- NUEVO: trigger para solicitudes_cambio_perfil
CREATE TRIGGER "trg_solicitudes_perfil_actualizar"
    BEFORE UPDATE ON "solicitudes_cambio_perfil"
    FOR EACH ROW EXECUTE FUNCTION fn_actualizar_timestamp();

-- NUEVO: trigger para noticias
CREATE TRIGGER "trg_noticias_actualizar"
    BEFORE UPDATE ON "noticias"
    FOR EACH ROW EXECUTE FUNCTION fn_actualizar_timestamp();

CREATE TRIGGER "trg_plantillas_actualizar"
    BEFORE UPDATE ON "plantillas_notificacion"
    FOR EACH ROW EXECUTE FUNCTION fn_actualizar_timestamp();

CREATE TRIGGER "trg_notif_masivas_actualizar"
    BEFORE UPDATE ON "notificaciones_masivas"
    FOR EACH ROW EXECUTE FUNCTION fn_actualizar_timestamp();

-- ============================================================
-- TRIGGER: ACTUALIZAR CUPO DISPONIBLE EN CONVOCATORIA
-- ============================================================

CREATE OR REPLACE FUNCTION fn_actualizar_cupo_disponible()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.estado = 'ACEPTADA' AND (OLD.estado IS NULL OR OLD.estado != 'ACEPTADA') THEN
        UPDATE "convocatorias"
        SET "cupo_disponible" = "cupo_disponible" - 1
        WHERE "id" = NEW.id_convocatoria
          AND "cupo_disponible" IS NOT NULL
          AND "cupo_disponible" > 0;
    END IF;

    IF OLD.estado = 'ACEPTADA' AND NEW.estado != 'ACEPTADA' THEN
        UPDATE "convocatorias"
        SET "cupo_disponible" = "cupo_disponible" + 1
        WHERE "id" = NEW.id_convocatoria
          AND "cupo_disponible" IS NOT NULL;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "trg_postulaciones_cupo"
    AFTER UPDATE ON "postulaciones"
    FOR EACH ROW EXECUTE FUNCTION fn_actualizar_cupo_disponible();

-- ============================================================
-- TRIGGER: SINCRONIZAR HORAS ACUMULADAS EN PERFIL ESTUDIANTE
-- ============================================================

CREATE OR REPLACE FUNCTION fn_sincronizar_horas_estudiante()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.estado = 'APROBADO' AND (OLD.estado IS NULL OR OLD.estado != 'APROBADO') THEN
        UPDATE "perfiles_estudiante"
        SET "horas_acumuladas" = (
            SELECT COALESCE(SUM(rh.horas_aprobadas), 0)
            FROM "reportes_horas" rh
            WHERE rh.id_estudiante = NEW.id_estudiante
              AND rh.estado = 'APROBADO'
        )
        WHERE "id_usuario" = NEW.id_estudiante;
    END IF;

    IF OLD.estado = 'APROBADO' AND NEW.estado != 'APROBADO' THEN
        UPDATE "perfiles_estudiante"
        SET "horas_acumuladas" = (
            SELECT COALESCE(SUM(rh.horas_aprobadas), 0)
            FROM "reportes_horas" rh
            WHERE rh.id_estudiante = NEW.id_estudiante
              AND rh.estado = 'APROBADO'
        )
        WHERE "id_usuario" = NEW.id_estudiante;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "trg_reportes_sincronizar_horas"
    AFTER UPDATE ON "reportes_horas"
    FOR EACH ROW EXECUTE FUNCTION fn_sincronizar_horas_estudiante();

-- ============================================================
-- VISTAS ÚTILES
-- ============================================================

-- Vista: resumen de avance de estudiantes
CREATE OR REPLACE VIEW "v_avance_estudiantes" AS
SELECT
    u.id,
    u.primer_nombre || ' ' || u.primer_apellido AS nombre_completo,
    u.numero_documento,
    u.correo,
    u.estado AS estado_usuario,
    p.nombre AS programa,
    f.nombre AS facultad,
    pe.horas_previas,
    pe.horas_acumuladas,
    p.horas_requeridas,
    ROUND(
        ((pe.horas_previas + pe.horas_acumuladas) / p.horas_requeridas) * 100, 2
    ) AS porcentaje_avance,
    pe.codigo_estudiantil,
    pe.semestre_actual
FROM "usuarios" u
JOIN "perfiles_estudiante" pe ON pe.id_usuario = u.id
JOIN "programas" p ON p.id = u.id_programa
JOIN "facultades" f ON f.id = p.id_facultad
WHERE u.rol = 'ESTUDIANTE'
  AND u.estado = 'ACTIVO';

COMMENT ON VIEW "v_avance_estudiantes" IS 'Vista consolidada del avance de cada estudiante en sus horas de servicio social';

-- ─────────────────────────────────────────────────────────────

-- Vista: convocatorias activas con información del aliado
CREATE OR REPLACE VIEW "v_convocatorias_activas" AS
SELECT
    c.id,
    c.titulo,
    c.descripcion,
    c.modalidad,
    c.fecha_inicio,
    c.fecha_fin,
    c.fecha_cierre_postulacion,
    c.cupo_maximo,
    c.cupo_disponible,
    c.horas_totales_ofrecidas,
    c.requiere_entrevista,
    cat.nombre AS categoria,
    u.primer_nombre || ' ' || u.primer_apellido AS nombre_aliado,
    u.correo AS correo_aliado,
    p.nombre AS programa_dirigido,
    (
        SELECT COUNT(*)
        FROM "postulaciones" po
        WHERE po.id_convocatoria = c.id
          AND po.estado = 'ACEPTADA'
    ) AS postulados_aceptados
FROM "convocatorias" c
JOIN "usuarios" u ON u.id = c.publicado_por
LEFT JOIN "categorias_servicio_social" cat ON cat.id = c.id_categoria
LEFT JOIN "programas" p ON p.id = c.id_programa
WHERE c.estado = 'PUBLICADA'
  AND (c.fecha_cierre_postulacion IS NULL OR c.fecha_cierre_postulacion >= CURRENT_DATE);

COMMENT ON VIEW "v_convocatorias_activas" IS 'Convocatorias publicadas y disponibles para postulación';

-- ============================================================
-- DATOS SEMILLA INICIALES
-- ============================================================

INSERT INTO "categorias_servicio_social" ("id", "nombre", "descripcion", "icono", "color_hex", "esta_activa")
VALUES
    (uuid_generate_v4(), 'Educación y Formación',      'Actividades de apoyo académico, tutorías y enseñanza',               'book-open',    '#4F46E5', TRUE),
    (uuid_generate_v4(), 'Salud y Bienestar',           'Jornadas de salud, apoyo psicosocial y bienestar comunitario',        'heart',        '#DC2626', TRUE),
    (uuid_generate_v4(), 'Medio Ambiente',              'Conservación ambiental, reforestación y educación ecológica',         'leaf',         '#16A34A', TRUE),
    (uuid_generate_v4(), 'Emprendimiento y Economía',   'Asesoría a emprendedores, apoyo a MIPYMES y desarrollo económico',   'trending-up',  '#D97706', TRUE),
    (uuid_generate_v4(), 'Tecnología e Innovación',     'Alfabetización digital, desarrollo tecnológico comunitario',         'cpu',          '#0891B2', TRUE),
    (uuid_generate_v4(), 'Arte y Cultura',              'Proyectos culturales, patrimonio y expresión artística',             'palette',      '#9333EA', TRUE),
    (uuid_generate_v4(), 'Derechos y Ciudadanía',       'Asesoría jurídica, derechos humanos y participación ciudadana',      'shield',       '#F59E0B', TRUE),
    (uuid_generate_v4(), 'Desarrollo Comunitario',      'Proyectos sociales, trabajo comunitario y desarrollo territorial',   'users',        '#6B7280', TRUE)
ON CONFLICT ("nombre") DO NOTHING;

INSERT INTO "facultades" ("id", "nombre", "codigo", "descripcion", "esta_activo")
VALUES
    (uuid_generate_v4(), 'Facultad de Ciencias Económicas y Administrativas',          'FCEA',  'Facultad encargada de los programas de administración, contaduría y economía', TRUE),
    (uuid_generate_v4(), 'Facultad de Ciencias Humanas, Sociales y de la Educación',   'FCHSE', 'Facultad de humanidades, educación y ciencias sociales',                       TRUE),
    (uuid_generate_v4(), 'Facultad de Ingeniería',                                     'FING',  'Facultad de ingeniería de sistemas y tecnologías de información',              TRUE),
    (uuid_generate_v4(), 'Facultad de Ciencias de la Salud',                           'FCS',   'Facultad de medicina, enfermería y ciencias de la salud',                      TRUE)
ON CONFLICT ("nombre") DO NOTHING;

-- ============================================================
-- PERMISOS (ajustar usuario según entorno)
-- ============================================================

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO postgres;

-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================