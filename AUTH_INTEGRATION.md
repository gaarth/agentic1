# Supabase Authentication Integration

## 📁 File Structure

```
src/
├── app/
│   ├── auth/
│   │   ├── sign-in/
│   │   │   └── page.tsx                 # Sign-in page
│   │   ├── sign-up/
│   │   │   └── page.tsx                 # Sign-up page
│   │   └── callback/
│   │       └── route.ts                 # OAuth callback handler
│   └── layout.tsx                        # Root layout with AuthProvider
├── components/
│   ├── auth/
│   │   ├── sign-in-form.tsx             # Sign-in form component
│   │   ├── sign-up-form.tsx             # Sign-up form component
│   │   ├── user-menu.tsx                # User menu with sign-out
│   │   └── protected-route.tsx          # Protected route wrapper
│   └── providers/
│       └── auth-provider.tsx            # Auth context provider
├── lib/
│   └── supabase/
│       ├── client.ts                    # Browser Supabase client
│       ├── server.ts                    # Server Supabase client
│       └── middleware.ts                # Session management helper
└── middleware.ts                         # Route protection middleware

```

## 🔑 Environment Setup

1. **Configure Supabase credentials** in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

2. **Enable Google OAuth** in Supabase dashboard:
   - Go to Authentication → Providers
   - Enable Google provider
   - Add your OAuth credentials
   - Add authorized redirect URL: `http://localhost:3000/auth/callback` (development)
   - Add production URL when deployed

## 🔐 Authentication Features

### ✅ Email & Password Authentication
- **Sign Up**: `/auth/sign-up`
  - Email validation
  - Password confirmation
  - Minimum password length (6 characters)
  - Duplicate email detection

- **Sign In**: `/auth/sign-in`
  - Email/password validation
  - Error handling for invalid credentials

### ✅ Google OAuth
- One-click sign-in with Google
- Automatic account creation
- Secure redirect flow

### ✅ Session Management
- Persistent sessions across page refreshes
- Automatic session refresh
- Cookie-based authentication (secure, httpOnly)

### ✅ Route Protection
- **Middleware-based** protection (recommended)
- Automatic redirects:
  - Unauthenticated users → `/auth/sign-in`
  - Authenticated users on auth pages → `/dashboard`
- Public routes: `/`, `/auth/*`
- Protected routes: Everything else

## 🚀 Usage

### Using the Auth Provider

The `AuthProvider` is already integrated in the root layout. Access auth state anywhere:

```tsx
'use client'

import { useAuth } from '@/components/providers/auth-provider'

export function MyComponent() {
  const { user, loading, signOut } = useAuth()

  if (loading) return <div>Loading...</div>
  if (!user) return <div>Not authenticated</div>

  return (
    <div>
      <p>Welcome, {user.email}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  )
}
```

### Adding User Menu to Dashboard

Add the `UserMenu` component to your dashboard header:

```tsx
import { UserMenu } from '@/components/auth/user-menu'

export function DashboardHeader() {
  return (
    <header>
      {/* Your existing header content */}
      <UserMenu />
    </header>
  )
}
```

### Server-Side User Access

Access user data in Server Components:

```tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/sign-in')
  }

  return <div>Welcome, {user.email}</div>
}
```

### Protected Route Wrapper (Optional)

Use the `ProtectedRoute` component for client-side protection:

```tsx
import { ProtectedRoute } from '@/components/auth/protected-route'

export default function MyProtectedPage() {
  return (
    <ProtectedRoute>
      <div>This content is only visible to authenticated users</div>
    </ProtectedRoute>
  )
}
```

## 🔒 Security Features

- ✅ HttpOnly cookies (prevents XSS attacks)
- ✅ Secure session storage
- ✅ CSRF protection
- ✅ Automatic session refresh
- ✅ Server-side session validation
- ✅ Middleware-based route protection
- ✅ No hardcoded secrets (environment variables only)

## 📝 Auth Flow Diagram

```
User Action                 Client                 Supabase               Server
─────────────────────────────────────────────────────────────────────────────

1. Sign Up/In              →  Submit credentials   →  Validate            
                                                    ←  Return session     
                           ←  Store session cookies ←                     

2. Navigate to page        →  Request with cookies →  Middleware validates
                                                    ←  Allow/redirect     

3. Access protected data   →  Request with session →  Verify user        
                                                    ←  Return user data   

4. Sign Out                →  Call signOut()       →  Invalidate session 
                           ←  Clear cookies        ←                     
                           →  Redirect to sign-in                        
```

## 🧪 Testing Authentication

1. **Start dev server**: Already running at `http://localhost:3000`

2. **Test Sign Up**:
   - Navigate to `/auth/sign-up`
   - Enter email and password
   - Should redirect to `/dashboard` on success

3. **Test Sign In**:
   - Navigate to `/auth/sign-in`
   - Use created credentials
   - Should redirect to `/dashboard`

4. **Test Google OAuth**:
   - Click "Continue with Google" button
   - Complete Google authentication
   - Should redirect back to `/dashboard`

5. **Test Route Protection**:
   - Sign out
   - Try accessing `/dashboard`
   - Should redirect to `/auth/sign-in`

6. **Test Session Persistence**:
   - Sign in
   - Refresh the page
   - Should remain authenticated

## 🛠️ Customization

### Changing Protected Routes

Edit `src/lib/supabase/middleware.ts`:

```ts
// Example: Make /pricing a protected route
if (!user && !request.nextUrl.pathname.startsWith('/auth') && 
    request.nextUrl.pathname !== '/' && 
    request.nextUrl.pathname !== '/pricing') {
  // redirect to sign-in
}
```

### Changing Redirect Destinations

- **After sign-in**: Edit redirect in `sign-in-form.tsx` and `sign-up-form.tsx`
- **After sign-out**: Edit `signOut()` function in `auth-provider.tsx`
- **Unauthenticated access**: Edit middleware redirect logic

### Adding Additional OAuth Providers

1. Enable provider in Supabase dashboard
2. Update forms to include new provider button:

```tsx
const handleGitHubSignIn = async () => {
  const supabase = createClient()
  await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })
}
```

## 🐛 Troubleshooting

### "Invalid login credentials"
- Check that email/password are correct
- Ensure user exists in Supabase dashboard

### OAuth not working
- Verify redirect URL in Supabase dashboard matches your app
- Check that OAuth provider is enabled
- Ensure OAuth credentials are correctly configured

### Session not persisting
- Check that cookies are enabled in browser
- Verify environment variables are set correctly
- Check browser console for errors

### TypeScript errors
- All files use proper TypeScript types
- Run `npm run lint` to check for issues

## 📚 Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js App Router with Supabase](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Supabase JS Client Reference](https://supabase.com/docs/reference/javascript/auth-api)

## ✅ Implementation Checklist

- [x] Supabase client setup (browser & server)
- [x] Middleware for route protection
- [x] Sign-in page with email/password
- [x] Sign-up page with email/password
- [x] Google OAuth integration
- [x] OAuth callback handler
- [x] Auth state provider
- [x] User menu component with sign-out
- [x] Protected route wrapper
- [x] TypeScript types for all auth code
- [x] Session persistence across refreshes
- [x] Automatic redirects based on auth state
- [x] Environment variables template
- [x] Documentation

Authentication is now fully integrated and production-ready! 🎉
