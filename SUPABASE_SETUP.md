# Supabase Setup Guide

## Prerequisites
- A Supabase account and project
- Your Supabase project URL and anon key

## Setup Steps

1. **Environment Variables**
   - Copy `.env.local.example` to `.env.local`
   - Update with your Supabase credentials:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

2. **Database Migration**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Create a new query
   
   **IMPORTANT**: Since we're not using Supabase auth, use the simplified schema:
   - Copy and paste the contents of `lib/supabase/migrations/schema_no_auth.sql`
   - Run the query to create all tables WITHOUT RLS policies
   
   **Alternative**: If you already ran the original schema.sql, you need to disable RLS:
   ```sql
   ALTER TABLE public.appointments DISABLE ROW LEVEL SECURITY;
   ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;
   ALTER TABLE public.expenses DISABLE ROW LEVEL SECURITY;
   ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
   ```

3. **Default User ID**
   - The app uses a default user ID: `00000000-0000-0000-0000-000000000001`
   - All data will be associated with this user ID
   - Password protection is handled at the app level (password: `admin123`)
   - Login persists in localStorage, so admin doesn't need to login repeatedly

4. **Real-time Subscriptions**
   - Real-time updates are enabled for all tables
   - Changes will automatically reflect in the UI

## Features Migrated

- ✅ Appointments management
- ✅ Daily transactions and expenses
- ✅ Monthly summaries
- ✅ Bill generation (client-side only)
- ✅ Real-time updates
- ✅ Simple password protection

## Notes

- No authentication is required for this simple setup
- All operations use server actions for better performance
- Real-time subscriptions update the UI automatically
- The app is optimized for lightweight operation 