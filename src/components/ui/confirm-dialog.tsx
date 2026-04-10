'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, ShieldAlert, Info, X } from 'lucide-react';
import { btn } from '@/lib/btn-variants';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
    isLoading?: boolean;
}

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    type = 'danger',
    isLoading = false,
}: ConfirmDialogProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    const typeConfig = {
        danger: {
            icon: ShieldAlert,
            iconBg: 'bg-[#7f1d1d]/10',
            iconColor: 'text-[#7f1d1d]',
            confirmClass: btn.danger,
            stripe: 'bg-[#7f1d1d]',
        },
        warning: {
            icon: AlertTriangle,
            iconBg: 'bg-amber-50',
            iconColor: 'text-amber-700',
            confirmClass:
                'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white '
                + 'bg-amber-700 hover:bg-amber-800 border border-amber-700 shadow-sm transition-all duration-150 '
                + 'focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:ring-offset-1 '
                + 'disabled:opacity-50 disabled:cursor-not-allowed',
            stripe: 'bg-amber-600',
        },
        info: {
            icon: Info,
            iconBg: 'bg-[#8B1E1E]/10',
            iconColor: 'text-[#8B1E1E]',
            confirmClass: btn.primary,
            stripe: 'bg-[#8B1E1E]',
        },
    } as const;

    const cfg = typeConfig[type];
    const Icon = cfg.icon;

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
                onClick={isLoading ? undefined : onClose}
                aria-hidden="true"
            />

            {/* Dialog */}
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
                {/* Barra de color institucional superior */}
                <div className={`h-1.5 w-full ${cfg.stripe}`} />

                <div className="p-6">
                    {/* Botón cerrar */}
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-40"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    <div className="flex items-start gap-4">
                        <div className={`shrink-0 flex h-10 w-10 items-center justify-center rounded-xl ${cfg.iconBg}`}>
                            <Icon className={`h-5 w-5 ${cfg.iconColor}`} aria-hidden="true" />
                        </div>

                        <div className="mt-0.5 flex-1">
                            <h3 className="text-base font-bold text-slate-900 leading-snug" id="modal-title">
                                {title}
                            </h3>
                            <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{description}</p>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
                        <button
                            type="button"
                            className={btn.secondary}
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            {cancelText}
                        </button>
                        <button
                            type="button"
                            className={cfg.confirmClass}
                            onClick={onConfirm}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                    <span>Procesando...</span>
                                </>
                            ) : (
                                confirmText
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
