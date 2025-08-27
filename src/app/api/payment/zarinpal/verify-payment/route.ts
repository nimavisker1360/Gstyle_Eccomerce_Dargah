import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import mongoose from "mongoose";
import { formatToman, tomanToRial } from "@/lib/utils";
import { connectToDatabase } from "@/lib/db";
import { Transaction } from "@/lib/db/models/transaction.model";
import { Invoice } from "@/lib/db/models/invoice.model";
import Cart from "@/lib/db/models/cart.model";
import { auth } from "@/auth";

function parseRecipientEmails(input?: string | null): string[] {
  if (!input) return [];
  return input
    .split(/[;,]/)
    .map((e) => e.trim())
    .filter((e) => e.length > 0);
}

async function sendInvoiceEmailFromTransaction(params: {
  transaction: any;
  refId: string | number;
  authority: string;
}) {
  const { transaction, refId, authority } = params;

  const recipients = parseRecipientEmails(transaction?.customer?.email);
  if (!recipients.length) {
    return;
  }

  const gmailUser = process.env.GMAIL_USER || "golnazef1360@gmail.com";
  const gmailPass = process.env.GMAIL_APP_PASSWORD;
  if (!gmailPass) {
    console.warn(
      "GMAIL_APP_PASSWORD is not configured; skipping invoice email."
    );
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: gmailUser,
      pass: gmailPass,
    },
  });

  const amountRial: number = Number(transaction?.amount || 0);
  const amountToman = Math.floor(amountRial / 10);
  const orderId = transaction?.orderId || "نامشخص";
  const fullName = `${transaction?.customer?.firstName || ""} ${
    transaction?.customer?.lastName || ""
  }`.trim();

  // Load cart items for this user to include in the invoice email
  let items: Array<{
    name: string;
    image: string;
    quantity: number;
    price: number;
    color?: string;
    size?: string;
  }> = [];
  let itemsPrice: number | undefined;
  let shippingPrice: number | undefined;
  let taxPrice: number | undefined;
  let totalPrice: number | undefined;
  try {
    if (transaction?.userId) {
      const userId = String(transaction.userId);
      const userFilter = mongoose.Types.ObjectId.isValid(userId)
        ? { user: new mongoose.Types.ObjectId(userId) }
        : { user: userId as any };
      const cartDoc = await Cart.findOne(userFilter);
      if (cartDoc) {
        items = (cartDoc.items || []).map((it: any) => ({
          name: it.name,
          image: it.image,
          quantity: it.quantity,
          price: it.price,
          color: it.color,
          size: it.size,
        }));
        itemsPrice = cartDoc.itemsPrice;
        shippingPrice = cartDoc.shippingPrice;
        taxPrice = cartDoc.taxPrice;
        totalPrice = cartDoc.totalPrice;
      }
    }
  } catch {}

  const itemsRows = items
    .map((it) => {
      const lineTotal = it.price * it.quantity;
      return `
        <tr style="border-bottom:1px solid #e2e8f0;">
          <td style="padding:10px; text-align:center;">
            ${it.image ? `<img src="${it.image}" alt="${it.name}" style="width:56px;height:56px;border-radius:8px;object-fit:cover;"/>` : ""}
          </td>
          <td style="padding:10px;">
            <div style="font-weight:600">${it.name}</div>
            <div style="color:#64748b; font-size:12px;">${it.color || ""} ${it.size ? `| ${it.size}` : ""}</div>
          </td>
          <td style="padding:10px; text-align:center;">${it.quantity}</td>
          <td style="padding:10px; text-align:left; white-space:nowrap;">${formatToman(it.price)}</td>
          <td style="padding:10px; text-align:left; white-space:nowrap;">${formatToman(lineTotal)}</td>
        </tr>
      `;
    })
    .join("");

  // Prefer the verified transaction amount when cart total is missing/zero
  const displayAmountToman =
    typeof totalPrice === "number" && totalPrice > 0
      ? totalPrice
      : amountToman > 0
        ? amountToman
        : 0;

  const html = `
  <!doctype html>
  <html dir="rtl" lang="fa">
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <style>
        body { font-family: tahoma, Arial, sans-serif; background:#ffffff; color:#0f172a; }
        .card { max-width:640px; margin:0 auto; border:1px solid #e2e8f0; border-radius:12px; overflow:hidden; }
        .header { background:#ecfdf5; padding:16px 20px; }
        .title { margin:0; font-size:18px; color:#065f46; }
        .content { padding:20px; }
        .row { display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px dashed #e2e8f0; }
        .row:last-child { border-bottom:none; }
        .label { color:#475569; font-size:14px; }
        .value { font-weight:600; font-size:15px; }
        .foot { padding:16px 20px; background:#f8fafc; font-size:12px; color:#64748b; text-align:center; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1 class="title">فاکتور پرداخت</h1>
        </div>
        <div class="content">
          <div class="row"><span class="label">نام مشتری</span><span class="value">${
            fullName || "نامشخص"
          }</span></div>
          <div class="row"><span class="label">ایمیل</span><span class="value">${recipients.join(
            ", "
          )}</span></div>
          <div class="row"><span class="label">شماره سفارش</span><span class="value">${orderId}</span></div>
          <div class="row"><span class="label">کد رهگیری زرین‌پال</span><span class="value">${authority}</span></div>
          <div class="row"><span class="label">شماره تراکنش</span><span class="value">${refId}</span></div>
          <div class="row"><span class="label">مبلغ پرداختی</span><span class="value">${formatToman(
            displayAmountToman
          )}</span></div>
          <div class="row"><span class="label">وضعیت</span><span class="value">پرداخت شده</span></div>
          ${
            items.length
              ? `
          <div style="margin-top:14px;">
            <div style="font-weight:700; color:#0f172a; margin-bottom:8px;">سبد خرید</div>
            <table style="width:100%; border-collapse:collapse;">
              <thead>
                <tr style="background:#f1f5f9; border-bottom:1px solid #e2e8f0;">
                  <th style="padding:10px; text-align:center;">تصویر</th>
                  <th style="padding:10px; text-align:right;">محصول</th>
                  <th style="padding:10px; text-align:center;">تعداد</th>
                  <th style="padding:10px; text-align:left;">قیمت واحد</th>
                  <th style="padding:10px; text-align:left;">قیمت کل</th>
                </tr>
              </thead>
              <tbody>
                ${itemsRows}
              </tbody>
            </table>
            <div style="margin-top:12px; border:1px solid #e2e8f0; border-radius:8px; padding:12px;">
              ${
                typeof itemsPrice === "number"
                  ? `<div style="display:flex; justify-content:space-between; margin:6px 0;"><span>مجموع کالاها</span><strong>${formatToman(itemsPrice)}</strong></div>`
                  : ""
              }
              ${
                typeof taxPrice === "number"
                  ? `<div style="display:flex; justify-content:space-between; margin:6px 0;"><span>مالیات</span><strong>${formatToman(taxPrice)}</strong></div>`
                  : ""
              }
              ${
                typeof shippingPrice === "number"
                  ? `<div style="display:flex; justify-content:space-between; margin:6px 0;"><span>هزینه ارسال</span><strong>${
                      shippingPrice === 0
                        ? "رایگان"
                        : formatToman(shippingPrice)
                    }</strong></div>`
                  : ""
              }
              ${
                typeof totalPrice === "number"
                  ? `<div style="display:flex; justify-content:space-between; margin-top:10px; padding:10px; background:#059669; color:#fff; border-radius:6px;"><span>جمع کل</span><strong>${formatToman(totalPrice)}</strong></div>`
                  : ""
              }
            </div>
          </div>
          `
              : ""
          }
        </div>
        <div class="foot">این ایمیل به صورت خودکار پس از تایید پرداخت ارسال شده است.</div>
      </div>
    </body>
  </html>`;

  await transporter.sendMail({
    from: `"GStyle" <${gmailUser}>`,
    to: recipients,
    subject: "فاکتور پرداخت سفارش",
    html,
  });
}

