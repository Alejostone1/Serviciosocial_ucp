import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { EstadoConvocatoria, EstadoPostulacion, EstadoReporte, EstadoVinculacion, Rol, TipoDocumento } from '@prisma/client';

const badgeVariants = cva(
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider transition-colors",
    {
        variants: {
            variant: {
                default: "bg-[#f1f5f9] text-[#475569]",
                success: "bg-green-100 text-green-700",
                warning: "bg-yellow-100 text-yellow-700",
                error: "bg-red-100 text-red-700",
                info: "bg-blue-100 text-blue-700",
                brand: "bg-[#8B1E1E]/10 text-[#8B1E1E]",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

interface StatusBadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {
    status: string | null;
}

export function StatusBadge({ status, className, variant, ...props }: StatusBadgeProps) {
    if (!status) return null;

    // Mapa heurístico para asignar colores basados en el valor (funciona para los enums de Prisma)
    let computedVariant: "default" | "success" | "warning" | "error" | "info" | "brand" = "default";

    const s = status.toUpperCase();

    // Éxito / Activo
    if (['APROBADA', 'APROBADO', 'EXITOSO', 'ACEPTADA', 'PUBLICADA', 'ACTIVO', 'ADMINISTRADOR'].includes(s)) {
        computedVariant = 'success';
    }
    // Advertencia / Pendiente
    else if (['PENDIENTE', 'EN_REVISION', 'PENDIENTE_VALIDACION', 'BORRADOR', 'PARCIAL', 'REQUIERE_AJUSTE'].includes(s)) {
        computedVariant = 'warning';
    }
    // Error / Inactivo / Rechazado
    else if (['RECHAZADA', 'RECHAZADO', 'CANCELADA', 'FALLIDO', 'BLOQUEADO', 'VENCIDA'].includes(s)) {
        computedVariant = 'error';
    }
    // Info / En Curso
    else if (['EN_CURSO', 'DIRECTOR', 'ALIADO'].includes(s)) {
        computedVariant = 'info';
    }
    // Institucional
    else if (['ESTUDIANTE', 'AUXILIAR'].includes(s)) {
        computedVariant = 'brand';
    }

    // Si se pasa un variant explícito, sobreescribe la heurística
    const finalVariant = variant || computedVariant;

    // Formateo del texto para que luzca mejor (ej: EN_REVISION -> EN REVISIÓN)
    const displayText = s.replace(/_/g, ' ');

    return (
        <div className={cn(badgeVariants({ variant: finalVariant }), className)} {...props}>
            {displayText}
        </div>
    );
}
