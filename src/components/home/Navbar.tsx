import Link from "next/link";
import { Search, LogIn } from "lucide-react";
import { UCPLogo } from "@/components/ui/UCPLogo";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm transition-all duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo Area Minimalista */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/50 rounded-lg transition-all hover:opacity-90">
              <UCPLogo variant="wide" size={45} />
            </Link>
          </div>

          {/* Center Navigation Menu */}
          <div className="hidden md:flex flex-grow justify-center space-x-8">
            <Link href="/" className="text-gray-900 font-semibold hover:text-[#8B1E1E] transition-colors border-b-2 border-transparent hover:border-[#8B1E1E] py-2">
              Inicio
            </Link>
            <Link href="/convocatorias" className="text-gray-600 font-medium hover:text-[#8B1E1E] transition-colors py-2">
              Convocatorias
            </Link>
            <Link href="/noticias" className="text-gray-600 font-medium hover:text-[#8B1E1E] transition-colors py-2">
              Noticias
            </Link>
            <Link href="/reglamentos" className="text-gray-600 font-medium hover:text-[#8B1E1E] transition-colors py-2">
              Reglamentos
            </Link>
            <Link href="/verificacion" className="text-gray-600 font-medium hover:text-[#8B1E1E] transition-colors py-2">
              Verificación
            </Link>
          </div>

          {/* Right Area (Search & Login) */}
          <div className="flex items-center gap-4">
            <div className="relative hidden lg:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-64 pl-10 pr-3 py-2 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#8B1E1E]/20 focus:border-[#8B1E1E] sm:text-sm transition-all duration-300"
                placeholder="Buscar información..."
              />
            </div>

            <Link
              href="/login"
              className="inline-flex items-center justify-center px-6 py-2.5 border border-transparent font-semibold rounded-xl text-white bg-[#8B1E1E] hover:bg-[#731919] hover:shadow-md transition-all duration-300 gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8B1E1E]"
            >
              <LogIn className="h-4 w-4" />
              <span>Iniciar Sesión</span>
            </Link>
          </div>

        </div>
      </div>
    </nav>
  );
}
