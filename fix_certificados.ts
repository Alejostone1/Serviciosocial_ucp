import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixCertificados() {
  try {
    console.log('Actualizando certificados para eliminación de URLs físicas...');
    
    const result = await prisma.certificado.updateMany({
      where: {
        url_pdf: {
          not: ''
        }
      },
      data: {
        url_pdf: null as any
      }
    });

    console.log(`✅ ${result.count} certificados actualizados - URLs físicas eliminadas`);
    
    // Verificar resultado
    const certificados = await prisma.certificado.findMany({
      select: {
        id: true,
        codigo_verificacion: true,
        url_pdf: true,
        estudiante: {
          select: {
            primer_nombre: true,
            primer_apellido: true
          }
        }
      }
    });

    console.log('\n=== ESTADO ACTUALIZADO ===');
    certificados.forEach((cert) => {
      console.log(`📜 ${cert.estudiante.primer_nombre} ${cert.estudiante.primer_apellido}`);
      console.log(`   Código: ${cert.codigo_verificacion}`);
      console.log(`   URL PDF: ${cert.url_pdf || 'NULL (✅ dinámica)'}`);
      console.log('');
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixCertificados();
