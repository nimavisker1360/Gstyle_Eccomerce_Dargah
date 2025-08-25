"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import useCartStore from "@/hooks/use-cart-store";
import { formatPersianAmount } from "@/lib/utils/format-persian-numbers";

export default function ZarinPalCheckout({
  initialAmount,
}: {
  initialAmount?: number;
}) {
  const [loading, setLoading] = useState(false);
  const { cart } = useCartStore();
  const { items } = cart;

  // Calculate total from actual cart items, or use initialAmount if provided
  const computedTotal =
    initialAmount ||
    items?.reduce((sum, item) => sum + item.price * item.quantity, 0) ||
    0;

  const handlePayment = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/payment/zarinpal/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: computedTotal,
          description: "پرداخت سفارش جی استایل",
          callbackURL: `${window.location.origin}/checkout/zarinpal?amount=${computedTotal}`,
        }),
      });

      const data = await response.json();

      if (data.success && data.paymentUrl) {
        // ریدایرکت کاربر به درگاه پرداخت
        window.location.href = data.paymentUrl;
      }
    } catch (error) {
      console.error("خطا در ایجاد درخواست پرداخت:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link
            href="/checkout"
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 ml-2" />
            بازگشت به صفحه پرداخت
          </Link>
        </div>

        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            تکمیل پرداخت
          </h1>
          <p className="text-gray-600">
            لطفاً اطلاعات خود را وارد کرده و پرداخت را تکمیل کنید
          </p>
        </div>

        {/* Order Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* First Order Summary Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-blue-600 mb-4">
              خلاصه سفارش
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-blue-600 font-medium">محصولات:</span>
                <div className="text-lg font-bold text-gray-800 mt-1">
                  {formatPersianAmount(computedTotal)}
                </div>
              </div>
              <hr className="border-gray-200" />
              <div>
                <span className="text-green-600 font-medium">
                  جمع کل سفارش:
                </span>
                <div className="text-lg font-bold text-green-600 mt-1">
                  {formatPersianAmount(computedTotal)}
                </div>
              </div>
            </div>
          </div>

          {/* Second Order Summary Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-blue-600 mb-4">
              جزئیات پرداخت
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-blue-600 font-medium">
                  تعداد آیتم‌ها:
                </span>
                <div className="text-lg font-bold text-gray-800 mt-1">
                  {items.length} آیتم
                </div>
              </div>
              <hr className="border-gray-200" />
              <div>
                <span className="text-green-600 font-medium">
                  مبلغ قابل پرداخت:
                </span>
                <div className="text-lg font-bold text-green-600 mt-1">
                  {formatPersianAmount(computedTotal)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Button */}
        <div className="text-center mb-6">
          <button
            onClick={handlePayment}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "در حال پردازش..." : "پرداخت از زرین پال"}
          </button>
        </div>

        {/* Terms and Conditions */}
        <div className="text-center text-sm text-gray-500">
          با کلیک روی دکمه بالا شما با حریم خصوصی و شرایط استفاده جی استایل
          موافقت می‌کنید.
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>پرداخت شما از طریق درگاه امن زرین‌پال انجام می‌شود</p>
          <p className="mt-1">در صورت بروز مشکل با پشتیبانی تماس بگیرید</p>
        </div>
      </div>
    </div>
  );
}
