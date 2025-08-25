# راهنمای راه‌اندازی درگاه پرداخت زرین‌پال

## پیش‌نیازها

1. حساب کاربری در زرین‌پال
2. کد درگاه (Merchant ID)
3. پروژه Next.js 14+ با App Router

## متغیرهای محیطی

فایل `.env.local` را در ریشه پروژه ایجاد کنید و موارد زیر را اضافه کنید:

```bash
# Zarinpal Payment Gateway Configuration
ZARINPAL_MERCHANT_ID=b2734f32-2b26-499a-bdb0-5477bef46783

# Server Configuration
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=جی استایل

# Environment
NODE_ENV=development
```

## مراحل راه‌اندازی

### 1. دریافت کد درگاه زرین‌پال

1. به [سایت زرین‌پال](https://www.zarinpal.com) بروید
2. حساب کاربری ایجاد کنید
3. درخواست درگاه پرداخت دهید
4. کد درگاه (Merchant ID) را دریافت کنید

### 2. تنظیم متغیرهای محیطی

کد درگاه دریافتی را در فایل `.env.local` قرار دهید:

```bash
ZARINPAL_MERCHANT_ID=12345678-1234-1234-1234-123456789012
```

### 3. تست درگاه

برای تست در محیط توسعه:

- از آدرس `https://sandbox.zarinpal.com` استفاده کنید
- `NODE_ENV=development` تنظیم کنید

برای محیط تولید:

- از آدرس `https://api.zarinpal.com` استفاده کنید
- `NODE_ENV=production` تنظیم کنید

## ساختار فایل‌ها

```
src/
├── app/
│   ├── api/
│   │   └── payment/
│   │       ├── request/
│   │       │   └── route.ts          # ایجاد درخواست پرداخت
│   │       └── verify/
│   │           └── route.ts          # تایید پرداخت
│   ├── payment/
│   │   ├── success/
│   │   │   └── page.tsx             # صفحه موفقیت پرداخت
│   │   ├── error/
│   │   │   └── page.tsx             # صفحه خطا در پرداخت
│   │   └── cancelled/
│   │       └── page.tsx             # صفحه لغو پرداخت
│   └── checkout/
│       └── zarinpal/
│           └── page.tsx             # صفحه پرداخت زرین‌پال
├── components/
│   └── shared/
│       └── payment/
│           └── zarinpal-payment.tsx # کامپوننت پرداخت
└── lib/
    └── db/
        └── models/
            ├── payment.model.ts      # مدل درخواست پرداخت
            └── invoice.model.ts      # مدل فاکتور
```

## نحوه استفاده

### 1. در صفحه checkout

```tsx
import ZarinpalPayment from "@/components/shared/payment/zarinpal-payment";

<ZarinpalPayment
  totalAmount={967000}
  orderId="ORDER-123"
  onPaymentStart={() => console.log("Payment started")}
  onPaymentComplete={() => console.log("Payment completed")}
/>;
```

### 2. API Endpoints

#### ایجاد درخواست پرداخت

```bash
POST /api/payment/request
Content-Type: application/json

{
  "amount": 9670000,
  "description": "پرداخت سفارش ORDER-123",
  "orderId": "ORDER-123"
}
```

#### تایید پرداخت

```bash
GET /api/payment/verify?Authority=xxx&Status=OK
```

## نکات مهم

### 1. واحد پول

- در UI: تومان نمایش داده می‌شود
- در API زرین‌پال: ریال ارسال می‌شود (ضرب در 10)

### 2. امنیت

- تمام درخواست‌ها احراز هویت می‌شوند
- اطلاعات کاربر در metadata ذخیره می‌شود
- callback URL امن تنظیم شده است

### 3. مدیریت خطا

- خطاهای مختلف پرداخت مدیریت می‌شود
- پیام‌های خطا به فارسی نمایش داده می‌شود
- لاگ تمام تراکنش‌ها ذخیره می‌شود

## تست سیستم

### 1. تست درخواست پرداخت

```bash
curl -X POST http://localhost:3000/api/payment/request \
  -H "Content-Type: application/json" \
  -d '{"amount": 100000, "description": "تست پرداخت", "orderId": "TEST-001"}'
```

### 2. تست تایید پرداخت

```bash
curl "http://localhost:3000/api/payment/verify?Authority=xxx&Status=OK"
```

## عیب‌یابی

### مشکلات رایج

1. **خطای Merchant ID**
   - کد درگاه را بررسی کنید
   - محیط (development/production) را چک کنید

2. **خطای callback URL**
   - آدرس سرور را بررسی کنید
   - HTTPS در محیط تولید الزامی است

3. **خطای دیتابیس**
   - اتصال MongoDB را بررسی کنید
   - مدل‌های دیتابیس را چک کنید

## پشتیبانی

در صورت بروز مشکل:

1. لاگ‌های سرور را بررسی کنید
2. مستندات زرین‌پال را مطالعه کنید
3. با پشتیبانی فنی تماس بگیرید
