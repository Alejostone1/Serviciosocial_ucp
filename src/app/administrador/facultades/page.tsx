import React from 'react';
import { getFacultades } from './actions';
import { FacultadesPageClient } from './page-client';

export const metadata = { title: 'Facultades | Administrador' };

export default async function FacultadesPage() {
  const facultades = await getFacultades();
  return <FacultadesPageClient initialData={facultades as any} />;
}
