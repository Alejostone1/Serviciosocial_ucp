// ============================================================
// CLIENTE PRISMA SINGLETON OPTIMIZADO
// Sistema Servicio Social UCP
// Previene múltiples conexiones y elimina desconexiones innecesarias
// ============================================================

import { PrismaClient } from '@prisma/client';

// Variable global para mantener la instancia singleton
declare global {
  var __prisma: PrismaClient | undefined;
}

// Singleton simple sin listeners de desconexión
const prisma: PrismaClient = globalThis.__prisma || new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL!
    }
  },
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  errorFormat: process.env.NODE_ENV === 'development' ? 'pretty' : 'minimal',
  transactionOptions: {
    timeout: 10000, 
    maxWait: 5000,  
  },
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

// Exportar instancia singleton directamente
export { prisma };

// Exportar db con métodos helper para compatibilidad
export const db = {
  execute: <T>(operation: (prisma: PrismaClient) => Promise<T>, errorMessage?: string) => 
    operation(prisma),
    
  transaction: <T>(operations: (prisma: PrismaClient) => Promise<T>, errorMessage?: string) => 
    prisma.$transaction(async (tx) => operations(tx as PrismaClient)),
};

// Exportar tipo para uso en componentes
export type PrismaClientType = PrismaClient;