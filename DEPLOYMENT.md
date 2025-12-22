# Deployment Guide

This guide outlines the steps to deploy your Date Jar application to production using **Vercel** (recommended for Next.js) and a PostgreSQL database (e.g., **Neon** or **Supabase**).

## 1. Prerequisites

*   A [GitHub](https://github.com) account.
*   A [Vercel](https://vercel.com) account.
*   A [Stripe](https://stripe.com) account (activated for live payments).
*   A PostgreSQL database provider (e.g., [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)).

## 2. Database Setup (Production)

You need a cloud-hosted PostgreSQL database.

1.  Create a project on your chosen provider (e.g., Neon).
2.  Get the **Connection String** (looks like `postgres://user:pass@host/dbname...`).
3.  **Important:** Ensure you have a "Pooled" connection string if deploying to serverless environments like Vercel, or use the direct one if using Vercel Postgres.

## 3. Push Code to GitHub

1.  Create a new repository on GitHub.
2.  Run the following commands in your terminal (if you haven't already initialized git):

    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    git branch -M main
    git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
    git push -u origin main
    ```

## 4. Deploy to Vercel

1.  Log in to your Vercel dashboard.
2.  Click **"Add New..."** > **"Project"**.
3.  Import your GitHub repository.
4.  **Configure Project:**
    *   **Framework Preset:** Next.js (should be auto-detected).
    *   **Root Directory:** `./` (default).
    *   **Build Command:** `next build` (default).
    *   **Output Directory:** `.next` (default).

5.  **Environment Variables:**
    Expand the "Environment Variables" section and add the following. **Use your LIVE Stripe keys here.**

    | Key | Value Description |
    | :--- | :--- |
    | `DATABASE_URL` | Your production database connection string. |
    | `NEXT_PUBLIC_APP_URL` | Your production URL (e.g., `https://your-project.vercel.app`). |
    | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Live Publishable Key (`pk_live_...`). |
    | `STRIPE_SECRET_KEY` | Stripe Live Secret Key (`sk_live_...`). |
    | `STRIPE_WEBHOOK_SECRET` | Stripe Live Webhook Secret (see step 6). |
    | `STRIPE_PRICE_ID` | The ID of your live Stripe Product Price (`price_...`). |
    | `AUTH_SECRET` | A long random string (generate one with `openssl rand -base64 32`). |
    | `NEXT_PUBLIC_ENABLE_GOOGLE_PHOTOS` | Set to `true` to show the Google Photos button. |

6.  **Click "Deploy"**.

## 5. Post-Deployment Setup

### Database Migration
Once deployed, the build process might not automatically apply database migrations. You usually need to run this manually or add it to your build command.

**Option A: Run locally against production DB**
1.  Update your local `.env` to point `DATABASE_URL` to your **production** database.
2.  Run: `npx prisma migrate deploy`
3.  Revert your local `.env` to your local database.

**Option B: Build Command (Advanced)**
Update your "Build Command" in Vercel settings to:
`npx prisma migrate deploy && next build`

### Stripe Webhook
1.  Go to your Stripe Dashboard > Developers > Webhooks.
2.  Add a new endpoint: `https://your-project.vercel.app/api/stripe/webhook`
3.  Select event: `checkout.session.completed`.
4.  Copy the **Signing Secret** (`whsec_...`) and add it to your Vercel Environment Variables as `STRIPE_WEBHOOK_SECRET`.
5.  Redeploy your application on Vercel for the new variable to take effect.

## 6. Verify
1.  Visit your production URL.
2.  Sign up as a new user.
3.  Complete a real payment (using a real card, or a small $0.50 test product if you prefer not to spend $5).
4.  Ensure you are redirected to the dashboard and the jar is unlocked.
