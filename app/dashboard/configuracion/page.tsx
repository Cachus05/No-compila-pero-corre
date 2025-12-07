"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Upload, Camera, Plus, Trash2, ArrowLeft, Home } from 'lucide-react'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'

// ==================== INTERFACES ====================
interface Usuario {
  id: number
  email: string
  first_name: string
  last_name: string
  phone: string
  avatar: string
  user_type: string
}

interface PerfilProfesional {
  id: number
  user_id: number
  title: string
  bio: string
  hourly_rate: number
  skills: string
  languages: string
  experience_level: string
  portfolio_url: string
  linkedin_profile: string
  github_profile: string
}

interface Pago {
  id: number
  amount: number
  payment_method: string
  status: string
  payment_date: string
  created_at: string
  project_title: string
  project_description: string
  client_first_name: string
  client_last_name: string
}

interface Tarjeta {
  id: number
  numero: string
  tipo: string
  expira: string
  principal: boolean
}

// ==================== COMPONENTE PRINCIPAL ====================
export default function ConfiguracionPage() {
  const router = useRouter()

  // ---- ESTADOS PRINCIPALES ----
  const [selected, setSelected] = useState<'mi_cuenta' | 'perfil_freelance' | 'pagos' | 'privacidad' | 'metodos_pago'>('mi_cuenta')
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  // ---- DATOS DEL USUARIO ----
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [perfilProfesional, setPerfilProfesional] = useState<PerfilProfesional | null>(null)
  const [pagos, setPagos] = useState<Pago[]>([])

  // ---- FORMULARIO MI CUENTA ----
  const [formUsuario, setFormUsuario] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: ''
  })
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  // ---- FORMULARIO PERFIL PROFESIONAL ----
  const [formPerfil, setFormPerfil] = useState({
    title: '',
    bio: '',
    hourly_rate: '',
    skills: '',
    languages: '',
    experience_level: '',
    portfolio_url: '',
    linkedin_profile: '',
    github_profile: ''
  })

  // ---- CAMBIO DE CONTRASEÑA ----
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

  // ---- ELIMINAR CUENTA ----
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [deleting, setDeleting] = useState(false)

  // ---- TARJETAS DE PAGO ----
  const [tarjetas, setTarjetas] = useState<Tarjeta[]>([
    { id: 1, numero: '4242', tipo: 'Visa', expira: '12/26', principal: true },
    { id: 2, numero: '4444', tipo: 'Mastercard', expira: '09/25', principal: false }
  ])
  const [nuevaTarjeta, setNuevaTarjeta] = useState({
    numero: '',
    nombre: '',
    expiracion: '',
    cvv: ''
  })

  // ==================== EFECTOS ====================
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      cargarDatos()
    }
  }, [mounted])

  useEffect(() => {
    if (mounted && selected === 'pagos' && usuario) {
      const token = localStorage.getItem('token')
      const userId = localStorage.getItem('userId')
      if (token && userId) {
        cargarPagos(userId, token)
      }
    }
  }, [selected, usuario, mounted])

  // ==================== FUNCIONES DE CARGA ====================
  const cargarDatos = async () => {
    try {
      if (typeof window === 'undefined') return

      const token = localStorage.getItem('token')
      const userId = localStorage.getItem('userId')

      if (!token || !userId) {
        router.push('/login')
        return
      }

      const respuestaPerfil = await fetch(`/api/usuario/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!respuestaPerfil.ok) {
        if (respuestaPerfil.status === 401) {
          localStorage.removeItem('token')
          localStorage.removeItem('userId')
          localStorage.removeItem('usuario')
          alert('Tu sesión ha expirado. Por favor inicia sesión nuevamente.')
          router.push('/login')
          return
        }
        throw new Error('Error al cargar datos')
      }

      const datos = await respuestaPerfil.json()

      setUsuario(datos.usuario)
      setPerfilProfesional(datos.perfilProfesional)

      setFormUsuario({
        first_name: datos.usuario.first_name || '',
        last_name: datos.usuario.last_name || '',
        email: datos.usuario.email || '',
        phone: datos.usuario.phone || ''
      })

      if (datos.perfilProfesional) {
        setFormPerfil({
          title: datos.perfilProfesional.title || '',
          bio: datos.perfilProfesional.bio || '',
          hourly_rate: datos.perfilProfesional.hourly_rate || '',
          skills: datos.perfilProfesional.skills || '',
          languages: datos.perfilProfesional.languages || '',
          experience_level: datos.perfilProfesional.experience_level || '',
          portfolio_url: datos.perfilProfesional.portfolio_url || '',
          linkedin_profile: datos.perfilProfesional.linkedin_profile || '',
          github_profile: datos.perfilProfesional.github_profile || ''
        })
      }

      setLoading(false)
    } catch (error) {
      console.error('Error al cargar datos:', error)
      setLoading(false)
    }
  }

  const cargarPagos = async (userId: string, token: string) => {
    try {
      const respuestaPagos = await fetch(`/api/usuario/${userId}/pagos`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (respuestaPagos.ok) {
        const datos = await respuestaPagos.json()
        setPagos(datos.pagos || [])
      }
    } catch (error) {
      console.error('Error al cargar pagos:', error)
    }
  }

  // ==================== FUNCIONES AVATAR ====================
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('avatar', file)

    setUploadingAvatar(true)

    try {
      if (typeof window === 'undefined') return

      const token = localStorage.getItem('token')
      const userId = localStorage.getItem('userId')

      const response = await fetch(`/api/usuario/${userId}/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setUsuario(prev => prev ? { ...prev, avatar: data.avatar } : null)
        alert('Foto de perfil actualizada')
      } else {
        alert('Error al subir la foto')
      }
    } catch (error) {
      console.error('Error al subir avatar:', error)
      alert('Error al subir la foto')
    } finally {
      setUploadingAvatar(false)
    }
  }

  // ==================== FUNCIONES MI CUENTA ====================
  const handleGuardarUsuario = async () => {
    setSaving(true)
    try {
      if (typeof window === 'undefined') return

      const token = localStorage.getItem('token')
      const userId = localStorage.getItem('userId')

      const response = await fetch(`/api/usuario/${userId}/actualizar`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formUsuario)
      })

      if (response.ok) {
        alert('Datos actualizados correctamente')
        await cargarDatos()
      } else {
        alert('Error al actualizar datos')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al actualizar datos')
    } finally {
      setSaving(false)
    }
  }

  // ==================== FUNCIONES PERFIL PROFESIONAL ====================
  const handleGuardarPerfil = async () => {
    setSaving(true)
    try {
      if (typeof window === 'undefined') return

      const token = localStorage.getItem('token')
      const userId = localStorage.getItem('userId')

      const response = await fetch(`/api/usuario/${userId}/perfil-profesional`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formPerfil)
      })

      if (response.ok) {
        alert('Perfil profesional actualizado correctamente')
        await cargarDatos()
      } else {
        alert('Error al actualizar perfil')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al actualizar perfil')
    } finally {
      setSaving(false)
    }
  }

  // ==================== FUNCIONES TARJETAS ====================
  const handleAgregarTarjeta = () => {
    if (!nuevaTarjeta.numero || !nuevaTarjeta.nombre || !nuevaTarjeta.expiracion || !nuevaTarjeta.cvv) {
      alert('Completa todos los campos')
      return
    }

    const nuevaId = Math.max(...tarjetas.map(t => t.id), 0) + 1
    const ultimos4 = nuevaTarjeta.numero.slice(-4)

    setTarjetas([...tarjetas, {
      id: nuevaId,
      numero: ultimos4,
      tipo: 'Visa',
      expira: nuevaTarjeta.expiracion,
      principal: tarjetas.length === 0
    }])

    setNuevaTarjeta({ numero: '', nombre: '', expiracion: '', cvv: '' })
    alert('Tarjeta agregada exitosamente')
  }

  const handleEliminarTarjeta = (id: number) => {
    setTarjetas(tarjetas.filter(t => t.id !== id))
    alert('Tarjeta eliminada')
  }

  // ==================== FUNCIONES SEGURIDAD ====================
  const handleChangePassword = async () => {
    if (!usuario) return

    if (!currentPassword || !newPassword || !confirmPassword) {
      alert('Por favor completa todos los campos')
      return
    }

    if (newPassword !== confirmPassword) {
      alert('Las contraseñas no coinciden')
      return
    }

    if (newPassword.length < 6) {
      alert('La nueva contraseña debe tener al menos 6 caracteres')
      return
    }

    setChangingPassword(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/usuario/cambiar-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      })

      if (response.ok) {
        alert('Contraseña actualizada exitosamente')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        const error = await response.json()
        alert(error.error || 'Error al cambiar contraseña')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al cambiar contraseña')
    } finally {
      setChangingPassword(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!usuario) return

    if (deleteConfirmation !== 'ELIMINAR') {
      alert('Por favor escribe "ELIMINAR" para confirmar')
      return
    }

    if (!confirm('¿Estás absolutamente seguro? Esta acción NO se puede deshacer.')) {
      return
    }

    setDeleting(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/usuario/${usuario.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        localStorage.clear()
        alert('Cuenta eliminada exitosamente')
        router.push('/')
      } else {
        const error = await response.json()
        alert(error.error || 'Error al eliminar cuenta')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al eliminar cuenta')
    } finally {
      setDeleting(false)
    }
  }

  // ==================== RENDER ====================
  if (!mounted) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    )
  }

  if (!usuario) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <p className="text-white">No se pudo cargar la información del usuario</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <main className="max-w-6xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push('/dashboard')}
            className="border-gray-700 text-gray-200 hover:bg-neutral-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Configuración de cuenta</h1>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {/* ---- SIDEBAR ---- */}
          <Sidebar 
            usuario={usuario} 
            selected={selected} 
            setSelected={setSelected}
            uploadingAvatar={uploadingAvatar}
            handleAvatarChange={handleAvatarChange}
          />

          {/* ---- CONTENIDO PRINCIPAL ---- */}
          <section className="md:col-span-3">
            {selected === 'mi_cuenta' && (
              <MiCuentaSection 
                usuario={usuario}
                formUsuario={formUsuario}
                setFormUsuario={setFormUsuario}
                saving={saving}
                uploadingAvatar={uploadingAvatar}
                handleAvatarChange={handleAvatarChange}
                handleGuardarUsuario={handleGuardarUsuario}
                cargarDatos={cargarDatos}
              />
            )}

            {selected === 'perfil_freelance' && (
              <PerfilFreelanceSection 
                formPerfil={formPerfil}
                setFormPerfil={setFormPerfil}
                saving={saving}
                handleGuardarPerfil={handleGuardarPerfil}
                cargarDatos={cargarDatos}
              />
            )}

            {selected === 'pagos' && (
              <PagosSection pagos={pagos} />
            )}

            {selected === 'metodos_pago' && (
              <MetodosPagoSection 
                tarjetas={tarjetas}
                nuevaTarjeta={nuevaTarjeta}
                setNuevaTarjeta={setNuevaTarjeta}
                handleAgregarTarjeta={handleAgregarTarjeta}
                handleEliminarTarjeta={handleEliminarTarjeta}
              />
            )}

            {selected === 'privacidad' && (
              <PrivacidadSection 
                currentPassword={currentPassword}
                setCurrentPassword={setCurrentPassword}
                newPassword={newPassword}
                setNewPassword={setNewPassword}
                confirmPassword={confirmPassword}
                setConfirmPassword={setConfirmPassword}
                changingPassword={changingPassword}
                handleChangePassword={handleChangePassword}
                deleteConfirmation={deleteConfirmation}
                setDeleteConfirmation={setDeleteConfirmation}
                deleting={deleting}
                handleDeleteAccount={handleDeleteAccount}
              />
            )}
          </section>
        </div>
      </main>
    </div>
  )
}

