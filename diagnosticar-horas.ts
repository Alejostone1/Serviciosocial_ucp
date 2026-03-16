import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function diagnosticarHoras() {
  try {
    console.log('\n=== DIAGNÓSTICO DE HORAS POR CONVOCATORIA ===\n');
    
    // Obtener todas las convocatorias con sus actividades y reportes
    const convocatorias = await prisma.convocatoria.findMany({
      include: {
        actividades: {
          include: {
            _count: {
              select: {
                reportesHoras: true
              }
            }
          }
        },
        postulaciones: {
          where: {
            estado: 'ACEPTADA'
          },
          include: {
            reportesHoras: true
          }
        },
        _count: {
          select: {
            actividades: true,
            postulaciones: true
          }
        }
      }
    });

    console.log(`Total convocatorias: ${convocatorias.length}\n`);

    for (const convocatoria of convocatorias) {
      console.log(`\n📋 CONVOCATORIA: ${convocatoria.titulo}`);
      console.log(`   Estado: ${convocatoria.estado}`);
      console.log(`   Horas totales ofrecidas: ${convocatoria.horas_totales_ofrecidas}h`);
      console.log(`   Total actividades: ${convocatoria._count.actividades}`);
      console.log(`   Postulaciones aceptadas: ${convocatoria._count.postulaciones}`);

      // Sumar horas estimadas de actividades
      const horasActividades = convocatoria.actividades.reduce((sum, act) => sum + act.horas_estimadas, 0);
      console.log(`   🔢 Suma horas de actividades: ${horasActividades}h`);

      // Sumar horas reportadas por estudiantes aceptados
      let horasReportadas = 0;
      for (const postulacion of convocatoria.postulaciones) {
        const horasEstudiante = postulacion.reportesHoras.reduce((sum, reporte) => sum + reporte.horas_reportadas, 0);
        horasReportadas += horasEstudiante;
        console.log(`      👤 ${postulacion.estudiante.primer_nombre}: ${horasEstudiante}h`);
      }
      console.log(`   ⏱️  Total horas reportadas: ${horasReportadas}h`);

      // Verificar inconsistencias
      const horasOfrecidas = Number(convocatoria.horas_totales_ofrecidas) || 0;
      const diferencia = horasReportadas - horasOfrecidas;
      
      console.log(`   📊 Diferencia: ${diferencia > 0 ? '+' : ''}${diferencia}h`);
      
      if (diferencia > 0) {
        console.log(`   ⚠️  ¡EXCESO! Se reportaron ${diferencia}h más de las ofrecidas`);
      } else if (diferencia < 0) {
        console.log(`   ✅ OK: Faltan ${Math.abs(diferencia)}h por completar`);
      } else {
        console.log(`   ✅ PERFECTO: Exactamente las horas ofrecidas`);
      }

      // Mostrar detalle de actividades
      console.log(`   📄 Actividades (${convocatoria.actividades.length}):`);
      convocatoria.actividades.forEach((act, idx) => {
        const reportesCount = act._count.reportesHoras;
        console.log(`      ${idx + 1}. ${act.nombre} (${act.horas_estimadas}h) - ${reportesCount} reportes`);
      });
    }

    console.log('\n=== ANÁLISIS DE PROBLEMAS ===');
    
    // Buscar convocatorias con problemas
    const convocatoriasProblema = convocatorias.filter(conv => {
      const horasReportadas = conv.postulaciones.reduce((sum, post) => 
        sum + post.reportesHoras.reduce((sum, rep) => sum + rep.horas_reportadas, 0), 0);
      const horasOfrecidas = Number(conv.horas_totales_ofrecidas) || 0;
      return horasReportadas > horasOfrecidas;
    });

    if (convocatoriasProblema.length > 0) {
      console.log(`\n⚠️  ${convocatoriasProblema.length} convocatorias con exceso de horas:`);
      convocatoriasProblema.forEach(conv => {
        const horasReportadas = conv.postulaciones.reduce((sum, post) => 
          sum + post.reportesHoras.reduce((sum, rep) => sum + rep.horas_reportadas, 0), 0);
        const horasOfrecidas = Number(conv.horas_totales_ofrecidas) || 0;
        console.log(`   - ${conv.titulo}: ${horasReportadas}h reportadas vs ${horasOfrecidas}h ofrecidas`);
      });
    } else {
      console.log('\n✅ No hay convocatorias con exceso de horas');
    }

  } catch (error) {
    console.error('Error en diagnóstico:', error);
  } finally {
    await prisma.$disconnect();
  }
}

diagnosticarHoras();
