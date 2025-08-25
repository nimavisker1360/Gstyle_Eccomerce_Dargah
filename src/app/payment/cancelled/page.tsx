"use client";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function PaymentCancelledPage() {
  const searchParams = useSearchParams();
  const authority = searchParams.get("authority");

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
            <XCircle className="w-8 h-8 text-yellow-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            پرداخت لغو شد
          </h1>
          <p className="text-gray-600">
            شما پرداخت را لغو کردید یا به صفحه قبلی بازگشتید
          </p>
        </div>

        {/* Cancellation Details */}
        <Card className="mb-6">
          <CardHeader className="bg-yellow-50 border-b">
            <CardTitle className="text-xl text-yellow-800">
              جزئیات لغو پرداخت
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
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

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-800 mb-2">اطلاعات مهم:</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• هیچ مبلغی از حساب شما کسر نشده است</li>
                  <li>• سفارش شما در انتظار پرداخت باقی مانده است</li>
                  <li>• می‌توانید در هر زمان مجدداً برای پرداخت تلاش کنید</li>
                  <li>• کد پیگیری را برای مراجعات بعدی یادداشت کنید</li>
                </ul>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-800 mb-2">
                  چرا پرداخت لغو شد؟
                </h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• کلیک روی دکمه &quot;بازگشت&quot; در درگاه پرداخت</li>
                  <li>• بستن پنجره درگاه پرداخت</li>
                  <li>• انقضای زمان پرداخت</li>
                  <li>• مشکل در اتصال اینترنت</li>
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

        {/* Additional Options */}
        <div className="mt-8 text-center">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="font-medium text-gray-800 mb-2">گزینه‌های دیگر</h3>
            <p className="text-sm text-gray-600 mb-4">
              اگر با مشکل مواجه هستید، می‌توانید از روش‌های دیگر استفاده کنید
            </p>
            <div className="space-y-2 text-sm text-gray-600">
              <p>💳 پرداخت با کارت‌های دیگر</p>
              <p>🏦 پرداخت از طریق بانک</p>
              <p>📱 پرداخت موبایلی</p>
              <p>📞 تماس با پشتیبانی برای راهنمایی</p>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>در صورت نیاز به کمک، با پشتیبانی تماس بگیرید</p>
          <p className="mt-1">📧 support@example.com | 📞 ۰۲۱-۱۲۳۴۵۶۷۸</p>
        </div>
      </div>
    </div>
  );
}