// ==================== COMPONENTES SEPARADOS ====================

function Sidebar({ usuario, selected, setSelected, uploadingAvatar, handleAvatarChange }: any) {
  return (
    <aside className="md:col-span-1">
      <Card className="p-4 bg-neutral-900 border-gray-800">
        <div className="flex flex-col items-center mb-6">
          <div className="relative group">
            <Avatar className="h-20 w-20">
              <AvatarImage
                src={usuario.avatar ? `/uploads/avatars/${usuario.avatar}` : "/uploads/avatars/default.png"}
                alt={usuario.first_name || "Usuario"}
              />
              <AvatarFallback>
                {usuario.first_name?.[0]}{usuario.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <label
              htmlFor="avatar-upload"
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
            >
              {uploadingAvatar ? (
                <Loader2 className="h-6 w-6 animate-spin text-white" />
              ) : (
                <Camera className="h-6 w-6 text-white" />
              )}
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
              disabled={uploadingAvatar}
            />
          </div>
          <h2 className="text-lg font-semibold mt-3">
            {usuario.first_name} {usuario.last_name}
          </h2>
          <p className="text-sm text-gray-400">{usuario.email}</p>
        </div>
        <nav className="space-y-2 w-full">
          <NavButton selected={selected} setSelected={setSelected} value="mi_cuenta" label="Mi cuenta" />
          <NavButton selected={selected} setSelected={setSelected} value="perfil_freelance" label="Perfil profesional" />
          <NavButton selected={selected} setSelected={setSelected} value="pagos" label="Historial de pagos" />
          <NavButton selected={selected} setSelected={setSelected} value="metodos_pago" label="Métodos de pago" />
          <NavButton selected={selected} setSelected={setSelected} value="privacidad" label="Privacidad" />
        </nav>
      </Card>
    </aside>
  )
}

function NavButton({ selected, setSelected, value, label }: any) {
  return (
    <button
      onClick={() => setSelected(value)}
      className={`w-full text-left flex items-center gap-3 p-3 rounded-lg transition-colors ${
        selected === value ? 'bg-neutral-800 border border-gray-700' : 'hover:bg-neutral-800'
      }`}
    >
      <span className="font-medium">{label}</span>
    </button>
  )
}

function MiCuentaSection({ usuario, formUsuario, setFormUsuario, saving, uploadingAvatar, handleAvatarChange, handleGuardarUsuario, cargarDatos }: any) {
  return (
    <Card className="p-6 bg-neutral-900 border-gray-800">
      <div className="flex items-center gap-6 mb-6">
        <div className="relative group">
          <Avatar className="h-20 w-20">
            <AvatarImage
              src={usuario.avatar ? `/uploads/avatars/${usuario.avatar}` : "/uploads/avatars/default.png"}
              alt={usuario.first_name || "Usuario"}
            />
            <AvatarFallback>
              {usuario.first_name?.[0]}{usuario.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
          <label
            htmlFor="avatar-upload-main"
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
          >
            {uploadingAvatar ? (
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            ) : (
              <Upload className="h-6 w-6 text-white" />
            )}
          </label>
          <input
            id="avatar-upload-main"
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
            disabled={uploadingAvatar}
          />
        </div>
        <div>
          <h2 className="text-xl font-semibold">
            {usuario.first_name} {usuario.last_name}
          </h2>
          <p className="text-sm text-gray-400">{usuario.email}</p>
          <p className="text-xs text-gray-500 mt-1">Haz clic en la foto para cambiarla</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label className="text-gray-200">Nombre</Label>
          <Input
            className="bg-neutral-800 border-gray-700 text-white"
            value={formUsuario.first_name}
            onChange={(e) => setFormUsuario({ ...formUsuario, first_name: e.target.value })}
          />
        </div>
        <div>
          <Label className="text-gray-200">Apellido</Label>
          <Input
            className="bg-neutral-800 border-gray-700 text-white"
            value={formUsuario.last_name}
            onChange={(e) => setFormUsuario({ ...formUsuario, last_name: e.target.value })}
          />
        </div>
      </div>

      <div className="mt-4">
        <Label className="text-gray-200">Correo electrónico</Label>
        <Input
          className="bg-neutral-800 border-gray-700 text-white"
          value={formUsuario.email}
          readOnly
        />
      </div>

      <div className="mt-4">
        <Label className="text-gray-200">Teléfono</Label>
        <Input
          className="bg-neutral-800 border-gray-700 text-white"
          value={formUsuario.phone}
          onChange={(e) => setFormUsuario({ ...formUsuario, phone: e.target.value })}
        />
      </div>

      <div className="mt-6 flex gap-3">
        <Button
          variant="outline"
          className="border-gray-700 text-gray-200"
          onClick={() => cargarDatos()}
        >
          Cancelar
        </Button>
        <Button
          className="bg-teal-600 hover:bg-teal-700"
          onClick={handleGuardarUsuario}
          disabled={saving}
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            'Guardar cambios'
          )}
        </Button>
      </div>
    </Card>
  )
}

