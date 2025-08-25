# راهنمای اتصال به درگاه زرین‌پال

## مراحل اتصال

### 1. تنظیم متغیرهای محیطی

ابتدا فایل `.env.local` را ایجاد کرده و کد مرچنت زرین‌پال را اضافه کنید:

```env
ZARINPAL_MERCHANT_ID=your_merchant_id_here
```

### 2. API Endpoints

#### ایجاد درخواست پرداخت (Request)

**Endpoint:** `POST /api/payment/zarinpal/create`

**Request Body:**

```json
{
  "amount": 360000,
  "description": "خرید تستی",
  "callbackURL": "http://localhost:3000/checkout/zarinpal?amount=360000"
}
```

**Response:**

```json
{
  "success": true,
  "authority": "36_character_authority_code",
  "paymentUrl": "https://www.zarinpal.com/pg/StartPay/36_character_authority_code",
  "message": "درخواست پرداخت با موفقیت ایجاد شد"
}
```

#### تایید پرداخت (Verify)

**Endpoint:** `POST /api/payment/zarinpal/verify-payment`

**Request Body:**

```json
{
  "Authority": "36_character_authority_code",
  "Status": "OK",
  "amount": 360000
}
```

**Response:**

```json
{
  "success": true,
  "refId": "123456789",
  "message": "✅ پرداخت موفق بود. کد پیگیری: 123456789"
}
```

### 3. نحوه استفاده در کامپوننت

```tsx
import { useState } from "react";

export default function PaymentComponent() {
  const [amount, setAmount] = useState(360000); // 360,000 تومان
  const [description, setDescription] = useState("خرید تستی");

  const handleCreatePayment = async () => {
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

      if (data.success && data.paymentUrl) {
        // ریدایرکت کاربر به درگاه پرداخت
        window.location.href = data.paymentUrl;
      }
    } catch (error) {
      console.error("خطا در ایجاد درخواست پرداخت:", error);
    }
  };

  return (
    <div>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        placeholder="مبلغ (تومان)"
      />
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="توضیحات"
      />
      <button onClick={handleCreatePayment}>پرداخت</button>
    </div>
  );
}
```

### 4. نکات مهم

- **مبلغ:** باید به تومان باشد (ریال نزن)
- **زرین‌پال:** خودش تبدیل می‌کند
- **Callback URL:** باید دقیق باشد
- **Authority:** 36 کاراکتری را ذخیره کنید
- **Status:** باید "OK" باشد

### 5. تبدیل واحد پول

- **1 تومان = 100 ریال**
- **مثال:** 360,000 تومان = 36,000,000 ریال
- **نکته:** زرین‌پال مبلغ را به تومان دریافت می‌کند

### 6. تست

برای تست اتصال، به آدرس زیر بروید:

```
http://localhost:3000/checkout/zarinpal
```

### 7. خطاهای احتمالی

| کد خطا | توضیح                           |
| ------ | ------------------------------- |
| -1     | اطلاعات ارسال شده ناقص است      |
| -2     | IP یا مرچنت کد پذیرفته نشده است |
| -3     | محدودیت‌های شاپرک               |
| -4     | سطح تایید پایین                 |
| -11    | درخواست یافت نشد                |
| -21    | عملیات مالی یافت نشد            |
| -22    | تراکنش ناموفق                   |
| -33    | عدم تطابق مبلغ                  |
| -101   | عملیات پرداخت ناموفق            |

### 8. محیط تست

برای تست از کد مرچنت تستی استفاده کنید:

```
b2734f32-2b26-499a-bdb0-5477bef46783
```

### 9. محیط تولید

برای تولید از کد مرچنت واقعی استفاده کنید و مطمئن شوید که:

- `NODE_ENV=production`
- IP سرور در لیست سفید زرین‌پال باشد
- SSL فعال باشد

## مثال کامل

```tsx
// 1. ایجاد درخواست پرداخت
const createPayment = async (amount: number, description: string) => {
  const response = await fetch("/api/payment/zarinpal/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount, // مبلغ به تومان
      description,
      callbackURL: `${window.location.origin}/checkout/zarinpal?amount=${amount}`,
    }),
  });

  const data = await response.json();

  if (data.success) {
    // ذخیره authority در localStorage یا state
    localStorage.setItem("paymentAuthority", data.authority);

    // ریدایرکت به درگاه پرداخت
    window.location.href = data.paymentUrl;
  }
};

// 2. تایید پرداخت (بعد از برگشت از درگاه)
const verifyPayment = async (authority: string, amount: number) => {
  const response = await fetch("/api/payment/zarinpal/verify-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      Authority: authority,
      Status: "OK",
      amount, // مبلغ به تومان
    }),
  });

  const data = await response.json();

  if (data.success) {
    console.log("پرداخت موفق:", data.refId);
    // انجام عملیات بعد از پرداخت موفق
  }
};
```

## جریان پرداخت

1. **ایجاد درخواست پرداخت**: کاربر روی دکمه پرداخت کلیک می‌کند
2. **ریدایرکت به درگاه**: کاربر به درگاه زرین‌پال هدایت می‌شود
3. **پرداخت**: کاربر در درگاه پرداخت را انجام می‌دهد
4. **بازگشت**: کاربر به آدرس `checkout/zarinpal` برمی‌گردد
5. **تایید**: سیستم پرداخت را تایید می‌کند
6. **نمایش نتیجه**: پیام موفقیت یا خطا نمایش داده می‌شود

## پارامترهای URL

بعد از بازگشت از درگاه، URL شامل پارامترهای زیر خواهد بود:

- **status**: وضعیت پرداخت (success, failed, verification_failed, error)
- **authority**: کد 36 کاراکتری زرین‌پال
- **refId**: کد پیگیری (در صورت موفقیت)
- **amount**: مبلغ پرداخت شده (به تومان)
- **error**: پیام خطا (در صورت بروز خطا)

## پشتیبانی

در صورت بروز مشکل، لاگ‌های سرور را بررسی کنید و مطمئن شوید که:

1. متغیرهای محیطی درست تنظیم شده‌اند
2. کد مرچنت معتبر است
3. IP سرور در لیست سفید زرین‌پال است
4. SSL فعال است (در محیط تولید)
