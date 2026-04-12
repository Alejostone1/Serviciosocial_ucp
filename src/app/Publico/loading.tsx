import { InstitutionalLoader } from "@/components/ui/InstitutionalLoader";

export default function PublicoLoading() {
  return (
    <div className="relative min-h-[60dvh] bg-white flex flex-col items-center justify-center">
      <InstitutionalLoader priority={false} />
      <p className="mt-6 text-neutral-400 font-medium tracking-widest uppercase text-xs">
        Cargando...
      </p>
    </div>
  );
}
