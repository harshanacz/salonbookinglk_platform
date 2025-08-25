import SalonAIAgent from '@/components/salon/ai-agent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AIAgentTestPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Salon AI Assistant Demo
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience our AI-powered salon booking assistant. Ask about services, 
            get care instructions, find nearby salons, and get booking help.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* AI Agent */}
          <div>
            <SalonAIAgent 
              floating={false}
              className="h-[600px]"
            />
          </div>

          {/* Information Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🤖 AI Assistant Capabilities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-purple-600">Service Recommendations</h4>
                  <p className="text-sm text-gray-600">Get personalized service suggestions based on your needs</p>
                </div>
                <div>
                  <h4 className="font-semibold text-purple-600">Pricing Information</h4>
                  <p className="text-sm text-gray-600">Ask about costs and service durations</p>
                </div>
                <div>
                  <h4 className="font-semibold text-purple-600">Care Instructions</h4>
                  <p className="text-sm text-gray-600">Get pre and post-service care tips</p>
                </div>
                <div>
                  <h4 className="font-semibold text-purple-600">Location Finding</h4>
                  <p className="text-sm text-gray-600">Find nearby salons with Google Maps integration</p>
                </div>
                <div>
                  <h4 className="font-semibold text-purple-600">Booking Assistance</h4>
                  <p className="text-sm text-gray-600">Get help with appointment planning and booking tips</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Try These Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="p-2 bg-purple-50 rounded cursor-pointer hover:bg-purple-100">
                    "Suggest hair services for damaged hair"
                  </div>
                  <div className="p-2 bg-purple-50 rounded cursor-pointer hover:bg-purple-100">
                    "How much do facial treatments cost?"
                  </div>
                  <div className="p-2 bg-purple-50 rounded cursor-pointer hover:bg-purple-100">
                    "What should I do after hair coloring?"
                  </div>
                  <div className="p-2 bg-purple-50 rounded cursor-pointer hover:bg-purple-100">
                    "Find salons near me"
                  </div>
                  <div className="p-2 bg-purple-50 rounded cursor-pointer hover:bg-purple-100">
                    "How long does a manicure take?"
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Technical Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>✅ Real-time service data integration</div>
                <div>✅ Google Maps location services</div>
                <div>✅ Context-aware responses</div>
                <div>✅ Salon-specific recommendations</div>
                <div>✅ Mobile-responsive design</div>
                <div>✅ Floating widget for all pages</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
