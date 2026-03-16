import fs from 'fs';
import path from 'path';
import { generarPDFCertificado } from './src/app/administrador/certificados/actions';

async function testPDFGeneration() {
  try {
    console.log('🔄 Generando PDF de prueba...');
    
    // ID del certificado del Estudiante A
    const certificadoId = '7c170429-7454-4a17-88da-91ccb962a4ad';
    
    // Generar PDF (esto devuelve Base64)
    const pdfBase64 = await generarPDFCertificado(certificadoId);
    
    console.log('✅ PDF generado como Base64');
    console.log(`📏 Tamaño del Base64: ${pdfBase64.length} caracteres`);
    
    // Convertir a Buffer
    const pdfBuffer = Buffer.from(pdfBase64, 'base64');
    
    console.log(`📏 Tamaño del Buffer: ${pdfBuffer.length} bytes`);
    
    // Verificar que sea un PDF válido (debe empezar con %PDF)
    const header = pdfBuffer.slice(0, 4).toString();
    console.log(`🔍 Cabecera del archivo: ${header}`);
    
    if (header === '%PDF') {
      console.log('✅ El PDF tiene la cabecera correcta');
      
      // Guardar archivo para verificar
      const filePath = path.join(__dirname, 'test_certificado.pdf');
      fs.writeFileSync(filePath, pdfBuffer);
      console.log(`💾 PDF guardado en: ${filePath}`);
      console.log('📂 Abre el archivo manualmente para verificar que no esté corrupto');
    } else {
      console.log('❌ El PDF no tiene la cabecera correcta - está corrupto');
    }
    
  } catch (error) {
    console.error('❌ Error al generar PDF:', error);
  }
}

testPDFGeneration();
