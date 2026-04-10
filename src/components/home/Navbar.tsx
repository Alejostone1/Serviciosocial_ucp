'use client';

import Link from "next/link";
import { Search, LogIn, X, Clock, FileText, Newspaper, ChevronRight, Loader2 } from "lucide-react";
import { UCPLogo } from "@/components/ui/UCPLogo";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface SearchResult {
  convocatorias: Array<{
    id: string;
    titulo: string;
    descripcion: string;
    categoria?: { nombre: string; color_hex: string | null } | null;
  }>;
  noticias: Array<{
    id: string;
    titulo: string;
    resumen: string;
    slug: string;
    autor: string;
    imagenes?: Array<{ url_imagen: string }>;
  }>;
  reglamentos: Array<{
    id: string;
    titulo: string;
    descripcion: string;
    url: string;
    tipo: string;
  }>;
}

export function Navbar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [results, setResults] = useState<SearchResult>({
    convocatorias: [],
    noticias: [],
    reglamentos: [],
  });
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  const performSearch = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setResults({ convocatorias: [], noticias: [], reglamentos: [] });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/buscar?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setResults(data);
      }
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        performSearch(searchQuery);
      } else {
        setResults({ convocatorias: [], noticias: [], reglamentos: [] });
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, performSearch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setIsSearching(value.length > 0);
    setShowDropdown(value.length >= 2);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    setShowDropdown(false);
    setResults({ convocatorias: [], noticias: [], reglamentos: [] });
    inputRef.current?.focus();
  };

  const handleResultClick = (url: string) => {
    setShowDropdown(false);
    setSearchQuery('');
    setIsSearching(false);
    router.push(url);
  };

  const totalResults = results.convocatorias.length + results.noticias.length + results.reglamentos.length;
  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm transition-all duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo Area Minimalista */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/50 rounded-lg transition-all hover:opacity-90">
              <UCPLogo variant="wide" size={45} priority />
            </Link>
          </div>

          {/* Center Navigation Menu */}
          <div className="hidden md:flex flex-grow justify-center space-x-8">
            <Link href="/" className="text-gray-900 font-semibold hover:text-[#8B1E1E] transition-colors border-b-2 border-transparent hover:border-[#8B1E1E] py-2">
              Inicio
            </Link>
            <Link href="/Publico/convocatorias" className="text-gray-600 font-medium hover:text-[#8B1E1E] transition-colors py-2">
              Convocatorias
            </Link>
            <Link href="/Publico/noticias" className="text-gray-600 font-medium hover:text-[#8B1E1E] transition-colors py-2">
              Noticias
            </Link>
            <Link href="/Publico/reglamentos" className="text-gray-600 font-medium hover:text-[#8B1E1E] transition-colors py-2">
              Reglamentos
            </Link>
            <Link href="/Publico/verificacion" className="text-gray-600 font-medium hover:text-[#8B1E1E] transition-colors py-2">
              Verificación
            </Link>
          </div>

          {/* Right Area (Search & Login) */}
          <div className="flex items-center gap-4">
            {/* Search with dropdown */}
            <div className="relative hidden lg:block" ref={searchRef}>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => searchQuery.trim().length >= 2 && setShowDropdown(true)}
                className="block w-72 pl-10 pr-8 py-2.5 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#8B1E1E]/20 focus:border-[#8B1E1E] sm:text-sm transition-all duration-300"
                placeholder="Buscar convocatorias, noticias..."
              />
              {isSearching && (
                <button
                  onClick={handleClearSearch}
                  className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Limpiar búsqueda"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              {/* Search Results Dropdown */}
              {showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 max-h-[500px] overflow-y-auto">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-5 w-5 text-[#8B1E1E] animate-spin" />
                      <span className="ml-2 text-sm text-gray-500">Buscando...</span>
                    </div>
                  ) : totalResults === 0 ? (
                    <div className="py-6 px-4 text-center">
                      <p className="text-sm text-gray-500">No se encontraron resultados</p>
                      <p className="text-xs text-gray-400 mt-1">Intenta con otros términos</p>
                    </div>
                  ) : (
                    <div className="py-2">
                      {/* Convocatorias */}
                      {results.convocatorias.length > 0 && (
                        <div className="mb-2">
                          <div className="px-4 py-2 bg-gray-50 border-y border-gray-100">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                              <Clock className="h-3.5 w-3.5 text-[#8B1E1E]" />
                              Convocatorias ({results.convocatorias.length})
                            </span>
                          </div>
                          {results.convocatorias.map((conv) => (
                            <button
                              key={conv.id}
                              onClick={() => handleResultClick(`/Publico/convocatorias/${conv.id}`)}
                              className="w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left group"
                            >
                              <div className="flex items-start gap-3">
                                {conv.categoria?.color_hex && (
                                  <div
                                    className="w-2 h-2 rounded-full mt-2 shrink-0"
                                    style={{ backgroundColor: conv.categoria.color_hex }}
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-gray-900 group-hover:text-[#8B1E1E] transition-colors line-clamp-1">
                                    {conv.titulo}
                                  </p>
                                  <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                                    {conv.descripcion}
                                  </p>
                                  {conv.categoria?.nombre && (
                                    <span className="inline-block mt-1 text-[10px] font-medium text-gray-400 uppercase">
                                      {conv.categoria.nombre}
                                    </span>
                                  )}
                                </div>
                                <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-[#8B1E1E] mt-1 shrink-0" />
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Noticias */}
                      {results.noticias.length > 0 && (
                        <div className="mb-2">
                          <div className="px-4 py-2 bg-gray-50 border-y border-gray-100">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                              <Newspaper className="h-3.5 w-3.5 text-[#8B1E1E]" />
                              Noticias ({results.noticias.length})
                            </span>
                          </div>
                          {results.noticias.map((noticia) => (
                            <button
                              key={noticia.id}
                              onClick={() => handleResultClick(`/Publico/noticias/${noticia.slug}`)}
                              className="w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left group"
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-gray-900 group-hover:text-[#8B1E1E] transition-colors line-clamp-1">
                                    {noticia.titulo}
                                  </p>
                                  <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                                    {noticia.resumen}
                                  </p>
                                  <span className="inline-block mt-1 text-[10px] font-medium text-gray-400">
                                    Por {noticia.autor}
                                  </span>
                                </div>
                                <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-[#8B1E1E] mt-1 shrink-0" />
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Reglamentos */}
                      {results.reglamentos.length > 0 && (
                        <div>
                          <div className="px-4 py-2 bg-gray-50 border-y border-gray-100">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                              <FileText className="h-3.5 w-3.5 text-[#8B1E1E]" />
                              Reglamentos ({results.reglamentos.length})
                            </span>
                          </div>
                          {results.reglamentos.map((reg) => (
                            <button
                              key={reg.id}
                              onClick={() => handleResultClick(reg.url)}
                              className="w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left group"
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-gray-900 group-hover:text-[#8B1E1E] transition-colors line-clamp-1">
                                    {reg.titulo}
                                  </p>
                                  <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                                    {reg.descripcion}
                                  </p>
                                  <span className="inline-block mt-1 text-[10px] font-medium text-[#8B1E1E] bg-[#8B1E1E]/10 px-2 py-0.5 rounded">
                                    {reg.tipo}
                                  </span>
                                </div>
                                <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-[#8B1E1E] mt-1 shrink-0" />
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* View all results */}
                      {totalResults > 0 && (
                        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50">
                          <Link
                            href={`/buscar?q=${encodeURIComponent(searchQuery)}`}
                            onClick={() => setShowDropdown(false)}
                            className="text-sm font-medium text-[#8B1E1E] hover:text-[#731919] transition-colors flex items-center justify-center gap-1"
                          >
                            Ver todos los resultados
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
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
