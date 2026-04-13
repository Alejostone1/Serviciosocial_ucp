// ============================================================
// REACT CACHE PARA OPERACIONES COSTOSAS
// Sistema Servicio Social UCP
// Memoiza operaciones de base de datos para evitar queries repetidas
// ============================================================

import { cache } from 'react';

/**
 * Wrapper para memoizar funciones con React.cache()
 * Útil para queries de Prisma que se repiten en múltiples componentes
 */
export function memoizeQuery<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  key?: string
): T {
  return cache(fn) as T;
}

/**
 * Cache simple con TTL para datos que cambian poco frecuentemente
 */
class SimpleCache<T> {
  private cache = new Map<string, { data: T; expiry: number }>();
  private defaultTTL: number;

  constructor(ttl: number = 60000) {
    this.defaultTTL = ttl;
  }

  set(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + (ttl ?? this.defaultTTL),
    });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }
}

// Instancia global de cache
export const globalCache = new SimpleCache(60000); // 1 minuto por defecto
