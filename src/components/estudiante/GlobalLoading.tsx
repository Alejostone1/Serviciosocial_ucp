'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export function GlobalLoading() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleRouteChangeStart = () => {
      clearTimeout(timeoutId);
      setIsLoading(true);
    };

    const handleRouteChangeComplete = () => {
      timeoutId = setTimeout(() => {
        setIsLoading(false);
      }, 500);
    };

    // Escuchar eventos del router de Next.js
    // @ts-ignore
    if (router.events) {
      // @ts-ignore
      router.events.on('routeChangeStart', handleRouteChangeStart);
      // @ts-ignore
      router.events.on('routeChangeComplete', handleRouteChangeComplete);
      // @ts-ignore
      router.events.on('routeChangeError', handleRouteChangeComplete);
    }

    return () => {
      clearTimeout(timeoutId);
      // @ts-ignore
      if (router.events) {
        // @ts-ignore
        router.events.off('routeChangeStart', handleRouteChangeStart);
        // @ts-ignore
        router.events.off('routeChangeComplete', handleRouteChangeComplete);
        // @ts-ignore
        router.events.off('routeChangeError', handleRouteChangeComplete);
      }
    };
  }, [router]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/95 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6">
        {/* Logo de la Universidad */}
        <div className="relative">
          <Image
            src="/logo-ucp.png"
            alt="Universidad Católica de Pereira"
            width={100}
            height={100}
            className="animate-pulse"
            priority
          />
          {/* Efecto de brillo alrededor del logo */}
          <div className="absolute inset-0 rounded-full bg-[#8B1E1E]/20 animate-ping" />
        </div>

        {/* Spinner personalizado */}
        <div className="relative">
          <div className="w-10 h-10 border-3 border-slate-200 border-t-[#8B1E1E] rounded-full animate-spin" />
        </div>

        {/* Texto de carga */}
        <div className="text-center">
          <p className="text-lg font-semibold text-slate-800 mb-1">
            Cargando...
          </p>
          <p className="text-sm text-slate-500">
            Universidad Católica de Pereira
          </p>
        </div>

        {/* Barra de progreso animada */}
        <div className="w-48 h-1 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#8B1E1E] to-[#a32424] rounded-full animate-pulse" 
               style={{ 
                 width: '70%',
                 animation: 'progress 2s ease-in-out infinite'
               }} />
        </div>
      </div>

      <style jsx>{`
        @keyframes progress {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }
      `}</style>
    </div>
  );
}

// Componente de loading simple para transiciones rápidas
export function SimpleLoading({ message = "Cargando..." }: { message?: string }) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Image
            src="/logo-ucp.png"
            alt="UCP"
            width={40}
            height={40}
            className="animate-pulse"
          />
        </div>
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-3 border-slate-200 border-t-[#8B1E1E] rounded-full animate-spin" />
          <p className="text-sm text-slate-500 mt-2">{message}</p>
        </div>
      </div>
    </div>
  );
}
