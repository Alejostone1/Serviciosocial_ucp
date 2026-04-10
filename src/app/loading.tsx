import { InstitutionalLoader } from "@/components/ui/InstitutionalLoader";
import { UCPLogo } from "@/components/ui/UCPLogo";

export default function Loading() {
  return (
    <div className="relative min-h-[100dvh] bg-white flex flex-col items-center justify-center z-50">
      <div className="relative">
        <div className="absolute inset-0 bg-[#8B1E1E]/5 rounded-full blur-3xl scale-150 animate-pulse" />
        <InstitutionalLoader priority={false} />
      </div>
      <p className="mt-8 text-neutral-500 font-medium tracking-widest uppercase text-xs animate-pulse">
        Servicio Social Universitario
      </p>
    </div>
  );
}
