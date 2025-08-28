"use client";

import SearchProductsLayout from "@/components/shared/product/search-products-layout";
import { Suspense } from "react";

export default function TestSearchPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8">تست لایوت جستجو</h1>
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">در حال بارگذاری...</p>
            </div>
          </div>
        }
      >
        <SearchProductsLayout
          telegramSupport="@gstyle_support"
          allowEmpty={true}
          hideSearchBar={false}
          initialQuery="لباس زنانه"
        />
      </Suspense>
    </div>
  );
}
