# SponsorScout Backend Cron & Keep-Alive Guide

This guide details three easy ways to periodically ping your backend to prevent it from going to sleep (especially useful if deployed on free tiers like Render, Railway, or Koyeb).

---

## 1. GitHub Actions Workflow (100% Free & Automated)

We have created an automated GitHub Actions workflow file:
📂 `.github/workflows/keep-awake.yml`

This workflow runs automatically every 14 minutes in the cloud to keep your backend awake.

### Setup Instructions:
1. Push this project to your GitHub Repository.
2. In your repository on GitHub, navigate to **Settings > Secrets and variables > Actions**.
3. Click **New repository secret**.
4. Name the secret **`BACKEND_URL`**.
5. Set the value to your production backend URL (e.g., `https://sponsorscout-backend.onrender.com`).
6. Save the secret.

> [!TIP]
> You can also manually trigger a ping test at any time by going to the **Actions** tab in your repository, selecting the **Keep Backend Awake** workflow, and clicking **Run workflow**.

---

## 2. Zero-Dependency Node.js Script (Local/VPS/PM2)

We have created a highly configurable, zero-dependency Node.js script:
📂 `scripts/keep-alive.js`

This script can be executed once or run continuously in a loop in the background.

### Execution Options:

#### Option A: One-Shot Run (Excellent for OS-level Crontabs / Windows Schedulers)
```bash
# Sets target backend URL and runs a single ping request
BACKEND_URL=https://sponsorscout-backend.onrender.com node scripts/keep-alive.js
```

#### Option B: Persistent Background Loop (Excellent for PM2 or Docker Services)
```bash
# Starts an infinite background loop that pings every 10 minutes (default)
node scripts/keep-alive.js --loop

# Run continuously with customized settings:
BACKEND_URL=https://sponsorscout-backend.onrender.com PING_INTERVAL_MINUTES=12 node scripts/keep-alive.js --loop
```

---

## 3. Free External Cron Services (100% Reliable & Highly Recommended)

Because free-tier cloud runners (including GitHub Actions free tier) can sometimes suffer minor scheduling delays of a few minutes, using an **external web cron service** is the gold standard for keeping backend services continuously active.

Here are the two best free platforms to use:

### A. Cron-Job.org (Recommended)
1. Go to [cron-job.org](https://cron-job.org) and create a free account.
2. Go to **Cron Jobs** in the sidebar and click **Create Cron Job**.
3. Set the following details:
   - **Title**: `SponsorScout Backend Ping`
   - **Address**: `https://<your-backend-url>/`
   - **Schedule**: User-defined / Every 10 or 12 minutes.
4. Click **Create**!

### B. UptimeRobot
1. Go to [uptimerobot.com](https://uptimerobot.com) and create a free account.
2. Click **Add New Monitor**.
3. Set the following details:
   - **Monitor Type**: HTTP(s)
   - **Friendly Name**: `SponsorScout Backend`
   - **URL/IP**: `https://<your-backend-url>/`
   - **Monitoring Interval**: Every 5 or 10 minutes.
4. Click **Create Monitor**. This has the double benefit of keeping your backend awake *and* notifying you if it ever goes down!
