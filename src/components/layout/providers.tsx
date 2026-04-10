'use client';

import { SessionProvider } from 'next-auth/react';
import React from 'react';
import { Toaster } from 'sonner';
import { NotificationProvider } from '@/contexts/NotificationContext';

/**
 * Provider de sesión de NextAuth para toda la aplicación.
 * Debe envolver el árbol de componentes en el layout raíz.
 */
export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <NotificationProvider>
                {children}
                <Toaster
                    position="top-right"
                    richColors
                    closeButton
                    theme="light"
                    className="font-sans"
                />
            </NotificationProvider>
        </SessionProvider>
    );
}
