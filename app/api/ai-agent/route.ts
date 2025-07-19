import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Service, { ServiceType } from "@/models/Service";
import SalonContext from "@/models/SalonContext";
import User from "@/models/User";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// Service type mapping for better responses
const serviceTypeDescriptions = {
  [ServiceType.HAIRCUT]: "Professional haircuts and hair trimming services",
  [ServiceType.COLORING]: "Hair coloring, highlights, and color treatments", 
  [ServiceType.STYLING]: "Hair styling, updos, and special occasion styling",
  [ServiceType.FACIAL]: "Facial treatments, cleansing, and skincare services",
  [ServiceType.MASSAGE]: "Relaxing massage and wellness treatments",
  [ServiceType.NAILS]: "Manicure, pedicure, and nail art services",
  [ServiceType.SKIN_CARE]: "Advanced skincare treatments and consultations",
  [ServiceType.OTHER]: "Specialized beauty and wellness services"
};

// General salon knowledge base
const salonKnowledge = {
  hairCare: {
    beforeService: "Wash your hair with a gentle shampoo 24 hours before your appointment. Avoid using heavy styling products on the day of your visit.",
    afterService: "Wait 48-72 hours before washing colored hair. Use sulfate-free shampoo and cold water to maintain color vibrancy.",
    maintenance: "Regular trims every 6-8 weeks help maintain healthy hair. Deep conditioning treatments once a week are recommended."
  },
  skinCare: {
    beforeService: "Avoid exfoliating or using retinoids 24-48 hours before facial treatments. Come with clean skin, no makeup.",
    afterService: "Avoid direct sunlight and use SPF 30+ for at least 48 hours. Keep skin hydrated with gentle moisturizers.",
    maintenance: "Monthly facials help maintain healthy skin. Daily cleansing and moisturizing are essential."
  },
  nailCare: {
    beforeService: "Remove old polish completely. Push back cuticles gently and ensure hands/feet are clean.",
    afterService: "Avoid water contact for 2 hours after service. Use cuticle oil daily to maintain nail health.",
    maintenance: "Manicures every 2-3 weeks, pedicures every 4-6 weeks. Keep nails moisturized and protected."
  },
  booking: {
    tips: "Book appointments in advance, especially for weekends. Arrive 10 minutes early. Communicate your preferences clearly with your stylist.",
    cancellation: "Cancel at least 24 hours in advance to avoid cancellation fees. Reschedule if you're feeling unwell.",
    preparation: "Bring reference photos for desired styles. Inform your stylist about any allergies or sensitivities."
  }
};

// Helper function to get emoji for service types
function getServiceEmoji(serviceType: string): string {
  const emojiMap: { [key: string]: string } = {
    [ServiceType.HAIRCUT]: "💇‍♀️",
    [ServiceType.COLORING]: "🎨",
    [ServiceType.STYLING]: "💫",
    [ServiceType.FACIAL]: "✨",
    [ServiceType.MASSAGE]: "💆‍♀️",
    [ServiceType.NAILS]: "💅",
    [ServiceType.SKIN_CARE]: "🧴",
    [ServiceType.OTHER]: "🌟"
  };
  return emojiMap[serviceType] || "🌟";
}

