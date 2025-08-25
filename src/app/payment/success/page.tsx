"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Download, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { formatDateTime, formatToman } from "@/lib/utils";

interface Invoice {
  _id: string;
  orderId: string;
  amount: number;
  refId: string;
  authority: string;
  paymentDate: string;
  status: string;
  metadata: {
    order_id: string;
    user_id: string;
    email?: string;
  };
  createdAt: string;
}

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const invoiceId = searchParams.get("invoiceId");
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (invoiceId) {
      fetchInvoice(invoiceId);
    }
  }, [invoiceId]);

  const fetchInvoice = async (id: string) => {
    try {
      const response = await fetch(`/api/invoice/${id}`);
      const result = await response.json();

      if (result.success) {
        setInvoice(result.invoice);
      } else {
        setError(result.error || "خطا در دریافت اطلاعات فاکتور");
      }
    } catch (error) {
      setError("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    const tomanAmount = amount;
    return formatToman(tomanAmount);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-6">
            <div className="text-red-500 text-6xl mb-4">❌</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              خطا در پرداخت
            </h2>
            <p className="text-gray-600 mb-4">{error || "فاکتور یافت نشد"}</p>
            <Link href="/">
              <Button className="w-full">بازگشت به صفحه اصلی</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            پرداخت با موفقیت انجام شد!
          </h1>
          <p className="text-gray-600">فاکتور شما در زیر نمایش داده شده است</p>
        </div>

        {/* Invoice Card */}
        <Card className="mb-6">
          <CardHeader className="bg-green-50 border-b">
            <CardTitle className="text-xl text-green-800">
              فاکتور پرداخت
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    شماره سفارش
                  </label>
                  <p className="text-lg font-semibold text-gray-800">
                    {invoice.orderId}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    شماره تراکنش
                  </label>
                  <p className="text-lg font-semibold text-gray-800">
                    {invoice.refId}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    کد پیگیری
                  </label>
                  <p className="text-lg font-semibold text-gray-800">
                    {invoice.authority}
                  </p>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    مبلغ پرداختی
                  </label>
                  <p className="text-2xl font-bold text-green-600">
                    {formatAmount(invoice.amount)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    تاریخ پرداخت
                  </label>
                  <p className="text-lg font-semibold text-gray-800">
                    {formatDateTime(new Date(invoice.paymentDate)).dateTime}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    وضعیت
                  </label>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    پرداخت شده
                  </span>
                </div>
              </div>
            </div>

            {/* User Info */}
            {invoice.metadata.email && (
              <div className="mt-6 pt-6 border-t">
                <label className="text-sm font-medium text-gray-500">
                  ایمیل کاربر
                </label>
                <p className="text-lg font-semibold text-gray-800">
                  {invoice.metadata.email}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => window.print()}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            چاپ فاکتور
          </Button>
          <Link href="/">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              بازگشت به صفحه اصلی
            </Button>
          </Link>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>فاکتور شما به ایمیل ارسال خواهد شد</p>
          <p className="mt-1">در صورت بروز مشکل با پشتیبانی تماس بگیرید</p>
        </div>
      </div>
    </div>
  );
}
