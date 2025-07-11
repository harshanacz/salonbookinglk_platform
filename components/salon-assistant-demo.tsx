"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Send, Loader2, User, Bot } from "lucide-react";

interface Service {
  id: string;
  title: string;
  image: string;
  price: number;
  salon: string;
  rating: number;
  reviews: number;
  location?: string;
  type: string;
  duration?: number;
  description?: string;
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  suggestions?: Service[];
}

export function SalonAssistantDemo() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! I'm your salon booking assistant. What type of service are you looking for today?",
      isUser: false,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      text: userMessage,
      isUser: true,
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      const response = await fetch("/api/assistant/demo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();

      if (response.ok) {
        const botMsg: Message = {
          id: (Date.now() + 1).toString(),
          text: data.message,
          isUser: false,
          suggestions: data.suggestions,
        };
        setMessages(prev => [...prev, botMsg]);
      } else {
        throw new Error(data.error || "Failed to get response");
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I'm having trouble right now. Please try again or browse our services directly.",
        isUser: false,
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickMessage = (message: string) => {
    setInput(message);
    // Auto-send the message
    setTimeout(() => {
      if (message === input) {
        handleSendMessage();
      }
    }, 100);
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-purple-600 hover:bg-purple-700 shadow-lg animate-pulse"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
        <div className="absolute -top-12 right-0 bg-purple-600 text-white px-3 py-1 rounded-lg text-sm shadow-lg">
          Try the Assistant!
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-96 h-[500px] flex flex-col shadow-xl">
        <CardHeader className="bg-purple-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Salon Assistant (Demo)
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-purple-700"
            >
              ×
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div key={message.id}>
                <div
                  className={`flex ${
                    message.isUser ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.isUser
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {!message.isUser && <Bot className="h-4 w-4 mt-0.5" />}
                      {message.isUser && <User className="h-4 w-4 mt-0.5" />}
                      <span className="text-sm">{message.text}</span>
                    </div>
                  </div>
                </div>
                
                {/* Show quick action buttons for first message */}
                {index === 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {["I want a haircut", "Need a massage", "Facial treatment", "Hair coloring"].map((msg) => (
                      <Button
                        key={msg}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => handleQuickMessage(msg)}
                      >
                        {msg}
                      </Button>
                    ))}
                  </div>
                )}
                
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">
                      Here are some services you might like:
                    </h4>
                    <div className="grid gap-2">
                      {message.suggestions.slice(0, 3).map((service) => (
                        <div
                          key={service.id}
                          className="bg-white border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => window.open(`/service/${service.id}`, '_blank')}
                        >
                          <div className="flex gap-3">
                            <img
                              src={service.image}
                              alt={service.title}
                              className="w-16 h-16 object-cover rounded"
                            />
                            <div className="flex-1">
                              <h5 className="font-medium text-sm">{service.title}</h5>
                              <p className="text-xs text-gray-600">{service.salon}</p>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-purple-600 font-medium">
                                  ${service.price}
                                </span>
                                <div className="flex items-center gap-1">
                                  <span className="text-yellow-500">★</span>
                                  <span className="text-xs">{service.rating}</span>
                                </div>
                              </div>
                              {service.duration && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {service.duration} minutes
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-lg flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Finding services for you...</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about services..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}