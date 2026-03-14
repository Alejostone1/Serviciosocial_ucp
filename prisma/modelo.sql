-- ============================================================
-- SCRIPT SQL - SISTEMA DE SERVICIO SOCIAL
-- Universidad Católica de Pereira (UCP)
-- Base de datos: bdserviciosocialucp
-- Motor: PostgreSQL 15+
-- Compatible con: pgAdmin 4
-- ============================================================

-- Crear base de datos (ejecutar como superusuario si no existe)
-- CREATE DATABASE bdserviciosocialucp
--     WITH ENCODING = 'UTF8'
--     LC_COLLATE = 'es_CO.UTF-8'
--     LC_CTYPE = 'es_CO.UTF-8'
--     TEMPLATE = template0;

-- Conectarse a la base de datos
-- \c bdserviciosocialucp

-- Habilitar extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TIPOS ENUMERADOS
-- ============================================================

CREATE TYPE "Rol" AS ENUM (
    'ADMINISTRADOR',
    'DIRECTOR',
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

CREATE TYPE "EstadoConvocatoria" AS ENUM (
    'BORRADOR',
    'PUBLICADA',
    'EN_CURSO',
    'CERRADA',
    'CANCELADA'
);

CREATE TYPE "EstadoPostulacion" AS ENUM (
    'PENDIENTE',
    'EN_REVISION',
    'ACEPTADA',
    'RECHAZADA',
    'RETIRADA'
);

CREATE TYPE "EstadoReporte" AS ENUM (
    'REPORTADO',
    'PENDIENTE_VALIDACION',
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

-- ============================================================
-- MÓDULO: ESTRUCTURA ACADÉMICA
-- ============================================================

-- Tabla: facultades
CREATE TABLE IF NOT EXISTS "facultades" (
    "id"                UUID            NOT NULL DEFAULT uuid_generate_v4(),
    "nombre"            VARCHAR(150)    NOT NULL,
    "codigo"            VARCHAR(20)     UNIQUE,
    "descripcion"       TEXT,
    "decano"            VARCHAR(200),                          -- Nombre del decano actual
    "correo_contacto"   VARCHAR(200),                          -- Correo institucional de la facultad
    "telefono_ext"      VARCHAR(10),                           -- Extensión telefónica interna
    "esta_activo"       BOOLEAN         NOT NULL DEFAULT TRUE,
    "creado_en"         TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    "actualizado_en"    TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT "facultades_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "facultades_nombre_unique" UNIQUE ("nombre")
);

COMMENT ON TABLE "facultades" IS 'Facultades académicas de la Universidad Católica de Pereira';
COMMENT ON COLUMN "facultades"."decano" IS 'Nombre del decano o jefe de facultad vigente';
COMMENT ON COLUMN "facultades"."correo_contacto" IS 'Correo institucional de contacto de la facultad';

-- Índices para facultades
CREATE INDEX IF NOT EXISTS "idx_facultades_nombre" ON "facultades" ("nombre");
CREATE INDEX IF NOT EXISTS "idx_facultades_activo" ON "facultades" ("esta_activo");

-- ─────────────────────────────────────────────────────────────

-- Tabla: programas
CREATE TABLE IF NOT EXISTS "programas" (
    "id"                UUID            NOT NULL DEFAULT uuid_generate_v4(),
    "nombre"            VARCHAR(150)    NOT NULL,
    "codigo"            VARCHAR(20)     UNIQUE,
    "id_facultad"       UUID            NOT NULL,
    "nivel_formacion"   "NivelFormacion" NOT NULL DEFAULT 'PREGRADO',
    "horas_requeridas"  DECIMAL(6,2)    NOT NULL DEFAULT 120,  -- Horas mínimas exigidas de servicio social
    "esta_activo"       BOOLEAN         NOT NULL DEFAULT TRUE,
    "creado_en"         TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    "actualizado_en"    TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT "programas_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "programas_nombre_unique" UNIQUE ("nombre"),
    CONSTRAINT "programas_facultad_fkey" FOREIGN KEY ("id_facultad")
        REFERENCES "facultades" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

COMMENT ON TABLE "programas" IS 'Programas académicos asociados a cada facultad';
COMMENT ON COLUMN "programas"."horas_requeridas" IS 'Total de horas de servicio social requeridas para completar el requisito';

-- Índices para programas
CREATE INDEX IF NOT EXISTS "idx_programas_facultad" ON "programas" ("id_facultad");
CREATE INDEX IF NOT EXISTS "idx_programas_codigo" ON "programas" ("codigo");
CREATE INDEX IF NOT EXISTS "idx_programas_activo" ON "programas" ("esta_activo");

-- ============================================================
-- MÓDULO: USUARIOS Y AUTENTICACIÓN
-- ============================================================

-- Tabla: usuarios
CREATE TABLE IF NOT EXISTS "usuarios" (
    "id"                    UUID            NOT NULL DEFAULT uuid_generate_v4(),
    "primer_nombre"         VARCHAR(80)     NOT NULL,
    "segundo_nombre"        VARCHAR(80),
    "primer_apellido"       VARCHAR(80)     NOT NULL,
    "segundo_apellido"      VARCHAR(80),
    "tipo_documento"        "TipoDocumento" NOT NULL DEFAULT 'CC',
    "numero_documento"      VARCHAR(20)     NOT NULL,
    "correo"                VARCHAR(200)    NOT NULL,           -- Correo institucional UCP
    "correo_personal"       VARCHAR(200),                      -- Correo alterno personal
    "contrasena_hash"       VARCHAR(255),
    "telefono"              VARCHAR(20),
    "foto_url"              VARCHAR(500),                      -- URL de foto de perfil
    "rol"                   "Rol"           NOT NULL,
    "id_programa"           UUID,                              -- Programa al que pertenece
    "esta_bloqueado"        BOOLEAN         NOT NULL DEFAULT FALSE,
    "motivo_bloqueo"        TEXT,                              -- Razón del bloqueo si está bloqueado
    "ultimo_acceso"         TIMESTAMPTZ,                       -- Marca de tiempo del último inicio de sesión
    "requiere_cambio_clave" BOOLEAN         NOT NULL DEFAULT FALSE, -- Forzar cambio en siguiente login
    "creado_en"             TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    "actualizado_en"        TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "usuarios_documento_unique" UNIQUE ("numero_documento"),
    CONSTRAINT "usuarios_correo_unique" UNIQUE ("correo"),
    CONSTRAINT "usuarios_programa_fkey" FOREIGN KEY ("id_programa")
        REFERENCES "programas" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

COMMENT ON TABLE "usuarios" IS 'Usuarios del sistema: administradores, directores, aliados, auxiliares y estudiantes';
COMMENT ON COLUMN "usuarios"."correo" IS 'Correo institucional, usado como identificador de acceso';
COMMENT ON COLUMN "usuarios"."ultimo_acceso" IS 'Timestamp del último login exitoso';
COMMENT ON COLUMN "usuarios"."requiere_cambio_clave" IS 'Si es true, se obliga al usuario a cambiar contraseña al iniciar sesión';

-- Índices para usuarios
CREATE INDEX IF NOT EXISTS "idx_usuarios_correo" ON "usuarios" ("correo");
CREATE INDEX IF NOT EXISTS "idx_usuarios_rol" ON "usuarios" ("rol");
CREATE INDEX IF NOT EXISTS "idx_usuarios_programa" ON "usuarios" ("id_programa");
CREATE INDEX IF NOT EXISTS "idx_usuarios_documento" ON "usuarios" ("numero_documento");
CREATE INDEX IF NOT EXISTS "idx_usuarios_apellido" ON "usuarios" ("primer_apellido", "primer_nombre");
CREATE INDEX IF NOT EXISTS "idx_usuarios_bloqueado" ON "usuarios" ("esta_bloqueado");

-- ─────────────────────────────────────────────────────────────

-- Tabla: perfiles_estudiante
CREATE TABLE IF NOT EXISTS "perfiles_estudiante" (
    "id_usuario"            UUID            NOT NULL,
    "semestre_actual"       INT,                               -- Semestre que cursa actualmente
    "codigo_estudiantil"    VARCHAR(30)     UNIQUE,            -- Código estudiantil institucional
    "url_hoja_de_vida"      VARCHAR(500),
    "habilidades"           TEXT[]          NOT NULL DEFAULT '{}',
    "intereses"             TEXT[]          NOT NULL DEFAULT '{}',
    "disponibilidad"        JSONB,                             -- Horarios disponibles estructurados
    "modalidad_preferida"   "Modalidad",
    "horas_previas"         DECIMAL(6,2)    NOT NULL DEFAULT 0, -- Horas validadas antes del sistema
    "horas_acumuladas"      DECIMAL(6,2)    NOT NULL DEFAULT 0, -- Total horas aprobadas en el sistema
    "porcentaje_avance"     DECIMAL(5,2)    NOT NULL DEFAULT 0, -- % completitud del requisito
    "creado_en"             TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    "actualizado_en"        TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT "perfiles_estudiante_pkey" PRIMARY KEY ("id_usuario"),
    CONSTRAINT "perfiles_estudiante_usuario_fkey" FOREIGN KEY ("id_usuario")
        REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

COMMENT ON TABLE "perfiles_estudiante" IS 'Perfil extendido con información académica y preferencias de los estudiantes';
COMMENT ON COLUMN "perfiles_estudiante"."disponibilidad" IS 'JSON con horarios: {"lunes": ["08:00-10:00"], "martes": ["14:00-16:00"]}';
COMMENT ON COLUMN "perfiles_estudiante"."horas_previas" IS 'Horas de servicio social realizadas antes de ingresar al sistema, validadas manualmente';
COMMENT ON COLUMN "perfiles_estudiante"."porcentaje_avance" IS 'Calculado: (horas_previas + horas_acumuladas) / horas_requeridas_programa * 100';

-- Índices para perfiles_estudiante
CREATE INDEX IF NOT EXISTS "idx_perfiles_codigo" ON "perfiles_estudiante" ("codigo_estudiantil");
CREATE INDEX IF NOT EXISTS "idx_perfiles_horas" ON "perfiles_estudiante" ("horas_acumuladas");
CREATE INDEX IF NOT EXISTS "idx_perfiles_avance" ON "perfiles_estudiante" ("porcentaje_avance");

-- ─────────────────────────────────────────────────────────────

-- Tabla: tokens_recuperacion
CREATE TABLE IF NOT EXISTS "tokens_recuperacion" (
    "id"            UUID        NOT NULL DEFAULT uuid_generate_v4(),
    "id_usuario"    UUID        NOT NULL,
    "token"         VARCHAR(255) NOT NULL,
    "tipo"          "TipoToken" NOT NULL DEFAULT 'RECUPERACION',
    "expira_en"     TIMESTAMPTZ NOT NULL,
    "usado_en"      TIMESTAMPTZ,
    "ip_origen"     VARCHAR(45),                               -- IP desde la que se solicitó el token
    "creado_en"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT "tokens_recuperacion_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "tokens_recuperacion_token_unique" UNIQUE ("token"),
    CONSTRAINT "tokens_recuperacion_usuario_fkey" FOREIGN KEY ("id_usuario")
        REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

COMMENT ON TABLE "tokens_recuperacion" IS 'Tokens de seguridad para recuperación de contraseña y activación de cuentas';
COMMENT ON COLUMN "tokens_recuperacion"."ip_origen" IS 'Dirección IP desde la que se generó la solicitud (IPv4 o IPv6)';

-- Índices para tokens_recuperacion
CREATE INDEX IF NOT EXISTS "idx_tokens_usuario" ON "tokens_recuperacion" ("id_usuario");
CREATE INDEX IF NOT EXISTS "idx_tokens_token" ON "tokens_recuperacion" ("token");
CREATE INDEX IF NOT EXISTS "idx_tokens_expira" ON "tokens_recuperacion" ("expira_en");

-- ─────────────────────────────────────────────────────────────

-- Tabla: sesiones_usuario
CREATE TABLE IF NOT EXISTS "sesiones_usuario" (
    "id"            UUID        NOT NULL DEFAULT uuid_generate_v4(),
    "id_usuario"    UUID        NOT NULL,
    "token_sesion"  VARCHAR(500) NOT NULL,                     -- JWT u otro token de sesión
    "ip_origen"     VARCHAR(45),
    "user_agent"    TEXT,
    "dispositivo"   VARCHAR(100),                              -- Información resumida del dispositivo
    "esta_activa"   BOOLEAN     NOT NULL DEFAULT TRUE,
    "creado_en"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "expira_en"     TIMESTAMPTZ NOT NULL,
    "cerrada_en"    TIMESTAMPTZ,                               -- Cuándo se cerró la sesión manualmente

    CONSTRAINT "sesiones_usuario_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "sesiones_token_unique" UNIQUE ("token_sesion"),
    CONSTRAINT "sesiones_usuario_fkey" FOREIGN KEY ("id_usuario")
        REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

COMMENT ON TABLE "sesiones_usuario" IS 'Registro de sesiones activas e historial de acceso al sistema';

-- Índices para sesiones_usuario
CREATE INDEX IF NOT EXISTS "idx_sesiones_usuario_activa" ON "sesiones_usuario" ("id_usuario", "esta_activa");
CREATE INDEX IF NOT EXISTS "idx_sesiones_token" ON "sesiones_usuario" ("token_sesion");
CREATE INDEX IF NOT EXISTS "idx_sesiones_expira" ON "sesiones_usuario" ("expira_en");

-- ============================================================
-- MÓDULO: CONVOCATORIAS Y POSTULACIONES
-- ============================================================

-- Tabla: categorias_servicio_social
CREATE TABLE IF NOT EXISTS "categorias_servicio_social" (
    "id"            UUID        NOT NULL DEFAULT uuid_generate_v4(),
    "nombre"        VARCHAR(100) NOT NULL,
    "descripcion"   TEXT,
    "icono"         VARCHAR(100),                              -- Nombre del icono (ej: "book", "heart")
    "color_hex"     VARCHAR(7),                               -- Color hex para UI: #FF5733
    "esta_activa"   BOOLEAN     NOT NULL DEFAULT TRUE,
    "creado_en"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT "categorias_ss_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "categorias_ss_nombre_unique" UNIQUE ("nombre")
);

COMMENT ON TABLE "categorias_servicio_social" IS 'Categorías para clasificar y filtrar convocatorias de servicio social';
COMMENT ON COLUMN "categorias_servicio_social"."color_hex" IS 'Color en formato hexadecimal para representación visual en la UI';

-- ─────────────────────────────────────────────────────────────

-- Tabla: convocatorias
CREATE TABLE IF NOT EXISTS "convocatorias" (
    "id"                        UUID                NOT NULL DEFAULT uuid_generate_v4(),
    "titulo"                    VARCHAR(200)        NOT NULL,
    "descripcion"               TEXT                NOT NULL,
    "objetivo"                  TEXT,                                  -- Objetivo principal del servicio
    "id_categoria"              UUID,
    "publicado_por"             UUID                NOT NULL,           -- Aliado que publica
    "id_programa"               UUID,                                  -- Null = aplica a todos los programas
    "modalidad"                 "Modalidad"         NOT NULL,
    "lugar"                     VARCHAR(200),                          -- Dirección para modalidad presencial/híbrida
    "url_convocatoria_externa"  VARCHAR(500),                         -- Enlace externo adicional
    "competencias_requeridas"   TEXT[]              NOT NULL DEFAULT '{}',
    "estado"                    "EstadoConvocatoria" NOT NULL DEFAULT 'BORRADOR',
    "fecha_inicio"              DATE                NOT NULL,
    "fecha_fin"                 DATE,
    "fecha_cierre_postulacion"  DATE,                                  -- Último día para postularse
    "cupo_maximo"               INT,
    "cupo_disponible"           INT,                                   -- Se actualiza automáticamente
    "horas_totales_ofrecidas"   DECIMAL(6,2),                         -- Total horas que suma esta convocatoria
    "url_banner"                VARCHAR(500),
    "url_documento_adicional"   VARCHAR(500),                         -- Documento de soporte (PDF, Word)
    "requiere_entrevista"       BOOLEAN             NOT NULL DEFAULT FALSE,
    "creado_en"                 TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    "actualizado_en"            TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    "publicado_en"              TIMESTAMPTZ,                           -- Cuándo cambió a estado PUBLICADA

    CONSTRAINT "convocatorias_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "convocatorias_categoria_fkey" FOREIGN KEY ("id_categoria")
        REFERENCES "categorias_servicio_social" ("id") ON DELETE SET NULL,
    CONSTRAINT "convocatorias_programa_fkey" FOREIGN KEY ("id_programa")
        REFERENCES "programas" ("id") ON DELETE SET NULL,
    CONSTRAINT "convocatorias_publicador_fkey" FOREIGN KEY ("publicado_por")
        REFERENCES "usuarios" ("id") ON DELETE RESTRICT
);

COMMENT ON TABLE "convocatorias" IS 'Convocatorias de servicio social publicadas por aliados externos';
COMMENT ON COLUMN "convocatorias"."publicado_por" IS 'Usuario con rol ALIADO que gestiona la convocatoria';
COMMENT ON COLUMN "convocatorias"."cupo_disponible" IS 'Se actualiza mediante trigger cuando se aceptan postulaciones';
COMMENT ON COLUMN "convocatorias"."requiere_entrevista" IS 'Si es true, el aliado programa entrevista antes de aceptar';

-- Índices para convocatorias
CREATE INDEX IF NOT EXISTS "idx_convocatorias_estado" ON "convocatorias" ("estado");
CREATE INDEX IF NOT EXISTS "idx_convocatorias_programa" ON "convocatorias" ("id_programa");
CREATE INDEX IF NOT EXISTS "idx_convocatorias_publicador" ON "convocatorias" ("publicado_por");
CREATE INDEX IF NOT EXISTS "idx_convocatorias_fechas" ON "convocatorias" ("fecha_inicio", "fecha_fin");
CREATE INDEX IF NOT EXISTS "idx_convocatorias_cierre" ON "convocatorias" ("fecha_cierre_postulacion");
CREATE INDEX IF NOT EXISTS "idx_convocatorias_modalidad" ON "convocatorias" ("modalidad");

-- ─────────────────────────────────────────────────────────────

-- Tabla: postulaciones
CREATE TABLE IF NOT EXISTS "postulaciones" (
    "id"                        UUID                NOT NULL DEFAULT uuid_generate_v4(),
    "id_convocatoria"           UUID                NOT NULL,
    "id_estudiante"             UUID                NOT NULL,
    "estado"                    "EstadoPostulacion"  NOT NULL DEFAULT 'PENDIENTE',
    "motivacion"                TEXT,                                  -- Carta de motivación
    "url_hoja_vida"             VARCHAR(500),                         -- Snapshot HV en el momento de postular
    "habilidades_relevantes"    TEXT[]              NOT NULL DEFAULT '{}',
    "postulado_en"              TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    "revisado_en"               TIMESTAMPTZ,
    "revisado_por"              UUID,
    "notas_revision"            TEXT,
    "fecha_entrevista"          TIMESTAMPTZ,                          -- Fecha/hora de la entrevista si aplica
    "url_acta_entrevista"       VARCHAR(500),                         -- Acta o evidencia de la entrevista

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
COMMENT ON COLUMN "postulaciones"."url_hoja_vida" IS 'Copia de la HV vigente al momento de postularse (para evitar alteraciones posteriores)';

-- Índices para postulaciones
CREATE INDEX IF NOT EXISTS "idx_postulaciones_conv_estado" ON "postulaciones" ("id_convocatoria", "estado");
CREATE INDEX IF NOT EXISTS "idx_postulaciones_est_estado" ON "postulaciones" ("id_estudiante", "estado");
CREATE INDEX IF NOT EXISTS "idx_postulaciones_revisor" ON "postulaciones" ("revisado_por");
CREATE INDEX IF NOT EXISTS "idx_postulaciones_fecha" ON "postulaciones" ("postulado_en" DESC);

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
    "horas_maximas"         DECIMAL(5,2),                              -- Máximo reportable por estudiante
    "fecha_inicio"          DATE,
    "fecha_limite"          DATE,
    "ubicacion"             VARCHAR(200),                              -- Dirección o sala para presenciales
    "materiales_requeridos" TEXT[]          NOT NULL DEFAULT '{}',
    "esta_activa"           BOOLEAN         NOT NULL DEFAULT TRUE,
    "creado_por"            UUID            NOT NULL,
    "creado_en"             TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    "actualizado_en"        TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT "actividades_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "actividades_convocatoria_fkey" FOREIGN KEY ("id_convocatoria")
        REFERENCES "convocatorias" ("id") ON DELETE CASCADE,
    CONSTRAINT "actividades_creador_fkey" FOREIGN KEY ("creado_por")
        REFERENCES "usuarios" ("id") ON DELETE RESTRICT
);

COMMENT ON TABLE "actividades" IS 'Tareas o actividades específicas dentro de cada convocatoria de servicio social';
COMMENT ON COLUMN "actividades"."horas_maximas" IS 'Si se define, el estudiante no puede reportar más horas que este tope por actividad';

-- Índices para actividades
CREATE INDEX IF NOT EXISTS "idx_actividades_convocatoria" ON "actividades" ("id_convocatoria");
CREATE INDEX IF NOT EXISTS "idx_actividades_activa" ON "actividades" ("esta_activa");
CREATE INDEX IF NOT EXISTS "idx_actividades_limite" ON "actividades" ("fecha_limite");

-- ─────────────────────────────────────────────────────────────

-- Tabla: reportes_horas
CREATE TABLE IF NOT EXISTS "reportes_horas" (
    "id"                    UUID            NOT NULL DEFAULT uuid_generate_v4(),
    "id_estudiante"         UUID            NOT NULL,
    "id_actividad"          UUID            NOT NULL,
    "horas_reportadas"      DECIMAL(5,2)    NOT NULL,
    "horas_aprobadas"       DECIMAL(5,2),                              -- El revisor puede ajustar este valor
    "estado"                "EstadoReporte" NOT NULL DEFAULT 'REPORTADO',
    "descripcion_trabajo"   TEXT,                                      -- Qué hizo el estudiante
    "archivos_soporte"      JSONB,                                     -- [{nombre, url, tipo, tamanio_bytes}]
    "notas_estudiante"      TEXT,
    "id_revisor"            UUID,
    "notas_revisor"         TEXT,
    "motivo_rechazo"        TEXT,                                      -- Razón clara si fue rechazado
    "reportado_en"          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    "revisado_en"           TIMESTAMPTZ,

    CONSTRAINT "reportes_horas_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "reportes_actividad_fkey" FOREIGN KEY ("id_actividad")
        REFERENCES "actividades" ("id") ON DELETE RESTRICT,
    CONSTRAINT "reportes_estudiante_fkey" FOREIGN KEY ("id_estudiante")
        REFERENCES "usuarios" ("id") ON DELETE RESTRICT,
    CONSTRAINT "reportes_revisor_fkey" FOREIGN KEY ("id_revisor")
        REFERENCES "usuarios" ("id") ON DELETE SET NULL
);

COMMENT ON TABLE "reportes_horas" IS 'Registros de horas de servicio social reportadas por estudiantes, sujetas a validación';
COMMENT ON COLUMN "reportes_horas"."archivos_soporte" IS 'Array JSON: [{nombre: "foto.jpg", url: "/uploads/...", tipo: "image/jpeg", tamanio_bytes: 204800}]';
COMMENT ON COLUMN "reportes_horas"."motivo_rechazo" IS 'Descripción clara del porqué se rechazan las horas, visible para el estudiante';

-- Índices para reportes_horas
CREATE INDEX IF NOT EXISTS "idx_reportes_est_estado" ON "reportes_horas" ("id_estudiante", "estado");
CREATE INDEX IF NOT EXISTS "idx_reportes_actividad" ON "reportes_horas" ("id_actividad");
CREATE INDEX IF NOT EXISTS "idx_reportes_revisor_estado" ON "reportes_horas" ("id_revisor", "estado");
CREATE INDEX IF NOT EXISTS "idx_reportes_estado" ON "reportes_horas" ("estado");
CREATE INDEX IF NOT EXISTS "idx_reportes_fecha" ON "reportes_horas" ("reportado_en" DESC);

-- ─────────────────────────────────────────────────────────────

-- Tabla: historial_horas
CREATE TABLE IF NOT EXISTS "historial_horas" (
    "id"                UUID        NOT NULL DEFAULT uuid_generate_v4(),
    "id_reporte_horas"  UUID        NOT NULL,
    "modificado_por"    UUID        NOT NULL,
    "estado_anterior"   VARCHAR(50),
    "estado_nuevo"      VARCHAR(50) NOT NULL,
    "horas_anteriores"  DECIMAL(5,2),
    "horas_nuevas"      DECIMAL(5,2),
    "razon"             TEXT,
    "modificado_en"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT "historial_horas_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "historial_reporte_fkey" FOREIGN KEY ("id_reporte_horas")
        REFERENCES "reportes_horas" ("id") ON DELETE CASCADE,
    CONSTRAINT "historial_modificador_fkey" FOREIGN KEY ("modificado_por")
        REFERENCES "usuarios" ("id") ON DELETE RESTRICT
);

COMMENT ON TABLE "historial_horas" IS 'Trazabilidad completa de todos los cambios realizados en los reportes de horas';

-- Índices para historial_horas
CREATE INDEX IF NOT EXISTS "idx_historial_reporte" ON "historial_horas" ("id_reporte_horas");
CREATE INDEX IF NOT EXISTS "idx_historial_modificador" ON "historial_horas" ("modificado_por");
CREATE INDEX IF NOT EXISTS "idx_historial_fecha" ON "historial_horas" ("modificado_en" DESC);

-- ============================================================
-- MÓDULO: CERTIFICADOS
-- ============================================================

-- Tabla: certificados
CREATE TABLE IF NOT EXISTS "certificados" (
    "id"                    UUID        NOT NULL DEFAULT uuid_generate_v4(),
    "id_estudiante"         UUID        NOT NULL,
    "id_convocatoria"       UUID,                                      -- Null = certificado general
    "emitido_por"           UUID        NOT NULL,                       -- Director o Admin
    "total_horas"           DECIMAL(6,2) NOT NULL,
    "periodo_desde"         DATE,                                      -- Inicio del período cubierto
    "periodo_hasta"         DATE,                                      -- Fin del período cubierto
    "codigo_verificacion"   UUID        NOT NULL DEFAULT uuid_generate_v4(), -- Para escaneo QR
    "url_pdf"               VARCHAR(500) NOT NULL,
    "descripcion"           TEXT,
    "nombre_aliado"         VARCHAR(200),                              -- Snapshot del aliado al emitir
    "nombre_convocatoria"   VARCHAR(200),                              -- Snapshot del título al emitir
    "emitido_en"            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "esta_vigente"          BOOLEAN     NOT NULL DEFAULT TRUE,
    "motivo_anulacion"      TEXT,                                      -- Si esta_vigente = false

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
COMMENT ON COLUMN "certificados"."nombre_aliado" IS 'Snapshot del nombre del aliado al momento de emisión, no cambia si el aliado se actualiza';

-- Índices para certificados
CREATE INDEX IF NOT EXISTS "idx_certificados_codigo" ON "certificados" ("codigo_verificacion");
CREATE INDEX IF NOT EXISTS "idx_certificados_estudiante" ON "certificados" ("id_estudiante");
CREATE INDEX IF NOT EXISTS "idx_certificados_convocatoria" ON "certificados" ("id_convocatoria");
CREATE INDEX IF NOT EXISTS "idx_certificados_fecha" ON "certificados" ("emitido_en" DESC);
CREATE INDEX IF NOT EXISTS "idx_certificados_vigente" ON "certificados" ("esta_vigente");

-- ============================================================
-- MÓDULO: ALIADOS
-- ============================================================

-- Tabla: vinculaciones_aliado_programa
CREATE TABLE IF NOT EXISTS "vinculaciones_aliado_programa" (
    "id"                    UUID                NOT NULL DEFAULT uuid_generate_v4(),
    "id_aliado"             UUID                NOT NULL,
    "id_programa"           UUID                NOT NULL,
    "aprobado_por"          UUID,
    "estado"                "EstadoVinculacion" NOT NULL DEFAULT 'PENDIENTE',
    "documento_convenio"    VARCHAR(500),                              -- URL del convenio firmado
    "numero_convenio"       VARCHAR(100),                             -- Número de radicado
    "fecha_inicio_convenio" DATE,
    "fecha_fin_convenio"    DATE,                                     -- Null = convenio indefinido
    "observaciones"         TEXT,
    "creado_en"             TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    "revisado_en"           TIMESTAMPTZ,

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

-- Índices para vinculaciones
CREATE INDEX IF NOT EXISTS "idx_vinculaciones_estado" ON "vinculaciones_aliado_programa" ("estado");
CREATE INDEX IF NOT EXISTS "idx_vinculaciones_aliado" ON "vinculaciones_aliado_programa" ("id_aliado");
CREATE INDEX IF NOT EXISTS "idx_vinculaciones_programa" ON "vinculaciones_aliado_programa" ("id_programa");

-- ============================================================
-- MÓDULO: NOTIFICACIONES
-- ============================================================

-- Tabla: notificaciones
CREATE TABLE IF NOT EXISTS "notificaciones" (
    "id"            UUID                NOT NULL DEFAULT uuid_generate_v4(),
    "id_usuario"    UUID                NOT NULL,                       -- Destinatario
    "tipo"          "TipoNotificacion"  NOT NULL,
    "titulo"        VARCHAR(200)        NOT NULL,
    "mensaje"       TEXT                NOT NULL,
    "url_accion"    VARCHAR(500),                                      -- URL a la que redirige
    "leida"         BOOLEAN             NOT NULL DEFAULT FALSE,
    "leida_en"      TIMESTAMPTZ,
    "creado_en"     TIMESTAMPTZ         NOT NULL DEFAULT NOW(),

    CONSTRAINT "notificaciones_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "notificaciones_usuario_fkey" FOREIGN KEY ("id_usuario")
        REFERENCES "usuarios" ("id") ON DELETE CASCADE
);

COMMENT ON TABLE "notificaciones" IS 'Sistema interno de notificaciones para informar a los usuarios de eventos relevantes';

-- Índices para notificaciones
CREATE INDEX IF NOT EXISTS "idx_notificaciones_usuario_leida" ON "notificaciones" ("id_usuario", "leida");
CREATE INDEX IF NOT EXISTS "idx_notificaciones_usuario_fecha" ON "notificaciones" ("id_usuario", "creado_en" DESC);

-- ─────────────────────────────────────────────────────────────

-- Tabla: plantillas_notificacion
CREATE TABLE IF NOT EXISTS "plantillas_notificacion" (
    "id"                UUID        NOT NULL DEFAULT uuid_generate_v4(),
    "nombre"            VARCHAR(100) NOT NULL,
    "tipo"              "TipoNotificacion" NOT NULL,
    "asunto_correo"     VARCHAR(200),                              -- Asunto para envío por correo
    "mensaje_plantilla" TEXT        NOT NULL,                      -- Plantilla con variables {{nombre}}, {{programa}}, etc.
    "mensaje_whatsapp"  TEXT,                                       -- Versión corta para WhatsApp
    "variables"         JSONB,                                      -- Variables disponibles en la plantilla
    "esta_activa"       BOOLEAN     NOT NULL DEFAULT TRUE,
    "creado_por"        UUID        NOT NULL,
    "creado_en"         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "actualizado_en"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT "plantillas_notif_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "plantillas_notif_nombre_unique" UNIQUE ("nombre"),
    CONSTRAINT "plantillas_notif_creador_fkey" FOREIGN KEY ("creado_por")
        REFERENCES "usuarios" ("id") ON DELETE RESTRICT
);

COMMENT ON TABLE "plantillas_notificacion" IS 'Plantillas reutilizables para envío de notificaciones masivas';
COMMENT ON COLUMN "plantillas_notificacion"."variables" IS 'JSON con lista de variables: ["{{nombre}}", "{{programa}}", "{{fecha}}"]';

-- Índices para plantillas_notificacion
CREATE INDEX IF NOT EXISTS "idx_plantillas_tipo" ON "plantillas_notificacion" ("tipo");
CREATE INDEX IF NOT EXISTS "idx_plantillas_activa" ON "plantillas_notificacion" ("esta_activa");

-- ─────────────────────────────────────────────────────────────

-- Tabla: notificaciones_masivas
CREATE TABLE IF NOT EXISTS "notificaciones_masivas" (
    "id"                    UUID                NOT NULL DEFAULT uuid_generate_v4(),
    "id_plantilla"          UUID,
    "titulo"                VARCHAR(200)        NOT NULL,
    "mensaje"               TEXT                NOT NULL,
    "canales"               "CanalNotificacion"[] NOT NULL DEFAULT '{INTERNA}', -- Canales a usar
    "creado_por"             UUID                NOT NULL,                   -- Admin que crea
    "fecha_programada"       TIMESTAMPTZ,                                    -- Envío programado
    "destinatarios_filtro"   JSONB,                                          -- Filtros: programas, roles, etc.
    "destinatarios_count"    INT                 NOT NULL DEFAULT 0,         -- Total destinatarios
    "enviados_count"         INT                 NOT NULL DEFAULT 0,         -- Total enviados exitosamente
    "fallidos_count"         INT                 NOT NULL DEFAULT 0,         -- Total fallidos
    "estado"                 "EstadoEnvio"        NOT NULL DEFAULT 'PENDIENTE',
    "enviado_en"             TIMESTAMPTZ,                                    -- Cuándo se completó el envío
    "creado_en"              TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    "actualizado_en"         TIMESTAMPTZ         NOT NULL DEFAULT NOW(),

    CONSTRAINT "notif_masivas_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "notif_masivas_plantilla_fkey" FOREIGN KEY ("id_plantilla")
        REFERENCES "plantillas_notificacion" ("id") ON DELETE SET NULL,
    CONSTRAINT "notif_masivas_creador_fkey" FOREIGN KEY ("creado_por")
        REFERENCES "usuarios" ("id") ON DELETE RESTRICT
);

COMMENT ON TABLE "notificaciones_masivas" IS 'Envíos masivos de notificaciones a grupos de usuarios';
COMMENT ON COLUMN "notificaciones_masivas"."canales" IS 'Canales de envío: INTERNA, CORREO, WHATSAPP, SMS';
COMMENT ON COLUMN "notificaciones_masivas"."destinatarios_filtro" IS 'JSON con filtros: {"programas": ["uuid1"], "roles": ["ESTUDIANTE"], "facultades": ["uuid2"]}';

-- Índices para notificaciones_masivas
CREATE INDEX IF NOT EXISTS "idx_notif_masivas_estado" ON "notificaciones_masivas" ("estado");
CREATE INDEX IF NOT EXISTS "idx_notif_masivas_creador" ON "notificaciones_masivas" ("creado_por");
CREATE INDEX IF NOT EXISTS "idx_notif_masivas_fecha" ON "notificaciones_masivas" ("creado_en" DESC);

-- ─────────────────────────────────────────────────────────────

-- Tabla: historial_envio_notif
CREATE TABLE IF NOT EXISTS "historial_envio_notif" (
    "id"                    UUID            NOT NULL DEFAULT uuid_generate_v4(),
    "id_notificacion_masiva" UUID            NOT NULL,
    "id_usuario_destino"    UUID            NOT NULL,
    "canal"                 "CanalNotificacion" NOT NULL,
    "estado"                "EstadoEnvio"   NOT NULL DEFAULT 'PENDIENTE',
    "direccion_envio"       VARCHAR(300),                           -- Correo o teléfono donde se envió
    "mensaje_enviado"       TEXT,                                   -- Mensaje final con variables reemplazadas
    "error_detalle"         TEXT,                                   -- Detalle del error si falló
    "intentos"              INT             NOT NULL DEFAULT 1,     -- Número de intentos de envío
    "enviado_en"            TIMESTAMPTZ,                            -- Cuándo se envió exitosamente
    "creado_en"             TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT "historial_envio_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "historial_envio_masiva_fkey" FOREIGN KEY ("id_notificacion_masiva")
        REFERENCES "notificaciones_masivas" ("id") ON DELETE CASCADE,
    CONSTRAINT "historial_envio_destino_fkey" FOREIGN KEY ("id_usuario_destino")
        REFERENCES "usuarios" ("id") ON DELETE CASCADE
);

COMMENT ON TABLE "historial_envio_notif" IS 'Historial detallado de cada envío individual de notificaciones masivas';
COMMENT ON COLUMN "historial_envio_notif"."direccion_envio" IS 'Correo electrónico o número de teléfono destino';
COMMENT ON COLUMN "historial_envio_notif"."mensaje_enviado" IS 'Mensaje final con todas las variables reemplazadas';

-- Índices para historial_envio_notif
CREATE INDEX IF NOT EXISTS "idx_historial_envio_masiva" ON "historial_envio_notif" ("id_notificacion_masiva");
CREATE INDEX IF NOT EXISTS "idx_historial_envio_destino" ON "historial_envio_notif" ("id_usuario_destino");
CREATE INDEX IF NOT EXISTS "idx_historial_envio_estado" ON "historial_envio_notif" ("estado");
CREATE INDEX IF NOT EXISTS "idx_historial_envio_canal" ON "historial_envio_notif" ("canal");

-- ============================================================
-- MÓDULO: AUDITORÍA
-- ============================================================

-- Tabla: logs_actividad
CREATE TABLE IF NOT EXISTS "logs_actividad" (
    "id"                UUID                NOT NULL DEFAULT uuid_generate_v4(),
    "id_usuario"        UUID,                                          -- Null = acción del sistema
    "accion"            VARCHAR(100)        NOT NULL,                  -- Ej: CREAR_CONVOCATORIA
    "entidad"           VARCHAR(100),                                  -- Nombre del modelo/tabla afectada
    "id_entidad"        UUID,                                          -- ID del registro afectado
    "descripcion"       TEXT,
    "datos_anteriores"  JSONB,                                         -- Estado previo del objeto
    "datos_nuevos"      JSONB,                                         -- Estado nuevo del objeto
    "ip_origen"         VARCHAR(45),
    "user_agent"        TEXT,
    "resultado"         "ResultadoAccion"   NOT NULL DEFAULT 'EXITOSO',
    "metadata"          JSONB,                                         -- Información adicional
    "creado_en"         TIMESTAMPTZ         NOT NULL DEFAULT NOW(),

    CONSTRAINT "logs_actividad_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "logs_usuario_fkey" FOREIGN KEY ("id_usuario")
        REFERENCES "usuarios" ("id") ON DELETE SET NULL
);

COMMENT ON TABLE "logs_actividad" IS 'Registro de auditoría de todas las acciones realizadas en el sistema';
COMMENT ON COLUMN "logs_actividad"."datos_anteriores" IS 'Snapshot del estado del objeto ANTES de la modificación';
COMMENT ON COLUMN "logs_actividad"."datos_nuevos" IS 'Snapshot del estado del objeto DESPUÉS de la modificación';

-- Índices para logs_actividad
CREATE INDEX IF NOT EXISTS "idx_logs_usuario" ON "logs_actividad" ("id_usuario");
CREATE INDEX IF NOT EXISTS "idx_logs_accion" ON "logs_actividad" ("accion");
CREATE INDEX IF NOT EXISTS "idx_logs_fecha" ON "logs_actividad" ("creado_en" DESC);
CREATE INDEX IF NOT EXISTS "idx_logs_entidad" ON "logs_actividad" ("entidad", "id_entidad");
CREATE INDEX IF NOT EXISTS "idx_logs_resultado" ON "logs_actividad" ("resultado");

-- ============================================================
-- TRIGGERS: ACTUALIZACIÓN AUTOMÁTICA DE CAMPOS
-- ============================================================

-- Función genérica para actualizar el campo actualizado_en
CREATE OR REPLACE FUNCTION fn_actualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para cada tabla que tiene actualizado_en
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

CREATE TRIGGER "trg_convocatorias_actualizar"
    BEFORE UPDATE ON "convocatorias"
    FOR EACH ROW EXECUTE FUNCTION fn_actualizar_timestamp();

CREATE TRIGGER "trg_actividades_actualizar"
    BEFORE UPDATE ON "actividades"
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
    -- Cuando se acepta una postulación, reducir el cupo disponible
    IF NEW.estado = 'ACEPTADA' AND (OLD.estado IS NULL OR OLD.estado != 'ACEPTADA') THEN
        UPDATE "convocatorias"
        SET "cupo_disponible" = "cupo_disponible" - 1
        WHERE "id" = NEW.id_convocatoria
          AND "cupo_disponible" IS NOT NULL
          AND "cupo_disponible" > 0;
    END IF;

    -- Si se cancela una aceptación, devolver el cupo
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
    -- Recalcular horas acumuladas cuando se aprueba un reporte
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

    -- Si un reporte aprobado es rechazado después, recalcular
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
  AND u.esta_bloqueado = FALSE;

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
    (SELECT COUNT(*) FROM "postulaciones" po WHERE po.id_convocatoria = c.id AND po.estado = 'ACEPTADA') AS postulados_aceptados
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

-- Insertar categorías de servicio social base
INSERT INTO "categorias_servicio_social" ("id", "nombre", "descripcion", "icono", "color_hex", "esta_activa")
VALUES
    (uuid_generate_v4(), 'Educación y Formación',      'Actividades de apoyo académico, tutorías y enseñanza', 'book-open', '#4F46E5', TRUE),
    (uuid_generate_v4(), 'Salud y Bienestar',          'Jornadas de salud, apoyo psicosocial y bienestar comunitario', 'heart', '#DC2626', TRUE),
    (uuid_generate_v4(), 'Medio Ambiente',             'Conservación ambiental, reforestación y educación ecológica', 'leaf', '#16A34A', TRUE),
    (uuid_generate_v4(), 'Emprendimiento y Economía',  'Asesoría a emprendedores, apoyo a MIPYMES y desarrollo económico', 'trending-up', '#D97706', TRUE),
    (uuid_generate_v4(), 'Tecnología e Innovación',    'Alfabetización digital, desarrollo tecnológico comunitario', 'cpu', '#0891B2', TRUE),
    (uuid_generate_v4(), 'Arte y Cultura',             'Proyectos culturales, patrimonio y expresión artística', 'palette', '#9333EA', TRUE),
    (uuid_generate_v4(), 'Derechos y Ciudadanía',      'Asesoría jurídica, derechos humanos y participación ciudadana', 'shield', '#F59E0B', TRUE),
    (uuid_generate_v4(), 'Desarrollo Comunitario',     'Proyectos sociales, trabajo comunitario y desarrollo territorial', 'users', '#6B7280', TRUE)
ON CONFLICT ("nombre") DO NOTHING;

-- Insertar facultad de ejemplo
INSERT INTO "facultades" ("id", "nombre", "codigo", "descripcion", "esta_activo")
VALUES
    (uuid_generate_v4(), 'Facultad de Ciencias Económicas y Administrativas', 'FCEA', 'Facultad encargada de los programas de administración, contaduría y economía', TRUE),
    (uuid_generate_v4(), 'Facultad de Ciencias Humanas, Sociales y de la Educación', 'FCHSE', 'Facultad de humanidades, educación y ciencias sociales', TRUE),
    (uuid_generate_v4(), 'Facultad de Ingeniería', 'FING', 'Facultad de ingeniería de sistemas y tecnologías de información', TRUE),
    (uuid_generate_v4(), 'Facultad de Ciencias de la Salud', 'FCS', 'Facultad de medicina, enfermería y ciencias de la salud', TRUE)
ON CONFLICT ("nombre") DO NOTHING;

-- ============================================================
-- PERMISOS (ajustar usuario según entorno)
-- ============================================================

-- Otorgar permisos al usuario de la aplicación
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO postgres;

-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================
