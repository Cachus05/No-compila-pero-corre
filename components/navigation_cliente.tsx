import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Menu, User, MessageSquare, PlusCircle } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Navigation() {
  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3 group">
              {/* Logo UTSC - Solo el escudo */}
              <div className="relative h-12 w-12">
                <Image
                  src="/utsc-logo.png"
                  alt="UTSC Free Market"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div>
                <span className="text-xl font-bold group-hover:text-primary transition-colors">
                  Free Market UTSC
                </span>
                <div className="text-xs text-muted-foreground">Freelance Services</div>
              </div>
            </Link>
            
            {/* Links principales */}
            <div className="hidden md:flex md:gap-6">
              <Link
                href="/dashboard_cliente"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Inicio
              </Link>
              <Link
                href="/dashboard_cliente/contratar/3"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Servicios
              </Link>
            </div>
          </div>
 
          {/* Icono usuario + menú */}
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/mi-cuenta">Mi cuenta</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/configuracion">Configuración</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/">Cerrar sesión</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
 
            {/* Menú responsive */}
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}