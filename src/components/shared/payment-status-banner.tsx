"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, XCircle, AlertCircle, Info } from "lucide-react";
import useCartStore from "@/hooks/use-cart-store";

export default function PaymentStatusBanner() {
  const searchParams = useSearchParams();
  const [showBanner, setShowBanner] = useState(false);
  const [bannerData, setBannerData] = useState<{
    type: "success" | "error" | "failed" | "cancelled" | "verification_failed";
    message: string;
    details?: any;
  } | null>(null);

  const { clearCart } = useCartStore();
  const clearedRef = useRef(false);

  useEffect(() => {
    const payment = searchParams.get("payment");
    const refId = searchParams.get("refId");
    const amount = searchParams.get("amount");
    const orderId = searchParams.get("orderId");
    const invoiceId = searchParams.get("invoiceId");
    const error = searchParams.get("error");

    if (payment) {
      let type: any = payment;
      let message = "";
      let details: any = {};

      switch (payment) {
        case "success":
          message = "پرداخت شما با موفقیت انجام شد!";
          details = { refId, amount, orderId, invoiceId };
          // Clear cart once after successful payment
          if (!clearedRef.current) {
            try {
              clearCart();
              // Clear server-side cart if logged in (ignore failures)
              fetch("/api/cart", { method: "DELETE" }).catch(() => {});
              // Ensure persisted cart is wiped so badge does not rehydrate old state
              if (typeof window !== "undefined") {
                try {
                  localStorage.removeItem("cart-store");
                } catch {}
              }
            } catch {}
            clearedRef.current = true;
          }
          break;
        case "failed":
          message = "پرداخت ناموفق بود";
          details = { amount };
          break;
        case "cancelled":
          message = "پرداخت توسط شما لغو شد";
          details = {};
          break;
        case "verification_failed":
          message = "خطا در تایید پرداخت";
          details = { error, amount };
          break;
        case "error":
          message = "خطا در سیستم پرداخت";
          details = { error };
          break;
        default:
          message = "وضعیت پرداخت نامشخص";
          details = { payment };
      }

      setBannerData({ type, message, details });
      setShowBanner(true);

      // Auto-hide after 10 seconds
      const hideTimer = setTimeout(() => {
        setShowBanner(false);
      }, 10000);

      // Remove query params from URL so the banner doesn't re-appear on refresh/back
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete("payment");
        url.searchParams.delete("authority");
        url.searchParams.delete("refId");
        url.searchParams.delete("amount");
        url.searchParams.delete("orderId");
        url.searchParams.delete("invoiceId");
        url.searchParams.delete("error");
        window.history.replaceState(
          null,
          "",
          url.pathname + (url.search ? `?${url.searchParams.toString()}` : "")
        );
      } catch {}

      return () => clearTimeout(hideTimer);
    }
  }, [searchParams, clearCart]);

  if (!showBanner || !bannerData) return null;

  const getIcon = () => {
    switch (bannerData.type) {
      case "success":
        return <CheckCircle className="w-7 h-7 text-green-600" />;
      case "failed":
      case "cancelled":
        return <XCircle className="w-7 h-7 text-red-600" />;
      case "verification_failed":
        return <AlertCircle className="w-7 h-7 text-yellow-600" />;
      default:
        return <Info className="w-7 h-7 text-blue-600" />;
    }
  };

  const getWrapperStyle = () => {
    switch (bannerData.type) {
      case "success":
        return "from-emerald-50 to-green-50 border-emerald-200";
      case "failed":
      case "cancelled":
        return "from-rose-50 to-red-50 border-rose-200";
      case "verification_failed":
        return "from-amber-50 to-yellow-50 border-amber-200";
      default:
        return "from-sky-50 to-blue-50 border-sky-200";
    }
  };

  const prettyError = (raw?: string) => {
    if (!raw) return undefined;
    switch (raw) {
      case "401":
        return "عدم احراز هویت/کد مرچنت یا IP نادرست";
      case "400":
        return "درخواست نامعتبر یا داده‌های ناقص";
      case "403":
        return "دسترسی مجاز نیست";
      case "500":
        return "خطای داخلی سرور";
      default:
        return raw;
    }
  };

  const details = bannerData.details || {};
  const mappedError = prettyError(details.error);

  const titleColorClass =
    bannerData.type === "success"
      ? "text-green-700"
      : bannerData.type === "failed" || bannerData.type === "cancelled"
        ? "text-red-700"
        : bannerData.type === "verification_failed"
          ? "text-yellow-700"
          : "text-blue-700";

  return (
    <div
      className={`fixed top-5 left-4 right-4 z-50 mx-auto max-w-xl animate-in fade-in slide-in-from-top-4 duration-300`}
    >
      <div
        className={`bg-gradient-to-br ${getWrapperStyle()} border shadow-2xl rounded-2xl ring-1 ring-black/5 backdrop-blur px-4 py-4 sm:px-6 sm:py-5`}
      >
        <div className="flex items-start gap-3">
          <div className="shrink-0">{getIcon()}</div>
          <div className="flex-1">
            <h3
              className={`font-extrabold text-lg sm:text-xl tracking-tight mb-1 ${titleColorClass}`}
            >
              {bannerData.message}
            </h3>

            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              {details.refId && (
                <div className="bg-white/60 rounded-lg px-3 py-2 flex items-center justify-between">
                  <span className="text-gray-700">کد پیگیری:</span>
                  <span className="font-bold text-gray-900 ltr:font-mono">
                    {details.refId}
                  </span>
                </div>
              )}
              {details.amount && (
                <div className="bg-white/60 rounded-lg px-3 py-2 flex items-center justify-between">
                  <span className="text-gray-700">مبلغ:</span>
                  <span className="font-bold text-gray-900">
                    {details.amount} تومان
                  </span>
                </div>
              )}
              {details.orderId && (
                <div className="bg-white/60 rounded-lg px-3 py-2 flex items-center justify-between">
                  <span className="text-gray-700">شماره سفارش:</span>
                  <span className="font-bold text-gray-900">
                    {details.orderId}
                  </span>
                </div>
              )}
              {details.invoiceId && (
                <div className="bg-white/60 rounded-lg px-3 py-2 flex items-center justify-between">
                  <span className="text-gray-700">شماره فاکتور:</span>
                  <span className="font-bold text-gray-900">
                    {details.invoiceId}
                  </span>
                </div>
              )}
              {mappedError && (
                <div className="bg-white/60 rounded-lg px-3 py-2 flex items-center justify-between">
                  <span className="text-gray-700">خطا:</span>
                  <span className="font-bold text-gray-900">{mappedError}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
