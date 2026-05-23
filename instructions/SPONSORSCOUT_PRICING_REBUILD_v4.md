# SPONSORSCOUT — ANTIGRAVITY INSTRUCTION FILE v4.0
**Date:** 23-05-2026
**Scope:** Pricing engine complete rebuild + YouTube format fix + benchmark corrections
**Rule:** This file must be executed fresh. Previous instruction files were already
executed. Do not re-apply any instruction from previous files.
**Format rule:** No code in this file. Pure instructions only.
**Critical rule:** Do NOT touch any UI, template, wizard, or payment flow
that is already working correctly. Only change what this file explicitly describes.

---

# PART 1 — CRITICAL: COMPLETE PRICING ENGINE REBUILD

This is the most important section of this entire file.
The current pricing formula is fundamentally wrong and must be replaced entirely.

---

## WHY THE CURRENT FORMULA IS WRONG

The current engine calculates sponsorship rates using:
Final Fee = (Average Views × ₹100 CPM) / 1,000

This formula calculates AdSense ad revenue per video — not sponsorship value.
These are completely different numbers. AdSense CPM and sponsorship CPM
are not the same metric. A creator with 38,441 average views on a 326K
subscriber YouTube channel should command ₹80,000–₹2,00,000 per integration
from an Indian brand. The current formula outputs ₹3,844.
That is 20–50x below the real Indian market rate.

The entire pricing logic — for both YouTube and Instagram — must be deleted
and replaced with the flat-rate tiered system described below.

---

## THE NEW PRICING MODEL: FLAT-RATE TIERED BASE + MULTIPLIERS

The new model works in 5 sequential steps for both platforms.
Each step feeds into the next.

---

### STEP A — DETERMINE THE BASE RATE FROM TIER TABLE

The base rate is a single midpoint value looked up from a fixed table
based on the creator's audience size (subscribers for YouTube,
followers for Instagram) and their content niche.

The base rate represents the market midpoint for a standard 60-second
integration on that platform for Indian creators with a primarily
Indian audience. Every other calculation modifies this base rate.

---

**YOUTUBE BASE RATE TABLE**
(Per 60-second mid-roll or end-card integration, Indian domestic audience)

Use the creator's SUBSCRIBER COUNT — not average views — to find their tier.
Then apply the niche column multiplier to get the base rate.

Subscriber tiers and base rates (Gaming niche = baseline = 1.0x):

| Tier Label    | Subscriber Range    | Base Rate (Gaming) |
|---------------|---------------------|-------------------|
| Nano          | 5,000 – 25,000      | ₹8,000            |
| Micro         | 25,001 – 100,000    | ₹30,000           |
| Mid-Tier      | 100,001 – 300,000   | ₹70,000           |
| Rising        | 300,001 – 600,000   | ₹1,40,000         |
| Macro         | 600,001 – 1,000,000 | ₹2,80,000         |
| Mega          | 1,000,001 – 5,000,000 | ₹6,00,000       |
| Elite         | 5,000,001+          | ₹15,00,000        |

YouTube Niche Multipliers applied on top of base rate:
Finance & Investing: 2.0x
Tech & Gadgets: 1.6x
Education & Study: 1.4x
Fitness & Health: 1.3x
Food & Cooking: 1.1x
Lifestyle & Vlog: 1.0x
Gaming: 1.0x (baseline)
Comedy & Entertainment: 0.85x

Example calculation for Shub (326K subscribers, Gaming, Tier 3 India):
Tier = Rising (300,001–600,000)
Base rate = ₹1,40,000
Niche multiplier = 1.0x (Gaming)
Base rate after niche = ₹1,40,000

---

**INSTAGRAM BASE RATE TABLE**
(Per single 60-second Reel, Indian domestic audience)

Use the creator's FOLLOWER COUNT to find their tier.

| Tier Label    | Follower Range      | Base Reel Rate     |
|---------------|---------------------|-------------------|
| Nano          | 1,000 – 10,000      | ₹6,000            |
| Micro Low     | 10,001 – 30,000     | ₹15,000           |
| Micro High    | 30,001 – 100,000    | ₹35,000           |
| Mid-Tier      | 100,001 – 300,000   | ₹90,000           |
| Rising        | 300,001 – 600,000   | ₹2,00,000         |
| Macro         | 600,001 – 1,000,000 | ₹4,50,000         |
| Mega          | 1,000,001+          | ₹10,00,000        |

Instagram Niche Multipliers:
Finance & Investing: 1.8x
Tech & Gadgets: 1.5x
Fitness & Health: 1.3x
Education & Study: 1.3x
Food & Cooking: 1.1x
Fashion & Beauty: 1.1x
Gaming: 1.0x (baseline)
Lifestyle & Vlog: 1.0x
Comedy & Entertainment: 0.9x
Travel: 0.9x

Example calculation for Tech Unboxed (85K followers, Tech & Gadgets):
Tier = Micro High (30,001–100,000)
Base rate = ₹35,000
Niche multiplier = 1.5x (Tech & Gadgets)
Base rate after niche = ₹52,500

---

### STEP B — APPLY ENGAGEMENT MULTIPLIER

High engagement signals a loyal, converting audience — worth more to brands.

**For YouTube:**
Calculate the engagement signal as: (Average Views / Subscribers) × 100
This is the view rate percentage.

| View Rate     | Multiplier |
|---------------|-----------|
| Below 5%      | 0.75x     |
| 5% – 9%       | 0.90x     |
| 9% – 15%      | 1.00x     |
| 15% – 25%     | 1.20x     |
| 25%+          | 1.40x     |

Note: A low view rate (below 5%) on a large channel does not necessarily
mean bad content — it is normal at scale. But it does reduce sponsorship
value per impression. Apply the multiplier regardless.

For Shub: 38,441 / 326,000 × 100 = 11.79% → Multiplier: 1.00x

**For Instagram:**
If the creator provided Likes + Comments + Shares + Saves, calculate true
engagement rate as: (Likes + Comments + Shares + Saves) / Followers × 100

If not all four values are available, use the reach ratio:
(Avg Reel Plays / Followers) × 100

| Engagement / Reach Rate | Multiplier |
|------------------------|-----------|
| Below 3%               | 0.75x     |
| 3% – 6%                | 0.90x     |
| 6% – 10%               | 1.00x     |
| 10% – 20%              | 1.20x     |
| 20% – 40%              | 1.35x     |
| 40%+                   | 1.50x     |

For Tech Unboxed (true engagement = 6.92%): Multiplier: 1.00x

---

### STEP C — APPLY AUDIENCE GEO MULTIPLIER

**Important context for Indian brands:**
Indian brands (boAt, MamaEarth, Mamaearth, Wow Skin Science, etc.) WANT
Indian audiences. A Tier 3 India audience is not a penalty — it is the
target demographic. Apply this correctly.

| Audience Primary Country   | Multiplier |
|---------------------------|-----------|
| US / UK / Canada / AU     | 2.20x     |
| UAE / Singapore / Saudi   | 1.60x     |
| India (primary audience)  | 1.00x     |
| Other / Mixed             | 0.80x     |

For Shub and Tech Unboxed (India, Tier 3): Multiplier: 1.00x

---

### STEP D — APPLY FORMAT MULTIPLIER

Different integration formats require different production effort and
deliver different value. The base rate is set for a 60-second integration.

**YouTube Format Multipliers:**

| Format                              | Multiplier |
|-------------------------------------|-----------|
| 15-second mention / end-card        | 0.45x     |
| 30-second mid-roll shoutout         | 0.70x     |
| 60-second dedicated integration     | 1.00x     |
| Dedicated video (full video)        | 2.50x     |
| Dedicated video + Community post    | 3.00x     |
| Dedicated video + Shorts + Community| 3.50x     |

**Instagram Format Multipliers:**
These multiply the base Reel rate. Stories are priced separately below.

| Format                              | Reel Multiplier |
|-------------------------------------|----------------|
| 30-second Reel only                 | 0.70x          |
| 60-second Reel only                 | 1.00x          |
| 1 Reel + 3 Stories (Full Package)   | 1.30x*         |
| 2 Reels + 5 Stories + Link in Bio   | 2.10x*         |

*For packages including Stories, the multiplier already accounts for
the Story component. Do not separately add story pricing for packages.
For "Stories Only" format, calculate story rate separately:

Story rate = (Base Reel Rate × Niche Multiplier × Engagement Multiplier
× Geo Multiplier) × 0.25 per Story.
3x Stories = Story rate × 3.

---

### STEP E — FINAL CALCULATION

Combine all multipliers:

Final Fee = Base Rate × Niche Multiplier × Engagement Multiplier
            × Geo Multiplier × Format Multiplier

Round the final figure to the nearest ₹500.

**Worked example — Shub (YouTube, 326K, Gaming, Tier 3, 60-sec):**
₹1,40,000 × 1.0 × 1.0 × 1.0 × 1.0 = ₹1,40,000

