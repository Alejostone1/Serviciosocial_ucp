import React from 'react';
import { notFound } from 'next/navigation';
import { getConvocatoriaById } from '../convocatorias-actions';
import { ConvocatoriaDetalleClient } from './detalle-client';

export const metadata = { title: 'Detalles de Convocatoria | Administrador' };

export default async function ConvocatoriaDetallePage({ params }: { params: { id: string } }) {
  const convocatoria = await getConvocatoriaById(params.id);

  if (!convocatoria) {
    notFound();
  }

  return <ConvocatoriaDetalleClient convocatoria={convocatoria} />;
}
