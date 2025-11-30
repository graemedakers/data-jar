# Implementation Plan: Transitioning to a Real Backend

To make this application public-facing with real email capabilities and secure data storage, we need to move from a "Client-Side Only" architecture to a **Full-Stack Architecture**.

## Recommended Stack
*   **Framework**: [Next.js](https://nextjs.org/) (React). It combines the frontend and backend in one project.
*   **Database**: [PostgreSQL](https://www.postgresql.org/) (via [Supabase](https://supabase.com/) or [Neon](https://neon.tech/)).
*   **ORM**: [Prisma](https://www.prisma.io/). You already have the schema!
*   **Email Service**: [Resend](https://resend.com/) or [SendGrid](https://sendgrid.com/).
*   **Hosting**: [Vercel](https://vercel.com/) (Zero-config deployment for Next.js).

## Step-by-Step Guide

### 1. Initialize Next.js Project
Create a proper Next.js application. This will replace your `index.html` with React components.
```bash
npx create-next-app@latest date-jar --typescript --eslint --tailwind
```

### 2. Setup the Database
Use the `schema.prisma` we defined earlier.
1.  Install Prisma: `npm install prisma --save-dev`
2.  Initialize: `npx prisma init`
3.  Connect to a real PostgreSQL database (Supabase is free and excellent).
4.  Run `npx prisma db push` to create the tables.

### 3. Create the Email API Route
In Next.js, you create "API Routes" that run on the server. This is where you hide your email API keys.

**File:** `app/api/send-email/route.ts`
```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const { recipients, idea } = await request.json();

  try {
    const data = await resend.emails.send({
      from: 'Date Jar <noreply@yourdomain.com>',
      to: recipients,
      subject: `Date Night: ${idea.description}`,
      html: `
        <h1>It's a Date!</h1>
        <p><strong>Idea:</strong> ${idea.description}</p>
        <p><strong>Duration:</strong> ${idea.duration} days</p>
        <p><strong>Cost:</strong> ${idea.cost}</p>
      `
    });

    return Response.json(data);
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
```

### 4. Connect Frontend to Backend
Instead of `localStorage`, your frontend will now fetch data from your database.

**Example: Fetching Ideas**
```typescript
// Server Component (runs on server, secure)
const ideas = await prisma.idea.findMany({
  where: { coupleId: currentCouple.id }
});
```

**Example: Triggering Email**
```typescript
// Client Component
async function onReveal(idea) {
  await fetch('/api/send-email', {
    method: 'POST',
    body: JSON.stringify({ recipients: ['user1@email.com'], idea })
  });
}
```

### 5. Authentication
Use **NextAuth.js** (now Auth.js). It handles sessions securely so users don't just "log in" by checking a variable in local storage.

## Why this is the "Best" way?
1.  **Security**: API keys (for email) and Database credentials never leave the server.
2.  **Persistence**: Data is stored in the cloud, so you can access it from your phone or laptop.
3.  **Scalability**: Next.js scales automatically on Vercel.
