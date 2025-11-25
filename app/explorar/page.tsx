"use client"

import { useState } from "react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import ContratarDialog from "@/components/contratar-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Star, Filter } from "lucide-react"

// Mock data for services
const services = [
  {
    id: 1,
    title: "Desarrollador Front-end",
    freelancer: "Leonel Martínez",
    freelancerAvatar: "/angeldelleonel.jpg",
    price: 150,
    rating: 4.9,
    reviews: 127,
    category: "Diseño",
    image: "/frontend-design.png",
  },
  {
    id: 2,
    title: "Desarrollo web con React y Next.js",
    freelancer: "Alexis Alfano",
    freelancerAvatar: "/alexisalfano.jpg",
    price: 500,
    rating: 5.0,
    reviews: 89,
    category: "Desarrollo",
    image: "/reactvsnext.png",
  },
  {
    id: 3,
    title: "Redacción de contenido SEO optimizado",
    freelancer: "Karolin Medina",
    freelancerAvatar: "/woman-writer.jpg",
    price: 80,
    rating: 4.8,
    reviews: 203,
    category: "Escritura",
    image: "/content-writing-concept.png",
  },
  {
    id: 4,
    title: "Administrador de Bases de Datos (DBA)",
    freelancer: "Susana Morales",
    freelancerAvatar: "/cachus.jpg",
    price: 200,
    rating: 4.9,
    reviews: 156,
    category: "Desarrollo",
    image: "/sqlfondo.png",
  },
  {
    id: 5,
    title: "Gestión de redes sociales y marketing digital",
    freelancer: "Laura Fernández",
    freelancerAvatar: "/woman-marketer.jpg",
    price: 300,
    rating: 4.7,
    reviews: 94,
    category: "Marketing",
    image: "/interconnected-social-media.png",
  },
  {
    id: 6,
    title: "Ilustración digital y arte conceptual",
    freelancer: "Pablo Sánchez",
    freelancerAvatar: "/man-illustrator.jpg",
    price: 180,
    rating: 5.0,
    reviews: 71,
    category: "Diseño",
    image: "/abstract-digital-art.png",
  },
  {
    id: 7,
    title: "Traducción profesional inglés-español",
    freelancer: "Isabel Torres",
    freelancerAvatar: "/woman-translator.jpg",
    price: 60,
    rating: 4.9,
    reviews: 312,
    category: "Traducción",
    image: "/translation-concept.png",
  },
  {
    id: 8,
    title: "Consultoría de negocios y estrategia",
    freelancer: "Roberto Díaz",
    freelancerAvatar: "/man-consultant.jpg",
    price: 400,
    rating: 4.8,
    reviews: 45,
    category: "Consultoría",
    image: "/business-consulting.png",
  },
]

const categories = ["Todas", "Diseño", "Desarrollo", "Escritura", "Video", "Marketing", "Traducción", "Consultoría"]

export default function ExplorarPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Todas")
  const [sortBy, setSortBy] = useState("relevancia")

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.freelancer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "Todas" || service.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen">
      <Navigation />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Explorar servicios</h1>
          <p className="mt-2 text-lg text-muted-foreground">Encuentra el profesional perfecto para tu proyecto</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar servicios o freelancers..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevancia">Relevancia</SelectItem>
                <SelectItem value="precio-bajo">Precio: Menor a mayor</SelectItem>
                <SelectItem value="precio-alto">Precio: Mayor a menor</SelectItem>
                <SelectItem value="valoracion">Mejor valorados</SelectItem>
                <SelectItem value="recientes">Más recientes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            {filteredServices.length} {filteredServices.length === 1 ? "servicio encontrado" : "servicios encontrados"}
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map((service) => (
            <Card key={service.id} className="group overflow-hidden transition-all hover:shadow-lg">
              <div>
                <Link href={`/servicio/${service.id}`} className="block">
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={service.image || "/placeholder.svg"}
                      alt={service.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5">
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <h3 className="line-clamp-2 text-balance text-lg font-semibold leading-tight">{service.title}</h3>
                    </div>

                    <div className="mb-4 flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={service.freelancerAvatar || "/placeholder.svg"} alt={service.freelancer} />
                        <AvatarFallback>{service.freelancer.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">{service.freelancer}</span>
                    </div>

                    <div className="mb-4 flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{service.rating}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">({service.reviews})</span>
                      <Badge variant="secondary" className="ml-auto">
                        {service.category}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm text-muted-foreground">Desde</span>
                        <div className="text-2xl font-bold">${service.price}</div>
                      </div>
                    </div>
                  </div>
                </Link>

                <div className="p-5 pt-0">
                  <div className="flex items-center justify-between">
                    <div />
                    <ContratarDialog>
                      <Button size="sm">Contratar</Button>
                    </ContratarDialog>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredServices.length === 0 && (
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">No se encontraron servicios</h3>
            <p className="text-muted-foreground">Intenta ajustar tus filtros o búsqueda</p>
          </div>
        )}
      </div>
    </div>
  )
}