function PerfilFreelanceSection({ formPerfil, setFormPerfil, saving, handleGuardarPerfil, cargarDatos }: any) {
  return (
    <Card className="p-6 bg-neutral-900 border-gray-800">
      <h2 className="text-xl font-semibold mb-4">Perfil profesional</h2>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label className="text-gray-200">Título profesional</Label>
          <Input
            className="bg-neutral-800 border-gray-700 text-white"
            value={formPerfil.title}
            onChange={(e) => setFormPerfil({ ...formPerfil, title: e.target.value })}
            placeholder="Ej: Desarrollador Fullstack"
          />
        </div>

        <div>
          <Label className="text-gray-200">Tarifa por hora ($)</Label>
          <Input
            className="bg-neutral-800 border-gray-700 text-white"
            type="number"
            value={formPerfil.hourly_rate}
            onChange={(e) => setFormPerfil({ ...formPerfil, hourly_rate: e.target.value })}
            placeholder="25"
          />
        </div>
      </div>

      <div className="mt-4">
        <Label className="text-gray-200">Biografía</Label>
        <Textarea
          className="bg-neutral-800 border-gray-700 text-white"
          value={formPerfil.bio}
          onChange={(e) => setFormPerfil({ ...formPerfil, bio: e.target.value })}
          placeholder="Cuéntanos sobre ti y tu experiencia..."
          rows={4}
        />
      </div>

      <div className="mt-4">
        <Label className="text-gray-200">Habilidades (separadas por coma)</Label>
        <Input
          className="bg-neutral-800 border-gray-700 text-white"
          value={formPerfil.skills}
          onChange={(e) => setFormPerfil({ ...formPerfil, skills: e.target.value })}
          placeholder="React, Node.js, Next.js"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4 mt-4">
        <div>
          <Label className="text-gray-200">Idiomas</Label>
          <Input
            className="bg-neutral-800 border-gray-700 text-white"
            value={formPerfil.languages}
            onChange={(e) => setFormPerfil({ ...formPerfil, languages: e.target.value })}
            placeholder="Español, Inglés"
          />
        </div>

        <div>
          <Label className="text-gray-200">Nivel de experiencia</Label>
          <Input
            className="bg-neutral-800 border-gray-700 text-white"
            value={formPerfil.experience_level}
            onChange={(e) => setFormPerfil({ ...formPerfil, experience_level: e.target.value })}
            placeholder="Junior, Mid, Senior, Expert"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mt-4">
        <div>
          <Label className="text-gray-200">Portafolio</Label>
          <Input
            className="bg-neutral-800 border-gray-700 text-white"
            value={formPerfil.portfolio_url}
            onChange={(e) => setFormPerfil({ ...formPerfil, portfolio_url: e.target.value })}
            placeholder="https://miportafolio.com"
          />
        </div>

        <div>
          <Label className="text-gray-200">LinkedIn</Label>
          <Input
            className="bg-neutral-800 border-gray-700 text-white"
            value={formPerfil.linkedin_profile}
            onChange={(e) => setFormPerfil({ ...formPerfil, linkedin_profile: e.target.value })}
            placeholder="https://linkedin.com/in/tu-perfil"
          />
        </div>
      </div>

      <div className="mt-4">
        <Label className="text-gray-200">GitHub</Label>
        <Input
          className="bg-neutral-800 border-gray-700 text-white"
          value={formPerfil.github_profile}
          onChange={(e) => setFormPerfil({ ...formPerfil, github_profile: e.target.value })}
          placeholder="https://github.com/tu-usuario"
        />
      </div>

      <div className="mt-6 flex gap-3">
        <Button
          variant="outline"
          className="border-gray-700 text-gray-200"
          onClick={() => cargarDatos()}
        >
          Cancelar
        </Button>
        <Button
          className="bg-teal-600 hover:bg-teal-700"
          onClick={handleGuardarPerfil}
          disabled={saving}
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            'Guardar cambios'
          )}
        </Button>
      </div>
    </Card>
  )
}

