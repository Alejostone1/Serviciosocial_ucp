import React from 'react';
import { notFound } from 'next/navigation';
import { getConvocatoriaById } from '../../services/convocatorias.service';
import { ConvocatoriaDetalleClient } from './detalle-client';

export const metadata = { title: 'Gestionar Convocatoria | Profesor' };

export default async function ConvocatoriaDetallePage({ params }: { params: { id: string } }) {
  const convocatoria = await getConvocatoriaById(params.id);

  if (!convocatoria) {
    notFound();
  }

  return <ConvocatoriaDetalleClient convocatoria={convocatoria} />;
}
