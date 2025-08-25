import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { authority, status, orderId } = body;

    // Validate required fields
    if (!authority || !orderId) {
      return NextResponse.json(
        { success: false, error: "پارامترهای ضروری ارسال نشده‌اند" },
        { status: 400 }
      );
    }

    // Get Zarinpal credentials from environment variables
    const merchantId = process.env.ZARINPAL_MERCHANT_ID;
    const isProduction = process.env.NODE_ENV === "production";

    if (!merchantId) {
      console.error("ZARINPAL_MERCHANT_ID not found in environment variables");
      return NextResponse.json(
        { success: false, error: "خطا در تنظیمات درگاه پرداخت" },
        { status: 500 }
      );
    }

    // Zarinpal API endpoints
    const baseUrl = isProduction
      ? "https://www.zarinpal.com/pg/rest/WebGate"
      : "https://sandbox.zarinpal.com/pg/rest/WebGate";

    // Prepare verification data
    const verificationData = {
      merchant_id: merchantId,
      authority: authority,
      amount: 0, // We'll get this from the order details
    };

    console.log("Verifying payment with Zarinpal:", {
      url: baseUrl,
      merchantId,
      authority,
      orderId,
      isProduction,
    });

    // Verify payment with Zarinpal
    const zarinpalResponse = await fetch(
      `${baseUrl}/PaymentVerification.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(verificationData),
      }
    );

    const zarinpalResult = await zarinpalResponse.json();

    if (zarinpalResult.Status === 100) {
      // Payment verified successfully
      console.log("Payment verification successful:", {
        authority: zarinpalResult.Authority,
        refId: zarinpalResult.RefID,
        orderId,
        amount: zarinpalResult.Amount,
      });

      // Here you would typically:
      // 1. Update order status in database
      // 2. Send confirmation email
      // 3. Update inventory
      // 4. Log the transaction

      return NextResponse.json({
        success: true,
        authority: zarinpalResult.Authority,
        refId: zarinpalResult.RefID,
        amount: zarinpalResult.Amount,
        message: "پرداخت با موفقیت تایید شد",
        orderId,
      });
    } else {
      // Handle verification errors
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

      console.error("Zarinpal payment verification failed:", {
        status: zarinpalResult.Status,
        errorMessage,
        authority,
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
    console.error("Error in Zarinpal payment verification:", error);
    return NextResponse.json(
      { success: false, error: "خطا در تایید پرداخت" },
      { status: 500 }
    );
  }
}

// Handle GET requests for callback URLs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const authority = searchParams.get("Authority");
    const status = searchParams.get("Status");
    const orderId = searchParams.get("orderId");

    console.log("Zarinpal callback received:", {
      authority,
      status,
      orderId,
      url: request.url,
    });

    // Redirect to appropriate page based on status
    if (status === "OK" && authority) {
      // Payment was successful, redirect to success page
      const successUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/payment/success?authority=${authority}&orderId=${orderId}`;
      return NextResponse.redirect(successUrl);
    } else {
      // Payment failed or was cancelled, redirect to failure page
      const failureUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/payment/failure?orderId=${orderId}`;
      return NextResponse.redirect(failureUrl);
    }
  } catch (error) {
    console.error("Error handling Zarinpal callback:", error);
    // Redirect to failure page on error
    const failureUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/payment/failure`;
    return NextResponse.redirect(failureUrl);
  }
}
