'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navigation } from "@/components/navigation_cliente"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Star, Loader2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Servicio {
  id: number
  title: string
  description: string
  category: string
  subcategory: string | null
  base_price: number | string
  delivery_time: number
  gallery_images: string[]
  freelancer: {
    id: number
    first_name: string
    last_name: string
    avatar: string | null
    email: string
  }
}

export default function ContratarServiciosPage() {
  const router = useRouter()
  const [usuario, setUsuario] = useState<any>(null)
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [serviciosFiltrados, setServiciosFiltrados] = useState<Servicio[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todas')

  const categorias = [
    'Todas',
    'Diseño',
    'Desarrollo',
    'Escritura',
    'Video',
    'Marketing',
    'Traducción',
    'Consultoría'
  ]

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuario')
    if (usuarioGuardado) {
      setUsuario(JSON.parse(usuarioGuardado))
    }
  }, [])

  useEffect(() => {
    cargarServicios()
  }, [])

  useEffect(() => {
    filtrarServicios()
  }, [busqueda, categoriaSeleccionada, servicios])

  const cargarServicios = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/services')
      
      if (!response.ok) {
        throw new Error('Error al cargar servicios')
      }

      const data = await response.json()
      console.log('Servicios cargados:', data.servicios)
      setServicios(data.servicios || [])
      setError('')
    } catch (err) {
      console.error('Error al cargar servicios:', err)
      setError('No se pudieron cargar los servicios')
    } finally {
      setLoading(false)
    }
  }

  const filtrarServicios = () => {
    let resultado = servicios

    // Filtrar por categoría
    if (categoriaSeleccionada !== 'Todas') {
      resultado = resultado.filter(
        servicio => servicio.category === categoriaSeleccionada
      )
    }

    // Filtrar por búsqueda
    if (busqueda.trim()) {
      const searchLower = busqueda.toLowerCase()
      resultado = resultado.filter(servicio =>
        servicio.title.toLowerCase().includes(searchLower) ||
        servicio.description.toLowerCase().includes(searchLower) ||
        servicio.category.toLowerCase().includes(searchLower) ||
        `${servicio.freelancer.first_name} ${servicio.freelancer.last_name}`
          .toLowerCase()
          .includes(searchLower)
      )
    }

    setServiciosFiltrados(resultado)
  }

  const formatearPrecio = (precio: number | string): string => {
    const precioNumero = typeof precio === 'string' ? parseFloat(precio) : precio
    return isNaN(precioNumero) ? '0.00' : precioNumero.toFixed(2)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-6 py-10 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Contratar servicios</h1>
          <p className="text-muted-foreground">
            Encuentra el profesional perfecto para tu proyecto
          </p>
        </div>

        {/* Búsqueda y filtros */}
        <div className="mb-8 space-y-4">
          {/* Barra de búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar servicios o freelancers..."
              className="pl-9"
            />
          </div>

          {/* Filtros de categoría */}
          <div className="flex flex-wrap gap-2">
            {categorias.map((categoria) => (
              <Button
                key={categoria}
                variant={categoriaSeleccionada === categoria ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCategoriaSeleccionada(categoria)}
              >
                {categoria}
              </Button>
            ))}
          </div>

          {/* Contador de resultados */}
          <div className="text-sm text-muted-foreground">
            {serviciosFiltrados.length} servicio{serviciosFiltrados.length !== 1 ? 's' : ''} encontrado{serviciosFiltrados.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-3 text-muted-foreground">Cargando servicios...</span>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-center">
            <p className="text-sm text-red-400">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={cargarServicios}
              className="mt-3"
            >
              Reintentar
            </Button>
          </div>
        )}

        {/* Sin resultados */}
        {!loading && !error && serviciosFiltrados.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-2">
              {busqueda || categoriaSeleccionada !== 'Todas' 
                ? 'No se encontraron servicios con los filtros aplicados' 
                : 'No hay servicios disponibles aún'}
            </p>
            {(busqueda || categoriaSeleccionada !== 'Todas') && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setBusqueda('')
                  setCategoriaSeleccionada('Todas')
                }}
              >
                Limpiar filtros
              </Button>
            )}
          </div>
        )}

        {/* Grid de servicios */}
        {!loading && !error && serviciosFiltrados.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {serviciosFiltrados.map((servicio) => {
              const imagenPrincipal = servicio.gallery_images && servicio.gallery_images.length > 0
                ? servicio.gallery_images[0]
                : '/placeholder.svg'
              
              const nombreCompleto = `${servicio.freelancer.first_name} ${servicio.freelancer.last_name}`
              const iniciales = `${servicio.freelancer.first_name.charAt(0)}${servicio.freelancer.last_name.charAt(0)}`

              return (
                <Card
                  key={servicio.id}
                  className="group overflow-hidden transition-all hover:shadow-lg hover:border-gray-700 duration-200"
                >
                  {/* Imagen */}
                  <Link href={`/dashboard_cliente/contratar/${servicio.id}`}>
                    <div className="aspect-video overflow-hidden bg-neutral-800 cursor-pointer">
                      <img
                        src={imagenPrincipal}
                        alt={servicio.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg'
                        }}
                      />
                    </div>
                  </Link>

                  {/* Contenido */}
                  <div className="p-4">
                    {/* Título */}
                    <Link href={`/dashboard_cliente/contratar/${servicio.id}`}>
                      <h3 className="line-clamp-2 text-base font-semibold leading-tight text-white mb-3 min-h-[2.5rem] cursor-pointer hover:text-blue-400 transition-colors">
                        {servicio.title}
                      </h3>
                    </Link>

                    {/* Freelancer */}
                    <div className="flex items-center gap-2 mb-3">
                      <Avatar className="h-7 w-7">
                        <AvatarImage 
                          src={servicio.freelancer.avatar || undefined} 
                          alt={nombreCompleto} 
                        />
                        <AvatarFallback className="text-xs">{iniciales}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-gray-400 truncate">
                        {nombreCompleto}
                      </span>
                    </div>

                    {/* Categoría y rating */}
                    <div className="flex items-center gap-2 mb-3">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-semibold">Nuevo</span>
                      <Badge 
                        variant="secondary" 
                        className="ml-auto bg-blue-600/20 text-blue-400 border-none text-xs"
                      >
                        {servicio.category}
                      </Badge>
                    </div>

                    {/* Precio y botón */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs text-gray-400">Desde</span>
                        <div className="text-xl font-bold text-white">
                          ${formatearPrecio(servicio.base_price)}
                        </div>
                      </div>
                      <Link href={`/dashboard_cliente/contratar/${servicio.id}`}>
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                        >
                          Ver más
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}