"use client";

import { Suspense } from "react";
import SearchProductsLayout from "@/components/shared/product/search-products-layout";
import AllProductsView from "@/components/shared/product/all-products-view";
import { HomeBanner } from "@/components/shared/home/home-banner";
import DiscountProductsGrid from "@/components/shared/product/discount-products-grid";
import SearchSidebar from "@/components/shared/product/search-sidebar";
import MobileFilterButton from "@/components/shared/product/mobile-filter-button";

interface SearchPageProps {
  searchParams: {
    q?: string;
    discount?: string;
    view?: string;
    category?: string;
    brand?: string;
    type?: string;
  };
}

function SearchResultsContent({
  query,
  view,
  brand,
  type,
}: {
  query: string;
  view?: string;
  brand?: string;
  type?: string;
}) {
  const telegramSupport = process.env.TELEGRAM_SUPPORT || "@gstyle_support";

  const handleFilterChange = (filters: any) => {
    console.log("Filters changed:", filters);
    // Handle filter changes here
  };

  // اگر view=all باشد، از کامپوننت AllProductsView استفاده کن
  if (view === "all") {
    return (
      <div className="flex flex-col lg:flex-row">
        {/* Sidebar - Hidden on mobile, visible on desktop */}
        <div className="hidden lg:block">
          <SearchSidebar
            currentQuery={query}
            totalProducts={0} // This would come from API
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 px-4">
          {/* Mobile Filter Button */}
          <MobileFilterButton
            currentQuery={query}
            totalProducts={0}
            onFilterChange={handleFilterChange}
          />

          <AllProductsView
            telegramSupport={telegramSupport}
            initialQuery={query}
            hideSearchBar={true}
            brandFilter={brand}
            typeFilter={type}
          />
        </div>
      </div>
    );
  }

  // در غیر این صورت، از کامپوننت معمولی استفاده کن
  return (
    <div className="flex flex-col lg:flex-row">
      {/* Sidebar - Hidden on mobile, visible on desktop */}
      <div className="hidden lg:block">
        <SearchSidebar
          currentQuery={query}
          totalProducts={0} // This would come from API
          onFilterChange={handleFilterChange}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4">
        {/* Mobile Filter Button */}
        <MobileFilterButton
          currentQuery={query}
          totalProducts={0}
          onFilterChange={handleFilterChange}
        />

        <SearchProductsLayout
          telegramSupport={telegramSupport}
          initialQuery={query}
          hideSearchBar={true}
          brandFilter={brand}
          typeFilter={type}
        />
      </div>
    </div>
  );
}

function DiscountProductsContent({ searchQuery }: { searchQuery?: string }) {
  const telegramSupport = process.env.TELEGRAM_SUPPORT || "@gstyle_support";

  return (
    <div className="flex flex-col lg:flex-row">
      {/* Sidebar - Hidden on mobile, visible on desktop */}
      <div className="hidden lg:block">
        <SearchSidebar
          currentQuery={searchQuery}
          totalProducts={0}
          onFilterChange={() => {}}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4">
        {/* Mobile Filter Button */}
        <MobileFilterButton
          currentQuery={searchQuery}
          totalProducts={0}
          onFilterChange={() => {}}
        />

        <div className="mb-8">
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 shadow-lg border border-green-400">
            <div className="text-white text-center">
              <h2 className="text-lg font-bold mb-2">
                محصولات زیر ۶ میلیون تومان
              </h2>
              <p className="text-green-100">
                بهترین پیشنهادات و تخفیف‌های ویژه برای شما
              </p>
            </div>
          </div>
        </div>

        <DiscountProductsGrid
          telegramSupport={telegramSupport}
          searchQuery={searchQuery}
        />

        {/* Removed bottom search section (see more page cleanup) */}
      </div>
    </div>
  );
}

function SearchResultsSkeleton() {
  return (
    <div className="w-full bg-white">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl text-green-600 text-left hidden">
          نتایج جستجو
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
            جستجوی بهترین محصولات...
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
          <p className="text-xs text-gray-500 mt-2">
            از گوگل شاپینگ در حال پیدا کردن محصولات...
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || searchParams.category;
  const showDiscounts = searchParams.discount === "true";
  const view = searchParams.view;
  const brand = searchParams.brand;
  const type = searchParams.type;

  // Show discount products if discount parameter is true (even if query exists)
  if (showDiscounts) {
    return (
      <>
        <HomeBanner />
        <div className="py-8">
          <Suspense fallback={<SearchResultsSkeleton />}>
            <DiscountProductsContent searchQuery={query} />
          </Suspense>
        </div>
      </>
    );
  }

  // Show regular search results if query exists or if Turkish brand is selected
  if (!query && !brand) {
    return null;
  }

  return (
    <>
      <HomeBanner />
      <div className="py-8">
        <Suspense fallback={<SearchResultsSkeleton />}>
          <SearchResultsContent
            query={query || brand || ""}
            view={view}
            brand={brand}
            type={type}
          />
        </Suspense>
      </div>
    </>
  );
}
