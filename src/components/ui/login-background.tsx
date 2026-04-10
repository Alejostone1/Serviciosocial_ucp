'use client';

import React from 'react';
import '@/styles/login-background.css';

interface LoginBackgroundProps {
  className?: string;
  children?: React.ReactNode;
}

export function LoginBackground({ className = '', children }: LoginBackgroundProps) {
  return (
    <div className={`login-background-container ${className}`}>
      {/* Capa base del color institucional rojo */}
      <div className="absolute inset-0 bg-[#8B1E1E]" />
      
      {/* Capa de imagen de fondo original */}
      <div 
        className="login-background-image"
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2000&auto=format&fit=crop')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      {/* Capa de oscurecimiento */}
      <div className="absolute inset-0 bg-black/20 mix-blend-multiply pointer-events-none" />
      
      {/* Gradiente superior */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#8B1E1E]/80 to-[#4a0f0f]/95 pointer-events-none" />
      
      {/* Contenido */}
      <div className="login-background-content flex flex-col h-full justify-between">
        {children}
      </div>
    </div>
  );
}
