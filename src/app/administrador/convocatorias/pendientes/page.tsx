import { Metadata } from 'next';
import { getConvocatoriasPendientesAprobacion, getEstadisticasAprobacion } from '../aprobacion-actions';
import { PendientesClient } from './pendientes-client';

export const metadata: Metadata = {
    title: 'Convocatorias Pendientes de Aprobación | Administrador',
    description: 'Gestión de convocatorias esperando confirmación administrativa'
};

export default async function ConvocatoriasPendientesPage() {
    const [convocatorias, estadisticas] = await Promise.all([
        getConvocatoriasPendientesAprobacion(),
        getEstadisticasAprobacion()
    ]);

    return <PendientesClient convocatorias={convocatorias} estadisticas={estadisticas} />;
}
