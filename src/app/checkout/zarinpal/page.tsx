"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ZarinPalCheckout from "@/components/shared/ZarinPalCheckout";

export default function ZarinPalCheckoutPage() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const authority = searchParams.get("Authority");
    const status = searchParams.get("Status");
    const amount = searchParams.get("amount");

    if (authority && status) {
      const verifyUrl = `/api/payment/zarinpal/verify-payment?Authority=${encodeURIComponent(
        authority
      )}&Status=${encodeURIComponent(status)}${amount ? `&amount=${encodeURIComponent(amount)}` : ""}`;
      window.location.href = verifyUrl;
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          پرداخت از طریق درگاه زرین‌پال
        </h1>

        <ZarinPalCheckout />
      </div>
    </div>
  );
}
