import React from 'react';
import { notFound } from 'next/navigation';
import { getPostulacionById } from '../actions';
import { PostulacionDetalleClient } from './detalle-client';

export const metadata = { title: 'Detalles de Postulación | Administrador' };

export default async function PostulacionDetallePage({ params }: { params: { id: string } }) {
  const postulacion = await getPostulacionById(params.id);

  if (!postulacion) {
    notFound();
  }

  return <PostulacionDetalleClient postulacion={postulacion} />;
}
