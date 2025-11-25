"use client"

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Navigation } from "@/components/navigation_freelance"
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import ContratarDialog from '@/components/contratar-dialog'
import { Loader2, Edit3, Trash2, CheckCircle2, X } from 'lucide-react'

const categories = [
  "Diseño",
  "Desarrollo",
  "Escritura",
  "Video",
  "Marketing",
  "Traducción",
  "Consultoría",
  "Fotografía",
  "Música",
  "Animación",
]

export default function ServicioPage() {
  const params = useParams()
  const router = useRouter()
  const { id } = params || {}

  const [servicio, setServicio] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  // Edit form
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [currentImages, setCurrentImages] = useState<string[]>([])

  useEffect(() => {
    if (!id) return
    const fetchServicio = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/services/${id}`)
        if (res.ok) {
          const data = await res.json()
          setServicio(data.servicio)
          setTitle(data.servicio.title || '')
          setDescription(data.servicio.description || '')
          setPrice(String(data.servicio.base_price || ''))
          setCategory(data.servicio.category || '')
          setCurrentImages(data.servicio.gallery_images || [])
        } else {
          // not found
          router.push('/')
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchServicio()
  }, [id])

  const isOwner = () => {
    try {
      const usuario = JSON.parse(localStorage.getItem('usuario') || 'null')
      return usuario && servicio && usuario.id === servicio.freelancer_id
    } catch (e) {
      return false
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const maxNew = 5 - imageFiles.length
      const newFiles = Array.from(files).slice(0, maxNew)
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file))
      
      setImageFiles([...imageFiles, ...newFiles])
      setImagePreviews([...imagePreviews, ...newPreviews])
    }
  }

  const removeNewImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index])
    setImageFiles(imageFiles.filter((_, i) => i !== index))
    setImagePreviews(imagePreviews.filter((_, i) => i !== index))
  }

  const removeCurrentImage = (index: number) => {
    setCurrentImages(currentImages.filter((_, i) => i !== index))
  }

  const handleSave = async (close: () => void) => {
    setSaving(true)
    setErrorMessage('')
    setSuccessMessage('')
    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('No autorizado')

      const formData = new FormData()
      formData.append('title', title)
      formData.append('description', description)
      formData.append('price', price)
      formData.append('category', category)
      
      // Agregar imágenes nuevas
      imageFiles.forEach((file) => {
        formData.append('images', file)
      })
      
      // Agregar imágenes actuales que se mantienen
      formData.append('currentImages', JSON.stringify(currentImages))

      const res = await fetch(`/api/services/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      })

      if (res.ok) {
        // refresh
        const updated = await fetch(`/api/services/${id}`)
        const data = await updated.json()
        setServicio(data.servicio)
        setImageFiles([])
        setImagePreviews([])
        setCurrentImages(data.servicio.gallery_images || [])
        setSuccessMessage('Tu servicio ha sido actualizado exitosamente.')
        setIsEditing(false)
        setTimeout(() => setSuccessMessage(''), 5000)
      } else {
        const err = await res.json()
        setErrorMessage(err.error || 'Error al actualizar')
      }
    } catch (err) {
      console.error(err)
      setErrorMessage('Error al actualizar servicio')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('¿Eliminar este servicio? Esta acción es irreversible.')) return
    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('No autorizado')
      const res = await fetch(`/api/services/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        router.push('/dashboard')
      } else {
        const err = await res.json()
        alert(err.error || 'Error al eliminar')
      }
    } catch (err) {
      console.error(err)
      alert('Error al eliminar servicio')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
      </div>
    )
  }

  if (!servicio) return null

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Success/Error Messages */}
        {successMessage && (
          <Card className="mb-6 border-teal-500 bg-teal-500/10 p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-teal-500" />
              <div>
                <div className="font-semibold text-white">¡Cambios guardados!</div>
                <div className="text-sm text-gray-300">{successMessage}</div>
              </div>
            </div>
          </Card>
        )}

        {errorMessage && (
          <Card className="mb-6 border-red-500 bg-red-500/10 p-4">
            <div className="flex items-center gap-3">
              <X className="h-5 w-5 text-red-500" />
              <div>
                <div className="font-semibold text-white">Error</div>
                <div className="text-sm text-gray-300">{errorMessage}</div>
              </div>
            </div>
          </Card>
        )}

        <div className="mb-8">
          {!isEditing ? (
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-white">{servicio.title}</h1>
              <p className="mt-2 text-lg text-gray-400">Ver y gestionar tu servicio</p>
            </div>
          ) : (
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-white">Editar servicio</h1>
              <p className="mt-2 text-lg text-gray-400">Actualiza la información de tu servicio</p>
            </div>
          )}
        </div>

        {!isEditing ? (
          // Vista de lectura
          <div className="grid gap-6">
            {/* Imagen y resumen */}
            <Card className="p-6 bg-neutral-900 border-gray-800">
              {servicio.gallery_images && servicio.gallery_images.length > 0 ? (
                <img src={servicio.gallery_images[0]} alt={servicio.title} className="w-full h-96 object-cover rounded-lg mb-6" />
              ) : (
                <div className="w-full h-96 bg-neutral-800 rounded-lg flex items-center justify-center mb-6 text-gray-500">
                  Sin imagen
                </div>
              )}

              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <h2 className="text-2xl font-bold text-white mb-3">{servicio.title}</h2>
                  <p className="text-gray-300 leading-relaxed mb-4">{servicio.description}</p>
                  <Badge className="capitalize">{servicio.category}</Badge>
                </div>

                <aside className="space-y-6">
                  <div className="p-4 bg-neutral-800 rounded-lg">
                    <div className="text-sm text-gray-400">Freelancer</div>
                    <div className="flex items-center gap-3 mt-3">
                      <Avatar>
                        {servicio.avatar ? (
                          <AvatarImage src={servicio.avatar} alt={servicio.first_name} />
                        ) : null}
                        <AvatarFallback>{(servicio.first_name || 'U').charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-white">{servicio.first_name} {servicio.last_name}</div>
                        <div className="text-xs text-gray-400">{servicio.email}</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-neutral-800 rounded-lg">
                    <div className="text-sm text-gray-400">Desde</div>
                    <div className="text-3xl font-bold text-teal-500 mt-2">${servicio.base_price}</div>
                  </div>

                  <div className="space-y-3">
                    {isOwner() ? (
                      <>
                        <Button 
                          onClick={() => setIsEditing(true)}
                          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold transition-all"
                        >
                          <Edit3 className="h-4 w-4" />
                          Editar
                        </Button>
                        <Button 
                          onClick={handleDelete}
                          variant="destructive" 
                          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-red-700 hover:bg-red-800 text-white font-medium transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                          Eliminar
                        </Button>
                      </>
                    ) : (
                      <ContratarDialog>
                        <Button className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg transition-all">
                          Contratar
                        </Button>
                      </ContratarDialog>
                    )}
                  </div>
                </aside>
              </div>
            </Card>
          </div>
        ) : (
          // Formulario de edición
          <form onSubmit={(e) => { e.preventDefault(); handleSave(() => {}) }}>
            <div className="space-y-6">
              {/* Información básica */}
              <Card className="p-6 bg-neutral-900 border-gray-800">
                <h2 className="mb-6 text-xl font-semibold text-white">Información básica</h2>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-gray-200">
                      Título del servicio <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      placeholder="Ej: Diseño de logo profesional"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      disabled={saving}
                      className="bg-neutral-800 border-gray-700 text-white rounded-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-gray-200">
                      Categoría <span className="text-red-500">*</span>
                    </Label>
                    <Select value={category} onValueChange={setCategory} disabled={saving}>
                      <SelectTrigger id="category" className="bg-neutral-800 border-gray-700 text-white rounded-lg">
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-gray-200">
                      Descripción <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Describe tu servicio en detalle..."
                      rows={8}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                      disabled={saving}
                      className="bg-neutral-800 border-gray-700 text-white rounded-lg"
                    />
                  </div>
                </div>
              </Card>

              {/* Galería de imágenes */}
              <Card className="p-6 bg-neutral-900 border-gray-800">
                <h2 className="mb-6 text-xl font-semibold text-white">Galería de imágenes</h2>

                <div className="space-y-6">
                  {/* Imágenes actuales */}
                  {currentImages.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-gray-200">Imágenes actuales</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {currentImages.map((img, idx) => (
                          <div key={idx} className="relative group">
                            <img src={img} alt={`Imagen ${idx + 1}`} className="w-full h-24 object-cover rounded-lg border border-gray-700" />
                            <button
                              type="button"
                              onClick={() => removeCurrentImage(idx)}
                              disabled={saving}
                              className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-4 w-4 text-white" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Input de nuevas imágenes */}
                  <div className="space-y-2">
                    <Label htmlFor="images" className="text-gray-200">
                      Agregar nuevas imágenes
                    </Label>
                    <div className="flex flex-col gap-2">
                      <input
                        id="images"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={saving || (currentImages.length + imageFiles.length >= 5)}
                        className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-teal-600 file:text-white hover:file:bg-teal-700 cursor-pointer disabled:opacity-50"
                      />
                      <p className="text-xs text-gray-400">
                        Máximo 5 imágenes en total. Actual: {currentImages.length + imageFiles.length}
                      </p>
                    </div>
                  </div>

                  {/* Previsualización de nuevas imágenes */}
                  {imagePreviews.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-gray-200">Nuevas imágenes</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {imagePreviews.map((preview, idx) => (
                          <div key={idx} className="relative group">
                            <img src={preview} alt={`Nueva imagen ${idx + 1}`} className="w-full h-24 object-cover rounded-lg border border-teal-600" />
                            <button
                              type="button"
                              onClick={() => removeNewImage(idx)}
                              disabled={saving}
                              className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-4 w-4 text-white" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Precio */}
              <Card className="p-6 bg-neutral-900 border-gray-800">
                <h2 className="mb-6 text-xl font-semibold text-white">Precio</h2>

                <div className="space-y-2">
                  <Label htmlFor="price" className="text-gray-200">
                    Precio base (USD) <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <Input
                      id="price"
                      type="number"
                      min="5"
                      step="5"
                      placeholder="150"
                      className="pl-7 bg-neutral-800 border-gray-700 text-white rounded-lg"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                      disabled={saving}
                    />
                  </div>
                </div>
              </Card>

              {/* Botones de acción */}
              <div className="flex gap-4">
                <Button 
                  type="button"
                  onClick={() => {
                    setIsEditing(false)
                    setErrorMessage('')
                    setSuccessMessage('')
                  }}
                  variant="outline"
                  className="flex-1 py-4 rounded-lg border-gray-700 text-gray-200 hover:bg-gray-800"
                  disabled={saving}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-4 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold transition-all"
                >
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
