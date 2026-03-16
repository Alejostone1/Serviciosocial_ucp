import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verificarActividades() {
  try {
    console.log('\n=== VERIFICACIÓN DE ACTIVIDADES POR CONVOCATORIA ===\n');
    
    // Obtener la convocatoria "Tutorías de Matemáticas"
    const convocatoria = await prisma.convocatoria.findFirst({
      where: { titulo: 'Tutorías de Matemáticas para Colegios Públicos' },
      include: {
        actividades: {
          select: {
            id: true,
            nombre: true,
            horas_estimadas: true,
            id_convocatoria: true
          }
        }
      }
    });

    if (!convocatoria) {
      console.log('❌ No se encontró la convocatoria');
      return;
    }

    console.log(`📋 CONVOCATORIA: ${convocatoria.titulo}`);
    console.log(`   ID: ${convocatoria.id}`);
    console.log(`   Horas totales ofrecidas: ${convocatoria.horas_totales_ofrecidas}h`);
    console.log(`   Total actividades: ${convocatoria.actividades.length}\n`);

    // Verificar cada actividad
    let sumaHoras = 0;
    convocatoria.actividades.forEach((act, idx) => {
      console.log(`${idx + 1}. ACTIVIDAD: ${act.nombre}`);
      console.log(`   ID: ${act.id}`);
      console.log(`   Horas estimadas: ${act.horas_estimadas}h`);
      console.log(`   ID Convocatoria: ${act.id_convocatoria}`);
      console.log(`   ¿Coincide con convocatoria?: ${act.id_convocatoria === convocatoria.id ? '✅' : '❌'}`);
      
      sumaHoras += Number(act.horas_estimadas);
      console.log(`   Suma parcial: ${sumaHoras}h\n`);
    });

    console.log(`📊 RESUMEN:`);
    console.log(`   Suma de horas de actividades: ${sumaHoras}h`);
    console.log(`   Horas ofrecidas por convocatoria: ${convocatoria.horas_totales_ofrecidas}h`);
    console.log(`   ¿Coinciden?: ${sumaHoras === Number(convocatoria.horas_totales_ofrecidas) ? '✅' : '❌'}`);

    // Verificar si hay actividades duplicadas
    console.log(`\n🔍 VERIFICACIÓN DE DUPLICADOS:`);
    const actividadesDuplicadas = await prisma.actividad.groupBy({
      by: ['nombre'],
      where: {
        id_convocatoria: convocatoria.id
      },
      _count: {
        id: true
      }
    });

    console.log(`   Total grupos por nombre: ${actividadesDuplicadas.length}`);
    
    actividadesDuplicadas.forEach((grupo, idx) => {
      if (grupo._count.id > 1) {
        console.log(`   ⚠️  ACTIVIDAD DUPLICADA: "${grupo.nombre}" (${grupo._count.id} veces)`);
      } else {
        console.log(`   ✅ ${idx + 1}. "${grupo.nombre}" (${grupo._count.id} vez)`);
      }
    });

    // Verificar reportes de esta convocatoria
    console.log(`\n📋 VERIFICACIÓN DE REPORTES:`);
    const reportes = await prisma.reporteHoras.findMany({
      where: {
        id_convocatoria: convocatoria.id,
        estado: 'APROBADO'
      },
      include: {
        actividad: {
          select: {
            nombre: true,
            horas_estimadas: true
          }
        },
        estudiante: {
          select: {
            primer_nombre: true,
            primer_apellido: true
          }
        }
      }
    });

    console.log(`   Total reportes aprobados: ${reportes.length}`);
    
    let sumaReportes = 0;
    reportes.forEach((reporte, idx) => {
      console.log(`   ${idx + 1}. ${reporte.estudiante.primer_nombre} ${reporte.estudiante.primer_apellido}`);
      console.log(`      Actividad: ${reporte.actividad.nombre}`);
      console.log(`      Horas reportadas: ${reporte.horas_reportadas}h`);
      console.log(`      Horas estimadas: ${reporte.actividad.horas_estimadas}h`);
      
      sumaReportes += Number(reporte.horas_reportadas);
      console.log(`      Suma parcial: ${sumaReportes}h\n`);
    });

    console.log(`📊 TOTAL REPORTES: ${sumaReportes}h`);

  } catch (error) {
    console.error('Error en verificación:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarActividades();
