"use client";

import { useSearchParams } from "next/navigation";
import ZarinPalCheckout from "@/components/shared/ZarinPalCheckout";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

export default function ZarinPalCheckoutPage() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const authority = searchParams.get("authority");
  const refId = searchParams.get("refId");
  const amount = searchParams.get("amount");
  const error = searchParams.get("error");

  const renderStatusMessage = () => {
    if (status === "success") {
      return (
        <div className="max-w-md mx-auto mb-8 p-6 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600 ml-3" />
            <div>
              <h3 className="text-lg font-semibold text-green-800">
                پرداخت موفق
              </h3>
              <p className="text-green-700 mt-1">
                پرداخت شما با موفقیت انجام شد
              </p>
            </div>
          </div>
          <div className="mt-4 space-y-2 text-sm text-green-700">
            <p>
              <strong>کد پیگیری:</strong> {refId}
            </p>
            <p>
              <strong>Authority:</strong> {authority}
            </p>
            <p>
              <strong>مبلغ:</strong> {amount} تومان
            </p>
          </div>
        </div>
      );
    }

    if (status === "failed") {
      return (
        <div className="max-w-md mx-auto mb-8 p-6 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <XCircle className="w-8 h-8 text-red-600 ml-3" />
            <div>
              <h3 className="text-lg font-semibold text-red-800">
                پرداخت ناموفق
              </h3>
              <p className="text-green-700 mt-1">پرداخت توسط کاربر لغو شد</p>
            </div>
          </div>
        </div>
      );
    }

    if (status === "verification_failed") {
      return (
        <div className="max-w-md mx-auto mb-8 p-6 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <XCircle className="w-8 h-8 text-red-600 ml-3" />
            <div>
              <h3 className="text-lg font-semibold text-red-800">
                خطا در تایید پرداخت
              </h3>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      );
    }

    if (status === "error") {
      return (
        <div className="max-w-md mx-auto mb-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-8 h-8 text-yellow-600 ml-3" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-800">
                خطا در سیستم
              </h3>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          پرداخت از طریق درگاه زرین‌پال
        </h1>

        {renderStatusMessage()}

        <ZarinPalCheckout initialAmount={amount ? Number(amount) : undefined} />
      </div>
    </div>
  );
}
