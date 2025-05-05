import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";

export async function GET(req: Request) {
  try {
    console.log("[DEBUG_DB] Testing database connection");
    await dbConnect();
    
    // Get connection status
    const status = mongoose.connection.readyState;
    
    const statusText = (() => {
      switch(status) {
        case 0: return "Disconnected";
        case 1: return "Connected";
        case 2: return "Connecting";
        case 3: return "Disconnecting";
        default: return "Unknown";
      }
    })();

    // Get database name
    const dbName = mongoose.connection.name;
    
    // Get collection names
    const collections = await mongoose.connection.db.collections();
    const collectionNames = collections.map(c => c.collectionName);

    return NextResponse.json({
      status: statusText,
      connectionState: status,
      database: dbName,
      collections: collectionNames,
      message: "Database connection test successful",
    });
  } catch (error) {
    console.error("[DEBUG_DB] Error testing database connection:", error);
    return NextResponse.json(
      { 
        message: "Database connection test failed", 
        error: String(error) 
      },
      { status: 500 }
    );
  }
}
