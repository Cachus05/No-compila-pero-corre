"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Navigation } from "@/components/navigation_cliente"
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Search, Loader2, CheckCircle2, Clock, DollarSign, FileText, AlertCircle, Star, Eye } from 'lucide-react'

interface Contrato {
  id: number
  client_id: number
  service_title: string
  category: string
  budget: number | string
  status: string
  deadline: string
  created_at: string
  freelancer_first_name: string
  freelancer_last_name: string
  freelancer_email: string
}

interface Pago {
  id: number
  amount: number | string
  payment_method: string
  status: string
  payment_date: string
  service_title: string
  freelancer_first_name: string
  freelancer_last_name: string
}

interface Servicio {
  id: number
  title: string
  description: string
  category: string
  base_price: number | string
  delivery_time: number
  gallery_images: string[]
  first_name: string
  last_name: string
  avatar: string | null
}

export default function DashboardClientePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [usuario, setUsuario] = useState<any>(null)
  const [contratos, setContratos] = useState<Contrato[]>([])
  const [pagos, setPagos] = useState<Pago[]>([])
  const [serviciosDestacados, setServiciosDestacados] = useState<Servicio[]>([])
  const [loading, setLoading] = useState(true)
  const [contratoExitoso, setContratoExitoso] = useState(false)

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuario')
    if (!usuarioGuardado) {
      router.push('/login')
      return
    }
    setUsuario(JSON.parse(usuarioGuardado))

    // Verificar si viene de un contrato exitoso
    const contratoId = searchParams.get('contratoExitoso')
    if (contratoId) {
      setContratoExitoso(true)
      setTimeout(() => {
        setContratoExitoso(false)
        router.replace('/dashboard_cliente')
      }, 5000)
    }
  }, [router, searchParams])

  useEffect(() => {
    if (usuario) {
      cargarDatos()
    }
  }, [usuario])

  const cargarDatos = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      
      // Cargar contratos
      const resContratos = await fetch('/api/contratos', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (resContratos.ok) {
        const dataContratos = await resContratos.json()
        const misContratos = (dataContratos.contratos || []).filter(
          (c: any) => usuario && c.client_id === usuario.id
        )
        setContratos(misContratos)
      }

      // Cargar pagos
      const resPagos = await fetch('/api/pagos', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (resPagos.ok) {
        const dataPagos = await resPagos.json()
        setPagos(dataPagos.pagos || [])
      }

      // Cargar servicios destacados
      const resServicios = await fetch('/api/services')
      if (resServicios.ok) {
        const dataServicios = await resServicios.json()
        setServiciosDestacados((dataServicios.servicios || []).slice(0, 3))
      }

    } catch (error) {
      console.error('Error al cargar datos:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatearPrecio = (precio: number | string) => {
    const precioNumero = typeof precio === 'string' ? parseFloat(precio) : precio
    return isNaN(precioNumero) ? '0.00' : precioNumero.toFixed(2)
  }

  const calcularTotalGastado = () => {
    return pagos.reduce((sum, p) => {
      const amount = typeof p.amount === 'string' ? parseFloat(p.amount) : p.amount
      return sum + (isNaN(amount) ? 0 : amount)
    }, 0)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pendiente', className: 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30' },
      in_progress: { label: 'En progreso', className: 'bg-blue-600/20 text-blue-400 border-blue-600/30' },
      completed: { label: 'Completado', className: 'bg-green-600/20 text-green-400 border-green-600/30' },
      cancelled: { label: 'Cancelado', className: 'bg-red-600/20 text-red-400 border-red-600/30' },
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    return <Badge className={config.className}>{config.label}</Badge>
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      <Navigation />
      
      <main className="container mx-auto px-6 py-10 max-w-7xl">
        {/* Alert de éxito */}
        {contratoExitoso && (
          <div className="mb-6 rounded-lg bg-green-600/20 border border-green-600/30 p-4 flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-400 mb-1">¡Contrato creado exitosamente!</h3>
              <p className="text-sm text-green-300">
                Tu pago se ha procesado correctamente. El freelancer ha sido notificado y pronto comenzará a trabajar en tu proyecto.
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Bienvenido, {usuario?.first_name || 'cliente'}
          </h1>
          <p className="text-gray-400">
            Panel del cliente — busca servicios, contacta profesionales y gestiona pagos de forma segura
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="p-6 bg-neutral-900 border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Contratos activos</p>
                <p className="text-3xl font-bold text-white">{contratos.length}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-teal-600/20 flex items-center justify-center">
                <FileText className="h-6 w-6 text-teal-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-neutral-900 border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Total gastado</p>
                <p className="text-3xl font-bold text-white">
                  ${formatearPrecio(calcularTotalGastado())}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-600/20 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-neutral-900 border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Pagos realizados</p>
                <p className="text-3xl font-bold text-white">{pagos.length}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-green-600/20 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Servicios destacados */}
        <Card className="p-6 bg-neutral-900 border-gray-800 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">
              Servicios destacados ({serviciosDestacados.length})
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard_cliente/contratar')}
              className="text-teal-400 hover:text-teal-300"
            >
              Actualizar
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
            </div>
          ) : serviciosDestacados.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No hay servicios disponibles</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {serviciosDestacados.map((servicio) => {
                const imagenPrincipal = servicio.gallery_images?.[0] || '/placeholder.svg'
                const iniciales = `${servicio.first_name?.charAt(0) || 'U'}${servicio.last_name?.charAt(0) || 'U'}`
                
                return (
                  <Link
                    key={servicio.id}
                    href={`/dashboard_cliente/contratar/${servicio.id}`}
                    className="group"
                  >
                    <Card className="overflow-hidden bg-neutral-800 border-gray-700 hover:border-gray-600 transition-all">
                      <div className="aspect-video overflow-hidden bg-neutral-900">
                        <img
                          src={imagenPrincipal}
                          alt={servicio.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.svg'
                          }}
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-white mb-2 line-clamp-2">
                          {servicio.title}
                        </h3>
                        <div className="flex items-center gap-2 mb-3">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={servicio.avatar || undefined} />
                            <AvatarFallback className="text-xs">{iniciales}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-gray-400">
                            {servicio.first_name} {servicio.last_name}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <Badge className="bg-teal-600/20 text-teal-400 border-none text-xs">
                            {servicio.category}
                          </Badge>
                          <div className="text-right">
                            <div className="text-xs text-gray-400">Desde</div>
                            <div className="text-lg font-bold text-white">
                              ${formatearPrecio(servicio.base_price)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                )
              })}
            </div>
          )}
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contratos activos */}
          <div className="lg:col-span-2">
            <Card className="p-6 bg-neutral-900 border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Contratos activos</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/dashboard_cliente/contratar')}
                  className="border-gray-700"
                >
                  Buscar profesionales
                </Button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
                </div>
              ) : contratos.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-400 mb-2">No tienes contratos activos aún.</p>
                  <p className="text-sm text-gray-500 mb-4">
                    Explora los servicios disponibles y contrata a un freelancer
                  </p>
                  <Button
                    onClick={() => router.push('/dashboard_cliente/contratar')}
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    Explorar servicios
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {contratos.map((contrato) => (
                    <div
                      key={contrato.id}
                      className="p-4 rounded-lg bg-neutral-800 border border-gray-700 hover:border-gray-600 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-white mb-1">
                            {contrato.service_title}
                          </h3>
                          <p className="text-sm text-gray-400">
                            Freelancer: {contrato.freelancer_first_name} {contrato.freelancer_last_name}
                          </p>
                        </div>
                        {getStatusBadge(contrato.status)}
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 mb-1">Presupuesto</p>
                          <p className="font-semibold text-white">${formatearPrecio(contrato.budget)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Fecha límite</p>
                          <p className="font-semibold text-white">
                            {formatearFecha(contrato.deadline)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Categoría</p>
                          <Badge variant="secondary" className="bg-blue-600/20 text-blue-400 border-none">
                            {contrato.category}
                          </Badge>
                        </div>
                      </div>

                      <div className="mt-4 flex gap-2">
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => router.push(`/dashboard_cliente/proyecto/${contrato.id}/avances`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver avances
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push('/dashboard_cliente/mensajes')}
                          className="border-gray-700"
                        >
                          Ver chat
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-gray-400"
                        >
                          Ver detalles
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pagos recientes */}
            <Card className="p-6 bg-neutral-900 border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">Pagos recientes</h3>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-teal-400 hover:text-teal-300"
                >
                  Ver todos
                </Button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-teal-500" />
                </div>
              ) : pagos.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No hay pagos registrados
                </p>
              ) : (
                <div className="space-y-3">
                  {pagos.slice(0, 5).map((pago) => (
                    <div
                      key={pago.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-neutral-800"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-green-600/20 flex items-center justify-center">
                          <CheckCircle2 className="h-5 w-5 text-green-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            ${formatearPrecio(pago.amount)}
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatearFecha(pago.payment_date)}
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-green-600/20 text-green-400 border-none text-xs">
                        Completado
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Acciones rápidas */}
            <Card className="p-6 bg-neutral-900 border-gray-800">
              <h3 className="font-semibold text-white mb-4">Acciones rápidas</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start border-gray-700 text-gray-300"
                  onClick={() => router.push('/dashboard_cliente/contratar')}
                >
                  <Search className="h-4 w-4 mr-2" />
                  Buscar profesionales
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-gray-700 text-gray-300"
                  onClick={() => router.push('/dashboard_cliente/mensajes')}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Ver mensajes
                </Button>
              </div>
            </Card>

            {/* Seguridad de pagos */}
            <Card className="p-6 bg-neutral-900 border-gray-800">
              <h3 className="font-semibold text-white mb-3">Seguridad de pagos</h3>
              <p className="text-sm text-gray-400 mb-3">
                Pagos protegidos y gestión de disputas
              </p>
              <Button
                variant="link"
                size="sm"
                className="text-teal-400 hover:text-teal-300 p-0"
              >
                Más info →
              </Button>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}