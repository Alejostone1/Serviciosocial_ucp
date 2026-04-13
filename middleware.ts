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

// Cache simple para tokens (5 segundos)
const tokenCache = new Map<string, { token: any; expiry: number }>();

async function getCachedToken(req: NextRequest) {
  const cacheKey = req.cookies.get('next-auth.session-token')?.value || 
                   req.cookies.get('__Secure-next-auth.session-token')?.value;
  
  if (!cacheKey) return null;
  
  const cached = tokenCache.get(cacheKey);
  if (cached && cached.expiry > Date.now()) {
    return cached.token;
  }
  
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });
  
  if (token && cacheKey) {
    tokenCache.set(cacheKey, { token, expiry: Date.now() + 5000 });
  }
  
  return token;
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const protectedRoute = Object.keys(PROTECTED_ROUTES).find((route) =>
        pathname.startsWith(route)
    );

    if (!protectedRoute) {
        return NextResponse.next();
    }

    const token = await getCachedToken(request);

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