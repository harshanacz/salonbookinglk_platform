import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      message: "Test API is working",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("[TEST_API_ERROR]", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Test API failed" 
      },
      { status: 500 }
    );
  }
}
