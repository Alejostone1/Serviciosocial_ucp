// ============================================================
// CLIENTE PRISMA SINGLETON SEGURO
// Sistema Servicio Social UCP
// Previene múltiples conexiones y maneja errores de forma segura
// ============================================================

import { PrismaClient } from '@prisma/client';
import { getEnv } from './env';

// Variable global para mantener la instancia singleton
declare global {
  var __prisma: PrismaClient | undefined;
}

// Clase para manejo seguro de Prisma
class PrismaManager {
  private static instance: PrismaClient | null = null;
  private static isConnected: boolean = false;

  // Obtener instancia singleton con validación
  static getInstance(): PrismaClient {
    if (!this.instance) {
      try {
        // Validar variables de entorno antes de conectar
        const envData = getEnv();
        
        // Crear instancia con configuración segura
        this.instance = new PrismaClient({
          datasources: {
            db: {
              url: envData.database.url
            }
          },
          // Configuración de logging según entorno
          log: envData.isDevelopment 
            ? ['warn', 'error']  
            : ['error'],
          // Configuración de timeouts para prevenir conexiones colgadas
          transactionOptions: {
            timeout: 10000, 
            maxWait: 5000,  
          },
          // Error formatting seguro
          errorFormat: envData.isDevelopment ? 'pretty' : 'minimal',
        });

        // Marcar como conectado
        this.isConnected = true;
        
        // Log de conexión exitosa (solo en desarrollo)
        if (envData.isDevelopment) {
          console.log('✅ Cliente Prisma inicializado correctamente');
        }

      } catch (error) {
        this.isConnected = false;
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        
        // No exponer detalles sensibles en producción
        const envData = getEnv();
        const safeMessage = envData.isProduction 
          ? 'Error de conexión a base de datos'
          : `Error al inicializar Prisma: ${errorMessage}`;
        
        console.error('❌', safeMessage);
        throw new Error(safeMessage);
      }
    }

    return this.instance;
  }

  // Verificar estado de conexión
  static async checkConnection(): Promise<boolean> {
    try {
      const prisma = this.getInstance();
      
      // Query simple para verificar conexión
      await prisma.$queryRaw`SELECT 1`;
      
      if (!this.isConnected) {
        this.isConnected = true;
        console.log('✅ Conexión a base de datos restablecida');
      }
      
      return true;
      
    } catch (error) {
      this.isConnected = false;
      const envData = getEnv();
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      console.error('❌ Error de conexión a base de datos:', 
        envData.isProduction ? 'Verifique configuración' : errorMessage);
      
      return false;
    }
  }

  // Desconectar de forma segura
  static async disconnect(): Promise<void> {
    if (this.instance) {
      try {
        await this.instance.$disconnect();
        this.instance = null;
        this.isConnected = false;
        console.log('✅ Cliente Prisma desconectado correctamente');
      } catch (error) {
        console.error('❌ Error al desconectar Prisma:', error);
      }
    }
  }

  // Obtener estado de conexión
  static getConnectionStatus(): boolean {
    return this.isConnected;
  }

  // Ejecutar operación con manejo de errores seguro
  static async executeOperation<T>(
    operation: (prisma: PrismaClient) => Promise<T>,
    errorMessage: string = 'Error en operación de base de datos'
  ): Promise<T> {
    const prisma = this.getInstance();
    
    try {
      return await operation(prisma);
    } catch (error) {
      const envData = getEnv();
      const originalError = error instanceof Error ? error.message : 'Error desconocido';
      
      // Mensaje seguro para producción
      const safeMessage = envData.isProduction 
        ? errorMessage 
        : `${errorMessage}: ${originalError}`;
      
      console.error('❌', safeMessage);
      throw new Error(safeMessage);
    }
  }

  // Transacción segura con rollback automático
  static async executeTransaction<T>(
    operations: (prisma: PrismaClient) => Promise<T>,
    errorMessage: string = 'Error en transacción de base de datos'
  ): Promise<T> {
    const prisma = this.getInstance();
    
    try {
      // Usar la sobrecarga correcta de $transaction con callback
      return await prisma.$transaction(async (tx) => {
        // tx es del tipo Omit<PrismaClient, ...> pero podemos usarlo como PrismaClient
        return await operations(tx as PrismaClient);
      });
    } catch (error) {
      const envData = getEnv();
      const originalError = error instanceof Error ? error.message : 'Error desconocido';
      
      // Mensaje seguro para producción
      const safeMessage = envData.isProduction 
        ? errorMessage 
        : `${errorMessage}: ${originalError}`;
      
      console.error('❌', safeMessage);
      throw new Error(safeMessage);
    }
  }
}

// Exportar instancia singleton para uso en la aplicación
export const prisma = PrismaManager.getInstance();

// Exportar funciones de utilidad
export const db = {
  // Conexión y estado
  connect: () => PrismaManager.getInstance(),
  checkConnection: () => PrismaManager.checkConnection(),
  disconnect: () => PrismaManager.disconnect(),
  getStatus: () => PrismaManager.getConnectionStatus(),
  
  // Operaciones seguras
  execute: <T>(operation: (prisma: PrismaClient) => Promise<T>, errorMessage?: string) => 
    PrismaManager.executeOperation(operation, errorMessage),
    
  transaction: <T>(operations: (prisma: PrismaClient) => Promise<T>, errorMessage?: string) => 
    PrismaManager.executeTransaction(operations, errorMessage),
};

// Manejo de cierre gracioso para desarrollo
if (typeof window === 'undefined' && process.env.NODE_ENV === 'development') {
  // Evitar múltiples listeners
  if (!process.listeners('beforeExit').some(listener => listener.toString().includes('PrismaManager.disconnect'))) {
    process.on('beforeExit', async () => {
      await PrismaManager.disconnect();
    });
  }
  
  if (!process.listeners('SIGINT').some(listener => listener.toString().includes('PrismaManager.disconnect'))) {
    process.on('SIGINT', async () => {
      await PrismaManager.disconnect();
      process.exit(0);
    });
  }
}

// Exportar tipo para uso en componentes
export type PrismaClientType = PrismaClient;