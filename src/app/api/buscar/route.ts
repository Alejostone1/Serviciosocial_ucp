export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        convocatorias: [],
        noticias: [],
        reglamentos: [],
      });
    }

    const searchTerm = query.toLowerCase().trim();

    const convocatorias = await prisma.convocatoria.findMany({
      where: {
        OR: [
          { titulo: { contains: searchTerm, mode: 'insensitive' } },
          { descripcion: { contains: searchTerm, mode: 'insensitive' } },
        ],
        estado: { in: ['PUBLICADA', 'EN_CURSO'] },
      },
      take: 5,
      select: {
        id: true,
        titulo: true,
        descripcion: true,
        categoria: {
          select: {
            nombre: true,
            color_hex: true,
          },
        },
      },
      orderBy: {
        creado_en: 'desc',
      },
    });

    const noticias = await prisma.noticia.findMany({
      where: {
        OR: [
          { titulo: { contains: searchTerm, mode: 'insensitive' } },
          { resumen: { contains: searchTerm, mode: 'insensitive' } },
        ],
        publicada: true,
      },
      take: 5,
      select: {
        id: true,
        titulo: true,
        resumen: true,
        slug: true,
        autor: true,
        imagenes: {
          take: 1,
          select: {
            url_imagen: true,
          },
        },
      },
      orderBy: {
        fecha_publicacion: 'desc',
      },
    });

    const reglamentos = [
      {
        id: 'reglamento-1',
        titulo: 'Reglamento de Servicio Social Universitario',
        descripcion: 'Normas y procedimientos para el cumplimiento del servicio social.',
        url: '/Publico/reglamentos/servicio-social',
        tipo: 'PDF',
      },
      {
        id: 'reglamento-2',
        titulo: 'Guía del Estudiante - Servicio Social',
        descripcion: 'Orientaciones prácticas para estudiantes en servicio social.',
        url: '/Publico/reglamentos/guia-estudiante',
        tipo: 'PDF',
      },
    ].filter(r => 
      r.titulo.toLowerCase().includes(searchTerm) || 
      r.descripcion.toLowerCase().includes(searchTerm)
    ).slice(0, 3);

    return NextResponse.json({
      convocatorias,
      noticias,
      reglamentos,
    });

  } catch (error) {
    console.error('Error en búsqueda:', error);

    return NextResponse.json(
      { error: 'Error al realizar la búsqueda' },
      { status: 500 }
    );
  }
}