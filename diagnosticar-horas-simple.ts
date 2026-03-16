import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function diagnosticarHoras() {
  try {
    console.log('\n=== DIAGNÓSTICO DE HORAS POR CONVOCATORIA ===\n');
    
    // Obtener todas las convocatorias
    const convocatorias = await prisma.convocatoria.findMany({
      include: {
        actividades: true,
        postulaciones: {
          where: {
            estado: 'ACEPTADA'
          },
          include: {
            estudiante: true
          }
        }
      }
    });

    console.log(`Total convocatorias: ${convocatorias.length}\n`);

    for (const convocatoria of convocatorias) {
      console.log(`\n📋 CONVOCATORIA: ${convocatoria.titulo}`);
      console.log(`   Estado: ${convocatoria.estado}`);
      console.log(`   Horas totales ofrecidas: ${convocatoria.horas_totales_ofrecidas}h`);
      console.log(`   Total actividades: ${convocatoria.actividades.length}`);
      console.log(`   Postulaciones aceptadas: ${convocatoria.postulaciones.length}`);

      // Sumar horas estimadas de actividades
      const horasActividades = convocatoria.actividades.reduce((sum, act) => sum + Number(act.horas_estimadas), 0);
      console.log(`   🔢 Suma horas de actividades: ${horasActividades}h`);

      // Obtener reportes de horas de esta convocatoria
      const reportes = await prisma.reporteHoras.findMany({
        where: {
          id_convocatoria: convocatoria.id,
          estado: 'APROBADO'
        }
      });

      const horasReportadas = reportes.reduce((sum, reporte) => sum + Number(reporte.horas_reportadas), 0);
      console.log(`   ⏱️  Total horas reportadas (aprobadas): ${horasReportadas}h`);

      // Verificar inconsistencias
      const horasOfrecidas = Number(convocatoria.horas_totales_ofrecidas) || 0;
      const diferencia = horasReportadas - horasOfrecidas;
      
      console.log(`   📊 Diferencia: ${diferencia > 0 ? '+' : ''}${diferencia}h`);
      
      if (diferencia > 0) {
        console.log(`   ⚠️  ¡EXCESO! Se reportaron ${diferencia}h más de las ofrecidas`);
        console.log(`   🔥 ¡PROBLEMA! Esto debe ser corregido inmediatamente`);
      } else if (diferencia < 0) {
        console.log(`   ✅ OK: Faltan ${Math.abs(diferencia)}h por completar`);
      } else {
        console.log(`   ✅ PERFECTO: Exactamente las horas ofrecidas`);
      }

      // Mostrar detalle de actividades
      console.log(`   📄 Actividades (${convocatoria.actividades.length}):`);
      convocatoria.actividades.forEach((act, idx) => {
        const reportesCount = reportes.filter(rep => rep.id_actividad === act.id).length;
        console.log(`      ${idx + 1}. ${act.nombre} (${act.horas_estimadas}h) - ${reportesCount} reportes`);
      });

      // Mostrar detalle de estudiantes y sus horas
      if (convocatoria.postulaciones.length > 0) {
        console.log(`   👥 Estudiantes aceptados:`);
        for (const postulacion of convocatoria.postulaciones) {
          const reportesEstudiante = reportes.filter(rep => rep.id_estudiante === postulacion.id_estudiante);
          const horasEstudiante = reportesEstudiante.reduce((sum, rep) => sum + Number(rep.horas_reportadas), 0);
          console.log(`      • ${postulacion.estudiante.primer_nombre}: ${horasEstudiante}h (${reportesEstudiante.length} reportes)`);
        }
      }
    }

    console.log('\n=== ANÁLISIS DE PROBLEMAS ===');
    
    // Buscar convocatorias con problemas
    const convocatoriasConProblemas: any[] = [];
    
    for (const convocatoria of convocatorias) {
      const reportes = await prisma.reporteHoras.findMany({
        where: {
          id_convocatoria: convocatoria.id,
          estado: 'APROBADO'
        }
      });
      
      const horasReportadas = reportes.reduce((sum, reporte) => sum + Number(reporte.horas_reportadas), 0);
      const horasOfrecidas = Number(convocatoria.horas_totales_ofrecidas) || 0;
      
      if (horasReportadas > horasOfrecidas) {
        convocatoriasConProblemas.push({
          convocatoria: convocatoria.titulo,
          reportadas: horasReportadas,
          ofrecidas: horasOfrecidas,
          diferencia: horasReportadas - horasOfrecidas
        });
      }
    }

    if (convocatoriasConProblemas.length > 0) {
      console.log(`\n⚠️  ${convocatoriasConProblemas.length} convocatorias con exceso de horas:`);
      convocatoriasConProblemas.forEach(problem => {
        console.log(`   - ${problem.convocatoria}: ${problem.reportadas}h reportadas vs ${problem.ofrecidas}h ofrecidas (exceso: ${problem.diferencia}h)`);
      });
      console.log(`\n🔧 SOLUCIÓN: Se debe implementar validación para no permitir reportar más horas de las ofrecidas por convocatoria`);
    } else {
      console.log('\n✅ No hay convocatorias con exceso de horas');
    }

    console.log('\n=== RECOMENDACIONES ===');
    console.log('1. Implementar validación en el action de reportar horas');
    console.log('2. Verificar horas totales por convocatoria antes de aprobar reportes');
    console.log('3. Cerrar convocatoria cuando se completen las horas ofrecidas');
    console.log('4. Generar certificado automáticamente al completar horas');

  } catch (error) {
    console.error('Error en diagnóstico:', error);
  } finally {
    await prisma.$disconnect();
  }
}

diagnosticarHoras();