function PagosSection({ pagos }: any) {
  return (
    <Card className="p-6 bg-neutral-900 border-gray-800">
      <h2 className="text-xl font-semibold mb-4">Historial de pagos recibidos</h2>
      <div className="space-y-4">
        {pagos.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No tienes pagos registrados aún</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-neutral-800 text-gray-300">
                  <th className="p-3 text-left">Proyecto</th>
                  <th className="p-3 text-left">Cliente</th>
                  <th className="p-3 text-left">Fecha</th>
                  <th className="p-3 text-left">Monto</th>
                  <th className="p-3 text-left">Estado</th>
                </tr>
              </thead>
              <tbody>
                {pagos.map((pago: any) => (
                  <tr key={pago.id} className="border-b border-gray-800">
                    <td className="p-3">{pago.project_title}</td>
                    <td className="p-3">
                      {pago.client_first_name && pago.client_last_name 
                        ? `${pago.client_first_name} ${pago.client_last_name}`
                        : 'Cliente eliminado'
                      }
                    </td>
                    <td className="p-3">
                      {new Date(pago.payment_date || pago.created_at).toLocaleDateString('es-MX')}
                    </td>
                    <td className="p-3">${pago.amount}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        pago.status === 'completed' ? 'bg-teal-500/20 text-teal-400' :
                        pago.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {pago.status === 'completed' ? 'Pagado' :
                         pago.status === 'pending' ? 'Pendiente' :
                         'Reembolsado'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Card>
  )
}

function MetodosPagoSection({ tarjetas, nuevaTarjeta, setNuevaTarjeta, handleAgregarTarjeta, handleEliminarTarjeta }: any) {
  return (
    <Card className="p-6 bg-neutral-900 border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Tarjetas vinculadas</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2 border-gray-700 text-gray-200">
              <Plus className="h-4 w-4" /> Agregar tarjeta
            </Button>
          </DialogTrigger>

          <DialogContent className="bg-neutral-900 border-gray-800">
            <DialogHeader>
              <DialogTitle>Agregar tarjeta</DialogTitle>
              <DialogDescription>Ingresa los datos de tu tarjeta. (Diseño solo)</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-2">
              <div>
                <Label className="text-gray-200">Número de tarjeta</Label>
                <Input
                  placeholder="1234 5678 9012 3456"
                  className="bg-neutral-800 border-gray-700 text-white"
                  value={nuevaTarjeta.numero}
                  onChange={(e) => setNuevaTarjeta({ ...nuevaTarjeta, numero: e.target.value })}
                />
              </div>

              <div>
                <Label className="text-gray-200">Nombre en la tarjeta</Label>
                <Input
                  placeholder="Nombre Apellido"
                  className="bg-neutral-800 border-gray-700 text-white"
                  value={nuevaTarjeta.nombre}
                  onChange={(e) => setNuevaTarjeta({ ...nuevaTarjeta, nombre: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-gray-200">Expiración (MM/AA)</Label>
                  <Input
                    placeholder="MM/AA"
                    className="bg-neutral-800 border-gray-700 text-white"
                    value={nuevaTarjeta.expiracion}
                    onChange={(e) => setNuevaTarjeta({ ...nuevaTarjeta, expiracion: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-gray-200">CVV</Label>
                  <Input
                    placeholder="123"
                    className="bg-neutral-800 border-gray-700 text-white"
                    value={nuevaTarjeta.cvv}
                    onChange={(e) => setNuevaTarjeta({ ...nuevaTarjeta, cvv: e.target.value })}
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-400">
                <input type="checkbox" className="rounded bg-neutral-800 border-gray-700" />
                Guardar tarjeta para futuros pagos
              </label>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" className="border-gray-700 text-gray-200">Cancelar</Button>
              </DialogClose>
              <Button className="bg-teal-600 hover:bg-teal-700" onClick={handleAgregarTarjeta}>Agregar tarjeta</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {tarjetas.map((tarjeta: Tarjeta) => (
          <TarjetaItem 
            key={tarjeta.id} 
            tarjeta={tarjeta} 
            onEliminar={handleEliminarTarjeta}
          />
        ))}
      </div>
    </Card>
  )
}

function TarjetaItem({ tarjeta, onEliminar }: any) {
  return (
    <div className="p-4 bg-neutral-800 border border-gray-700 rounded-lg flex items-center justify-between">
      <div>
        <div className="text-sm text-gray-300">{tarjeta.tipo} •••• {tarjeta.numero}</div>
        <div className="text-xs text-gray-500">Expira {tarjeta.expira}</div>
      </div>
      {tarjeta.principal && <div className="text-sm text-gray-400">Principal</div>}
      <div className="flex items-center gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="text-sm border-gray-700 text-gray-200">Editar</Button>
          </DialogTrigger>

          <DialogContent className="bg-neutral-900 border-gray-800">
            <DialogHeader>
              <DialogTitle>Editar tarjeta</DialogTitle>
              <DialogDescription>Actualiza los datos de la tarjeta. (Diseño solo)</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-2">
              <div>
                <Label className="text-gray-200">Número de tarjeta</Label>
                <Input value={`•••• •••• •••• ${tarjeta.numero}`} readOnly className="bg-neutral-800 border-gray-700 text-white" />
              </div>

              <div>
                <Label className="text-gray-200">Nombre en la tarjeta</Label>
                <Input placeholder="Nombre Apellido" className="bg-neutral-800 border-gray-700 text-white" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-gray-200">Expiración (MM/AA)</Label>
                  <Input placeholder="MM/AA" className="bg-neutral-800 border-gray-700 text-white" />
                </div>
                <div>
                  <Label className="text-gray-200">CVV</Label>
                  <Input placeholder="123" className="bg-neutral-800 border-gray-700 text-white" />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-400">
                <input type="checkbox" className="rounded bg-neutral-800 border-gray-700" defaultChecked={tarjeta.principal} />
                Establecer como tarjeta principal
              </label>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" className="border-gray-700 text-gray-200">Cancelar</Button>
              </DialogClose>
              <Button className="bg-teal-600 hover:bg-teal-700">Guardar cambios</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="destructive" className="text-sm flex items-center gap-2">
              <Trash2 className="h-4 w-4" /> Eliminar
            </Button>
          </DialogTrigger>

          <DialogContent className="bg-neutral-900 border-gray-800">
            <DialogHeader>
              <DialogTitle>Eliminar tarjeta</DialogTitle>
              <DialogDescription>¿Estás seguro de que quieres eliminar esta tarjeta? Esta acción no se puede deshacer.</DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" className="border-gray-700 text-gray-200">Cancelar</Button>
              </DialogClose>
              <Button variant="destructive" className="bg-red-700 hover:bg-red-800" onClick={() => onEliminar(tarjeta.id)}>Eliminar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

function PrivacidadSection({ currentPassword, setCurrentPassword, newPassword, setNewPassword, confirmPassword, setConfirmPassword, changingPassword, handleChangePassword, deleteConfirmation, setDeleteConfirmation, deleting, handleDeleteAccount }: any) {
  return (
    <div className="space-y-6">
      <Card className="p-6 bg-neutral-900 border-gray-800">
        <h2 className="text-xl font-semibold mb-4">Cambiar contraseña</h2>
        <p className="text-sm text-gray-400 mb-6">
          Asegúrate de usar una contraseña segura con al menos 6 caracteres
        </p>

        <div className="space-y-4">
          <div>
            <Label className="text-gray-200">Contraseña actual</Label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="bg-neutral-800 border-gray-700 text-white"
              placeholder="Ingresa tu contraseña actual"
            />
          </div>

          <div>
            <Label className="text-gray-200">Nueva contraseña</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="bg-neutral-800 border-gray-700 text-white"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div>
            <Label className="text-gray-200">Confirmar nueva contraseña</Label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-neutral-800 border-gray-700 text-white"
              placeholder="Repite la nueva contraseña"
            />
          </div>

          <Button
            onClick={handleChangePassword}
            disabled={changingPassword}
            className="bg-teal-600 hover:bg-teal-700"
          >
            {changingPassword ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Actualizando...
              </>
            ) : (
              'Cambiar contraseña'
            )}
          </Button>
        </div>
      </Card>

      <Card className="p-6 bg-neutral-900 border-red-900/20">
        <h2 className="text-xl font-semibold mb-2 text-red-400">Zona de peligro</h2>
        <p className="text-sm text-gray-400 mb-6">
          Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor, ten certeza.
        </p>

        <div className="space-y-4">
          <div>
            <Label className="text-gray-200">
              Para confirmar, escribe "ELIMINAR" en el campo de abajo
            </Label>
            <Input
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              className="bg-neutral-800 border-red-900/30 text-white"
              placeholder="Escribe ELIMINAR"
            />
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="destructive"
                disabled={deleteConfirmation !== 'ELIMINAR'}
                className="bg-red-700 hover:bg-red-800"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar mi cuenta permanentemente
              </Button>
            </DialogTrigger>

            <DialogContent className="bg-neutral-900 border-gray-800">
              <DialogHeader>
                <DialogTitle>¿Estás absolutamente seguro?</DialogTitle>
                <DialogDescription>
                  Esta acción no se puede deshacer. Esto eliminará permanentemente tu cuenta y removerá tus datos de nuestros servidores.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" className="border-gray-700 text-gray-200">Cancelar</Button>
                </DialogClose>
                <Button
                  variant="destructive"
                  className="bg-red-700 hover:bg-red-800"
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                >
                  {deleting ? 'Eliminando...' : 'Confirmar eliminación'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </Card>
    </div>
  )
}