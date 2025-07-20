# Salon Booking AI Agent

A comprehensive AI-powered assistant for the Salon Booking platform that provides intelligent service recommendations, care instructions, location finding, and booking assistance.

## Features

### 🤖 Core AI Capabilities
- **Service Recommendations**: Personalized suggestions based on user preferences
- **Pricing Information**: Real-time pricing and duration details
- **Care Instructions**: Pre and post-service care guidelines
- **Location Finding**: Google Maps integrated salon finder
- **Booking Assistance**: Step-by-step booking guidance

### 🗺️ Location Services
- **Nearby Salon Search**: Find salons within specified radius
- **Google Maps Integration**: Uses NEXT_PUBLIC_GOOGLE_MAPS_API_KEY for geocoding
- **Distance Calculation**: Accurate distance measurements
- **Address Resolution**: Convert coordinates to readable addresses

### 💬 Conversational Interface
- **Natural Language Processing**: Understands user intents
- **Context Awareness**: Maintains conversation context
- **Quick Actions**: Pre-defined conversation starters
- **Service Suggestions**: Interactive service recommendations
- **Location Cards**: Nearby salon information cards

## Installation & Setup

### 1. Environment Variables
Ensure you have the Google Maps API key in your `.env` file:
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY='your_api_key_here'
```

### 2. Database Models
The AI agent uses existing models:
- `Service` - For service recommendations
- `SalonContext` - For location and salon information
- `User` - For salon owner data

### 3. API Routes
- `/api/ai-agent` - Main AI processing endpoint
- `/api/ai-agent/location` - Location-based services

## Usage

### Floating Widget (Global)
The AI agent automatically appears as a floating widget on public pages:

```tsx
// Already integrated in app/layout.tsx
<FloatingAIAgent />
```

### Integrated Component
For salon-specific pages or custom integrations:

```tsx
import SalonAIAgent from '@/components/salon/ai-agent';

// Basic usage
<SalonAIAgent />

// Salon-specific context
<SalonAIAgent salonId="salon_id_here" />

// Integrated in page (not floating)
<SalonAIAgent floating={false} className="h-[500px]" />
```

### Salon-Specific Integration
For individual salon pages:

```tsx
import SalonSpecificAI from '@/components/salon/salon-specific-ai';

// Sets salon context for floating widget
<SalonSpecificAI salonId="salon_id_here" />

// Or integrate directly in the page
<SalonSpecificAI 
  salonId="salon_id_here" 
  integrated={true}
  className="w-full max-w-md"
/>
```

## AI Response Examples

### Service Recommendations
**User**: "Suggest hair services"
**AI**: Recommends hair services with pricing, duration, and descriptions

### Care Instructions
**User**: "What should I do after hair coloring?"
**AI**: Provides detailed aftercare instructions and maintenance tips

### Location Services
**User**: "Find salons near me"
**AI**: Shows nearby salons with distances, ratings, and contact info

### Pricing Inquiries
**User**: "How much do facials cost?"
**AI**: Displays price ranges and specific service examples

## Architecture

### Frontend Components
```
components/salon/
├── ai-agent.tsx                 # Main chat interface
├── floating-ai-agent.tsx        # Floating widget wrapper
├── salon-specific-ai.tsx        # Salon context integration
└── ai-agent-provider.tsx        # Global state management
```

### Backend APIs
```
app/api/ai-agent/
├── route.ts                     # Main AI processing
└── location/
    └── route.ts                 # Location services
```

### Key Features
1. **Context Awareness**: Adapts responses based on salon context
2. **Service Integration**: Real-time data from your service database
3. **Location Intelligence**: Google Maps integration for location services
4. **Mobile Responsive**: Works on all device sizes
5. **Accessibility**: Keyboard navigation and screen reader support

## Customization

### Adding New Service Types
Update the `ServiceType` enum in `/models/Service.ts` and add descriptions in the AI agent.

### Modifying AI Responses
Edit the `generateAIResponse` function in `/app/api/ai-agent/route.ts` to customize responses.

### Styling
The component uses Tailwind CSS and can be customized through the `className` prop.

### Configuration
Use the `AIAgentProvider` to configure global settings:

```tsx
<AIAgentProvider 
  defaultEnabled={true}
  salonId="default_salon_id"
>
  {children}
</AIAgentProvider>
```

## Demo

Visit `/ai-agent-demo` to see the AI agent in action with example conversations and features.

## Technical Specifications

- **Framework**: Next.js 14 with App Router
- **Database**: MongoDB with Mongoose
- **Styling**: Tailwind CSS + Radix UI
- **Location**: Google Maps Geocoding API
- **State Management**: React Context
- **Type Safety**: TypeScript throughout

## Restrictions & Security

- **Site-Specific**: Only answers questions related to salon services
- **Data Privacy**: No personal data stored in conversations
- **Rate Limiting**: Consider implementing rate limiting for production
- **API Security**: Ensure proper validation of all inputs

## Future Enhancements

- **AI Integration**: Connect to OpenAI or similar for more advanced responses
- **Booking Integration**: Direct booking through the chat interface
- **Multilingual Support**: Support for multiple languages
- **Analytics**: Track common questions and user interactions
- **Push Notifications**: Appointment reminders and updates
