import { AuxiliarConvocatoriasList } from '@/app/sistema/auxiliar/components/AuxiliarConvocatoriasList';

export default function ConvocatoriasPage() {
  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Page Header */}
      <div className="px-2">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Gestión de Convocatorias</h1>
        <p className="text-slate-500 text-lg font-normal mt-2 leading-relaxed max-w-2xl">
          Como Auxiliar administrativo, puedes crear y supervisar todas las convocatorias de servicio social del sistema.
        </p>
      </div>

      {/* Convocatorias List */}
      <AuxiliarConvocatoriasList />
    </div>
  );
}
