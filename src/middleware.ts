import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

/**
 * MIDDLEWARE DE PROTECCIÓN DE RUTAS — RBAC
 * Sistema de Servicio Social UCP
 * 
 * Intercepta peticiones y verifica autenticación + rol antes de permitir el acceso
 * a rutas protegidas del sistema.
 */

// Mapa de rutas protegidas: ruta → roles permitidos
const PROTECTED_ROUTES: Record<string, string[]> = {
    '/administrador': ['ADMINISTRADOR'],
    '/sistema/director': ['ADMINISTRADOR', 'DIRECTOR'],
    '/sistema/aliado': ['ADMINISTRADOR', 'ALIADO'],
    '/sistema/auxiliar': ['ADMINISTRADOR', 'AUXILIAR'],
    '/sistema/estudiante': ['ADMINISTRADOR', 'ESTUDIANTE'],
    '/sistema/profesor': ['ADMINISTRADOR', 'PROFESOR'],
};

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Determinar si la ruta requiere protección
    const protectedRoute = Object.keys(PROTECTED_ROUTES).find((route) =>
        pathname.startsWith(route)
    );

    if (!protectedRoute) {
        return NextResponse.next(); // Ruta pública, dejar pasar
    }

    // Verificar token JWT de la sesión
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET || 'ucp-default-secret-change-me',
    });

    // Sin sesión → redirigir al login
    if (!token) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
    }

    const userRole = token.role as string;
    const allowedRoles = PROTECTED_ROUTES[protectedRoute];

    // Rol no autorizado → redirigir al panel correspondiente
    if (!allowedRoles.includes(userRole)) {
        const roleRoutes: Record<string, string> = {
            ADMINISTRADOR: '/administrador',
            DIRECTOR: '/sistema/director',
            ALIADO: '/sistema/aliado',
            AUXILIAR: '/sistema/auxiliar',
            ESTUDIANTE: '/sistema/estudiante',
            PROFESOR: '/sistema/profesor',
        };
        return NextResponse.redirect(new URL(roleRoutes[userRole] ?? '/', request.url));
    }

    return NextResponse.next();
}

// Definir qué rutas activan el middleware
export const config = {
    matcher: [
        '/administrador/:path*',
        '/sistema/director/:path*',
        '/sistema/aliado/:path*',
        '/sistema/auxiliar/:path*',
        '/sistema/estudiante/:path*',
        '/sistema/profesor/:path*',
    ],
};
