import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Allowed apps for cross-app SSO redirects
const ALLOWED_DOMAINS = [
  'cravcards.com',
  'javariai.com',
  'craudiovizai.com',
  'localhost:3000',
  'localhost:3001',
  'localhost:3002',
  // Add Vercel preview URLs
  '.vercel.app',
];

function isAllowedRedirect(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ALLOWED_DOMAINS.some(domain => {
      if (domain.startsWith('.')) {
        return parsed.hostname.endsWith(domain);
      }
      return parsed.hostname === domain || parsed.hostname.endsWith('.' + domain);
    });
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const redirect = requestUrl.searchParams.get('redirect')
  const origin = requestUrl.origin

  if (code) {
    const supabase = createClient()

    // Exchange code for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.session) {
      const user = data.user
      const session = data.session
      
      // Check if redirect is to an external app
      if (redirect && isAllowedRedirect(redirect)) {
        // Build redirect URL with auth tokens for cross-app SSO
        const redirectUrl = new URL(redirect)
        
        // Add tokens as URL params (the receiving app will consume these)
        redirectUrl.searchParams.set('access_token', session.access_token)
        redirectUrl.searchParams.set('refresh_token', session.refresh_token)
        redirectUrl.searchParams.set('expires_at', session.expires_at?.toString() || '')
        
        return NextResponse.redirect(redirectUrl.toString())
      }
      
      // Check if user is admin for internal redirects
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin, role')
          .eq('id', user.id)
          .single()

        // Create or update profile if it doesn't exist
        if (!profile) {
          await supabase.from('profiles').upsert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
            avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
            is_admin: false,
            role: 'user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
        }

        // Redirect based on role
        if (profile?.is_admin) {
          return NextResponse.redirect(`${origin}/admin`)
        }
      }
      
      // Default redirect to dashboard
      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  // Return to login on error
  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
