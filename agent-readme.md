# AI Agent Technical Documentation

## Overview
The AI Agent is an intelligent chat assistant designed for the SalonBooking.lk platform. It provides context## Key Features

### 1. **Access Control**
- **Customer Access**: Available to logged-in customers (UserType.CUSTOMER)
- **Guest Access**: Available to non-logged-in users
- **Restricted Access**: Hidden from salon owners (UserType.SALON_OWNER), admins (UserType.ADMIN), and super admins (UserType.SUPER_ADMIN)
- **Authentication Check**: Uses Clerk authentication to verify user type and permissions

### 2. **Intelligent Query Understanding** service recommendations, pricing information, care instructions, and booking guidance to users through a conversational interface.

## Architecture

### Frontend Components

#### 1. AI Agent Component (`/components/salon/ai-agent.tsx`)
- **Purpose**: Main chat interface with floating widget functionality
- **Key Features**:
  - Floating chat button with Sparkles icon and slow bounce animation
  - Real-time messaging interface with user/assistant message bubbles
  - Service suggestion cards integrated within chat flow
  - Minimize/maximize functionality for floating mode
  - Navigation integration for service detail pages
  - **Access Control**: Restricts access based on user type

**Key Code Segments**:
```typescript
// Access control check
const { user, isLoaded } = useUser();
const [userType, setUserType] = useState<string | null>(null);

useEffect(() => {
  const checkUserAccess = async () => {
    if (!isLoaded) return;
    
    if (!user) {
      // Not logged in - allow access
      setUserType(null);
      return;
    }

    // Check user type from API
    const response = await fetch('/api/user');
    if (response.ok) {
      const userData = await response.json();
      setUserType(userData.type);
    }
  };
  
  checkUserAccess();
}, [user, isLoaded]);

// Block access for restricted user types
if (userType === 'SALON_OWNER' || userType === 'ADMIN' || userType === 'SUPER_ADMIN') {
  return null; // Hide the AI agent completely
}

// Floating button with enhanced animation
<Button
  className="rounded-full w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 animate-bounce"
  style={{ animationDuration: '2s' }}
>
  <Sparkles className="w-7 h-7 text-white" />
</Button>

// Service navigation handler
const handleServiceClick = (service: ServiceSuggestion) => {
  router.push(`/service/${service.id}?salon=${service.salonId}`);
};
```

#### 2. Service Card Component (`/components/salon/service-card.tsx`)
- **Purpose**: Reusable service display component with navigation capabilities
- **Features**:
  - Hover effects with scale animations
  - Click navigation to service detail pages
  - Visual feedback with ExternalLink icon
  - Price formatting and rating display

### Backend API

#### 3. AI Agent Route (`/app/api/ai-agent/route.ts`)
- **Purpose**: Main AI processing endpoint with enhanced query understanding
- **Database Integration**: MongoDB with Mongoose for Service, SalonContext models
- **Key Features**:
  - Natural language processing for service queries
  - Context-aware service filtering
  - Price-based sorting and recommendations
  - Gender and category-specific responses

### Core AI Logic

#### Service Type Mapping
```typescript
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
```

#### Knowledge Base
The AI agent includes comprehensive salon knowledge covering:
- **Hair Care**: Before/after service instructions, maintenance tips
- **Skin Care**: Facial preparation, aftercare, and maintenance schedules
- **Nail Care**: Preparation steps, aftercare instructions
- **Booking**: Tips, cancellation policies, preparation guidelines

#### Query Processing Algorithm

##### 1. Specific Service Filtering
```typescript
// Haircut-specific queries
if (lowerMessage.includes("hair cut") || lowerMessage.includes("haircut")) {
  filteredSuggestions = availableServices.filter(s => s.type === ServiceType.HAIRCUT);
}

// Facial care instructions
else if (lowerMessage.includes("facial") || 
         (lowerMessage.includes("before") && lowerMessage.includes("facial"))) {
  filteredSuggestions = availableServices.filter(s => s.type === ServiceType.FACIAL);
}
```

##### 2. Price-Based Sorting
```typescript
// Budget-conscious queries
if (lowerMessage.includes("lowest") || lowerMessage.includes("cheap") || 
    lowerMessage.includes("budget") || lowerMessage.includes("affordable")) {
  filteredSuggestions = filteredSuggestions.sort((a, b) => a.price - b.price);
}
```

##### 3. Response Generation
The AI generates contextual responses using:
- Service-specific emojis for visual appeal
- LKR price formatting for local currency
- Care instructions and tips
- Personalized recommendations based on query intent

## Data Flow

### 1. User Interaction
```
User types message → AI Agent Component → POST /api/ai-agent
```

### 2. Query Processing
```
API Route → Database Query → Service Filtering → AI Response Generation
```

### 3. Response Display
```
API Response → Service Suggestions → Chat Interface → Service Navigation
```

## Database Integration

