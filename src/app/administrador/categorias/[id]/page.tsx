import React from 'react';
import { notFound } from 'next/navigation';
import { getCategoriaById, getEstadisticasCategoria } from '../actions';
import { CategoriaDetalleClient } from './detalle-client';

export const metadata = { title: 'Detalles de Categoría | Administrador' };

export default async function CategoriaDetallePage({ params }: { params: { id: string } }) {
  const [categoria, estadisticas] = await Promise.all([
    getCategoriaById(params.id),
    getEstadisticasCategoria(params.id),
  ]);

  if (!categoria) {
    notFound();
  }

  return <CategoriaDetalleClient categoria={categoria} estadisticas={estadisticas} />;
}
