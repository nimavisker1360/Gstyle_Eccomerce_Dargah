"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

// Default categories as fallback
const defaultFashionCategories = {
  زنانه: [
    "پیراهن",
    "تاپ و بادی",
    "شلوار جین",
    "شومیز",
    "تی شرت",
    "شلوارک و اسکورت",
    "دامن",
    "ست",
    "ژاکت و پلیور",
    "بافت",
    "ژیله",
    "سویشرت",
    "کت و جکت",
    "کفش",
    "کیف",
    "مایو",
    "اکسسوری",
    "لباس زیر",
    "پیژاما",
  ],
  مردانه: [
    "شلوارک",
    "شلوار",
    "پیراهن",
    "تی شرت",
    "پولوشرت",
    "جین",
    "ست",
    "کت و شلوار",
    "پلیور",
    "مایو",
    "هودی و سویشرت",
    "لین",
    "بلیزر",
    "پالتو",
    "کاپشن و بارانی",
    "کفش",
    "کیف",
    "اکسسوری",
  ],
  "بچه گانه": [
    "دختر 1.5 تا 6 سال",
    "دختر 6 تا 14 سال",
    "پسر 1.5 تا 6 سال",
    "پسر 6 تا 14 سال",
    "نوزاد 0 تا 18 ماه",
    "اسباب بازی",
  ],
};

interface FashionCategory {
  [key: string]: string[];
}

export default function FashionDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [categories, setCategories] = useState<FashionCategory>(
    defaultFashionCategories
  );
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Cache key for fashion categories
  const CACHE_KEY = "fashion_categories_cache";
  const CACHE_EXPIRY = 30 * 60 * 1000; // 30 minutes

  // Load categories from cache or API
  const loadCategories = useCallback(async () => {
    try {
      // Check cache first
      const cached = localStorage.getItem(CACHE_KEY);
      const cacheTimestamp = localStorage.getItem(`${CACHE_KEY}_timestamp`);

      if (cached && cacheTimestamp) {
        const now = Date.now();
        const timestamp = parseInt(cacheTimestamp);

        if (now - timestamp < CACHE_EXPIRY) {
          console.log("✅ Using cached fashion categories");
          const cachedData = JSON.parse(cached);
          setCategories(cachedData);
          return;
        }
      }

      // If no cache or expired, fetch from API
      setIsLoading(true);
      console.log("🔄 Fetching fashion categories from API...");

      const response = await fetch("/api/shopping/categories?category=fashion");

      if (response.ok) {
        const data = await response.json();

        // Extract categories from API response or use default
        const apiCategories = data.categories || defaultFashionCategories;

        // Cache the results
        localStorage.setItem(CACHE_KEY, JSON.stringify(apiCategories));
        localStorage.setItem(`${CACHE_KEY}_timestamp`, Date.now().toString());

        console.log("💾 Cached fashion categories");
        setCategories(apiCategories);
      } else {
        console.log("⚠️ Using default fashion categories");
        setCategories(defaultFashionCategories);
      }
    } catch (error) {
      console.error("❌ Error loading fashion categories:", error);
      setCategories(defaultFashionCategories);
    } finally {
      setIsLoading(false);
    }
  }, [CACHE_EXPIRY]);

  // Load categories on component mount
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleMouseEnter = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    const id = setTimeout(() => {
      setIsOpen(false);
    }, 150); // 150ms تاخیر - حساسیت بالا
    setTimeoutId(id);
  };

  const handleCategoryClick = (category: string, subCategory: string) => {
    // Navigate to search page with category filter
    const searchQuery = `${category} ${subCategory}`;
    router.push(
      `/search?q=${encodeURIComponent(searchQuery)}&category=fashion`
    );
    setIsOpen(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Main Fashion Button */}
      <div className="header-button text-blue-700 hover:text-green-600 font-medium transition-colors flex items-center gap-1">
        مد و پوشاک
        <ChevronDown className="w-4 h-4" />
      </div>

      {/* Dropdown Menu */}
      <div
        className={`absolute top-full left-0 mt-1 z-50 p-4 transition-all duration-300 ease-out ${
          isOpen
            ? "opacity-100 visible transform translate-y-0 scale-100"
            : "opacity-0 invisible transform -translate-y-2 scale-95 pointer-events-none"
        }`}
      >
        <div className="bg-white border border-gray-200 rounded-lg shadow-xl w-[900px] p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <span className="mr-3 text-sm text-gray-600">
                در حال بارگذاری...
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-6">
              {Object.entries(categories).map(
                ([mainCategory, subCategories]) => (
                  <div key={mainCategory} className="space-y-2">
                    <h3
                      className="font-bold text-base text-blue-700 border-b border-green-300 pb-1 mb-2"
                      style={{ direction: "rtl", textAlign: "right" }}
                    >
                      {mainCategory}
                    </h3>
                    <div
                      className="grid grid-cols-2 gap-1"
                      style={{ direction: "rtl" }}
                    >
                      {subCategories.map((item) => (
                        <span
                          key={item}
                          className="text-green-700 font-bold hover:text-blue-700 text-xs py-1 px-2 rounded hover:bg-blue-50 transition-colors cursor-pointer"
                          onClick={() =>
                            handleCategoryClick(mainCategory, item)
                          }
                        >
                          <span className="truncate">{item}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
