import React from 'react';

interface SectionHeaderProps {
    title: string;
    description?: string;
    children?: React.ReactNode;
}

export function SectionHeader({ title, description, children }: SectionHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                    {title}
                </h1>
                {description && (
                    <p className="mt-1 text-sm text-slate-500 max-w-2xl">
                        {description}
                    </p>
                )}
            </div>

            {children && (
                <div className="flex items-center gap-3">
                    {children}
                </div>
            )}
        </div>
    );
}
