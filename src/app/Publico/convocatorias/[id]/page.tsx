import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin, Users, Clock, Building2, CheckCircle, User, ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/home/Navbar';
import { Footer } from '@/components/home/Footer';

interface ConvocatoriaDetail {
  id: string;
  titulo: string;
  descripcion: string;
  objetivo?: string;
  categoria?: {
    nombre: string;
    color_hex: string | null;
  };
  modalidad: string;
  lugar?: string;
  fecha_inicio: string;
  fecha_fin?: string;
  fecha_cierre_postulacion?: string;
  cupo_maximo?: number;
  cupo_disponible?: number;
  horas_totales_ofrecidas?: number;
  requiere_entrevista: boolean;
  publicador: {
    primer_nombre: string;
    primer_apellido: string;
  };
  programa?: {
    nombre: string;
  };
}

async function getConvocatoria(id: string): Promise<ConvocatoriaDetail | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/convocatorias/${id}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching convocatoria:', error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const convocatoria = await getConvocatoria(params.id);
  
  if (!convocatoria) {
    return {
      title: 'Convocatoria no encontrada',
      description: 'La convocatoria que buscas no existe o ha sido eliminada.'
    };
  }

  return {
    title: `${convocatoria.titulo} | Convocatoria - Servicio Social UCP`,
    description: convocatoria.descripcion.substring(0, 160) + '...',
  };
}

