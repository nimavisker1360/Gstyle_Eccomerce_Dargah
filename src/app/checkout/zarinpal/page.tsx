"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ZarinpalPayment from "@/components/shared/payment/zarinpal-payment";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import useCartStore from "@/hooks/use-cart-store";

export default function ZarinpalCheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orderId, setOrderId] = useState("");
  const [isHydrated, setIsHydrated] = useState(false);

  // Get cart data from store with safe defaults
  const cart = useCartStore((state) => state.cart);
  const {
    items = [],
    itemsPrice = 0,
    shippingPrice = 0,
    taxPrice = 0,
    totalPrice = 0,
  } = cart || {};

  // Ensure cart is hydrated
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user) {
      router.push("/sign-in?callbackUrl=/checkout/zarinpal");
      return;
    }

    setOrderId(
      `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    );
  }, [session, status, router]);

  // Calculate total directly from items
  const totalAmount =
    items?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;

  // Debug logging
  console.log("ZarinPal - Items:", items);
  console.log("ZarinPal - Total Amount:", totalAmount);

  // Early return if not hydrated yet
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null; // Will redirect in useEffect
  }

  if (!orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">در حال آماده‌سازی...</p>
        </div>
      </div>
    );
  }

  // Check if cart is empty
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex items-center mb-8">
            <Link
              href="/checkout"
              className="flex-items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 ml-2" />
              بازگشت به صفحه پرداخت
            </Link>
          </div>
          <div className="text-center py-20">
            <div className="text-2xl font-bold text-gray-800 mb-4">
              سبد خرید شما خالی است
            </div>
            <div className="text-gray-600 mb-6">
              لطفاً ابتدا محصولی به سبد خرید اضافه کنید
            </div>
            <Link href="/checkout">
              <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg">
                بازگشت به صفحه پرداخت
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
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

        {/* Zarinpal Payment Component */}
        <ZarinpalPayment
          totalAmount={totalAmount} // Pass the actual cart total
          orderId={orderId}
        />

        {/* Additional Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>پرداخت شما از طریق درگاه امن زرین‌پال انجام می‌شود</p>
          <p className="mt-1">در صورت بروز مشکل با پشتیبانی تماس بگیرید</p>
        </div>
      </div>
    </div>
  );
}
