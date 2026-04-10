import React from 'react';
import { Navbar } from '@/components/home/Navbar';
import { Footer } from '@/components/home/Footer';
import { db } from '@/lib/prisma';
import { ConvocatoriasExplorer } from '@/components/convocatorias/ConvocatoriasExplorer';
import { transformDecimalsToNumbers } from '@/lib/decimal-utils';

async function getConvocatoriasPublicadas() {
    // Obtenemos solo convocatorias publicadas
    const convocatorias = await db.execute(async (prisma) => {
        return await prisma.convocatoria.findMany({
            where: {
                estado: 'PUBLICADA',
                // Opcional: solo mostrar las que no han cerrado?
                // fecha_cierre_postulacion: { gte: new Date() }
            },
            include: {
                categoria: true,
                programa: true,
                publicador: {
                    select: {
                        primer_nombre: true,
                        segundo_nombre: true,
                        primer_apellido: true,
                        segundo_apellido: true
                    }
                },
                _count: {
                    select: {
                        postulaciones: true
                    }
                }
            },
            orderBy: {
                publicado_en: 'desc'
            }
        });
    }, 'Error al obtener convocatorias publicadas');

    return transformDecimalsToNumbers(convocatorias);
}

export const metadata = {
    title: 'Explora Proyectos Sociales | Servicio Social UCP',
    description: 'Encuentra oportunidades de impacto social y realiza tu servicio social universitario en las mejores organizaciones.',
};

export default async function ConvocatoriasPage() {
    // El fetch se realiza en el servidor
    const convocatorias = await getConvocatoriasPublicadas();

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <Navbar />

            <main className="flex-grow">
                {/* 
                  Componente de Cliente que maneja la búsqueda, filtros y visualización 
                  Pasamos la data serializada desde el servidor.
                */}
                <ConvocatoriasExplorer initialConvocatorias={convocatorias} />
            </main>

            <Footer />
        </div>
    );
}
