# تغییرات مسیر پرداخت زرین‌پال - بازگشت به صفحه اصلی

## خلاصه تغییرات

تمام مسیرهای پرداخت زرین‌پال تغییر یافته‌اند تا کاربران پس از تکمیل فرآیند خرید به صفحه اصلی (`/`) بازگردند، به جای ماندن در صفحات پرداخت زرین‌پال.

## فایل‌های تغییر یافته

### 1. مسیرهای API پرداخت

- **`src/app/api/payment/zarinpal/verify-payment/route.ts`**
  - تغییر redirect موفقیت از `/checkout/zarinpal?status=success` به `/?payment=success`
  - تغییر redirect خطا از `/checkout/zarinpal?status=failed` به `/?payment=failed`
  - تغییر redirect تایید ناموفق به `/?payment=verification_failed`

- **`src/app/api/payment/zarinpal/verify/route.ts`**
  - تغییر redirect موفقیت از `/payment/success` به `/?payment=success`
  - تغییر redirect خطا از `/payment/failure` به `/?payment=failed`

- **`src/app/api/payment/verify/route.ts`**
  - تغییر redirect موفقیت از `/payment/success` به `/?payment=success`
  - تغییر redirect خطا از `/payment/error` به `/?payment=error`
  - تغییر redirect لغو از `/payment/cancelled` به `/?payment=cancelled`

### 2. کامپوننت جدید

- **`src/components/shared/payment-status-banner.tsx`**
  - کامپوننت جدید برای نمایش پیام‌های وضعیت پرداخت در صفحه اصلی
  - نمایش خودکار پیام‌های موفقیت، خطا، لغو و تایید ناموفق
  - بسته شدن خودکار پس از 10 ثانیه
  - نمایش جزئیات پرداخت (Authority، کد پیگیری، مبلغ و غیره)

### 3. صفحه اصلی

- **`src/app/(home)/page.tsx`**
  - اضافه شدن کامپوننت `PaymentStatusBanner` برای نمایش وضعیت پرداخت

### 4. صفحه پرداخت زرین‌پال

- **`src/app/checkout/zarinpal/page.tsx`**
  - حذف نمایش وضعیت پرداخت (چون کاربر به صفحه اصلی منتقل می‌شود)
  - ساده‌سازی صفحه

## پارامترهای URL جدید

پس از پرداخت، کاربران با پارامترهای زیر به صفحه اصلی منتقل می‌شوند:

### موفقیت

```
/?payment=success&authority=XXX&refId=XXX&amount=XXX&orderId=XXX
```

### خطا

```
/?payment=error&error=XXX&authority=XXX
```

### لغو

```
/?payment=cancelled&authority=XXX
```

### تایید ناموفق

```
/?payment=verification_failed&error=XXX&amount=XXX
```

## مزایای این تغییرات

1. **تجربه کاربری بهتر**: کاربران به جای ماندن در صفحات پرداخت، به صفحه اصلی بازمی‌گردند
2. **یکپارچگی**: تمام وضعیت‌های پرداخت در یک مکان (صفحه اصلی) نمایش داده می‌شوند
3. **سادگی**: حذف صفحات اضافی و ساده‌سازی مسیر پرداخت
4. **اطلاع‌رسانی**: نمایش واضح وضعیت پرداخت با جزئیات کامل
5. **مدیریت آسان**: مدیریت تمام وضعیت‌های پرداخت در یک کامپوننت

## نحوه کارکرد

1. کاربر درخواست پرداخت می‌دهد
2. به درگاه زرین‌پال منتقل می‌شود
3. پس از تکمیل پرداخت، زرین‌پال کاربر را به callback URL برمی‌گرداند
4. سیستم پرداخت را تایید می‌کند
5. کاربر به صفحه اصلی با پارامترهای وضعیت پرداخت منتقل می‌شود
6. کامپوننت `PaymentStatusBanner` وضعیت پرداخت را نمایش می‌دهد
7. پیام پس از 10 ثانیه به صورت خودکار بسته می‌شود

## تست

برای تست این تغییرات:

1. سرور را اجرا کنید: `npm run dev`
2. یک پرداخت تستی انجام دهید
3. پس از تکمیل پرداخت، باید به صفحه اصلی منتقل شوید
4. پیام وضعیت پرداخت در بالای صفحه نمایش داده می‌شود
5. جزئیات پرداخت (Authority، کد پیگیری و غیره) قابل مشاهده است
