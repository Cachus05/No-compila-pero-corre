'use client';
 
import { useState } from 'react';
import { Navigation } from "@/components/navigation_freelance"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: Date;
  isMe: boolean;
}

interface Conversation {
  id: string;
  user: {
    name: string;
    avatar: string;
    status: string;
  };
  lastMessage: string;
  timestamp: Date;
  unread: number;
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  const [newMessage, setNewMessage] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<string>('');

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    // Aquí se implementará la lógica de socket.io
    setNewMessage('');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto p-4">
        <div className="grid grid-cols-12 gap-4 mt-6">
          {/* Lista de conversaciones */}
          <div className="col-span-4 bg-card rounded-lg border h-[calc(100vh-200px)]">
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar conversación..."
                  className="pl-9"
                />
              </div>
            </div>
            <ScrollArea className="h-[calc(100%-80px)]">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-4 border-b cursor-pointer hover:bg-accent/50 ${
                    selectedConversation === conversation.id ? 'bg-accent' : ''
                  }`}
                  onClick={() => setSelectedConversation(conversation.id)}
                >
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={conversation.user.avatar} />
                      <AvatarFallback>{conversation.user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium truncate">
                          {conversation.user.name}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {new Date(conversation.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {conversation.lastMessage}
                      </p>
                    </div>
                    {conversation.unread > 0 && (
                      <Badge variant="destructive" className="rounded-full">
                        {conversation.unread}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </ScrollArea>
          </div>

          {/* Panel de chat */}
          <div className="col-span-8 bg-card rounded-lg border h-[calc(100vh-200px)] flex flex-col">
            <div className="p-4 border-b">
              <div className="flex items-center space-x-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={conversations.find(c => c.id === selectedConversation)?.user.avatar} />
                  <AvatarFallback>
                    {conversations.find(c => c.id === selectedConversation)?.user.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-lg font-semibold">
                    {conversations.find(c => c.id === selectedConversation)?.user.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {conversations.find(c => c.id === selectedConversation)?.user.status}
                  </p>
                </div>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.isMe ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.isMe
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <span className="text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <Input
                  placeholder="Escribe un mensaje..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSendMessage();
                    }
                  }}
                />
                <Button onClick={handleSendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
