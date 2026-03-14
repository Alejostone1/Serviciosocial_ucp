import { NextRequest, NextResponse } from 'next/server';
import { generarReporteActividadesExcel } from '@/app/(sistema)/administrador/reportes/actions';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== 'ADMINISTRADOR') {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { format } = await request.json();
        
        const datos = await generarReporteActividadesExcel();
        
        if (format === 'excel') {
            const ws = XLSX.utils.json_to_sheet(datos);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Actividades');
            
            const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
            
            return new NextResponse(excelBuffer, {
                headers: {
                    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'Content-Disposition': `attachment; filename="reporte-actividades-${new Date().toISOString().split('T')[0]}.xlsx"`,
                },
            });
        } else if (format === 'pdf') {
            const csv = convertToCSV(datos);
            
            return new NextResponse(csv, {
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': `attachment; filename="reporte-actividades-${new Date().toISOString().split('T')[0]}.csv"`,
                },
            });
        }

        return NextResponse.json({ error: 'Formato no soportado' }, { status: 400 });
    } catch (error) {
        console.error('Error en API de reporte de actividades:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}

function convertToCSV(data: any[]): string {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    
    const csvRows = data.map(row => 
        headers.map(header => {
            const value = row[header];
            return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
        }).join(',')
    );
    
    return [csvHeaders, ...csvRows].join('\n');
}
