import React from 'react';

export default function NoticiaLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Admin Header Breadcrumb */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center h-16 text-sm">
                        <nav className="flex items-center space-x-2 text-slate-600">
                            <span className="hover:text-slate-900 transition-colors">
                                Administrador
                            </span>
                            <span className="text-slate-400">/</span>
                            <span className="hover:text-slate-900 transition-colors">
                                Noticias
                            </span>
                            <span className="text-slate-400">/</span>
                            <span className="text-slate-900 font-medium">
                                Detalle
                            </span>
                        </nav>
                    </div>
                </div>
            </div>

            {/* Page Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </div>
        </div>
    );
}
