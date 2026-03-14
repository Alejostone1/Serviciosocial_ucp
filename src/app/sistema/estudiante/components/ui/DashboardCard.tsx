import React from 'react';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';
import { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
    title: string;
    description?: string;
    icon?: LucideIcon;
    children: React.ReactNode;
    className?: string;
    headerAction?: React.ReactNode;
}

export function DashboardCard({ title, description, icon: Icon, children, className, headerAction }: DashboardCardProps) {
    return (
        <div className={twMerge(clsx("bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:border-slate-300 transition-colors duration-300", className))}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b border-slate-100 gap-4">
                <div className="flex items-center gap-3">
                    {Icon && (
                        <div className="p-2 bg-slate-50 rounded-lg shrink-0">
                            <Icon className="w-5 h-5 text-indigo-600" />
                        </div>
                    )}
                    <div>
                        <h2 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h2>
                        {description && (
                            <p className="text-sm text-slate-500 font-medium">{description}</p>
                        )}
                    </div>
                </div>
                {headerAction && (
                    <div className="shrink-0">{headerAction}</div>
                )}
            </div>
            <div className="flex-1 p-6 relative bg-slate-50/30">
                {children}
            </div>
        </div>
    );
}
