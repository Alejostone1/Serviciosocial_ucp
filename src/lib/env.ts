// ============================================================
// VALIDACIÓN SEGURA DE VARIABLES DE ENTORNO (OPTIMIZADO)
// Sistema Servicio Social UCP
// Cachea validación para evitar repetición en cada request
// ============================================================

import { z } from 'zod';

// Esquema de validación — variables críticas obligatorias
const envSchema = z.object({
  DATABASE_URL: z.string()
    .min(1, "DATABASE_URL es requerida")
    .refine(
      (val) => val.startsWith('postgresql://') || val.startsWith('postgres://'),
      "DATABASE_URL debe empezar con postgresql:// o postgres://"
    ),
  NEXTAUTH_URL: z.string().url("NEXTAUTH_URL debe ser una URL válida"),
  NEXTAUTH_SECRET: z.string().min(10, "NEXTAUTH_SECRET debe tener al menos 10 caracteres"),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),
  UPLOAD_DIR: z.string().optional(),
  UPLOAD_BASE_URL: z.string().optional(),
  APP_NAME: z.string().optional(),
  APP_URL: z.string().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CERT_BASE_URL: z.string().optional(),
});

// Cache de validación
let cachedEnv: ReturnType<typeof getEnvInternal> | null = null;

function validateEnv(): void {
  try {
    envSchema.parse(process.env);
    console.log('✅ Variables de entorno validadas correctamente');
  } catch (error) {
    if (error instanceof z.ZodError) {
      const msgs = error.errors.map(e => `  • ${e.path.join('.')}: ${e.message}`);
      throw new Error(`❌ Error de validación de variables de entorno:\n${msgs.join('\n')}`);
    }
    throw new Error(`❌ Error crítico en variables de entorno: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

function getEnvInternal() {
  return {
    database: {
      url: process.env.DATABASE_URL!,
    },
    auth: {
      url: process.env.NEXTAUTH_URL!,
      secret: process.env.NEXTAUTH_SECRET!,
    },
    email: {
      host: process.env.SMTP_HOST ?? '',
      port: parseInt(process.env.SMTP_PORT ?? '587'),
      user: process.env.SMTP_USER ?? '',
      pass: process.env.SMTP_PASS ?? '',
      from: process.env.SMTP_FROM ?? '',
    },
    storage: {
      uploadDir: process.env.UPLOAD_DIR ?? './public/uploads',
      uploadBaseUrl: process.env.UPLOAD_BASE_URL ?? 'http://localhost:3000/uploads',
    },
    app: {
      name: process.env.APP_NAME ?? 'Sistema de Servicio Social UCP',
      url: process.env.APP_URL ?? 'http://localhost:3000',
      nodeEnv: process.env.NODE_ENV ?? 'development',
      certBaseUrl: process.env.CERT_BASE_URL ?? 'http://localhost:3000',
    },
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
  };
}

export function getEnv() {
  if (cachedEnv) return cachedEnv;
  
  validateEnv();
  cachedEnv = getEnvInternal();
  return cachedEnv;
}

export { validateEnv };
