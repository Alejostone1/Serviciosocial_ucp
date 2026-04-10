import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createMultipleTestNews() {
  try {
    const noticias = [
      {
        titulo: 'Convocatoria a Becas Académicas 2024',
        slug: 'convocatoria-becas-academicas-2024',
        resumen: 'La Universidad Católica de Pereira abre la convocatoria para becas académicas del primer semestre de 2024.',
        contenido: `# Convocatoria a Becas Académicas 2024

La Dirección de Bienestar Institucional convoca a todos los estudiantes de la Universidad Católica de Pereira a participar en el proceso de selección de becas académicas para el primer semestre de 2024.

## Tipos de Becas Disponibles

### 📚 Beca de Excelencia Académica
- **Requisitos**: Promedio acumulado mínimo de 4.0
- **Beneficio**: 50% de descuento en matrícula
- **Documentos**: Certificado de notas, carta de motivación

### 💰 Beca por Méritos Deportivos
- **Requisitos**: Representación deportiva a nivel interuniversitario
- **Beneficio**: 30% de descuento en matrícula
- **Documentos**: Certificados deportivos, cartas de recomendación

### 🤝 Beca de Solidaridad
- **Requisitos**: Situación económica comprobada
- **Beneficio**: Hasta 70% de descuento en matrícula
- **Documentos**: Certificado de ingresos, declaración jurada

## Fechas Importantes

- **Inicio de convocatoria**: 15 de marzo de 2024
- **Cierre de inscripciones**: 30 de abril de 2024
- **Publicación de resultados**: 15 de mayo de 2024

## ¿Cómo Postular?

1. Descargar el formulario oficial
2. Preparar la documentación requerida
3. Presentar la solicitud en Bienestar Institucional
4. Esperar los resultados del comité evaluador

## Información Adicional

Para mayor información, comunicarse con:
- **Email**: becas@ucp.edu.co
- **Teléfono**: (6) 321 456 7890
- **Dirección**: Oficina 201, Bloque Administrativo

¡No pierdas esta oportunidad de obtener apoyo económico para tus estudios!`,
        autor: 'Dirección de Bienestar Institucional',
        publicada: true,
        fecha_publicacion: new Date('2024-03-10T09:00:00Z'),
      },
      {
        titulo: 'Semana Cultural 2024: Arte y Tradición',
        slug: 'semana-cultural-2024-arte-tradicion',
        resumen: 'La UCP celebra su tradicional semana cultural con actividades artísticas, musicales y deportivas para toda la comunidad.',
        contenido: `# Semana Cultural 2024: Arte y Tradición

La Universidad Católica de Pereira se complace en presentar la edición 2024 de su tradicional Semana Cultural, un espacio para celebrar el talento artístico y la diversidad cultural de nuestra comunidad.

## 🎭 Actividades Programadas

### Lunes 20 de marzo - Inauguración
- **9:00 AM**: Ceremonia inaugural en Auditorio Principal
- **10:00 AM**: Exposición de arte estudiantil
- **2:00 PM**: Concierto de música tradicional

### Martes 21 de marzo - Día del Talento
- **10:00 AM**: Festival de bandas estudiantiles
- **2:00 PM**: Concurso de poesía y narrativa
- **6:00 PM**: Noche de teatro universitario

### Miércoles 22 de marzo - Deporte y Cultura
- **8:00 AM**: Torneo interfacultades de fútbol
- **2:00 PM**: Exhibición de danzas folclóricas
- **7:00 PM**: Concierto sinfónico

### Jueves 23 de marzo - Innovación Creativa
- **9:00 AM**: Feria de emprendimiento creativo
- **11:00 AM**: Taller de graffiti urbano
- **3:00 PM**: Cine-foro: "El arte como transformación social"

### Viernes 24 de marzo - Clausura
- **10:00 AM**: Desfile cultural por las instalaciones
- **12:00 PM**: Almuerzo comunitario
- **2:00 PM**: Acto de clausura y premiación

## 🏆 Premios y Reconocimientos

- **Mejor obra de arte**: $500.000
- **Mejor banda musical**: $300.000
- **Mejor presentación cultural**: $200.000
- **Participación activa**: Certificados oficiales

## 📍 Sedes y Horarios

Todas las actividades se realizarán en:
- **Auditorio Principal**: Actos ceremoniales
- **Plaza Central**: Actividades al aire libre
- **Gimnasio Cubierto**: Eventos deportivos
- **Salones de clase**: Talleres y workshops

## 🎟️ Entradas y Registro

- **Estudiantes UCP**: Gratuito con carné
- **Personal UCP**: Gratuito con identificación
- **Público general**: $10.000 por evento
- **Abono completo**: $50.000 todos los eventos

¡Participa y celebra con nosotros la riqueza cultural de nuestra universidad!`,
        autor: 'Consejo Estudiantil UCP',
        publicada: true,
        fecha_publicacion: new Date('2024-03-15T08:00:00Z'),
      },
      {
        titulo: 'Nuevo Laboratorio de Robótica y Automatización',
        slug: 'nuevo-laboratorio-robotica-automatizacion',
        resumen: 'La Facultad de Ingeniería inaugura un moderno laboratorio equipado con tecnología de punta para el aprendizaje de robótica.',
        contenido: `# Nuevo Laboratorio de Robótica y Automatización

La Facultad de Ingeniería de la Universidad Católica de Pereira inaugura su nuevo Laboratorio de Robótica y Automatización, un espacio diseñado para formar a los ingenieros del futuro con tecnología de vanguardia.

## 🤖 Características del Laboratorio

### Equipamiento de Última Generación
- **Robots industriales KUKA**: 6 unidades para práctica avanzada
- **Sistemas de visión artificial**: Cámaras y software de procesamiento
- **Impresoras 3D industriales**: 4 equipos de alta precisión
- **Bancos de trabajo automatizados**: 10 estaciones completas
- **Software de simulación**: MATLAB, SolidWorks, RobotStudio

### Áreas de Especialización
- **Robótica industrial**: Manipuladores y sistemas de manufactura
- **Visión por computadora**: Procesamiento de imágenes y reconocimiento
- **Automatización industrial**: PLCs y sistemas de control
- **Robótica móvil**: Drones y vehículos autónomos
- **Inteligencia artificial**: Machine learning y redes neuronales

## 🎓 Beneficios para los Estudiantes

### Aprendizaje Práctico
- **Proyectos reales**: Colaboración con empresas locales
- **Certificaciones internacionales**: Preparación para exámenes de robótica
- **Investigación aplicada**: Participación en proyectos de innovación
- **Competencias nacionales**: Preparación para olimpiadas de robótica

### Desarrollo de Competencias
- **Pensamiento crítico**: Resolución de problemas complejos
- **Trabajo en equipo**: Proyectos colaborativos multidisciplinarios
- **Innovación**: Diseño y creación de soluciones originales
- **Liderazgo**: Dirección de proyectos técnicos

## 🏭 Convenios Industriales

Hemos establecido alianzas estratégicas con:

- **KUKA Robotics**: Formación y certificación oficial
- **Siemens**: Equipamiento de automatización industrial
- **ABB**: Sistemas de robótica colaborativa
- **Fanuc**: Programación avanzada de robots
- **Microsoft**: Software de inteligencia artificial

## 📚 Programas Académicos

### Cursos Disponibles
- **Robótica Industrial**: Manipuladores y cinemática
- **Visión por Computadora**: Procesamiento digital de imágenes
- **Automatización**: Sistemas de control y PLCs
- **IA Aplicada**: Machine learning para robótica
- **Diseño Mecánico**: CAD/CAM para sistemas robóticos

### Proyectos Destacados
- **Línea de ensamble automatizada**: Simulación completa
- **Robot de servicio al cliente**: Atención automatizada
- **Sistema de inspección visual**: Control de calidad industrial
- **Drone de inspección**: Mantenimiento predictivo

## 🚀 Impacto Regional

Este laboratorio posicionará a la UCP como:
- **Líder regional** en formación de ingenieros especializados
- **Centro de innovación** para la industria local
- **Hub tecnológico** para el desarrollo regional
- **Puente academia-industria** para el progreso conjunto

## 📈 Resultados Esperados

- **50 estudiantes** beneficiados por semestre
- **20 proyectos** de investigación aplicada anualmente
- **10 convenios** con empresas del sector
- **5 competencias** nacionales ganadas en 2 años

¡El futuro de la ingeniería robótica comienza aquí en la UCP!`,
        autor: 'Facultad de Ingeniería',
        publicada: true,
        fecha_publicacion: new Date('2024-03-18T10:00:00Z'),
      }
    ];

    for (const noticiaData of noticias) {
      const noticia = await prisma.noticia.create({
        data: noticiaData,
      });
      console.log(`Noticia creada: ${noticia.titulo}`);
      console.log(`ID: ${noticia.id}`);
      console.log(`Slug: ${noticia.slug}`);
      console.log('---');
    }

    console.log('¡Todas las noticias de prueba han sido creadas!');
  } catch (error) {
    console.error('Error al crear noticias de prueba:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createMultipleTestNews();
