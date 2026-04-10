'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface FormModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function FormModal({ isOpen, onClose, title, subtitle, children, size = 'md' }: FormModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal */}
            <div
                role="dialog"
                aria-modal="true"
                className={`relative bg-white rounded-2xl shadow-2xl w-full ${sizeClasses[size]} max-h-[92vh] flex flex-col overflow-hidden`}
            >
                {/* Barra institucional superior */}
                <div className="h-1 w-full bg-[#8B1E1E] shrink-0" />

                {/* Header */}
                <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-slate-100 shrink-0">
                    <div>
                        <h2 className="text-base font-bold text-slate-900 leading-snug">{title}</h2>
                        {subtitle && (
                            <p className="text-sm text-slate-500 mt-0.5 leading-relaxed">{subtitle}</p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="ml-4 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Scrollable body */}
                <div className="overflow-y-auto flex-1 px-6 py-5">
                    {children}
                </div>
            </div>
        </div>
    );
}
