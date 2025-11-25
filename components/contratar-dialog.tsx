"use client"

import React from "react"
import Link from "next/link"
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

export default function ContratarDialog({
  children,
}: {
  children?: React.ReactNode
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children ?? (
          <Button size="sm">
            Contratar
          </Button>
        )}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle> ¿Listo para encontrar al experto que necesitas? </DialogTitle>
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
