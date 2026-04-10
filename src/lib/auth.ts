import { NextAuthOptions } from 'next-auth';
import { prisma } from './prisma';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { Rol } from '@prisma/client';

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60,
  },
  providers: [
    CredentialsProvider({
      name: 'Credenciales Institucionales',
      credentials: {
        email: { label: 'Correo', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials: any) {
        if (!credentials?.email || !credentials?.password) {
          console.log('[AUTH] Credenciales faltantes');
          return null;
        }

        console.log('[AUTH] Buscando usuario:', credentials.email);
        const user = await prisma.usuario.findUnique({
          where: { correo: credentials.email },
        });

        if (!user) {
          console.log('[AUTH] Usuario no encontrado');
          return null;
        }

        if (!user.contrasena_hash) {
          console.log('[AUTH] Usuario sin contraseña configurada');
          return null;
        }

        if (user.esta_bloqueado) {
          console.log('[AUTH] Cuenta bloqueada para:', credentials.email);
          // Lanzar error específico que será capturado por NextAuth
          throw new Error('CUENTA_BLOQUEADA');
        }

        console.log('[AUTH] Verificando contraseña...');
        const isValid = await bcrypt.compare(credentials.password, user.contrasena_hash);
        console.log('[AUTH] Contraseña válida:', isValid);

        if (!isValid) return null;

        return {
          id: user.id,
          email: user.correo,
          name: `${user.primer_nombre} ${user.primer_apellido}`,
          role: user.rol,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Redirigir al dashboard correspondiente según el rol
      if (url === baseUrl || url === `${baseUrl}/` || url.includes('/login')) {
        return `${baseUrl}/sistema/profesor/dashboard`;
      }
      // Permitir redirecciones relativas o del mismo dominio
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (url.startsWith(baseUrl)) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  events: {
    async signIn({ user }: any) {
      if (user) {
        await prisma.logActividad.create({
          data: {
            accion: 'LOGIN_EXITOSO',
            entidad: 'USUARIO',
            id_entidad: user.id,
            descripcion: `Inicio de sesión exitoso: ${user.email} (${user.role})`,
            id_usuario: user.id,
            resultado: 'EXITOSO'
          }
        });
      }
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: false,
};