'use client';

import Image from 'next/image';

/**
 * Variantes del logo UCP:
 *  - "round"  → logo_ucp_redondo.png  (ícono cuadrado/circular, ideal para sidebar colapsado o avatares)
 *  - "wide"   → logo-ucp.png          (banner horizontal, ideal para sidebar expandido o cabeceras)
 */
export type UCPLogoVariant = 'round' | 'wide';

interface UCPLogoProps {
    variant?: UCPLogoVariant;
    /** Tamaño en px para el logo redondo */
    size?: number;
    /** Clase extra de Tailwind */
    className?: string;
    /** Prioridad de carga de Next Image */
    priority?: boolean;
}

/**
 * Resuelve la ruta del logo. Si se define la variable de entorno
 * NEXT_PUBLIC_LOGO_ROUND / NEXT_PUBLIC_LOGO_WIDE (URL de Cloudinary u otro CDN)
 * se usa esa URL; de lo contrario se sirve desde /public/uploads (local).
 *
 * Ejemplo .env.local:
 *   NEXT_PUBLIC_LOGO_ROUND=https://res.cloudinary.com/demo/image/upload/logo_ucp_redondo.png
 *   NEXT_PUBLIC_LOGO_WIDE=https://res.cloudinary.com/demo/image/upload/logo-ucp.png
 */
function getLogoSrc(variant: UCPLogoVariant): string {
    if (variant === 'round') {
        return (
            process.env.NEXT_PUBLIC_LOGO_ROUND || '/uploads/logo_ucp_redondo.png'
        );
    }
    return process.env.NEXT_PUBLIC_LOGO_WIDE || '/uploads/logo-ucp.png';
}

export function UCPLogo({
    variant = 'round',
    size = 40,
    className = '',
    priority = true, // Cambiado a true por defecto para imágenes importantes
}: UCPLogoProps) {
    const src = getLogoSrc(variant);

    if (variant === 'round') {
        return (
            <div
                className={`relative shrink-0 rounded-full overflow-hidden bg-white ${className}`}
                style={{ width: size, height: size }}
            >
                <Image
                    src={src}
                    alt="Logo UCP"
                    fill
                    sizes={`${size}px`}
                    className="object-contain"
                    priority={priority}
                    // Optimización adicional para evitar la advertencia
                    unoptimized={false}
                />
            </div>
        );
    }

    /* wide — proporción natural del banner */
    return (
        <div
            className={`relative shrink-0 ${className}`}
            style={{ height: size, width: size * 4 }}   /* relación 4:1 aprox */
        >
            <Image
                src={src}
                alt="Logo UCP"
                fill
                sizes={`${size * 4}px`}
                className="object-contain object-left"
                priority={priority}
                // Optimización adicional para evitar la advertencia
                unoptimized={false}
            />
        </div>
    );
}
