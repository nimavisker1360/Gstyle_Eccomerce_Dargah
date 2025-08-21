import { NextRequest, NextResponse } from "next/server";
import { getJson } from "serpapi";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { connectToDatabase } from "@/lib/db";
import GoogleShoppingProduct from "@/lib/db/models/google-shopping-product.model";

// معتبرترین سایت‌های ترکی برای زیبایی و آرایش
const TURKISH_BEAUTY_SITES = [
  "hepsiburada.com",
  "trendyol.com",
  "n11.com",
  "gittigidiyor.com",
  "amazon.com.tr",
  "sephora.com.tr",
  "douglas.com.tr",
  "gratis.com",
  "flormar.com.tr",
  "goldenrose.com.tr",
  "farmasi.com.tr",
  "rossman.com.tr",
  "watsons.com.tr",
  "avon.com.tr",
  "oriflame.com.tr",
  "yves-rocher.com.tr",
  "lorealparis.com.tr",
  "maybelline.com.tr",
  "clinique.com.tr",
  "esteelauder.com.tr",
];

// Function to filter products from Turkish beauty sites
function filterTurkishBeautyProducts(products: any[]): any[] {
  return products.filter((product) => {
    const productLink =
      product.link || product.source_link || product.merchant?.link || "";
    const isFromTurkishSite = TURKISH_BEAUTY_SITES.some((site) =>
      productLink.toLowerCase().includes(site)
    );

    const title = (product.title || "").toLowerCase();
    const description = (product.snippet || "").toLowerCase();
    const combined = title + " " + description;

    // Filter out women's underwear products (Persian, English, Turkish)
    const underwearKeywords = [
      // Persian
      "لباس زیر زنانه",
      "سوتین",
      "کولوت",
      "شورت زنانه",
      "پوشاک زیر",
      "لینجری",
      // English
      "bra",
      "panties",
      "underwear",
      "lingerie",
      "slip",
      "thong",
      "g-string",
      "briefs",
      "bikini",
      "swimwear",
      // Turkish
      "sütyen",
      "külot",
      "pamuklu",
      "iç çamaşırı",
      "mayo",
      "bikini",
      "plaj giyim",
      "gece elbisesi",
      "gece kıyafeti",
    ];

    // Check if product contains underwear keywords - if yes, exclude it
    if (underwearKeywords.some((keyword) => combined.includes(keyword))) {
      return false;
    }

    const beautyKeywords = [
      "kozmetik",
      "cosmetics",
      "güzellik",
      "beauty",
      "makyaj",
      "makeup",
      "parfüm",
      "perfume",
      "ruj",
      "lipstick",
      "fondöten",
      "foundation",
      "maskara",
      "mascara",
      "göz kalemi",
      "eyeliner",
      "far",
      "eyeshadow",
      "allık",
      "blush",
      "pudra",
      "powder",
      "concealer",
      "kapatıcı",
      "cilt bakım",
      "skincare",
      "nemlendirici",
      "moisturizer",
      "temizleyici",
      "cleanser",
      "serum",
      "krem",
      "cream",
      "güneş kremi",
      "sunscreen",
      "şampuan",
      "shampoo",
      "saç bakım",
      "hair care",
      "saç boyası",
      "hair dye",
      "oje",
      "nail polish",
      "dudak balsamı",
      "lip balm",
      "makyaj fırçası",
      "makeup brush",
      "tırnak",
      "nail",
    ];

    const hasBeautyKeywords = beautyKeywords.some((keyword) =>
      combined.includes(keyword)
    );

    return isFromTurkishSite && hasBeautyKeywords;
  });
}

// Function to translate Persian to Turkish for beauty products
async function translatePersianToTurkish(
  persianQuery: string
): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    return persianQuery;
  }

  try {
    const translationPrompt = `
      شما یک مترجم متخصص در حوزه زیبایی و آرایش هستید. کوئری زیر را از فارسی به ترکی ترجمه کنید:

      کوئری فارسی: "${persianQuery}"

      راهنمایی‌ها:
      1. اگر نام برند (لورآل، میبلین، کلینیک و...) باشد، همان را نگه دارید
      2. اصطلاحات زیبایی و آرایش دقیق ترکی استفاده کنید
      3. کلمات کلیدی مناسب برای جستجو در سایت‌های ترکی اضافه کنید
      4. اگر رنگ یا نوع پوست ذکر شده، آن را دقیق ترجمه کنید

      مثال‌ها:
      - "رژ لب قرمز" → "kırmızı ruj"
      - "کرم آفتاب" → "güneş kremi"
      - "ماسکارا ضد آب" → "su geçirmez maskara"
      - "لوازم آرایش" → "makyaj malzemeleri"

      فقط ترجمه ترکی را برگردانید، بدون توضیح اضافی:
    `;

    const { text } = await generateText({
      model: openai("gpt-4"),
      prompt: translationPrompt,
      maxOutputTokens: 100,
      temperature: 0.3,
    });

    return text.trim() || persianQuery;
  } catch (error) {
    console.error("❌ Translation error:", error);
    return persianQuery;
  }
}

// Function to enhance Turkish query for better beauty search
async function enhanceTurkishBeautyQuery(
  turkishQuery: string
): Promise<string[]> {
  if (!process.env.OPENAI_API_KEY) {
    return [turkishQuery];
  }

  try {
    const enhancementPrompt = `
      شما یک متخصص SEO برای فروشگاه‌های زیبایی ترکی هستید. کوئری ترکی زیر را برای جستجوی بهتر در سایت‌های زیبایی ترکی بهبود دهید:

      کوئری اصلی: "${turkishQuery}"

      لطفاً 3 تا 5 کوئری مختلف ایجاد کنید که:
      1. شامل کلمات کلیدی مختلف زیبایی باشد
      2. برندهای مختلف را در نظر بگیرد
      3. برای سایت‌های ترکی مثل Sephora، Gratis، Douglas بهینه باشد
      4. انواع محصولات مرتبط را شامل شود

      فقط کوئری‌ها را خط به خط برگردانید:
    `;

    const { text } = await generateText({
      model: openai("gpt-4"),
      prompt: enhancementPrompt,
      maxOutputTokens: 200,
      temperature: 0.7,
    });

    const queries = text
      .trim()
      .split("\n")
      .filter((q) => q.trim().length > 0);
    return queries.length > 0 ? queries : [turkishQuery];
  } catch (error) {
    console.error("❌ Query enhancement error:", error);
    return [turkishQuery];
  }
}

