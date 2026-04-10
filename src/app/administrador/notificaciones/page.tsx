import React from 'react';
import { getNotificaciones } from './actions';
import { NotificacionesTabsClient } from './client';

export const metadata = { title: 'Notificaciones | Administrador' };

export default async function NotificacionesPage() {
    const notificaciones = await getNotificaciones();

    return (
        <NotificacionesTabsClient initialData={notificaciones as any} />
    );
}
