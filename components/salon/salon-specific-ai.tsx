"use client";

import { useEffect } from 'react';
import { useAIAgent } from './ai-agent-provider';
import SalonAIAgent from './ai-agent';

interface SalonSpecificAIProps {
  salonId: string;
  integrated?: boolean;
  className?: string;
}

export default function SalonSpecificAI({ 
  salonId, 
  integrated = false,
  className = ""
}: SalonSpecificAIProps) {
  const { setSalonId } = useAIAgent();

  useEffect(() => {
    // Set the salon context for the AI agent
    setSalonId(salonId);
    
    // Cleanup when component unmounts
    return () => {
      setSalonId(null);
    };
  }, [salonId, setSalonId]);

  // If integrated, render the chat component directly in the page
  if (integrated) {
    return (
      <div className={`w-full max-w-md ${className}`}>
        <SalonAIAgent 
          salonId={salonId}
          floating={false}
          className="h-[500px]"
        />
      </div>
    );
  }

  // Otherwise, just set the context for the floating agent
  return null;
}
