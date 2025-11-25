'use client';

import { useState } from 'react';
import { Navigation } from "@/components/navigation_cliente"
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
    setNewMessage('');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-6 py-10 max-w-7xl">
        <div className="grid grid-cols-12 gap-8 mt-4">
          {/* Lista de conversaciones */}
          <div className="col-span-4 bg-card rounded-lg border h-[calc(100vh-220px)] flex flex-col">
            <div className="p-5 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar conversación..."
                  className="pl-9"
                />
              </div>
            </div>
            <ScrollArea className="flex-1">
              <div className="divide-y">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`p-5 cursor-pointer transition-colors duration-200 hover:bg-accent/50 ${
                      selectedConversation === conversation.id ? 'bg-accent' : ''
                    }`}
                    onClick={() => setSelectedConversation(conversation.id)}
                  >
                    <div className="flex items-center gap-4">
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
                        <Badge variant="destructive" className="rounded-full text-xs">
                          {conversation.unread}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Panel de chat */}
          <div className="col-span-8 bg-card rounded-lg border h-[calc(100vh-220px)] flex flex-col">
            <div className="p-5 border-b">
              <div className="flex items-center gap-4">
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

            <ScrollArea className="flex-1 p-6">
              <div className="space-y-5">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.isMe ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-xl p-3 ${
                        message.isMe
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm mb-1">{message.text}</p>
                      <span className="text-xs opacity-70 block text-right">
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

            <div className="p-5 border-t">
              <div className="flex gap-3">
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