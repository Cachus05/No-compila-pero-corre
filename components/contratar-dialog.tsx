"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"

interface ContratarDialogProps {
  children?: React.ReactNode
  serviceId?: string | number
}

export default function ContratarDialog({
  children,
  serviceId,
}: ContratarDialogProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const handleTriggerClick = (e: React.MouseEvent) => {
    // Verificar sesión en tiempo real
    const usuarioGuardado = localStorage.getItem('usuario')
    
    if (usuarioGuardado) {
      // Si hay sesión, prevenir que se abra el dialog y redirigir
      e.preventDefault()
      e.stopPropagation()
      
      // Obtener el ID del servicio desde la URL o desde props
      let id: string | number | undefined = serviceId
      
      if (!id) {
        // Intentar extraer ID de la URL actual
        const idMatch = pathname.match(/\/contratar\/(\d+)/)
        id = idMatch ? idMatch[1] : undefined
      }
      
      if (id) {
        router.push(`/dashboard_cliente/checkout/${id}`)
      } else {
        console.error('No se encontró ID del servicio')
        alert('Error: No se pudo identificar el servicio')
      }
    } else {
      // Si NO hay sesión, permitir que se abra el dialog
      setIsOpen(true)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild onClick={handleTriggerClick}>
        {children ?? (
          <Button size="sm">
            Contratar
          </Button>
        )}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Listo para encontrar al experto que necesitas?</DialogTitle>
          <DialogDescription>
            Regístrate o inicia sesión y contrata el servicio ideal para tu proyecto.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button asChild>
            <Link href="/registro">Crear cuenta</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/login">Iniciar sesión</Link>
          </Button>
        </DialogFooter>

        <DialogClose className="sr-only">Cerrar</DialogClose>
      </DialogContent>
    </Dialog>
  )
}