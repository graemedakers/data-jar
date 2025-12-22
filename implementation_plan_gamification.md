# Implementation Plan: Gamification (Couple Levels)

## 1. Database Schema (`prisma/schema.prisma`)
Update the `Couple` model to track progress.

```prisma
model Couple {
  // ... existing fields
  xp          Int      @default(0)
  level       Int      @default(1)
}
```

## 2. Level Design
We will use a simple geometric progression or fixed tiers.
*   Level 1: 0 - 100 XP
*   Level 2: 101 - 300 XP
*   Level 3: 301 - 600 XP
*   ...etc.

Formula: `Level = floor(sqrt(XP / 100)) + 1` or similar simple curve.

**XP Sources:**
*   Spin Jar: **+5 XP**
*   Add Date Idea: **+15 XP**
*   Complete Date (Memory): **+100 XP**

## 3. Backend Logic (`lib/gamification.ts`)
Create a utility to handle XP updates centrally.
*   `awardXp(coupleId: string, amount: number)`
*   Checks for level up logic.
*   Returns `{ newXp, newLevel, leveledUp: boolean }`.

## 4. API Integration
Inject `awardXp` into existing controllers:
*   `app/api/ideas/route.ts` (POST)
*   `app/api/memories/route.ts` (POST)
*   `app/api/spin/route.ts` (POST) - *Need to create this endpoint if it's currently client-side only.* Wait, spinning is currently client-side + `PATCH /api/ideas/[id]`. We might need to hook into the "Reveal" action.

## 5. Dashboard UI
*   Create `components/Gamification/LevelBanner.tsx`.
*   Displays:
    *   Current Level Name (e.g. "Level 5: Adventure Seekers")
    *   Progress Bar (XP / NextLevelXP)
*   Integrate into `app/dashboard/page.tsx` (Completed).

## 6. Post-Implementation Note
**IMPORTANT:** After applying these changes, the development server MUST be restarted.
1. Stop the server (`Ctrl+C`).
2. Run `npx prisma generate`.
3. Start the server (`npm run dev`).
This is required because the Prisma Client cannot regenerate while the previous server process is holding a lock on the database engine files.
