# ZarinPal Currency Conversion Fix

## Problem Description

The ZarinPal payment gateway was showing incorrect amounts because of a currency unit mismatch:

- **System sends**: 258,000 Tomans
- **ZarinPal receives**: 258,000 Rials (which equals 25,800 Tomans)
- **Result**: 10x price difference in the payment gateway

## Root Cause

ZarinPal API expects amounts in **Rials** (the smallest Iranian currency unit), but the system was sending amounts in **Tomans**.

**Conversion rate**: 1 Toman = 10 Rials

## Solution Applied

Updated the following API routes to convert Tomans to Rials before sending to ZarinPal:

### 1. `/api/payment/zarinpal/request/route.ts`

- Added import: `import { tomanToRial } from "@/lib/utils"`
- Added conversion: `const amountInRial = tomanToRial(amount)`
- Updated API call to use `amountInRial`
- Enhanced logging to show both original and converted amounts

### 2. `/api/payment/zarinpal/create/route.ts`

- Added import: `import { tomanToRial } from "@/lib/utils"`
- Added conversion: `const amountInRial = tomanToRial(amount)`
- Updated API call to use `amountInRial`
- Enhanced logging to show both original and converted amounts

## Code Changes

```typescript
// Before (incorrect)
amount: amount, // Amount in Rial (but actually in Toman)

// After (correct)
const amountInRial = tomanToRial(amount);
amount: amountInRial, // Amount in Rial (converted from Toman)
```

## Testing

After this fix:

- **System sends**: 258,000 Tomans
- **ZarinPal receives**: 2,580,000 Rials (258,000 × 10)
- **Result**: Correct price display in ZarinPal gateway

## Files Modified

1. `src/app/api/payment/zarinpal/request/route.ts`
2. `src/app/api/payment/zarinpal/create/route.ts`

## Notes

- The `tomanToRial()` utility function was already available in `src/lib/utils.ts`
- No changes needed in frontend components
- All existing functionality preserved
- Enhanced logging for better debugging
