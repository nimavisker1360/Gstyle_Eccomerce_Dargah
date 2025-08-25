"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, RefreshCw } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CheckoutFooter from "./checkout-footer";
import useCartStore from "@/hooks/use-cart-store";
import ProductPrice from "@/components/shared/product/product-price";
import { APP_NAME } from "@/lib/constants";
import Link from "next/link";
import React from "react";

// Custom hook to ensure cart is properly hydrated
const useCartHydration = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const cart = useCartStore((state) => state.cart);
  const replaceCart = useCartStore((state) => state.replaceCart);

  useEffect(() => {
    // Wait for next tick to ensure Zustand has hydrated
    const timer = setTimeout(() => {
      setIsHydrated(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Force refresh cart from localStorage
  const forceRefreshCart = () => {
    try {
      if (typeof window !== "undefined") {
        const storedCart = localStorage.getItem("cart-store");
        if (storedCart) {
          const parsedCart = JSON.parse(storedCart);
          if (parsedCart.state && parsedCart.state.cart) {
            replaceCart(parsedCart.state.cart);
            setRetryCount((prev) => prev + 1);
          }
        }
      }
    } catch (error) {
      console.error("Error refreshing cart:", error);
    }
  };

  return { isHydrated, cart, forceRefreshCart, retryCount };
};

const CheckoutForm = () => {
  const router = useRouter();
  const { isHydrated, cart, forceRefreshCart, retryCount } = useCartHydration();
  const { items, itemsPrice, shippingPrice, taxPrice, totalPrice } = cart;
  const setShippingAddress = useCartStore((state) => state.setShippingAddress);

  // Calculate total directly from items
  const computedTotal =
    items?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;

  const handleGoToZarinPal = () => {
    console.log("Checkout - Items:", items);
    console.log("Checkout - Computed Total:", computedTotal);
    console.log("Checkout - Store Items Price:", cart.itemsPrice);
    router.push("/checkout/zarinpal");
  };

  // Show loading state while hydrating
  if (!isHydrated) {
    return (
      <main dir="rtl" className="max-w-4xl mx-auto text-right highlight-link">
        <div className="mb-6 flex justify-end">
          <Button
            onClick={() => router.back()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white border-0"
          >
            <ArrowLeft className="w-4 h-4" />
            بازگشت
          </Button>
        </div>
        <div className="text-center py-20">
          <div className="text-lg text-gray-600">
            در حال بارگذاری سبد خرید...
          </div>
        </div>
      </main>
    );
  }

  // Show empty cart message if no items
  if (!items || items.length === 0) {
    return (
      <main dir="rtl" className="max-w-4xl mx-auto text-right highlight-link">
        <div className="mb-6 flex justify-end">
          <Button
            onClick={() => router.back()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white border-0"
          >
            <ArrowLeft className="w-4 h-4" />
            بازگشت
          </Button>
        </div>
        <div className="text-center py-20">
          <div className="text-2xl font-bold text-gray-800 mb-4">
            سبد خرید شما خالی است
          </div>
          <div className="text-gray-600 mb-6">
            لطفاً ابتدا محصولی به سبد خرید اضافه کنید
          </div>
          <div className="space-y-4">
            <Button
              onClick={() => router.push("/")}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              بازگشت به صفحه اصلی
            </Button>
            <div>
              <Button
                onClick={forceRefreshCart}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                تلاش مجدد برای بارگذاری سبد خرید
              </Button>
              {retryCount > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  تلاش {retryCount} انجام شد
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    );
  }

  const CheckoutSummary = () => (
    <Card>
      <CardContent className="p-6">
        <div className="text-xl text-sky-500 mb-4">خلاصه سفارش</div>

        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sky-500">محصولات:</span>
            <span className="text-emerald-700">
              {computedTotal.toLocaleString()} ریال
            </span>
          </div>
          <div className="border-t pt-3 mt-4">
            <div className="flex justify-between text-lg text-emerald-700">
              <span className="font-semibold">جمع کل سفارش:</span>
              <span className="font-bold">
                {computedTotal.toLocaleString()} ریال
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <main dir="rtl" className="max-w-4xl mx-auto text-right highlight-link">
      {/* Back Button */}
      <div className="mb-6 flex justify-end">
        <Button
          onClick={() => router.back()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white border-0"
        >
          <ArrowLeft className="w-4 h-4" />
          بازگشت
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Order Summary - Left Side */}
        <div className="md:col-span-2">
          <CheckoutSummary />

          {/* ZarinPal Payment Button */}
          <div className="mt-6">
            <Button
              onClick={handleGoToZarinPal}
              className="w-full rounded-lg font-bold bg-green-600 hover:bg-green-700 text-white border-0 py-4 text-lg"
            >
              پرداخت از زرین پال
            </Button>
            <p className="text-xs text-center py-3 text-gray-600">
              با کلیک روی دکمه بالا، شما با{" "}
              <Link
                href="/page/privacy-policy"
                className="text-blue-600 hover:underline"
              >
                حریم خصوصی
              </Link>{" "}
              و
              <Link
                href="/page/conditions-of-use"
                className="text-blue-600 hover:underline"
              >
                {" "}
                شرایط استفاده
              </Link>{" "}
              {APP_NAME} موافقت می‌کنید.
            </p>
          </div>
        </div>

        {/* Order Summary - Right Side (Desktop) */}
        <div className="hidden md:block">
          <CheckoutSummary />
        </div>
      </div>

      <CheckoutFooter />
    </main>
  );
};

export default CheckoutForm;
