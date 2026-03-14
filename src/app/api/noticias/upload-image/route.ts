import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session?.user || session.user.role !== 'ADMINISTRADOR') {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            );
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const noticiaId = formData.get('noticiaId') as string;
        const orden = parseInt(formData.get('orden') as string);

        if (!file || !noticiaId) {
            return NextResponse.json(
                { error: 'Faltan datos requeridos' },
                { status: 400 }
            );
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            return NextResponse.json(
                { error: 'El archivo debe ser una imagen' },
                { status: 400 }
            );
        }

        // For now, save to a temporary location
        // In production, you would use Cloudinary or similar service
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // Generate a unique filename
        const timestamp = Date.now();
        const filename = `noticia-${noticiaId}-${timestamp}-${file.name}`;
        
        // For demo purposes, we'll store the file info
        // In production, upload to Cloudinary and get URL + public_id
        const urlImagen = `/uploads/noticias/${filename}`;
        const publicIdCloudinary = `noticia_${noticiaId}_${timestamp}`;

        // Save to database
        const imagen = await db.execute(async (prisma) => {
            return await prisma.imagenNoticia.create({
                data: {
                    id_noticia: noticiaId,
                    url_imagen: urlImagen,
                    public_id_cloudinary: publicIdCloudinary,
                    orden: orden || 0,
                }
            });
        }, 'Error al guardar imagen');

        return NextResponse.json(imagen, { status: 201 });
    } catch (error) {
        console.error('Error al subir imagen:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
