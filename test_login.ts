import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function testLogin() {
  try {
    // Obtener credenciales del estudiante A
    const estudiante = await prisma.usuario.findFirst({
      where: { 
        rol: 'ESTUDIANTE',
        primer_nombre: 'Alejandro'
      },
      include: {
        perfil_estudiante: true
      }
    });

    if (!estudiante) {
      console.log('❌ No se encontró al estudiante Alejandro');
      return;
    }

    console.log('=== CREDENCIALES ESTUDIANTE A ===');
    console.log(`📧 Correo: ${estudiante.correo}`);
    console.log(`👤 Nombre: ${estudiante.primer_nombre} ${estudiante.primer_apellido}`);
    console.log(`🎓 Programa: ${estudiante.perfil_estudiante?.codigo_estudiantil || 'N/A'}`);
    console.log(`⏰ Horas acumuladas: ${estudiante.perfil_estudiante?.horas_acumuladas || 0}`);
    console.log(`🔑 Contraseña: Ucpservicio123 (por defecto del seed)`);
    
    // Verificar sus certificados
    const certificados = await prisma.certificado.findMany({
      where: { id_estudiante: estudiante.id },
      include: {
        convocatoria: {
          select: { titulo: true }
        }
      }
    });

    console.log(`\n=== CERTIFICADOS DISPONIBLES (${certificados.length}) ===`);
    certificados.forEach((cert, index) => {
      console.log(`${index + 1}. ${cert.convocatoria?.titulo || 'General'}`);
      console.log(`   📄 ID: ${cert.id}`);
      console.log(`   ⏱️  Horas: ${cert.total_horas}`);
      console.log(`   🔗 Descarga: http://localhost:3000/api/certificado/${cert.id}/generar-pdf`);
      console.log('');
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();
