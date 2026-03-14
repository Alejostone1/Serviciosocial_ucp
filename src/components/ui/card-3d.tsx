'use client';

import React, { useState, useRef, MouseEvent } from 'react';
import { cn } from '@/lib/utils';

/* ============================================================
 * TARJETA 3D RESPONSIVE - COMPONENTE PRINCIPAL
 * Sistema de diseño con efectos 3D y responsive avanzado
 * ============================================================ */

interface Card3DProps {
  children: React.ReactNode;
  className?: string;
  intensity?: 'subtle' | 'medium' | 'strong';
  glowColor?: string;
  borderRadius?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  shadowIntensity?: 'light' | 'medium' | 'heavy';
  disabled?: boolean;
}

export const Card3D: React.FC<Card3DProps> = ({
  children,
  className,
  intensity = 'medium',
  glowColor = 'rgba(139, 30, 30, 0.15)',
  borderRadius = 'xl',
  shadowIntensity = 'medium',
  disabled = false,
}) => {
  const [transform, setTransform] = useState('');
  const [glowPosition, setGlowPosition] = useState({ x: 50, y: 50 });
  const cardRef = useRef<HTMLDivElement>(null);

  const intensityMap = {
    subtle: { rotate: 8, scale: 1.02 },
    medium: { rotate: 15, scale: 1.05 },
    strong: { rotate: 25, scale: 1.08 },
  };

  const borderRadiusMap = {
    sm: 'rounded-lg',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
    xl: 'rounded-3xl',
    '2xl': 'rounded-[2rem]',
  };

  const shadowMap = {
    light: 'shadow-lg',
    medium: 'shadow-2xl',
    heavy: 'shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]',
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (disabled || !cardRef.current) return;

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -intensityMap[intensity].rotate;
    const rotateY = ((x - centerX) / centerX) * intensityMap[intensity].rotate;

    setTransform(`
      perspective(1000px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      scale3d(${intensityMap[intensity].scale}, ${intensityMap[intensity].scale}, ${intensityMap[intensity].scale})
    `);

    setGlowPosition({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    });
  };

  const handleMouseLeave = () => {
    setTransform('');
    setGlowPosition({ x: 50, y: 50 });
  };

  return (
    <div
      ref={cardRef}
      className={cn(
        'relative transition-all duration-300 ease-out',
        'transform-gpu will-change-transform',
        borderRadiusMap[borderRadius],
        shadowMap[shadowIntensity],
        'bg-card border border-border',
        disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
        className
      )}
      style={{
        transform,
        transformStyle: 'preserve-3d',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Efecto de brillo dinámico */}
      {!disabled && (
        <div
          className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${glowPosition.x}% ${glowPosition.y}%, ${glowColor} 0%, transparent 50%)`,
            borderRadius: 'inherit',
          }}
        />
      )}
      
      {/* Contenido con profundidad */}
      <div 
        className="relative h-full"
        style={{
          transform: 'translateZ(20px)',
          transformStyle: 'preserve-3d',
        }}
      >
        {children}
      </div>

      {/* Bordes 3D */}
      <div
        className="absolute inset-0 rounded-[inherit] pointer-events-none"
        style={{
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        }}
      />
    </div>
  );
};

/* ============================================================
 * TARJETA DE MÉTRICA 3D ESPECIALIZADA
 * Para el dashboard de administrador
 * ============================================================ */

interface MetricCard3DProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  trend?: { value: number; isPositive: boolean };
  colorHex?: string;
  className?: string;
}

export const MetricCard3D: React.FC<MetricCard3DProps> = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  colorHex = '#8B1E1E',
  className,
}) => {
  return (
    <Card3D 
      className={cn('p-6 group hover:shadow-[0_25px_50px_-12px_rgba(139,30,30,0.15)] relative', className)}
      intensity="medium"
      glowColor={`${colorHex}15`}
    >
      {/* Header con icono y trend */}
      <div className="flex items-start justify-between mb-4">
        <div 
          className="p-3 rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-6" 
          style={{ backgroundColor: `${colorHex}20` }}
        >
          <div 
            className="w-6 h-6 flex items-center justify-center"
            style={{ color: colorHex }}
          >
            <Icon className="w-full h-full" />
          </div>
        </div>
        
        {trend && (
          <div className={cn(
            'flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold',
            trend.isPositive 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : 'bg-red-100 text-red-700 border border-red-200'
          )}>
            <span className="font-bold">{trend.isPositive ? '↑' : '↓'}</span>
            {trend.value}%
          </div>
        )}
      </div>

      {/* Valor principal */}
      <div className="mb-3">
        <div className="text-3xl font-bold text-foreground transition-all duration-300 group-hover:scale-105 leading-tight">
          {typeof value === 'number' ? value.toLocaleString('es-CO') : value}
        </div>
      </div>

      {/* Título y descripción - Separados y mejor alineados */}
      <div className="space-y-2">
        <h3 className="font-bold text-foreground text-sm leading-tight">{title}</h3>
        {description && (
          <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
        )}
      </div>

      {/* Efecto de profundidad adicional - más sutil */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-1 rounded-b-[inherit] transition-all duration-300 group-hover:h-2 opacity-60"
        style={{ backgroundColor: colorHex }}
      />
    </Card3D>
  );
};

/* ============================================================
 * TARJETA DE ESTADO 3D
 * Para convocatorias y postulaciones
 * ============================================================ */

interface StatusCard3DProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  variant: 'default' | 'warning' | 'success' | 'info';
  className?: string;
}

export const StatusCard3D: React.FC<StatusCard3DProps> = ({
  title,
  value,
  icon: Icon,
  variant = 'default',
  className,
}) => {
  const variantConfig = {
    default: {
      bg: 'bg-muted',
      border: 'border-border',
      iconBg: 'bg-primary-100',
      iconColor: 'text-primary-600',
      valueColor: 'text-foreground',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      valueColor: 'text-yellow-900',
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      valueColor: 'text-green-900',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      valueColor: 'text-blue-900',
    },
  };

  const config = variantConfig[variant];

  return (
    <Card3D 
      className={cn('p-4', config.bg, config.border, className)}
      intensity="subtle"
    >
      <div className="flex flex-col h-full">
        {/* Título */}
        <span className="text-xs font-bold uppercase text-muted-foreground mb-3">
          {title}
        </span>

        {/* Contenido principal */}
        <div className="flex items-center justify-between mt-auto">
          <div className="text-2xl font-extrabold transition-all duration-300 group-hover:scale-110"
               style={{ color: config.valueColor === 'text-foreground' ? undefined : config.valueColor }}>
            {value}
          </div>
          
          <div className={cn(
            'p-2 rounded-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-12',
            config.iconBg
          )}>
            <Icon className={cn('w-6 h-6 opacity-60', config.iconColor)} />
          </div>
        </div>
      </div>
    </Card3D>
  );
};

/* ============================================================
 * GRID RESPONSIVE 3D
 * Contenedor optimizado para diferentes tamaños de pantalla
 * ============================================================ */

interface ResponsiveGrid3DProps {
  children: React.ReactNode;
  cols?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: number;
  className?: string;
}

export const ResponsiveGrid3D: React.FC<ResponsiveGrid3DProps> = ({
  children,
  cols = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap = 4,
  className,
}) => {
  const gridClasses = [
    cols.sm && `grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
  ].filter(Boolean).join(' ');

  return (
    <div className={cn(
      'grid',
      gridClasses,
      `gap-${gap}`,
      'perspective-1000',
      className
    )}>
      {children}
    </div>
  );
};
