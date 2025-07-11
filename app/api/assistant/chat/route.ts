import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dbConnect from "@/lib/mongodb";
import Service, { ServiceStatus, ServiceType } from "@/models/Service";
import User from "@/models/User";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Initialize the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Create a prompt to analyze user intent and extract service types
    const prompt = `
    You are a helpful salon booking assistant. Analyze the user's message and determine what type of salon services they're interested in.

    Available service types:
    - HAIRCUT (hair cutting, trimming, styling cuts)
    - COLORING (hair coloring, highlights, dyeing, color treatments)
    - STYLING (hair styling, blowouts, curls, straightening, updos)
    - FACIAL (facials, face treatments, skincare)
    - MASSAGE (massage therapy, relaxation treatments)
    - NAILS (manicure, pedicure, nail art, nail treatments)
    - SKIN_CARE (skin treatments, anti-aging, acne treatments)
    - OTHER (any other salon services)

    User message: "${message}"

    Respond in JSON format with:
    {
      "serviceTypes": ["array of matching service types from above list"],
      "response": "A friendly, helpful response suggesting the services and asking if they'd like to see specific options. Do not mention AI, Gemini, or any technical details."
    }

    Only return valid JSON. Be conversational and helpful in your response.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    let aiResponse;
    try {
      aiResponse = JSON.parse(responseText);
    } catch (parseError) {
      // Fallback if JSON parsing fails
      aiResponse = {
        serviceTypes: ["OTHER"],
        response: "I'd be happy to help you find the perfect salon service! Could you tell me more about what you're looking for?"
      };
    }

    // Connect to database and fetch matching services
    await dbConnect();

    const serviceTypes = aiResponse.serviceTypes || ["OTHER"];
    const services = await Service.find({
      status: ServiceStatus.ACTIVE,
      type: { $in: serviceTypes }
    })
    .populate({
      path: "userId",
      select: "userName businessName",
      model: User
    })
    .limit(6)
    .lean();

    // Transform services for response
    const suggestions = services.map(service => {
      const userId = service.userId as any;
      const businessName = 
        userId && typeof userId === "object" && userId.businessName 
          ? userId.businessName 
          : "Unknown Salon";
      
      return {
        id: service._id.toString(),
        title: service.title,
        price: service.price,
        duration: service.duration,
        salon: businessName,
        image: service.images && service.images.length > 0 ? service.images[0] : "/placeholder.svg?height=200&width=300",
        type: service.type,
        description: service.description,
        rating: service.averageRating || 4.5,
        reviews: service.reviewCount || 0,
      };
    });

    return NextResponse.json({
      message: aiResponse.response,
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