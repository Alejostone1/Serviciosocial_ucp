import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

/**
 * Genera un PDF institucional UCP con tablas
 */
export async function createUCPPDFReport(
    title: string, 
    headers: string[], 
    data: any[][],
    subtitle?: string
) {
    const doc = new jsPDF() as any;
    
    // Header institucional
    doc.setFontSize(18);
    doc.setTextColor(139, 30, 30); // #8B1E1E
    doc.text('UNIVERSIDAD CATÓLICA DE PEREIRA', 105, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text(`REPORTE DE ${title.toUpperCase()}`, 105, 30, { align: 'center' });
    
    if (subtitle) {
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(subtitle, 105, 36, { align: 'center' });
    }
    
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Documento generado el: ${new Date().toLocaleString()}`, 105, 42, { align: 'center' });

    doc.autoTable({
        startY: 50,
        head: [headers],
        body: data,
        theme: 'striped',
        headStyles: { 
            fillColor: [139, 30, 30],
            fontSize: 8,
            fontStyle: 'bold',
            halign: 'center'
        },
        styles: { 
            fontSize: 7, 
            cellPadding: 2,
            overflow: 'linebreak',
            valign: 'middle'
        },
        columnStyles: {
            0: { cellWidth: 'auto' }
        },
        margin: { top: 50, left: 15, right: 15, bottom: 20 },
        didDrawPage: (data: any) => {
            // Pie de página
            const str = `Página ${data.pageNumber}`;
            doc.setFontSize(8);
            const pageSize = doc.internal.pageSize;
            const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
            doc.text(str, data.settings.margin.left, pageHeight - 10);
        }
    });

    return Buffer.from(doc.output('arraybuffer'));
}
