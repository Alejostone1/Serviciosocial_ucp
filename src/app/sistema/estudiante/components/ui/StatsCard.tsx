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
}

export function StatsCard({
    title,
    value,
    description,
    icon: Icon,
    trend,
    colorClass = "text-indigo-600 bg-indigo-50",
    className
}: StatsCardProps) {
    return (
        <div className={twMerge(clsx("bg-white rounded-2xl border border-slate-200 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-slate-300 group relative overflow-hidden", className))}>
            {/* Subtle Gradient background matching color */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 rounded-full mix-blend-multiply filter blur-2xl opacity-20 bg-current transition-transform duration-500 group-hover:scale-150" style={{ color: "currentColor" }} />

            <div className="relative flex items-center gap-4 mb-4">
                <div className={twMerge(clsx("p-3 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110", colorClass))}>
                    <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-slate-700 tracking-tight">{title}</h3>
            </div>

            <div className="relative">
                <div className="text-3xl font-bold text-slate-900 tracking-tight mb-1">
                    {value}
                </div>

                {description && !trend && (
                    <p className="text-sm text-slate-500 font-medium">
                        {description}
                    </p>
                )}

                {trend && (
                    <div className="flex items-center gap-2 mt-2">
                        <span
                            className={twMerge(clsx(
                                "text-xs font-semibold px-2 py-1 rounded-full",
                                trend.isPositive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                            ))}
                        >
                            {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
                        </span>
                        <span className="text-sm text-slate-500">{trend.label}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
