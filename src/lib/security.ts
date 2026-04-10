// ============================================================
// SEGURIDAD BACKEND - IMPLEMENTACIÓN OWASP
// Sistema Servicio Social UCP
// Protección contra vulnerabilidades comunes
// ============================================================

import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

// Constantes de seguridad
export const SECURITY_CONFIG = {
  // Límite de rate limiting (peticiones por minuto)
  RATE_LIMIT_PER_MINUTE: 60,
  
  // Tamaño máximo de archivos (10MB)
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  
  // Tiempo de expiración de tokens (15 minutos)
  TOKEN_EXPIRY_MINUTES: 15,
  
  // Longitud mínima de contraseñas
  MIN_PASSWORD_LENGTH: 8,
  
  // Algoritmo de hash
  HASH_ALGORITHM: 'sha256',
  
  // Número de iteraciones para hash
  HASH_ITERATIONS: 10000,
} as const;

// Clase para manejo de seguridad
export class SecurityManager {
  // Generar token seguro aleatorio
  static generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  // Hash seguro de contraseñas
  static async hashPassword(password: string, salt?: string): Promise<{ hash: string; salt: string }> {
    const generatedSalt = salt || crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, generatedSalt, SECURITY_CONFIG.HASH_ITERATIONS, 64, SECURITY_CONFIG.HASH_ALGORITHM).toString('hex');
    return { hash, salt: generatedSalt };
  }

  // Verificar contraseña
  static async verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
    const computedHash = crypto.pbkdf2Sync(password, salt, SECURITY_CONFIG.HASH_ITERATIONS, 64, SECURITY_CONFIG.HASH_ALGORITHM).toString('hex');
    return computedHash === hash;
  }

  // Sanitizar entrada de texto
  static sanitizeInput(input: string): string {
    if (!input) return '';
    
    return input
      .trim()
      .replace(/[<>]/g, '') // Remover tags HTML básicos
      .replace(/javascript:/gi, '') // Remover protocolos javascript
      .replace(/on\w+\s*=/gi, '') // Remover event handlers
      .substring(0, 1000); // Limitar longitud
  }

  // Validar email con regex segura
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  // Validar contraseña segura
  static isStrongPassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < SECURITY_CONFIG.MIN_PASSWORD_LENGTH) {
      errors.push(`La contraseña debe tener al menos ${SECURITY_CONFIG.MIN_PASSWORD_LENGTH} caracteres`);
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('La contraseña debe contener al menos una mayúscula');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('La contraseña debe contener al menos una minúscula');
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('La contraseña debe contener al menos un número');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('La contraseña debe contener al menos un carácter especial');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Generar headers de seguridad
  static getSecurityHeaders(): Record<string, string> {
    return {
      // Prevenir XSS
      'X-XSS-Protection': '1; mode=block',
      'X-Content-Type-Options': 'nosniff',
      
      // Prevenir clickjacking
      'X-Frame-Options': 'DENY',
      
      // Forzar HTTPS en producción
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      
      // Política de contenido (restrictiva)
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "font-src 'self'",
        "connect-src 'self'",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'"
      ].join('; '),
      
      // No referer en navegación sensible
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      
      // Permisos de características
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
    };
  }

  // Rate limiting simple en memoria
  private static rateLimitMap = new Map<string, { count: number; resetTime: number }>();

  static checkRateLimit(identifier: string, limit: number = SECURITY_CONFIG.RATE_LIMIT_PER_MINUTE): boolean {
    const now = Date.now();
    const record = this.rateLimitMap.get(identifier);
    
    if (!record || now > record.resetTime) {
      // Nueva ventana de tiempo
      this.rateLimitMap.set(identifier, {
        count: 1,
        resetTime: now + 60000 // 1 minuto
      });
      return true;
    }
    
    if (record.count >= limit) {
      return false; // Excedido el límite
    }
    
    record.count++;
    return true;
  }

  // Validar tipo de archivo seguro
  static isSecureFileType(filename: string, mimeType: string): boolean {
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx'];
    const allowedMimeTypes = [
      'image/jpeg', 'image/png', 'image/gif', 
      'application/pdf', 
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    return allowedExtensions.includes(extension) && allowedMimeTypes.includes(mimeType);
  }

  // Generar nonce para CSP
  static generateNonce(): string {
    return crypto.randomBytes(16).toString('base64');
  }
}

// Middleware de seguridad para API routes
export function securityMiddleware(request: NextRequest): NextResponse | null {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  
  // Rate limiting
  if (!SecurityManager.checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Demasiadas peticiones. Intente más tarde.' },
      { status: 429 }
    );
  }

  // Validar Content-Type para peticiones POST/PUT
  if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
    const contentType = request.headers.get('content-type');
    if (!contentType || (!contentType.includes('application/json') && !contentType.includes('multipart/form-data'))) {
      return NextResponse.json(
        { error: 'Content-Type no válido' },
        { status: 400 }
      );
    }
  }

  return null; // Continuar con la petición
}

// Función para añadir headers de seguridad a respuestas
export function addSecurityHeaders(response: NextResponse): NextResponse {
  const headers = SecurityManager.getSecurityHeaders();
  
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
}

// Exportar utilidades de validación
export const validators = {
  sanitizeInput: SecurityManager.sanitizeInput,
  isValidEmail: SecurityManager.isValidEmail,
  isStrongPassword: SecurityManager.isStrongPassword,
  isSecureFileType: SecurityManager.isSecureFileType,
  generateSecureToken: SecurityManager.generateSecureToken,
};
