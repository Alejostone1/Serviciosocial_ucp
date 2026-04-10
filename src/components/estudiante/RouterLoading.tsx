'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

export function RouterLoading() {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleStart = () => {
      clearTimeout(timeoutId);
      setIsLoading(true);
    };

    const handleComplete = () => {
      timeoutId = setTimeout(() => {
        setIsLoading(false);
      }, 400);
    };

    // Detectar navegación usando eventos del navegador
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function(...args) {
      handleStart();
      setTimeout(handleComplete, 100);
      return originalPushState.apply(history, args);
    };

    history.replaceState = function(...args) {
      handleStart();
      setTimeout(handleComplete, 100);
      return originalReplaceState.apply(history, args);
    };

    window.addEventListener('popstate', handleStart);
    window.addEventListener('load', handleComplete);

    return () => {
      clearTimeout(timeoutId);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
      window.removeEventListener('popstate', handleStart);
      window.removeEventListener('load', handleComplete);
    };
  }, []);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/95 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6">
        {/* Logo de la Universidad */}
        <div className="relative">
          <Image
            src="/logo-ucp.png"
            alt="Universidad Católica de Pereira"
            width={80}
            height={80}
            className="animate-pulse"
            priority
          />
          {/* Efecto de brillo alrededor del logo */}
          <div className="absolute inset-0 rounded-full bg-[#8B1E1E]/15 animate-ping" />
        </div>

        {/* Spinner personalizado */}
        <div className="relative">
          <div className="w-8 h-8 border-3 border-slate-200 border-t-[#8B1E1E] rounded-full animate-spin" />
        </div>

        {/* Texto de carga */}
        <div className="text-center">
          <p className="text-base font-semibold text-slate-800 mb-1">
            Cargando...
          </p>
          <p className="text-sm text-slate-500">
            Universidad Católica de Pereira
          </p>
        </div>

        {/* Barra de progreso animada */}
        <div className="w-40 h-1 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#8B1E1E] to-[#a32424] rounded-full" 
               style={{ 
                 width: '75%',
                 animation: 'slideProgress 1.5s ease-in-out infinite'
               }} />
        </div>
      </div>

      <style jsx>{`
        @keyframes slideProgress {
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
