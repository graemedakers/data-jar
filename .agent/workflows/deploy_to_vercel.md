---
description: Guide to deploying the Date Jar app to production using Vercel and PostgreSQL.
---

# Deploying Date Jar to Production

Since this is a Next.js application, the easiest and most robust way to deploy it is using **Vercel**.
However, because Vercel is "serverless", we cannot use the local SQLite file (`dev.db`) because it will be deleted every time the server restarts (which is often).

We need to switch to a cloud database like **PostgreSQL**.

## Phase 1: Get a Cloud Database (Free)
1.  Go to [Neon.tech](https://neon.tech) or [Supabase.com](https://supabase.com) and sign up.
2.  Create a new project.
3.  Copy the **Connection String** (it looks like `postgres://user:pass@host/db...`).

## Phase 2: Update Project for PostgreSQL
1.  Open `prisma/schema.prisma`.
2.  Change the datasource provider:
    ```prisma
    datasource db {
      provider = "postgresql"
      url      = env("DATABASE_URL")
    }
    ```
3.  Update your local `.env` file with the new connection string to test it (optional, but good practice).
    ```env
    DATABASE_URL="postgres://..."
    ```
4.  Run `npx prisma db push` to set up the tables in the new cloud DB.

## Phase 3: Push to GitHub
1.  Create a repository on GitHub.
2.  Run these commands in your terminal:
    ```bash
    git init
    git add .
    git commit -m "Ready for deploy"
    git branch -M main
    git remote add origin <YOUR_GITHUB_REPO_URL>
    git push -u origin main
    ```

## Phase 4: Deploy to Vercel
1.  Go to [Vercel.com](https://vercel.com) and sign up/login.
2.  Click **"Add New..."** -> **"Project"**.
3.  Import your GitHub repository.
4.  **Important:** In the "Environment Variables" section, add:
    *   `DATABASE_URL`: Your Postgres connection string.
    *   `NEXTAUTH_SECRET`: A long random string (you can generate one with `openssl rand -base64 32` or just type random characters).
    *   `NEXT_PUBLIC_APP_URL`: Your production URL (e.g., `https://date-jar.vercel.app` - you can update this after the first deploy).
    *   `RESEND_API_KEY`: Your Resend API key (if using email).
5.  Click **Deploy**.

## Phase 5: Final Polish
1.  Once deployed, Vercel will give you a domain (e.g., `date-jar.vercel.app`).
2.  Go back to your Vercel project settings -> Environment Variables.
3.  Update `NEXT_PUBLIC_APP_URL` to match your real domain.
4.  Redeploy (or just wait for the next push).

## Troubleshooting
*   **Database errors?** Check the "Logs" tab in Vercel. It usually means the `DATABASE_URL` is wrong or the schema hasn't been pushed.
*   **"Prisma Client not found"?** Add `"postinstall": "prisma generate"` to your `package.json` scripts (Next.js usually handles this automatically though).