function generateAIResponse(userMessage: string, availableServices: any[]): string {
  const message = userMessage.toLowerCase();
  
  // Format LKR price for display
  const formatLKR = (lkrPrice: number) => lkrPrice.toLocaleString();
  
  // Enhanced service filtering with gender considerations
  const filterServicesByGenderAndType = (services: any[], serviceTypes: string[], message: string) => {
    let filtered = services.filter(s => serviceTypes.includes(s.type));
    
    // Note: Since we don't have gender-specific service data, we return all services
    // but could add gender-specific filtering logic here if the data structure supports it
    if (message.includes("male") || message.includes("men") || message.includes("man")) {
      // Could filter for male-specific services if data structure supports it
      // For now, return all services as most salon services are unisex
    }
    
    if (message.includes("female") || message.includes("women") || message.includes("woman")) {
      // Could filter for female-specific services if data structure supports it
    }
    
    return filtered;
  };
  
  // Service recommendation based on user input
  if (message.includes("suggest") || message.includes("recommend") || message.includes("what service")) {
    if (message.includes("hair")) {
      const hairServices = filterServicesByGenderAndType(availableServices, 
        [ServiceType.HAIRCUT, ServiceType.COLORING, ServiceType.STYLING], message);
      
      if (hairServices.length > 0) {
        const suggestions = hairServices.slice(0, 4).map((s: any) => 
          `💇‍♀️ ${s.title}\n   💰 LKR ${formatLKR(s.price)}\n   ⏱️ ${s.duration} minutes\n   📝 ${s.description || serviceTypeDescriptions[s.type as ServiceType]}\n   ⭐ Rating: ${s.averageRating || 'New'}/5`
        ).join('\n\n');
        
        const genderNote = (message.includes("male") || message.includes("men")) ? " for men" : 
                          (message.includes("female") || message.includes("women")) ? " for women" : "";
        
        return `🌟 Our recommended hair services${genderNote}:\n\n${suggestions}\n\n💡 Tip: ${salonKnowledge.hairCare.beforeService}`;
      }
    }
    
    if (message.includes("facial") || message.includes("skin")) {
      const skinServices = filterServicesByGenderAndType(availableServices,
        [ServiceType.FACIAL, ServiceType.SKIN_CARE], message);
      
      if (skinServices.length > 0) {
        const suggestions = skinServices.slice(0, 4).map((s: any) => 
          `✨ ${s.title}\n   💰 LKR ${formatLKR(s.price)}\n   ⏱️ ${s.duration} minutes\n   📝 ${s.description || serviceTypeDescriptions[s.type as ServiceType]}\n   ⭐ Rating: ${s.averageRating || 'New'}/5`
        ).join('\n\n');
        return `🧴 Our skincare services:\n\n${suggestions}\n\n💡 Tip: ${salonKnowledge.skinCare.beforeService}`;
      }
    }
    
    if (message.includes("nail") || message.includes("manicure") || message.includes("pedicure")) {
      const nailServices = availableServices.filter(s => s.type === ServiceType.NAILS);
      if (nailServices.length > 0) {
        const suggestions = nailServices.slice(0, 4).map((s: any) => 
          `💅 ${s.title}\n   💰 LKR ${formatLKR(s.price)}\n   ⏱️ ${s.duration} minutes\n   📝 ${s.description || serviceTypeDescriptions[s.type as ServiceType]}\n   ⭐ Rating: ${s.averageRating || 'New'}/5`
        ).join('\n\n');
        return `💖 Our nail services:\n\n${suggestions}\n\n💡 Tip: ${salonKnowledge.nailCare.beforeService}`;
      }
    }
    
    // General service recommendations
    if (availableServices.length > 0) {
      const topServices = availableServices
        .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
        .slice(0, 4)
        .map((s: any) => `${getServiceEmoji(s.type)} ${s.title} - LKR ${formatLKR(s.price)} (${s.duration} min)`)
        .join('\n');
      return `🌟 Our popular services:\n\n${topServices}\n\n💬 Need details about any service?`;
    }
  }
  
  // Care instructions
  if (message.includes("after care") || message.includes("maintenance") || message.includes("care tips")) {
    if (message.includes("hair")) {
      return `💇‍♀️ Hair Care:\n\n🔸 After: ${salonKnowledge.hairCare.afterService}\n\n🔸 Maintenance: ${salonKnowledge.hairCare.maintenance}`;
    }
    if (message.includes("facial") || message.includes("skin")) {
      return `✨ Skincare:\n\n🔸 After: ${salonKnowledge.skinCare.afterService}\n\n🔸 Maintenance: ${salonKnowledge.skinCare.maintenance}`;
    }
    if (message.includes("nail")) {
      return `💅 Nail Care:\n\n🔸 After: ${salonKnowledge.nailCare.afterService}\n\n🔸 Maintenance: ${salonKnowledge.nailCare.maintenance}`;
    }
  }
  
  // Booking help
  if (message.includes("book") || message.includes("appointment") || message.includes("schedule")) {
    return `📅 Booking Tips:\n\n🔸 ${salonKnowledge.booking.tips}\n\n🔸 ${salonKnowledge.booking.preparation}\n\n💡 Browse services to book your appointment!`;
  }
  
  // Price inquiries
  if (message.includes("price") || message.includes("cost") || message.includes("how much") || message.includes("cheap") || message.includes("lowest") || message.includes("budget") || message.includes("affordable")) {
    
    // Handle specific service type + price queries
    if (message.includes("hair") || message.includes("haircut")) {
      const hairServices = availableServices.filter(s => 
        [ServiceType.HAIRCUT, ServiceType.COLORING, ServiceType.STYLING].includes(s.type)
      );
      
      if (message.includes("lowest") || message.includes("cheap") || message.includes("budget") || message.includes("affordable")) {
        const cheapestHair = hairServices.sort((a, b) => a.price - b.price).slice(0, 4);
        if (cheapestHair.length > 0) {
          return `💰 Most affordable hair services:\n\n${cheapestHair.map((s: any) => `${getServiceEmoji(s.type)} ${s.title}: LKR ${formatLKR(s.price)} (${s.duration} min)`).join('\n')}\n\n💡 Great value options!`;
        }
      }
      
      if (hairServices.length > 0) {
        const priceRange = {
          min: Math.min(...hairServices.map(s => s.price)),
          max: Math.max(...hairServices.map(s => s.price))
        };
        return `💰 Hair service prices: LKR ${formatLKR(priceRange.min)} - LKR ${formatLKR(priceRange.max)}\n\n${hairServices.slice(0, 5).map((s: any) => `${getServiceEmoji(s.type)} ${s.title}: LKR ${formatLKR(s.price)}`).join('\n')}`;
      }
    }
    
    if (message.includes("facial") || message.includes("skin")) {
      const skinServices = availableServices.filter(s => 
        [ServiceType.FACIAL, ServiceType.SKIN_CARE].includes(s.type)
      );
      
      if (message.includes("lowest") || message.includes("cheap") || message.includes("budget") || message.includes("affordable")) {
        const cheapestSkin = skinServices.sort((a, b) => a.price - b.price).slice(0, 4);
        if (cheapestSkin.length > 0) {
          return `💰 Most affordable facial services:\n\n${cheapestSkin.map((s: any) => `${getServiceEmoji(s.type)} ${s.title}: LKR ${formatLKR(s.price)} (${s.duration} min)`).join('\n')}\n\n💡 Great value skincare!`;
        }
      }
      
      if (skinServices.length > 0) {
        const priceRange = {
          min: Math.min(...skinServices.map(s => s.price)),
          max: Math.max(...skinServices.map(s => s.price))
        };
        return `💰 Facial service prices: LKR ${formatLKR(priceRange.min)} - LKR ${formatLKR(priceRange.max)}\n\n${skinServices.slice(0, 5).map((s: any) => `${getServiceEmoji(s.type)} ${s.title}: LKR ${formatLKR(s.price)}`).join('\n')}`;
      }
    }
    
    if (message.includes("nail") || message.includes("manicure") || message.includes("pedicure")) {
      const nailServices = availableServices.filter(s => s.type === ServiceType.NAILS);
      
      if (message.includes("lowest") || message.includes("cheap") || message.includes("budget") || message.includes("affordable")) {
        const cheapestNail = nailServices.sort((a, b) => a.price - b.price).slice(0, 4);
        if (cheapestNail.length > 0) {
          return `💰 Most affordable nail services:\n\n${cheapestNail.map((s: any) => `${getServiceEmoji(s.type)} ${s.title}: LKR ${formatLKR(s.price)} (${s.duration} min)`).join('\n')}\n\n💡 Budget-friendly nail care!`;
        }
      }
      
      if (nailServices.length > 0) {
        const priceRange = {
          min: Math.min(...nailServices.map(s => s.price)),
          max: Math.max(...nailServices.map(s => s.price))
        };
        return `💰 Nail service prices: LKR ${formatLKR(priceRange.min)} - LKR ${formatLKR(priceRange.max)}\n\n${nailServices.slice(0, 5).map((s: any) => `${getServiceEmoji(s.type)} ${s.title}: LKR ${formatLKR(s.price)}`).join('\n')}`;
      }
    }
    
    // General price queries
    if (availableServices.length > 0) {
      if (message.includes("lowest") || message.includes("cheap") || message.includes("budget") || message.includes("affordable")) {
        const cheapestServices = availableServices.sort((a, b) => a.price - b.price).slice(0, 5);
        return `💰 Most affordable services:\n\n${cheapestServices.map((s: any) => `${getServiceEmoji(s.type)} ${s.title}: LKR ${formatLKR(s.price)} (${s.duration} min)`).join('\n')}\n\n💡 Best value options!`;
      }
      
      const priceRange = {
        min: Math.min(...availableServices.map((s: any) => s.price)),
        max: Math.max(...availableServices.map((s: any) => s.price))
      };
      return `💰 Prices range from LKR ${formatLKR(priceRange.min)} to LKR ${formatLKR(priceRange.max)}:\n\n${availableServices.slice(0, 5).map((s: any) => `${getServiceEmoji(s.type)} ${s.title}: LKR ${formatLKR(s.price)}`).join('\n')}\n\n📝 Prices may vary by complexity.`;
    }
  }
  
  // Duration inquiries
  if (message.includes("how long") || message.includes("duration") || message.includes("time")) {
    if (availableServices.length > 0) {
      return `⏰ Service durations:\n\n${availableServices.slice(0, 5).map((s: any) => `${getServiceEmoji(s.type)} ${s.title}: ${s.duration} min`).join('\n')}\n\n💡 Arrive 10 minutes early.`;
    }
  }
  
  // Location and nearby suggestions - Removed to focus only on services
  if (message.includes("location") || message.includes("address") || message.includes("directions") || message.includes("near me") || message.includes("nearby")) {
    return `📍 Use our salon directory or map feature for locations. \n\n🌟 I can help with service recommendations and care tips. What interests you?`;
  }
  
  // General help
  if (message.includes("help") || message.includes("what can you")) {
    return `🤖 I can help with:

🎯 Service recommendations
💰 Pricing (LKR)  
⏰ Duration & planning
💡 Care instructions
 Booking tips

What do you need?`;
  }
  
  // Default response
  return `🌟 I can help you with service recommendations, pricing, care tips, and booking guidance. What would you like to know?`;
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const body = await req.json();
    const { message, salonId, userLocation } = body;
    
    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }
    
    // Get available services (either from specific salon or all active services)
    let availableServices = [];
    
    if (salonId) {
      // Get services for specific salon
      const services = await Service.find({
        salonContextId: salonId,
        status: "ACTIVE"
      }).select('_id title type price duration description averageRating images').lean();
      
      availableServices = services;
    } else {
      // Get all active services for general recommendations
      const services = await Service.find({
        status: "ACTIVE"
      }).select('_id title type price duration description averageRating salonContextId images').limit(20).lean();
      
      availableServices = services;
    }
    
    // Generate AI response focused on services only
    const aiResponse = generateAIResponse(message, availableServices);
    
    // Enhanced filtering logic based on user's specific request
    let filteredSuggestions: any[] = [];
    const lowerMessage = message.toLowerCase();
    
    // More specific haircut service filtering
    if (lowerMessage.includes("hair cut") || lowerMessage.includes("haircut") || lowerMessage.includes("hair cutting")) {
      // Only show haircut services, not coloring or styling
      filteredSuggestions = availableServices.filter(s => s.type === ServiceType.HAIRCUT);
      
      // Sort by price if looking for budget options
      if (lowerMessage.includes("lowest") || lowerMessage.includes("cheap") || lowerMessage.includes("budget") || lowerMessage.includes("affordable")) {
        filteredSuggestions = filteredSuggestions.sort((a, b) => a.price - b.price);
      }
      
      filteredSuggestions = filteredSuggestions.slice(0, 4);
    }
    // Hair coloring specific
    else if (lowerMessage.includes("hair color") || lowerMessage.includes("coloring") || lowerMessage.includes("highlights")) {
      filteredSuggestions = availableServices.filter(s => s.type === ServiceType.COLORING);
      
      if (lowerMessage.includes("lowest") || lowerMessage.includes("cheap") || lowerMessage.includes("budget") || lowerMessage.includes("affordable")) {
        filteredSuggestions = filteredSuggestions.sort((a, b) => a.price - b.price);
      }
      
      filteredSuggestions = filteredSuggestions.slice(0, 4);
    }
    // Hair styling specific
    else if (lowerMessage.includes("hair styling") || lowerMessage.includes("styling") || lowerMessage.includes("updo")) {
      filteredSuggestions = availableServices.filter(s => s.type === ServiceType.STYLING);
      
      if (lowerMessage.includes("lowest") || lowerMessage.includes("cheap") || lowerMessage.includes("budget") || lowerMessage.includes("affordable")) {
        filteredSuggestions = filteredSuggestions.sort((a, b) => a.price - b.price);
      }
      
      filteredSuggestions = filteredSuggestions.slice(0, 4);
    }
    // General hair services (when just "hair" is mentioned)
    else if (lowerMessage.includes("hair")) {
      filteredSuggestions = availableServices.filter(s => 
        [ServiceType.HAIRCUT, ServiceType.COLORING, ServiceType.STYLING].includes(s.type)
      );
      
      if (lowerMessage.includes("lowest") || lowerMessage.includes("cheap") || lowerMessage.includes("budget") || lowerMessage.includes("affordable")) {
        filteredSuggestions = filteredSuggestions.sort((a, b) => a.price - b.price);
      }
      
      filteredSuggestions = filteredSuggestions.slice(0, 4);
    }
    // Facial services (including care instructions)
    else if (lowerMessage.includes("facial") || (lowerMessage.includes("before") && lowerMessage.includes("facial")) || (lowerMessage.includes("after") && lowerMessage.includes("facial"))) {
      filteredSuggestions = availableServices.filter(s => s.type === ServiceType.FACIAL);
      
      if (lowerMessage.includes("lowest") || lowerMessage.includes("cheap") || lowerMessage.includes("budget") || lowerMessage.includes("affordable")) {
        filteredSuggestions = filteredSuggestions.sort((a, b) => a.price - b.price);
      }
      
      filteredSuggestions = filteredSuggestions.slice(0, 4);
    }
    // Skin care services
    else if (lowerMessage.includes("skin care") || lowerMessage.includes("skincare") || lowerMessage.includes("skin")) {
      filteredSuggestions = availableServices.filter(s => s.type === ServiceType.SKIN_CARE);
      
      if (lowerMessage.includes("lowest") || lowerMessage.includes("cheap") || lowerMessage.includes("budget") || lowerMessage.includes("affordable")) {
        filteredSuggestions = filteredSuggestions.sort((a, b) => a.price - b.price);
      }
      
      filteredSuggestions = filteredSuggestions.slice(0, 4);
    }
    // Nail services
    else if (lowerMessage.includes("nail") || lowerMessage.includes("manicure") || lowerMessage.includes("pedicure")) {
      filteredSuggestions = availableServices.filter(s => s.type === ServiceType.NAILS);
      
      if (lowerMessage.includes("lowest") || lowerMessage.includes("cheap") || lowerMessage.includes("budget") || lowerMessage.includes("affordable")) {
        filteredSuggestions = filteredSuggestions.sort((a, b) => a.price - b.price);
      }
      
      filteredSuggestions = filteredSuggestions.slice(0, 4);
    }
    // Massage services
    else if (lowerMessage.includes("massage")) {
      filteredSuggestions = availableServices.filter(s => s.type === ServiceType.MASSAGE);
      
      if (lowerMessage.includes("lowest") || lowerMessage.includes("cheap") || lowerMessage.includes("budget") || lowerMessage.includes("affordable")) {
        filteredSuggestions = filteredSuggestions.sort((a, b) => a.price - b.price);
      }
      
      filteredSuggestions = filteredSuggestions.slice(0, 4);
    }
    // Price-focused queries
    else if (lowerMessage.includes("lowest") || lowerMessage.includes("cheap") || lowerMessage.includes("budget") || lowerMessage.includes("affordable")) {
      filteredSuggestions = availableServices
        .sort((a, b) => a.price - b.price)
        .slice(0, 4);
    }
    // General price queries
    else if (lowerMessage.includes("price") || lowerMessage.includes("cost") || lowerMessage.includes("how much")) {
      // Show diverse price range examples
      filteredSuggestions = availableServices
        .sort((a, b) => a.price - b.price)
        .filter((_, index, arr) => index === 0 || index === Math.floor(arr.length / 3) || index === Math.floor(arr.length * 2 / 3) || index === arr.length - 1)
        .slice(0, 4);
    }
    // General recommendations
    else if (lowerMessage.includes("suggest") || lowerMessage.includes("recommend") || lowerMessage.includes("what service") || lowerMessage.includes("show me") || lowerMessage.includes("popular")) {
      // For general requests, show top-rated services from different categories
      filteredSuggestions = availableServices
        .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
        .slice(0, 4);
    }
    
    return NextResponse.json({
      response: aiResponse,
      suggestions: filteredSuggestions.map((s: any) => ({
        id: s._id,
        title: s.title,
        price: s.price,
        duration: s.duration,
        type: s.type,
        description: s.description,
        rating: s.averageRating,
        image: s.images?.[0],
        salonId: s.salonContextId
      }))
      // Removed nearbyLocations to focus only on services
    });
    
  } catch (error) {
    console.error("AI Agent error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    // Get service statistics for AI context
    const serviceStats = await Service.aggregate([
      { $match: { status: "ACTIVE" } },
      { $group: {
          _id: "$type",
          count: { $sum: 1 },
          avgPrice: { $avg: "$price" },
          avgDuration: { $avg: "$duration" }
        }
      }
    ]);
    
    const totalSalons = await SalonContext.countDocuments({ isVerified: true });
    
    return NextResponse.json({
      serviceTypes: serviceStats,
      totalSalons,
      capabilities: [
        "Service recommendations",
        "Pricing information", 
        "Care instructions",
        "Booking assistance",
        "Location finding"
      ]
    });
    
  } catch (error) {
    console.error("AI Agent GET error:", error);
    return NextResponse.json(
      { error: "Failed to get AI capabilities" },
      { status: 500 }
    );
  }
}
