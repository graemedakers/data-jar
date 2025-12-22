# Stripe Configuration Guide

To enable payments in the Date Jar application, you need to configure your Stripe account and add the necessary environment variables.

## 1. Create a Stripe Account
If you haven't already, sign up for a [Stripe account](https://stripe.com).

## 2. Get API Keys
1.  Go to the **Developers** section in your Stripe Dashboard.
2.  Click on **API keys**.
3.  Copy the **Publishable key** (starts with `pk_test_...` or `pk_live_...`).
4.  Copy the **Secret key** (starts with `sk_test_...` or `sk_live_...`).

## 3. Create Subscription Product
1.  Go to **Products** in the Stripe Dashboard.
2.  Click **Add product**.
3.  **Name**: "Date Jar Premium" (or similar).
4.  **Description**: "Monthly subscription for premium features."
5.  **Pricing model**: Standard pricing.
6.  **Price**: $9.99 (or your desired amount).
7.  **Type**: Recurring.
8.  **Billing period**: Monthly.
9.  Save the product.
10. Find the **Price API ID** for the price you just created (starts with `price_...`). You can usually find this in the Pricing section of the product page.
11. **(Optional Setup):** If not using code-based trials, you can configure the "Free Trial" days directly in the Stripe Pricing setup. However, the application code handles a default 14-day trial logic internally before enforcing the paywall.

## 4. Configure Webhooks
Webhooks allow Stripe to notify your application when a payment is successful.

### For Local Development (using Stripe CLI)
1.  Install the [Stripe CLI](https://stripe.com/docs/stripe-cli).
2.  Login: `stripe login`
3.  Listen for events and forward them to your local server:
    ```bash
    stripe listen --forward-to localhost:3000/api/stripe/webhook
    ```
4.  The CLI will output a **Webhook Signing Secret** (starts with `whsec_...`). Copy this.

### For Production
1.  Go to **Developers > Webhooks** in the Stripe Dashboard.
2.  Click **Add endpoint**.
3.  **Endpoint URL**: `https://your-domain.com/api/stripe/webhook`
4.  **Events to send**: Select `checkout.session.completed`.
5.  Add the endpoint.
6.  Reveal the **Signing secret** (starts with `whsec_...`) and copy it.

## 5. Environment Variables
Add the following keys to your `.env` file (create one if it doesn't exist):

```env
# Stripe API Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Stripe Webhook Secret
STRIPE_WEBHOOK_SECRET=whsec_...

# Product Price ID
STRIPE_PRICE_ID=price_...

# App URL (for redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Note:** Replace `http://localhost:3000` with your actual domain in production.

## 6. Testing
1.  Ensure your application is running (`npm run dev`).
2.  If testing locally, ensure `stripe listen` is running.
3.  Try to sign up as a new couple or click "Activate" in the dashboard.
4.  You should be redirected to Stripe Checkout.
5.  Use [Stripe Test Cards](https://stripe.com/docs/testing) (e.g., `4242 4242 4242 4242`) to complete the payment.
6.  Verify that you are redirected back and your account is upgraded.
