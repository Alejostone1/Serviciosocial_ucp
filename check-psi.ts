import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPSI() {
  try {
    // Verificar si el programa PSI existe
    const psi = await prisma.programa.findUnique({
      where: { codigo: 'PSI' },
      include: {
        facultad: { select: { nombre: true } },
        _count: { select: { usuarios: true } }
      }
    });

    console.log('=== VERIFICACIÓN PROGRAMA PSI ===');
    if (psi) {
      console.log('✅ Programa PSI encontrado:');
      console.log('   Nombre:', psi.nombre);
      console.log('   Código:', psi.codigo);
      console.log('   Estado:', psi.esta_activo ? 'ACTIVO' : 'INACTIVO');
      console.log('   Facultad:', psi.facultad.nombre);
      console.log('   Usuarios vinculados:', psi._count.usuarios);
    } else {
      console.log('❌ Programa PSI NO encontrado');
    }

    // Verificar todos los programas de la facultad FCHSE
    console.log('\n=== TODOS LOS PROGRAMAS FCHSE ===');
    const programasFCHSE = await prisma.programa.findMany({
      where: {
        facultad: { nombre: 'Facultad de Ciencias Humanas, Sociales y de la Educación' }
      },
      select: {
        nombre: true,
        codigo: true,
        esta_activo: true,
        _count: { select: { usuarios: true } }
      }
    });

    programasFCHSE.forEach(prog => {
      console.log(`${prog.esta_activo ? '✅' : '❌'} ${prog.codigo} - ${prog.nombre} (${prog._count.usuarios} usuarios)`);
    });

    // Verificar estudiantes totales
    console.log('\n=== ESTUDIANTES TOTALES ===');
    const estudiantes = await prisma.usuario.count({
      where: { rol: 'ESTUDIANTE' }
    });
    console.log(`Total estudiantes en el sistema: ${estudiantes}`);

    // Mostrar estudiantes con sus programas
    console.log('\n=== ESTUDIANTES Y SUS PROGRAMAS ===');
    const estudiantesConPrograma = await prisma.usuario.findMany({
      where: { rol: 'ESTUDIANTE' },
      select: {
        primer_nombre: true,
        primer_apellido: true,
        programa: { select: { nombre: true, codigo: true } }
      }
    });

    estudiantesConPrograma.forEach(est => {
      console.log(`${est.primer_nombre} ${est.primer_apellido} → ${est.programa?.codigo} (${est.programa?.nombre})`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPSI();
