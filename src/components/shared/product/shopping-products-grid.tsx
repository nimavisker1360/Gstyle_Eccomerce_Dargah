"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";
import ShoppingProductCard from "./shopping-product-card";

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

interface ShoppingProductsGridProps {
  telegramSupport?: string;
  initialQuery?: string;
  hideSearchBar?: boolean;
  allowEmpty?: boolean;
}

export default function ShoppingProductsGrid({
  telegramSupport,
  initialQuery,
  hideSearchBar = false,
  allowEmpty = false,
}: ShoppingProductsGridProps) {
  const [products, setProducts] = useState<ShoppingProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSearch, setCurrentSearch] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    setLoading(true);
    setError("");
    setMessage("");
    setCurrentSearch(query);

    try {
      console.log(`🔍 Searching for: "${query}"`);

      const response = await fetch(
        `/api/shopping?q=${encodeURIComponent(query)}`
      );
      const data = await response.json();

      console.log(`📊 Search response:`, {
        status: response.status,
        productsCount: data.products?.length || 0,
        message: data.message,
        error: data.error,
      });

      if (!response.ok) {
        throw new Error(data.error || "خطا در دریافت اطلاعات");
      }

      setProducts(data.products || []);
      setMessage(data.message || "");

      // Log search results for debugging
      if (data.products && data.products.length > 0) {
        console.log(`✅ Found ${data.products.length} products`);
        data.products.forEach((product: ShoppingProduct, index: number) => {
          console.log(
            `📦 Product ${index + 1}: ${product.title} - ${product.price} ${product.currency}`
          );
        });
      } else {
        console.log(`❌ No products found for query: "${query}"`);
      }
    } catch (err) {
      console.error("❌ Search error:", err);
      setError("خطا در دریافت محصولات. لطفاً دوباره تلاش کنید.");
      setProducts([]);
      setMessage("");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };

  // جستجوی اولیه - فقط اگر query وجود داشته باشد
  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      console.log(`🚀 Initial search for: "${initialQuery}"`);
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  // اگر هیچ query اولیه‌ای وجود نداشته باشد و allowEmpty false باشد، هیچ محصولی نمایش نده
  if ((!initialQuery || !initialQuery.trim()) && !allowEmpty) {
    return null;
  }

  // اگر allowEmpty true باشد، همیشه کامپوننت را نمایش بده
  if (allowEmpty) {
    return (
      <div className="w-full">
        {/* نوار جستجو - فقط اگر پنهان نباشد */}
        {!hideSearchBar && (
          <div className="mb-6">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                type="text"
                placeholder="جستجوی محصولات از ترکیه..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
                dir="rtl"
              />
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </form>
          </div>
        )}

        {/* نتایج جستجو - فقط اگر جستجویی انجام شده باشد و در حال لودینگ نباشد */}
        {currentSearch && !loading && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 shadow-sm border border-green-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                    نتایج جستجو برای:
                  </h2>
                </div>
                <div className="flex items-center">
                  <span className="text-lg font-semibold text-gray-800 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                    &quot;{currentSearch}&quot;
                  </span>
                </div>
              </div>
              <div className="mt-4 h-1 bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 rounded-full"></div>
            </div>
          </div>
        )}

        {/* پیام خطا */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* پیام اطلاعات */}
        {message && !error && (
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700">
            {message}
          </div>
        )}

        {/* لودینگ */}
        {loading && (
          <div className="w-full bg-white">
            {/* Simple Loading Header */}
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-700 mb-4">
                  جستجوی بهترین محصولات
                </h3>
                <div className="flex justify-center items-center space-x-1 rtl:space-x-reverse mb-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-green-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-green-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500">
                  لطفا صبر کنید، داریم بهترین محصولات رو پیدا می‌کنیم
                </p>
              </div>
            </div>
          </div>
        )}

        {/* گرید محصولات */}
        {!loading && products.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
            {products.map((product) => (
              <ShoppingProductCard
                key={product.id}
                product={product}
                telegramSupport={telegramSupport || "@gstyle_support"}
                isSearchResult={true}
              />
            ))}
          </div>
        )}

        {/* پیام عدم وجود نتیجه */}
        {!loading && products.length === 0 && currentSearch && !error && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              هیچ محصولی برای &quot;{currentSearch}&quot; یافت نشد.
            </p>
            <p className="text-gray-400 text-sm mt-2">
              لطفاً کلمات کلیدی دیگری امتحان کنید.
            </p>
            <div className="mt-4 text-sm text-gray-400">
              <p>پیشنهادات جستجو:</p>
              <ul className="mt-2 space-y-1">
                <li>• لباس زنانه</li>
                <li>• کفش ورزشی</li>
                <li>• لوازم آرایشی</li>
                <li>• ساعت مچی</li>
                <li>• کیف دستی</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* نوار جستجو - فقط اگر پنهان نباشد */}
      {!hideSearchBar && (
        <div className="mb-6">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              type="text"
              placeholder="جستجوی محصولات از ترکیه..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
              dir="rtl"
            />
            <Button type="submit" disabled={loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </form>
        </div>
      )}

      {/* نتایج جستجو - فقط اگر جستجویی انجام شده باشد و در حال لودینگ نباشد */}
      {currentSearch && !loading && (
        <div className="mb-8">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 shadow-sm border border-green-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  نتایج جستجو برای:
                </h2>
              </div>
              <div className="flex items-center ">
                <span className="text-lg font-semibold text-white bg-green-600 px-4 py-2 rounded-lg shadow-sm border border-green-500">
                  {currentSearch}
                </span>
              </div>
            </div>
            <div className="mt-4 h-1 bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 rounded-full"></div>
          </div>
        </div>
      )}

      {/* پیام خطا */}
      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* پیام اطلاعات */}
      {message && !error && (
        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700">
          {message}
        </div>
      )}

      {/* لودینگ */}
      {loading && (
        <div className="w-full bg-white">
          {/* Simple Loading Header */}
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-700 mb-4">
                جستجوی بهترین محصولات
              </h3>
              <div className="flex justify-center items-center space-x-1 rtl:space-x-reverse mb-4">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-green-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-green-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
              <p className="text-sm text-gray-500">
                لطفا صبر کنید، داریم بهترین محصولات رو پیدا می‌کنیم
              </p>
            </div>
          </div>
        </div>
      )}

      {/* گرید محصولات */}
      {!loading && products.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
          {products.map((product) => (
            <ShoppingProductCard
              key={product.id}
              product={product}
              telegramSupport={telegramSupport || "@gstyle_support"}
              isSearchResult={true}
            />
          ))}
        </div>
      )}

      {/* پیام عدم وجود نتیجه */}
      {!loading && products.length === 0 && currentSearch && !error && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            هیچ محصولی برای &quot;{currentSearch}&quot; یافت نشد.
          </p>
          <p className="text-gray-400 text-sm mt-2">
            لطفاً کلمات کلیدی دیگری امتحان کنید.
          </p>
          <div className="mt-4 text-sm text-gray-400">
            <p>پیشنهادات جستجو:</p>
            <ul className="mt-2 space-y-1">
              <li>• لباس زنانه</li>
              <li>• کفش ورزشی</li>
              <li>• لوازم آرایشی</li>
              <li>• ساعت مچی</li>
              <li>• کیف دستی</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