**Worked example — Tech Unboxed (Instagram, 85K, Tech, Tier 3, Full Package):**
₹35,000 × 1.5 × 1.0 × 1.0 × 1.3 = ₹68,250 → rounds to ₹68,500

**Worked example — previous dummy_id (Instagram, 45K, Gaming, Tier 3, 60-sec Reel):**
₹35,000 × 1.0 × 1.2 × 1.0 × 1.0 = ₹42,000
(Previous output was ₹9,000 — this is 4.7x more accurate)

---

### THREE-TIER PACKAGE PRICING FROM BASE FEE

After computing Final Fee (the Standard package rate), derive the other
two tier prices as follows:

Starter package price = Final Fee × 0.55
Standard package price = Final Fee (this IS the final fee)
Premium package price = Final Fee × 1.80

Floor price for Negotiation Brief = Final Fee × 0.70

---

## YOUTUBE ROI PROJECTION TABLE — UPDATE DISPLAY FORMAT

The ROI Projection table on Page 3 of the YouTube deck currently shows
CPM-based rows. Since the pricing model is no longer CPM-based,
the table display must change to reflect the new model clearly.

Replace the current metric rows with these rows instead:

Row 1 — Creator Tier: show the tier label (e.g. "Rising — 300K–600K subs")
Row 2 — Content Niche: show niche and its multiplier (e.g. "Gaming — 1.0x")
Row 3 — Engagement Signal: show view rate % and multiplier (e.g. "11.79% — 1.0x")
Row 4 — Audience Geo: show country and multiplier (e.g. "Tier 3 India — 1.0x")
Row 5 — Integration Format: show format and multiplier (e.g. "60-sec — 1.0x")
Row 6 — Final Calibrated Fee: show the computed final fee in bold

Keep the formula display block at the bottom but update it to show:
"Fee = Base Tier Rate × Niche × Engagement × Geo × Format"

---

# PART 2 — BENCHMARK RANGES: FULL CORRECTION

The benchmark ranges on Page 3 must reflect real Indian market rates
for the creator's specific tier — not a single global range for the entire
platform. The range shown must match the creator's subscriber/follower tier.

---

## YOUTUBE BENCHMARK RANGES (PER TIER, GAMING AS REFERENCE NICHE)

When showing the benchmark bar, use the range for the creator's tier.
Apply the niche multiplier to scale the range for non-Gaming niches.

| Tier    | Subscriber Range    | Low        | High        |
|---------|---------------------|-----------|-------------|
| Nano    | 5K–25K              | ₹4,000    | ₹15,000     |
| Micro   | 25K–100K            | ₹15,000   | ₹60,000     |
| Mid-Tier| 100K–300K           | ₹40,000   | ₹1,20,000   |
| Rising  | 300K–600K           | ₹80,000   | ₹2,50,000   |
| Macro   | 600K–1M             | ₹1,80,000 | ₹5,00,000   |
| Mega    | 1M–5M               | ₹4,00,000 | ₹12,00,000  |
| Elite   | 5M+                 | ₹10,00,000| ₹40,00,000  |

For non-Gaming niches: multiply both Low and High by the niche multiplier.
Example: Tech channel at Rising tier → Low: ₹80,000 × 1.6 = ₹1,28,000
                                       High: ₹2,50,000 × 1.6 = ₹4,00,000

The benchmark bar note must read:
"Industry range for [Tier Label] YouTube creators in [Niche] niche,
Indian market, 2026."

---

## INSTAGRAM BENCHMARK RANGES (PER TIER, PER REEL)

| Tier       | Follower Range  | Low       | High       |
|------------|-----------------|----------|------------|
| Nano       | 1K–10K          | ₹3,000   | ₹12,000    |
| Micro Low  | 10K–30K         | ₹8,000   | ₹30,000    |
| Micro High | 30K–100K        | ₹20,000  | ₹70,000    |
| Mid-Tier   | 100K–300K       | ₹60,000  | ₹1,80,000  |
| Rising     | 300K–600K       | ₹1,50,000| ₹4,50,000  |
| Macro      | 600K–1M         | ₹3,50,000| ₹9,00,000  |
| Mega       | 1M+             | ₹8,00,000| ₹25,00,000 |

Apply niche multiplier to both Low and High for non-baseline niches.
The benchmark bar note must read:
"Industry range for [Tier Label] Instagram creators in [Niche] niche,
Indian market, per Reel, 2026."

---

# PART 3 — YOUTUBE FORMAT DROPDOWN FIX

---

## FORMAT FIX 01 — Remove Instagram Formats from YouTube Wizard