async function ensureInvoiceForTransaction(params: {
  transaction: any;
  refId: string | number;
  authority: string;
}) {
  const { transaction, refId, authority } = params;
  if (!transaction) return null;

  const userId: string | undefined = transaction.userId;
  const orderId: string | undefined = transaction.orderId;
  if (!userId || !orderId) return null;

  // Try to find existing by refId or orderId
  const existingByRef = await Invoice.findOne({ refId: String(refId) });
  if (existingByRef) return existingByRef;
  const existingByOrder = await Invoice.findOne({ orderId: String(orderId) });
  if (existingByOrder) return existingByOrder;

  const doc = await Invoice.create({
    userId: String(userId),
    orderId: String(orderId),
    amount: Number(transaction.amount || 0),
    refId: String(refId),
    authority: String(authority),
    paymentDate: new Date(),
    status: "paid",
    metadata: {
      order_id: String(orderId),
      user_id: String(userId),
      email: transaction?.customer?.email || undefined,
    },
  });
  return doc;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { Authority, Status, amount, orderId } = body;

    // Validate required fields
    if (!Authority) {
      return NextResponse.json(
        { error: "پارامترهای ضروری ارسال نشده‌اند" },
        { status: 400 }
      );
    }

    if (Status !== "OK") {
      return NextResponse.json(
        { error: "پرداخت توسط کاربر لغو شد." },
        { status: 400 }
      );
    }

    // Fetch stored transaction amount (in Rial) for accurate verification
    await connectToDatabase();
    const existing = await Transaction.findOne({ authority: Authority });
    const amountInRial =
      existing?.amount ?? (amount ? tomanToRial(Number(amount)) : undefined);

    if (!amountInRial) {
      return NextResponse.json(
        { error: "مبلغ تراکنش یافت نشد" },
        { status: 400 }
      );
    }

    const response = await axios.post(
      "https://sandbox.zarinpal.com/pg/v4/payment/verify.json",
      {
        merchant_id: process.env.ZARINPAL_MERCHANT_ID,
        amount: amountInRial,
        authority: Authority,
      }
    );

    const { data } = response.data;

    if (data.code === 100) {
      try {
        const session = await auth();
        await Transaction.findOneAndUpdate(
          { authority: Authority },
          {
            userId: session?.user?.id ?? existing?.userId,
            orderId: orderId ?? existing?.orderId,
            status: "completed",
            refId: String(data.ref_id),
            amount: Number(amountInRial),
            // keep any customer info that was saved during create
            customer: existing?.customer ?? undefined,
            verifiedAt: new Date(),
          },
          { upsert: false }
        );
        const updatedTxn = await Transaction.findOne({ authority: Authority });
        await ensureInvoiceForTransaction({
          transaction: updatedTxn,
          refId: data.ref_id,
          authority: Authority,
        });
        await sendInvoiceEmailFromTransaction({
          transaction: updatedTxn,
          refId: data.ref_id,
          authority: Authority,
        });
      } catch (dbErr) {
        console.error(
          "Failed to update transaction after verification:",
          dbErr
        );
      }
      return NextResponse.json({
        success: true,
        refId: data.ref_id,
        message: `✅ پرداخت موفق بود. کد پیگیری: ${data.ref_id}`,
      });
    } else {
      try {
        await Transaction.findOneAndUpdate(
          { authority: Authority },
          { status: "failed" },
          { upsert: false }
        );
      } catch (dbErr) {
        console.error("Failed to mark transaction failed:", dbErr);
      }
      return NextResponse.json(
        {
          success: false,
          error: `❌ خطا در تایید پرداخت: ${data.message}`,
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Handle GET requests for callback URLs
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const Authority = searchParams.get("Authority");
    const Status = searchParams.get("Status");
    const amount = searchParams.get("amount");
    const orderId = searchParams.get("orderId");

    if (Status !== "OK") {
      // mark cancelled
      try {
        await connectToDatabase();
        if (Authority) {
          await Transaction.findOneAndUpdate(
            { authority: Authority },
            { status: "cancelled" },
            { upsert: false }
          );
        }
      } catch (dbErr) {
        console.error("Failed to mark transaction cancelled:", dbErr);
      }
      // Payment failed or was cancelled, redirect to home page
      const failureUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/?payment=failed${amount ? `&amount=${amount}` : ""}`;
      return NextResponse.redirect(failureUrl);
    }

    if (!Authority) {
      return NextResponse.json(
        { error: "پارامترهای ضروری ارسال نشده‌اند" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const txn = await Transaction.findOne({ authority: Authority });
    const amountInRial =
      txn?.amount ?? (amount ? tomanToRial(Number(amount)) : undefined);

    if (!amountInRial) {
      const failureUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/?payment=error&error=${encodeURIComponent("amount not found")}`;
      return NextResponse.redirect(failureUrl);
    }

    const response = await axios.post(
      "https://sandbox.zarinpal.com/pg/v4/payment/verify.json",
      {
        merchant_id: process.env.ZARINPAL_MERCHANT_ID,
        amount: amountInRial,
        authority: Authority,
      }
    );

    const { data } = response.data;

    if (data.code === 100) {
      try {
        const session = await auth();
        await Transaction.findOneAndUpdate(
          { authority: Authority },
          {
            userId: session?.user?.id ?? txn?.userId,
            orderId: orderId ?? txn?.orderId,
            status: "completed",
            refId: String(data.ref_id),
            amount: Number(amountInRial),
            customer: txn?.customer ?? undefined,
            verifiedAt: new Date(),
          },
          { upsert: false }
        );
        const updatedTxn = await Transaction.findOne({ authority: Authority });
        await ensureInvoiceForTransaction({
          transaction: updatedTxn,
          refId: data.ref_id,
          authority: Authority,
        });
        await sendInvoiceEmailFromTransaction({
          transaction: updatedTxn,
          refId: data.ref_id,
          authority: Authority,
        });
      } catch (dbErr) {
        console.error(
          "Failed to update transaction after verification:",
          dbErr
        );
      }
      // Payment verified successfully, redirect to home page
      const successUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/?payment=success&refId=${data.ref_id}${amountInRial ? `&amount=${amountInRial}` : ""}`;
      return NextResponse.redirect(successUrl);
    } else {
      try {
        await Transaction.findOneAndUpdate(
          { authority: Authority },
          { status: "failed" },
          { upsert: false }
        );
      } catch (dbErr) {
        console.error("Failed to mark transaction failed:", dbErr);
      }
      // Payment verification failed, redirect to home page
      const failureUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/?payment=verification_failed&error=${data.message}${amountInRial ? `&amount=${amountInRial}` : ""}`;
      return NextResponse.redirect(failureUrl);
    }
  } catch (error: any) {
    // Error occurred, redirect to home page
    const failureUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/?payment=error&error=${encodeURIComponent(error.message)}`;
    return NextResponse.redirect(failureUrl);
  }
}
