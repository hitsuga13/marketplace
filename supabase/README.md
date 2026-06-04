# Supabase Setup

Purpose: Keep the online database setup for UPNM Campus Marketplace inside the repo.

## 1. Create Tables

Open Supabase Dashboard, go to **SQL Editor**, paste everything from `supabase/schema.sql`, then click **Run**.

## 2. Environment Variables

Local development uses `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_public_key_here
```

For GitHub Pages or another host, add the same values as deployment environment variables.

## 3. Important

Only use the publishable/anon key in frontend code. Do not put the Supabase `service_role` secret key in this project.
