import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { generarReporteActividadesExcel } from '@/app/administrador/reportes/actions';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== 'ADMINISTRADOR') {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { format } = await request.json();
        const datos = await generarReporteActividadesExcel();
        
        if (format === 'excel') {
            const { createUCPExcelReport } = await import('@/lib/excel-utils');
            const columns = [
                { header: 'NOMBRE', key: 'nombre', width: 40 },
                { header: 'TIPO ACT.', key: 'tipo', width: 20 },
                { header: 'H. EST.', key: 'h_est', width: 12 },
                { header: 'PROGRAMA', key: 'programa', width: 40 },
                { header: 'FACULTAD', key: 'facultad', width: 40 },
                { header: 'TOTAL REPOR.', key: 'total_rep', width: 15 },
                { header: 'H. APROBADAS', key: 'h_aprob', width: 15 },
            ];

            const reportData = datos.map(a => ({
                nombre: a['Nombre'],
                tipo: a['Tipo Actividad'],
                h_est: a['Horas Estimadas'],
                programa: a['Programa'],
                facultad: a['Facultad'],
                total_rep: a['Total Reportes'],
                h_aprob: a['Total Horas Aprobadas'],
            }));

            const excelBuffer = await createUCPExcelReport('Actividades', columns, reportData);
            
            return new NextResponse(excelBuffer as any, {
                headers: {
                    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'Content-Disposition': `attachment; filename="UCP_REPORTE_ACTIVIDADES_${new Date().toISOString().split('T')[0]}.xlsx"`,
                },
            });
        } 
        
        if (format === 'pdf') {
            const { createUCPPDFReport } = await import('@/lib/pdf-utils');
            const headers = ['NOMBRE ACT.', 'PROGRAMA', 'FACULTAD', 'H. EST.', 'H. APROB.'];
            const tableData = datos.map(a => [
                a['Nombre'],
                a['Programa'],
                a['Facultad'],
                a['Horas Estimadas']?.toString() || '0',
                `${a['Total Horas Aprobadas']}h`
            ]);

            const pdfBuffer = await createUCPPDFReport('Actividades', headers, tableData, 'Histórico de ejecución de actividades y validación de horas');
            
            return new NextResponse(pdfBuffer as any, {
                headers: {
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': `attachment; filename="UCP_REPORTE_ACTIVIDADES_${new Date().toISOString().split('T')[0]}.pdf"`,
                },
            });
        }

        return NextResponse.json({ error: 'Formato no soportado' }, { status: 400 });
    } catch (error) {
        console.error('Error en API de reporte de actividades:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
