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

## 4. Real AI Product Moderation

The app includes a Supabase Edge Function at `supabase/functions/moderate-product`.
It calls OpenAI with `gpt-5.6-luna` to review the product title, category,
description, and image before the product is published.

Set these Supabase Function secrets before deploying:

```env
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_MODERATION_MODEL=gpt-5.6-luna
```

Deploy the function with the Supabase CLI:

```bash
supabase functions deploy moderate-product --project-ref xtsftlypnijexkisctli
supabase secrets set OPENAI_API_KEY=sk-your-openai-api-key --project-ref xtsftlypnijexkisctli
supabase secrets set OPENAI_MODERATION_MODEL=gpt-5.6-luna --project-ref xtsftlypnijexkisctli
```

Never commit the OpenAI API key into this repo or any `VITE_` frontend
environment variable.
