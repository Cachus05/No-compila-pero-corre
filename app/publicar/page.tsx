"use client"

import type React from "react"

import { useState } from "react"
import { Navigation } from "@/components/navigation_freelance"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, X, CheckCircle2 } from "lucide-react"

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
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
  })
  const [images, setImages] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the data to your backend
    console.log("Form submitted:", formData)
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      // Reset form
      setFormData({
        title: "",
        description: "",
        price: "",
        category: "",
      })
      setImages([])
    }, 3000)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newImages = Array.from(files).map((file) => URL.createObjectURL(file))
      setImages([...images, ...newImages].slice(0, 5)) // Max 5 images
    }
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  return (
    <div className="min-h-screen">
      <Navigation />

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Publicar un servicio</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Comparte tu talento y conecta con clientes que necesitan tus habilidades
          </p>
        </div>

        {submitted && (
          <Card className="mb-6 border-accent bg-accent/10 p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-accent" />
              <div>
                <div className="font-semibold">¡Servicio publicado exitosamente!</div>
                <div className="text-sm text-muted-foreground">Tu servicio ya está visible para los clientes</div>
              </div>
            </div>
          </Card>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Basic Information */}
            <Card className="p-6">
              <h2 className="mb-6 text-xl font-semibold">Información básica</h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Título del servicio <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="Ej: Diseño de logo profesional y branding completo"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Escribe un título claro y descriptivo que capte la atención
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">
                    Categoría <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                    required
                  >
                    <SelectTrigger id="category">
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
                  <p className="text-sm text-muted-foreground">Elige la categoría que mejor describa tu servicio</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">
                    Descripción <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe tu servicio en detalle: qué incluye, cómo trabajas, qué pueden esperar los clientes..."
                    rows={8}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Mínimo 100 caracteres. Sé específico sobre lo que ofreces y tu proceso de trabajo.
                  </p>
                </div>
              </div>
            </Card>

            {/* Pricing */}
            <Card className="p-6">
              <h2 className="mb-6 text-xl font-semibold">Precio</h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="price">
                    Precio base (USD) <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="price"
                      type="number"
                      min="5"
                      step="5"
                      placeholder="150"
                      className="pl-7"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Establece un precio competitivo. Puedes ofrecer paquetes adicionales más adelante.
                  </p>
                </div>

                <div className="rounded-lg border border-border bg-muted/50 p-4">
                  <div className="mb-2 text-sm font-medium">Desglose de ganancias</div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Precio del servicio:</span>
                      <span className="font-medium text-foreground">${formData.price || "0"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Comisión de plataforma (10%):</span>
                      <span className="font-medium text-foreground">
                        -${formData.price ? (Number(formData.price) * 0.1).toFixed(2) : "0"}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-border pt-1 font-semibold text-foreground">
                      <span>Recibirás:</span>
                      <span className="text-accent">
                        ${formData.price ? (Number(formData.price) * 0.9).toFixed(2) : "0"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Images */}
            <Card className="p-6">
              <h2 className="mb-6 text-xl font-semibold">Imágenes del servicio</h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Galería de imágenes (opcional)</Label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {images.map((image, index) => (
                      <div
                        key={index}
                        className="group relative aspect-video overflow-hidden rounded-lg border border-border"
                      >
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`Preview ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute right-2 top-2 rounded-full bg-destructive p-1 opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <X className="h-4 w-4 text-destructive-foreground" />
                        </button>
                      </div>
                    ))}

                    {images.length < 5 && (
                      <label className="flex aspect-video cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 transition-colors hover:bg-muted">
                        <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Subir imagen</span>
                        <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                      </label>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Sube hasta 5 imágenes que muestren tu trabajo. Formatos: JPG, PNG (máx. 5MB cada una)
                  </p>
                </div>
              </div>
            </Card>

            {/* Submit */}
            <Card className="p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="font-semibold">¿Listo para publicar?</div>
                  <div className="text-sm text-muted-foreground">
                    Tu servicio será revisado y publicado en menos de 24 horas
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="outline">
                    Guardar borrador
                  </Button>
                  <Button type="submit" size="lg">
                    Publicar servicio
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
