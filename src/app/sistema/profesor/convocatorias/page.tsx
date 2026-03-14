import { ProfesorConvocatoriasList } from '../components/ProfesorConvocatoriasList';

export default function ConvocatoriasPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Convocatorias</h1>
        <p className="text-gray-600">Gestiona y supervisa las convocatorias de servicio social</p>
      </div>

      {/* Convocatorias List */}
      <ProfesorConvocatoriasList />
    </div>
  );
}
