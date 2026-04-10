import { NextRequest, NextResponse } from 'next/server';
import { generarPDFCertificado } from '@/app/administrador/certificados/actions';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== 'ADMINISTRADOR') {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const pdfBuffer = await generarPDFCertificado(params.id);
        
        return new NextResponse(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="certificado-${params.id}-${new Date().toISOString().split('T')[0]}.pdf"`,
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            },
        });
    } catch (error) {
        console.error('Error al generar PDF del certificado:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
