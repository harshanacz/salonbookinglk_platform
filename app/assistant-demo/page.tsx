"use client";

import { SalonAssistantDemo } from "@/components/salon-assistant-demo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Sparkles, Clock, Star } from "lucide-react";

export default function AssistantDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Salon Assistant Demo
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Experience our intelligent salon booking assistant that helps customers find the perfect services based on their needs.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <Sparkles className="h-5 w-5" />
                Smart Understanding
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                The assistant understands natural language and identifies what type of salon service you're looking for.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Star className="h-5 w-5" />
                Personalized Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Get curated service recommendations with ratings, prices, and salon details tailored to your needs.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <Clock className="h-5 w-5" />
                Instant Response
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Get immediate suggestions without browsing through hundreds of services. Quick and efficient.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Demo Instructions */}
        <Card className="bg-white/90 backdrop-blur mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-6 w-6 text-purple-600" />
              How to Try the Demo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-700">
                Click the floating chat button in the bottom-right corner to start a conversation with our salon assistant.
              </p>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Try these example queries:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• "I want to get a haircut"</li>
                  <li>• "I need a relaxing massage"</li>
                  <li>• "Can you help me find facial treatments?"</li>
                  <li>• "I want to dye my hair blonde"</li>
                  <li>• "Looking for nail art services"</li>
                  <li>• "I need a blowout and styling"</li>
                </ul>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">Note:</h4>
                <p className="text-blue-700 text-sm">
                  This demo uses keyword-based detection for demonstration purposes. The production version integrates with Google's advanced AI for more sophisticated natural language understanding.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technical Details */}
        <Card className="bg-white/90 backdrop-blur">
          <CardHeader>
            <CardTitle>Technical Implementation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2 text-purple-700">Features Implemented:</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>✅ Chat interface component</li>
                  <li>✅ Natural language processing</li>
                  <li>✅ Service type detection</li>
                  <li>✅ Personalized recommendations</li>
                  <li>✅ Real-time service matching</li>
                  <li>✅ Mobile-responsive design</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2 text-blue-700">Integration Ready:</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>✅ Google Gemini API integration</li>
                  <li>✅ Database service queries</li>
                  <li>✅ Fallback handling</li>
                  <li>✅ Error management</li>
                  <li>✅ No explicit AI mentions</li>
                  <li>✅ Production-ready code</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Demo Component */}
      <SalonAssistantDemo />
    </div>
  );
}