# Deployment & Migration Roadmap

This roadmap outlines the plan to migrate the `SignalPro` application from its current local SQLite-based architecture to a production-ready setup on Render with Supabase.

## Current Architecture
- **Server:** Node/Express running in a single container.
- **Database:** Local `sqlite3` file (`trading.db`).
- **Scheduling:** `setInterval` inside the main process (susceptible to spin-downs).

## Target Architecture (Deployment Ready)

### 1. Database & Auth: Supabase
- **Database:** Migrate all SQLite tables to **Supabase (PostgreSQL)**.
- **Auth:** Use **Supabase Auth** to manage user sessions, replacing the current local database `auth_settings`.
- **Reasoning:** Supabase provides a managed, scalable database that is easily accessible by the Render backend and handles authentication securely. It has a generous free tier.

### 2. Backend Hosting: Render
- **Server:** Host the Node/Express backend on **Render**.
- **Reasoning:** Render offers a managed environment for Node.js applications with native support for `git` deployments.

### 3. Background Tasks & Reliability: Cron-job.org
- **Cron Job:** We will use **Cron-job.org** (or Render's "Cron Job" feature) to ping `/api/health` every 5-10 minutes. 
- **Reasoning:** This keeps the Render backend active, ensuring `setInterval` reliably continues running and processing signals, even if no admin is logged in or active in the UI.

## Transition Plan (Step-by-Step)

### Phase 1: Database Setup
- [ ] Create a new project in Supabase.
- [ ] Create the database tables in Supabase (PostgreSQL) equivalent to our current SQLite schema.
- [ ] Update `server.ts` to connect to Supabase instead of `trading.db`.

### Phase 2: Refactoring
- [ ] Update the authentication logic in the UI and backend to use `supabase-js`.
- [ ] Update all database queries in `server.ts` to use PostgreSQL syntax.

### Phase 3: Deployment
- [ ] Configure `render.yaml` (a blueprint file) for automated deployment from GitHub.
- [ ] Set environment variables in Render (Supabase URL, API Keys).

### Phase 4: Verification
- [ ] Deploy and verify the background processing (`setInterval`) is active via Cron-job.org.
- [ ] Ensure all existing interactions (Telegram notifications, Signal processing) work as expected.
