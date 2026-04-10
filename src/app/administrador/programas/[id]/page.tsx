import React from 'react';
import { notFound } from 'next/navigation';
import { getProgramaById, getEstadisticasPrograma, getFacultadesActivas } from '../actions';
import { ProgramaDetalleClient } from './detalle-client';

export const metadata = { title: 'Detalles del Programa | Administrador' };

export default async function ProgramaDetallePage({ params }: { params: { id: string } }) {
  const [programa, estadisticas, facultades] = await Promise.all([
    getProgramaById(params.id),
    getEstadisticasPrograma(params.id),
    getFacultadesActivas(),
  ]);

  if (!programa) {
    notFound();
  }

  return <ProgramaDetalleClient programa={programa} estadisticas={estadisticas} facultades={facultades} />;
}
