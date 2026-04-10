import * as React from "react";

import { cn } from "@/lib/utils";

/* ============================================================
 * TARJETA UCP - COMPONENTE PRINCIPAL
 * Sistema de diseño consistente basado en tokens
 * ============================================================ */

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border bg-card text-card-foreground shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight text-foreground",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

/* ============================================================
 * TARJETAS ESPECIALIZADAS UCP
 * Componentes preconfigurados para uso común
 * ============================================================ */

export interface UcpCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "primary" | "secondary" | "success" | "warning" | "error";
  interactive?: boolean;
}

export const UcpCard = React.forwardRef<HTMLDivElement, UcpCardProps>(
  ({ className, variant = "default", interactive = false, children, ...props }, ref) => {
    const variantClasses = {
      default: "bg-white border-gray-200",
      primary: "bg-primary-50 border-primary-200",
      secondary: "bg-secondary-50 border-secondary-200",
      success: "bg-green-50 border-green-200",
      warning: "bg-yellow-50 border-yellow-200",
      error: "bg-red-50 border-red-200",
    };
    
    const interactiveClasses = interactive
      ? "cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
      : "";
    
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl border shadow-lg transition-all duration-300",
          variantClasses[variant],
          interactiveClasses,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

UcpCard.displayName = "UcpCard";

/* ============================================================
 * TARJETA DE ESTADÍSTICAS UCP
 * Para mostrar métricas institucionales
 * ============================================================ */

export interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    type: "increase" | "decrease" | "neutral";
  };
  icon?: React.ReactNode;
  className?: string;
}

export const StatsCard = React.forwardRef<HTMLDivElement, StatsCardProps>(
  ({ title, value, change, icon, className, ...props }, ref) => {
    const changeColors = {
      increase: "text-green-600",
      decrease: "text-red-600",
      neutral: "text-gray-600",
    };
    
    return (
      <div
        ref={ref}
        className={cn(
          "bg-white rounded-xl border border-gray-200 p-6 shadow-lg hover:shadow-xl transition-shadow duration-300",
          className
        )}
        {...props}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
            {change && (
              <p className={cn("text-sm mt-2", changeColors[change.type])}>
                {change.value}
              </p>
            )}
          </div>
          {icon && (
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
              {icon}
            </div>
          )}
        </div>
      </div>
    );
  }
);

StatsCard.displayName = "StatsCard";

/* ============================================================
 * TARJETA DE PROYECTO UCP
 * Para mostrar información de proyectos sociales
 * ============================================================ */

export interface ProjectCardProps {
  title: string;
  description: string;
  status: "active" | "completed" | "pending";
  progress?: number;
  tags?: string[];
  image?: string;
  className?: string;
}

export const ProjectCard = React.forwardRef<HTMLDivElement, ProjectCardProps>(
  ({ title, description, status, progress, tags, image, className, ...props }, ref) => {
    const statusColors = {
      active: "bg-green-100 text-green-800",
      completed: "bg-blue-100 text-blue-800",
      pending: "bg-yellow-100 text-yellow-800",
    };
    
    const statusLabels = {
      active: "Activo",
      completed: "Completado",
      pending: "Pendiente",
    };
    
    return (
      <div
        ref={ref}
        className={cn(
          "bg-white rounded-xl border border-gray-200 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1",
          className
        )}
        {...props}
      >
        {image && (
          <div className="h-48 bg-cover bg-center" style={{ backgroundImage: `url(${image})` }}>
            <div className="h-full bg-gradient-to-t from-black/50 to-transparent" />
          </div>
        )}
        
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
            <span className={cn("px-2 py-1 rounded-full text-xs font-medium", statusColors[status])}>
              {statusLabels[status]}
            </span>
          </div>
          
          <p className="text-gray-600 mb-4 line-clamp-3">{description}</p>
          
          {progress !== undefined && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progreso</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
          
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
);

ProjectCard.displayName = "ProjectCard";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };