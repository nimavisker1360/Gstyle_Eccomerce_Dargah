"use client";

import { useState } from "react";

export default function ZarinPalTest() {
  const [amount, setAmount] = useState(360000); // 360,000 تومان
  const [description, setDescription] = useState("خرید تستی");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleCreatePayment = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/payment/zarinpal/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          description,
          callbackURL: `${window.location.origin}/checkout/zarinpal?amount=${amount}`,
        }),
      });

      const data = await response.json();
      setResult(data);

      if (data.success && data.paymentUrl) {
        // ریدایرکت کاربر به درگاه پرداخت
        window.location.href = data.paymentUrl;
      }
    } catch (error) {
      setResult({ error: "خطا در ارتباط با سرور" });
    } finally {
      setLoading(false);
    }
  };

  // تبدیل تومان برای نمایش
  const amountInToman = amount;

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        تست درگاه زرین‌پال
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            مبلغ (تومان)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="360000"
          />
          <p className="text-xs text-gray-500 mt-1">
            معادل {amountInToman.toLocaleString("fa-IR")} تومان
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            توضیحات
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="خرید تستی"
          />
        </div>

        <button
          onClick={handleCreatePayment}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "در حال پردازش..." : "ایجاد درخواست پرداخت"}
        </button>

        {result && (
          <div className="mt-4 p-4 rounded-md bg-gray-50">
            <h3 className="font-medium text-gray-800 mb-2">نتیجه:</h3>
            <pre className="text-sm text-gray-600 whitespace-pre-wrap">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-md">
        <h3 className="font-medium text-blue-800 mb-2">نکات مهم:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• مبلغ باید به تومان باشد</li>
          <li>• زرین‌پال خودش تبدیل می‌کنه</li>
          <li>• callback URL باید دقیق باشه</li>
          <li>• Authority 36 کاراکتری رو ذخیره کنید</li>
        </ul>
      </div>
    </div>
  );
}
