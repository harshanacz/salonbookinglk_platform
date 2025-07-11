import { NextRequest, NextResponse } from "next/server";

// Mock service data for demonstration
const mockServices = [
  {
    id: "1",
    title: "Classic Haircut & Styling",
    price: 45,
    duration: 60,
    salon: "Elite Hair Studio",
    image: "/placeholder.svg?height=200&width=300",
    type: "HAIRCUT",
    description: "Professional haircut with styling",
    rating: 4.8,
    reviews: 124,
  },
  {
    id: "2", 
    title: "Hair Color Treatment",
    price: 85,
    duration: 120,
    salon: "Color Me Beautiful",
    image: "/placeholder.svg?height=200&width=300",
    type: "COLORING",
    description: "Full hair coloring service",
    rating: 4.7,
    reviews: 89,
  },
  {
    id: "3",
    title: "Relaxing Facial Treatment",
    price: 65,
    duration: 90,
    salon: "Serenity Spa",
    image: "/placeholder.svg?height=200&width=300",
    type: "FACIAL",
    description: "Deep cleansing facial with moisturizing",
    rating: 4.9,
    reviews: 156,
  },
  {
    id: "4",
    title: "Therapeutic Massage",
    price: 75,
    duration: 75,
    salon: "Wellness Center",
    image: "/placeholder.svg?height=200&width=300",
    type: "MASSAGE",
    description: "Full body relaxation massage",
    rating: 4.8,
    reviews: 203,
  },
  {
    id: "5",
    title: "Manicure & Nail Art",
    price: 35,
    duration: 45,
    salon: "Nail Palace",
    image: "/placeholder.svg?height=200&width=300", 
    type: "NAILS",
    description: "Professional manicure with custom nail art",
    rating: 4.6,
    reviews: 78,
  },
  {
    id: "6",
    title: "Blowout & Styling",
    price: 40,
    duration: 45,
    salon: "Style Studio",
    image: "/placeholder.svg?height=200&width=300",
    type: "STYLING",
    description: "Professional blowout and hair styling",
    rating: 4.7,
    reviews: 92,
  }
];

// Simple keyword-based intent detection for demo
function detectServiceTypes(message: string): string[] {
  const lowerMessage = message.toLowerCase();
  const serviceTypes: string[] = [];
  
  if (lowerMessage.includes('haircut') || lowerMessage.includes('cut my hair') || lowerMessage.includes('trim')) {
    serviceTypes.push('HAIRCUT');
  }
  
  if (lowerMessage.includes('color') || lowerMessage.includes('dye') || lowerMessage.includes('highlight') || lowerMessage.includes('blonde') || lowerMessage.includes('brunette')) {
    serviceTypes.push('COLORING');
  }
  
  if (lowerMessage.includes('style') || lowerMessage.includes('blowout') || lowerMessage.includes('curl') || lowerMessage.includes('straighten')) {
    serviceTypes.push('STYLING');
  }
  
  if (lowerMessage.includes('facial') || lowerMessage.includes('face') || lowerMessage.includes('skincare') || lowerMessage.includes('skin care')) {
    serviceTypes.push('FACIAL');
  }
  
  if (lowerMessage.includes('massage') || lowerMessage.includes('relaxation') || lowerMessage.includes('therapeutic')) {
    serviceTypes.push('MASSAGE');
  }
  
  if (lowerMessage.includes('nail') || lowerMessage.includes('manicure') || lowerMessage.includes('pedicure')) {
    serviceTypes.push('NAILS');
  }
  
  // If no specific types detected, return all types for general queries
  if (serviceTypes.length === 0) {
    return ['HAIRCUT', 'FACIAL', 'MASSAGE'];
  }
  
  return serviceTypes;
}

function generateResponse(serviceTypes: string[], message: string): string {
  const responses = {
    'HAIRCUT': "Perfect! I found some great haircut options for you. Our stylists are experts at creating the perfect look that suits your face shape and lifestyle.",
    'COLORING': "Excellent choice! Hair coloring can completely transform your look. I've found some amazing color specialists who can help you achieve your dream hair color.",
    'STYLING': "Great! Professional styling can make such a difference. I've found some talented stylists who specialize in blowouts and styling.",
    'FACIAL': "Wonderful! A good facial treatment can rejuvenate your skin and help you relax. I've found some excellent facial specialists for you.",
    'MASSAGE': "Perfect choice for relaxation! I've found some highly-rated massage therapists who can help you unwind and relieve stress.",
    'NAILS': "Great! Professional nail care is so important. I've found some amazing nail artists who can create beautiful manicures and nail art."
  };
  
  if (serviceTypes.length === 1) {
    return responses[serviceTypes[0] as keyof typeof responses] || "I'd be happy to help you find the perfect salon service! Here are some great options for you.";
  } else if (serviceTypes.length > 1) {
    return `I found several types of services that might interest you! I've curated some excellent options across ${serviceTypes.join(', ').replace(/_/g, ' ').toLowerCase()} services.`;
  } else {
    return "I'd be happy to help you find the perfect salon service! Here are some popular options that our customers love.";
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Use simple keyword detection for demo
    const serviceTypes = detectServiceTypes(message);
    const responseMessage = generateResponse(serviceTypes, message);

    // Filter mock services by detected types
    const suggestions = mockServices.filter(service => 
      serviceTypes.includes(service.type)
    ).slice(0, 6);

    return NextResponse.json({
      message: responseMessage,
      suggestions,
      serviceTypes
    });

  } catch (error) {
    console.error("Assistant chat error:", error);
    return NextResponse.json(
      { 
        error: "I'm having trouble processing your request right now. Please try again later.",
        message: "I'm here to help you find the perfect salon service! What type of treatment are you looking for today?"
      },
      { status: 500 }
    );
  }
}