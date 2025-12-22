# Public Group Jars ("Clubs"): Concept Document

This document outlines the proposal to expand Date Jar to include Public Group Jars, effectively creating a "gamified community event" platform.

## 1. The Concept: "Clubs"
A **Club** is a Public Jar centered around a specific interest (e.g., *"Melbourne Hidden Bars"*, *"Saturday Morning Hikers"*, *"Cinema Buffs"*).
*   **The Hook:** Instead of a generic event calendar, the Club has a **Jar of Potential Events**.
*   **The Surprise:** Members subscribe to the Club. The Host spins the jar (e.g., weekly), and *that* becomes the event. Members then RSVP.

## 2. Key Features & Mechanics

### A. Discovery & Profile (The "Storefront")
*   **Public Directory:** A new `/explore/clubs` page listing public jars.
    *   **Search/Filter:** By location (e.g., "Sydney"), interest ("Food", "Active"), and activity level.
*   **Club Profile Page:**
    *   **Cover Info:** Name, Description, Host bio, and "Vibe" (tags).
    *   **The "Menu":** Users can glimpse the *types* of ideas in the jar (e.g., "Contains 50+ Hiking Trails").
    *   **Stats:** "12 Events Hosted", "4.9/5 Rating".
    *   **Action:** "Join Club" (free or paid).

### B. Contribution & Curation
*   **Crowdsourced Ideas:** Unlike standard jars, anyone in the Club can *submit* an idea, but it goes into a **"Pending Approval"** queue.
*   **Host Control:** The Host (Admin) approves or rejects ideas to ensure quality and safety.

### C. The "Event" Lifecycle (The Pivot)
This is the biggest change. In a private jar, a spin is just a decision. In a Club, a spin creates an **Event**.
1.  **The Spin:** Host spins the jar (e.g., "First Friday of the Month"). Result: *"Rooftop Cinema at Curtin House"*.
2.  **Event Mode:** This idea is converted into an **Event Page**.
    *   **Time/Date:** Host sets the verified time.
    *   **RSVPs:** Members click "I'm in".
    *   **Cap:** Host can set a limit (e.g., "Max 20 people").
3.  **The Drop:** Members get a notification: *"The plan is set! We are going to [Location]. Spots limited!"*

## 3. Implementation Complexity: MEDIUM-HIGH
While we can reuse the core `Jar` and `Idea` structures, the "Event" and "Public" layers add meaningful complexity.

*   **Database Changes (Medium):**
    *   `Jar` needs `privacy` (PUBLIC/PRIVATE), `description`, `bannerImage`.
    *   New `Event` model (linked to an Idea + Date + Host).
    *   New `RSVP` model (User -> Event).
    *   `Idea` needs a status (`PENDING`, `APPROVED`).
*   **UI Work (High):**
    *   Public directory (Explore page).
    *   Rich Club Profile page.
    *   Event management dashboard for Hosts.
*   **Safety/Moderation (Critical):**
    *   If jars are public, you need reporting tools (Report Jar, Report User).
    *   Liability disclaimers for public meetups.

## 4. Value Proposition
**Does it add value?**
**YES.** It transforms the app from a "utility" (used once a week) into a "network" (used daily/weekly for discovery).

*   **Viral Growth:** Public pages are indexable by Google (SEO). Someone searching for *"Date ideas in London"* finds your Public Jars.
*   **Content Engine:** You stop relying on users to fill jars. Power users (Hosts) create content that *other* users consume.
*   **Monetization:**
    *   **Premium Clubs:** Hosts charge $5/month for entry (you take a cut).
    *   **Curated Jars:** You (Date Jar) create "Official City Guides" that people just follow.

## Summary
This feature turns "Date Jar" into a social platform. It is a fantastic direction if you want to grow a user base beyond couples, but it requires building "Event Management" features (RSVP, Approval Queues) that don't exist yet.

**Recommendation:** Start with a "Hybrid" approach. Allow Jars to be **Public (Read-Only)** first.
*   Users can *find* and *copy* ideas from Public Jars to their own private jars.
*   This acts as the "Directory" without the complexity of managing physical meetups yet.
