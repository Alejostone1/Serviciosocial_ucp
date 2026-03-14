import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50 backdrop-blur-sm">
            <div className="bg-white p-4 rounded-full shadow-sm mb-5 border border-slate-100 group transition-all duration-300 hover:scale-110">
                <Icon className="w-8 h-8 text-indigo-500 group-hover:text-indigo-600 transition-colors" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
            <p className="text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">
                {description}
            </p>
            {action && (
                <div className="mt-2">
                    {action}
                </div>
            )}
        </div>
    );
}
