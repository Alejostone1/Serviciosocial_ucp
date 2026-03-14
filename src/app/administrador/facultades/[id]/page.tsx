import React from 'react';
import { notFound } from 'next/navigation';
import { getFacultadById, getEstadisticasFacultad } from '../actions';
import { FacultadDetalleClient } from './detalle-client';

export const metadata = { title: 'Detalles de Facultad | Administrador' };

export default async function FacultadDetallePage({ params }: { params: { id: string } }) {
  const [facultad, estadisticas] = await Promise.all([
    getFacultadById(params.id),
    getEstadisticasFacultad(params.id),
  ]);

  if (!facultad) {
    notFound();
  }

  return <FacultadDetalleClient facultad={facultad} estadisticas={estadisticas} />;
}
