import React from 'react';
import { getProgramas, getFacultadesActivas } from './actions';
import { ProgramasTableClient } from './client';

export const metadata = { title: 'Programas Académicos | Administrador' };

export default async function ProgramasPage() {
  const [programas, facultades] = await Promise.all([
    getProgramas(),
    getFacultadesActivas(),
  ]);

  return (
    <ProgramasTableClient
      initialData={programas as any}
      facultades={facultades}
    />
  );
}
