import React from 'react';

interface PageContainerProps {
    children: React.ReactNode;
}

export function PageContainer({ children }: PageContainerProps) {
    return (
        <div className="flex-1 w-full bg-slate-50 min-h-[calc(100vh-4rem)] relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
                {children}
            </div>
        </div>
    );
}
