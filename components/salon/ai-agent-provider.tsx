"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AIAgentContextType {
  isEnabled: boolean;
  currentSalonId: string | null;
  toggleAgent: () => void;
  setSalonId: (id: string | null) => void;
  disable: () => void;
  enable: () => void;
}

const AIAgentContext = createContext<AIAgentContextType | undefined>(undefined);

export function useAIAgent() {
  const context = useContext(AIAgentContext);
  if (context === undefined) {
    throw new Error('useAIAgent must be used within an AIAgentProvider');
  }
  return context;
}

interface AIAgentProviderProps {
  children: React.ReactNode;
  defaultEnabled?: boolean;
  salonId?: string;
}

export function AIAgentProvider({ 
  children, 
  defaultEnabled = true,
  salonId 
}: AIAgentProviderProps) {
  const [isEnabled, setIsEnabled] = useState(defaultEnabled);
  const [currentSalonId, setCurrentSalonId] = useState<string | null>(salonId || null);

  useEffect(() => {
    if (salonId) {
      setCurrentSalonId(salonId);
    }
  }, [salonId]);

  const toggleAgent = () => {
    setIsEnabled(prev => !prev);
  };

  const setSalonId = (id: string | null) => {
    setCurrentSalonId(id);
  };

  const disable = () => {
    setIsEnabled(false);
  };

  const enable = () => {
    setIsEnabled(true);
  };

  const value = {
    isEnabled,
    currentSalonId,
    toggleAgent,
    setSalonId,
    disable,
    enable
  };

  return (
    <AIAgentContext.Provider value={value}>
      {children}
    </AIAgentContext.Provider>
  );
}
