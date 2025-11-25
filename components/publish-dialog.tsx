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

export default function PublishDialog({
  children,
}: {
  children?: React.ReactNode
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children ?? (
          <Button size="lg" variant="outline">
            Publicar servicio
          </Button>
        )}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle> ¡ Comparte lo que sabes hacer !</DialogTitle>
          <DialogDescription>
            Regístrate o inicia sesión como freelance y publica tu servicio.
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
