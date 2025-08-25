import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { Authority, Status, amount } = body;

    // Validate required fields
    if (!Authority || !amount) {
      return NextResponse.json(
        { error: "پارامترهای ضروری ارسال نشده‌اند" },
        { status: 400 }
      );
    }

    if (Status !== "OK") {
      return NextResponse.json(
        { error: "پرداخت توسط کاربر لغو شد." },
        { status: 400 }
      );
    }

    // باید دقیقاً همون مبلغی باشه که در request زده بودی
    const response = await axios.post(
      "https://api.zarinpal.com/pg/v4/payment/verify.json",
      {
        merchant_id: process.env.ZARINPAL_MERCHANT_ID,
        amount: amount,
        authority: Authority, // همون 36 کاراکتری
      }
    );

    const { data } = response.data;

    if (data.code === 100) {
      return NextResponse.json({
        success: true,
        refId: data.ref_id,
        message: `✅ پرداخت موفق بود. کد پیگیری: ${data.ref_id}`,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: `❌ خطا در تایید پرداخت: ${data.message}`,
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Handle GET requests for callback URLs
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const Authority = searchParams.get("Authority");
    const Status = searchParams.get("Status");
    const amount = searchParams.get("amount");

    if (Status !== "OK") {
      // Payment failed or was cancelled, redirect to checkout page
      const failureUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/checkout/zarinpal?status=failed&amount=${amount}`;
      return NextResponse.redirect(failureUrl);
    }

    if (!Authority || !amount) {
      return NextResponse.json(
        { error: "پارامترهای ضروری ارسال نشده‌اند" },
        { status: 400 }
      );
    }

    // باید دقیقاً همون مبلغی باشه که در request زده بودی
    const response = await axios.post(
      "https://api.zarinpal.com/pg/v4/payment/verify.json",
      {
        merchant_id: process.env.ZARINPAL_MERCHANT_ID,
        amount: parseInt(amount),
        authority: Authority, // همون 36 کاراکتری
      }
    );

    const { data } = response.data;

    if (data.code === 100) {
      // Payment verified successfully, redirect to success page
      const successUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/checkout/zarinpal?status=success&authority=${Authority}&refId=${data.ref_id}&amount=${amount}`;
      return NextResponse.redirect(successUrl);
    } else {
      // Payment verification failed, redirect to failure page
      const failureUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/checkout/zarinpal?status=verification_failed&error=${data.message}&amount=${amount}`;
      return NextResponse.redirect(failureUrl);
    }
  } catch (error: any) {
    // Error occurred, redirect to failure page
    const failureUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/checkout/zarinpal?status=error&error=${error.message}`;
    return NextResponse.redirect(failureUrl);
  }
}
