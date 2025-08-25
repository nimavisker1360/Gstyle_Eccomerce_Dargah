// ===== Currency: Toman ↔ Rial conversion =====
// 1 Toman = 10 Rial

/**
 * Convert Toman to Rial
 * @param toman - Amount in Toman
 * @returns Amount in Rial
 */
export function tomanToRial(toman: number): number {
  return toman * 10;
}

/**
 * Convert Rial to Toman
 * @param rial - Amount in Rial
 * @returns Amount in Toman
 */
export function rialToToman(rial: number): number {
  return rial / 10;
}

/**
 * Format amount in Toman with Persian locale
 * @param amountInToman - Amount in Toman
 * @returns Formatted string (e.g., "۹۶۷,۰۰۰ تومان")
 */
export function formatToman(amountInToman: number): string {
  const formatted = new Intl.NumberFormat("fa-IR").format(
    Math.max(0, Math.round(amountInToman))
  );
  return `${formatted} تومان`;
}

/**
 * Format amount in Rial with Persian locale
 * @param amountInRial - Amount in Rial
 * @returns Formatted string (e.g., "۹,۶۷۰,۰۰۰ ریال")
 */
export function formatRial(amountInRial: number): string {
  const formatted = new Intl.NumberFormat("fa-IR").format(
    Math.max(0, Math.round(amountInRial))
  );
  return `${formatted} ریال`;
}

/**
 * Format amount in Toman with English locale
 * @param amountInToman - Amount in Toman
 * @returns Formatted string (e.g., "967,000 Toman")
 */
export function formatTomanEn(amountInToman: number): string {
  const formatted = new Intl.NumberFormat("en-US").format(
    Math.max(0, Math.round(amountInToman))
  );
  return `${formatted} Toman`;
}

/**
 * Format amount in Rial with English locale
 * @param amountInRial - Amount in Rial
 * @returns Formatted string (e.g., "9,670,000 Rial")
 */
export function formatRialEn(amountInRial: number): string {
  const formatted = new Intl.NumberFormat("en-US").format(
    Math.max(0, Math.round(amountInRial))
  );
  return `${formatted} Rial`;
}
