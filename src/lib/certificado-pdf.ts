import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import { db } from './prisma';
import fs from 'fs';
import path from 'path';

/**
 * Generar PDF del certificado con diseño espectacular (COMPARTIDO)
 * Retorna Base64 string para download cliente
 */
export async function generarPDFCertificado(idCertificado: string): Promise<string> {
    try {
        return await db.execute(async (prisma) => {
            const certificado = await prisma.certificado.findUnique({
                where: { id: idCertificado },
                include: {
                    estudiante: {
                        include: {
                            programa: {
                                include: {
                                    facultad: true
                                }
                            },
                            perfil_estudiante: true
                        }
                    },
                    convocatoria: {
                        include: {
                            categoria: true,
                            programa: {
                                include: {
                                    facultad: true
                                }
                            }
                        }
                    },
                    emisor: {
                        select: {
                            primer_nombre: true,
                            primer_apellido: true,
                            correo: true
                        }
                    }
                }
            });

            if (!certificado) {
                throw new Error('Certificado no encontrado');
            }

            // Obtener URL base de forma segura (fallback a localhost en dev)
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'http://localhost:3000';
            const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
            const urlValidacion = `${cleanBaseUrl}/validar-certificado/${certificado.codigo_verificacion}`;

            // Generar QR
            const qrCodeDataURL = await QRCode.toDataURL(
                urlValidacion,
                {
                    width: 150,
                    margin: 2,
                    color: {
                        dark: '#8B1E1E',
                        light: '#FFFFFF'
                    }
                }
            );

            // Crear PDF con diseño profesional de diploma
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            // Colores institucionales y de diploma
            const colors = {
                primary: '#8B1E1E',   // Rojo UCP
                gold: '#B8860B',      // DarkGoldenRod
                goldLight: '#DAA520', // GoldenRod
                text: '#1a1a1a',
                slate: '#64748b'
            };

            // 1. Fondo crema muy suave para estilo papel diploma
            pdf.setFillColor('#FFFDF5');
            pdf.rect(0, 0, 297, 210, 'F');

            // 2. Triple Borde Ornamental
            // Borde exterior grueso (Rojo Institucional)
            pdf.setDrawColor(colors.primary);
            pdf.setLineWidth(1.5);
            pdf.rect(8, 8, 281, 194);

            // Borde medio fino (Dorado)
            pdf.setDrawColor(colors.gold);
            pdf.setLineWidth(0.5);
            pdf.rect(10, 10, 277, 190);

            // Borde interior con esquinas decoradas
            pdf.setDrawColor(colors.goldLight);
            pdf.setLineWidth(0.8);
            pdf.rect(15, 15, 267, 180);

            // Adornos en las esquinas (Cruces decorativas)
            const corners = [
                [15, 15], [282, 15], [15, 195], [282, 195]
            ];
            corners.forEach(([x, y]) => {
                pdf.setDrawColor(colors.primary);
                pdf.setLineWidth(1);
                pdf.line(x - 3, y, x + 3, y);
                pdf.line(x, y - 3, x, y + 3);
            });

            // 3. Marca de agua central (UCP)
            pdf.setTextColor(235, 235, 235);
            pdf.setFontSize(100);
            pdf.setFont('helvetica', 'bold');
            pdf.text('UCP', 148.5, 105, { align: 'center', angle: 45 });

            // 4. Encabezado - Logo y Universidad
            try {
                const logoPath = path.join(process.cwd(), 'public', 'uploads', 'logo-ucp.png');
                if (fs.existsSync(logoPath)) {
                    const logoData = fs.readFileSync(logoPath).toString('base64');
                    pdf.addImage(`data:image/png;base64,${logoData}`, 'PNG', 25, 16, 32, 16);
                }
            } catch (e) {
                console.error('No se pudo cargar el logo para el PDF', e);
            }

            pdf.setFontSize(22);
            pdf.setTextColor(colors.primary);
            pdf.setFont('helvetica', 'bold');
            pdf.text('UNIVERSIDAD CATÓLICA DE PEREIRA', 148.5, 35, { align: 'center' });

            pdf.setFontSize(14);
            pdf.setTextColor(colors.text);
            pdf.setFont('helvetica', 'bold');
            pdf.text('BIENESTAR UNIVERSITARIO - SERVICIO SOCIAL', 148.5, 42, { align: 'center' });

            // Línea divisora elegante corta
            pdf.setDrawColor(colors.gold);
            pdf.setLineWidth(0.5);
            pdf.line(100, 48, 197, 48);

            // 5. Título del Diploma
            pdf.setFontSize(32);
            pdf.setTextColor(colors.primary);
            pdf.setFont('helvetica', 'bold');
            pdf.text('CERTIFICADO DE EXCELENCIA', 148.5, 60, { align: 'center' });

            pdf.setFontSize(16);
            pdf.setTextColor(colors.text);
            pdf.setFont('helvetica', 'italic');
            pdf.text('Se otorga la presente distinción a:', 148.5, 73, { align: 'center' });

            // 6. Nombre del Estudiante (Grande y Elegante)
            pdf.setFontSize(26);
            pdf.setTextColor(colors.text);
            pdf.setFont('helvetica', 'bold');
            const nombreCompletoRaw = `${certificado.estudiante.primer_nombre} ${certificado.estudiante.segundo_nombre || ''} ${certificado.estudiante.primer_apellido} ${certificado.estudiante.segundo_apellido || ''}`;
            const nombreCompleto = nombreCompletoRaw.replace(/\s+/g, ' ').trim();
            pdf.text(nombreCompleto.toUpperCase(), 148.5, 90, { align: 'center' });

            // Identificación
            pdf.setFontSize(12);
            pdf.setTextColor(colors.slate);
            pdf.setFont('helvetica', 'normal');
            pdf.text(`Identificado(a) con documento No. ${certificado.estudiante.numero_documento}`, 148.5, 97, { align: 'center' });

            // 7. Texto de acreditación
            pdf.setFontSize(14);
            pdf.setTextColor(colors.text);
            pdf.setFont('helvetica', 'normal');
            const mainText = `Por haber cumplido satisfactoriamente con la totalidad de ${Number(certificado.total_horas)} horas de SERVICIO SOCIAL, desarrolladas bajo las normativas institucionales y demostrando un alto compromiso con la sociedad.`;
            const splitText = pdf.splitTextToSize(mainText, 220);
            pdf.text(splitText, 148.5, 110, { align: 'center' });

            // Detalles del programa
            pdf.setFontSize(12);
            pdf.setTextColor(colors.text);
            pdf.setFont('helvetica', 'bold');
            pdf.text(`PROGRAMA: ${certificado.estudiante.programa?.nombre || 'N/A'}`, 148.5, 130, { align: 'center' });
            pdf.setFont('helvetica', 'normal');
            pdf.text(`Facultad: ${certificado.estudiante.programa?.facultad?.nombre || 'N/A'}`, 148.5, 136, { align: 'center' });

            // 8. Sección de Firmas y Sello QR
            // Área de firma (Izquierda)
            pdf.setDrawColor(colors.text);
            pdf.setLineWidth(0.3);
            pdf.line(40, 165, 110, 165);

            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'bold');
            pdf.text(`${certificado.emisor.primer_nombre} ${certificado.emisor.primer_apellido}`, 75, 170, { align: 'center' });
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            pdf.text('Coordinador de Servicio Social', 75, 175, { align: 'center' });

            // Sello QR (Derecha)
            const qrX = 215;
            const qrY = 145;
            pdf.setFillColor(colors.goldLight);
            pdf.circle(qrX + 22, qrY + 22, 28, 'F');
            pdf.setFillColor('#FFFFFF');
            pdf.circle(qrX + 22, qrY + 22, 27.2, 'F');

            pdf.addImage(qrCodeDataURL, 'PNG', qrX + 5, qrY + 5, 34, 34);

            pdf.setFontSize(8);
            pdf.setTextColor(colors.slate);
            pdf.text('VERIFICACIÓN DIGITAL', qrX + 22, qrY + 42, { align: 'center' });
            pdf.setFontSize(7);
            pdf.text(certificado.codigo_verificacion, qrX + 22, qrY + 45, { align: 'center' });

            // 9. Fecha y Pie de página
            pdf.setFontSize(10);
            pdf.setTextColor(colors.text);
            let fechaEmision = 'Fecha no disponible';
            if (certificado.emitido_en) {
                try {
                    fechaEmision = new Date(certificado.emitido_en).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    });
                } catch (error) {
                    fechaEmision = 'Fecha inválida';
                }
            }
            pdf.text(`Pereira, Risaralda - Colombia, ${fechaEmision}`, 148.5, 192, { align: 'center' });

            pdf.setFontSize(8);
            pdf.setTextColor(colors.slate);
            pdf.text('Este documento es una representación digital válida de la certificación institucional.', 148.5, 197, { align: 'center' });

            // Retornar Base64 puro (sin data: URI prefix)
            const pdfBase64 = pdf.output('datauristring').split(',')[1];
            return pdfBase64;
        }, 'Error al generar PDF del certificado');
    } catch (error) {
        console.error('Error en generarPDFCertificado:', error);
        throw error;
    }
}