### Service Model Selection
```typescript
// For specific salon
const services = await Service.find({
  salonContextId: salonId,
  status: "ACTIVE"
}).select('_id title type price duration description averageRating images').lean();

// For general recommendations
const services = await Service.find({
  status: "ACTIVE"
}).select('_id title type price duration description averageRating salonContextId images').limit(20).lean();
```

### Response Structure
```typescript
return NextResponse.json({
  response: aiResponse,           // Generated text response
  suggestions: filteredSuggestions.map(s => ({
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
});
```

## Key Features

### 1. Intelligent Query Understanding
- **Specific Service Recognition**: Distinguishes between haircut, coloring, and styling
- **Price Sensitivity**: Recognizes budget-focused queries
- **Care Instructions**: Provides contextual before/after care tips
- **Gender Awareness**: Handles male/female specific queries

### 2. Contextual Service Suggestions
- **Query-Specific Filtering**: Shows only relevant services
- **Price-Based Sorting**: Prioritizes affordable options when requested
- **Rating-Based Recommendations**: Suggests top-rated services for general queries

### 3. Enhanced User Experience
- **Visual Feedback**: Hover effects and animations
- **Seamless Navigation**: Direct links to service detail pages
- **Responsive Design**: Works on desktop and mobile
- **Real-Time Interaction**: Instant responses and suggestions

### 4. Service Categories Handled
- **Hair Services**: Haircuts, coloring, styling
- **Facial Services**: Facial treatments, skincare
- **Nail Services**: Manicures, pedicures, nail art
- **Massage Services**: Wellness and relaxation treatments

## Example Query Handling

### Query: "lowest pricing hair cutting service?"
1. **Detection**: Recognizes "haircut" + "lowest pricing"
2. **Filtering**: `services.filter(s => s.type === ServiceType.HAIRCUT)`
3. **Sorting**: `sort((a, b) => a.price - b.price)`
4. **Response**: Shows only haircut services sorted by price
5. **Suggestions**: Displays up to 4 relevant haircut service cards

### Query: "general instruction before facial"
1. **Detection**: Recognizes "before" + "facial"
2. **Filtering**: `services.filter(s => s.type === ServiceType.FACIAL)`
3. **Response**: Provides facial care instructions
4. **Suggestions**: Shows facial service options

## Performance Optimizations

### 1. Database Queries
- Selective field projection to reduce data transfer
- Limited result sets (20 services max for general queries)
- Lean queries for better performance

### 2. Frontend Optimizations
- Lazy loading of service cards
- Efficient state management with React hooks
- Debounced user input handling

### 3. Caching Strategy
- Service data caching at API level
- Client-side message history management

## Error Handling

### API Level
```typescript
try {
  await dbConnect();
  // Processing logic
} catch (error) {
  console.error("AI Agent error:", error);
  return NextResponse.json(
    { error: "Failed to process request" },
    { status: 500 }
  );
}
```

### Frontend Level
```typescript
const errorMessage: Message = {
  id: (Date.now() + 1).toString(),
  content: 'Sorry, I encountered an error. Please try again.',
  role: 'assistant',
  timestamp: new Date(),
  suggestions: []
};
```

## Future Enhancements

### Planned Features
1. **Multi-language Support**: Sinhala and Tamil language processing
2. **Voice Integration**: Speech-to-text and text-to-speech capabilities
3. **Appointment Booking**: Direct booking through chat interface
4. **Salon Recommendations**: Location-based salon suggestions
5. **Personalization**: User preference learning and custom recommendations

### Technical Improvements
1. **Machine Learning**: Advanced NLP models for better query understanding
2. **Real-time Updates**: WebSocket integration for live chat features
3. **Analytics**: User interaction tracking and conversation analytics
4. **A/B Testing**: Response optimization based on user feedback

## Development Guidelines

### Adding New Service Types
1. Update `ServiceType` enum in `/models/Service.ts`
2. Add emoji mapping in `getServiceEmoji()` function
3. Update service descriptions in `serviceTypeDescriptions`
4. Add specific filtering logic in query processing

### Extending Query Processing
1. Add new query patterns in `generateAIResponse()` function
2. Update filtering logic in the main POST handler
3. Test with various query combinations
4. Update knowledge base with relevant information

### UI Customization
1. Modify styles in `/components/salon/ai-agent.tsx`
2. Update animations and transitions
3. Customize service card appearance
4. Adjust responsive design breakpoints

## Dependencies

### Core Dependencies
- **Next.js 14**: App router and API routes
- **React**: Component framework
- **TypeScript**: Type safety
- **MongoDB**: Database integration
- **Mongoose**: ODM for MongoDB

### UI Dependencies
- **Tailwind CSS**: Utility-first styling
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon library for UI elements

### State Management
- **React Hooks**: Built-in state management
- **Next.js Router**: Navigation handling

This AI agent represents a sophisticated blend of natural language processing, database integration, and modern web development practices, providing users with an intuitive and helpful experience for discovering and booking salon services.
