import { getConvocatoriasAdmin } from './convocatorias-actions';
import { ConvocatoriasDashboardTabs } from './dashboard-tabs';

export default async function ConvocatoriasPage() {
    const data = await getConvocatoriasAdmin();
    return <ConvocatoriasDashboardTabs initialData={data as any} />;
}
