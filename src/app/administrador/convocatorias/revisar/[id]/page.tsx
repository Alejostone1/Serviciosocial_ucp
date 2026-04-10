import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getConvocatoriaById } from '../../convocatorias-actions';
import { RevisarClient } from './revisar-client';

export const metadata: Metadata = {
    title: 'Revisar Convocatoria | Administrador',
    description: 'Revisión detallada de convocatoria pendiente de aprobación'
};

export default async function RevisarConvocatoriaPage({ params }: { params: { id: string } }) {
    const convocatoria = await getConvocatoriaById(params.id);

    if (!convocatoria) {
        notFound();
    }

    return <RevisarClient convocatoria={convocatoria} />;
}
