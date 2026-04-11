import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Calendar, User, Clock } from 'lucide-react';
import { Navbar } from '@/components/home/Navbar';
import { Footer } from '@/components/home/Footer';

interface NoticiaDetail {
  id: string;
  titulo: string;
  resumen: string;
  contenido: string;
  slug: string;
  autor: string;
  fecha_publicacion: string;
  imagenes?: Array<{
    url_imagen: string;
    descripcion?: string;
  }>;
}

async function getNoticia(slug: string): Promise<NoticiaDetail | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/noticias/slug/${slug}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching noticia:', error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const noticia = await getNoticia(params.slug);
  
  if (!noticia) {
    return {
      title: 'Noticia no encontrada',
      description: 'La noticia que buscas no existe o ha sido eliminada.'
    };
  }

  return {
    title: `${noticia.titulo} | Noticias - Servicio Social UCP`,
    description: noticia.resumen,
    openGraph: {
      title: noticia.titulo,
      description: noticia.resumen,
      type: 'article',
      publishedTime: noticia.fecha_publicacion,
      authors: [noticia.autor],
      images: noticia.imagenes?.map(img => ({
        url: img.url_imagen,
        alt: noticia.titulo
      }))
    }
  };
}

export default async function NoticiaPage({ params }: { params: { slug: string } }) {
  const noticia = await getNoticia(params.slug);

  if (!noticia) {
    notFound();
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <ol className="flex items-center space-x-2 text-sm text-gray-500">
              <li>
                <Link href="/Publico/noticias" className="hover:text-[#8B1E1E] transition-colors">
                  Noticias
                </Link>
              </li>
              <li className="flex items-center space-x-2">
                <span>/</span>
                <span className="text-gray-900 font-medium">{noticia.titulo}</span>
              </li>
            </ol>
          </nav>

          <article className="max-w-4xl mx-auto">
            {/* Header */}
            <header className="mb-8">
              <div className="text-center mb-6">
                <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
                  {noticia.titulo}
                </h1>
                
                <div className="flex items-center justify-center gap-6 text-sm text-gray-600 mb-6">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{noticia.autor}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(noticia.fecha_publicacion)}</span>
                  </div>
                </div>
              </div>

              {/* Imagen Principal */}
              {noticia.imagenes && noticia.imagenes.length > 0 && (
                <div className="mb-8">
                  <Image
                    src={noticia.imagenes[0].url_imagen}
                    alt={noticia.imagenes[0].descripcion || noticia.titulo}
                    width={800}
                    height={400}
                    className="w-full h-96 object-cover rounded-xl shadow-lg"
                    priority
                  />
                </div>
              )}
            </header>

            {/* Contenido */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-8">
                {/* Resumen */}
                <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                  <h2 className="text-lg font-bold text-blue-900 mb-3">Resumen</h2>
                  <p className="text-blue-800 leading-relaxed">
                    {noticia.resumen}
                  </p>
                </div>

                {/* Contenido Completo */}
                <div className="prose prose-gray max-w-none">
                  <div 
                    className="text-gray-700 leading-relaxed whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: noticia.contenido }}
                  />
                </div>
              </div>
            </div>

            {/* Footer del Artículo */}
            <footer className="mt-8 text-center">
              <div className="flex items-center justify-center gap-4 text-sm text-gray-500 mb-6">
                <span>Publicado por</span>
                <span className="font-medium text-gray-700">{noticia.autor}</span>
                <span>el</span>
                <span className="font-medium text-gray-700">{formatDate(noticia.fecha_publicacion)}</span>
              </div>
              
              <Link
                href="/Publico/noticias"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#8B1E1E] text-white rounded-lg font-semibold hover:bg-[#731919] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver a Noticias
              </Link>
            </footer>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}
