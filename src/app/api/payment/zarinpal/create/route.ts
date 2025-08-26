import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import { tomanToRial } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, description, callbackURL, customerInfo } = body;

    // Validate required fields
    if (!amount || !description || !callbackURL) {
      return NextResponse.json(
        { error: "فیلدهای ضروری ارسال نشده‌اند" },
        { status: 400 }
      );
    }

    // Convert Toman to Rial for Zarinpal API (1 Toman = 10 Rial)
    const amountInRial = tomanToRial(amount);

    // Log the request for debugging
    console.log("Zarinpal payment request:", {
      originalAmountInToman: amount,
      convertedAmountInRial: amountInRial,
      description,
      callbackURL,
      customerInfo,
      merchantId: process.env.ZARINPAL_MERCHANT_ID,
    });

    // Validate customer info if provided
    if (customerInfo) {
      const requiredFields = [
        "firstName",
        "lastName",
        "phone",
        "email",
        "address",
      ];
      const missingFields = requiredFields.filter(
        (field) => !customerInfo[field] || customerInfo[field].trim() === ""
      );

      if (missingFields.length > 0) {
        return NextResponse.json(
          { error: `فیلدهای زیر الزامی هستند: ${missingFields.join(", ")}` },
          { status: 400 }
        );
      }
    }

    const response = await axios.post(
      "https://api.zarinpal.com/pg/v4/payment/request.json",
      {
        merchant_id: process.env.ZARINPAL_MERCHANT_ID,
        amount: amountInRial, // مبلغ به ریال (تبدیل شده از تومان)
        description: description,
        callback_url: callbackURL, // آدرس برگشت
        metadata: customerInfo
          ? {
              customer_name: `${customerInfo.firstName} ${customerInfo.lastName}`,
              customer_phone: customerInfo.phone,
              customer_email: customerInfo.email,
              customer_address: customerInfo.address,
            }
          : undefined,
      }
    );

    const { data } = response.data;

    if (data.code === 100) {
      // authority اینجاست 👇
      const authority = data.authority;

      // Log successful response
      console.log("Zarinpal payment created successfully:", {
        authority,
        amount,
        customerInfo: customerInfo
          ? `${customerInfo.firstName} ${customerInfo.lastName}`
          : "N/A",
      });

      // ریدایرکت کاربر به درگاه پرداخت
      return NextResponse.json({
        success: true,
        authority: authority,
        paymentUrl: `https://www.zarinpal.com/pg/StartPay/${authority}`,
        message: "درخواست پرداخت با موفقیت ایجاد شد",
        customerInfo: customerInfo,
      });
    } else {
      console.error("Zarinpal API error:", response.data.errors);
      return NextResponse.json(
        { error: response.data.errors || "خطا در ایجاد درخواست پرداخت" },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Zarinpal payment creation error:", error);
    return NextResponse.json(
      {
        error: error.message || "خطای داخلی سرور",
      },
      { status: 500 }
    );
  }
}
