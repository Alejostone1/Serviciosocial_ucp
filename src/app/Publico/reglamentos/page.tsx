import React from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/home/Navbar'
import { Footer } from '@/components/home/Footer'
import { BookOpen, GraduationCap, ShieldCheck, ClipboardCheck, FileText, Download } from 'lucide-react'

export default function ReglamentosPage() {

  const sections = [
    {
      title: 'Disposiciones Generales',
      icon: BookOpen,
      content:
        'El servicio social es un requisito obligatorio para la obtención del título profesional. Busca conectar al estudiante con las realidades sociales del entorno y fortalecer su formación ética y ciudadana.'
    },
    {
      title: 'Requisitos de Inscripción',
      icon: GraduationCap,
      content:
        'Los estudiantes podrán iniciar el proceso al cumplir el avance académico establecido por su facultad y con matrícula vigente. El registro debe realizarse formalmente dentro de la plataforma institucional.'
    },
    {
      title: 'Supervisión y Evaluación',
      icon: ShieldCheck,
      content:
        'Las horas registradas deben ser verificadas por el director del proyecto y la entidad aliada. El cumplimiento de las actividades y la conducta ética son criterios de evaluación.'
    },
    {
      title: 'Certificación',
      icon: ClipboardCheck,
      content:
        'Una vez cumplidas las horas establecidas, se genera el certificado oficial que valida el requisito ante registro académico.'
    }
  ]

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <header className="border-b">
        <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-center">

          <div className="space-y-6">
            <p className="text-sm tracking-widest uppercase text-red-800 font-semibold">
              Servicio Social Universitario
            </p>

            <h1 className="text-5xl font-bold text-gray-900 leading-tight">
              Reglamentos y Normativa
            </h1>

            <p className="text-lg text-gray-600 max-w-xl">
              Marco institucional que regula el desarrollo del servicio social universitario, estableciendo responsabilidades, procesos de registro y criterios de evaluación.
            </p>

            <Link
              href="#documentos"
              className="inline-flex items-center gap-3 bg-red-800 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-900 transition"
            >
              <FileText className="w-5 h-5" />
              Ver documentos oficiales
            </Link>
          </div>

          <div className="bg-gray-50 rounded-2xl p-10 border">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">
              Propósito del reglamento
            </h3>

            <p className="text-gray-600 leading-relaxed">
              Este documento establece las directrices que orientan la participación de los estudiantes en programas de impacto social. Su finalidad es garantizar que las actividades realizadas aporten al desarrollo de la comunidad y a la formación integral del estudiante.
            </p>
          </div>

        </div>
      </header>

      <main className="flex-grow">

        <section className="max-w-7xl mx-auto px-6 py-20">

          <div className="grid md:grid-cols-2 gap-10">

            {sections.map((section, index) => {
              const Icon = section.icon

              return (
                <div key={index} className="border rounded-xl p-8 hover:shadow-lg transition">

                  <div className="flex items-center gap-4 mb-5">
                    <div className="p-3 bg-red-50 rounded-lg">
                      <Icon className="w-6 h-6 text-red-800" />
                    </div>

                    <h3 className="text-xl font-semibold text-gray-900">
                      {section.title}
                    </h3>
                  </div>

                  <p className="text-gray-600 leading-relaxed">
                    {section.content}
                  </p>

                </div>
              )
            })}

          </div>

        </section>

        <section id="documentos" className="bg-gray-50 border-t">

          <div className="max-w-7xl mx-auto px-6 py-20">

            <div className="grid md:grid-cols-2 gap-12 items-center">

              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Documentación institucional
                </h2>

                <p className="text-gray-600 leading-relaxed mb-8">
                  Consulta el reglamento oficial aprobado por la institución. El documento contiene las disposiciones completas relacionadas con el servicio social universitario.
                </p>

                <button className="inline-flex items-center gap-3 bg-red-800 text-white px-7 py-3 rounded-lg font-medium hover:bg-red-900 transition">
                  <Download className="w-5 h-5" />
                  Descargar reglamento PDF
                </button>
              </div>

              <div className="border rounded-xl p-8 bg-white">
                <h4 className="font-semibold text-gray-900 mb-4">
                  Información clave
                </h4>

                <ul className="space-y-3 text-gray-600">
                  <li>• Requisito obligatorio para grado</li>
                  <li>• Registro digital de horas</li>
                  <li>• Supervisión institucional</li>
                  <li>• Certificación automática</li>
                </ul>
              </div>

            </div>

          </div>

        </section>

      </main>

      <Footer />
    </div>
  )
}