// Function to translate Turkish results back to Persian
async function translateTurkishToPersian(
  title: string,
  description: string
): Promise<{ title: string; description: string }> {
  if (!process.env.OPENAI_API_KEY) {
    return { title, description };
  }

  try {
    const translationPrompt = `
      محصول زیبایی و آرایش زیر را از ترکی به فارسی ترجمه کنید:

      عنوان: ${title}
      توضیحات: ${description}

      راهنمایی‌ها:
      1. نام برندها را دست نخورید (L'Oreal, Maybelline, Clinique, ...)
      2. اصطلاحات زیبایی فارسی دقیق استفاده کنید
      3. ترجمه طبیعی و روان باشد
      4. برای فروش در ایران مناسب باشد

      پاسخ را در فرمت JSON برگردانید:
      {
        "title": "عنوان فارسی",
        "description": "توضیحات فارسی (جذاب و مناسب فروش، حداکثر 100 کلمه)"
      }
    `;

    const { text: response } = await generateText({
      model: openai("gpt-4"),
      prompt: translationPrompt,
      maxOutputTokens: 250,
      temperature: 0.5,
    });

    try {
      const parsed = JSON.parse(response);
      return {
        title: parsed.title || title,
        description: parsed.description || description,
      };
    } catch (parseError) {
      console.error("❌ JSON parse error:", parseError);
      return { title, description };
    }
  } catch (error) {
    console.error("❌ Turkish to Persian translation error:", error);
    return { title, description };
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter is required" },
        { status: 400 }
      );
    }

    console.log(`💄 Starting intelligent beauty search for: "${query}"`);

    if (!process.env.SERPAPI_KEY) {
      console.error("❌ SERPAPI_KEY is not configured");
      return NextResponse.json(
        { error: "Search service is not configured" },
        { status: 500 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Add randomization for diverse results
    let cleanQuery = query.replace(/\s+\d{13}$/, "").trim();

    // Beauty-specific random variations
    const beautyVariations = [
      "doğal",
      "organik",
      "kaliteli",
      "özel",
      "premium",
      "lüks",
      "trend",
      "popüler",
      "etkili",
      "güzel",
    ];
    const randomWord =
      beautyVariations[Math.floor(Math.random() * beautyVariations.length)];

    if (Math.random() > 0.4) {
      // 60% chance
      cleanQuery = `${cleanQuery} ${randomWord}`;
      console.log(`🎲 Added beauty variation: "${randomWord}"`);
    }

    // Step 1: Translate Persian to Turkish
    console.log("🔄 Step 1: Translating Persian to Turkish...");
    const turkishQuery = await translatePersianToTurkish(cleanQuery);
    console.log(`✅ Persian to Turkish: "${query}" → "${turkishQuery}"`);

    // Step 2: Enhance Turkish query
    console.log("🔄 Step 2: Enhancing Turkish query for beauty search...");
    const enhancedQueries = await enhanceTurkishBeautyQuery(turkishQuery);
    console.log(`✅ Enhanced queries:`, enhancedQueries);

    // Step 3: Search Turkish beauty sites
    console.log("🔄 Step 3: Searching Turkish beauty sites...");
    let allProducts: any[] = [];

    for (const enhancedQuery of enhancedQueries.slice(0, 3)) {
      try {
        const serpApiParams = {
          engine: "google_shopping",
          q:
            enhancedQuery +
            " site:sephora.com.tr OR site:hepsiburada.com OR site:trendyol.com OR site:glamour.com.tr",
          gl: "tr",
          hl: "tr",
          location: "Turkey",
          num: 50,
          device: "desktop",
          api_key: process.env.SERPAPI_KEY,
        };

        console.log(`🔍 Searching with: "${enhancedQuery}"`);
        const searchResults = await getJson(serpApiParams);

        if (
          searchResults.shopping_results &&
          searchResults.shopping_results.length > 0
        ) {
          const filteredProducts = filterTurkishBeautyProducts(
            searchResults.shopping_results
          );
          console.log(
            `✅ Found ${filteredProducts.length} Turkish beauty products for query: "${enhancedQuery}"`
          );
          allProducts.push(...filteredProducts);
        }

        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`❌ Search error for query "${enhancedQuery}":`, error);
      }
    }

    // Remove duplicates
    const uniqueProducts = allProducts.filter(
      (product, index, self) =>
        index ===
        self.findIndex(
          (p) =>
            (p.product_id && p.product_id === product.product_id) ||
            p.title === product.title
        )
    );

    console.log(
      `📊 Total unique beauty products found: ${uniqueProducts.length}`
    );

    if (uniqueProducts.length === 0) {
      return NextResponse.json({
        products: [],
        message:
          "هیچ محصول زیبایی و آرایش از سایت‌های معتبر ترکی یافت نشد. لطفاً کلمات کلیدی دیگری امتحان کنید.",
        search_query: query,
        turkish_query: turkishQuery,
        enhanced_queries: enhancedQueries,
      });
    }

    // Step 4: Translate products to Persian and save to database
    console.log(
      "🔄 Step 4: Translating products to Persian and saving to database..."
    );
    const translatedProductsPromises = uniqueProducts.map(
      async (product, index) => {
        try {
          console.log(`🔄 Translating product ${index + 1}: ${product.title}`);

          const { title: persianTitle, description: persianDescription } =
            await translateTurkishToPersian(
              product.title,
              product.snippet || ""
            );

          let finalPrice = 0;
          let finalOriginalPrice = null;
          let currency = "TRY";

          if (product.extracted_price) {
            finalPrice = product.extracted_price;
          } else if (product.price) {
            const priceStr =
              typeof product.price === "string"
                ? product.price
                : product.price.toString();
            finalPrice =
              parseFloat(priceStr.replace(/[^\d.,]/g, "").replace(",", ".")) ||
              0;
          }

          if (product.original_price) {
            const originalPriceStr =
              typeof product.original_price === "string"
                ? product.original_price
                : product.original_price.toString();
            finalOriginalPrice =
              parseFloat(
                originalPriceStr.replace(/[^\d.,]/g, "").replace(",", ".")
              ) || null;
          }

          if (product.currency) {
            currency = product.currency;
          } else if (product.price && typeof product.price === "string") {
            if (product.price.includes("₺")) currency = "TRY";
            else if (product.price.includes("€")) currency = "EUR";
            else if (product.price.includes("$")) currency = "USD";
          }

          const storeLink =
            product.link || product.source_link || product.merchant?.link || "";

          let googleShoppingLink = "";
          if (product.product_id) {
            googleShoppingLink = `https://www.google.com.tr/shopping/product/${product.product_id}?gl=tr`;
          } else if (product.product_link) {
            googleShoppingLink = product.product_link;
          } else {
            googleShoppingLink = `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(product.title)}`;
          }

          console.log(`✅ Successfully translated: ${persianTitle}`);

          // Create product data for database
          const productData = {
            id:
              product.product_id ||
              `beauty_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: product.title,
            title_fa: persianTitle,
            price: finalPrice.toString(),
            link: storeLink,
            thumbnail: product.thumbnail || product.image,
            source: product.source || "فروشگاه ترکی",
            category: "beauty",
            createdAt: new Date(),
          };

          // Save to MongoDB
          try {
            const savedProduct = new GoogleShoppingProduct(productData);
            await savedProduct.save();
            console.log(`💾 Saved to database: ${persianTitle}`);
          } catch (dbError) {
            console.error(
              `❌ Database save error for ${persianTitle}:`,
              dbError
            );
            // Continue even if database save fails
          }

          return {
            id: product.product_id || Math.random().toString(36).substr(2, 9),
            title: persianTitle,
            originalTitle: product.title,
            price: finalPrice,
            originalPrice: finalOriginalPrice,
            currency: currency,
            image: product.thumbnail,
            description: persianDescription,
            originalDescription: product.snippet || "",
            link: storeLink,
            googleShoppingLink: googleShoppingLink,
            source: product.source || "فروشگاه ترکی",
            rating: product.rating || 0,
            reviews: product.reviews || 0,
            delivery: "ارسال از ترکیه",
            category: "زیبایی و آرایش",
            turkishKeywords: enhancedQueries,
          };
        } catch (error) {
          console.error(`❌ Error translating product ${index + 1}:`, error);
          return null;
        }
      }
    );

    const finalProducts = (
      await Promise.all(translatedProductsPromises)
    ).filter(Boolean);

    console.log(`✅ Final beauty products ready: ${finalProducts.length}`);

    return NextResponse.json({
      products: finalProducts,
      total: finalProducts.length,
      search_query: query,
      turkish_query: turkishQuery,
      enhanced_queries: enhancedQueries,
      message: `${finalProducts.length} محصول زیبایی و آرایش از سایت‌های معتبر ترکی یافت شد.`,
      turkish_sites_searched: TURKISH_BEAUTY_SITES.slice(0, 10),
    });
  } catch (error) {
    console.error("❌ Intelligent Beauty Search API Error:", error);
    return NextResponse.json(
      {
        error: "خطا در جستجوی هوشمند زیبایی و آرایش. لطفاً دوباره تلاش کنید.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
