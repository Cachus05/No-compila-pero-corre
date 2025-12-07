"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/navigation_freelance'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'

export default function MiCuentaPage() {
  const router = useRouter()
  const [usuario, setUsuario] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form state
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [bio, setBio] = useState('')
  const [hourlyRate, setHourlyRate] = useState('')
  const [skills, setSkills] = useState('')
  const [languages, setLanguages] = useState('')
  const [experienceLevel, setExperienceLevel] = useState('')
  const [portfolioUrl, setPortfolioUrl] = useState('')
  const [linkedinProfile, setLinkedinProfile] = useState('')
  const [githubProfile, setGithubProfile] = useState('')
  const [availability, setAvailability] = useState('')

  useEffect(() => {
    const cargarDatosUsuario = async () => {
      try {
        const token = localStorage.getItem('token')
        const u = localStorage.getItem('usuario')
        
        if (!token || !u) {
          router.push('/login')
          return
        }

        const parsed = JSON.parse(u)
        const userId = parsed.id

        // Cargar datos completos desde el backend (combina users + freelancer_profiles)
        const res = await fetch(`/api/usuario/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (res.ok) {
          const data = await res.json()
          const userData = data.usuario || data
          
          setUsuario(userData)
          
          // Datos de la tabla users
          setFirstName(userData.first_name || '')
          setLastName(userData.last_name || '')
          setEmail(userData.email || '')
          setPhone(userData.phone || '')
          setAvatarPreview(userData.avatar || null)
          
          // Datos de la tabla freelancer_profiles
          setBio(userData.bio || '')
          setHourlyRate(userData.hourly_rate ? String(userData.hourly_rate) : '')
          setSkills(userData.skills || '')
          setLanguages(userData.languages || '')
          setExperienceLevel(userData.experience_level || '')
          setPortfolioUrl(userData.portfolio_url || '')
          setLinkedinProfile(userData.linkedin_profile || '')
          setGithubProfile(userData.github_profile || '')
          setAvailability(userData.availability || '')
        } else {
          // Si falla la carga desde API, usar localStorage como fallback
          setUsuario(parsed)
          setFirstName(parsed.first_name || '')
          setLastName(parsed.last_name || '')
          setEmail(parsed.email || '')
          setPhone(parsed.phone || '')
          setAvatarPreview(parsed.avatar || null)
          setBio(parsed.bio || '')
          setHourlyRate(parsed.hourly_rate ? String(parsed.hourly_rate) : '')
          setSkills(parsed.skills || '')
          setLanguages(parsed.languages || '')
          setExperienceLevel(parsed.experience_level || '')
          setPortfolioUrl(parsed.portfolio_url || '')
          setLinkedinProfile(parsed.linkedin_profile || '')
          setGithubProfile(parsed.github_profile || '')
          setAvailability(parsed.availability || '')
        }
      } catch (err) {
        console.error('Error al cargar datos:', err)
        setError('Error al cargar los datos del usuario')
      } finally {
        setLoading(false)
      }
    }

    cargarDatosUsuario()
  }, [router])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0]
    if (f) {
      setAvatarFile(f)
      setAvatarPreview(URL.createObjectURL(f))
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess('')
    
    try {
      const token = localStorage.getItem('token')
      if (!token || !usuario) throw new Error('No autorizado')

      // Validaciones básicas
      if (!firstName.trim() || !lastName.trim()) {
        setError('Nombre y apellido son obligatorios')
        setSaving(false)
        return
      }

      const formData = new FormData()
      formData.append('first_name', firstName)
      formData.append('last_name', lastName)
      formData.append('email', email)
      formData.append('phone', phone)
      formData.append('bio', bio)
      formData.append('hourly_rate', hourlyRate)
      formData.append('skills', skills)
      formData.append('languages', languages)
      formData.append('experience_level', experienceLevel)
      formData.append('portfolio_url', portfolioUrl)
      formData.append('linkedin_profile', linkedinProfile)
      formData.append('github_profile', githubProfile)
      formData.append('availability', availability)
      
      if (avatarFile) formData.append('avatar', avatarFile)

      const res = await fetch(`/api/usuario/${usuario.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      })

      if (res.ok) {
        const data = await res.json()
        const updated = data.usuario || {}
        
        // Actualizar localStorage
        localStorage.setItem('usuario', JSON.stringify(updated))
        setUsuario(updated)
        
  setSuccess('Perfil actualizado correctamente')
        setTimeout(() => setSuccess(''), 4000)
      } else {
        const err = await res.json()
        setError(err.error || 'Error al actualizar')
      }
    } catch (err) {
      console.error(err)
      setError('Error al guardar cambios')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <Navigation />
      <main className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">Mi cuenta</h1>

        {error && (
          <Card className="mb-4 border-red-500 bg-red-500/10 p-3">
            <div className="text-sm text-red-300">{error}</div>
          </Card>
        )}

        {success && (
          <Card className="mb-4 border-teal-500 bg-teal-500/10 p-3">
            <div className="text-sm text-teal-300">{success}</div>
          </Card>
        )}

        <Card className="p-6 bg-neutral-800 border-gray-700">
          <div className="grid md:grid-cols-3 gap-6 items-start">
            <div className="flex flex-col items-center md:items-start md:col-span-1">
              <Avatar className="w-24 h-24">
                {avatarPreview ? (
                  <AvatarImage src={avatarPreview} alt={`${firstName} ${lastName}`} />
                ) : (
                  <AvatarFallback className="text-2xl">
                    {(firstName || 'U').charAt(0)}
                  </AvatarFallback>
                )}
              </Avatar>
              <label className="mt-3 flex flex-col items-center text-sm text-gray-300 cursor-pointer hover:text-teal-400 transition">
                <span className="underline">Cambiar avatar</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleAvatarChange} 
                  className="hidden" 
                />
              </label>
            </div>

            <div className="md:col-span-2 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-200">Nombre</Label>
                  <Input 
                    value={firstName} 
                    onChange={(e) => setFirstName(e.target.value)} 
                    disabled={saving} 
                    className="bg-neutral-900 border-gray-600 text-white" 
                  />
                </div>
                <div>
                  <Label className="text-gray-200">Apellido</Label>
                  <Input 
                    value={lastName} 
                    onChange={(e) => setLastName(e.target.value)} 
                    disabled={saving} 
                    className="bg-neutral-900 border-gray-600 text-white" 
                  />
                </div>
              </div>

              <div>
                <Label className="text-gray-200">Email</Label>
                <Input 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  disabled={saving} 
                  className="bg-neutral-900 border-gray-600 text-white" 
                />
              </div>

              <div>
                <Label className="text-gray-200">Teléfono</Label>
                <Input 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  disabled={saving} 
                  className="bg-neutral-900 border-gray-600 text-white"
                  placeholder="Ej: +52 812 345 6789"
                />
              </div>

              <div>
                <Label className="text-gray-200">Biografía</Label>
                <Textarea 
                  value={bio} 
                  onChange={(e) => setBio(e.target.value)} 
                  disabled={saving} 
                  className="bg-neutral-900 border-gray-600 text-white" 
                  rows={4}
                  placeholder="Cuéntanos sobre ti, tu experiencia y especialidades..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-200">Tarifa por hora (USD)</Label>
                  <Input 
                    type="number" 
                    min="0" 
                    step="0.01"
                    value={hourlyRate} 
                    onChange={(e) => setHourlyRate(e.target.value)} 
                    disabled={saving} 
                    className="bg-neutral-900 border-gray-600 text-white"
                    placeholder="25.00"
                  />
                </div>
                <div>
                  <Label className="text-gray-200">Nivel de experiencia</Label>
                  <select 
                    value={experienceLevel} 
                    onChange={(e) => setExperienceLevel(e.target.value)} 
                    disabled={saving} 
                    className="w-full bg-neutral-900 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Selecciona</option>
                    <option value="entry">Entry</option>
                    <option value="intermediate">Intermedio</option>
                    <option value="expert">Experto</option>
                  </select>
                </div>
              </div>

              <div>
                <Label className="text-gray-200">Habilidades (separadas por comas)</Label>
                <Input 
                  value={skills} 
                  onChange={(e) => setSkills(e.target.value)} 
                  disabled={saving} 
                  className="bg-neutral-900 border-gray-600 text-white"
                  placeholder="React, Node.js, Python, Diseño UX"
                />
              </div>

              <div>
                <Label className="text-gray-200">Idiomas (separados por comas)</Label>
                <Input 
                  value={languages} 
                  onChange={(e) => setLanguages(e.target.value)} 
                  disabled={saving} 
                  className="bg-neutral-900 border-gray-600 text-white"
                  placeholder="Español, Inglés, Francés"
                />
              </div>

              <div>
                <Label className="text-gray-200">Portafolio (URL)</Label>
                <Input 
                  value={portfolioUrl} 
                  onChange={(e) => setPortfolioUrl(e.target.value)} 
                  disabled={saving} 
                  className="bg-neutral-900 border-gray-600 text-white"
                  placeholder="https://miportfolio.com"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-200">LinkedIn (URL)</Label>
                  <Input 
                    value={linkedinProfile} 
                    onChange={(e) => setLinkedinProfile(e.target.value)} 
                    disabled={saving} 
                    className="bg-neutral-900 border-gray-600 text-white"
                    placeholder="https://linkedin.com/in/tu-perfil"
                  />
                </div>
                <div>
                  <Label className="text-gray-200">GitHub (URL)</Label>
                  <Input 
                    value={githubProfile} 
                    onChange={(e) => setGithubProfile(e.target.value)} 
                    disabled={saving} 
                    className="bg-neutral-900 border-gray-600 text-white"
                    placeholder="https://github.com/tu-usuario"
                  />
                </div>
              </div>

              <div>
                <Label className="text-gray-200">Disponibilidad</Label>
                <select 
                  value={availability} 
                  onChange={(e) => setAvailability(e.target.value)} 
                  disabled={saving} 
                  className="w-full bg-neutral-900 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Selecciona</option>
                  <option value="available">Disponible</option>
                  <option value="busy">Ocupado</option>
                  <option value="not_available">No disponible</option>
                </select>
              </div>

              <div className="flex gap-3 pt-3">
                <Button 
                  onClick={() => router.push('/dashboard')} 
                  variant="outline" 
                  className="border-gray-600 text-gray-200 hover:bg-neutral-800"
                >
                  Volver
                </Button>
                <Button 
                  onClick={handleSave} 
                  disabled={saving} 
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" /> 
                      Guardando...
                    </>
                  ) : (
                    'Guardar cambios'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </main>
    </div>
  )
}

