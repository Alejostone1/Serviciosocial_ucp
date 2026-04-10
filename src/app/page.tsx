import React, { Suspense } from 'react';
import { Navbar } from '@/components/home/Navbar';
import { Hero } from '@/components/home/Hero';
import { QuickAccess } from '@/components/home/QuickAccess';
import { StatsSection } from '@/components/home/StatsSection';
import { Footer } from '@/components/home/Footer';
import { ConvocatoriasSkeleton } from '@/components/home/ConvocatoriaSkeleton';
import { NewsSectionSkeleton } from '@/components/home/NewsSkeleton';
import { SearchProvider } from '@/components/home/SearchContext';
import { db } from '@/lib/prisma';
import { transformDecimalsToNumbers } from '@/lib/decimal-utils';

// Secciones
import { ConvocatoriasCarousel } from '@/components/home/ConvocatoriasCarousel';
import { NewsSection } from '@/components/home/NewsSection';

export const metadata = {
  title: 'Servicio Social Universitario - UCP',
  description: 'Transformando realidades a través del compromiso social, la ética y la formación integral de nuestros estudiantes.',
};

// Revalidar cada hora para mantener datos frescos sin sacrificar velocidad
export const revalidate = 3600;

async function getConvocatorias() {
  try {
    const data = await db.execute(async (prisma) => {
      return await prisma.convocatoria.findMany({
        where: {
          estado: 'PUBLICADA',
          fecha_cierre_postulacion: {
            gte: new Date()
          }
        },
        select: {
          id: true,
          titulo: true,
          descripcion: true,
          horas_totales_ofrecidas: true,
          modalidad: true,
          lugar: true,
          fecha_inicio: true,
          fecha_fin: true,
          programa: {
            select: { nombre: true }
          },
          categoria: {
            select: { nombre: true, color_hex: true }
          }
        },
        orderBy: { fecha_inicio: 'desc' },
        take: 6
      });
    });
    return transformDecimalsToNumbers(data);
  } catch (error) {
    console.error('Error fetching convocatorias on server:', error);
    return [];
  }
}

async function getNoticias() {
  try {
    const data = await db.execute(async (prisma) => {
      return await prisma.noticia.findMany({
        where: { publicada: true },
        select: {
          id: true,
          titulo: true,
          resumen: true,
          autor: true,
          slug: true,
          fecha_publicacion: true,
          creado_en: true,
          imagenes: {
            select: {
              id: true,
              url_imagen: true,
              orden: true
            },
            orderBy: { orden: 'asc' }
          }
        },
        orderBy: { fecha_publicacion: 'desc' },
        take: 3
      });
    });
    return transformDecimalsToNumbers(data);
  } catch (error) {
    console.error('Error fetching noticias on server:', error);
    return [];
  }
}

export default function HomePage() {
  return (
    <SearchProvider>
      <div className="min-h-screen bg-white flex flex-col font-sans">
        <Navbar />

        <main className="flex-grow">
          {/* Prioridad 1: Hero */}
          <Hero />

          {/* Prioridad 2: Accesos rápidos */}
          <QuickAccess />

          {/* Prioridad 3: Convocatorias (Streamed) */}
          <Suspense fallback={<ConvocatoriasSkeleton />}>
            <ConvocatoriasCarouselWrapper />
          </Suspense>

          {/* Prioridad 4: Noticias (Streamed) */}
          <Suspense fallback={<NewsSectionSkeleton />}>
            <NewsSectionWrapper />
          </Suspense>

          <StatsSection />
        </main>

        <Footer />
      </div>
    </SearchProvider>
  );
}

async function ConvocatoriasCarouselWrapper() {
  const data = await getConvocatorias();
  return <ConvocatoriasCarousel initialData={data} />;
}

async function NewsSectionWrapper() {
  const data = await getNoticias();
  return <NewsSection initialData={data} />;
}

