import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, description, callbackURL } = body;

    // Validate required fields
    if (!amount || !description || !callbackURL) {
      return NextResponse.json(
        { error: "فیلدهای ضروری ارسال نشده‌اند" },
        { status: 400 }
      );
    }

    const response = await axios.post(
      "https://api.zarinpal.com/pg/v4/payment/request.json",
      {
        merchant_id: process.env.ZARINPAL_MERCHANT_ID,
        amount: amount, // مبلغ به تومان
        description: description,
        callback_url: callbackURL, // آدرس برگشت
      }
    );

    const { data } = response.data;

    if (data.code === 100) {
      // authority اینجاست 👇
      const authority = data.authority;

      // ریدایرکت کاربر به درگاه پرداخت
      return NextResponse.json({
        success: true,
        authority: authority,
        paymentUrl: `https://www.zarinpal.com/pg/StartPay/${authority}`,
        message: "درخواست پرداخت با موفقیت ایجاد شد",
      });
    } else {
      return NextResponse.json(
        { error: response.data.errors },
        { status: 400 }
      );
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
