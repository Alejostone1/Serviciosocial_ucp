'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type NotificationType = 'success' | 'info' | 'default';

export interface Notification {
    id: string;
    title: string;
    description: string;
    date: Date;
    type: NotificationType;
    href: string;
    unread: boolean;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (notification: Omit<Notification, 'id' | 'date' | 'unread'>) => void;
    markAsRead: () => void;
    clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([
        {
            id: '1',
            title: '¡Postulación Aceptada!',
            description: 'Has sido aceptado en "Apoyo Académico Semestre I".',
            date: new Date(Date.now() - 1000 * 60 * 60 * 2),
            type: 'success',
            href: '/estudiante/mis-actividades',
            unread: true
        },
        {
            id: '2',
            title: 'Nuevas Convocatorias',
            description: 'Hay 3 nuevas convocatorias en tu facultad.',
            date: new Date(Date.now() - 1000 * 60 * 60 * 24),
            type: 'info',
            href: '/estudiante/convocatorias',
            unread: true
        }
    ]);

    const unreadCount = notifications.filter(n => n.unread).length;

    const addNotification = (notif: Omit<Notification, 'id' | 'date' | 'unread'>) => {
        const newNotif: Notification = {
            ...notif,
            id: Math.random().toString(36).substring(2, 9),
            date: new Date(),
            unread: true
        };
        setNotifications(prev => [newNotif, ...prev]);
    };

    const markAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markAsRead, clearAll }}>
            {children}
        </NotificationContext.Provider>
    );
}

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};
