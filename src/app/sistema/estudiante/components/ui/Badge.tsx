import React from 'react';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default';

interface BadgeProps {
    children: React.ReactNode;
    variant?: BadgeVariant;
    className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
    const variants = {
        success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
        warning: 'bg-amber-50 text-amber-700 ring-amber-600/20',
        error: 'bg-rose-50 text-rose-700 ring-rose-600/20',
        info: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
        default: 'bg-slate-100 text-slate-700 ring-slate-600/20'
    };

    return (
        <span className={twMerge(clsx("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-tight ring-1 ring-inset", variants[variant], className))}>
            {children}
        </span>
    );
}
