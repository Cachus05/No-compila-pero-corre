'use client';
 
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from "@/components/navigation_freelance"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Mail, User as UserIcon, Plus, RefreshCw, Loader2, MessageCircle } from "lucide-react"

interface Usuario {
  id: number
  first_name: string
  last_name: string
  email: string
  phone?: string
  user_type: string
  avatar?: string
}

interface Servicio {
  id: number
  title: string
  description: string
  base_price: number
  category: string
  gallery_images: string[]
  views_count: number
  orders_count: number
  created_at: string
}

interface Proyecto {
  id: number
  service_id: number
  client_id: number
  freelancer_id: number
  status: string
  total_price: number
  created_at: string
  updated_at: string
  service_title: string
  service_images: string[]
  client_first_name: string
  client_last_name: string
  client_avatar: string | null
  client_email: string
}
 
export default function Dashboard() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingServicios, setLoadingServicios] = useState(true);
  const [proyectos, setProyectos] = useState<Proyecto[]>([])
  const [loadingProyectos, setLoadingProyectos] = useState(false)
  const [ventasCount, setVentasCount] = useState(0)
  const [isMounted, setIsMounted] = useState(false);
  
 
  useEffect(() => {
    setIsMounted(true);
    
    const token = localStorage.getItem('token');
    const usuarioGuardado = localStorage.getItem('usuario');
 
    if (!token || !usuarioGuardado) {
      router.push('/login');
      return;
    }
 
    const user = JSON.parse(usuarioGuardado);
    setUsuario(user);
    setLoading(false);

    // Cargar servicios del usuario si es freelancer
    if (user.user_type === 'freelancer') {
      cargarServicios(user.id, token);
    } else {
      setLoadingServicios(false);
    }
  }, [router]);

  // Recargar servicios cuando la ventana obtiene el foco
  useEffect(() => {
    const handleFocus = () => {
      const token = localStorage.getItem('token');
      if (usuario && usuario.user_type === 'freelancer' && token) {
        cargarServicios(usuario.id, token);
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'servicios_actualizados') {
        const token = localStorage.getItem('token');
        if (usuario && usuario.user_type === 'freelancer' && token) {
          cargarServicios(usuario.id, token);
        }
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorage);
    };
  }, [usuario]);

  const cargarServicios = async (userId: number, token: string) => {
    try {
      setLoadingServicios(true);
      const response = await fetch(`/api/services?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setServicios(data.servicios || []);
      }
    } catch (error) {
      console.error('Error al cargar servicios:', error);
    } finally {
      setLoadingServicios(false);
    }
  };

  const cargarProyectos = async () => {
    try {
      setLoadingProyectos(true)
      const token = localStorage.getItem('token')

      if (!token) {
        setProyectos([])
        return
      }

      const response = await fetch('/api/projects', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        setProyectos([])
        return
      }

      const data = await response.json()
      setProyectos(data.proyectos || [])
      setVentasCount(data.ventas || 0)
    } catch (err) {
      console.error('Error al cargar proyectos:', err)
      setProyectos([])
    } finally {
      setLoadingProyectos(false)
    }
  }

  useEffect(() => {
    if (usuario) {
      cargarProyectos()
    }
  }, [usuario])

  const refrescarServicios = () => {
    const token = localStorage.getItem('token');
    if (usuario && token) {
      cargarServicios(usuario.id, token);
    }
  };

  const handleContactarCliente = (clientId: number) => {
    router.push(`/dashboard/mensajes?freelancerId=${clientId}`)
  }
 
  if (!isMounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (!usuario) {
    return null;
  }

  const iniciales = `${usuario.first_name.charAt(0)}${usuario.last_name.charAt(0)}`.toUpperCase()
  
  const tipoUsuarioTexto = usuario.user_type === 'freelancer' 
    ? ' Freelancer' 
    : usuario.user_type === 'client'
    ? ' Cliente'
    : usuario.user_type === 'admin'
    ? ' Administrador'
    : ' Moderador'

  const colorBadge = usuario.user_type === 'freelancer'
    ? 'bg-teal-500/20 text-teal-400 border-teal-500/30'
    : usuario.user_type === 'client'
    ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    : 'bg-purple-500/20 text-purple-400 border-purple-500/30'
 
  return (
    <div className="min-h-screen">
      <Navigation />
 
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-white">
            ¡Bienvenido, {usuario.first_name}! 
          </h1>
          <p className="mt-2 text-lg text-gray-400">
            {usuario.user_type === 'freelancer' 
              ? 'Gestiona tus servicios y proyectos profesionales'
              : 'Encuentra freelancers talentosos y gestiona tus proyectos'}
          </p>
        </header>
 
        <main className="grid md:grid-cols-3 gap-8">
          <aside className="md:col-span-1">
            <div className="rounded-xl shadow-md p-6 border border-gray-800 bg-neutral-900">
              <div className="flex flex-col items-center">
                <Avatar className="w-24 h-24 mb-4 border-2 border-gray-700">
                  {usuario.avatar ? (
                    <AvatarImage 
                      src={usuario.avatar} 
                      alt={`${usuario.first_name} ${usuario.last_name}`}
                      className="object-cover"
                    />
                  ) : null}
                  <AvatarFallback className="bg-gradient-to-br from-teal-500 to-teal-600 text-3xl font-bold text-black">
                    {iniciales}
                  </AvatarFallback>
                </Avatar>
                
                <h2 className="text-xl font-semibold text-white">
                  {usuario.first_name} {usuario.last_name}
                </h2>
                
                <Badge className={`mt-2 ${colorBadge} border`}>
                  {tipoUsuarioTexto}
                </Badge>
              </div>

              <div className="mt-6 space-y-3 border-t border-gray-700 pt-4">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-300">{usuario.email}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <UserIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-400">ID: </span>
                  <span className="text-gray-300 font-mono">#{usuario.id}</span>
                </div>
              </div>

              <div className="mt-4 text-sm text-gray-300 border-t border-gray-700 pt-4">
                <p>
                  {usuario.user_type === 'freelancer'
                    ? servicios.length === 0 
                      ? 'Publica tu primer servicio para comenzar a recibir pedidos.'
                      : `Tienes ${servicios.length} servicio${servicios.length !== 1 ? 's' : ''} publicado${servicios.length !== 1 ? 's' : ''}.`
                    : 'Explora servicios y encuentra al freelancer perfecto para tu proyecto.'}
                </p>
              </div>
 
              <div className="mt-4 flex justify-between text-sm text-gray-400 border-t border-gray-700 pt-4">
                <span>Servicios: {servicios.length}</span>
                <span>Ventas: {ventasCount}</span>
              </div>

              <div className="mt-4">
                {usuario.user_type === 'freelancer' ? (
                  <Link href="/dashboard/publicar">
                    <Button className="w-full bg-teal-500 hover:bg-teal-600 text-black font-semibold">
                      <Plus className="mr-2 h-4 w-4" />
                      Publicar servicio
                    </Button>
                  </Link>
                ) : (
                  <Link href="/explorar">
                    <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold">
                      Explorar servicios
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            <div className="rounded-xl shadow-md p-6 border border-gray-800 bg-neutral-900 mt-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Información de tu cuenta
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center pb-2 border-b border-neutral-800">
                  <span className="text-gray-400">Nombre completo</span>
                  <span className="text-white">{usuario.first_name} {usuario.last_name}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-neutral-800">
                  <span className="text-gray-400">Correo</span>
                  <span className="text-white text-xs">{usuario.email}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-neutral-800">
                  <span className="text-gray-400">Tipo de cuenta</span>
                  <Badge className={`${colorBadge} border text-xs`}>
                    {tipoUsuarioTexto}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Usuario #</span>
                  <span className="text-white font-mono">{usuario.id}</span>
                </div>
              </div>
            </div>
          </aside>
 
          <section className="md:col-span-2">
            {loadingServicios ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
              </div>
            ) : (
              <>
                {servicios.length === 0 ? (
                  <div className="mb-6 p-8 rounded-lg bg-gradient-to-r from-teal-500/10 to-blue-500/10 border border-teal-500/30 text-center">
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {usuario.user_type === 'freelancer' 
                        ? '¡Publica tu primer servicio!' 
                        : 'No hay servicios disponibles'}
                    </h3>
                    <p className="text-gray-300 mb-4">
                      {usuario.user_type === 'freelancer'
                        ? 'Comienza a ofrecer tus servicios y conecta con clientes'
                        : 'Explora el catálogo de servicios disponibles'}
                    </p>
                    {usuario.user_type === 'freelancer' && (
                      <Link href="/dashboard/publicar">
                        <Button className="bg-teal-500 hover:bg-teal-600 text-black font-semibold">
                          <Plus className="mr-2 h-4 w-4" />
                          Crear mi primer servicio
                        </Button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-white">
                        Mis servicios
                      </h2>
                      <div className="flex gap-2">
                        {usuario.user_type === 'freelancer' && (
                          <>
                            <Button
                              onClick={refrescarServicios}
                              variant="outline"
                              size="sm"
                              className="border-gray-700 hover:bg-gray-800"
                              disabled={loadingServicios}
                            >
                              <RefreshCw className={`h-4 w-4 ${loadingServicios ? 'animate-spin' : ''}`} />
                            </Button>
                            <Link href="/dashboard/publicar">
                              <Button className="bg-teal-500 hover:bg-teal-600 text-black font-semibold">
                                <Plus className="mr-2 h-4 w-4" />
                                Nuevo servicio
                              </Button>
                            </Link>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {servicios.map((servicio) => (
                        <Card
                          key={servicio.id}
                          className="group overflow-hidden transition-all hover:shadow-lg hover:border-gray-700 duration-200 bg-neutral-900 border-gray-800"
                        >
                          <Link href={`/servicio/${servicio.id}`}>
                            <div className="aspect-video overflow-hidden bg-neutral-800">
                              {servicio.gallery_images && servicio.gallery_images.length > 0 ? (
                                <img
                                  src={servicio.gallery_images[0]}
                                  alt={servicio.title}
                                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-gray-500">
                                  <span className="text-4xl">📷</span>
                                </div>
                              )}
                            </div>
         
                            <div className="p-5">
                              <h3 className="line-clamp-2 text-lg font-semibold leading-tight text-white mb-2">
                                {servicio.title}
                              </h3>
         
                              <div className="flex items-center gap-2 mb-3">
                                <Avatar className="h-8 w-8">
                                  {usuario.avatar ? (
                                    <AvatarImage src={usuario.avatar} alt={usuario.first_name} />
                                  ) : null}
                                  <AvatarFallback>{iniciales}</AvatarFallback>
                                </Avatar>
                                <span className="text-sm text-gray-400">
                                  {usuario.first_name} {usuario.last_name}
                                </span>
                              </div>
         
                              <div className="flex items-center gap-2 mb-3">
                                <Badge variant="secondary" className="bg-blue-600/20 text-blue-400 border-none">
                                  {servicio.category}
                                </Badge>
                                <span className="text-sm text-gray-400">
                                  {servicio.views_count} vistas
                                </span>
                              </div>
         
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="text-sm text-gray-400">Desde</span>
                                  <div className="text-2xl font-bold text-white">${servicio.base_price}</div>
                                </div>
                                <Button
                                  size="sm"
                                  className="bg-teal-500 hover:bg-teal-600 text-black font-semibold rounded-lg"
                                >
                                  Ver detalles
                                </Button>
                              </div>
                            </div>
                          </Link>
                        </Card>
                      ))}
                    </div>

                    <Card className="p-8 mt-8 bg-neutral-900 border-gray-800">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-white">
                          {usuario.user_type === 'freelancer' ? 'Contratos pendientes' : 'Contratos activos'}
                          {proyectos.length > 0 && (
                            <span className="ml-2 text-sm text-gray-400">
                              ({proyectos.length})
                            </span>
                          )}
                        </h2>
                        <Button
                          onClick={cargarProyectos}
                          variant="outline"
                          size="sm"
                          className="border-gray-700 hover:bg-gray-800"
                          disabled={loadingProyectos}
                        >
                          <RefreshCw className={`h-4 w-4 ${loadingProyectos ? 'animate-spin' : ''}`} />
                        </Button>
                      </div>

                      {loadingProyectos && (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-teal-500" />
                          <span className="ml-2 text-sm text-gray-400">Cargando contratos...</span>
                        </div>
                      )}

                      {!loadingProyectos && proyectos.length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-gray-400">
                            {usuario.user_type === 'freelancer'
                              ? 'No tienes contratos pendientes aún.'
                              : 'No tienes contratos activos aún.'}
                          </p>
                          <p className="text-sm text-gray-500 mt-2">
                            {usuario.user_type === 'freelancer'
                              ? 'Los clientes que contraten tus servicios aparecerán aquí'
                              : 'Explora los servicios disponibles y contrata a un freelancer'}
                          </p>
                        </div>
                      )}

                      {!loadingProyectos && proyectos.length > 0 && (
                        <div className="space-y-4">
                          {proyectos.map((proyecto) => {
                            const imagenServicio = proyecto.service_images && proyecto.service_images.length > 0
                              ? proyecto.service_images[0]
                              : '/placeholder.svg'
                            
                            const nombreCliente = `${proyecto.client_first_name} ${proyecto.client_last_name}`
                            const inicialesCliente = `${proyecto.client_first_name.charAt(0)}${proyecto.client_last_name.charAt(0)}`

                            const statusConfig = {
                              pending: { label: 'Pendiente', variant: 'secondary' as const, color: 'bg-yellow-500/20 text-yellow-400' },
                              active: { label: 'Activo', variant: 'default' as const, color: 'bg-green-500/20 text-green-400' },
                              review: { label: 'En revisión', variant: 'default' as const, color: 'bg-blue-500/20 text-blue-400' },
                              completed: { label: 'Completado', variant: 'default' as const, color: 'bg-teal-500/20 text-teal-400' },
                              cancelled: { label: 'Cancelado', variant: 'destructive' as const, color: 'bg-red-500/20 text-red-400' }
                            }

                            const status = statusConfig[proyecto.status as keyof typeof statusConfig] || statusConfig.pending

                            return (
                              <Card key={proyecto.id} className="p-4 hover:bg-neutral-800/50 transition-colors border-gray-700">
                                <div className="flex gap-4">
                                  <div className="w-24 h-24 bg-neutral-800 rounded-lg overflow-hidden flex-shrink-0">
                                    <img
                                      src={imagenServicio}
                                      alt={proyecto.service_title}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = '/placeholder.svg'
                                      }}
                                    />
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold truncate mb-1 text-white">
                                      {proyecto.service_title}
                                    </h3>
                                    <div className="flex items-center gap-2 mb-2">
                                      <Avatar className="h-6 w-6">
                                        <AvatarImage 
                                          src={proyecto.client_avatar || undefined} 
                                          alt={nombreCliente} 
                                        />
                                        <AvatarFallback className="text-xs">{inicialesCliente}</AvatarFallback>
                                      </Avatar>
                                      <span className="text-sm text-gray-400">
                                        {nombreCliente}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm flex-wrap">
                                      <Badge className={status.color}>
                                        {status.label}
                                      </Badge>
                                      <span className="text-gray-400">
                                        ${proyecto.total_price}
                                      </span>
                                      <span className="text-gray-500">
                                        {new Date(proyecto.created_at).toLocaleDateString('es-ES', {
                                          day: '2-digit',
                                          month: 'short',
                                          year: 'numeric'
                                        })}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex flex-col gap-2">
                                    <Button
                                      size="sm"
                                      className="bg-teal-500 hover:bg-teal-600 text-black font-semibold"
                                      onClick={() => router.push(`/dashboard/agregar-avances?projectId=${proyecto.id}`)}
                                    >
                                      <Plus className="h-4 w-4 mr-2" />
                                      Agregar avance
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="border-gray-700 hover:bg-gray-800"
                                      onClick={() => handleContactarCliente(proyecto.client_id)}
                                    >
                                      <MessageCircle className="h-4 w-4 mr-2" />
                                      Contactar
                                    </Button>
                                  </div>
                                </div>
                              </Card>
                            )
                          })}
                        </div>
                      )}
                    </Card>
                  </>
                )}
              </>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}