import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCertificados() {
  try {
    const certificados = await prisma.certificado.findMany({
      include: {
        estudiante: {
          select: {
            primer_nombre: true,
            primer_apellido: true,
            correo: true
          }
        },
        convocatoria: {
          select: {
            titulo: true
          }
        }
      },
      orderBy: { emitido_en: 'desc' }
    });

    console.log('=== CERTIFICADOS EN BASE DE DATOS ===');
    certificados.forEach((cert, index) => {
      console.log(`\n${index + 1}. Certificado ID: ${cert.id}`);
      console.log(`   Estudiante: ${cert.estudiante.primer_nombre} ${cert.estudiante.primer_apellido}`);
      console.log(`   Convocatoria: ${cert.convocatoria?.titulo || 'General'}`);
      console.log(`   Horas: ${cert.total_horas}`);
      console.log(`   Código: ${cert.codigo_verificacion}`);
      console.log(`   Emitido: ${cert.emitido_en.toLocaleDateString()}`);
      console.log(`   URL PDF: ${cert.url_pdf || 'NULL (generación dinámica)'}`);
    });

    console.log(`\nTotal certificados: ${certificados.length}`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCertificados();
