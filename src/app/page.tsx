import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Navbar } from '@/components/home/Navbar';
import { Hero } from '@/components/home/Hero';
import { QuickAccess } from '@/components/home/QuickAccess';
import { StatsSection } from '@/components/home/StatsSection';
import { Footer } from '@/components/home/Footer';
import { ConvocatoriasSkeleton } from '@/components/home/ConvocatoriaSkeleton';
import { NewsSectionSkeleton } from '@/components/home/NewsSkeleton';

// Carga directa de secciones (para evitar errores de bundler)
import { ConvocatoriasCarousel } from '@/components/home/ConvocatoriasCarousel';
import { NewsSection } from '@/components/home/NewsSection';

export const metadata = {
  title: 'Servicio Social Universitario - UCP',
  description: 'Transformando realidades a través del compromiso social, la ética y la formación integral de nuestros estudiantes.',
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow">
        {/* Prioridad 1: Hero */}
        <Hero />

        {/* Prioridad 2: Accesos rápidos */}
        <QuickAccess />

        {/* Prioridad 3: Convocatorias (con Suspense) */}
        <Suspense fallback={<ConvocatoriasSkeleton />}>
          <ConvocatoriasCarousel />
        </Suspense>

        {/* Prioridad 4: Noticias (con Suspense) */}
        <Suspense fallback={<NewsSectionSkeleton />}>
          <NewsSection />
        </Suspense>

        <StatsSection />
      </main>

      <Footer />
    </div>
  );
}
