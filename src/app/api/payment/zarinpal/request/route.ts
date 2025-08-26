import { NextRequest, NextResponse } from "next/server";
import { tomanToRial } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    console.log("Zarinpal payment request received");

    const body = await request.json();
    const { amount, description, orderId, callbackUrl, phoneNumber, fullName } =
      body;

    // Validate required fields
    if (!amount || !description || !orderId || !callbackUrl) {
      return NextResponse.json(
        { success: false, error: "فیلدهای ضروری ارسال نشده‌اند" },
        { status: 400 }
      );
    }

    // Get Zarinpal credentials from environment variables
    console.log("Environment variables:", {
      NODE_ENV: process.env.NODE_ENV,
      ZARINPAL_MERCHANT_ID: process.env.ZARINPAL_MERCHANT_ID
        ? "SET"
        : "NOT SET",
    });

    const merchantId = process.env.ZARINPAL_MERCHANT_ID;
    const isProduction = process.env.NODE_ENV === "production";

    if (!merchantId) {
      console.error("ZARINPAL_MERCHANT_ID not found in environment variables");
      return NextResponse.json(
        { success: false, error: "خطا در تنظیمات درگاه پرداخت" },
        { status: 500 }
      );
    }

    // For testing purposes - simulate successful response if using test merchant ID
    const isTestMode = merchantId === "b2734f32-2b26-499a-bdb0-5477bef46783";

    if (isTestMode) {
      console.log(
        "Running in test mode - simulating successful payment request"
      );
      const testAuthority = `TEST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const testPaymentUrl = `https://sandbox.zarinpal.com/pg/StartPay/${testAuthority}`;

      return NextResponse.json({
        success: true,
        authority: testAuthority,
        paymentUrl: testPaymentUrl,
        message: "درخواست پرداخت تست با موفقیت ایجاد شد",
        isTestMode: true,
      });
    }

    // Zarinpal API endpoints
    const baseUrl = isProduction
      ? "https://www.zarinpal.com/pg/rest/WebGate"
      : "https://sandbox.zarinpal.com/pg/rest/WebGate";

    // Convert Toman to Rial for Zarinpal API (1 Toman = 10 Rial)
    const amountInRial = tomanToRial(amount);

    // Prepare payment request data
    const paymentData = {
      merchant_id: merchantId,
      amount: amountInRial, // Amount in Rial
      description: description,
      callback_url: callbackUrl,
      metadata: {
        order_id: orderId,
        phone_number: phoneNumber,
        full_name: fullName,
      },
    };

    console.log("Sending payment request to Zarinpal:", {
      url: baseUrl,
      merchantId,
      originalAmountInToman: amount,
      convertedAmountInRial: amountInRial,
      description,
      orderId,
      isProduction,
    });

    // Send payment request to Zarinpal
    console.log("Attempting to send request to Zarinpal:", baseUrl);

    const zarinpalResponse = await fetch(`${baseUrl}/PaymentRequest.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentData),
    });

    console.log("Zarinpal response status:", zarinpalResponse.status);

    const zarinpalResult = await zarinpalResponse.json();
    console.log("Zarinpal response body:", zarinpalResult);

    if (zarinpalResult.Status === 100) {
      // Success - redirect to Zarinpal payment page
      const paymentUrl = isProduction
        ? `https://www.zarinpal.com/pg/StartPay/${zarinpalResult.Authority}`
        : `https://sandbox.zarinpal.com/pg/StartPay/${zarinpalResult.Authority}`;

      console.log("Payment request successful:", {
        authority: zarinpalResult.Authority,
        paymentUrl,
        orderId,
      });

      return NextResponse.json({
        success: true,
        authority: zarinpalResult.Authority,
        paymentUrl,
        message: "درخواست پرداخت با موفقیت ایجاد شد",
      });
    } else {
      // Handle Zarinpal errors
      const errorMessages: { [key: number]: string } = {
        "-1": "اطلاعات ارسال شده ناقص است",
        "-2": "IP یا مرچنت کد پذیرفته نشده است",
        "-3": "با توجه به محدودیت‌های شاپرک امکان پرداخت با رقم درخواستی میسر نمی‌باشد",
        "-4": "سطح تایید پذیرنده پایین تر از سطح نقره ای است",
        "-11": "درخواست مورد نظر یافت نشد",
        "-12": "امکان ویرایش درخواست میسر نمی‌باشد",
        "-21": "هیچ نوع عملیات مالی برای این تراکنش یافت نشد",
        "-22": "تراکنش ناموفق می‌باشد",
        "-33": "رقم تراکنش با رقم پرداخت شده مطابقت ندارد",
        "-34": "سقف تقسیم تراکنش از لحاظ تعداد یا رقم عبور نموده است",
        "-40": "اجازه دسترسی به متد مربوطه وجود ندارد",
        "-41": "اطلاعات ارسال شده مربوط به AdditionalData غیرمعتبر می‌باشد",
        "-42":
          "مدت زمان معتبر طول عمر شناسه پرداخت باید بین ۳۰ دقیقه تا ۴۵ روز می‌باشد",
        "-54": "درخواست مورد نظر آرشیو شده است",
        "-101": "عملیات پرداخت ناموفق بوده است",
      };

      const errorMessage =
        errorMessages[zarinpalResult.Status] || `خطای ${zarinpalResult.Status}`;

      console.error("Zarinpal payment request failed:", {
        status: zarinpalResult.Status,
        errorMessage,
        orderId,
      });

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          zarinpalStatus: zarinpalResult.Status,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error in Zarinpal payment request:", error);
    return NextResponse.json(
      { success: false, error: "خطا در ارتباط با درگاه پرداخت" },
      { status: 500 }
    );
  }
}