The YouTube wizard currently offers "Full Package (1 Reel + 3 Stories)"
as an integration format option. Reels and Stories are Instagram concepts.
They must not appear anywhere in the YouTube flow.

Find the integration format selector in the YouTube wizard component
(YoutubeWizard — created during the previous template separation instruction).

Replace the current format options with these YouTube-only options:

Option 1: "15-second mention" — end card or transition shoutout
Option 2: "30-second shoutout" — brief mid-roll callout
Option 3: "60-second integration" ← mark this as "Most Popular"
Option 4: "Dedicated video" — full video built around the brand
Option 5: "Dedicated video + Community post" — video plus a Community tab post

Remove from the YouTube wizard entirely:
— Any option containing the word "Reel"
— Any option containing the word "Stories"
— Any option containing the word "Instagram"

These are Instagram-only formats. They must only appear in the Instagram wizard.

---

## FORMAT FIX 02 — Update YouTube Deliverables in Tier Package Table

The three-tier package table on Page 3 of the YouTube deck must use
YouTube-specific deliverable descriptions — not Instagram ones.

Starter package deliverable: "30-second brand shoutout"
Standard package deliverable: "60-second dedicated integration (Recommended)"
Premium package deliverable: "Dedicated video + Community post"

The Monthly Retainer row should read:
"Monthly Retainer Estimate ([posting frequency × 4 weeks])"
For YouTube, calculate using the creator's average upload frequency
based on their recent video history pulled from the YouTube API.
If frequency is unavailable, default to "4 videos/month".

---

## FORMAT FIX 03 — Update YouTube PDF Page 1 Footer

Page 1 of the YouTube deck currently shows:
"Target placement: Full Package (1 Reel + 3 Stories)"

This is an Instagram label appearing on a YouTube deck — a direct result
of the format dropdown bug above.

After fixing the format dropdown, ensure the footer on Page 1 of the
YouTube template reads the user's actual selected format:
"Target placement: [selected format label from YouTubeWizard]"

Verify this is reading from the correct YouTube-specific template variable
and not from a shared variable that the Instagram flow also writes to.

---

# PART 4 — ADDITIONAL IMPROVEMENTS

---

## IMPROVEMENT 01 — Add Pricing Transparency Note to Page 3

After the ROI table on Page 3 of both decks, add a one-paragraph
pricing methodology note. This builds trust with brands who are
used to vague "rate card" PDFs with no explanation.

The note should say (adapt slightly for each platform):
"This valuation is calculated using SponsorScout's tiered rate engine,
not AdSense CPM data. It reflects actual brand-to-creator transaction
benchmarks from the Indian influencer market in 2026, adjusted for
niche commercial value, audience engagement depth, and geographic reach.
All figures represent fair market value for a direct brand deal — they
do not account for platform agency fees or exclusivity premiums."

---

## IMPROVEMENT 02 — Add "Why This Price?" Tooltip on Page 1

On the website preview (before unlock), add a small
"How is this calculated?" text link or icon below the blurred price box.

When tapped or hovered, it shows a brief popup explaining:
"Your rate is based on your subscriber/follower tier, content niche
commercial value, engagement quality, and audience geography.
This is the market rate — not an estimate based on AdSense."

This directly addresses the creator's biggest doubt before paying:
"Is this number actually real or is it just a guess?"

---

## IMPROVEMENT 03 — Engagement Signal Label on YouTube Page 1

The third stat card on Page 1 of the YouTube deck currently says
"AVG. VIEW RATE". This is correct.

Additionally, based on the view rate value, add a one-line context
caption below the stat card:

If view rate is above 15%: "Exceptional — top 10% of channels at this tier"
If view rate is 9%–15%: "Healthy — well above industry average"
If view rate is 5%–9%: "Average — typical for this subscriber range"
If view rate is below 5%: "Below average — brands may negotiate down"

This gives the creator context about their performance before they
send the deck — and prevents them from being blindsided when a brand
questions their stats.

---

# PART 5 — QA TEST CASES

Run these after implementing all parts above.

---

## TEST CASE 01 — YouTube: Shub (326K Gaming, boAt)

Input (from the uploaded PDF, previously tested):
Subscribers: 326,000 | Avg Views: 38,441 | Niche: Gaming
Brand: boAt | Geo: Tier 3 India | Format: 60-second integration

Expected pricing calculation:
Tier: Rising (300,001–600,000) → Base: ₹1,40,000
Niche: Gaming → 1.0x → ₹1,40,000
Engagement: 11.79% view rate → 1.0x → ₹1,40,000
Geo: Tier 3 India → 1.0x → ₹1,40,000
Format: 60-sec integration → 1.0x → ₹1,40,000
Final: ₹1,40,000

