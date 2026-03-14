import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Mapa de rutas protegidas: ruta → roles permitidos
const PROTECTED_ROUTES: Record<string, string[]> = {
    '/administrador': ['ADMINISTRADOR'],
    '/sistema/profesor': ['ADMINISTRADOR', 'PROFESOR'],
    '/sistema/aliado': ['ADMINISTRADOR', 'ALIADO'],
    '/sistema/auxiliar': ['ADMINISTRADOR', 'AUXILIAR'],
    '/sistema/estudiante': ['ADMINISTRADOR', 'ESTUDIANTE'],
};

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Si no hay token, redirigir a login
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    const userRole = token.role as string;
    
    // Verificar si la ruta está protegida y si el usuario tiene acceso
    for (const [route, allowedRoles] of Object.entries(PROTECTED_ROUTES)) {
      if (pathname.startsWith(route)) {
        if (!allowedRoles.includes(userRole)) {
          // Redirigir al dashboard del rol del usuario
          const roleRoutes: Record<string, string> = {
            ADMINISTRADOR: '/administrador',
            PROFESOR: '/sistema/profesor',
            ALIADO: '/sistema/aliado',
            AUXILIAR: '/sistema/auxiliar',
            ESTUDIANTE: '/sistema/estudiante',
          };
          
          const redirectRoute = roleRoutes[userRole] || '/login';
          return NextResponse.redirect(new URL(redirectRoute, req.url));
        }
        break;
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ req, token }) {
        if (!token) return false;
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    "/administrador/:path*",
    "/sistema/profesor/:path*",
    "/sistema/aliado/:path*",
    "/sistema/auxiliar/:path*",
    "/sistema/estudiante/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico|login|recuperar-contrasena|restablecer-contrasena|verificar).*)",
  ],
};
