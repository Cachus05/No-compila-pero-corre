"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Navigation } from "@/components/navigation_freelance"
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Upload, Loader2, CheckCircle2, X, FileText, Image as ImageIcon } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

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
  client_first_name: string
  client_last_name: string
  client_avatar: string | null
}

export default function AgregarAvancePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const projectId = searchParams.get('projectId')

  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [proyecto, setProyecto] = useState<Proyecto | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string>('')

  // Form state
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [archivos, setArchivos] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuario')
    if (!usuarioGuardado) {
      router.push('/login')
      return
    }

    const user = JSON.parse(usuarioGuardado)
    setUsuario(user)

    if (projectId) {
      cargarProyecto()
    } else {
      setLoading(false)
    }
  }, [projectId, router])

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
      }
    } catch (error) {
      console.error('Error al cargar proyecto:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newFiles = Array.from(files)
    const totalFiles = archivos.length + newFiles.length

    if (totalFiles > 5) {
      setError('Máximo 5 archivos permitidos')
      return
    }

    // Validar tamaño de archivos (10MB cada uno)
    const MAX_SIZE = 10 * 1024 * 1024 // 10MB
    for (const file of newFiles) {
      if (file.size > MAX_SIZE) {
        setError(`El archivo "${file.name}" excede el tamaño máximo de 10MB`)
        return
      }
    }

    setError('')

    // Crear previews para imágenes
    const newPreviews: string[] = []
    let loadedCount = 0

    newFiles.forEach((file, index) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          newPreviews[index] = reader.result as string
          loadedCount++
          if (loadedCount === newFiles.length) {
            setPreviews([...previews, ...newPreviews])
          }
        }
        reader.readAsDataURL(file)
      } else {
        newPreviews[index] = ''
        loadedCount++
        if (loadedCount === newFiles.length) {
          setPreviews([...previews, ...newPreviews])
        }
      }
    })

    setArchivos([...archivos, ...newFiles])
  }

  const removeFile = (index: number) => {
    setArchivos(archivos.filter((_, i) => i !== index))
    setPreviews(previews.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!titulo.trim() || !descripcion.trim()) {
      setError('Por favor completa todos los campos obligatorios')
      return
    }

    if (!projectId) {
      setError('ID de proyecto no encontrado')
      return
    }

    setSubmitting(true)

    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()
      
      formData.append('projectId', projectId)
      formData.append('titulo', titulo)
      formData.append('descripcion', descripcion)
      
      // Agregar archivos
      archivos.forEach((file) => {
        formData.append('archivos', file)
      })

      console.log('Enviando avance...', {
        projectId,
        titulo,
        descripcion,
        numArchivos: archivos.length
      })

      const response = await fetch('/api/project-updates', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      console.log('Respuesta status:', response.status)
      console.log('Content-Type:', response.headers.get('content-type'))

      // Verificar si la respuesta es JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text()
        console.error('Respuesta no es JSON:', text.substring(0, 200))
        throw new Error('El servidor retornó una respuesta inválida (no JSON)')
      }

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } else {
        setError(data.error || 'Error al crear el avance')
        console.error('Error del servidor:', data)
      }
    } catch (error) {
      console.error('Error completo:', error)
      setError(error instanceof Error ? error.message : 'Error al enviar el avance')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
      </div>
    )
  }

  const iniciales = usuario 
    ? `${usuario.first_name.charAt(0)}${usuario.last_name.charAt(0)}`.toUpperCase()
    : 'U'

  return (
    <div className="min-h-screen bg-neutral-950">
      <Navigation />

      <main className="container mx-auto px-6 py-10 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Agregar avance del proyecto</h1>
          <p className="text-gray-400">
            Comparte el progreso de tu trabajo con el cliente
          </p>
        </div>

        {/* Alert de error */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-600/20 border border-red-600/30 p-4 flex items-start gap-3">
            <X className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-400 mb-1">Error</h3>
              <p className="text-sm text-red-300">{error}</p>
            </div>
          </div>
        )}

        {/* Alert de éxito */}
        {success && (
          <div className="mb-6 rounded-lg bg-green-600/20 border border-green-600/30 p-4 flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-400 mb-1">¡Avance agregado exitosamente!</h3>
              <p className="text-sm text-green-300">
                El cliente ha sido notificado. Redirigiendo al dashboard...
              </p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sidebar - Info del proyecto */}
          <aside className="lg:col-span-1">
            <Card className="p-6 bg-neutral-900 border-gray-800">
              <h3 className="font-semibold text-white mb-4">Información del proyecto</h3>
              
              {proyecto ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Servicio</p>
                    <p className="text-white font-medium">{proyecto.service_title}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400 mb-1">Cliente</p>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={proyecto.client_avatar || undefined} />
                        <AvatarFallback className="text-xs">
                          {`${proyecto.client_first_name.charAt(0)}${proyecto.client_last_name.charAt(0)}`}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-white">
                        {proyecto.client_first_name} {proyecto.client_last_name}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400 mb-1">Presupuesto</p>
                    <p className="text-white font-semibold text-xl">
                      ${typeof proyecto.budget === 'number' ? proyecto.budget.toFixed(2) : (proyecto.budget || '0.00')}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400 mb-1">Fecha límite</p>
                    <p className="text-white">
                      {new Date(proyecto.deadline).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-700">
                    <p className="text-sm text-gray-400 mb-2">Requerimientos del cliente</p>
                    <p className="text-sm text-gray-300">{proyecto.description}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Selecciona un proyecto</p>
                </div>
              )}
            </Card>

            {/* Tu perfil */}
            {usuario && (
              <Card className="p-6 bg-neutral-900 border-gray-800 mt-6">
                <h3 className="font-semibold text-white mb-4">Tu perfil</h3>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={usuario.avatar} />
                    <AvatarFallback>{iniciales}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-white">
                      {usuario.first_name} {usuario.last_name}
                    </p>
                    <p className="text-sm text-gray-400">{usuario.email}</p>
                  </div>
                </div>
              </Card>
            )}
          </aside>

          {/* Formulario principal */}
          <div className="lg:col-span-2">
            <Card className="p-8 bg-neutral-900 border-gray-800">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Título del avance */}
                <div>
                  <Label htmlFor="titulo" className="text-white mb-2 block">
                    Título del avance *
                  </Label>
                  <Input
                    id="titulo"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Ej: Diseño inicial completado"
                    className="bg-neutral-800 border-gray-700 text-white"
                    required
                    maxLength={100}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {titulo.length}/100 caracteres
                  </p>
                </div>

                {/* Descripción del avance */}
                <div>
                  <Label htmlFor="descripcion" className="text-white mb-2 block">
                    Describe el avance realizado *
                  </Label>
                  <Textarea
                    id="descripcion"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Explica en detalle qué has logrado, qué falta por hacer, y si hay algo que el cliente deba revisar..."
                    className="bg-neutral-800 border-gray-700 text-white min-h-[150px]"
                    required
                    maxLength={1000}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {descripcion.length}/1000 caracteres
                  </p>
                </div>

                {/* Adjuntar archivos */}
                <div>
                  <Label className="text-white mb-2 block">
                    Adjuntar archivos
                  </Label>
                  <p className="text-sm text-gray-400 mb-3">
                    Adjunta imágenes, documentos o archivos que muestren tu progreso (máximo 5 archivos, 10MB cada uno)
                  </p>

                  <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-gray-600 transition-colors">
                    <input
                      type="file"
                      id="file-upload"
                      multiple
                      accept="image/*,.pdf,.doc,.docx,.zip"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={archivos.length >= 5}
                    />
                    <label
                      htmlFor="file-upload"
                      className={`cursor-pointer ${archivos.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Upload className="h-10 w-10 mx-auto mb-2 text-gray-500" />
                      <p className="text-sm text-gray-400">
                        Haz click para seleccionar archivos
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG, PDF, DOC, ZIP hasta 10MB
                      </p>
                    </label>
                  </div>

                  {/* Preview de archivos */}
                  {archivos.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {archivos.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg border border-gray-700"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {file.type.startsWith('image/') && previews[index] ? (
                              <img
                                src={previews[index]}
                                alt={file.name}
                                className="h-12 w-12 object-cover rounded"
                              />
                            ) : (
                              <div className="h-12 w-12 bg-neutral-700 rounded flex items-center justify-center">
                                <FileText className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white truncate">{file.name}</p>
                              <p className="text-xs text-gray-500">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Botones de acción */}
                <div className="flex gap-4 pt-4 border-t border-gray-700">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={submitting}
                    className="border-gray-700 text-gray-300"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting || !titulo.trim() || !descripcion.trim()}
                    className="bg-teal-600 hover:bg-teal-700 text-white flex-1"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Enviando avance...
                      </>
                    ) : (
                      'Agregar avance'
                    )}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}