import { PrismaClient } from '@prisma/client';
import { slugify } from '../src/lib/utils';

const prisma = new PrismaClient();

const noticiasSeed = [
  {
    titulo: "Taller de Sensibilización Social 2025",
    resumen: "Aprende sobre las metodologías de intervención social que aplicamos en nuestras comunidades locales para maximizar el impacto social.",
    contenido: `El taller de sensibilización social 2025 está diseñado para estudiantes que desean profundizar en el entendimiento de las realidades sociales de nuestras comunidades.

Durante este taller, los participantes aprenderán:

- Metodologías de intervención social comunitaria
- Técnicas de diagnóstico participativo
- Estrategias de comunicación intercultural
- Herramientas de evaluación de impacto social
- Ética y responsabilidad social en proyectos comunitarios

El taller contará con expertos en trabajo social comunitario con más de 10 años de experiencia en proyectos de desarrollo local. Además, se realizarán visitas a comunidades donde se aplicarán los conocimientos adquiridos.

Fechas: 15-17 de marzo de 2025
Horario: 8:00 AM - 5:00 PM
Lugar: Campus UCP - Auditorio Principal
Cupos limitados: 30 estudiantes

Inscríbete a través de la plataforma de servicio social universitario.`,
    autor: "Dirección de Servicio Social",
    publicada: true,
    fecha_publicacion: new Date('2025-03-10'),
    imagenes: [
      {
        url_imagen: "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&auto=format&fit=crop&q=60",
        public_id_cloudinary: "noticia_taller_sensibilizacion_1",
        orden: 0
      },
      {
        url_imagen: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=60",
        public_id_cloudinary: "noticia_taller_sensibilizacion_2",
        orden: 1
      }
    ]
  },
  {
    titulo: "Programa 'UCP en tu Barrio'",
    resumen: "Se abren inscripciones para el proyecto de alfabetización digital en sectores vulnerables de Pereira. ¡Únete como voluntario!",
    contenido: `El programa 'UCP en tu Barrio' busca estudiantes voluntarios para participar en el proyecto de alfabetización digital que beneficiará a comunidades vulnerables de Pereira.

Objetivos del programa:
- Enseñar habilidades digitales básicas a adultos mayores
- Facilitar el acceso a servicios en línea
- Reducir la brecha digital en nuestra ciudad
- Promover la inclusión social a través de la tecnología

Actividades a realizar:
- Talleres de computación básica
- Uso de herramientas ofimáticas
- Navegación segura por internet
- Creación de correos electrónicos
- Uso de redes sociales de forma segura

Requisitos para voluntarios:
- Ser estudiante activo de la UCP
- Tener conocimientos básicos de computación
- Disponibilidad de 4 horas semanales
- Compromiso social y vocación de servicio

Beneficios para voluntarios:
- Acumulación de horas de servicio social
- Certificado de participación
- Experiencia en trabajo comunitario
- Desarrollo de habilidades pedagógicas

Las inscripciones están abiertas hasta el 31 de marzo de 2025.`,
    autor: "Coordinación de Proyectos Sociales",
    publicada: true,
    fecha_publicacion: new Date('2025-03-08'),
    imagenes: [
      {
        url_imagen: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60",
        public_id_cloudinary: "noticia_ucp_barrio_1",
        orden: 0
      }
    ]
  },
  {
    titulo: "Gala de Premios Excelencia Social",
    resumen: "Reconocemos el esfuerzo y dedicación de los estudiantes con mayor impacto en sus horas de servicio durante este semestre.",
    contenido: `La Gala de Premios Excelencia Social 2025 será un evento especial para reconocer y celebrar el compromiso de nuestros estudiantes con el servicio social.

Categorías de premiación:
- Mejor proyecto de impacto comunitario
- Mayor número de horas de servicio
- Proyecto más innovador
- Compromiso social destacado
- Liderazgo en initiatives comunitarias

El evento contará con:
- Ceremonia de premiación formal
- Presentación de proyectos destacados
- Testimonios de beneficiarios
- Presentación artística de grupos culturales
- Cóctel de networking

Fecha: 5 de abril de 2025
Hora: 6:00 PM
Lugar: Hotel Granada - Salón Imperial
Dress code: Formal

Los estudiantes interesados en asistir deben confirmar su asistencia a través de la plataforma antes del 31 de marzo de 2025.

Este evento es una oportunidad para celebrar el impacto positivo que generamos en nuestra comunidad y reconocer el esfuerzo de quienes dedican su tiempo al servicio social.`,
    autor: "Comité de Servicio Social",
    publicada: true,
    fecha_publicacion: new Date('2025-03-05'),
    imagenes: [
      {
        url_imagen: "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&auto=format&fit=crop&q=60",
        public_id_cloudinary: "noticia_gala_premios_1",
        orden: 0
      },
      {
        url_imagen: "https://images.unsplash.com/photo-1511795409814-af0488a3d147?w=800&auto=format&fit=crop&q=60",
        public_id_cloudinary: "noticia_gala_premios_2",
        orden: 1
      }
    ]
  },
  {
    titulo: "Nueva Alianza con Fundación Esperanza",
    resumen: "La UCP firma convenio de colaboración con Fundación Esperanza para ampliar el alcance de los proyectos de servicio social.",
    contenido: `Estamos emocionados de anunciar la nueva alianza estratégica entre la Universidad Católica de Pereira y la Fundación Esperanza.

Esta colaboración permitirá:

- Ampliar el alcance de nuestros proyectos a 5 nuevas comunidades
- Contar con el apoyo de expertos en trabajo social
- Acceder a recursos adicionales para proyectos
- Fortalecer el impacto de nuestras iniciativas
- Crear sinergias entre ambas instituciones

Proyectos iniciales bajo esta alianza:
1. Programa de nutrición infantil
2. Apoyo escolar para niños en vulnerabilidad
3. Emprendimiento social con madres cabeza de familia
4. Programa de salud preventiva
5. Iniciativas de cuidado ambiental

La firma del convenio se realizará el próximo 20 de marzo en un acto ceremonial que contará con la presencia de las autoridades de ambas instituciones.

Esta alianza representa un paso importante en nuestro compromiso de generar impacto social significativo y sostenible en nuestra región.`,
    autor: "Oficina de Alianzas Estratégicas",
    publicada: true,
    fecha_publicacion: new Date('2025-03-12'),
    imagenes: [
      {
        url_imagen: "https://images.unsplash.com/photo-1559027615-cd4628b3110b?w=800&auto=format&fit=crop&q=60",
        public_id_cloudinary: "noticia_alianza_esperanza_1",
        orden: 0
      }
    ]
  },
  {
    titulo: "Capacitación en Primeros Auxilios",
    resumen: "Curso intensivo de primeros auxilios para estudiantes voluntarios que participan en proyectos comunitarios.",
    contenido: `La Dirección de Servicio Social convoca a estudiantes a participar en el curso intensivo de primeros auxilios.

Contenido del curso:
- Evaluación inicial del paciente
- RCP básico (reanimación cardiopulmonar)
- Manejo de heridas y hemorragias
- Atención de emergencias médicas comunes
- Transporte seguro de lesionados
- Uso del botiquín de primeros auxilios

Metodología:
- 70% práctica y 30% teoría
- Simulaciones realistas de emergencias
- Uso de maniquíes y equipos médicos
- Evaluación práctica final

Certificación:
Los estudiantes que completen el curso recibirán certificado internacional de primeros auxilios válido por 2 años.

Información general:
- Duración: 16 horas (2 días)
- Fechas: 25-26 de marzo de 2025
- Horario: 8:00 AM - 5:00 PM
- Lugar: Laboratorio de Ciencias de la Salud
- Cupos: 25 estudiantes
- Costo: Gratuito para estudiantes de servicio social

Esta capacitación es fundamental para garantizar la seguridad de nuestros estudiantes y las comunidades donde realizamos sus proyectos.`,
    autor: "Departamento de Salud y Bienestar",
    publicada: true,
    fecha_publicacion: new Date('2025-03-14'),
    imagenes: [
      {
        url_imagen: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=60",
        public_id_cloudinary: "noticia_primeros_auxilios_1",
        orden: 0
      }
    ]
  }
];

