"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"

/**
 * Página: Términos y Condiciones — FreeMarket UTSC
 *
 * Descripción:
 * - Archivo único listo para pegar en una página de Next.js (por ejemplo: app/terminos/page.tsx o pages/terminos.tsx).
 * - Contiene el diseño oscuro profesional solicitado: header compacto, logo desplazado sutilmente,
 *   tonos azules reemplazados por grises, footer centrado y más espacioso.
 * - Conserva todo el contenido legal original, pero organizado en componentes y con mejoras de accesibilidad.
 *
 * Nota:
 * - Este archivo usa TailwindCSS para estilos (clases utilitarias).
 * - Si tu proyecto no incluye lucide-react, instala o reemplaza los íconos por SVGs/otro paquete.
 */

/* ============================
   Small reusable components
   ============================ */

/** IconButton: botón pequeño con icono y texto (usado para "Volver") */
function IconButton({
  href,
  children,
  className = "",
}: {
  href: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors ${className}`}
    >
      {children}
    </Link>
  )
}

/**
 * CollapsibleSection
 * - Pequeño componente para mostrar/ocultar secciones largas de forma accesible.
 * - Hecho para mejorar la UX en pantallas pequeñas manteniendo todo el contenido visible por defecto.
 */
function CollapsibleSection({
  id,
  title,
  children,
  defaultOpen = true,
}: {
  id: string
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <section aria-labelledby={id} className="group">
      <div className="flex items-center justify-between">
        <h2 id={id} className="text-2xl font-bold text-gray-100 mb-4">
          {title}
        </h2>

        <button
          type="button"
          aria-expanded={open}
          aria-controls={`${id}-content`}
          onClick={() => setOpen((s) => !s)}
          className="ml-4 -mr-2 p-2 rounded-md text-gray-400 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-600"
        >
          <span className="sr-only">{open ? "Colapsar sección" : "Expandir sección"}</span>
          {open ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>
      </div>

      <div
        id={`${id}-content`}
        className={`transition-all duration-200 overflow-hidden ${open ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="mt-2 text-gray-300 prose prose-invert max-w-none">{children}</div>
      </div>
    </section>
  )
}

/* ============================
   Main Page Component
   ============================ */

export default function TerminosCondiciones(): JSX.Element {
  return (
    <div className="min-h-screen bg-black text-gray-100 antialiased">
      {/* ============================
          HEADER (Compacto y sutil)
          - logo desplazado ligeramente a la derecha
          - header ligeramente más pequeño con scale
          - paleta en grises
          ============================ */}
      <header className="border-b border-gray-800 bg-black/50 backdrop-blur-sm sticky top-0 z-50 scale-[0.975]">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 translate-x-30">
              <Image
                src="/logo_cute-removebg-preview.png"
                alt="UTSC Logo"
                width={48}
                height={48}
                className="rounded-lg drop-shadow-sm"
                priority
              />
              <span className="text-lg font-semibold text-white leading-tight">FreeMarket UTSC</span>
            </Link>

            <IconButton href="/" className="">
              <ArrowLeft className="h-4 w-4" />
              Volver al inicio
            </IconButton>
          </div>
        </div>
      </header>

      {/* ============================
          MAIN CONTENT
          - Área principal centrada
          - Máxima anchura controlada para mejor lectura
          ============================ */}
      <main className="container mx-auto px-4 py-14 max-w-4xl">
        {/* Hero / Título */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-gray-100 to-gray-400 bg-clip-text text-transparent">
            Términos y Condiciones
          </h1>

          <p className="text-gray-400">
            Última actualización: <strong className="text-gray-200">Noviembre 2025</strong>
          </p>
        </div>

        {/* Card contenedor principal */}
        <div className="prose prose-invert max-w-none">
          <div className="bg-neutral-900 rounded-2xl p-8 md:p-10 space-y-8 border border-gray-800 shadow-lg">

            {/* ===== Sección 1: Información General ===== */}
            <CollapsibleSection id="s1" title="1. Información General">
              <div className="space-y-3">
                <p>
                  <strong className="text-white">Nombre de la Plataforma:</strong> FreeMarket UTSC
                </p>

                <p>
                  <strong className="text-white">Operador:</strong> Universidad Tecnológica Santa Catarina / Comunidad Estudiantil UTSC
                </p>

                <p>
                  <strong className="text-white">Naturaleza:</strong> Plataforma digital de intermediación para servicios freelance exclusiva para la comunidad estudiantil de la UTSC.
                </p>

                <p className="pt-2">
                  Al acceder y utilizar FreeMarket UTSC, aceptas estar sujeto a estos Términos y Condiciones.
                  Si no estás de acuerdo con alguna parte de estos términos, no podrás utilizar nuestros servicios.
                </p>
              </div>
            </CollapsibleSection>

            <div className="border-t border-gray-800" />

            {/* ===== Sección 2: Definiciones ===== */}
            <CollapsibleSection id="s2" title="2. Definiciones">
              <ul className="space-y-2 text-gray-300 list-disc list-inside">
                <li><strong className="text-white">Plataforma:</strong> FreeMarket UTSC, el sitio web y aplicación móvil.</li>
                <li><strong className="text-white">Usuario:</strong> Cualquier persona registrada en la plataforma (puede ser Cliente, Freelancer o ambos).</li>
                <li><strong className="text-white">Freelancer:</strong> Estudiante activo de la UTSC que ofrece servicios a través de la plataforma.</li>
                <li><strong className="text-white">Cliente:</strong> Usuario que solicita y contrata servicios ofrecidos por Freelancers.</li>
                <li><strong className="text-white">Servicio:</strong> Cualquier trabajo, proyecto o tarea ofrecida por un Freelancer a través de la plataforma.</li>
                <li><strong className="text-white">Transacción:</strong> El acuerdo comercial entre un Cliente y un Freelancer para la realización de un Servicio.</li>
              </ul>
            </CollapsibleSection>

            <div className="border-t border-gray-800" />

            {/* ===== Sección 3: Elegibilidad y Registro ===== */}
            <CollapsibleSection id="s3" title="3. Elegibilidad y Registro">
              <div>
                <h3 className="text-xl font-semibold text-white mt-4 mb-3">3.1 Requisitos de Elegibilidad</h3>
                <p className="text-gray-300 mb-2">Para utilizar FreeMarket UTSC debes:</p>
                <ul className="space-y-1 text-gray-300 list-disc list-inside ml-4">
                  <li>Ser estudiante activo de la Universidad Tecnológica Santa Catarina (UTSC)</li>
                  <li>Ser mayor de 18 años</li>
                  <li>Proporcionar información verdadera, precisa y actualizada</li>
                  <li>Tener capacidad legal para celebrar contratos vinculantes</li>
                </ul>

                <h3 className="text-xl font-semibold text-white mt-6 mb-3">3.2 Verificación de Estudiantes</h3>
                <ul className="space-y-1 text-gray-300 list-disc list-inside ml-4">
                  <li>Los Freelancers deben verificar su estatus de estudiante activo mediante correo institucional (@utsc.edu.mx) o credencial estudiantil vigente</li>
                  <li>FreeMarket UTSC se reserva el derecho de solicitar documentación adicional para verificar la identidad y estatus estudiantil</li>
                  <li>La verificación es obligatoria para ofrecer servicios; contratar servicios puede realizarse con verificación básica</li>
                </ul>

                <h3 className="text-xl font-semibold text-white mt-6 mb-3">3.3 Cuenta de Usuario</h3>
                <ul className="space-y-1 text-gray-300 list-disc list-inside ml-4">
                  <li>Cada usuario es responsable de mantener la confidencialidad de su cuenta y contraseña</li>
                  <li>No se permite compartir cuentas entre múltiples personas</li>
                  <li>Debes notificar inmediatamente cualquier uso no autorizado de tu cuenta</li>
                  <li>Eres responsable de todas las actividades realizadas desde tu cuenta</li>
                </ul>

                <h3 className="text-xl font-semibold text-white mt-6 mb-3">3.4 Suspensión de Cuenta</h3>
                <p className="text-gray-300 mb-2">FreeMarket UTSC puede suspender o cancelar tu cuenta si:</p>
                <ul className="space-y-1 text-gray-300 list-disc list-inside ml-4">
                  <li>Dejas de ser estudiante activo de la UTSC</li>
                  <li>Proporcionas información falsa o engañosa</li>
                  <li>Violas estos Términos y Condiciones</li>
                  <li>Realizas actividades fraudulentas o ilegales</li>
                  <li>Recibes múltiples reportes o calificaciones negativas</li>
                </ul>
              </div>
            </CollapsibleSection>

            <div className="border-t border-gray-800" />

            {/* ===== Sección 4: Naturaleza de la Plataforma ===== */}
            <CollapsibleSection id="s4" title="4. Naturaleza de la Plataforma">
              <div>
                <h3 className="text-xl font-semibold text-white mt-4 mb-3">4.1 Rol de FreeMarket UTSC</h3>
                <p className="text-gray-300 mb-2">FreeMarket UTSC actúa únicamente como intermediario que:</p>
                <ul className="space-y-1 text-gray-300 list-disc list-inside ml-4">
                  <li>Facilita la conexión entre Clientes y Freelancers</li>
                  <li>Proporciona herramientas para la gestión de proyectos</li>
                  <li>Procesa pagos de manera segura</li>
                  <li>Ofrece un sistema de calificaciones y reseñas</li>
                </ul>

                <h3 className="text-xl font-semibold text-white mt-6 mb-3">4.2 Relación Contractual</h3>
                <ul className="space-y-1 text-gray-300 list-disc list-inside ml-4">
                  <li>El contrato de servicios se establece directamente entre el Cliente y el Freelancer</li>
                  <li>FreeMarket UTSC NO es parte del contrato de servicios</li>
                  <li>FreeMarket UTSC NO es empleador ni agente de ningún Usuario</li>
                  <li>Los Usuarios son contratistas independientes responsables de sus propias obligaciones fiscales</li>
                </ul>
              </div>
            </CollapsibleSection>

            <div className="border-t border-gray-800" />

            {/* ===== Sección 5: Servicios Permitidos y Prohibidos ===== */}
            <CollapsibleSection id="s5" title="5. Servicios Permitidos y Prohibidos">
              <div>
                <h3 className="text-xl font-semibold text-white mt-4 mb-3">5.1 Categorías Permitidas</h3>
                <p className="text-gray-300 mb-2">Los Freelancers pueden ofrecer servicios en categorías como:</p>
                <ul className="space-y-1 text-gray-300 list-disc list-inside ml-4">
                  <li>Diseño gráfico y multimedia</li>
                  <li>Programación y desarrollo web</li>
                  <li>Redacción y traducción</li>
                  <li>Marketing digital y redes sociales</li>
                  <li>Tutorías y apoyo académico</li>
                  <li>Fotografía y video</li>
                  <li>Otros servicios profesionales legales</li>
                </ul>

                <h3 className="text-xl font-semibold text-white mt-6 mb-3">5.2 Servicios Prohibidos</h3>
                <p className="text-gray-300 mb-2">Está estrictamente prohibido ofrecer o solicitar:</p>
                <ul className="space-y-1 text-gray-300 list-disc list-inside ml-4">
                  <li>Servicios ilegales o que violen leyes mexicanas</li>
                  <li>Trabajos académicos que constituyan plagio o fraude (ensayos, tesis, exámenes)</li>
                  <li>Contenido para adultos o servicios de naturaleza sexual</li>
                  <li>Venta de sustancias controladas o productos ilegales</li>
                  <li>Servicios que requieran licencias profesionales que el Freelancer no posea</li>
                  <li>Esquemas piramidales o multinivel</li>
                  <li>Cualquier servicio que viole las políticas de la UTSC</li>
                </ul>
              </div>
            </CollapsibleSection>

            <div className="border-t border-gray-800" />

            {/* ===== Sección 6: Pagos y Comisiones ===== */}
            <CollapsibleSection id="s6" title="6. Pagos y Comisiones">
              <div>
                <h3 className="text-xl font-semibold text-white mt-4 mb-3">6.1 Precios</h3>
                <ul className="space-y-1 text-gray-300 list-disc list-inside ml-4">
                  <li>Los Freelancers establecen libremente sus precios</li>
                  <li>Los precios deben mostrarse en pesos mexicanos (MXN)</li>
                  <li>Los precios publicados son vinculantes una vez aceptado el proyecto</li>
                </ul>

                <h3 className="text-xl font-semibold text-white mt-6 mb-3">6.2 Comisión de la Plataforma</h3>
                <div className="bg-gray-800/30 border border-gray-700/40 rounded-lg p-4 my-4">
                  <p className="text-gray-300">
                    <strong className="text-gray-200">Nota:</strong> Durante la fase beta, FreeMarket UTSC es completamente gratuito 
                    para todos los estudiantes. Se notificará con anticipación cualquier cambio en el modelo de comisiones.
                  </p>
                </div>

                <h3 className="text-xl font-semibold text-white mt-6 mb-3">6.3 Reembolsos</h3>
                <p className="text-gray-300 mb-2">Los reembolsos solo proceden en casos justificados:</p>
                <ul className="space-y-1 text-gray-300 list-disc list-inside ml-4">
                  <li>No entrega del servicio según lo acordado</li>
                  <li>Cancelación mutua antes de iniciar el trabajo</li>
                  <li>Fraude o violación de términos comprobada</li>
                </ul>
              </div>
            </CollapsibleSection>

            <div className="border-t border-gray-800" />

            {/* ===== Sección 7: Propiedad Intelectual ===== */}
            <CollapsibleSection id="s7" title="7. Propiedad Intelectual">
              <div>
                <h3 className="text-xl font-semibold text-white mt-4 mb-3">7.1 Derechos del Freelancer</h3>
                <ul className="space-y-1 text-gray-300 list-disc list-inside ml-4">
                  <li>Los Freelancers conservan todos los derechos sobre su trabajo hasta completar la transacción</li>
                  <li>El Freelancer puede incluir el proyecto en su portafolio (salvo acuerdo de confidencialidad)</li>
                  <li>Los métodos, técnicas y conocimientos del Freelancer permanecen bajo su propiedad</li>
                </ul>

                <h3 className="text-xl font-semibold text-white mt-6 mb-3">7.2 Transferencia de Derechos</h3>
                <ul className="space-y-1 text-gray-300 list-disc list-inside ml-4">
                  <li>Una vez completado el pago, los derechos de uso del trabajo entregado se transfieren al Cliente</li>
                  <li>La transferencia incluye derechos de uso, reproducción y modificación según lo acordado</li>
                  <li>Si se requieren derechos exclusivos o de reventa, debe acordarse explícitamente</li>
                </ul>
              </div>
            </CollapsibleSection>

            <div className="border-t border-gray-800" />

            {/* ===== Sección 8: Conducta y Comportamiento ===== */}
            <CollapsibleSection id="s8" title="8. Conducta y Comportamiento">
              <div>
                <h3 className="text-xl font-semibold text-white mt-4 mb-3">8.1 Código de Conducta</h3>
                <p className="text-gray-300 mb-2">Todos los usuarios deben:</p>
                <ul className="space-y-1 text-gray-300 list-disc list-inside ml-4">
                  <li>Tratar a otros con respeto y profesionalismo</li>
                  <li>Comunicarse de manera clara y honesta</li>
                  <li>Cumplir con sus compromisos</li>
                  <li>Respetar la privacidad de otros usuarios</li>
                  <li>Actuar de buena fe en todas las interacciones</li>
                </ul>

                <h3 className="text-xl font-semibold text-white mt-6 mb-3">8.2 Comportamientos Prohibidos</h3>
                <p className="text-gray-300 mb-2">Está prohibido:</p>
                <ul className="space-y-1 text-gray-300 list-disc list-inside ml-4">
                  <li>Acosar, intimidar o amenazar a otros usuarios</li>
                  <li>Usar lenguaje discriminatorio</li>
                  <li>Hacer spam o enviar mensajes no solicitados</li>
                  <li>Intentar evadir comisiones de la plataforma</li>
                  <li>Crear cuentas múltiples para manipular calificaciones</li>
                  <li>Ofrecer o solicitar servicios prohibidos</li>
                </ul>
              </div>
            </CollapsibleSection>

            <div className="border-t border-gray-800" />

            {/* ===== Sección 9: Privacidad y Protección de Datos ===== */}
            <CollapsibleSection id="s9" title="9. Privacidad y Protección de Datos">
              <div>
                <h3 className="text-xl font-semibold text-white mt-4 mb-3">9.1 Información Recopilada</h3>
                <p className="text-gray-300 mb-2">FreeMarket UTSC recopila:</p>
                <ul className="space-y-1 text-gray-300 list-disc list-inside ml-4">
                  <li>Información de registro (nombre, correo, carrera, semestre)</li>
                  <li>Información de perfil y servicios</li>
                  <li>Historial de transacciones</li>
                  <li>Comunicaciones dentro de la plataforma</li>
                  <li>Datos de uso y navegación</li>
                </ul>

                <h3 className="text-xl font-semibold text-white mt-6 mb-3">9.2 Uso de Información</h3>
                <p className="text-gray-300 mb-2">La información se utiliza para:</p>
                <ul className="space-y-1 text-gray-300 list-disc list-inside ml-4">
                  <li>Operar y mejorar la plataforma</li>
                  <li>Verificar identidad y estatus estudiantil</li>
                  <li>Procesar transacciones</li>
                  <li>Comunicar actualizaciones importantes</li>
                  <li>Prevenir fraude y abusos</li>
                </ul>

                <div className="bg-gray-800/30 border border-gray-700/40 rounded-lg p-4 mt-4">
                  <p className="text-gray-300">
                    <strong className="text-gray-200">Importante:</strong> NO vendemos información personal a terceros. 
                    Para más detalles, consulta nuestra Política de Privacidad.
                  </p>
                </div>
              </div>
            </CollapsibleSection>

            <div className="border-t border-gray-800" />

            {/* ===== Sección 10: Responsabilidades y Limitaciones ===== */}
            <CollapsibleSection id="s10" title="10. Responsabilidades y Limitaciones">
              <div>
                <h3 className="text-xl font-semibold text-white mt-4 mb-3">10.1 Limitación de Responsabilidad</h3>
                <p className="text-gray-300 mb-2">FreeMarket UTSC NO es responsable de:</p>
                <ul className="space-y-1 text-gray-300 list-disc list-inside ml-4">
                  <li>La calidad, seguridad o legalidad de servicios ofrecidos</li>
                  <li>La veracidad de información en perfiles de usuario</li>
                  <li>La capacidad de Freelancers para completar servicios</li>
                  <li>Disputas entre usuarios</li>
                  <li>Interrupciones del servicio o errores técnicos</li>
                </ul>

                <h3 className="text-xl font-semibold text-white mt-6 mb-3">10.2 Descargo de Garantías</h3>
                <p className="text-gray-300">
                  La plataforma se proporciona "TAL CUAL" y "SEGÚN DISPONIBILIDAD". No garantizamos que el servicio 
                  será ininterrumpido o libre de errores.
                </p>
              </div>
            </CollapsibleSection>

            <div className="border-t border-gray-800" />

            {/* ===== Sección 11: Disposiciones Legales ===== */}
            <CollapsibleSection id="s11" title="11. Disposiciones Legales">
              <div>
                <h3 className="text-xl font-semibold text-white mt-4 mb-3">11.1 Jurisdicción y Ley Aplicable</h3>
                <p className="text-gray-300 mb-2">
                  Estos términos se rigen por las leyes de los Estados Unidos Mexicanos, específicamente:
                </p>
                <ul className="space-y-1 text-gray-300 list-disc list-inside ml-4">
                  <li>Código Civil del Estado de Nuevo León</li>
                  <li>Ley Federal de Protección de Datos Personales</li>
                  <li>Ley Federal de Protección al Consumidor</li>
                </ul>

                <h3 className="text-xl font-semibold text-white mt-6 mb-3">11.2 Resolución de Controversias</h3>
                <p className="text-gray-300">
                  Las controversias se resolverán ante tribunales competentes de Santa Catarina / Monterrey, Nuevo León.
                </p>
              </div>
            </CollapsibleSection>

            <div className="border-t border-gray-800" />

            {/* ===== Sección 12: Contacto y Soporte ===== */}
            <CollapsibleSection id="s12" title="12. Contacto y Soporte">
              <div>
                <div className="space-y-3 text-gray-300">
                  <p><strong className="text-white">Correo electrónico:</strong> soporte@freemarketutsc.com</p>
                  <p><strong className="text-white">Ubicación:</strong> Universidad Tecnológica Santa Catarina</p>
                  <p><strong className="text-white">Reportes de abuso:</strong> abuso@freemarketutsc.com</p>
                </div>

                <div className="bg-gray-800/30 border border-gray-700/40 rounded-lg p-4 mt-6">
                  <h4 className="font-semibold text-gray-200 mb-2">Reportar Conducta Inapropiada</h4>
                  <p className="text-gray-300 text-sm">
                    Si encuentras conducta inapropiada o violaciones a estos términos, usa el botón "Reportar" 
                    en perfiles o transacciones, o envía un correo detallado a nuestro equipo de soporte.
                  </p>
                </div>
              </div>
            </CollapsibleSection>

            <div className="border-t border-gray-800" />

            {/* ===== Sección: Aceptación ===== */}
            <section className="bg-gradient-to-r from-gray-800/40 to-gray-700/30 border border-gray-700/40 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-100 mb-4">Aceptación de Términos</h2>

              <p className="text-gray-300 mb-4">
                Al hacer clic en "Acepto" o al usar FreeMarket UTSC, reconoces que:
              </p>

              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-gray-300 mt-1">•</span>
                  <span>Has leído y comprendido estos Términos y Condiciones</span>
                </li>

                <li className="flex items-start gap-2">
                  <span className="text-gray-300 mt-1">•</span>
                  <span>Aceptas estar legalmente vinculado por estos términos</span>
                </li>

                <li className="flex items-start gap-2">
                  <span className="text-gray-300 mt-1">•</span>
                  <span>Eres elegible para usar la plataforma según los requisitos establecidos</span>
                </li>

                <li className="flex items-start gap-2">
                  <span className="text-gray-300 mt-1">•</span>
                  <span>Cumplirás con todas las obligaciones descritas</span>
                </li>
              </ul>
            </section>

            {/* ===== Footer info interno (dentro del card) ===== */}
            <div className="text-center text-sm text-gray-500 pt-6">
              <p>Versión 1.0 | Última actualización: Noviembre 2025</p>
              <p className="mt-2">© 2025 FreeMarket UTSC. Todos los derechos reservados.</p>
              <p className="mt-1">Plataforma desarrollada para la comunidad estudiantil de la Universidad Tecnológica Santa Catarina.</p>
            </div>

          </div>
        </div>

        {/* Botón de regreso grande al final */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
            aria-label="Volver al inicio"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
        </div>
      </main>

      <footer className="border-t border-gray-800 bg-black/60 mt-20">
        <div className="container mx-auto px-4 py-10 text-center text-gray-500">
          <div className="space-y-4">
            {/* Separador y nota de copyright */}
            <div className="border-t border-gray-800 pt-6 text-sm">
              <p>© 2025 Free Market UTSC. Todos los derechos reservados.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
