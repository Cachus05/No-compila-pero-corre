"use client"

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Navigation } from "@/components/navigation_cliente"
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Loader2, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Download,
  Image as ImageIcon,
  MessageCircle,
  Calendar,
  DollarSign
} from 'lucide-react'

interface Usuario {
  id: number
  first_name: string
  last_name: string
  email: string
  avatar?: string
}

interface Proyecto {
  id: number
  service_title: string
  description: string
  budget: number
  deadline: string
  status: string
  freelancer_first_name: string
  freelancer_last_name: string
  freelancer_avatar: string | null
  created_at: string
}

interface Avance {
  id: number
  titulo: string
  descripcion: string
  archivos: string[]
  created_at: string
  freelancer_first_name: string
  freelancer_last_name: string
  freelancer_avatar: string | null
}

export default function AvancesProyectoClientePage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.id

  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [proyecto, setProyecto] = useState<Proyecto | null>(null)
  const [avances, setAvances] = useState<Avance[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingAvances, setLoadingAvances] = useState(true)

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuario')
    if (!usuarioGuardado) {
      router.push('/login')
      return
    }

    const user = JSON.parse(usuarioGuardado)
    
    // Verificar que sea cliente
    if (user.user_type !== 'client') {
      router.push('/dashboard')
      return
    }

    setUsuario(user)
  }, [router])

  useEffect(() => {
    if (usuario && projectId) {
      cargarProyecto()
      cargarAvances()
    }
  }, [usuario, projectId])

  const cargarProyecto = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/projects/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setProyecto(data.proyecto)
      } else {
        console.error('Error al cargar proyecto')
      }
    } catch (error) {
      console.error('Error al cargar proyecto:', error)
    } finally {
      setLoading(false)
    }
  }

  const cargarAvances = async () => {
    try {
      setLoadingAvances(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/project-updates?projectId=${projectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setAvances(data.avances || [])
      } else {
        console.error('Error al cargar avances')
      }
    } catch (error) {
      console.error('Error al cargar avances:', error)
    } finally {
      setLoadingAvances(false)
    }
  }

  const handleContactarFreelancer = () => {
    if (proyecto) {
      router.push(`/dashboard_cliente/mensajes?freelancerId=${proyecto.freelancer_first_name}`)
    }
  }

  const getArchivoIcon = (archivo: string) => {
    if (archivo.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      return <ImageIcon className="h-5 w-5" />
    }
    return <FileText className="h-5 w-5" />
  }

  const esImagen = (archivo: string) => {
    return archivo.match(/\.(jpg|jpeg|png|gif|webp)$/i)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (!proyecto) {
    return (
      <div className="min-h-screen bg-neutral-950">
        <Navigation />
        <div className="container mx-auto px-6 py-10 text-center">
          <p className="text-gray-400 mb-4">Proyecto no encontrado</p>
          <Button
            onClick={() => router.push('/dashboard_cliente')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Volver al dashboard
          </Button>
        </div>
      </div>
    )
  }

  const statusConfig = {
    pending: { label: 'Pendiente', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    active: { label: 'En progreso', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
    in_progress: { label: 'En progreso', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
    review: { label: 'En revisión', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    completed: { label: 'Completado', color: 'bg-teal-500/20 text-teal-400 border-teal-500/30' },
    cancelled: { label: 'Cancelado', color: 'bg-red-500/20 text-red-400 border-red-500/30' }
  }

  const status = statusConfig[proyecto.status as keyof typeof statusConfig] || statusConfig.pending

  const inicialesFreelancer = proyecto?.freelancer_first_name && proyecto?.freelancer_last_name
    ? `${proyecto.freelancer_first_name.charAt(0)}${proyecto.freelancer_last_name.charAt(0)}`
    : 'FL'

  return (
    <div className="min-h-screen bg-neutral-950">
      <Navigation />

      <main className="container mx-auto px-6 py-10 max-w-7xl">
        {/* Header con botón de regreso */}
        <div className="mb-8">
          <Button
            onClick={() => router.push('/dashboard_cliente')}
            variant="ghost"
            className="mb-4 text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al dashboard
          </Button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Avances del proyecto
              </h1>
              <p className="text-gray-400">
                Revisa el progreso de tu proyecto
              </p>
            </div>
            <Badge className={`${status.color} border`}>
              {status.label}
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sidebar - Información del proyecto */}
          <aside className="lg:col-span-1 space-y-6">
            {/* Info del proyecto */}
            <Card className="p-6 bg-neutral-900 border-gray-800">
              <h3 className="font-semibold text-white mb-4">Información del proyecto</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Servicio</p>
                  <p className="text-white font-medium">{proyecto.service_title}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-400 mb-1">Freelancer</p>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={proyecto.freelancer_avatar || undefined} />
                      <AvatarFallback className="text-xs bg-teal-600">
                        {inicialesFreelancer}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-white">
                      {proyecto.freelancer_first_name} {proyecto.freelancer_last_name}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-400">Presupuesto</p>
                    <p className="text-white font-semibold text-lg">
                      ${typeof proyecto.budget === 'number' ? proyecto.budget.toFixed(2) : proyecto.budget}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-400">Fecha límite</p>
                    <p className="text-white">
                      {new Date(proyecto.deadline).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-700">
                  <p className="text-sm text-gray-400 mb-2">Descripción</p>
                  <p className="text-sm text-gray-300">{proyecto.description}</p>
                </div>
              </div>

              <Button
                onClick={handleContactarFreelancer}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Contactar freelancer
              </Button>
            </Card>

            {/* Estadísticas */}
            <Card className="p-6 bg-neutral-900 border-gray-800">
              <h3 className="font-semibold text-white mb-4">Estadísticas</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Total de avances</span>
                  <Badge variant="secondary" className="bg-blue-600/20 text-blue-400">
                    {avances.length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Iniciado</span>
                  <span className="text-sm text-white">
                    {new Date(proyecto.created_at).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'short'
                    })}
                  </span>
                </div>
              </div>
            </Card>
          </aside>

          {/* Contenido principal - Timeline de avances */}
          <div className="lg:col-span-2">
            <Card className="p-8 bg-neutral-900 border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  Timeline de avances
                </h2>
                <Button
                  onClick={cargarAvances}
                  variant="outline"
                  size="sm"
                  className="border-gray-700 hover:bg-gray-800"
                  disabled={loadingAvances}
                >
                  {loadingAvances ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Actualizar'
                  )}
                </Button>
              </div>

              {loadingAvances ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  <span className="ml-3 text-gray-400">Cargando avances...</span>
                </div>
              ) : avances.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="h-16 w-16 mx-auto text-gray-600 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Aún no hay avances
                  </h3>
                  <p className="text-gray-400 mb-4">
                    El freelancer compartirá actualizaciones del progreso aquí
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {avances.map((avance, index) => {
                    const inicialesAvance = avance?.freelancer_first_name && avance?.freelancer_last_name
                      ? `${avance.freelancer_first_name.charAt(0)}${avance.freelancer_last_name.charAt(0)}`
                      : 'FL'
                    
                    return (
                      <div key={avance.id} className="relative">
                        {/* Línea de timeline */}
                        {index !== avances.length - 1 && (
                          <div className="absolute left-4 top-12 bottom-0 w-0.5 bg-gray-700" />
                        )}

                        <Card className="p-6 bg-neutral-800 border-gray-700 hover:border-gray-600 transition-colors">
                          <div className="flex gap-4">
                            {/* Avatar con indicador */}
                            <div className="relative flex-shrink-0">
                              <Avatar className="h-10 w-10 ring-2 ring-neutral-900">
                                <AvatarImage src={avance.freelancer_avatar || undefined} />
                                <AvatarFallback className="bg-teal-600 text-white">
                                  {inicialesAvance}
                                </AvatarFallback>
                              </Avatar>
                              <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                                <CheckCircle2 className="h-3 w-3 text-white" />
                              </div>
                            </div>

                            <div className="flex-1 min-w-0">
                              {/* Header del avance */}
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h3 className="font-semibold text-white text-lg mb-1">
                                    {avance.titulo}
                                  </h3>
                                  <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <span>
                                      {avance.freelancer_first_name} {avance.freelancer_last_name}
                                    </span>
                                    <span>•</span>
                                    <span>
                                      {new Date(avance.created_at).toLocaleDateString('es-ES', {
                                        day: '2-digit',
                                        month: 'long',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Descripción */}
                              <p className="text-gray-300 mb-4 whitespace-pre-wrap">
                                {avance.descripcion}
                              </p>

                              {/* Archivos adjuntos */}
                              {avance.archivos && avance.archivos.length > 0 && (
                                <div>
                                  <p className="text-sm text-gray-400 mb-3 font-medium">
                                    Archivos adjuntos ({avance.archivos.length})
                                  </p>
                                  
                                  {/* Mostrar imágenes en grid */}
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                                    {avance.archivos.filter(esImagen).map((archivo, idx) => (
                                      <a
                                        key={idx}
                                        href={archivo}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group relative aspect-video rounded-lg overflow-hidden bg-neutral-700 hover:ring-2 hover:ring-blue-500 transition-all"
                                      >
                                        <img
                                          src={archivo}
                                          alt={`Archivo ${idx + 1}`}
                                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                          <Download className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                      </a>
                                    ))}
                                  </div>

                                  {/* Otros archivos */}
                                  <div className="space-y-2">
                                    {avance.archivos.filter(a => !esImagen(a)).map((archivo, idx) => {
                                      const nombreArchivo = archivo.split('/').pop() || `archivo-${idx}`
                                      return (
                                        <a
                                          key={idx}
                                          href={archivo}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex items-center gap-3 p-3 bg-neutral-700 rounded-lg hover:bg-neutral-600 transition-colors"
                                        >
                                          {getArchivoIcon(archivo)}
                                          <span className="flex-1 text-sm text-white truncate">
                                            {nombreArchivo}
                                          </span>
                                          <Download className="h-4 w-4 text-gray-400" />
                                        </a>
                                      )
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </Card>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}