Tier packages:
Starter (30-sec shoutout): ₹1,40,000 × 0.55 = ₹77,000
Standard (60-sec integration): ₹1,40,000
Premium (Dedicated video + Community post): ₹1,40,000 × 1.80 = ₹2,52,000
Monthly Retainer (4 videos): ₹1,40,000 × 4 = ₹5,60,000

Benchmark bar range for Rising tier, Gaming:
Low: ₹80,000 | High: ₹2,50,000
Shub's ₹1,40,000 marker should sit at approximately 37% of the bar.
That is a visually meaningful, mid-range position.

Page 1 footer must read:
"Target placement: 60-second integration"
NOT "Full Package (1 Reel + 3 Stories)"

Page 1 third stat card: "11.79% AVG. VIEW RATE"
with caption: "Healthy — well above industry average"

---

## TEST CASE 02 — Instagram: Tech Unboxed (85K Tech, boAt)

Input:
Followers: 85,000 | Avg Reel Plays: 45,000
Likes: 4,200 | Comments: 180 | Shares: 520 | Saves: 980
Niche: Tech & Gadgets | Geo: India (Tier 3) | Format: Full Package

Expected pricing calculation:
Tier: Micro High (30,001–100,000) → Base Reel: ₹35,000
Niche: Tech & Gadgets → 1.5x → ₹52,500
Engagement: true rate = 6.92% → 1.0x → ₹52,500
Geo: Tier 3 India → 1.0x → ₹52,500
Format: Full Package (1 Reel + 3 Stories) → 1.30x → ₹68,250 → rounds to ₹68,500

Tier packages:
Starter (3x Stories): ₹68,500 × 0.55 = ₹37,500
Standard (Full Package): ₹68,500
Premium (2 Reels + 5 Stories + Link in Bio): ₹68,500 × 1.80 = ₹1,23,500
Monthly Retainer: ₹68,500 × 10 = ₹6,85,000
(2–3x per week = 10 posts per month)

Benchmark bar range for Micro High tier, Tech niche:
Base range: Low ₹20,000 | High ₹70,000
After Tech multiplier (1.5x): Low ₹30,000 | High ₹1,05,000
Tech Unboxed at ₹68,500 → marker at approximately 58% of bar.

---

## TEST CASE 03 — Instagram: Previous dummy_id (45K Gaming, WheyProtein)

This was the most visible bug — old output was ₹9,000.

Input:
Followers: 45,000 | Avg Reel Plays: 50,000 | Niche: Gaming
Geo: Tier 3 India | Format: 60-sec Reel (Reels Only)

Expected new calculation:
Tier: Micro High (30,001–100,000) → Base Reel: ₹35,000
Niche: Gaming → 1.0x → ₹35,000
Engagement: reach ratio = 50,000/45,000 × 100 = 111.1%
→ 40%+ bracket → 1.5x → ₹52,500
Geo: Tier 3 India → 1.0x → ₹52,500
Format: 60-sec Reel → 1.0x → ₹52,500 → rounds to ₹52,500

New output: ₹52,500
Old output was: ₹9,000
Improvement: 5.8x closer to real market rate.

Benchmark range for Micro High, Gaming:
Base: ₹20,000–₹70,000 (Gaming = 1.0x, no multiplier)
dummy_id at ₹52,500 → marker at approximately 47% of bar.

---

## TEST CASE 04 — YouTube: Format Dropdown Verification

Open the YouTube wizard.
Verify the integration format dropdown contains ONLY:
— 15-second mention
— 30-second shoutout
— 60-second integration
— Dedicated video
— Dedicated video + Community post

Verify there is NO option containing the words:
"Reel", "Stories", "Instagram", or "Full Package"

If any Instagram-format string is present in the YouTube dropdown,
the bug is not fixed. Go back and remove it.

---

# PART 6 — DO NOT TOUCH LIST

Do not modify any of the following:
- Instagram wizard component and its 7-step form
- Authenticity Score calculation logic
- Data freshness indicator
- Screenshot guidance tooltips
- Reach-to-Follower Ratio vs True Engagement Rate label switching
- YouTube API data fetching logic
- Topmate checkout and Loop-back interceptor
- POST /api/unlock-channel and Shared Secret middleware
- Vercel environment variables
- Resend and Cloudflare email routing
- Marketing storefront and landing page
- Api2Pdf call structure
- Upstash Redis caching

---

*End of Antigravity Instruction File v4.0*
*SponsorScout Pricing Engine Rebuild | 23-05-2026 | Lucknow, India*
