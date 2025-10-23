'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from "@/components/navigation_freelance"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Star, Filter, GitBranch, Folder } from "lucide-react"


export default function Dashboard() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const usuarioGuardado = localStorage.getItem('usuario');

    if (!token || !usuarioGuardado) {
      router.push('/login');
      return;
    }

    setUsuario(JSON.parse(usuarioGuardado));
    setLoading(false);
  }, [router]);

  const handleCerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    router.push('/login');
  };
  const proyectos = [
    {
      id: 1,
      title: "Desarrollo web con React y Next.js",
      freelancer: "Carlos Ruiz",
      freelancerAvatar: "/man-developer.png",
      price: 500,
      rating: 5.0,
      reviews: 89,
      category: "Desarrollo",
      image: "/web-development-concept.png",
    },
    {
      id: 2,
      title: "Desarrollo web con React y Next.js",
      freelancer: "Carlos Ruiz",
      freelancerAvatar: "/man-developer.png",
      price: 500,
      rating: 5.0,
      reviews: 89,
      category: "Desarrollo",
      image: "/web-development-concept.png",
    },
    {
      id: 3,
      title: "Desarrollo web con React y Next.js",
      freelancer: "Carlos Ruiz",
      freelancerAvatar: "/man-developer.png",
      price: 500,
      rating: 5.0,
      reviews: 89,
      category: "Desarrollo",
      image: "/web-development-concept.png",
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-white">Mi portafolio</h1>
          <p className="mt-2 text-lg text-gray-400">
            Encuentra tus proyectos y gestiona tu presencia profesional
          </p>
        </header>

        {/* Contenido principal */}
        <main className="grid md:grid-cols-3 gap-8">
          {/* Perfil del usuario */}
          <aside className="md:col-span-1">
            <div className="rounded-xl shadow-md p-6 border border-gray-800">
              <div className="flex flex-col items-center">
                <Image
                  src={usuario?.foto || "abstract-digital-art.png"}
                  alt={usuario?.nombre || "Usuario"}
                  width={96}
                  height={96}
                  className="rounded-full mb-4 border border-gray-700"
                />
                <h2 className="text-xl font-semibold text-white">
                  {usuario?.nombre || "Freelancer"}
                </h2>
                <p className="text-gray-400 text-sm">
                  {usuario?.especialidad || "Desarrollador web"}
                </p>
              </div>

              <div className="mt-4 text-sm text-gray-300 border-t border-gray-700 pt-4">
                <p>
                  {usuario?.bio ||
                    "Apasionado del desarrollo y la tecnología, enfocado en crear soluciones digitales efectivas."}
                </p>
              </div>

              <div className="mt-4 flex justify-between text-sm text-gray-400">
                <span>Proyectos: {proyectos.length}</span>
                <span>Seguidores: 128</span>
              </div>
            </div>
          </aside>

          {/* Lista de proyectos */}
          <section className="md:col-span-2 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {proyectos.map((p) => (
              <Card
                key={p.id}
                className="group overflow-hidden transition-all hover:shadow-lg   hover:border-gray-700  duration-200"
              >
                <Link href={`/servicio/${p.id}`}>
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={p.image || "/placeholder.svg"}
                      alt={p.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>

                  <div className="p-5">
                    <h3 className="line-clamp-2 text-lg font-semibold leading-tight text-white mb-2">
                      {p.title}
                    </h3>

                    <div className="flex items-center gap-2 mb-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={p.freelancerAvatar} alt={p.freelancer} />
                        <AvatarFallback>{p.freelancer.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-400">{p.freelancer}</span>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{p.rating}</span>
                      <span className="text-sm text-gray-400">({p.reviews})</span>
                      <Badge variant="secondary" className="ml-auto bg-blue-600/20 text-blue-400 border-none">
                        {p.category}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm text-gray-400">Desde</span>
                        <div className="text-2xl font-bold text-white">${p.price}</div>
                      </div>
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                      >
                        Modificar
                      </Button>
                    </div>
                  </div>
                </Link>
              </Card>
            ))}
          </section>
        </main>
      </div>
    </div>
  );
}