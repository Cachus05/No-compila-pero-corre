"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff, Mail, Lock, User, Phone, Camera, X } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function RegistroPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    user_type: "",
  })

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar tamaño (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("La imagen no debe superar los 5MB")
        return
      }

      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        setError("Solo se permiten archivos de imagen")
        return
      }

      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      setError("")
    }
  }

  const removeAvatar = () => {
    setAvatarPreview(null)
    setAvatarFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validación de contraseñas
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    // Validación de tipo de usuario
    if (!formData.user_type) {
      setError("Debes seleccionar un tipo de cuenta")
      return
    }

    // Validación de teléfono (opcional pero si se ingresa debe ser válido)
    if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\s/g, ''))) {
      setError("El teléfono debe tener 10 dígitos")
      return
    }

    setLoading(true)

    try {
      // Crear FormData para enviar archivo
      const formDataToSend = new FormData()
      formDataToSend.append('first_name', formData.first_name)
      formDataToSend.append('last_name', formData.last_name)
      formDataToSend.append('email', formData.email)
      formDataToSend.append('phone', formData.phone)
      formDataToSend.append('password', formData.password)
      formDataToSend.append('user_type', formData.user_type)
      
      if (avatarFile) {
        formDataToSend.append('avatar', avatarFile)
      }

      const response = await fetch('/api/registro', {
        method: 'POST',
        body: formDataToSend,
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('usuario', JSON.stringify(data.usuario))
        console.log(' Registro exitoso, tipo de usuario:', data.usuario.user_type)
        
        // Redirigir según el tipo de usuario
        if (data.usuario.user_type === 'client') {
          console.log(' Redirigiendo a dashboard de cliente...')
          router.push('/dashboard_cliente')
        } else if (data.usuario.user_type === 'freelancer') {
          console.log(' Redirigiendo a dashboard de freelancer...')
          router.push('/dashboard')
        } else if (data.usuario.user_type === 'admin' || data.usuario.user_type === 'moderator') {
          console.log(' Redirigiendo a dashboard de admin/moderador...')
          router.push('/dashboard')
        } else {
          console.log(' Redirigiendo a dashboard por defecto...')
          router.push('/dashboard')
        }
      } else {
        setError(data.error || 'Error al registrarse')
      }
    } catch (err) {
      console.error('Error:', err)
      setError('Error de conexión. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-black">
      <div className="w-full max-w-[480px] space-y-5">
        {/* Logo y Título */}
        <div className="text-center">
          {/* Logo con margen inferior */}
          <div className="flex justify-center mb-6">
            <div className="relative h-10 w-auto">
              <Image
                src="/utsc-logo2.png"
                alt="UTSC Logo"
                width={113}
                height={40}
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Título */}
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-white">Crear cuenta</h2>
            <p className="text-sm text-gray-400">
              Únete a Free Market UTSC
            </p>
          </div>
        </div>

        
        <Card className="p-7 bg-neutral-900 border-neutral-800 shadow-2xl">
          {error && (
            <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3">
              <p className="text-sm text-red-400 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Foto de perfil */}
            <div className="space-y-2">
              <Label className="text-gray-200">Foto de perfil (opcional)</Label>
              <div className="flex items-center gap-4">
                <div className="relative">
                  {avatarPreview ? (
                    <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-teal-500">
                      <Image
                        src={avatarPreview}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeAvatar}
                        className="absolute top-0 right-0 bg-red-500 rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X className="h-3 w-3 text-white" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-neutral-800 border-2 border-dashed border-gray-700 flex items-center justify-center">
                      <Camera className="h-8 w-8 text-gray-500" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="avatar"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="border-neutral-700 hover:bg-neutral-800 text-white"
                    disabled={loading}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    {avatarPreview ? "Cambiar foto" : "Subir foto"}
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    JPG, PNG o GIF. Máximo 5MB.
                  </p>
                </div>
              </div>
            </div>
           
            <div className="space-y-2">
              <Label htmlFor="first_name" className="text-gray-200">Nombre</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  id="first_name"
                  type="text"
                  placeholder="Juan"
                  className="pl-10 h-11 bg-neutral-800 border-neutral-700 text-white placeholder:text-gray-500"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name" className="text-gray-200">Apellido</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  id="last_name"
                  type="text"
                  placeholder="Pérez"
                  className="pl-10 h-11 bg-neutral-800 border-neutral-700 text-white placeholder:text-gray-500"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>
            </div>

           
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-200">Correo electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  className="pl-10 h-11 bg-neutral-800 border-neutral-700 text-white placeholder:text-gray-500"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Teléfono */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-200">Teléfono (opcional)</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="1234567890"
                  maxLength={10}
                  className="pl-10 h-11 bg-neutral-800 border-neutral-700 text-white placeholder:text-gray-500"
                  value={formData.phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '') // Solo números
                    setFormData({ ...formData, phone: value })
                  }}
                  disabled={loading}
                />
              </div>
              <p className="text-xs text-gray-500">10 dígitos sin espacios ni guiones</p>
            </div>

           
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-200">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-11 bg-neutral-800 border-neutral-700 text-white placeholder:text-gray-500"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirmar Contraseña */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-200">Confirmar contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-11 bg-neutral-800 border-neutral-700 text-white placeholder:text-gray-500"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  disabled={loading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Tipo de cuenta</Label>
              <RadioGroup
                value={formData.user_type}
                onValueChange={(value) => setFormData({ ...formData, user_type: value })}
              >
                <div className="flex items-center space-x-2 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50">
                  <RadioGroupItem value="freelancer" id="freelancer" />
                  <Label htmlFor="freelancer" className="flex-1 cursor-pointer">
                    <div className="font-medium">Freelancer</div>
                    <div className="text-sm text-muted-foreground">Quiero ofrecer mis servicios</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50">
                  <RadioGroupItem value="client" id="client" />
                  <Label htmlFor="client" className="flex-1 cursor-pointer">
                    <div className="font-medium">Cliente</div>
                    <div className="text-sm text-muted-foreground">Quiero contratar servicios</div>
                  </Label>
                </div>
              </RadioGroup>
            </div>


            {/* Términos y condiciones */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terminos"
                className="mt-1 h-4 w-4 rounded border-neutral-700 bg-neutral-800 text-teal-500 focus:ring-teal-500"
                required
                disabled={loading}
              />
              <label htmlFor="terminos" className="text-sm text-gray-400">
                Acepto los{" "}
                <Link href="/terminos" className="text-teal-400 hover:text-teal-300 transition-colors">
                  Términos de servicio
                </Link>
                {" "}y la{" "}
                <Link href="/politica-privacidad" className="text-teal-400 hover:text-teal-300 transition-colors">
                  Política de privacidad
                </Link>
              </label>
            </div>

            {/* Botón de registro */}
            <Button 
              type="submit" 
              className="w-full h-11 bg-teal-500 hover:bg-teal-600 text-black font-semibold" 
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Creando cuenta...
                </div>
              ) : (
                "Crear cuenta"
              )}
            </Button>
          </form>

          {/* Separador */}
          <div className="relative my-5">
            <Separator className="bg-neutral-700" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-neutral-900 px-3 text-xs text-gray-500">
              O regístrate con
            </span>
          </div>

          {/* Registro con Google y GitHub */}
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 bg-neutral-800 border-neutral-700 hover:bg-neutral-700 text-white"
              disabled={loading}
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continuar con Google
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full h-11 bg-neutral-800 border-neutral-700 hover:bg-neutral-700 text-white"
              disabled={loading}
            >
              <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              Continuar con GitHub
            </Button>
          </div>
        </Card>

        <p className="text-center text-sm text-gray-400 pt-1">
          ¿Ya tienes una cuenta?{" "}
          <Link 
            href="/login" 
            className="font-medium transition-colors"
            style={{ color: 'oklch(0.75 0.20 80)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'oklch(0.80 0.20 80)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'oklch(0.75 0.20 80)'}
          >
            Inicia sesión
          </Link>
        </p>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Plataforma exclusiva para estudiantes de la UTSC
          </p>
        </div>

        <div className="text-center">
          <Link 
            href="/" 
            className="text-sm text-gray-500 hover:text-gray-300 transition-colors inline-flex items-center gap-1"
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}