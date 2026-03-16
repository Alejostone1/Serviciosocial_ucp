import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugProgramas() {
  try {
    console.log('=== DEBUG: getProgramas() ===');
    
    // Simular exactamente la misma consulta que getProgramas()
    const programas = await prisma.programa.findMany({
      include: {
        facultad: { select: { nombre: true } },
        _count: { 
          select: { 
            usuarios: {
              where: {
                rol: 'ESTUDIANTE'
              }
            }, 
            convocatorias: true 
          } 
        },
      },
      orderBy: { nombre: 'asc' },
    });

    console.log(`Total programas encontrados: ${programas.length}`);
    
    programas.forEach((prog, index) => {
      console.log(`${index + 1}. ${prog.codigo} - ${prog.nombre}`);
      console.log(`   Facultad: ${prog.facultad.nombre}`);
      console.log(`   Estado: ${prog.esta_activo ? 'ACTIVO' : 'INACTIVO'}`);
      console.log(`   Estudiantes: ${prog._count.usuarios}`);
      console.log(`   Convocatorias: ${prog._count.convocatorias}`);
      console.log('');
    });

    // Verificar específicamente PSI
    const psi = programas.find(p => p.codigo === 'PSI');
    if (psi) {
      console.log('✅ PSI encontrado en la lista');
    } else {
      console.log('❌ PSI NO encontrado en la lista');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugProgramas();
