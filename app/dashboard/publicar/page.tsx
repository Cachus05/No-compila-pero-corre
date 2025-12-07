"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation_freelance"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, X, CheckCircle2, Loader2 } from "lucide-react"

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

export default function PublicarPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    delivery_time: "3",
  })
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      // Crear FormData para enviar archivos
      const formDataToSend = new FormData()
      formDataToSend.append('title', formData.title)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('price', formData.price)
      formDataToSend.append('category', formData.category)
      formDataToSend.append('delivery_time', formData.delivery_time)

      // Agregar imágenes
      imageFiles.forEach((file) => {
        formDataToSend.append('images', file)
      })

      const response = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      })

      // Parseo seguro: si no hay body o no es JSON, evitamos el crash
      let data: any = {}
      try {
        const text = await response.text()
        data = text ? JSON.parse(text) : {}
      } catch (parseErr) {
        console.warn('Response tiene body no JSON o vacío:', parseErr)
      }

      if (!response.ok) {
        throw new Error(data?.error || `Error al publicar servicio (status ${response.status})`)
      }
      
      setSubmitted(true)
      
  // NOTIFICAR AL DASHBOARD QUE SE PUBLICÓ UN NUEVO SERVICIO
      localStorage.setItem('servicios_actualizados', Date.now().toString())
      
      // Redirigir al dashboard después de 2 segundos
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)

    } catch (error: any) {
      console.error('Error:', error)
      setError(error.message || 'Error al publicar servicio')
      setLoading(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newFiles = Array.from(files).slice(0, 5 - imageFiles.length)
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file))
      
      setImageFiles([...imageFiles, ...newFiles])
      setImagePreviews([...imagePreviews, ...newPreviews])
    }
  }

  const removeImage = (index: number) => {
    // Liberar URL del objeto
    URL.revokeObjectURL(imagePreviews[index])
    
    setImageFiles(imageFiles.filter((_, i) => i !== index))
    setImagePreviews(imagePreviews.filter((_, i) => i !== index))
  }

  return (
    <div className="min-h-screen">
      <Navigation />

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-white">Publicar un servicio</h1>
          <p className="mt-2 text-lg text-gray-400">
            Comparte tu talento y conecta con clientes que necesitan tus habilidades
          </p>
        </div>

        {submitted && (
          <Card className="mb-6 border-teal-500 bg-teal-500/10 p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-teal-500" />
              <div>
                <div className="font-semibold text-white">¡Servicio publicado exitosamente!</div>
                <div className="text-sm text-gray-300">Tu servicio ya está visible para los clientes. Redirigiendo...</div>
              </div>
            </div>
          </Card>
        )}

        {error && (
          <Card className="mb-6 border-red-500 bg-red-500/10 p-4">
            <div className="flex items-center gap-3">
              <X className="h-5 w-5 text-red-500" />
              <div>
                <div className="font-semibold text-white">Error</div>
                <div className="text-sm text-gray-300">{error}</div>
              </div>
            </div>
          </Card>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Basic Information */}
            <Card className="p-6 bg-neutral-900 border-gray-800">
              <h2 className="mb-6 text-xl font-semibold text-white">Información básica</h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-gray-200">
                    Título del servicio <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="Ej: Diseño de logo profesional y branding completo"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    disabled={loading}
                    className="bg-neutral-800 border-gray-700 text-white"
                  />
                  <p className="text-sm text-gray-400">
                    Escribe un título claro y descriptivo que capte la atención
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-gray-200">
                    Categoría <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                    required
                    disabled={loading}
                  >
                    <SelectTrigger id="category" className="bg-neutral-800 border-gray-700 text-white">
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-400">Elige la categoría que mejor describa tu servicio</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-gray-200">
                    Descripción <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe tu servicio en detalle: qué incluye, cómo trabajas, qué pueden esperar los clientes..."
                    rows={8}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    disabled={loading}
                    className="bg-neutral-800 border-gray-700 text-white"
                  />
                  <p className="text-sm text-gray-400">
                    Mínimo 100 caracteres. Sé específico sobre lo que ofreces y tu proceso de trabajo.
                  </p>
                </div>
              </div>
            </Card>

            {/* Pricing */}
            <Card className="p-6 bg-neutral-900 border-gray-800">
              <h2 className="mb-6 text-xl font-semibold text-white">Precio y entrega</h2>

              <div className="space-y-4">
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
                      className="pl-7 bg-neutral-800 border-gray-700 text-white"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                      disabled={loading}
                    />
                  </div>
                  <p className="text-sm text-gray-400">
                    Establece un precio competitivo. Puedes ofrecer paquetes adicionales más adelante.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="delivery_time" className="text-gray-200">
                    Tiempo de entrega (días)
                  </Label>
                  <Input
                    id="delivery_time"
                    type="number"
                    min="1"
                    placeholder="3"
                    className="bg-neutral-800 border-gray-700 text-white"
                    value={formData.delivery_time}
                    onChange={(e) => setFormData({ ...formData, delivery_time: e.target.value })}
                    disabled={loading}
                  />
                </div>

                <div className="rounded-lg border border-gray-700 bg-neutral-800/50 p-4">
                  <div className="mb-2 text-sm font-medium text-white">Desglose de ganancias</div>
                  <div className="space-y-1 text-sm text-gray-400">
                    <div className="flex justify-between">
                      <span>Precio del servicio:</span>
                      <span className="font-medium text-white">${formData.price || "0"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Comisión de plataforma (10%):</span>
                      <span className="font-medium text-white">
                        -${formData.price ? (Number(formData.price) * 0.1).toFixed(2) : "0"}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-gray-700 pt-1 font-semibold text-white">
                      <span>Recibirás:</span>
                      <span className="text-teal-500">
                        ${formData.price ? (Number(formData.price) * 0.9).toFixed(2) : "0"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Images */}
            <Card className="p-6 bg-neutral-900 border-gray-800">
              <h2 className="mb-6 text-xl font-semibold text-white">Imágenes del servicio</h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-200">Galería de imágenes (opcional)</Label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {imagePreviews.map((preview, index) => (
                      <div
                        key={index}
                        className="group relative aspect-video overflow-hidden rounded-lg border border-gray-700"
                      >
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          disabled={loading}
                          className="absolute right-2 top-2 rounded-full bg-red-500 p-1 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
                        >
                          <X className="h-4 w-4 text-white" />
                        </button>
                      </div>
                    ))}

                    {imagePreviews.length < 5 && (
                      <label className="flex aspect-video cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-700 bg-neutral-800/50 transition-colors hover:bg-neutral-800">
                        <Upload className="mb-2 h-8 w-8 text-gray-400" />
                        <span className="text-sm text-gray-400">Subir imagen</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          multiple 
                          onChange={handleImageUpload} 
                          className="hidden"
                          disabled={loading}
                        />
                      </label>
                    )}
                  </div>
                  <p className="text-sm text-gray-400">
                    Sube hasta 5 imágenes que muestren tu trabajo. Formatos: JPG, PNG (máx. 5MB cada una)
                  </p>
                </div>
              </div>
            </Card>

            {/* Submit */}
            <Card className="p-6 bg-neutral-900 border-gray-800">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="font-semibold text-white">¿Listo para publicar?</div>
                  <div className="text-sm text-gray-400">
                    Tu servicio estará disponible inmediatamente
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    disabled={loading}
                    className="border-gray-700 text-gray-300 hover:bg-neutral-800"
                  >
                    Guardar borrador
                  </Button>
                  <Button 
                    type="submit" 
                    size="lg" 
                    disabled={loading}
                    className="bg-teal-500 hover:bg-teal-600 text-black font-semibold"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Publicando...
                      </>
                    ) : (
                      'Publicar servicio'
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </form>
      </div>
    </div>
  )
}