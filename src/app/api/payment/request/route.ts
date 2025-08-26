import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import { PaymentRequest } from "@/lib/db/models/payment.model";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      amount,
      description,
      callbackUrl,
      orderId,
      paymentMethod = "direct",
    } = body;

    if (!amount || !description) {
      return NextResponse.json(
        { error: "Amount and description are required" },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Zarinpal API v4 configuration - Force sandbox for testing
    const zarinpalMerchantId = process.env.ZARINPAL_MERCHANT_ID;
    const zarinpalApiUrl =
      "https://sandbox.zarinpal.com/pg/v4/payment/request.json";

    if (!zarinpalMerchantId) {
      return NextResponse.json(
        { error: "Zarinpal merchant ID not configured" },
        { status: 500 }
      );
    }

    // Create payment request payload
    const paymentPayload = {
      merchant_id: zarinpalMerchantId,
      amount: amount, // Amount in Rial
      description: description,
      callback_url:
        callbackUrl ||
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/payment/verify`,
      metadata: {
        order_id: orderId,
        user_id: session.user.id,
        email: session.user.email,
      },
    };

    // Send request to Zarinpal
    const zarinpalResponse = await fetch(zarinpalApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentPayload),
    });

    const zarinpalResult = await zarinpalResponse.json();

    if (zarinpalResult.data?.code === 100) {
      // Payment request successful
      const authority = zarinpalResult.data.authority;

      // Choose payment method based on user preference
      let paymentUrl;
      if (paymentMethod === "direct") {
        // Direct to bank gateway (skip Zarinpal intermediate page) - Force sandbox
        paymentUrl = `https://sandbox.zarinpal.com/pg/StartPay/${authority}/ZarinGate`;
      } else {
        // Go through Zarinpal intermediate page - Force sandbox
        paymentUrl = `https://sandbox.zarinpal.com/pg/StartPay/${authority}`;
      }

      // Save payment request to database
      const paymentRequest = new PaymentRequest({
        userId: session.user.id,
        orderId: orderId,
        amount: amount,
        description: description,
        authority: authority,
        status: "pending",
        metadata: {
          order_id: orderId,
          user_id: session.user.id,
          email: session.user.email,
        },
      });

      await paymentRequest.save();

      return NextResponse.json({
        success: true,
        authority: authority,
        paymentUrl: paymentUrl,
        message: "Payment request created successfully",
      });
    } else {
      // Payment request failed
      return NextResponse.json(
        {
          error: "Payment request failed",
          details: zarinpalResult.errors || "Unknown error",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Payment request error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
