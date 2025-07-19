import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import SalonContext from "@/models/SalonContext";

interface GoogleMapsLocation {
  lat: number;
  lng: number;
  address?: string;
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const body = await req.json();
    const { userLocation, radius = 10 } = body; // radius in kilometers
    
    if (!userLocation || !userLocation.lat || !userLocation.lng) {
      return NextResponse.json(
        { error: "User location is required" },
        { status: 400 }
      );
    }
    
    // Find salons within the specified radius
    const salons = await SalonContext.aggregate([
      {
        $match: {
          isVerified: true,
          location: { $exists: true }
        }
      },
      {
        $addFields: {
          distance: {
            $sqrt: {
              $add: [
                {
                  $pow: [
                    {
                      $multiply: [
                        { $subtract: ["$location.lat", userLocation.lat] },
                        111.32 // approximate km per degree latitude
                      ]
                    },
                    2
                  ]
                },
                {
                  $pow: [
                    {
                      $multiply: [
                        { $subtract: ["$location.lng", userLocation.lng] },
                        {
                          $multiply: [
                            111.32,
                            { $cos: { $multiply: [userLocation.lat, Math.PI / 180] } }
                          ]
                        }
                      ]
                    },
                    2
                  ]
                }
              ]
            }
          }
        }
      },
      {
        $match: {
          distance: { $lte: radius }
        }
      },
      {
        $sort: { distance: 1 }
      },
      {
        $limit: 10
      },
      {
        $project: {
          businessName: 1,
          location: 1,
          phoneNumber: 1,
          description: 1,
          profilePictureUrl: 1,
          reviewScore: 1,
          numberOfReviewers: 1,
          businessHours: 1,
          distance: 1
        }
      }
    ]);
    
    // Use Google Maps API to get additional location details if needed
    const enrichedSalons = await Promise.all(
      salons.map(async (salon) => {
        try {
          // Optional: Get address from coordinates using Google Maps Geocoding API
          const geocodeResponse = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${salon.location.lat},${salon.location.lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
          );
          
          if (geocodeResponse.ok) {
            const geocodeData = await geocodeResponse.json();
            const address = geocodeData.results[0]?.formatted_address || '';
            
            return {
              ...salon,
              address,
              googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${salon.location.lat},${salon.location.lng}`
            };
          }
        } catch (error) {
          console.error('Geocoding error:', error);
        }
        
        return {
          ...salon,
          address: `${salon.location.lat}, ${salon.location.lng}`,
          googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${salon.location.lat},${salon.location.lng}`
        };
      })
    );
    
    return NextResponse.json({
      salons: enrichedSalons,
      userLocation,
      radius,
      totalFound: salons.length
    });
    
  } catch (error) {
    console.error("Location search error:", error);
    return NextResponse.json(
      { error: "Failed to search nearby salons" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get('address');
    
    if (!address) {
      return NextResponse.json(
        { error: "Address parameter is required" },
        { status: 400 }
      );
    }
    
    // Geocode the address using Google Maps API
    const geocodeResponse = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
    );
    
    if (!geocodeResponse.ok) {
      throw new Error('Geocoding request failed');
    }
    
    const geocodeData = await geocodeResponse.json();
    
    if (geocodeData.status !== 'OK' || geocodeData.results.length === 0) {
      return NextResponse.json(
        { error: "Address not found" },
        { status: 404 }
      );
    }
    
    const location = geocodeData.results[0].geometry.location;
    
    return NextResponse.json({
      location: {
        lat: location.lat,
        lng: location.lng
      },
      formattedAddress: geocodeData.results[0].formatted_address
    });
    
  } catch (error) {
    console.error("Geocoding error:", error);
    return NextResponse.json(
      { error: "Failed to geocode address" },
      { status: 500 }
    );
  }
}
