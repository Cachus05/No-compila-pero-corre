"use client"

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Navigation } from "@/components/navigation_cliente"
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Loader2, Star, Clock, CheckCircle2, MessageCircle, Package } from 'lucide-react'
import ContratarDialog from '@/components/contratar-dialog'

interface Servicio {
  id: number
  title: string
  description: string
  category: string
  subcategory: string | null
  base_price: number | string
  delivery_time: number
  gallery_images: string[]
  freelancer_id: number
  // Datos del freelancer vienen directamente en el objeto
  first_name: string
  last_name: string
  avatar: string | null
  email: string
}

export default function ContratarServicioPage() {
  const params = useParams()
  const router = useRouter()
  const { id } = params || {}

  const [servicio, setServicio] = useState<Servicio | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedImage, setSelectedImage] = useState(0)

  useEffect(() => {
    if (!id) {
      console.log('No hay ID en params')
      return
    }
    
    const fetchServicio = async () => {
      console.log('Cargando servicio con ID:', id)
      setLoading(true)
      setError('')
      try {
        const res = await fetch(`/api/services/${id}`)
        console.log('Response status:', res.status)
        
        if (res.ok) {
          const data = await res.json()
          console.log('Datos del servicio:', data)
          setServicio(data.servicio)
        } else {
          console.error('Error en respuesta:', res.status)
          setError('Servicio no encontrado')
          setTimeout(() => router.push('/dashboard_cliente/contratar'), 2000)
        }
      } catch (err) {
        console.error('Error al cargar servicio:', err)
        setError('Error al cargar el servicio')
      } finally {
        setLoading(false)
      }
    }

    fetchServicio()
  }, [id, router])

  const formatearPrecio = (precio: number | string): string => {
    const precioNumero = typeof precio === 'string' ? parseFloat(precio) : precio
    return isNaN(precioNumero) ? '0.00' : precioNumero.toFixed(2)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950">
        <Navigation />
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="h-12 w-12 animate-spin text-teal-500 mb-4" />
          <p className="text-gray-400">Cargando servicio...</p>
        </div>
      </div>
    )
  }

  if (error || !servicio) {
    return (
      <div className="min-h-screen bg-neutral-950">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-32 text-center">
          <div className="text-red-400 text-lg mb-4">{error || 'Servicio no encontrado'}</div>
          <Button onClick={() => router.push('/dashboard_cliente/contratar')} variant="outline">
            Volver a servicios
          </Button>
        </div>
      </div>
    )
  }

  // Validar que servicio tenga los datos necesarios
  if (!servicio.title || !servicio.base_price) {
    console.error('Datos del servicio incompletos:', servicio)
    return (
      <div className="min-h-screen bg-neutral-950">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-32 text-center">
          <div className="text-red-400 text-lg mb-4">Error: Datos del servicio incompletos</div>
          <Button onClick={() => router.push('/dashboard_cliente/contratar')} variant="outline">
            Volver a servicios
          </Button>
        </div>
      </div>
    )
  }

  // Los datos del freelancer vienen directamente en el objeto servicio
  const nombreCompleto = `${servicio.first_name || 'Usuario'} ${servicio.last_name || ''}`
  const iniciales = `${(servicio.first_name || 'U').charAt(0)}${(servicio.last_name || 'U').charAt(0)}`
  const avatarFreelancer = servicio.avatar || null
  const emailFreelancer = servicio.email || ''
  
  const imagenes = servicio.gallery_images && servicio.gallery_images.length > 0 
    ? servicio.gallery_images 
    : ['/placeholder.svg']

  return (
    <div className="min-h-screen bg-neutral-950">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-gray-400">
          <button onClick={() => router.push('/dashboard_cliente/contratar')} className="hover:text-teal-400 transition-colors">
            Servicios
          </button>
          <span className="mx-2">/</span>
          <span className="text-gray-300">{servicio.title}</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Columna principal - Izquierda */}
          <div className="lg:col-span-2 space-y-6">
            {/* Galería de imágenes */}
            <Card className="overflow-hidden bg-neutral-900 border-gray-800">
              {/* Imagen principal */}
              <div className="aspect-video bg-neutral-800 relative">
                <img
                  src={imagenes[selectedImage]}
                  alt={servicio.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg'
                  }}
                />
              </div>

              {/* Miniaturas */}
              {imagenes.length > 1 && (
                <div className="p-4 flex gap-2 overflow-x-auto">
                  {imagenes.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === idx 
                          ? 'border-teal-500 ring-2 ring-teal-500/50' 
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Imagen ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg'
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </Card>

            {/* Información del servicio */}
            <Card className="p-6 bg-neutral-900 border-gray-800">
              <div className="mb-4">
                <Badge className="mb-3 bg-teal-600/20 text-teal-400 border-teal-600/30">
                  {servicio.category}
                </Badge>
                <h1 className="text-3xl font-bold text-white mb-4">
                  {servicio.title}
                </h1>
              </div>

              <div className="prose prose-invert max-w-none">
                <h3 className="text-lg font-semibold text-white mb-3">Descripción</h3>
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {servicio.description}
                </p>
              </div>
            </Card>

            {/* Características del servicio */}
            <Card className="p-6 bg-neutral-900 border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Lo que incluye este servicio</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-teal-600/20 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-teal-400" />
                  </div>
                  <div>
                    <div className="font-medium text-white">Entrega rápida</div>
                    <div className="text-sm text-gray-400">
                      {servicio.delivery_time} días de entrega
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-teal-600/20 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-teal-400" />
                  </div>
                  <div>
                    <div className="font-medium text-white">Trabajo profesional</div>
                    <div className="text-sm text-gray-400">
                      Calidad garantizada
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-teal-600/20 flex items-center justify-center">
                    <MessageCircle className="h-5 w-5 text-teal-400" />
                  </div>
                  <div>
                    <div className="font-medium text-white">Comunicación directa</div>
                    <div className="text-sm text-gray-400">
                      Chat con el freelancer
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-teal-600/20 flex items-center justify-center">
                    <Package className="h-5 w-5 text-teal-400" />
                  </div>
                  <div>
                    <div className="font-medium text-white">Revisiones incluidas</div>
                    <div className="text-sm text-gray-400">
                      Ajustes según tu feedback
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Columna derecha - Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Card del freelancer */}
              <Card className="p-6 bg-neutral-900 border-gray-800">
                <div className="text-sm text-gray-400 mb-3">Freelancer</div>
                <div className="flex items-center gap-4 mb-6">
                  <Avatar className="h-14 w-14">
                    <AvatarImage 
                      src={avatarFreelancer || undefined} 
                      alt={nombreCompleto} 
                    />
                    <AvatarFallback className="text-lg bg-teal-600 text-white">
                      {iniciales}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-semibold text-white text-lg">
                      {nombreCompleto}
                    </div>
                    <div className="text-sm text-gray-400">
                      {emailFreelancer}
                    </div>
                  </div>
                </div>

                {/* Rating placeholder */}
                <div className="flex items-center gap-2 py-3 border-t border-gray-800">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-white">5.0</span>
                  <span className="text-sm text-gray-400">(Nuevo)</span>
                </div>
              </Card>

              {/* Card de precio y contratación */}
              <Card className="p-6 bg-neutral-900 border-gray-800">
                <div className="mb-6">
                  <div className="text-sm text-gray-400 mb-2">Precio del servicio</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-teal-400">
                      ${formatearPrecio(servicio.base_price)}
                    </span>
                    <span className="text-gray-400">USD</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Tiempo de entrega</span>
                    <span className="text-white font-medium">{servicio.delivery_time} días</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Revisiones</span>
                    <span className="text-white font-medium">Incluidas</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* MODIFICACIÓN: Pasar serviceId al componente */}
                  <ContratarDialog serviceId={servicio.id}>
                    <Button className="w-full py-6 text-lg font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-lg hover:shadow-teal-600/25 transition-all">
                      Contratar servicio
                    </Button>
                  </ContratarDialog>

                  <Button 
                    variant="outline"
                    className="w-full py-6 rounded-xl border-gray-700 text-gray-200 hover:bg-neutral-800 transition-all"
                    onClick={() => {
                      router.push(`/dashboard_cliente/mensajes?freelancerId=${servicio.freelancer_id}`)
                    }}
                  >
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Contactar freelancer
                  </Button>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-800">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <CheckCircle2 className="h-4 w-4 text-teal-400" />
                    <span>Protección al comprador</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400 mt-2">
                    <CheckCircle2 className="h-4 w-4 text-teal-400" />
                    <span>Pago seguro</span>
                  </div>
                </div>
              </Card>

              {/* Botón para volver */}
              <Button
                variant="ghost"
                className="w-full text-gray-400 hover:text-white"
                onClick={() => router.push('/dashboard_cliente/contratar')}
              >
                ← Volver a todos los servicios
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}