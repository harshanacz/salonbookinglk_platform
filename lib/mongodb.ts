import mongoose from "mongoose";

declare global {
  var mongoose: any; // This must be a `var` and not a `let / const`
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error(
      "Please define the MONGODB_URI environment variable inside .env"
    );
  }

  // For debugging purposes
  console.log("[MongoDB] Connection string:", MONGODB_URI.replace(/:[^:]*@/, ':***@'));

  if (cached.conn) {
    console.log("[MongoDB] Using cached connection");
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000, // Timeout after 10 seconds
      maxPoolSize: 10, // Maintain up to 10 socket connections
    };

    console.log("[MongoDB] Connecting to database...");
    
    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log("[MongoDB] Successfully connected to database");
        return mongoose;
      })
      .catch((error) => {
        console.error("[MongoDB] Connection error:", error);
        // Reset the promise so we can try again later
        cached.promise = null;
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    console.error("[MongoDB] Failed to establish connection:", e);
    throw e;
  }
}

export default dbConnect;
