# Zarinpal Environment Variables Setup

## Required Environment Variables

Add these variables to your `.env.local` file (or `.env` for production):

```bash
# Zarinpal Production Gateway
ZARINPAL_MERCHANT_ID=your_production_merchant_id_here

# Application URL (for production)
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Environment (set to "production" for production gateway)
NODE_ENV=production
```

## How to Get Your Zarinpal Merchant ID

1. Log in to your Zarinpal merchant panel at [https://www.zarinpal.com](https://www.zarinpal.com)
2. Go to "درگاه پرداخت" (Payment Gateway)
3. Copy your "مرچنت کد" (Merchant Code)
4. Paste it as the value for `ZARINPAL_MERCHANT_ID`

## Production vs Sandbox

- **Production**: Uses `https://www.zarinpal.com` gateway
- **Sandbox**: Uses `https://sandbox.zarinpal.com` gateway (for testing)

The system automatically detects the environment based on `NODE_ENV`:

- `NODE_ENV=production` → Production gateway
- `NODE_ENV=development` → Sandbox gateway

## Security Notes

- Never commit your `.env` file to version control
- Keep your merchant ID secure
- Use HTTPS in production
- Validate all incoming payment data

## Testing

For testing purposes, you can temporarily set:

```bash
NODE_ENV=development
ZARINPAL_MERCHANT_ID=your_sandbox_merchant_id
```

## Production Deployment

When deploying to production:

1. Set `NODE_ENV=production`
2. Use your real production merchant ID
3. Ensure `NEXT_PUBLIC_APP_URL` points to your production domain
4. Test with small amounts first
