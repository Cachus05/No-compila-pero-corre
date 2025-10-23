import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Navigation } from "@/components/navigation"
import { ArrowRight, Search, Shield, Zap, Users, Star, TrendingUp } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="flex flex-col justify-center">
              <h1 className="text-balance text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
                La plataforma completa para servicios freelance
              </h1>
              <p className="mt-6 text-pretty text-lg leading-relaxed text-muted-foreground">
                Conecta con profesionales talentosos o encuentra tu próximo proyecto. Construye, colabora y crece en la
                comunidad freelance más innovadora.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button size="lg" asChild>
                  <Link href="/explorar">
                    Explorar servicios
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/publicar">Publicar servicio</Link>
                </Button>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-primary/20 blur-3xl" />
              <Card className="relative p-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent">
                      <Zap className="h-6 w-6 text-accent-foreground" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Proyectos completados</div>
                      <div className="text-2xl font-bold">+10,000</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                      <Users className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Freelancers activos</div>
                      <div className="text-2xl font-bold">5,000+</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent">
                      <Star className="h-6 w-6 text-accent-foreground" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Valoración promedio</div>
                      <div className="text-2xl font-bold">4.9/5</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <div className="text-4xl font-bold">15 días</div>
              <div className="text-sm text-muted-foreground">promedio de entrega</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold">98%</div>
              <div className="text-sm text-muted-foreground">satisfacción del cliente</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold">24/7</div>
              <div className="text-sm text-muted-foreground">soporte disponible</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold">$2M+</div>
              <div className="text-sm text-muted-foreground">pagados a freelancers</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              Todo lo que necesitas para tener éxito
            </h2>
            <p className="mt-4 text-pretty text-lg text-muted-foreground">
              Herramientas profesionales para freelancers y clientes
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent">
                <Search className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Búsqueda inteligente</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Encuentra el freelancer perfecto con filtros avanzados por categoría, precio, valoración y
                disponibilidad.
              </p>
            </Card>

            <Card className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Pagos seguros</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Sistema de pagos protegido con garantía. El dinero se libera solo cuando el trabajo está completado.
              </p>
            </Card>

            <Card className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent">
                <Users className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Perfiles verificados</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Todos los freelancers pasan por un proceso de verificación para garantizar calidad y profesionalismo.
              </p>
            </Card>

            <Card className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                <Star className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Sistema de reseñas</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Valoraciones transparentes de clientes reales para tomar decisiones informadas.
              </p>
            </Card>

            <Card className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent">
                <TrendingUp className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Gestión de proyectos</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Herramientas integradas para seguimiento de proyectos, entregas y comunicación.
              </p>
            </Card>

            <Card className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                <Zap className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Respuesta rápida</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Conecta con freelancers en minutos. La mayoría responde en menos de 2 horas.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <Card className="relative overflow-hidden p-12">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-primary/10" />
            <div className="relative text-center">
              <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">¿Listo para comenzar?</h2>
              <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg text-muted-foreground">
                Únete a miles de freelancers y clientes que ya están construyendo el futuro del trabajo.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Button size="lg" asChild>
                  <Link href="/registro">
                    Crear cuenta gratis
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/explorar">Ver servicios</Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <span className="font-mono text-lg font-bold text-primary-foreground">F</span>
                </div>
                <span className="text-xl font-bold">FreelanceHub</span>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">La plataforma que conecta talento con oportunidades.</p>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-semibold">Plataforma</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/explorar" className="hover:text-foreground">
                    Explorar servicios
                  </Link>
                </li>
                <li>
                  <Link href="/publicar" className="hover:text-foreground">
                    Publicar servicio
                  </Link>
                </li>
                <li>
                  <Link href="/como-funciona" className="hover:text-foreground">
                    Cómo funciona
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-semibold">Soporte</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/ayuda" className="hover:text-foreground">
                    Centro de ayuda
                  </Link>
                </li>
                <li>
                  <Link href="/contacto" className="hover:text-foreground">
                    Contacto
                  </Link>
                </li>
                <li>
                  <Link href="/terminos" className="hover:text-foreground">
                    Términos
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-semibold">Empresa</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/sobre-nosotros" className="hover:text-foreground">
                    Sobre nosotros
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-foreground">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/carreras" className="hover:text-foreground">
                    Carreras
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 FreelanceHub. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
