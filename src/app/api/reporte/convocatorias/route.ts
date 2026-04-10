import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { generarReporteConvocatoriasExcel } from '@/app/administrador/reportes/actions';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== 'ADMINISTRADOR') {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { format } = await request.json();
        const datos = await generarReporteConvocatoriasExcel();
        
        if (format === 'excel') {
            const { createUCPExcelReport } = await import('@/lib/excel-utils');
            const columns = [
                { header: 'TÍTULO', key: 'titulo', width: 40 },
                { header: 'MODALIDAD', key: 'modalidad', width: 15 },
                { header: 'LUGAR', key: 'lugar', width: 25 },
                { header: 'PROGRAMA', key: 'programa', width: 40 },
                { header: 'FACULTAD', key: 'facultad', width: 40 },
                { header: 'ESTADO', key: 'estado', width: 15 },
                { header: 'HORAS', key: 'horas', width: 12 },
                { header: 'POSTULACIONES', key: 'postulaciones', width: 15 },
            ];

            const reportData = datos.map(c => ({
                titulo: c['Título'],
                modalidad: c['Modalidad'],
                lugar: c['Lugar'],
                programa: c['Programa'],
                facultad: c['Facultad'],
                estado: c['Estado'],
                horas: c['Horas Ofrecidas'],
                postulaciones: c['Total Postulaciones'],
            }));

            const excelBuffer = await createUCPExcelReport('Convocatorias', columns, reportData);
            
            return new NextResponse(excelBuffer as any, {
                headers: {
                    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'Content-Disposition': `attachment; filename="UCP_REPORTE_CONVOCATORIAS_${new Date().toISOString().split('T')[0]}.xlsx"`,
                },
            });
        } 
        
        if (format === 'pdf') {
            const { createUCPPDFReport } = await import('@/lib/pdf-utils');
            const headers = ['TÍTULO', 'MODALIDAD', 'FACULTAD', 'ESTADO', 'VACANTES'];
            const tableData = datos.map(c => [
                c['Título'],
                c['Modalidad'],
                c['Facultad'],
                c['Estado'],
                c['Cupo Disponible']?.toString() || '0'
            ]);

            const pdfBuffer = await createUCPPDFReport('Convocatorias', headers, tableData, 'Listado maestro de ofertas de servicio social');
            
            return new NextResponse(pdfBuffer as any, {
                headers: {
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': `attachment; filename="UCP_REPORTE_CONVOCATORIAS_${new Date().toISOString().split('T')[0]}.pdf"`,
                },
            });
        }

        return NextResponse.json({ error: 'Formato no soportado' }, { status: 400 });
    } catch (error) {
        console.error('Error en API de reporte de convocatorias:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
