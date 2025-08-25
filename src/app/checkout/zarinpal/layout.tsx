import { Metadata } from "next";

export const metadata: Metadata = {
  title: "پرداخت از زرین‌پال",
  description: "پرداخت امن و سریع از طریق درگاه زرین‌پال",
};

export default function ZarinpalCheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
