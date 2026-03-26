import React from 'react';
import { getCertificadosEstudiante, getEstadisticasCertificados, getProgresoCertificacion } from './actions';
import { CertificadosClient } from './certificados-client';

export const metadata = { title: 'Mis Certificados | Estudiante' };

export default async function CertificadosPage() {
    const [certificados, estadisticas, progreso] = await Promise.all([
        getCertificadosEstudiante(),
        getEstadisticasCertificados(),
        getProgresoCertificacion()
    ]);

    return (
        <CertificadosClient 
            initialCertificados={certificados} 
            initialEstadisticas={estadisticas} 
            initialProgreso={progreso} 
        />
    );
}
