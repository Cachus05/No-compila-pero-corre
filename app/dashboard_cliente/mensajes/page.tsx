'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Navigation } from "@/components/navigation_cliente"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Search, MessageCircle, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

// Tipos
interface Usuario {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
}

interface Conversacion {
  chat_id: number;
  project_id: number | null;
  created_at: string;
  client_id: number;
  freelancer_id: number;
  other_user_id: number;
  other_user_first_name: string;
  other_user_last_name: string;
  other_user_avatar: string | null;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
}

interface Mensaje {
  id: number;
  chat_id: number;
  project_id: number | null;
  sender_id: number;
  receiver_id: number;
  message: string;
  is_read: number;
  sent_at: string;
  first_name: string;
  last_name: string;
  avatar: string | null;
}

export default function MessagesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [conversations, setConversations] = useState<Conversacion[]>([])
  const [messages, setMessages] = useState<Mensaje[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [selectedConversation, setSelectedConversation] = useState<Conversacion | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [creatingChat, setCreatingChat] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuario')
    if (!usuarioGuardado) {
      router.push('/login')
      return
    }
    setUsuario(JSON.parse(usuarioGuardado))
  }, [router])

  useEffect(() => {
    if (usuario) {
      cargarConversaciones()
    }
  }, [usuario])

  useEffect(() => {
    const freelancerId = searchParams.get('freelancerId')
    if (freelancerId && conversations.length > 0 && usuario) {
      handleFreelancerSelection(parseInt(freelancerId))
    }
  }, [conversations, searchParams, usuario])

  useEffect(() => {
    if (selectedConversation) {
      cargarMensajes(selectedConversation.chat_id)
      const interval = setInterval(() => {
        cargarMensajes(selectedConversation.chat_id, true)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [selectedConversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const cargarConversaciones = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setConversations(data.conversaciones || [])
      }
    } catch (error) {
      console.error('Error al cargar conversaciones:', error)
    } finally {
      setLoading(false)
    }
  }

  const cargarMensajes = async (chatId: number, silent = false) => {
    try {
      if (!silent) setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/conversations/${chatId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setMessages(data.mensajes || [])
      }
    } catch (error) {
      console.error('Error al cargar mensajes:', error)
    } finally {
      if (!silent) setLoading(false)
    }
  }

  const handleFreelancerSelection = async (freelancerId: number) => {
    const existingConversation = conversations.find(
      conv => conv.other_user_id === freelancerId
    )

    if (existingConversation) {
      setSelectedConversation(existingConversation)
    } else {
      await crearNuevaConversacion(freelancerId)
    }
  }

  const crearNuevaConversacion = async (freelancerId: number) => {
    setCreatingChat(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          receiverId: freelancerId,
          projectId: null
        })
      })

      if (response.ok) {
        const data = await response.json()
        
        const newConversation: Conversacion = {
          chat_id: data.chatId,
          project_id: data.projectId,
          created_at: new Date().toISOString(),
          client_id: usuario?.id || 0,
          freelancer_id: data.receiver.id,
          other_user_id: data.receiver.id,
          other_user_first_name: data.receiver.first_name,
          other_user_last_name: data.receiver.last_name,
          other_user_avatar: data.receiver.avatar,
          last_message: null,
          last_message_at: new Date().toISOString(),
          unread_count: 0
        }

        setConversations([newConversation, ...conversations])
        setSelectedConversation(newConversation)
      }
    } catch (error) {
      console.error('Error al crear conversación:', error)
    } finally {
      setCreatingChat(false)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    setSending(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/conversations/${selectedConversation.chat_id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: newMessage,
          receiverId: selectedConversation.other_user_id,
          projectId: selectedConversation.project_id
        })
      })

      if (response.ok) {
        const data = await response.json()
        setMessages([...messages, data.mensaje])
        setNewMessage('')
        cargarConversaciones()
      }
    } catch (error) {
      console.error('Error al enviar mensaje:', error)
    } finally {
      setSending(false)
    }
  }

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha)
    const ahora = new Date()
    const diff = ahora.getTime() - date.getTime()

    if (diff < 60000) return 'Ahora'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`
    
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer'
    }
    
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
  }

  const conversacionesFiltradas = conversations.filter(conv =>
    `${conv.other_user_first_name} ${conv.other_user_last_name}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  )

  if (loading && conversations.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (creatingChat) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Iniciando conversación...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-6 py-10 max-w-7xl">
        <h1 className="text-3xl font-bold mb-6">Mensajes</h1>
        
        <div className="grid grid-cols-12 gap-8">
          {/* Lista de conversaciones */}
          <div className="col-span-4 bg-card rounded-lg border h-[calc(100vh-220px)] flex flex-col">
            <div className="p-5 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar conversación..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <ScrollArea className="flex-1">
              {conversacionesFiltradas.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No tienes conversaciones</p>
                  <p className="text-sm mt-2">Empieza contratando un servicio</p>
                </div>
              ) : (
                <div className="divide-y">
                  {conversacionesFiltradas.map((conversation) => {
                    const iniciales = `${conversation.other_user_first_name?.charAt(0) || 'U'}${conversation.other_user_last_name?.charAt(0) || ''}`
                    const isActive = selectedConversation?.chat_id === conversation.chat_id
                    
                    return (
                      <div
                        key={conversation.chat_id}
                        className={`p-5 cursor-pointer transition-colors duration-200 hover:bg-accent/50 ${
                          isActive ? 'bg-accent' : ''
                        }`}
                        onClick={() => setSelectedConversation(conversation)}
                      >
                        <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={conversation.other_user_avatar || undefined} />
                            <AvatarFallback>{iniciales}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium truncate">
                                {conversation.other_user_first_name} {conversation.other_user_last_name}
                              </p>
                              {conversation.last_message_at && (
                                <span className="text-xs text-muted-foreground">
                                  {formatearFecha(conversation.last_message_at)}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {conversation.last_message || 'Inicia una conversación'}
                            </p>
                          </div>
                          {conversation.unread_count > 0 && (
                            <Badge variant="destructive" className="rounded-full text-xs">
                              {conversation.unread_count}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Panel de chat */}
          <div className="col-span-8 bg-card rounded-lg border h-[calc(100vh-220px)] flex flex-col">
            {selectedConversation ? (
              <>
                <div className="p-5 border-b">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedConversation.other_user_avatar || undefined} />
                      <AvatarFallback>
                        {selectedConversation.other_user_first_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-lg font-semibold">
                        {selectedConversation.other_user_first_name} {selectedConversation.other_user_last_name}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {selectedConversation.project_id ? `Proyecto #${selectedConversation.project_id}` : 'En línea'}
                      </p>
                    </div>
                  </div>
                </div>

                <ScrollArea className="flex-1 p-6">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <div className="text-center">
                        <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No hay mensajes aún</p>
                        <p className="text-sm mt-2">Envía el primer mensaje</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {messages.map((message) => {
                        const isMe = message.sender_id === usuario?.id
                        
                        return (
                          <div
                            key={message.id}
                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-xl p-3 ${
                                isMe
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                              }`}
                            >
                              <p className="text-sm mb-1">{message.message}</p>
                              <span className="text-xs opacity-70 block text-right">
                                {formatearFecha(message.sent_at)}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>

                <div className="p-5 border-t">
                  <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex gap-3">
                    <Input
                      placeholder="Escribe un mensaje..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      disabled={sending}
                    />
                    <Button type="submit" disabled={sending || !newMessage.trim()}>
                      {sending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Selecciona una conversación</p>
                  <p className="text-sm mt-2">para comenzar a chatear</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}