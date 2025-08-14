# Supabase Setup Guide for Analog Vibes App

This guide will help you set up Supabase for your vinyl collection app.

## Prerequisites

- A Supabase account (free tier is sufficient to start)
- Your existing Discogs API credentials

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `analog-vibes` or similar
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait for the project to be ready (2-3 minutes)

## Step 2: Configure Database Schema

1. In your Supabase dashboard, go to the **SQL Editor**
2. Copy the entire contents of `docs/database/schema.sql`
3. Paste it into the SQL editor
4. Click **RUN** to execute the schema creation

This will create:

- ✅ User profiles table with RLS (Row Level Security)
- ✅ Master releases and vinyl releases tables
- ✅ User collections table for personal data
- ✅ Sync logs for tracking Discogs sync history
- ✅ Useful views for complex queries
- ✅ Automatic triggers for timestamp updates

## Step 3: Get Your Supabase Keys

1. Go to **Settings** → **API** in your Supabase dashboard
2. Copy these values:
   - **Project URL** (e.g., `https://your-project.supabase.co`)
   - **Public anon key** (starts with `eyJ...`)

⚠️ **Never commit the `service_role` key to your repository!**

## Step 4: Configure Environment Variables

1. Copy your `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Supabase credentials:

   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

   # Keep your existing Discogs configuration
   VITE_DISCOGS_PERSONAL_ACCESS_TOKEN=your_discogs_token
   VITE_DISCOGS_USERNAME=your_discogs_username
   ```

## Step 5: Configure Authentication

1. In Supabase dashboard, go to **Authentication** → **Settings**
2. Configure your auth settings:
   - **Site URL**: `http://localhost:5173` (for development)
   - **Additional redirect URLs**: Add your production URLs when ready
   - Enable/disable providers as needed (Email is enabled by default)

## Step 6: Test the Setup

1. Start your development server:

   ```bash
   npm run dev
   ```

2. Open your app and try to:
   - ✅ Create a new account
   - ✅ Sign in with your account
   - ✅ Sync your Discogs collection
   - ✅ See real-time updates

## Step 7: Production Deployment

When you're ready to deploy:

1. **Update Site URLs**: In Supabase Auth settings, add your production domain
2. **Update Environment Variables**: Set production environment variables
3. **Enable RLS Policies**: Ensure all tables have proper Row Level Security
4. **Set up backups**: Enable automatic backups in Supabase dashboard

## Migration from LocalForage

Your existing data will remain in LocalForage, but new data will be stored in Supabase. The app will:

1. **Automatically migrate** when you first sync with Supabase
2. **Preserve LocalForage** as offline backup (for now)
3. **Use Supabase** as primary data source

### Optional: Remove LocalForage Later

Once you're confident in the Supabase setup, you can:

1. Remove `localforage` dependency: `npm uninstall localforage`
2. Remove `src/services/cacheService.ts`
3. Update imports to use only Supabase

## Troubleshooting

### Common Issues

**1. "Missing Supabase configuration" error**

- Ensure your `.env` file has correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart your dev server after changing environment variables

**2. "User not authenticated" errors**

- Check if user is signed in
- Verify RLS policies are set up correctly
- Check browser console for authentication errors

**3. Database connection errors**

- Verify your Supabase project is active
- Check if database schema was created correctly
- Ensure network connection to Supabase

**4. Sync errors**

- Verify Discogs credentials are still valid
- Check Discogs API rate limits
- Review sync logs in `collection_sync_logs` table

### Getting Help

1. **Supabase Docs**: [docs.supabase.com](https://docs.supabase.com)
2. **Supabase Discord**: Active community support
3. **Check browser console**: Most errors are logged there
4. **Review database logs**: In Supabase dashboard → Logs

## Security Notes

✅ **What's Secure**:

- All user data is isolated by Row Level Security
- Passwords are hashed by Supabase Auth
- API keys are validated server-side
- Real-time subscriptions are user-scoped

⚠️ **Keep Secure**:

- Never commit `.env` files
- Use different keys for development/production
- Regularly rotate your Discogs API tokens
- Monitor your Supabase logs for unusual activity

## Next Steps

Once your Supabase setup is working:

1. **Add more features**:
   - Collection sharing with friends
   - Wishlist functionality
   - Advanced analytics
   - Export/import capabilities

2. **Optimize performance**:
   - Add database indexes for your specific queries
   - Enable connection pooling for high traffic
   - Set up read replicas if needed

3. **Production readiness**:
   - Set up automated backups
   - Configure monitoring and alerts
   - Plan for database scaling

Enjoy your cloud-powered vinyl collection! 🎵
