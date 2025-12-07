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
import { Mail, Lock, ArrowLeft, CheckCircle2, Eye, EyeOff } from "lucide-react"

type Step = "email" | "code" | "password" | "success"

export default function RecuperarContraseñaPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("email")
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch('/api/recuperar-contrasena/solicitar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (response.ok) {
        setStep("code")
      } else {
        setError(data.error || 'Error al enviar el código')
      }
    } catch (err) {
      setError('Error de conexión. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch('/api/recuperar-contrasena/verificar-codigo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      })

      const data = await response.json()

      if (response.ok) {
        setStep("password")
      } else {
        setError(data.error || 'Código inválido')
      }
    } catch (err) {
      setError('Error de conexión. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    if (newPassword.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres")
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/recuperar-contrasena/cambiar-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword })
      })

      const data = await response.json()

      if (response.ok) {
        setStep("success")
      } else {
        setError(data.error || 'Error al cambiar la contraseña')
      }
    } catch (err) {
      setError('Error de conexión. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-black">
      <div className="w-full max-w-[440px] space-y-5">
        {/* Logo y Título */}
        <div className="text-center">
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

          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-white">Recuperar contraseña</h2>
            <p className="text-sm text-gray-400">
              {step === "email" && "Ingresa tu correo electrónico para recibir instrucciones"}
              {step === "code" && "Ingresa el código de verificación enviado a tu email"}
              {step === "password" && "Crea una nueva contraseña segura"}
              {step === "success" && "¡Tu contraseña ha sido cambiada exitosamente!"}
            </p>
          </div>
        </div>

        {/* Formulario */}
        {step !== "success" && (
          <Card className="p-7 bg-neutral-900 border-neutral-800 shadow-2xl">
            {error && (
              <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3">
                <p className="text-sm text-red-400 font-medium">{error}</p>
              </div>
            )}

            {/* Paso 1: Email */}
            {step === "email" && (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-200">Correo electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      className="pl-10 h-11 bg-neutral-800 border-neutral-700 text-white placeholder:text-gray-500"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <p className="text-xs text-gray-500">Recibirás un código de verificación en este correo</p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-11 bg-teal-500 hover:bg-teal-600 text-black font-semibold" 
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Enviando...
                    </div>
                  ) : (
                    "Enviar código"
                  )}
                </Button>
              </form>
            )}

            {/* Paso 2: Código */}
            {step === "code" && (
              <form onSubmit={handleCodeSubmit} className="space-y-4">
                <div className="bg-teal-500/10 border border-teal-500/20 rounded-lg p-3 mb-4">
                  <p className="text-sm text-teal-400">Hemos enviado un código a <span className="font-semibold">{email}</span></p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="code" className="text-gray-200">Código de verificación</Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="000000"
                    className="h-11 bg-neutral-800 border-neutral-700 text-white placeholder:text-gray-500 text-center text-lg tracking-widest"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    disabled={loading}
                    maxLength={6}
                  />
                  <p className="text-xs text-gray-500">Revisa tu bandeja de entrada o carpeta de spam</p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-11 bg-teal-500 hover:bg-teal-600 text-black font-semibold" 
                  disabled={loading || code.length !== 6}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Verificando...
                    </div>
                  ) : (
                    "Verificar código"
                  )}
                </Button>

                <button
                  type="button"
                  onClick={() => {
                    setStep("email")
                    setError("")
                  }}
                  className="w-full text-sm text-gray-400 hover:text-gray-300 transition-colors flex items-center justify-center gap-1"
                  disabled={loading}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Cambiar correo
                </button>
              </form>
            )}

            {/* Paso 3: Nueva contraseña */}
            {step === "password" && (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password" className="text-gray-200">Nueva contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10 h-11 bg-neutral-800 border-neutral-700 text-white placeholder:text-gray-500"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                      disabled={loading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">Mínimo 8 caracteres</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-gray-200">Confirmar contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      id="confirm-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 h-11 bg-neutral-800 border-neutral-700 text-white placeholder:text-gray-500"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-11 bg-teal-500 hover:bg-teal-600 text-black font-semibold" 
                  disabled={loading || newPassword.length < 8 || newPassword !== confirmPassword}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Guardando...
                    </div>
                  ) : (
                    "Cambiar contraseña"
                  )}
                </Button>

                <button
                  type="button"
                  onClick={() => {
                    setStep("code")
                    setError("")
                  }}
                  className="w-full text-sm text-gray-400 hover:text-gray-300 transition-colors flex items-center justify-center gap-1"
                  disabled={loading}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver
                </button>
              </form>
            )}
          </Card>
        )}

        {/* Pantalla de éxito */}
        {step === "success" && (
          <Card className="p-7 bg-neutral-900 border-neutral-800 shadow-2xl">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <div className="absolute inset-0 bg-teal-500/30 blur-lg rounded-full"></div>
                <div className="relative bg-teal-500/10 border border-teal-500/20 rounded-full p-3">
                  <CheckCircle2 className="h-12 w-12 text-teal-400" />
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white">¡Listo!</h3>
                <p className="text-sm text-gray-400">Tu contraseña ha sido actualizada correctamente</p>
              </div>

              <Link href="/login" className="w-full mt-6">
                <Button className="w-full h-11 bg-teal-500 hover:bg-teal-600 text-black font-semibold">
                  Iniciar sesión
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Link volver */}
        <div className="text-center">
          <Link 
            href="/login" 
            className="text-sm text-gray-500 hover:text-gray-300 transition-colors inline-flex items-center gap-1"
          >
            ← Volver a iniciar sesión
          </Link>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Plataforma exclusiva para estudiantes de la UTSC
          </p>
        </div>
      </div>
    </div>
  )
}