import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { PaymentRequest } from "@/lib/db/models/payment.model";
import { Invoice } from "@/lib/db/models/invoice.model";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const authority = searchParams.get("Authority");
    const status = searchParams.get("Status");

    if (!authority) {
      return NextResponse.json(
        { error: "Authority parameter is required" },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Find the payment request
    const paymentRequest = await PaymentRequest.findOne({ authority });
    if (!paymentRequest) {
      return NextResponse.json(
        { error: "Payment request not found" },
        { status: 404 }
      );
    }

    // Check if payment was successful
    if (status === "OK") {
      // Verify payment with Zarinpal
      const zarinpalMerchantId = process.env.ZARINPAL_MERCHANT_ID;
      const zarinpalApiUrl =
        process.env.ZARINPAL_MODE === "production" ||
        process.env.NODE_ENV === "production"
          ? "https://www.zarinpal.com/pg/v4/payment/verify.json"
          : "https://sandbox.zarinpal.com/pg/v4/payment/verify.json";

      if (!zarinpalMerchantId) {
        return NextResponse.json(
          { error: "Zarinpal merchant ID not configured" },
          { status: 500 }
        );
      }

      // Verify payment with Zarinpal
      const verifyPayload = {
        merchant_id: zarinpalMerchantId,
        amount: paymentRequest.amount,
        authority: authority,
      };

      const zarinpalResponse = await fetch(zarinpalApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(verifyPayload),
      });

      const zarinpalResult = await zarinpalResponse.json();

      if (zarinpalResult.data?.code === 100) {
        // Payment verified successfully
        const refId = zarinpalResult.data.ref_id;
        const amount = zarinpalResult.data.amount;

        // Update payment request status
        paymentRequest.status = "completed";
        paymentRequest.refId = refId;
        paymentRequest.verifiedAt = new Date();
        await paymentRequest.save();

        // Create invoice
        const invoice = new Invoice({
          userId: paymentRequest.userId,
          orderId: paymentRequest.orderId,
          amount: amount, // Amount in Rial
          refId: refId,
          authority: authority,
          paymentDate: new Date(),
          status: "paid",
          metadata: paymentRequest.metadata,
        });

        await invoice.save();

        // Redirect to home page with success message
        const successUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/?payment=success&invoiceId=${invoice._id}`;
        return NextResponse.redirect(successUrl);
      } else {
        // Payment verification failed
        paymentRequest.status = "failed";
        paymentRequest.errorDetails =
          zarinpalResult.errors || "Verification failed";
        await paymentRequest.save();

        const errorUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/?payment=error&authority=${authority}&error=${encodeURIComponent("Payment verification failed")}`;
        return NextResponse.redirect(errorUrl);
      }
    } else {
      // Payment was cancelled or failed
      paymentRequest.status = "cancelled";
      await paymentRequest.save();

      const cancelUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/?payment=cancelled&authority=${authority}`;
      return NextResponse.redirect(cancelUrl);
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
