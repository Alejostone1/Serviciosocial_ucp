import React from 'react';
import { LucideIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

interface StatsCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon: LucideIcon;
    trend?: {
        value: number;
        label: string;
        isPositive: boolean;
    };
    colorClass?: string;
    className?: string;
    subtitle?: string;
    progress?: number;
}

export function StatsCard({
    title,
    value,
    description,
    icon: Icon,
    trend,
    colorClass = "text-[#8B1E1E] bg-[#8B1E1E]/10",
    className,
    subtitle,
    progress
}: StatsCardProps) {
    return (
        <div className={twMerge(clsx(
            "bg-white rounded-2xl border border-slate-200 p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-[#8B1E1E]/20 group relative overflow-hidden",
            className
        ))}>
            {/* Human-friendly gradient background */}
            <div className="absolute top-0 right-0 -mt-2 -mr-2 w-20 h-20 rounded-full mix-blend-multiply filter blur-xl opacity-15 bg-[#8B1E1E] transition-transform duration-500 group-hover:scale-125" />
            
            {/* Decorative pattern */}
            <div className="absolute bottom-0 right-0 w-16 h-16 opacity-5">
                <div className="w-full h-full rounded-tl-full bg-current" style={{ color: "#8B1E1E" }} />
            </div>

            <div className="relative">
                {/* Icon with enhanced styling */}
                <div className="flex items-center justify-between mb-4">
                    <div className={twMerge(clsx(
                        "p-3 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:rotate-3",
                        colorClass
                    ))}>
                        <Icon className="w-5 h-5" />
                    </div>
                    {trend && (
                        <div className={twMerge(clsx(
                            "text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1",
                            trend.isPositive ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                        ))}>
                            <span>{trend.isPositive ? '↑' : '→'}</span>
                            {Math.abs(trend.value)}%
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="space-y-2">
                    <h3 className="font-semibold text-slate-700 text-sm tracking-tight leading-tight">
                        {title}
                    </h3>
                    
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-slate-900 leading-none">
                            {value}
                        </span>
                        {subtitle && (
                            <span className="text-sm text-slate-500 font-medium">
                                {subtitle}
                            </span>
                        )}
                    </div>

                    {description && (
                        <p className="text-xs text-slate-500 leading-relaxed">
                            {description}
                        </p>
                    )}

                    {/* Progress bar for visual representation */}
                    {progress !== undefined && (
                        <div className="mt-3">
                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                <div 
                                    className="h-full bg-gradient-to-r from-[#8B1E1E] to-[#a32424] rounded-full transition-all duration-500 ease-out"
                                    style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {trend && (
                        <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                            <span className="font-medium">{trend.label}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
