'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { AtSign, Lock, Eye, EyeOff, GraduationCap, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { UCPLogo } from '@/components/ui/UCPLogo';
import { LoginBackground } from '@/components/ui/login-background';

/**
 * PÁGINA DE LOGIN — UCP SERVICIO SOCIAL
 * Conectada a NextAuth con redirección automática por rol.
 */
export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    const toastId = toast.loading('Verificando credenciales institucionales...');

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('Correo o contraseña incorrectos. Verifica tus datos e intenta de nuevo.');
      setLoading(false);
      toast.error('Acceso Denegado', {
        id: toastId,
        description: 'Correo o contraseña incorrectos. Verifica tus datos e intenta de nuevo.',
      });
      return;
    }

    // Obtener la sesión para leer el rol y redirigir al panel correspondiente
    const sessionRes = await fetch('/api/auth/session');
    const session = await sessionRes.json();
    const role = session?.user?.role;

    toast.success('Acceso Autorizado', {
      id: toastId,
      description: `Bienvenido de nuevo, redirigiendo al panel de ${role || 'usuario'}...`,
    });

    const routes: Record<string, string> = {
      ADMINISTRADOR: '/administrador',
      PROFESOR: '/sistema/profesor',
      ALIADO: '/sistema/aliado',
      AUXILIAR: '/sistema/auxiliar',
      ESTUDIANTE: '/sistema/estudiante',
    };

    router.push(routes[role] ?? '/');
  };

  return (
    <div className="flex min-h-screen bg-white font-sans">
      {/* Panel Izquierdo — Branding */}
      <LoginBackground className="hidden lg:flex lg:w-1/2 bg-[#8B1E1E] overflow-hidden flex-col justify-between p-12 lg:p-16 text-white">
        <div className="flex flex-col items-start">
          <h1 className="text-xl font-bold tracking-widest leading-none text-white">UCP</h1>
          <span className="text-[10px] font-semibold tracking-[0.2em] text-white/90 mt-1 uppercase">SERVICIO SOCIAL</span>
        </div>

        <div className="max-w-md my-auto pt-12 pb-8">
          <h2 className="text-[3.5rem] font-bold leading-[1.1] mb-8 tracking-tight text-white">
            Potenciando el <br /> Impacto <br /> Comunitario
          </h2>
          <p className="text-lg text-white/90 leading-relaxed font-light mb-12">
            Únete al movimiento de responsabilidad social. Nuestra plataforma conecta a los estudiantes de la Universidad Católica de Pereira con oportunidades de servicio significativas.
          </p>

          <div className="flex gap-16 mt-8">
            <div>
              <span className="block text-[2.75rem] font-extrabold text-[#facc15] leading-none mb-2">150+</span>
              <span className="text-[11px] font-semibold tracking-widest uppercase text-white/90">PROYECTOS ACTIVOS</span>
            </div>
            <div>
              <span className="block text-[2.75rem] font-extrabold text-[#facc15] leading-none mb-2">2.4k</span>
              <span className="text-[11px] font-semibold tracking-widest uppercase text-white/90">ESTUDIANTES INSCRITOS</span>
            </div>
          </div>
        </div>

        <div className="absolute -bottom-8 -right-8 opacity-15 pointer-events-none">
          <GraduationCap className="w-80 h-80" />
        </div>
      </LoginBackground>

      {/* Panel Derecho — Formulario */}
      <div className="w-full lg:w-1/2 flex flex-col relative h-screen overflow-y-auto">
        <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-24 max-w-[600px] mx-auto w-full relative py-12">

          <div className="flex justify-center mb-8">
            <div className="bg-white rounded inline-flex items-center justify-center" style={{ width: '129px', height: '48px' }}>
              <UCPLogo
                variant="wide"
                size={48}
                className="object-contain"
              />
            </div>
          </div>

          <div className="relative pl-6 mb-12">
            <div className="absolute left-0 top-1 bottom-1 w-1 bg-[#8B1E1E]"></div>
            <h2 className="text-4xl font-bold text-[#111827] mb-3 tracking-tight">Inicio de Sesión</h2>
            <p className="text-[#64748b] font-medium text-sm">Accede a tu panel de gestión del Servicio Social Universitario.</p>
          </div>

          {/* Mensaje de error */}
          {error && (
            <div className="mb-6 flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Correo */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-[#64748b] tracking-wider uppercase mb-2">
                CORREO INSTITUCIONAL
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <AtSign className="h-5 w-5 text-[#94a3b8]" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  disabled={loading}
                  className="block w-full pl-12 pr-4 py-3.5 border border-[#e2e8f0] rounded-lg bg-[#f8fafc] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/20 focus:border-[#8B1E1E] transition-colors text-sm text-[#0f172a] placeholder-[#94a3b8] font-medium disabled:opacity-60"
                  placeholder="nombre.apellido@ucp.edu.co"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-xs font-semibold text-[#64748b] tracking-wider uppercase">
                  CONTRASEÑA
                </label>
                <Link href="/recuperar-contrasena" className="text-sm font-semibold text-[#8B1E1E] hover:text-[#731919] transition-colors">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-[#94a3b8]" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  disabled={loading}
                  className="block w-full pl-12 pr-12 py-3.5 border border-[#e2e8f0] rounded-lg bg-[#f8fafc] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/20 focus:border-[#8B1E1E] transition-colors text-sm text-[#0f172a] placeholder-[#94a3b8] font-medium tracking-widest disabled:opacity-60"
                  placeholder="········"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#94a3b8] hover:text-[#475569]"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Recordarme */}
            <div className="flex items-center mt-4">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-[#8B1E1E] focus:ring-[#8B1E1E] border-[#cbd5e1] rounded cursor-pointer"
              />
              <label htmlFor="remember-me" className="ml-3 block text-sm font-medium text-[#475569] cursor-pointer">
                Mantener sesión iniciada
              </label>
            </div>

            {/* Botón Ingreso */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-4 px-4 rounded-lg text-sm font-bold text-white bg-[#22c55e] hover:bg-[#16a34a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#22c55e] transition-colors tracking-widest uppercase shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    VERIFICANDO...
                  </>
                ) : 'INGRESAR'}
              </button>
            </div>

            <div className="mt-4 text-center text-sm font-medium text-[#64748b]">
              ¿Aún no tienes cuenta? <Link href="/registro" className="font-bold text-[#8B1E1E] hover:text-[#731919] ml-1">Regístrate aquí</Link>
            </div>
          </form>
        </div>

        <div className="px-8 sm:px-16 lg:px-24 pb-8 pt-4 flex flex-col xl:flex-row justify-between items-center text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest mt-auto border-t border-gray-50 max-w-[800px] mx-auto w-full gap-4">
          <div>© 2026 UNIVERSIDAD CATÓLICA DE PEREIRA</div>
          <div className="flex gap-6">
            <Link href="/" className="hover:text-[#475569] transition-colors">UCP INICIO</Link>
            <Link href="#" className="hover:text-[#475569] transition-colors">AYUDA</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
