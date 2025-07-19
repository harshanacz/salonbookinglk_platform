"use client";

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// Dynamically import the AI agent to avoid SSR issues
const SalonAIAgent = dynamic(() => import('./ai-agent'), {
  ssr: false,
  loading: () => null
});

interface FloatingAIAgentProps {
  salonId?: string;
  disabled?: boolean;
}

export default function FloatingAIAgent({ salonId, disabled = false }: FloatingAIAgentProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render on server or if disabled
  if (!mounted || disabled) {
    return null;
  }

  return (
    <SalonAIAgent 
      salonId={salonId} 
      floating={true}
      className="shadow-2xl border-0"
    />
  );
}
