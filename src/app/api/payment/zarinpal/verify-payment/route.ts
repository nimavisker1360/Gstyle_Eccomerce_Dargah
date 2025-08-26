import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import { tomanToRial } from "@/lib/utils";
import { connectToDatabase } from "@/lib/db";
import { Transaction } from "@/lib/db/models/transaction.model";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { Authority, Status, amount, orderId } = body;

    // Validate required fields
    if (!Authority) {
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

    // Fetch stored transaction amount (in Rial) for accurate verification
    await connectToDatabase();
    const existing = await Transaction.findOne({ authority: Authority });
    const amountInRial =
      existing?.amount ?? (amount ? tomanToRial(Number(amount)) : undefined);

    if (!amountInRial) {
      return NextResponse.json(
        { error: "مبلغ تراکنش یافت نشد" },
        { status: 400 }
      );
    }

    const response = await axios.post(
      "https://sandbox.zarinpal.com/pg/v4/payment/verify.json",
      {
        merchant_id: process.env.ZARINPAL_MERCHANT_ID,
        amount: amountInRial,
        authority: Authority,
      }
    );

    const { data } = response.data;

    if (data.code === 100) {
      try {
        const session = await auth();
        await Transaction.findOneAndUpdate(
          { authority: Authority },
          {
            userId: session?.user?.id ?? existing?.userId,
            orderId: orderId ?? existing?.orderId,
            status: "completed",
            refId: String(data.ref_id),
            amount: Number(amountInRial),
            // keep any customer info that was saved during create
            customer: existing?.customer ?? undefined,
            verifiedAt: new Date(),
          },
          { upsert: false }
        );
      } catch (dbErr) {
        console.error(
          "Failed to update transaction after verification:",
          dbErr
        );
      }
      return NextResponse.json({
        success: true,
        refId: data.ref_id,
        message: `✅ پرداخت موفق بود. کد پیگیری: ${data.ref_id}`,
      });
    } else {
      try {
        await Transaction.findOneAndUpdate(
          { authority: Authority },
          { status: "failed" },
          { upsert: false }
        );
      } catch (dbErr) {
        console.error("Failed to mark transaction failed:", dbErr);
      }
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
    const orderId = searchParams.get("orderId");

    if (Status !== "OK") {
      // mark cancelled
      try {
        await connectToDatabase();
        if (Authority) {
          await Transaction.findOneAndUpdate(
            { authority: Authority },
            { status: "cancelled" },
            { upsert: false }
          );
        }
      } catch (dbErr) {
        console.error("Failed to mark transaction cancelled:", dbErr);
      }
      // Payment failed or was cancelled, redirect to home page
      const failureUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/?payment=failed${amount ? `&amount=${amount}` : ""}`;
      return NextResponse.redirect(failureUrl);
    }

    if (!Authority) {
      return NextResponse.json(
        { error: "پارامترهای ضروری ارسال نشده‌اند" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const txn = await Transaction.findOne({ authority: Authority });
    const amountInRial =
      txn?.amount ?? (amount ? tomanToRial(Number(amount)) : undefined);

    if (!amountInRial) {
      const failureUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/?payment=error&error=${encodeURIComponent("amount not found")}`;
      return NextResponse.redirect(failureUrl);
    }

    const response = await axios.post(
      "https://sandbox.zarinpal.com/pg/v4/payment/verify.json",
      {
        merchant_id: process.env.ZARINPAL_MERCHANT_ID,
        amount: amountInRial,
        authority: Authority,
      }
    );

    const { data } = response.data;

    if (data.code === 100) {
      try {
        const session = await auth();
        await Transaction.findOneAndUpdate(
          { authority: Authority },
          {
            userId: session?.user?.id ?? txn?.userId,
            orderId: orderId ?? txn?.orderId,
            status: "completed",
            refId: String(data.ref_id),
            amount: Number(amountInRial),
            customer: txn?.customer ?? undefined,
            verifiedAt: new Date(),
          },
          { upsert: false }
        );
      } catch (dbErr) {
        console.error(
          "Failed to update transaction after verification:",
          dbErr
        );
      }
      // Payment verified successfully, redirect to home page
      const successUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/?payment=success&refId=${data.ref_id}${amountInRial ? `&amount=${amountInRial}` : ""}`;
      return NextResponse.redirect(successUrl);
    } else {
      try {
        await Transaction.findOneAndUpdate(
          { authority: Authority },
          { status: "failed" },
          { upsert: false }
        );
      } catch (dbErr) {
        console.error("Failed to mark transaction failed:", dbErr);
      }
      // Payment verification failed, redirect to home page
      const failureUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/?payment=verification_failed&error=${data.message}${amountInRial ? `&amount=${amountInRial}` : ""}`;
      return NextResponse.redirect(failureUrl);
    }
  } catch (error: any) {
    // Error occurred, redirect to home page
    const failureUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/?payment=error&error=${encodeURIComponent(error.message)}`;
    return NextResponse.redirect(failureUrl);
  }
}
