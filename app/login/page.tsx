"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      })

      const data = await response.json()

      if (response.ok) {
        if (!data.token || !data.usuario) {
          throw new Error('Respuesta incompleta del servidor')
        }

        // GUARDAR TOKEN Y USERID
        localStorage.setItem('token', data.token)
        localStorage.setItem('userId', data.usuario.id.toString())
        localStorage.setItem('usuario', JSON.stringify(data.usuario))
        
        console.log('Login exitoso, tipo de usuario:', data.usuario.user_type)
        console.log('Token guardado:', data.token)
        console.log('UserId guardado:', data.usuario.id)
        
        // Redirigir según el tipo de usuario
        if (data.usuario.user_type === 'client') {
          console.log('Redirigiendo a dashboard de cliente...')
          router.push('/dashboard_cliente')
        } else if (data.usuario.user_type === 'freelancer') {
          console.log('Redirigiendo a dashboard de freelancer...')
          router.push('/dashboard')
        } else if (data.usuario.user_type === 'admin' || data.usuario.user_type === 'moderator') {
          console.log('Redirigiendo a dashboard de admin/moderador...')
          router.push('/dashboard')
        } else {
          console.log('Redirigiendo a dashboard por defecto...')
          router.push('/dashboard')
        }
      } else {
        setError(data.error || 'Error al iniciar sesión')
      }
    } catch (err) {
      console.error('Error:', err)
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Error de conexión. Intenta de nuevo.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-black">
      <div className="w-full max-w-[440px] space-y-5">
        {/* Logo y Título */}
        <div className="text-center">
          {/* Logo con margen inferior */}
          <div className="flex justify-center mb-10">
            <div className="relative h-10 w-auto">
              <Image
                src="/utsc-logo2.png"
                alt="UTSC Logo"
                width={123}
                height={40}
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Título */}
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-white">Iniciar sesión</h2>
            <p className="text-sm text-gray-400">
              Bienvenido de vuelta a Free Market UTSC
            </p>
          </div>
        </div>

        {/* Formulario */}
        <Card className="p-7 bg-neutral-900 border-neutral-800 shadow-2xl">
          {error && (
            <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3">
              <p className="text-sm text-red-400 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
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

            {/* Contraseña */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-gray-200">Contraseña</Label>
                <Link
                  href="/recuperar_contrasena"
                  className="text-sm text-teal-400 hover:text-teal-300 transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
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

            {/* Botón de login */}
            <Button 
              type="submit" 
              className="w-full h-11 bg-teal-500 hover:bg-teal-600 text-black font-semibold" 
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Iniciando sesión...
                </div>
              ) : (
                "Iniciar sesión"
              )}
            </Button>
          </form>

          {/* Separador */}
          <div className="relative my-5">
            <Separator className="bg-neutral-700" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-neutral-900 px-3 text-xs text-gray-500">
              O continúa con
            </span>
          </div>

          {/* Login con Google y GitHub */}
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
          ¿No tienes una cuenta?{" "}
          <Link 
            href="/registro" 
            className="font-medium transition-colors"
            style={{ color: 'oklch(0.75 0.20 80)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'oklch(0.80 0.20 80)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'oklch(0.75 0.20 80)'}
          >
            Regístrate gratis
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