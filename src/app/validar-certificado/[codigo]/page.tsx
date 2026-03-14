import React from 'react';
import { notFound } from 'next/navigation';
import { ValidacionCertificadoClient } from './validacion-client';
import { validarCertificado } from '@/app/administrador/certificados/actions';

export const metadata = { title: 'Validación de Certificado' };

export default async function ValidarCertificadoPage({ params }: { params: { codigo: string } }) {
    const resultado = await validarCertificado(params.codigo);

    if (!resultado.valido && resultado.mensaje.includes('no encontrado')) {
        notFound();
    }

    return <ValidacionCertificadoClient resultado={resultado} codigo={params.codigo} />;
}
