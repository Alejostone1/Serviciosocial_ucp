import { ProfesorConvocatoriasList } from '../components/ProfesorConvocatoriasList';

export default function ConvocatoriasPage() {
  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Page Header */}
      <div className="px-2">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Mis Convocatorias</h1>
        <p className="text-slate-500 text-lg font-normal mt-2 leading-relaxed max-w-2xl">
          Gestiona tus proyectos de servicio social, supervisa las actividades y revisa el progreso de los estudiantes vinculados.
        </p>
      </div>

      {/* Convocatorias List */}
      <ProfesorConvocatoriasList />
    </div>
  );
}
