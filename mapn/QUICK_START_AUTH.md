# 🚀 Quick Start Guide - Supabase Authentication

## Setup Steps (5 minutes)

### 1. Get Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project or create a new one
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **Anon/Public Key** (long string starting with `eyJ...`)

### 2. Configure Environment Variables

Open `.env.local` and replace with your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 3. Enable Google OAuth (Optional)

1. In Supabase Dashboard: **Authentication** → **Providers**
2. Enable **Google**
3. Add OAuth credentials from [Google Cloud Console](https://console.cloud.google.com/)
4. Add authorized redirect URL:
   ```
   https://your-project.supabase.co/auth/v1/callback
   ```

### 4. Restart Dev Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

### 5. Test Authentication

1. **Visit**: `http://localhost:3000/auth/sign-up`
2. **Create account** with email/password
3. **Should redirect** to `/dashboard`
4. **Test sign out** - should redirect to `/auth/sign-in`

## 🎯 What's Already Working

✅ Email/password sign-up
✅ Email/password sign-in  
✅ Google OAuth (once configured)
✅ Route protection (middleware)
✅ Session persistence
✅ Auto-redirects
✅ Sign out functionality

## 📍 Available Routes

- `/auth/sign-in` - Sign in page
- `/auth/sign-up` - Sign up page
- `/auth/callback` - OAuth callback (automatic)
- `/dashboard` - Protected dashboard (requires auth)
- `/` - Public landing page

## 🔧 Next Steps

### Add UserMenu to Dashboard

Edit `src/app/dashboard/page.tsx`:

```tsx
import { UserMenu } from '@/components/auth'

export default function Dashboard() {
  return (
    <div>
      <header className="flex justify-between items-center p-4">
        <h1>Dashboard</h1>
        <UserMenu />
      </header>
      {/* Rest of dashboard */}
    </div>
  )
}
```

### Access User Data (Server Component)

```tsx
import { createClient } from '@/lib/supabase/server'

export default async function MyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  return <div>Welcome, {user?.email}</div>
}
```

### Access User Data (Client Component)

```tsx
'use client'
import { useAuth } from '@/components/providers/auth-provider'

export function MyComponent() {
  const { user, loading } = useAuth()
  
  if (loading) return <div>Loading...</div>
  return <div>Welcome, {user?.email}</div>
}
```

## 📖 Full Documentation

See `AUTH_INTEGRATION.md` for complete documentation, API reference, and troubleshooting.

## 🎉 You're All Set!

Authentication is fully integrated and production-ready. Just add your Supabase credentials and start testing!
