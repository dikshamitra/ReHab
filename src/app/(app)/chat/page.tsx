
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Trash2, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect, useRef } from "react";
import { collection, addDoc, onSnapshot, query, orderBy, doc, deleteDoc, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Simple list of personas for the AI
const COUNSELOR_PERSONAS = [
    { name: 'Alex', hint: 'friendly face' },
    { name: 'Dr. Evelyn Reed', hint: 'professional portrait' },
    { name: 'Sam', hint: 'empathetic listener' },
    { name: 'Jordan', hint: 'calm person' },
];

export type Message = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    createdAt: Date;
}

export default function ChatPage() {
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [counselor, setCounselor] = useState({ name: 'Counselor', hint: 'professional portrait'});
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!isClient) return;
    const storedChatId = localStorage.getItem('chatId');
    if (storedChatId) {
      setChatId(storedChatId);
      const randomCounselor = COUNSELOR_PERSONAS[Math.floor(Math.random() * COUNSELOR_PERSONAS.length)];
      setCounselor(randomCounselor);
    } else {
      startNewChat();
    }
  }, [isClient]);

  useEffect(() => {
    if (chatId) {
        const q = query(collection(db, "chats", chatId, "messages"), orderBy("createdAt"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const msgs: Message[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                msgs.push({ 
                    id: doc.id, 
                    role: data.role,
                    content: data.content,
                    createdAt: data.createdAt.toDate(),
                });
            });
            setMessages(msgs);
        });

        return () => unsubscribe();
    }
  }, [chatId]);


  const startNewChat = async () => {
    const newChatRef = await addDoc(collection(db, "chats"), { createdAt: new Date() });
    const newChatId = newChatRef.id;
    setChatId(newChatId);
    if(isClient) {
        localStorage.setItem('chatId', newChatId);
    }
    setMessages([]);
    const randomCounselor = COUNSELOR_PERSONAS[Math.floor(Math.random() * COUNSELOR_PERSONAS.length)];
    setCounselor(randomCounselor);
  };

  const handleDeleteConvo = async () => {
    if(chatId) {
      const messagesRef = collection(db, "chats", chatId, "messages");
      const querySnapshot = await getDocs(messagesRef);
      querySnapshot.forEach((doc) => {
          deleteDoc(doc.ref);
      });
      await deleteDoc(doc(db, "chats", chatId));
    }
    if (isClient) {
        localStorage.removeItem('chatId');
    }
    startNewChat();
  };

  const handleChangeUser = () => {
    if (isClient) {
        localStorage.removeItem('chatId');
    }
    startNewChat();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !chatId) return;

    const userMessage = {
        role: 'user' as const,
        content: input,
        createdAt: new Date(),
    };
    
    const currentInput = input;
    setInput('');

    await addDoc(collection(db, "chats", chatId, "messages"), userMessage);

    // Call the backend API to get the assistant's response
    await fetch('/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chatId }),
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
                Anonymous Chat
            </h1>
            <p className="text-muted-foreground">
                Connect with a supportive counselor.
            </p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={handleDeleteConvo}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Convo
            </Button>
            <Button variant="outline" onClick={handleChangeUser}>
                <Users className="mr-2 h-4 w-4" />
                New Chat
            </Button>
        </div>
      </div>
        <Card className="flex-grow flex flex-col">
            <CardHeader className="flex flex-row items-center gap-4">
                <Avatar>
                    <AvatarImage src={`https://placehold.co/100x100.png`} alt={counselor.name} data-ai-hint={counselor.hint} />
                    <AvatarFallback>{counselor.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle>{counselor.name}</CardTitle>
                    <CardDescription>Online</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="flex-grow space-y-4 overflow-y-auto p-6" id="chat-messages">
                {messages.length === 0 && (
                    <div className="flex h-full items-center justify-center">
                        <p className="text-muted-foreground">Send a message to start the conversation.</p>
                    </div>
                )}
                {messages.map((m) => (
                    <div key={m.id} className={`flex items-start gap-4 ${m.role === 'user' ? 'justify-end' : ''}`}>
                        {m.role !== 'user' && (
                           <Avatar>
                                <AvatarImage src={`https://placehold.co/100x100.png`} alt={counselor.name} data-ai-hint={counselor.hint} />
                                <AvatarFallback>{counselor.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                        )}
                        <div className={`${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'} rounded-lg p-3 max-w-xs`}>
                            <p className="text-sm">{m.content}</p>
                        </div>
                        {m.role === 'user' && (
                            <Avatar>
                                <AvatarFallback>U</AvatarFallback>
                            </Avatar>
                        )}
                    </div>
                ))}
                 <div ref={messagesEndRef} />
            </CardContent>
            <CardFooter className="pt-6">
                <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
                    <Input type="text" placeholder="Type your message..." className="flex-1" value={input} onChange={(e) => setInput(e.target.value)} />
                    <Button type="submit" size="icon">
                        <Send className="h-4 w-4" />
                        <span className="sr-only">Send</span>
                    </Button>
                </form>
            </CardFooter>
        </Card>
    </div>
  );
}
