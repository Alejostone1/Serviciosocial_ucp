import React from 'react';
import { EstudianteLayoutClient } from './layout-client';

export const dynamic = 'force-dynamic';

export default function EstudianteLayout({ children }: { children: React.ReactNode }) {
    return <EstudianteLayoutClient>{children}</EstudianteLayoutClient>;
}
