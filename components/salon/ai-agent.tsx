"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, Bot, User, Sparkles, X, Minimize2, Maximize2 } from 'lucide-react';
import ServiceCard from './service-card';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  suggestions?: ServiceSuggestion[]; // Add suggestions to individual messages
}

interface ServiceSuggestion {
  id: string;
  title: string;
  price: number;
  duration: number;
  type: string;
  description?: string;
  rating?: number;
  image?: string;
  salonId?: string;
}

interface SalonAIAgentProps {
  salonId?: string;
  className?: string;
  floating?: boolean;
}

export default function SalonAIAgent({ salonId, className = "", floating = false }: SalonAIAgentProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isOpen, setIsOpen] = useState(!floating);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleServiceClick = (serviceId: string, serviceSalonId?: string) => {
    // Navigate to the service page
    router.push(`/service/${serviceId}`);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initial greeting message
    if (messages.length === 0) {
      setMessages([{
        id: '1',
        content: `🌟 Hello! I'm your salon booking assistant! 

I can help you with:
💇‍♀️ Service recommendations
💰 Pricing (in LKR)
📍 Finding nearby salons
💡 Care instructions
📅 Booking guidance

What can I help you find today?`,
        role: 'assistant',
        timestamp: new Date(),
        suggestions: [] // No suggestions for greeting
      }]);
    }
    
    // Try to get user location for nearby salon recommendations
    if (navigator.geolocation && !userLocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied:', error);
        },
        { timeout: 5000, enableHighAccuracy: false }
      );
    }
  }, [userLocation]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          salonId: salonId,
          userLocation: userLocation
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        role: 'assistant',
        timestamp: new Date(),
        suggestions: data.suggestions || [] // Attach suggestions to this specific message
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        role: 'assistant',
        timestamp: new Date(),
        suggestions: [] // No suggestions for error messages
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickActions = [
    "Suggest hair services",
    "Show facial treatments", 
    "Nail care prices",
    "Booking tips",
    "Hair care instructions",
    "Massage services"
  ];

  const handleQuickAction = (action: string) => {
    setInputMessage(action);
  };

  if (floating && !isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-2xl animate-bounce hover:animate-none transition-all duration-300 hover:scale-110 hover:shadow-3xl"
          style={{ animationDuration: '2s' }}
        >
          <Sparkles className="w-7 h-7 text-white" />
        </Button>
      </div>
    );
  }

  const chatContent = (
    <Card className={`w-full ${floating ? 'h-[650px] w-[400px]' : 'h-[700px]'} flex flex-col ${className} shadow-xl border-2`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-white" />
          Salon AI Assistant
        </CardTitle>
        {floating && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-white hover:bg-white/20"
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </CardHeader>

      {!isMinimized && (
        <CardContent className="flex-1 flex flex-col p-4 space-y-4 overflow-hidden">
          {/* Messages and Service Suggestions in ScrollArea */}
          <ScrollArea className="flex-1 pr-4 max-h-[400px]">
            <div className="space-y-4 pb-4">
              {messages.map((message) => (
                <div key={message.id}>
                  <div className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0 mt-1">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] p-3 rounded-lg whitespace-pre-wrap text-sm leading-relaxed ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-sm'
                          : 'bg-gray-100 text-gray-900 rounded-bl-sm border'
                      }`}
                    >
                      {message.content}
                    </div>
                    {message.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0 mt-1">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                    )}
                  </div>
                  
                  {/* Service Suggestions for this specific message */}
                  {message.role === 'assistant' && message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-3 ml-11"> {/* ml-11 to align with assistant message */}
                      <div className="bg-gray-50 p-3 rounded-lg border">
                        <p className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-3">
                          <span className="text-lg">💡</span>
                          <span>Suggested Services</span>
                        </p>
                        <div className="grid grid-cols-1 gap-3">
                          {message.suggestions.map((suggestion, index) => (
                            <div key={index} className="w-full">
                              <ServiceCard
                                title={suggestion.title}
                                price={suggestion.price}
                                duration={suggestion.duration}
                                type={suggestion.type}
                                description={suggestion.description}
                                rating={suggestion.rating || 4.5}
                                image={suggestion.image}
                                onClick={() => handleServiceClick(suggestion.id, suggestion.salonId)}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center mt-1">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-gray-100 p-3 rounded-lg border">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Quick Actions */}
          {messages.length <= 1 && (
            <div className="space-y-2 border-t pt-3">
              <p className="text-sm font-medium text-gray-600">🚀 Quick Actions:</p>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAction(action)}
                    className="text-xs h-8 justify-start hover:bg-purple-50 hover:border-purple-300"
                  >
                    {action}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />

          {/* Input */}
          <div className="flex gap-2 border-t pt-3">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about services, prices, or booking..."
              disabled={isLoading}
              className="flex-1 text-sm"
            />
            <Button
              onClick={sendMessage}
              disabled={isLoading || !inputMessage.trim()}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-3"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );

  if (floating) {
    return (
      <div className="fixed bottom-6 right-6 z-50 max-w-[400px]">
        {chatContent}
      </div>
    );
  }

  return chatContent;
}
