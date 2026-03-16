import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPSIUsers() {
  try {
    console.log('=== USUARIOS VINCULADOS A PSI ===');
    
    // Obtener todos los usuarios vinculados al programa PSI
    const usuariosPSI = await prisma.usuario.findMany({
      where: { 
        programa: { codigo: 'PSI' }
      },
      select: {
        primer_nombre: true,
        primer_apellido: true,
        rol: true,
        correo: true,
        programa: { select: { nombre: true, codigo: true } }
      }
    });

    console.log(`Total usuarios en PSI: ${usuariosPSI.length}`);
    
    usuariosPSI.forEach(usuario => {
      console.log(`${usuario.rol}: ${usuario.primer_nombre} ${usuario.primer_apellido} (${usuario.correo})`);
    });

    console.log('\n=== VERIFICACIÓN DEL CONTEO CORREGIDO ===');
    
    // Verificar el conteo con el filtro corregido (solo estudiantes)
    const estudiantesPSI = await prisma.usuario.count({
      where: { 
        rol: 'ESTUDIANTE',
        programa: { codigo: 'PSI' }
      }
    });

    console.log(`Estudiantes en PSI (conteo corregido): ${estudiantesPSI}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPSIUsers();
