/**
 * Convert numbers to Persian/Farsi numerals with proper formatting
 * @param amount - The number to convert
 * @returns Formatted string with Persian numerals and Persian thousand separator
 */
export function formatPersianNumber(amount: number): string {
  // Persian numerals mapping
  const persianNumbers = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

  // First format the number with proper thousand separators using Intl.NumberFormat
  const formattedNumber = new Intl.NumberFormat("fa-IR").format(
    Math.max(0, Math.round(amount))
  );

  // Convert English numerals to Persian numerals
  let persianResult = "";
  for (let i = 0; i < formattedNumber.length; i++) {
    const char = formattedNumber[i];
    if (char >= "0" && char <= "9") {
      persianResult += persianNumbers[parseInt(char)];
    } else {
      persianResult += char;
    }
  }

  return persianResult;
}

/**
 * Format amount in Persian numerals with Toman currency
 * @param amount - The amount to format
 * @returns Formatted string with Persian numerals and Toman
 */
export function formatPersianAmount(amount: number): string {
  return formatPersianNumber(amount) + " تومان";
}

/**
 * Format amount in Persian numerals with Toman currency
 * @param amount - The amount to format
 * @param showCurrency - Whether to show the currency text
 * @returns Formatted string with Persian numerals and optional Toman
 */
export function formatPersianToman(
  amount: number,
  showCurrency: boolean = true
): string {
  const formatted = formatPersianNumber(amount);
  return showCurrency ? formatted + " تومان" : formatted;
}
