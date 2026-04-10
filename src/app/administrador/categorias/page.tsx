import React from 'react';
import { getCategorias } from './actions';
import { CategoriasTableClient } from './client';

export const metadata = { title: 'Categorías | Administrador' };

export default async function CategoriasPage() {
    const categorias = await getCategorias();

    return <CategoriasTableClient initialData={categorias as any} />;
}
