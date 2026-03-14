'use client';

import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface DeleteNoticiaButtonProps {
    noticiaId: string;
    noticiaTitulo: string;
}

export function DeleteNoticiaButton({ noticiaId, noticiaTitulo }: DeleteNoticiaButtonProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);

        try {
            const response = await fetch(`/api/noticias/${noticiaId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Error al eliminar la noticia');
            }

            toast.success('Noticia eliminada correctamente');

            // Cerrar el diálogo antes de recargar
            setShowConfirm(false);

            // Refresh the page to show updated list
            window.location.reload();
        } catch (error) {
            console.error('Error al eliminar noticia:', error);
            toast.error('Error al eliminar la noticia');
            setIsDeleting(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setShowConfirm(true)}
                disabled={isDeleting}
                className="p-1.5 text-red-600 hover:text-red-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Eliminar noticia"
            >
                <Trash2 className="w-4 h-4" />
            </button>

            <ConfirmDialog
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={handleDelete}
                title="Eliminar Noticia"
                description={`¿Estás seguro de que quieres eliminar la noticia "${noticiaTitulo}"? Esta acción no se puede deshacer.`}
                confirmText="Sí, eliminar noticia"
                cancelText="Cancelar"
                type="danger"
                isLoading={isDeleting}
            />
        </>
    );
}
