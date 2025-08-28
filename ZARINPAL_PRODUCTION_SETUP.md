# راهنمای تنظیم زرین‌پال برای محیط واقعی (Production)

## مشکل فعلی

سیستم پرداخت هنوز به درگاه Sandbox متصل می‌شود به جای درگاه واقعی زرین‌پال.

## راه‌حل

### مرحله 1: ایجاد فایل محیطی

فایل `.env.local` را در ریشه پروژه ایجاد کنید و موارد زیر را به آن اضافه کنید:

```bash
# تنظیمات زرین‌پال برای محیط واقعی
ZARINPAL_MODE=production

# کد درگاه واقعی زرین‌پال (بجای your_real_merchant_id_here کد درگاه خود را قرار دهید)
ZARINPAL_MERCHANT_ID=your_real_merchant_id_here

# سایر تنظیمات
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=جی استایل
```

### مرحله 2: دریافت کد درگاه واقعی

1. به سایت [زرین‌پال](https://www.zarinpal.com) وارد شوید
2. بخش "درگاه پرداخت" را باز کنید
3. کد "مرچنت کد" خود را کپی کنید
4. در فایل `.env.local` آن را جایگزین `your_real_merchant_id_here` کنید

### مرحله 3: راه‌اندازی مجدد سرور

```bash
npm run dev
```

## تغییرات انجام شده در کد

سیستم حالا از متغیر محیطی `ZARINPAL_MODE` استفاده می‌کند:

- `ZARINPAL_MODE=production` → درگاه واقعی زرین‌پال
- `ZARINPAL_MODE=sandbox` یا عدم تنظیم → درگاه تستی

## تست عملکرد

1. دکمه "پرداخت از زرین پال" را کلیک کنید
2. باید به آدرس `https://www.zarinpal.com/pg/StartPay/...` منتقل شوید
3. اگر همچنان به sandbox منتقل می‌شوید، موارد زیر را بررسی کنید:

### عیب‌یابی

1. **بررسی فایل محیطی**:

   ```bash
   cat .env.local
   ```

2. **بررسی متغیرهای محیطی**:
   - در کنسول مرورگر Network tab را باز کنید
   - پرداخت را انجام دهید
   - بررسی کنید که `ZARINPAL_MODE=production` تنظیم شده باشد

3. **مجدداً restart کنید**:
   ```bash
   # سرور را متوقف کنید (Ctrl+C)
   npm run dev
   ```

## مثال فایل .env.local

```bash
# زرین‌پال - محیط واقعی
ZARINPAL_MODE=production
ZARINPAL_MERCHANT_ID=12345678-1234-1234-1234-123456789012

# URL های پروژه
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=جی استایل

# دیتابیس (در صورت نیاز)
MONGODB_URI=your_mongodb_connection_string

# احراز هویت (در صورت نیاز)
AUTH_SECRET=your_auth_secret_key
```

## نکات امنیتی

- هرگز فایل `.env.local` را commit نکنید
- کد درگاه خود را محرمانه نگه دارید
- در محیط production از HTTPS استفاده کنید

## تایید نهایی

بعد از انجام تنظیمات:

- دکمه پرداخت باید شما را به `https://www.zarinpal.com` ببرد
- نه به `https://sandbox.zarinpal.com`

---

**توجه**: اگر همچنان مشکل دارید، محتویات فایل `.env.local` خود را (بدون نمایش کد درگاه) ارسال کنید.
