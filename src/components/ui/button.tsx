import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/* ============================================================
 * BOTÓN UCP - COMPONENTE PRINCIPAL
 * Sistema de diseño consistente basado en tokens
 * ============================================================ */

const buttonVariants = cva(
  /* Base: Estilos fundamentales del botón */
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      /* Variantes de diseño institucional */
      variant: {
        /* Primario - Rojo UCP */
        primary: "bg-primary-600 text-white hover:bg-primary-700 shadow-md hover:shadow-lg transition-shadow",
        
        /* Secundario - Azul UCP */
        secondary: "bg-secondary-600 text-white hover:bg-secondary-700 shadow-md hover:shadow-lg transition-shadow",
        
        /* Outline - Solo borde */
        outline: "border border-primary-600 text-primary-600 bg-transparent hover:bg-primary-50 hover:text-primary-700",
        
        /* Ghost - Transparente */
        ghost: "text-primary-600 hover:bg-primary-50 hover:text-primary-700",
        
        /* Destructive - Rojo intenso */
        destructive: "bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg transition-shadow",
        
        /* Success - Verde */
        success: "bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg transition-shadow",
        
        /* Warning - Amarillo */
        warning: "bg-yellow-500 text-white hover:bg-yellow-600 shadow-md hover:shadow-lg transition-shadow",
        
        /* Info - Azul claro */
        info: "bg-blue-500 text-white hover:bg-blue-600 shadow-md hover:shadow-lg transition-shadow",
        
        /* Gris - Neutro */
        gray: "bg-gray-600 text-white hover:bg-gray-700 shadow-md hover:shadow-lg transition-shadow",
        
        /* Link - Estilo enlace */
        link: "text-primary-600 underline-offset-4 hover:underline",
        
        /* Subtle - Gris claro */
        subtle: "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300",
      },
      
      /* Tamaños basados en tokens */
      size: {
        xs: "h-7 px-2 text-xs rounded",
        sm: "h-8 px-3 text-sm rounded-md",
        base: "h-10 px-4 py-2 text-sm rounded-lg",
        lg: "h-12 px-6 text-base rounded-lg",
        xl: "h-14 px-8 text-lg rounded-xl",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
      },
      
      /* Estados adicionales */
      state: {
        default: "",
        loading: "opacity-75 cursor-not-allowed",
        disabled: "opacity-50 cursor-not-allowed",
        active: "ring-2 ring-primary-500 ring-offset-2",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "base",
      state: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    state, 
    asChild = false, 
    loading = false,
    leftIcon,
    rightIcon,
    children, 
    disabled,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    // Combinar estados
    const finalState = loading ? "loading" : disabled ? "disabled" : state;
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, state: finalState, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {/* Icono izquierdo */}
        {leftIcon && !loading && (
          <span className="mr-2">{leftIcon}</span>
        )}
        
        {/* Indicador de carga */}
        {loading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        
        {/* Contenido */}
        {children}
        
        {/* Icono derecho */}
        {rightIcon && !loading && (
          <span className="ml-2">{rightIcon}</span>
        )}
      </Comp>
    );
  }
);

Button.displayName = "Button";

/* ============================================================
 * BOTONES ESPECIALIZADOS UCP
 * Componentes preconfigurados para uso común
 * ============================================================ */

export const UcpButton = React.forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  (props, ref) => (
    <Button
      ref={ref}
      variant="primary"
      className="ucp-shadow font-semibold"
      {...props}
    />
  )
);

UcpButton.displayName = "UcpButton";

export const UcpSecondaryButton = React.forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  (props, ref) => (
    <Button
      ref={ref}
      variant="secondary"
      className="font-semibold"
      {...props}
    />
  )
);

UcpSecondaryButton.displayName = "UcpSecondaryButton";

export const UcpOutlineButton = React.forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  (props, ref) => (
    <Button
      ref={ref}
      variant="outline"
      className="font-semibold border-2"
      {...props}
    />
  )
);

UcpOutlineButton.displayName = "UcpOutlineButton";

/* ============================================================
 * GRUPO DE BOTONES
 * Para agrupar botones relacionados
 * ============================================================ */

export interface ButtonGroupProps {
  children: React.ReactNode;
  className?: string;
  orientation?: "horizontal" | "vertical";
  size?: "sm" | "base" | "lg";
}

export const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ children, className, orientation = "horizontal", size = "base", ...props }, ref) => {
    const orientationClasses = {
      horizontal: "flex flex-row",
      vertical: "flex flex-col",
    };
    
    const sizeClasses = {
      sm: "space-x-1 space-y-1",
      base: "space-x-2 space-y-2",
      lg: "space-x-3 space-y-3",
    };
    
    return (
      <div
        ref={ref}
        className={cn(
          orientationClasses[orientation],
          orientation === "horizontal" ? sizeClasses[size] : "",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ButtonGroup.displayName = "ButtonGroup";

export { Button, buttonVariants };