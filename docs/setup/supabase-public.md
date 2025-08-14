# Quick Supabase Setup for Public Vinyl Collection

Your app is now configured as a **public vinyl collection** - no user accounts needed! Just showcase your records with Supabase as the database.

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create account
2. Click **"New Project"**
3. Enter project name: `analog-vibes-public`
4. Choose region and create project
5. Wait ~3 minutes for setup

## Step 2: Set Up Database

1. In Supabase dashboard, go to **SQL Editor**
2. Copy entire contents of `docs/database/public-schema.sql`
3. Paste and click **RUN**

✅ This creates:

- `vinyl_collection` table (your records)
- `sync_metadata` table (sync history)
- Public read access (no auth needed)

## Step 3: Get Your API Keys

1. In Supabase dashboard: **Settings** → **API**
2. Copy these values:

```
Project URL: https://your-project.supabase.co
Publishable key: sb_publishable_... (NOT the anon key - use the new publishable key)
```

⚠️ **Important**: Use the **publishable key** (starts with `sb_publishable_`), not the legacy anon key!

## Step 4: Configure Your App

Update your `.env` file:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...

# Keep your existing Discogs settings
VITE_DISCOGS_PERSONAL_ACCESS_TOKEN=your_token
VITE_DISCOGS_USERNAME=your_username
```

## Step 5: Test It!

```bash
npm run dev
```

Your public vinyl collection should:

- ✅ Load (empty at first)
- ✅ Sync from Discogs when you click sync
- ✅ Store everything in Supabase
- ✅ Be accessible to anyone who visits

## How It Works

- **Public Access**: Anyone can view your collection (no login needed)
- **Admin Only**: Only you can sync/update (via your Discogs credentials)
- **Real Database**: Everything stored in Supabase PostgreSQL
- **No Authentication**: Much simpler than user accounts

## Troubleshooting

**"Invalid API key" error:**

- Double-check your Supabase URL and anon key
- Make sure you copied the full keys
- Restart your dev server: `npm run dev`

**Empty collection:**

- Click the sync button to import from Discogs
- Check browser console for any errors
- Verify your Discogs credentials work

**Database errors:**

- Make sure you ran the SQL schema in Supabase
- Check the SQL Editor for any error messages

## What's Different from Full Auth

This simplified version:

- ❌ No user accounts or login forms
- ❌ No per-user collections
- ❌ No authentication complexity
- ✅ Just your public collection showcase
- ✅ Powered by Supabase database
- ✅ Clean, simple, fast

Perfect for showing off your vinyl collection to the world! 🎵
