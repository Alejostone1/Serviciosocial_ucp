import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

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

    const protectedRoute = Object.keys(PROTECTED_ROUTES).find((route) =>
        pathname.startsWith(route)
    );

    if (!protectedRoute) {
        return NextResponse.next();
    }

    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
    }

    const userRole = token.role as string;
    const allowedRoles = PROTECTED_ROUTES[protectedRoute];

    if (!allowedRoles.includes(userRole)) {
        const roleRoutes: Record<string, string> = {
            ADMINISTRADOR: '/administrador',
            DIRECTOR: '/sistema/director',
            PROFESOR: '/sistema/profesor',
            ALIADO: '/sistema/aliado',
            AUXILIAR: '/sistema/auxiliar',
            ESTUDIANTE: '/sistema/estudiante',
        };

        return NextResponse.redirect(
            new URL(roleRoutes[userRole] ?? '/', request.url)
        );
    }

    return NextResponse.next();
}

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