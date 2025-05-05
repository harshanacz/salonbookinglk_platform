import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req: Request) {
  try {
    await dbConnect();
    
    // Get User model schema information
    const userSchema = User.schema;
    const paths = userSchema.paths;

    // Extract schema information
    const schemaInfo = Object.keys(paths).map((path) => {
      const config = paths[path];
      
      // Extract enum values if they exist
      let enumValues = null;
      if (config.enumValues) {
        enumValues = config.enumValues;
      } else if (config.options && config.options.enum) {
        if (Array.isArray(config.options.enum)) {
          enumValues = config.options.enum;
        } else if (config.options.enum.values) {
          enumValues = config.options.enum.values;
        }
      }

      return {
        path,
        instance: config.instance,
        required: !!config.isRequired,
        default: config.defaultValue,
        enum: enumValues,
      };
    });

    return NextResponse.json({
      model: "User",
      schema: schemaInfo,
    });
  } catch (error) {
    console.error("[DEBUG_MODELS] Error:", error);
    return NextResponse.json(
      { message: "Error retrieving model information", error: String(error) },
      { status: 500 }
    );
  }
}
