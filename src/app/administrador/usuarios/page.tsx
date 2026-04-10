import React from 'react';
import { getUsuarios } from './actions';
import { getProgramasActivos } from './crear-usuario-actions';
import { UsuariosTableClient } from './client';

export const metadata = { title: 'Gestión de Usuarios | Administrador' };

export default async function UsuariosPage() {
  const [usuarios, programas] = await Promise.all([
    getUsuarios(),
    getProgramasActivos(),
  ]);

  return (
    <UsuariosTableClient
      initialData={usuarios as any}
      programas={programas}
    />
  );
}
