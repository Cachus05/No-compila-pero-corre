import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, MapPin, Briefcase, Clock, CheckCircle2, MessageSquare, Share2, Heart } from "lucide-react"

// Mock freelancer data
const freelancer = {
  id: 1,
  name: "María González",
  avatar: "/woman-designer.png",
  title: "Diseñadora Gráfica & Brand Specialist",
  location: "Madrid, España",
  rating: 4.9,
  reviewCount: 127,
  completedProjects: 234,
  responseTime: "2 horas",
  memberSince: "2022",
  verified: true,
  description:
    "Diseñadora gráfica con más de 8 años de experiencia en branding, identidad corporativa y diseño digital. Me especializo en crear marcas memorables que conectan con las audiencias. He trabajado con startups, pymes y grandes empresas ayudándolas a construir su identidad visual desde cero.",
  skills: [
    "Branding",
    "Logo Design",
    "Adobe Illustrator",
    "Figma",
    "Photoshop",
    "UI/UX Design",
    "Typography",
    "Color Theory",
  ],
  services: [
    {
      id: 1,
      title: "Diseño de logo profesional y branding completo",
      price: 150,
      image: "/generic-logo-design.png",
      rating: 4.9,
      reviews: 45,
    },
    {
      id: 2,
      title: "Identidad corporativa completa",
      price: 300,
      image: "/corporate-identity.png",
      rating: 5.0,
      reviews: 32,
    },
    {
      id: 3,
      title: "Diseño de redes sociales (pack mensual)",
      price: 200,
      image: "/social-media-design.jpg",
      rating: 4.8,
      reviews: 28,
    },
  ],
  reviews: [
    {
      id: 1,
      client: "Juan Pérez",
      avatar: "/placeholder.svg?key=client1",
      rating: 5,
      date: "Hace 2 semanas",
      comment:
        "Excelente trabajo! María entendió perfectamente lo que necesitaba para mi marca. El logo quedó increíble y todo el proceso fue muy profesional. Totalmente recomendada.",
      project: "Diseño de logo y branding",
    },
    {
      id: 2,
      client: "Laura Martín",
      avatar: "/placeholder.svg?key=client2",
      rating: 5,
      date: "Hace 1 mes",
      comment:
        "Muy profesional y creativa. Superó mis expectativas con el diseño de identidad corporativa. La comunicación fue excelente durante todo el proyecto.",
      project: "Identidad corporativa",
    },
    {
      id: 3,
      client: "Carlos Rodríguez",
      avatar: "/placeholder.svg?key=client3",
      rating: 4,
      date: "Hace 2 meses",
      comment:
        "Buen trabajo en general. El diseño es muy profesional aunque tuvimos que hacer algunas revisiones. Al final quedó perfecto.",
      project: "Diseño de redes sociales",
    },
  ],
}

export default function FreelancerProfilePage() {
  return (
    <div className="min-h-screen">
      <Navigation />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8 p-6">
              <div className="text-center">
                <Avatar className="mx-auto h-32 w-32">
                  <AvatarImage src={freelancer.avatar || "/placeholder.svg"} alt={freelancer.name} />
                  <AvatarFallback className="text-3xl">{freelancer.name.charAt(0)}</AvatarFallback>
                </Avatar>

                <div className="mt-4">
                  <div className="flex items-center justify-center gap-2">
                    <h1 className="text-2xl font-bold">{freelancer.name}</h1>
                    {freelancer.verified && <CheckCircle2 className="h-5 w-5 text-accent" aria-label="Perfil verificado" />}
                  </div>
                  <p className="mt-1 text-muted-foreground">{freelancer.title}</p>
                </div>

                <div className="mt-4 flex items-center justify-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {freelancer.location}
                </div>

                <div className="mt-4 flex items-center justify-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-xl font-bold">{freelancer.rating}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">({freelancer.reviewCount} reseñas)</span>
                </div>

                <Separator className="my-6" />

                <div className="space-y-4 text-left">
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Proyectos completados</div>
                      <div className="font-semibold">{freelancer.completedProjects}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Tiempo de respuesta</div>
                      <div className="font-semibold">{freelancer.responseTime}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Miembro desde</div>
                      <div className="font-semibold">{freelancer.memberSince}</div>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-3">
                  <Button className="w-full" size="lg">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Contactar
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 bg-transparent">
                      <Heart className="mr-2 h-4 w-4" />
                      Guardar
                    </Button>
                    <Button variant="outline" className="flex-1 bg-transparent">
                      <Share2 className="mr-2 h-4 w-4" />
                      Compartir
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="sobre-mi" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="sobre-mi">Sobre mí</TabsTrigger>
                <TabsTrigger value="servicios">Servicios</TabsTrigger>
                <TabsTrigger value="resenas">Reseñas</TabsTrigger>
              </TabsList>

              <TabsContent value="sobre-mi" className="mt-6 space-y-6">
                <Card className="p-6">
                  <h2 className="mb-4 text-xl font-semibold">Descripción</h2>
                  <p className="leading-relaxed text-muted-foreground">{freelancer.description}</p>
                </Card>

                <Card className="p-6">
                  <h2 className="mb-4 text-xl font-semibold">Habilidades</h2>
                  <div className="flex flex-wrap gap-2">
                    {freelancer.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="px-3 py-1">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="servicios" className="mt-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  {freelancer.services.map((service) => (
                    <Card key={service.id} className="overflow-hidden transition-all hover:shadow-lg">
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={service.image || "/placeholder.svg"}
                          alt={service.title}
                          className="h-full w-full object-cover transition-transform hover:scale-105"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="mb-3 line-clamp-2 text-balance font-semibold leading-tight">{service.title}</h3>
                        <div className="mb-3 flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">{service.rating}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">({service.reviews})</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-2xl font-bold">${service.price}</div>
                          <Button size="sm">Ver detalles</Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="resenas" className="mt-6 space-y-4">
                <div className="mb-6 flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold">{freelancer.rating}</div>
                    <div className="flex items-center justify-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(freelancer.rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-sm text-muted-foreground">{freelancer.reviewCount} reseñas</div>
                  </div>
                </div>

                {freelancer.reviews.map((review) => (
                  <Card key={review.id} className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar>
                        <AvatarImage src={review.avatar || "/placeholder.svg"} alt={review.client} />
                        <AvatarFallback>{review.client.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="mb-2 flex items-start justify-between">
                          <div>
                            <div className="font-semibold">{review.client}</div>
                            <div className="text-sm text-muted-foreground">{review.date}</div>
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="mb-2 leading-relaxed text-muted-foreground">{review.comment}</p>
                        <Badge variant="outline" className="text-xs">
                          {review.project}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
