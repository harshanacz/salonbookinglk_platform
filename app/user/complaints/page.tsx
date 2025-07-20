"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Complaint {
  _id: string;
  appointmentId: {
    _id: string;
    date: string;
    time: string;
  };
  category: string;
  subject: string;
  description: string;
  status: string;
  createdAt: string;
}

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/complaints");
      
      if (response.ok) {
        const data = await response.json();
        setComplaints(data);
      } else {
        setError("Failed to load complaints");
      }
    } catch (error) {
      console.error("Error fetching complaints:", error);
      setError("An error occurred while loading complaints");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#F3E5F5]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading complaints...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#F3E5F5]">
        <div className="text-center">
          <div className="text-red-500 mb-4">⚠️</div>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchComplaints} 
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-7 pl-24 min-h-screen bg-[#F3E5F5]">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">My Complaints</h1>
        
        {complaints.length > 0 ? (
          <div className="space-y-4">
            {complaints.map((complaint) => (
              <Card key={complaint._id} className="w-full">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{complaint.subject}</CardTitle>
                    <Badge className={getStatusColor(complaint.status || 'pending')}>
                      {complaint.status || 'Pending'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex gap-4 text-sm text-gray-600">
                      <span><strong>Category:</strong> {complaint.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                      <span><strong>Date:</strong> {formatDate(complaint.createdAt)}</span>
                    </div>
                    {complaint.appointmentId && (
                      <div className="text-sm text-gray-600">
                        <strong>Appointment:</strong> {formatDate(complaint.appointmentId.date)} at {complaint.appointmentId.time}
                      </div>
                    )}
                    <div className="mt-3">
                      <strong className="text-sm">Description:</strong>
                      <p className="text-gray-700 mt-1">{complaint.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="w-full">
            <CardContent className="text-center py-12">
              <div className="text-gray-400 mb-4">📋</div>
              <p className="text-gray-500 mb-2">No complaints found</p>
              <p className="text-sm text-gray-400">Your submitted complaints will appear here</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