async function main() {
  console.log('🌱 Iniciando seed de noticias...');

  try {
    // Limpiar noticias existentes
    await prisma.imagenNoticia.deleteMany();
    await prisma.noticia.deleteMany();
    console.log('🗑️ Noticias existentes eliminadas');

    // Crear noticias con sus imágenes
    for (const noticiaData of noticiasSeed) {
      const { imagenes, ...noticiaInfo } = noticiaData;
      
      // Crear noticia
      const noticia = await prisma.noticia.create({
        data: {
          titulo: noticiaInfo.titulo,
          slug: slugify(noticiaInfo.titulo),
          resumen: noticiaInfo.resumen,
          contenido: noticiaInfo.contenido,
          autor: noticiaInfo.autor,
          publicada: noticiaInfo.publicada,
          fecha_publicacion: noticiaInfo.fecha_publicacion,
        }
      });

      // Crear imágenes asociadas
      for (const imagenData of imagenes) {
        await prisma.imagenNoticia.create({
          data: {
            id_noticia: noticia.id,
            url_imagen: imagenData.url_imagen,
            public_id_cloudinary: imagenData.public_id_cloudinary,
            orden: imagenData.orden,
          }
        });
      }

      console.log(`✅ Noticia creada: ${noticia.titulo}`);
    }

    console.log('🎉 Seed de noticias completado exitosamente');
    console.log(`📰 Se crearon ${noticiasSeed.length} noticias con imágenes`);
    
  } catch (error) {
    console.error('❌ Error durante el seed de noticias:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
