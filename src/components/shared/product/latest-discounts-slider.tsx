"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

// Carousel imports removed - now using static grid
import { Button } from "@/components/ui/button";
import DiscountProductCard from "./discount-product-card";

interface ShoppingProduct {
  id: string;
  title: string;
  originalTitle?: string;
  price: number;
  originalPrice?: number | null;
  currency: string;
  image: string;
  description: string;
  originalDescription?: string;
  link?: string;
  googleShoppingLink?: string;
  source: string;
  rating: number;
  reviews: number;
  delivery: string;
}

interface LatestDiscountsSliderProps {
  // No props needed - will fetch data internally
}

export default function LatestDiscountsSlider({}: LatestDiscountsSliderProps) {
  const [products, setProducts] = useState<ShoppingProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch discount products from Google Shopping
  useEffect(() => {
    const fetchDiscountProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("🔍 Fetching discount products from Google Shopping...");

        // Check client-side cache first
        const cacheKey = "discountproducts_home_8";
        const cacheExpiry = 10 * 60 * 1000; // 10 minutes
        const cached = localStorage.getItem(cacheKey);
        const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);

        if (cached && cacheTimestamp) {
          const now = Date.now();
          const timestamp = parseInt(cacheTimestamp);

          if (now - timestamp < cacheExpiry) {
            console.log(
              "✅ Using cached discount products for slider from localStorage"
            );
            const cachedProducts = JSON.parse(cached) as ShoppingProduct[];
            const underTwo = cachedProducts.filter(
              (p) =>
                typeof p.price === "number" && p.price > 0 && p.price <= 2000
            );
            // Shuffle cached products for variety
            const shuffledProducts = [...underTwo].sort(
              () => Math.random() - 0.5
            );
            setProducts(shuffledProducts);
            setLoading(false);
            return;
          }
        }

        // Fetch from API if no valid cache
        const response = await fetch(`/api/shopping/discounts`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.products && Array.isArray(data.products)) {
          const underTwo = (data.products as ShoppingProduct[]).filter(
            (p) => typeof p.price === "number" && p.price > 0 && p.price <= 2000
          );
          // Shuffle products for additional randomization
          const shuffledProducts = [...underTwo].sort(
            () => Math.random() - 0.5
          );
          setProducts(shuffledProducts);

          // Cache the results
          localStorage.setItem(cacheKey, JSON.stringify(underTwo));
          localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());

          console.log(
            `✅ Loaded ${shuffledProducts.length} discount products (shuffled)`
          );
        } else {
          console.warn("⚠️ No products found in response");
          setProducts([]);
        }
      } catch (err) {
        console.error("❌ Error fetching discount products:", err);
        setError("خطا در بارگذاری محصولات تخفیف‌دار");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscountProducts();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="w-full bg-white">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl text-green-600 text-left hidden">
            محصولات زیر ۶ میلیون تومان
          </h2>
        </div>

        {/* Beautiful Loading Animation */}
        <div className="flex flex-col items-center justify-center py-8 mb-6">
          <div className="relative">
            {/* Main loading spinner */}
            <div className="w-12 h-12 border-4 border-green-100 border-t-4 border-t-green-500 rounded-full animate-spin"></div>

            {/* Inner spinner */}
            <div
              className="absolute top-1.5 left-1.5 w-9 h-9 border-4 border-blue-100 border-t-4 border-t-blue-500 rounded-full animate-spin"
              style={{
                animationDirection: "reverse",
                animationDuration: "1.5s",
              }}
            ></div>
          </div>

          {/* Loading text with typewriter effect */}
          <div className="mt-4 text-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              جستجوی بهترین تخفیف‌ها...
            </h3>
            <div className="flex justify-center items-center space-x-1 rtl:space-x-reverse">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce"></div>
              <div
                className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
            {/* <p className="text-xs text-gray-500 mt-2">
              از گوگل شاپینگ در حال پیدا کردن قیمت‌های عالی...
            </p> */}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full bg-white">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-800 text-right">
            محصولات زیر ۶ میلیون تومان
          </h2>
        </div>
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            تلاش مجدد
          </Button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!products || products.length === 0) {
    return (
      <div className="w-full bg-white">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-800 text-right">
            محصولات زیر ۶ میلیون تومان
          </h2>
        </div>
        <div className="text-center py-12">
          <p className="text-gray-500">هیچ محصول تخفیف‌داری یافت نشد</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Box container to keep header and grid inside */}
      <div className="border-2 border-gray-300 rounded-xl p-4 md:p-6 bg-white/50 shadow-md">
        {/* Section Header aligned right with green bold title */}
        <div className="relative mb-2">
          <div className="mb-2 rounded-lg border border-blue-200 bg-blue-50 px-2 py-2 sm:px-3">
            <p
              dir="ltr"
              className="text-[11px] sm:text-xs md:text-sm  text-blue-600 text-right flex flex-nowrap items-center justify-end gap-1 sm:gap-2 leading-6 whitespace-nowrap overflow-hidden"
            >
              کلیک کنید تا محصول به سبد خرید انتقال داده بشه
              <span
                dir="rtl"
                className="inline-flex items-center gap-1 whitespace-nowrap "
              >
                روی
                <span className="inline-flex items-center justify-center w-5 h-5 md:w-6 md:h-6 rounded-full bg-green-500 text-white">
                  +
                </span>
              </span>
              برای سفارش محصول
            </p>
          </div>
          <div className="flex items-center justify-end">
            <h2 className="text-lg md:text-xl font-extrabold text-green-600 text-right">
              محصولات زیر ۶ میلیون تومان
            </h2>
            <div className="absolute left-0">
              <Link href="/search?discount=true">
                <Button
                  variant="outline"
                  className="flex items-center gap-2 text-green-600 border-green-600 hover:bg-green-50"
                >
                  بیشتر ببینید
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Static Grid with same breakpoints as "مشاهده بیشتر" صفحه */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-3 sm:gap-4">
          {products.slice(0, 8).map((product, index) => (
            <div key={`${product.id}-${index}`}>
              <DiscountProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
