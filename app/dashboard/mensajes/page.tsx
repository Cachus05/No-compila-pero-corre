'use client';
 
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from "@/components/navigation_freelance"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Search, MessageCircle, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function MessagesPage() {
  const router = useRouter()
  const [usuario, setUsuario] = useState(null)
  const [conversations, setConversations] = useState([])
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const messagesEndRef = useRef(null)

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
    if (selectedConversation) {
      cargarMensajes(selectedConversation.chat_id)
      // Auto-recargar mensajes cada 5 segundos
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

  const cargarMensajes = async (chatId, silent = false) => {
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
        cargarConversaciones() // Actualizar lista
      }
    } catch (error) {
      console.error('Error al enviar mensaje:', error)
    } finally {
      setSending(false)
    }
  }

  const formatearFecha = (fecha) => {
    const date = new Date(fecha)
    const ahora = new Date()
    const diff = ahora - date

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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 mt-6">Mensajes</h1>
        
        <div className="grid grid-cols-12 gap-4">
          {/* Lista de conversaciones */}
          <div className="col-span-4 bg-card rounded-lg border h-[calc(100vh-200px)] flex flex-col">
            <div className="p-4 border-b">
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
                  <p className="text-sm mt-2">Los clientes te contactarán al contratar tus servicios</p>
                </div>
              ) : (
                conversacionesFiltradas.map((conversation) => {
                  const iniciales = `${conversation.other_user_first_name?.charAt(0) || 'U'}${conversation.other_user_last_name?.charAt(0) || ''}`
                  const isActive = selectedConversation?.chat_id === conversation.chat_id
                  
                  return (
                    <div
                      key={conversation.chat_id}
                      className={`p-4 border-b cursor-pointer hover:bg-accent/50 transition-colors ${
                        isActive ? 'bg-accent' : ''
                      }`}
                      onClick={() => setSelectedConversation(conversation)}
                    >
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={conversation.other_user_avatar || undefined} />
                          <AvatarFallback>{iniciales}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium truncate">
                              {conversation.other_user_first_name} {conversation.other_user_last_name}
                            </p>
                            <span className="text-xs text-muted-foreground">
                              {formatearFecha(conversation.last_message_at)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {conversation.last_message || 'Inicia una conversación'}
                          </p>
                        </div>
                        {conversation.unread_count > 0 && (
                          <Badge variant="destructive" className="rounded-full">
                            {conversation.unread_count}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </ScrollArea>
          </div>

          {/* Panel de chat */}
          <div className="col-span-8 bg-card rounded-lg border h-[calc(100vh-200px)] flex flex-col">
            {selectedConversation ? (
              <>
                <div className="p-4 border-b">
                  <div className="flex items-center space-x-4">
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

                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => {
                      const isMe = message.sender_id === usuario?.id
                      
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              isMe
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <p className="text-sm">{message.message}</p>
                            <span className="text-xs opacity-70">
                              {formatearFecha(message.sent_at)}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                <div className="p-4 border-t">
                  <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex space-x-2">
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