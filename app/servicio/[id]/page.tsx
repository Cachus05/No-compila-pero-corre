"use client"

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog'
import ContratarDialog from '@/components/contratar-dialog'
import { Loader2, Edit3, Trash2 } from 'lucide-react'

export default function ServicioPage() {
  const params = useParams()
  const router = useRouter()
  const { id } = params || {}

  const [servicio, setServicio] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Edit form
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')

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

  const handleSave = async (close: () => void) => {
    setSaving(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('No autorizado')

      const formData = new FormData()
      formData.append('title', title)
      formData.append('description', description)
      formData.append('price', price)
      formData.append('category', category)

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
        close()
      } else {
        const err = await res.json()
        alert(err.error || 'Error al actualizar')
      }
    } catch (err) {
      console.error(err)
      alert('Error al actualizar servicio')
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
      <div className="mx-auto max-w-4xl px-4 py-12">
        <Card className="overflow-hidden">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              {servicio.gallery_images && servicio.gallery_images.length > 0 ? (
                <img src={servicio.gallery_images[0]} alt={servicio.title} className="w-full h-80 object-cover rounded" />
              ) : (
                <div className="w-full h-80 bg-muted rounded flex items-center justify-center">No imagen</div>
              )}

              <h1 className="mt-4 text-2xl font-bold">{servicio.title}</h1>
              <p className="mt-2 text-muted-foreground">{servicio.description}</p>
            </div>

            <aside className="p-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  {servicio.avatar ? (
                    <AvatarImage src={servicio.avatar} alt={servicio.first_name} />
                  ) : null}
                  <AvatarFallback>{(servicio.first_name || 'U').charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">{servicio.first_name} {servicio.last_name}</div>
                  <div className="text-sm text-muted-foreground">{servicio.email}</div>
                </div>
              </div>

              <div className="mt-4">
                <div className="text-sm text-muted-foreground">Desde</div>
                <div className="text-2xl font-bold">${servicio.base_price}</div>
              </div>

              <div className="mt-4">
                <Badge className="capitalize">{servicio.category}</Badge>
              </div>

                <div className="mt-6 space-y-6 p-6 bg-zinc-900/60 rounded-2xl shadow-xl border border-zinc-800 backdrop-blur-xl">
                {isOwner() ? (
                    <>
                    <Dialog>
                        <DialogTrigger asChild>
                        <Button variant="outline" className="w-full flex items-center justify-center gap-2 rounded-xl py-4 text-zinc-200 border-zinc-700 bg-zinc-800/40 hover:bg-zinc-800/70 transition-all">
                            <Edit3 className="h-4 w-4" />
                            Editar servicio
                        </Button>
                        </DialogTrigger>

                        <DialogContent className="bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl text-zinc-200">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-semibold tracking-tight">Editar servicio</DialogTitle>
                            <DialogDescription className="text-zinc-400 text-sm">Actualiza la información del servicio.</DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 mt-4">
                            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título" className="bg-zinc-800 border-zinc-700 rounded-xl text-zinc-200" />
                            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descripción" className="bg-zinc-800 border-zinc-700 rounded-xl text-zinc-200" />
                            <Input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Precio" className="bg-zinc-800 border-zinc-700 rounded-xl text-zinc-200" />
                            <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Categoría" className="bg-zinc-800 border-zinc-700 rounded-xl text-zinc-200" />
                        </div>

                        <DialogFooter className="mt-6 flex justify-end gap-4">
                          <DialogClose asChild>
                            <Button variant="outline" className="border-zinc-600 text-zinc-300 rounded-xl px-6">
                              Cancelar
                            </Button>
                          </DialogClose>
                          <Button onClick={async () => { await handleSave(() => {}) }} className="bg-emerald-600 text-white px-6 py-2 rounded-xl hover:bg-emerald-700 transition-all">
                            {saving ? "Guardando..." : "Guardar"}
                          </Button>
                        </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Button variant="destructive" className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-white font-medium bg-red-700 hover:bg-red-800 transition-all" onClick={handleDelete}>
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
    </div>
  )
}
