import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const envVars = {
      NODE_ENV: process.env.NODE_ENV,
      ZARINPAL_MERCHANT_ID: process.env.ZARINPAL_MERCHANT_ID
        ? "SET"
        : "NOT SET",
      ZARINPAL_MERCHANT_ID_LENGTH:
        process.env.ZARINPAL_MERCHANT_ID?.length || 0,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    };

    console.log("Environment variables check:", envVars);

    return NextResponse.json({
      success: true,
      message: "Environment variables check",
      data: envVars,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in test endpoint:", error);
    return NextResponse.json(
      { success: false, error: "Test endpoint error" },
      { status: 500 }
    );
  }
}
