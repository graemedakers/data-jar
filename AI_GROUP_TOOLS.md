# AI Concierge Adaptations for Groups

Since you already have a powerful AI engine for finding venues (Dining Concierge & Bar Scout), you can re-package this technology for specific group niches with minimal code changes (mostly prompt engineering).

## 1. "The Co-Working Compass" (Digital Nomads / Students)
*   **The Problem:** Groups of freelancers or students trying to find a cafe that allows laptops, has WiFi, and good coffee.
*   **The Tech:** Re-use **Dining Concierge**.
*   **The Tweak:** Update system prompt to prioritize: *"Laptop friendly", "Free Wifi", "Good lighting", "Not too loud"* and exclude "Fine Dining".
*   **Target:** Study groups, Startup teams.

## 2. "The Team Lunch" (Corporate)
*   **The Problem:** Office teams need a place that can seat 10+ people, isn't too expensive, but isn't "fast food", and service is fast enough for a 1-hour break.
*   **The Tech:** Re-use **Dining Concierge**.
*   **The Tweak:** Prompt focus: *"Large group seating", "Quick service", "Business casual", "Split bill friendly"*.
*   **Target:** Corporate offices.

## 3. "The Post-Game Feed" (Sports Leagues)
*   **The Problem:** It's 9 PM on a Tuesday, the rec league game just finished. 15 sweaty people need cheap beer and burgers/pizza.
*   **The Tech:** Re-use **Bar Scout** or **Dining Concierge**.
*   **The Tweak:** Prompt focus: *"Open late", "Dive bar / Sports bar vibe", "Cheap pitchers", "Accepts sweaty people"*.
*   **Target:** Amateur sports leagues (Softball, Soccer, etc).

## 4. "The Sweet Tooth" / "Dessert Crawl"
*   **The Problem:** You've had dinner, but now the group wants ice cream, churros, or cake.
*   **The Tech:** Re-use **Dining Concierge**.
*   **The Tweak:** Prompt restrict to: *"Dessert parlors", "Bakeries open late", "Gelato"*.
*   **Target:** Date nights, Families, Teen groups.

## 5. "The Family Feeder" (Parents)
*   **The Problem:** Finding a "Pub" or "Restaurant" where toddlers won't be stared at, and maybe there's a playground or coloring books.
*   **The Tech:** Re-use **Dining Concierge**.
*   **The Tweak:** Prompt focus: *"Kid friendly", "Has high chairs", "Play area", "Loud enough to mask crying"*.
*   **Target:** New parent groups (Mothers' groups).

## 6. "The Pub Crawl Generator" (Parties)
*   **The Problem:** Stag/Hen dos or Birthday groups want a *route*, not just one place.
*   **The Tech:** Re-use **Bar Scout** (running it 3-4 times).
*   **The Tweak:** Chain the requests. Ask AI for *"A starting bar, a mid-point dive bar, and a club for ending the night"*. Present it as a timeline.
*   **Target:** Bachelor/Bachelorette parties, 21st Birthdays.

## 7. "The Client Impresser" (Sales)
*   **The Problem:** You need a quiet, upscale place to close a deal.
*   **The Tech:** Re-use **Bar Scout** (for drinks) or **Dining**.
*   **The Tweak:** Prompt focus: *"Quiet", "Impressive decor", "Top shelf whiskey", "Private booths"*.
*   **Target:** Salespeople, Executives.
