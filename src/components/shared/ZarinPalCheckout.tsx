"use client";

import { useState } from "react";
import {
  ArrowLeft,
  User,
  MapPin,
  Phone,
  Mail,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import useCartStore from "@/hooks/use-cart-store";
import { formatPersianAmount } from "@/lib/utils/format-persian-numbers";

export default function ZarinPalCheckout({
  initialAmount,
}: {
  initialAmount?: number;
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    address: "",
    phone: "",
    email: "",
  });
  const { cart } = useCartStore();
  const { items } = cart;

  // Calculate total from actual cart items, or use initialAmount if provided
  const computedTotal =
    initialAmount ||
    items?.reduce((sum, item) => sum + item.price * item.quantity, 0) ||
    0;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const isFormValid = () => {
    return (
      formData.firstName.trim() !== "" &&
      formData.lastName.trim() !== "" &&
      formData.address.trim() !== "" &&
      formData.phone.trim() !== "" &&
      formData.email.trim() !== ""
    );
  };

  const handlePayment = async () => {
    if (!isFormValid()) {
      alert("لطفاً تمام فیلدها را پر کنید");
      return;
    }

    setLoading(true);
    try {
      console.log("Sending payment request with data:", {
        amount: computedTotal,
        description: "پرداخت سفارش جی استایل",
        callbackURL: `${window.location.origin}/checkout/zarinpal?amount=${computedTotal}`,
        customerInfo: formData,
      });

      const response = await fetch("/api/payment/zarinpal/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: computedTotal,
          description: "پرداخت سفارش جی استایل",
          callbackURL: `${window.location.origin}/checkout/zarinpal?amount=${computedTotal}`,
          customerInfo: formData, // ارسال اطلاعات مشتری
        }),
      });

      const data = await response.json();
      console.log("Payment API response:", data);

      if (response.ok && data.success && data.paymentUrl) {
        // نمایش پیام موفقیت
        alert(
          "درخواست پرداخت با موفقیت ایجاد شد. در حال انتقال به درگاه پرداخت..."
        );

        // ریدایرکت کاربر به درگاه پرداخت
        window.location.href = data.paymentUrl;
      } else {
        // نمایش خطا
        const errorMessage = data.error || "خطا در ایجاد درخواست پرداخت";
        alert(`خطا: ${errorMessage}`);
        console.error("Payment creation failed:", data);
      }
    } catch (error) {
      console.error("خطا در ایجاد درخواست پرداخت:", error);
      alert("خطا در ارتباط با سرور. لطفاً مجدداً تلاش کنید.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-2 sm:py-8">
      <div className="max-w-4xl mx-auto px-2 sm:px-4">
        {/* Header - Mobile Optimized */}
        <div className="flex items-center mb-4 sm:mb-8">
          <Link
            href="/checkout"
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors text-sm sm:text-base p-2 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5 sm:w-5 sm:h-5 ml-2" />
            <span className="hidden sm:inline">بازگشت به صفحه پرداخت</span>
            <span className="sm:hidden text-base font-medium">بازگشت</span>
          </Link>
        </div>

        {/* Page Title - Mobile Optimized */}
        <div className="text-center mb-4 sm:mb-8 px-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            تکمیل پرداخت
          </h1>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            لطفاً اطلاعات خود را وارد کرده و پرداخت را تکمیل کنید
          </p>
        </div>

        {/* Customer Information Form - Mobile Optimized */}
        <div className="bg-white rounded-xl shadow-lg p-3 sm:p-6 lg:p-8 mb-4 sm:mb-8 border border-gray-100">
          <div className="flex items-center mb-4 sm:mb-6">
            <div className="w-10 h-10 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center ml-3">
              <User className="w-5 h-5 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
              اطلاعات مشتری
            </h2>
          </div>

          {/* Mobile: Stacked, Desktop: Two Columns */}
          <div className="space-y-4 sm:space-y-6 md:grid md:grid-cols-2 md:gap-6 md:space-y-0">
            {/* First Name */}
            <div className="space-y-2">
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-gray-700"
              >
                نام <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className={`w-full px-4 py-4 sm:py-3 border rounded-lg transition-all duration-200 text-right placeholder-gray-400 text-base focus:outline-none ${
                  formData.firstName.trim() !== ""
                    ? "border-green-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    : "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                }`}
                placeholder="نام خود را وارد کنید"
                required
              />
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-gray-700"
              >
                نام خانوادگی <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className={`w-full px-4 py-4 sm:py-3 border rounded-lg transition-all duration-200 text-right placeholder-gray-400 text-base focus:outline-none ${
                  formData.lastName.trim() !== ""
                    ? "border-green-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    : "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                }`}
                placeholder="نام خانوادگی خود را وارد کنید"
                required
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700"
              >
                شماره تلفن <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-4 sm:py-3 pr-12 border rounded-lg transition-all duration-200 text-right placeholder-gray-400 text-base focus:outline-none ${
                    formData.phone.trim() !== ""
                      ? "border-green-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      : "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  }`}
                  placeholder="09xxxxxxxxx"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                ایمیل <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-4 sm:py-3 pr-12 border rounded-lg transition-all duration-200 text-right placeholder-gray-400 text-base focus:outline-none ${
                    formData.email.trim() !== ""
                      ? "border-green-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      : "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  }`}
                  placeholder="example@email.com"
                  required
                />
              </div>
            </div>

            {/* Address - Full Width (Mobile: Full, Desktop: Spans both columns) */}
            <div className="space-y-2 md:col-span-2">
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700"
              >
                آدرس کامل <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute right-4 top-4 w-5 h-5 text-gray-400" />
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={4}
                  className={`w-full px-4 py-4 sm:py-3 pr-12 border rounded-lg transition-all duration-200 text-right resize-none placeholder-gray-400 text-base focus:outline-none ${
                    formData.address.trim() !== ""
                      ? "border-green-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      : "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  }`}
                  placeholder="آدرس کامل خود را وارد کنید (خیابان، کوچه، پلاک، طبقه)"
                  required
                />
              </div>
            </div>
          </div>

          {/* Form Progress Indicator - Mobile Optimized */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
              <span>تکمیل فرم:</span>
              <span className="font-medium">
                {
                  Object.values(formData).filter((value) => value.trim() !== "")
                    .length
                }{" "}
                از 5 فیلد
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-300"
                style={{
                  width: `${(Object.values(formData).filter((value) => value.trim() !== "").length / 5) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Order Summary Cards - Mobile: Stacked, Desktop: Side by Side */}
        <div className="space-y-4 sm:space-y-6 md:grid md:grid-cols-2 md:gap-6 md:space-y-0 mb-4 sm:mb-8">
          {/* First Order Summary Card */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex items-center mb-4">
              <ShoppingBag className="w-5 h-5 text-blue-600 ml-2" />
              <h3 className="text-lg font-semibold text-blue-600">
                خلاصه سفارش
              </h3>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-blue-600 font-medium text-base">
                  محصولات:
                </span>
                <div className="text-lg font-bold text-gray-800 mt-1">
                  {formatPersianAmount(computedTotal)}
                </div>
              </div>
              <hr className="border-gray-200" />
              <div>
                <span className="text-green-600 font-medium text-base">
                  جمع کل سفارش:
                </span>
                <div className="text-lg font-bold text-green-600 mt-1">
                  {formatPersianAmount(computedTotal)}
                </div>
              </div>
            </div>
          </div>

          {/* Second Order Summary Card */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-blue-600 mb-4">
              جزئیات پرداخت
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-blue-600 font-medium text-base">
                  تعداد آیتم‌ها:
                </span>
                <div className="text-lg font-bold text-gray-800 mt-1">
                  {items.length} آیتم
                </div>
              </div>
              <hr className="border-gray-200" />
              <div>
                <span className="text-green-600 font-medium text-base">
                  مبلغ قابل پرداخت:
                </span>
                <div className="text-lg font-bold text-green-600 mt-1">
                  {formatPersianAmount(computedTotal)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Buttons - Mobile Optimized */}
        <div className="space-y-3 mb-4 sm:mb-6">
          {/* Main Payment Button */}
          <button
            onClick={handlePayment}
            disabled={loading || !isFormValid()}
            className={`w-full px-6 py-4 rounded-lg text-lg font-semibold transition-all duration-300 transform ${
              isFormValid()
                ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl active:scale-95"
                : "bg-gray-300 text-gray-500 cursor-not-allowed shadow-sm"
            } ${loading ? "opacity-75" : ""}`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white ml-2"></div>
                <span className="text-base">در حال پردازش...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <svg
                  className="w-5 h-5 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <span className="text-base">پرداخت از زرین پال</span>
              </div>
            )}
          </button>
        </div>

        {/* Form Validation Message - Mobile Optimized */}
        {!isFormValid() && (
          <div className="text-center mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg mx-1 sm:mx-0">
            <p className="text-orange-600 text-sm flex items-center justify-center">
              <svg
                className="w-4 h-4 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              لطفاً تمام فیلدهای الزامی را پر کنید
            </p>
          </div>
        )}

        {/* Success Message when form is complete - Mobile Optimized */}
        {isFormValid() && (
          <div className="text-center mb-4 p-4 bg-green-50 border border-green-200 rounded-lg mx-1 sm:mx-0">
            <p className="text-green-600 text-sm flex items-center justify-center">
              <svg
                className="w-4 h-4 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              فرم تکمیل شد! حالا می‌توانید پرداخت را انجام دهید
            </p>
          </div>
        )}

        {/* Terms and Conditions - Mobile Optimized */}
        <div className="text-center text-sm text-gray-500 px-3 mb-4">
          با کلیک روی دکمه بالا شما با حریم خصوصی و شرایط استفاده جی استایل
          موافقت می‌کنید.
        </div>

        {/* Additional Info - Mobile Optimized */}
        <div className="mt-6 sm:mt-8 text-center text-sm text-gray-500 px-3 pb-6">
          <p>پرداخت شما از طریق درگاه امن زرین‌پال انجام می‌شود</p>
          <p className="mt-2">در صورت بروز مشکل با پشتیبانی تماس بگیرید</p>
        </div>
      </div>
    </div>
  );
}
