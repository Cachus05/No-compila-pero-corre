"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Upload, Camera, Lock, Trash2, ArrowLeft } from 'lucide-react'
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
  first_name: string
  last_name: string
  email: string
  phone?: string
  avatar?: string
  user_type: string
}

// ==================== COMPONENTE PRINCIPAL ====================
export default function ConfiguracionClientePage() {
  const router = useRouter()

  // ---- ESTADOS PRINCIPALES ----
  const [selected, setSelected] = useState<'mi_cuenta' | 'metodos' | 'seguridad' | 'privacidad'>('mi_cuenta')
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)

  // ---- FORMULARIO MI CUENTA ----
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // ---- CAMBIO DE CONTRASEÑA ----
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

  // ---- PREFERENCIAS ----
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [marketingEmails, setMarketingEmails] = useState(false)

  // ---- ELIMINAR CUENTA ----
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [deleting, setDeleting] = useState(false)

  // ==================== EFECTOS ====================
  useEffect(() => {
    cargarUsuario()
  }, [])

  // ==================== FUNCIONES DE CARGA ====================
  const cargarUsuario = () => {
    try {
      const usuarioGuardado = localStorage.getItem('usuario')

      if (!usuarioGuardado) {
        router.push('/login')
        return
      }

      const user = JSON.parse(usuarioGuardado)

      if (user.user_type !== 'client') {
        router.push('/dashboard')
        return
      }

      setUsuario(user)
      setFirstName(user.first_name || '')
      setLastName(user.last_name || '')
      setEmail(user.email || '')
      setPhone(user.phone || '')

      setLoading(false)
    } catch (error) {
      console.error('Error al cargar usuario:', error)
      router.push('/login')
    }
  }

  // ==================== FUNCIONES MI CUENTA ====================
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setAvatarFile(file)

    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSaveChanges = async () => {
    if (!firstName || !lastName || !email) {
      alert('Por favor completa todos los campos requeridos')
      return
    }

    setSaving(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        alert('Sesión expirada')
        router.push('/login')
        return
      }

      const formData = new FormData()
      formData.append('first_name', firstName)
      formData.append('last_name', lastName)
      formData.append('phone', phone)

      if (avatarFile) {
        formData.append('avatar', avatarFile)
      }

      const response = await fetch(`/api/usuario/${usuario?.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (response.ok) {
        const usuarioActualizado = await response.json()
        localStorage.setItem('usuario', JSON.stringify(usuarioActualizado))
        setUsuario(usuarioActualizado)
        setAvatarFile(null)
        setAvatarPreview(null)
        alert('Cambios guardados exitosamente')
      } else {
        alert('Error al guardar cambios')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al guardar cambios')
    } finally {
      setSaving(false)
    }
  }

  // ==================== FUNCIONES SEGURIDAD ====================
  const handleChangePassword = async () => {
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
      if (!token) {
        alert('Sesión expirada')
        router.push('/login')
        return
      }

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
      if (!token) {
        alert('Sesión expirada')
        router.push('/login')
        return
      }

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
        <p className="text-white">No se pudo cargar la información</p>
      </div>
    )
  }

  const iniciales = `${usuario.first_name.charAt(0)}${usuario.last_name.charAt(0)}`.toUpperCase()

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <main className="max-w-6xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push('/dashboard_cliente')}
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
            iniciales={iniciales}
            selected={selected}
            setSelected={setSelected}
          />

          {/* ---- CONTENIDO PRINCIPAL ---- */}
          <section className="md:col-span-3">
            {selected === 'mi_cuenta' && (
              <MiCuentaSection
                usuario={usuario}
                firstName={firstName}
                setFirstName={setFirstName}
                lastName={lastName}
                setLastName={setLastName}
                phone={phone}
                setPhone={setPhone}
                email={email}
                avatarPreview={avatarPreview}
                saving={saving}
                handleAvatarChange={handleAvatarChange}
                handleSaveChanges={handleSaveChanges}
              />
            )}

            {selected === 'metodos' && (
              <MetodosSection />
            )}

            {selected === 'seguridad' && (
              <SeguridadSection
                currentPassword={currentPassword}
                setCurrentPassword={setCurrentPassword}
                newPassword={newPassword}
                setNewPassword={setNewPassword}
                confirmPassword={confirmPassword}
                setConfirmPassword={setConfirmPassword}
                changingPassword={changingPassword}
                handleChangePassword={handleChangePassword}
              />
            )}

            {selected === 'privacidad' && (
              <PrivacidadSection
                emailNotifications={emailNotifications}
                setEmailNotifications={setEmailNotifications}
                marketingEmails={marketingEmails}
                setMarketingEmails={setMarketingEmails}
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

function Sidebar({ usuario, iniciales, selected, setSelected }: any) {
  return (
    <aside className="md:col-span-1">
      <Card className="p-4 bg-neutral-900 border-gray-800 sticky top-6">
        <div className="flex flex-col items-center mb-6">
          <Avatar className="h-20 w-20 mb-3">
            <AvatarImage
              src={usuario.avatar ? `/uploads/avatars/${usuario.avatar}` : "/uploads/avatars/default.png"}
              alt={usuario.first_name}
            />
            <AvatarFallback>{iniciales}</AvatarFallback>
          </Avatar>
          <h2 className="text-lg font-semibold text-center">
            {usuario.first_name} {usuario.last_name}
          </h2>
          <p className="text-sm text-gray-400 text-center">{usuario.email}</p>
        </div>

        <nav className="space-y-2 w-full">
          <NavButton
            selected={selected}
            setSelected={setSelected}
            value="mi_cuenta"
            label="Mi cuenta"
          />
          <NavButton
            selected={selected}
            setSelected={setSelected}
            value="metodos"
            label="Métodos de pago"
          />
          <NavButton
            selected={selected}
            setSelected={setSelected}
            value="seguridad"
            label="Seguridad"
          />
          <NavButton
            selected={selected}
            setSelected={setSelected}
            value="privacidad"
            label="Privacidad"
          />
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
      <span className="font-medium text-sm">{label}</span>
    </button>
  )
}

function MiCuentaSection({
  usuario,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  phone,
  setPhone,
  email,
  avatarPreview,
  saving,
  handleAvatarChange,
  handleSaveChanges,
}: any) {
  return (
    <Card className="p-6 bg-neutral-900 border-gray-800">
      <div className="flex items-center gap-6 mb-6">
        <div className="relative group">
          <Avatar className="h-20 w-20">
            <AvatarImage
              src={avatarPreview || (usuario.avatar ? `/uploads/avatars/${usuario.avatar}` : "/uploads/avatars/default.png")}
              alt={usuario.first_name}
            />
            <AvatarFallback>
              {usuario.first_name.charAt(0)}{usuario.last_name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <label
            htmlFor="avatar-upload"
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
          >
            <Camera className="h-6 w-6 text-white" />
          </label>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>
        <div>
          <h2 className="text-xl font-semibold">{usuario.first_name} {usuario.last_name}</h2>
          <p className="text-sm text-gray-400">{usuario.email}</p>
          <p className="text-xs text-gray-500 mt-1">Haz clic en la foto para cambiarla</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label className="text-gray-200">Nombre</Label>
          <Input
            className="bg-neutral-800 border-gray-700 text-white"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>
        <div>
          <Label className="text-gray-200">Apellido</Label>
          <Input
            className="bg-neutral-800 border-gray-700 text-white"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-4">
        <Label className="text-gray-200">Correo electrónico</Label>
        <Input
          className="bg-neutral-800 border-gray-700 text-white"
          value={email}
          readOnly
        />
      </div>

      <div className="mt-4">
        <Label className="text-gray-200">Teléfono</Label>
        <Input
          className="bg-neutral-800 border-gray-700 text-white"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+1 (555) 123-4567"
        />
      </div>

      <div className="mt-6 flex gap-3">
        <Button
          variant="outline"
          className="border-gray-700 text-gray-200"
        >
          Cancelar
        </Button>
        <Button
          className="bg-teal-600 hover:bg-teal-700"
          onClick={handleSaveChanges}
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

function MetodosSection() {
  return (
    <Card className="p-6 bg-neutral-900 border-gray-800">
      <h2 className="text-xl font-semibold mb-4">Métodos de pago</h2>
      <p className="text-gray-400">Gestiona tus métodos de pago aquí</p>
    </Card>
  )
}

function SeguridadSection({
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  changingPassword,
  handleChangePassword,
}: any) {
  return (
    <Card className="p-6 bg-neutral-900 border-gray-800">
      <div className="flex items-center gap-3 mb-6">
        <Lock className="h-5 w-5 text-teal-500" />
        <h2 className="text-xl font-semibold">Cambiar contraseña</h2>
      </div>

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
  )
}

function PrivacidadSection({
  emailNotifications,
  setEmailNotifications,
  marketingEmails,
  setMarketingEmails,
  deleteConfirmation,
  setDeleteConfirmation,
  deleting,
  handleDeleteAccount,
}: any) {
  return (
    <div className="space-y-6">
      <Card className="p-6 bg-neutral-900 border-gray-800">
        <h2 className="text-xl font-semibold mb-4">Notificaciones</h2>
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
              className="w-4 h-4 rounded bg-neutral-800 border-gray-700"
            />
            <span className="text-gray-200">Notificaciones por email de proyectos</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={marketingEmails}
              onChange={(e) => setMarketingEmails(e.target.checked)}
              className="w-4 h-4 rounded bg-neutral-800 border-gray-700"
            />
            <span className="text-gray-200">Recibir emails de marketing</span>
          </label>
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
                <DialogTitle className="text-red-400">Confirmación final</DialogTitle>
                <DialogDescription>
                  Esta acción es <strong>irreversible</strong>. Se eliminarán:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Todos tus datos personales</li>
                    <li>Historial de contratos y proyectos</li>
                    <li>Mensajes y conversaciones</li>
                    <li>Métodos de pago guardados</li>
                  </ul>
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" className="border-gray-700 text-gray-200">
                    Cancelar
                  </Button>
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