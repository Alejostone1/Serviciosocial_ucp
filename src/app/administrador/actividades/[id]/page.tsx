import React from 'react';
import { notFound } from 'next/navigation';
import { getActividadById } from '../actions';
import { ActividadDetalleClient } from './detalle-client';

export const metadata = { title: 'Detalles de Actividad | Administrador' };

export default async function ActividadDetallePage({ params }: { params: { id: string } }) {
  const actividad = await getActividadById(params.id);

  if (!actividad) {
    notFound();
  }

  return <ActividadDetalleClient actividad={actividad as any} />;
}
