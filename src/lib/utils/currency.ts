// ===== Currency: Toman formatting and conversion =====

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

// ===== Backward compatibility aliases =====
export const formatRial = formatToman;
export const formatRialEn = formatTomanEn;
