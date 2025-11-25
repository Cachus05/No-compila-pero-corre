'use client'

import { useEffect, useState } from 'react'
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
  base_price: number | string
  gallery_images: string[]
  freelancer: {
    id: number
    first_name: string
    last_name: string
    avatar: string | null
    email: string
  }
}

export default function DashboardClientePage() {
  const [usuario, setUsuario] = useState<any>(null)
  const [query, setQuery] = useState('')
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [proyectos, setProyectos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingProyectos, setLoadingProyectos] = useState(false)
  const [error, setError] = useState('')

  const formatearPrecio = (precio: number | string): string => {
    const precioNumero = typeof precio === 'string' ? parseFloat(precio) : precio
    return isNaN(precioNumero) ? '0.00' : precioNumero.toFixed(2)
  }

  useEffect(() => {
    try {
      const usuarioGuardado = localStorage.getItem('usuario')
      if (usuarioGuardado) {
        setUsuario(JSON.parse(usuarioGuardado))
      }
    } catch (e) {
      console.error('No se pudo parsear usuario del localStorage', e)
    }
  }, [])

  useEffect(() => {
    cargarServicios()
  }, [])

  useEffect(() => {
    if (usuario) {
      cargarProyectos()
    }
  }, [usuario])

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

  const cargarProyectos = async () => {
    try {
      setLoadingProyectos(true)
      const token = localStorage.getItem('token')
      
      if (!token) {
        console.log('No hay token disponible')
        setProyectos([])
        return
      }

      console.log('Cargando proyectos...')
      const response = await fetch('/api/projects', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        console.log('Error en la respuesta de proyectos:', response.status)
        setProyectos([])
        return
      }

      const data = await response.json()
      console.log('Proyectos recibidos:', data)
      setProyectos(data.proyectos || [])
    } catch (err) {
      console.error('Error al cargar proyectos:', err)
      setProyectos([])
    } finally {
      setLoadingProyectos(false)
    }
  }

  const serviciosFiltrados = servicios.filter(servicio => {
    if (!query.trim()) return true
    
    const searchLower = query.toLowerCase()
    return (
      servicio.title.toLowerCase().includes(searchLower) ||
      servicio.description.toLowerCase().includes(searchLower) ||
      servicio.category.toLowerCase().includes(searchLower) ||
      `${servicio.freelancer.first_name} ${servicio.freelancer.last_name}`.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-6 py-10 max-w-7xl">
        <div className="grid gap-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold">Bienvenido, {usuario?.first_name || 'Cliente'}</h1>
              <p className="text-muted-foreground text-sm sm:text-base mt-1">
                Panel del cliente — busca servicios, contrata profesionales y gestiona pagos de forma segura
              </p>
            </div>

            <div className="w-full sm:w-80">
              <label className="relative block">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar servicios o profesionales..."
                  className="pl-9"
                />
              </label>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
              <Card className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold">
                    Servicios destacados
                    {serviciosFiltrados.length > 0 && (
                      <span className="ml-2 text-sm text-muted-foreground">
                        ({serviciosFiltrados.length})
                      </span>
                    )}
                  </h2>
                  {!loading && servicios.length > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={cargarServicios}
                    >
                      Actualizar
                    </Button>
                  )}
                </div>

                {loading && (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <span className="ml-3 text-muted-foreground">Cargando servicios...</span>
                  </div>
                )}

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

                {!loading && !error && serviciosFiltrados.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      {query ? 'No se encontraron servicios con tu búsqueda' : 'No hay servicios disponibles aún'}
                    </p>
                  </div>
                )}

                {!loading && !error && serviciosFiltrados.length > 0 && (
                  <section className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
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
                          <div className="aspect-video overflow-hidden bg-neutral-800 cursor-pointer">
                            <Link href={`/dashboard_cliente/contratar/${servicio.id}`}>
                              <img
                                src={imagenPrincipal}
                                alt={servicio.title}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/placeholder.svg'
                                }}
                              />
                            </Link>
                          </div>

                          <div className="p-5">
                            <Link href={`/dashboard_cliente/contratar/${servicio.id}`}>
                              <h3 className="line-clamp-2 text-lg font-semibold leading-tight text-white mb-3 min-h-[3.5rem] cursor-pointer hover:text-blue-400 transition-colors">
                                {servicio.title}
                              </h3>
                            </Link>

                            <div className="flex items-center gap-2 mb-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage 
                                  src={servicio.freelancer.avatar || undefined} 
                                  alt={nombreCompleto} 
                                />
                                <AvatarFallback>{iniciales}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm text-gray-400 truncate">
                                {nombreCompleto}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 mb-3">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-semibold">Nuevo</span>
                              <Badge 
                                variant="secondary" 
                                className="ml-auto bg-blue-600/20 text-blue-400 border-none"
                              >
                                {servicio.category}
                              </Badge>
                            </div>

                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-sm text-gray-400">Desde</span>
                                <div className="text-2xl font-bold text-white">
                                  ${formatearPrecio(servicio.base_price)}
                                </div>
                              </div>
                              <Link href={`/dashboard_cliente/contratar/${servicio.id}`}>
                                <Button
                                  size="sm"
                                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                                >
                                  Contratar
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </Card>
                      )
                    })}
                  </section>
                )}
              </Card>

              <Card className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">
                    Contratos activos
                    {proyectos.length > 0 && (
                      <span className="ml-2 text-sm text-muted-foreground">
                        ({proyectos.length})
                      </span>
                    )}
                  </h2>
                </div>

                {loadingProyectos && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-sm text-muted-foreground">Cargando contratos...</span>
                  </div>
                )}

                {!loadingProyectos && proyectos.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No tienes contratos activos aún.</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Explora los servicios disponibles y contrata a un freelancer
                    </p>
                  </div>
                )}

                {!loadingProyectos && proyectos.length > 0 && (
                  <div className="space-y-4">
                    {proyectos.map((proyecto) => {
                      const imagenServicio = proyecto.service_images && proyecto.service_images.length > 0
                        ? proyecto.service_images[0]
                        : '/placeholder.svg'
                      
                      const nombreFreelancer = `${proyecto.freelancer_first_name} ${proyecto.freelancer_last_name}`
                      const iniciales = `${proyecto.freelancer_first_name.charAt(0)}${proyecto.freelancer_last_name.charAt(0)}`

                      return (
                        <Card key={proyecto.id} className="p-4 hover:bg-neutral-800/50 transition-colors">
                          <div className="flex gap-4">
                            <div className="w-24 h-24 bg-neutral-800 rounded-lg overflow-hidden flex-shrink-0">
                              <img
                                src={imagenServicio}
                                alt={proyecto.service_title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/placeholder.svg'
                                }}
                              />
                            </div>

                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold truncate mb-1">
                                {proyecto.service_title}
                              </h3>
                              <div className="flex items-center gap-2 mb-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage 
                                    src={proyecto.freelancer_avatar || undefined} 
                                    alt={nombreFreelancer} 
                                  />
                                  <AvatarFallback className="text-xs">{iniciales}</AvatarFallback>
                                </Avatar>
                                <span className="text-sm text-muted-foreground">
                                  {nombreFreelancer}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-sm">
                                <Badge 
                                  variant={
                                    proyecto.status === 'pending' ? 'secondary' :
                                    proyecto.status === 'active' ? 'default' :
                                    proyecto.status === 'review' ? 'default' :
                                    proyecto.status === 'completed' ? 'default' :
                                    'destructive'
                                  }
                                >
                                  {proyecto.status === 'pending' ? 'Pendiente' :
                                   proyecto.status === 'active' ? 'Activo' :
                                   proyecto.status === 'review' ? 'En revisión' :
                                   proyecto.status === 'completed' ? 'Completado' :
                                   'Otro'}
                                </Badge>
                                <span className="text-muted-foreground">
                                  ${formatearPrecio(proyecto.budget)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </Card>

              <Card className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Pagos y facturación</h2>
                  <Link href="/pagos">
                    <Button variant="outline">Ir a pagos</Button>
                  </Link>
                </div>
                <div className="text-muted-foreground">Resumen de pagos recientes y estado.</div>
              </Card>
            </div>

            <aside className="space-y-6">
              <Card className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">Mensajes</h3>
                    <p className="text-sm text-muted-foreground">Comunícate con tus freelancers</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href="/dashboard_cliente/mensajes">
                      <Button size="sm">Ir a mensajes</Button>
                    </Link>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-3">Acciones rápidas</h3>
                <div className="flex flex-col gap-2">
                  <Link href="/dashboard_cliente/contratar">
                    <Button variant="outline" className="w-full">Buscar profesionales</Button>
                  </Link>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-3">Estadísticas</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Servicios disponibles</span>
                    <span className="font-semibold">{servicios.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Categorías</span>
                    <span className="font-semibold">
                      {new Set(servicios.map(s => s.category)).size}
                    </span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-3">Seguridad de pagos</h3>
                <p className="text-sm text-muted-foreground">Pagos protegidos y gestión de disputas</p>
                <div className="mt-4 flex justify-end">
                  <Link href="/ayuda/pagos">
                    <Button variant="ghost">Más info</Button>
                  </Link>
                </div>
              </Card>
            </aside>
          </div>
        </div>
      </main>
    </div>
  )
}