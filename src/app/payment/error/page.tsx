"use client";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function PaymentErrorPage() {
  const searchParams = useSearchParams();
  const authority = searchParams.get("authority");
  const error = searchParams.get("error");

  const getErrorMessage = () => {
    if (error) {
      return decodeURIComponent(error);
    }
    return "پرداخت با خطا مواجه شد. لطفاً مجدداً تلاش کنید.";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            خطا در پرداخت
          </h1>
          <p className="text-gray-600">
            متأسفانه پرداخت شما با مشکل مواجه شده است
          </p>
        </div>

        {/* Error Details */}
        <Card className="mb-6">
          <CardHeader className="bg-red-50 border-b">
            <CardTitle className="text-xl text-red-800">جزئیات خطا</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  پیام خطا
                </label>
                <p className="text-lg font-semibold text-red-600 mt-1">
                  {getErrorMessage()}
                </p>
              </div>

              {authority && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    کد پیگیری
                  </label>
                  <p className="text-lg font-semibold text-gray-800 mt-1 font-mono">
                    {authority}
                  </p>
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-medium text-yellow-800 mb-2">راهنمایی:</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• بررسی کنید که اطلاعات کارت بانکی صحیح باشد</li>
                  <li>• مطمئن شوید که موجودی کافی در حساب دارید</li>
                  <li>• در صورت تکرار خطا، با بانک خود تماس بگیرید</li>
                  <li>• کد پیگیری را یادداشت کنید</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/checkout">
            <Button className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              تلاش مجدد
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              بازگشت به صفحه اصلی
            </Button>
          </Link>
        </div>

        {/* Contact Support */}
        <div className="mt-8 text-center">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="font-medium text-gray-800 mb-2">
              نیاز به کمک دارید؟
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              در صورت بروز مشکل یا سوال، با پشتیبانی ما تماس بگیرید
            </p>
            <div className="space-y-2 text-sm text-gray-600">
              <p>📧 ایمیل: support@example.com</p>
              <p>📞 تلفن: ۰۲۱-۱۲۳۴۵۶۷۸</p>
              <p>🕒 ساعات کاری: شنبه تا چهارشنبه ۹ صبح تا ۶ عصر</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
