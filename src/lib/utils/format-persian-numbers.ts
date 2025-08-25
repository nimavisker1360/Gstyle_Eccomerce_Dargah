/**
 * Convert numbers to Persian/Farsi numerals with proper formatting
 * @param amount - The number to convert
 * @returns Formatted string with Persian numerals and Persian thousand separator
 */
export function formatPersianNumber(amount: number): string {
  // Persian numerals mapping
  const persianNumbers = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

  // Convert number to string
  let numStr = amount.toString();
  let persianResult = "";

  // Convert each character to Persian
  for (let i = 0; i < numStr.length; i++) {
    const char = numStr[i];
    if (char >= "0" && char <= "9") {
      persianResult += persianNumbers[parseInt(char)];
    } else {
      persianResult += char;
    }
  }

  // Add Persian thousand separator (،)
  let finalResult = "";
  let count = 0;
  for (let i = persianResult.length - 1; i >= 0; i--) {
    if (count === 3 && i > 0) {
      finalResult = "،" + finalResult;
      count = 0;
    }
    finalResult = persianResult[i] + finalResult;
    count++;
  }

  return finalResult;
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
