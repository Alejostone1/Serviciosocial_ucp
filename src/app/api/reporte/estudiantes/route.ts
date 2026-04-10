import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { generarReporteEstudiantesExcel } from '@/app/administrador/reportes/actions';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== 'ADMINISTRADOR') {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { format } = await request.json();
        const datos = await generarReporteEstudiantesExcel();
        
        if (format === 'excel') {
            const { createUCPExcelReport } = await import('@/lib/excel-utils');
            const columns = [
                { header: 'DOCUMENTO', key: 'documento', width: 20 },
                { header: 'NOMBRE', key: 'nombre', width: 40 },
                { header: 'CORREO', key: 'correo', width: 40 },
                { header: 'TELÉFONO', key: 'telefono', width: 20 },
                { header: 'PROGRAMA', key: 'programa', width: 40 },
                { header: 'FACULTAD', key: 'facultad', width: 40 },
                { header: 'SEMESTRE', key: 'semestre', width: 12 },
                { header: 'CÓDIGO', key: 'codigo', width: 15 },
                { header: 'H. PREVIAS', key: 'h_previas', width: 15 },
                { header: 'H. ACUMULADAS', key: 'h_acumuladas', width: 15 },
                { header: 'AVANCE %', key: 'avance', width: 12 },
            ];

            const reportData = datos.map(e => ({
                documento: e['Documento'],
                nombre: e['Nombre'],
                correo: e['Correo'],
                telefono: e['Teléfono'],
                programa: e['Programa'],
                facultad: e['Facultad'],
                semestre: e['Semestre'],
                codigo: e['Código Estudiantil'],
                h_previas: e['Horas Previas'],
                h_acumuladas: e['Horas Acumuladas'],
                avance: e['Porcentaje Avance'],
            }));

            const excelBuffer = await createUCPExcelReport('Estudiantes', columns, reportData);
            
            return new NextResponse(excelBuffer as any, {
                headers: {
                    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'Content-Disposition': `attachment; filename="UCP_REPORTE_ESTUDIANTES_${new Date().toISOString().split('T')[0]}.xlsx"`,
                },
            });
        } 
        
        if (format === 'pdf') {
            const { createUCPPDFReport } = await import('@/lib/pdf-utils');
            const headers = ['DOCUMENTO', 'NOMBRE', 'PROGRAMA', 'FACULTAD', 'HORAS'];
            const tableData = datos.map(e => [
                e['Documento'],
                e['Nombre'],
                e['Programa'],
                e['Facultad'],
                `${e['Horas Acumuladas']}h`
            ]);

            const pdfBuffer = await createUCPPDFReport('Estudiantes', headers, tableData, 'Censo de participación en servicio social universitario');
            
            return new NextResponse(pdfBuffer as any, {
                headers: {
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': `attachment; filename="UCP_REPORTE_ESTUDIANTES_${new Date().toISOString().split('T')[0]}.pdf"`,
                },
            });
        }

        return NextResponse.json({ error: 'Formato no soportado' }, { status: 400 });
    } catch (error) {
        console.error('Error en API de reporte de estudiantes:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
