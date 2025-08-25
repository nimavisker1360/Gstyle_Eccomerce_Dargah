import ZarinPalTest from "@/components/shared/ZarinPalTest";

export default function TestZarinPalPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          تست اتصال به درگاه زرین‌پال
        </h1>
        <ZarinPalTest />
      </div>
    </div>
  );
}
