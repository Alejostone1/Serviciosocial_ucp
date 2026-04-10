import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { generarReporteCertificadosExcel } from '@/app/administrador/reportes/actions';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== 'ADMINISTRADOR') {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { format } = await request.json();
        const datos = await generarReporteCertificadosExcel();
        
        if (format === 'excel') {
            const { createUCPExcelReport } = await import('@/lib/excel-utils');
            const columns = [
                { header: 'CÓD. VERIFICACIÓN', key: 'codigo', width: 40 },
                { header: 'DOCUMENTO', key: 'doc', width: 20 },
                { header: 'ESTUDIANTE', key: 'nombre', width: 40 },
                { header: 'F. EMISIÓN', key: 'f_emision', width: 20 },
                { header: 'EMITIDO POR', key: 'emisor', width: 40 },
            ];

            const reportData = datos.map(c => ({
                codigo: c['Código Verificación'],
                doc: c['Estudiante Documento'],
                nombre: c['Estudiante Nombre'],
                f_emision: c['Fecha Emisión'],
                emisor: c['Emitido Por'],
            }));

            const excelBuffer = await createUCPExcelReport('Certificados', columns, reportData);
            
            return new NextResponse(excelBuffer as any, {
                headers: {
                    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'Content-Disposition': `attachment; filename="UCP_REPORTE_CERTIFICADOS_${new Date().toISOString().split('T')[0]}.xlsx"`,
                },
            });
        } 
        
        if (format === 'pdf') {
            const { createUCPPDFReport } = await import('@/lib/pdf-utils');
            const headers = ['CÓDIGO VERIF.', 'DOCUMENTO', 'ESTUDIANTE', 'EMISIÓN'];
            const tableData = datos.map(c => [
                c['Código Verificación']?.toString().slice(0, 16) + '...',
                c['Estudiante Documento'],
                c['Estudiante Nombre'],
                c['Fecha Emisión']
            ]);

            const pdfBuffer = await createUCPPDFReport('Certificados', headers, tableData, 'Protocolo de trazabilidad y validación de certificados institucionales');
            
            return new NextResponse(pdfBuffer as any, {
                headers: {
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': `attachment; filename="UCP_REPORTE_CERTIFICADOS_${new Date().toISOString().split('T')[0]}.pdf"`,
                },
            });
        }

        return NextResponse.json({ error: 'Formato no soportado' }, { status: 400 });
    } catch (error) {
        console.error('Error en API de reporte de certificados:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