export default async function ConvocatoriaPage({ params }: { params: { id: string } }) {
  const convocatoria = await getConvocatoria(params.id);

  if (!convocatoria) {
    notFound();
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const cupoDisponible = convocatoria.cupo_disponible !== undefined && convocatoria.cupo_disponible > 0;
  const fechaCierre = convocatoria.fecha_cierre_postulacion || convocatoria.fecha_fin;
  const estaCerrada = fechaCierre ? new Date(fechaCierre) < new Date() : false;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="py-8 bg-gradient-to-b from-slate-50 to-white min-h-[calc(100vh-80px)]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <ol className="flex items-center space-x-2 text-sm text-gray-500">
              <li>
                <Link href="/Publico/convocatorias" className="hover:text-[#8B1E1E] transition-colors">
                  Convocatorias
                </Link>
              </li>
              <li className="flex items-center space-x-2">
                <span>/</span>
                <span className="text-gray-900 font-medium">{convocatoria.titulo}</span>
              </li>
            </ol>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contenido Principal */}
            <div className="lg:col-span-2">
              <article className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Header */}
                <div className="relative h-48 bg-[#8B1E1E]">
                  {convocatoria.categoria?.color_hex && (
                    <div 
                      className="absolute top-4 right-4 px-3 py-1 rounded-full text-white text-xs font-bold"
                      style={{ backgroundColor: convocatoria.categoria.color_hex }}
                    >
                      {convocatoria.categoria.nombre}
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <h1 className="text-2xl md:text-3xl font-bold text-white text-center px-6 leading-tight">
                      {convocatoria.titulo}
                    </h1>
                  </div>
                  {/* Decorative pattern overlay */}
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-[length:20px_20px]" />
                </div>

                {/* Contenido */}
                <div className="p-8">
                  {/* Descripción */}
                  <section className="mb-8">
                    <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <span className="w-1 h-5 bg-[#8B1E1E] rounded-full"></span>
                      Descripción
                    </h2>
                    <div className="prose prose-slate max-w-none pl-3">
                      <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {convocatoria.descripcion}
                      </p>
                    </div>
                  </section>

                  {/* Objetivo */}
                  {convocatoria.objetivo && (
                    <section className="mb-8">
                      <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <span className="w-1 h-5 bg-[#8B1E1E] rounded-full"></span>
                        Objetivo
                      </h2>
                      <p className="text-slate-700 leading-relaxed pl-3">
                        {convocatoria.objetivo}
                      </p>
                    </section>
                  )}

                  {/* Información Adicional */}
                  <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-[#8B1E1E] mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Fechas</p>
                          <p className="text-sm text-gray-600">
                            {formatDate(convocatoria.fecha_inicio)}
                            {convocatoria.fecha_fin && ` - ${formatDate(convocatoria.fecha_fin)}`}
                          </p>
                        </div>
                      </div>

                      {convocatoria.lugar && (
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-[#8B1E1E] mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Lugar</p>
                            <p className="text-sm text-gray-600">{convocatoria.lugar}</p>
                          </div>
                        </div>
                      )}

                      {convocatoria.programa && (
                        <div className="flex items-start gap-3">
                          <Building2 className="w-5 h-5 text-[#8B1E1E] mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Programa</p>
                            <p className="text-sm text-gray-600">{convocatoria.programa.nombre}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Users className="w-5 h-5 text-[#8B1E1E] mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Cupos</p>
                          <p className="text-sm text-gray-600">
                            {convocatoria.cupo_maximo ? `${convocatoria.cupo_disponible}/${convocatoria.cupo_maximo} disponibles` : 'Ilimitados'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-[#8B1E1E] mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Horas</p>
                          <p className="text-sm text-gray-600">
                            {convocatoria.horas_totales_ofrecidas ? `${convocatoria.horas_totales_ofrecidas} horas` : 'No especificadas'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-[#8B1E1E] mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Modalidad</p>
                          <p className="text-sm text-gray-600">{convocatoria.modalidad}</p>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              </article>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                {/* Estado de Postulación */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Estado de Postulación</h3>
                  <div className="space-y-3">
                    {estaCerrada ? (
                      <div className="flex items-center gap-2 text-red-600">
                        <div className="w-2 h-2 bg-red-600 rounded-full" />
                        <span className="text-sm font-medium">Cerrada</span>
                      </div>
                    ) : cupoDisponible ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <div className="w-2 h-2 bg-green-600 rounded-full" />
                        <span className="text-sm font-medium">Abierta</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-yellow-600">
                        <div className="w-2 h-2 bg-yellow-600 rounded-full" />
                        <span className="text-sm font-medium">Sin cupos</span>
                      </div>
                    )}
                    
                    {fechaCierre && (
                      <p className="text-xs text-gray-500">
                        Cierra: {formatDate(fechaCierre)}
                      </p>
                    )}
                  </div>

                  {estaCerrada ? (
                    <div className="w-full mt-4 px-4 py-3 bg-gray-100 text-gray-500 rounded-lg font-medium text-center border border-gray-200">
                      <span className="flex items-center justify-center gap-2">
                        Postulación Cerrada
                      </span>
                    </div>
                  ) : !cupoDisponible ? (
                    <div className="w-full mt-4 px-4 py-3 bg-amber-50 text-amber-700 rounded-lg font-medium text-center border border-amber-200">
                      <span className="flex items-center justify-center gap-2">
                        <Users className="w-4 h-4" />
                        Cupos completos
                      </span>
                    </div>
                  ) : (
                    <Link
                      href={`/login?redirect=/Publico/convocatorias/${convocatoria.id}`}
                      className="w-full mt-4 px-4 py-3.5 bg-[#8B1E1E] text-white rounded-lg font-semibold hover:bg-[#6b1818] transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 group"
                    >
                      Postularme ahora
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  )}
                </div>

                {/* Información de Contacto */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Publicado por</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
                      <User className="w-5 h-5 text-[#8B1E1E]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {convocatoria.publicador?.primer_apellido 
                          ? `${convocatoria.publicador.primer_apellido}${convocatoria.publicador.primer_nombre ? ', ' + convocatoria.publicador.primer_nombre : ''}`
                          : (convocatoria.publicador?.primer_nombre || 'Coordinador de Servicio Social')}
                      </p>
                      <p className="text-xs text-slate-500">Coordinador de Servicio Social</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
