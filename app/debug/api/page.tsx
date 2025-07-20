"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DebugAPIPage() {
  const [results, setResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<string | null>(null);

  const testAPI = async (endpoint: string, name: string) => {
    setLoading(name);
    try {
      const response = await fetch(endpoint);
      const data = await response.json();
      setResults((prev: Record<string, any>) => ({
        ...prev,
        [name]: {
          status: response.status,
          ok: response.ok,
          data: data
        }
      }));
    } catch (error: any) {
      setResults((prev: Record<string, any>) => ({
        ...prev,
        [name]: {
          status: 'Error',
          ok: false,
          error: error.message
        }
      }));
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="container max-w-4xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>API Debug Page</CardTitle>
          <CardDescription>Test individual API endpoints</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={() => testAPI('/api/test', 'test')}
              disabled={loading === 'test'}
            >
              {loading === 'test' ? 'Testing...' : 'Test Basic API'}
            </Button>
            
            <Button 
              onClick={() => testAPI('/api/salon-owner/status', 'status')}
              disabled={loading === 'status'}
            >
              {loading === 'status' ? 'Testing...' : 'Test Status API'}
            </Button>
            
            <Button 
              onClick={() => testAPI('/api/appointments', 'appointments')}
              disabled={loading === 'appointments'}
            >
              {loading === 'appointments' ? 'Testing...' : 'Test Appointments API'}
            </Button>
          </div>

          <div className="space-y-4">
            {Object.entries(results).map(([name, result]: [string, any]) => (
              <Card key={name}>
                <CardHeader>
                  <CardTitle className="text-lg">{name.charAt(0).toUpperCase() + name.slice(1)} API Result</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <span className="font-medium">Status:</span>
                      <span className={result.ok ? 'text-green-600' : 'text-red-600'}>
                        {result.status}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Response:</span>
                      <pre className="mt-2 p-3 bg-gray-100 rounded text-sm overflow-auto">
                        {JSON.stringify(result.data || result.error, null, 2)}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
