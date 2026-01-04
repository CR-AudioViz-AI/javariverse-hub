// ================================================================================
// CR AUDIOVIZ AI - CENTRAL AUTH PACKAGE
// Single source of truth for authentication across all apps
// ================================================================================

import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// =============================================================================
// CONFIGURATION
// =============================================================================

export const AUTH_CONFIG = {
  cookieName: 'sb-auth-token',
  cookieOptions: {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
  redirects: {
    login: '/login',
    callback: '/auth/callback',
    afterLogin: '/dashboard',
    afterLogout: '/',
  },
};

// =============================================================================
// PERMANENT SUPERADMINS (CANNOT BE REVOKED)
// =============================================================================

const PERMANENT_SUPERADMINS = [
  'royhenderson@craudiovizai.com',
  'roy@craudiovizai.com',
];

const PERMANENT_ADMINS = [
  'cindyhenderson@craudiovizai.com',
  'info@craudiovizai.com',
];

// =============================================================================
// SUPABASE CLIENT
// =============================================================================

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseClient) return supabaseClient;
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key) return null;
  
  supabaseClient = createClient(url, key, {
    auth: {
      autoRefreshToken: true,
      persistSession: false,
    },
  });
  
  return supabaseClient;
}

// =============================================================================
// ROLE MANAGEMENT
// =============================================================================

export type UserRole = 'super_admin' | 'admin' | 'platform_admin' | 'user' | 'guest';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  permissions: string[];
  isPermanentSuperAdmin: boolean;
  isPermanentAdmin: boolean;
  metadata?: Record<string, any>;
}

export function getPermanentRole(email: string): UserRole | null {
  if (PERMANENT_SUPERADMINS.includes(email.toLowerCase())) {
    return 'super_admin';
  }
  if (PERMANENT_ADMINS.includes(email.toLowerCase())) {
    return 'admin';
  }
  return null;
}

export async function getUserRole(userId: string, email: string): Promise<UserRole> {
  // Check permanent roles first
  const permanentRole = getPermanentRole(email);
  if (permanentRole) return permanentRole;
  
  // Check DB for role
  const supabase = getSupabaseClient();
  if (!supabase) return 'user';
  
  try {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();
    
    if (data?.role) return data.role as UserRole;
    
    // Check profiles table as fallback
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    
    if (profile?.role) return profile.role as UserRole;
    
    return 'user';
  } catch {
    return 'user';
  }
}

// =============================================================================
// SESSION MANAGEMENT
// =============================================================================

export async function getSession(request: NextRequest): Promise<{ user: User; session: Session } | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  
  // Try authorization header first
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (user && !error) {
      return { user, session: { access_token: token } as Session };
    }
  }
  
  // Try cookie
  const cookie = request.cookies.get(AUTH_CONFIG.cookieName);
  if (cookie?.value) {
    const { data: { user }, error } = await supabase.auth.getUser(cookie.value);
    if (user && !error) {
      return { user, session: { access_token: cookie.value } as Session };
    }
  }
  
  return null;
}

export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  const sessionData = await getSession(request);
  if (!sessionData?.user) return null;
  
  const { user } = sessionData;
  const email = user.email || '';
  const role = await getUserRole(user.id, email);
  
  return {
    id: user.id,
    email,
    role,
    permissions: getPermissionsForRole(role),
    isPermanentSuperAdmin: PERMANENT_SUPERADMINS.includes(email.toLowerCase()),
    isPermanentAdmin: PERMANENT_ADMINS.includes(email.toLowerCase()),
    metadata: user.user_metadata,
  };
}

function getPermissionsForRole(role: UserRole): string[] {
  const permissions: Record<UserRole, string[]> = {
    super_admin: ['*'], // All permissions
    admin: ['read:*', 'write:*', 'admin:users', 'admin:content'],
    platform_admin: ['read:*', 'write:own', 'admin:content'],
    user: ['read:own', 'write:own'],
    guest: ['read:public'],
  };
  return permissions[role] || permissions.guest;
}

// =============================================================================
// AUTH MIDDLEWARE HELPERS
// =============================================================================

export async function requireAuth(request: NextRequest): Promise<AuthUser | NextResponse> {
  const user = await getAuthUser(request);
  
  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required', code: 'UNAUTHORIZED' },
      { status: 401 }
    );
  }
  
  return user;
}

export async function requireRole(
  request: NextRequest, 
  allowedRoles: UserRole[]
): Promise<AuthUser | NextResponse> {
  const result = await requireAuth(request);
  
  if (result instanceof NextResponse) return result;
  
  const user = result;
  
  // Super admins always have access
  if (user.role === 'super_admin') return user;
  
  if (!allowedRoles.includes(user.role)) {
    return NextResponse.json(
      { error: 'Insufficient permissions', code: 'FORBIDDEN', required: allowedRoles },
      { status: 403 }
    );
  }
  
  return user;
}

export async function requireAdmin(request: NextRequest): Promise<AuthUser | NextResponse> {
  return requireRole(request, ['super_admin', 'admin', 'platform_admin']);
}

export async function requireSuperAdmin(request: NextRequest): Promise<AuthUser | NextResponse> {
  return requireRole(request, ['super_admin']);
}

// =============================================================================
// AUDIT LOGGING
// =============================================================================

export async function logAuthEvent(
  userId: string | null,
  action: string,
  details: Record<string, any>
): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  
  try {
    await supabase.from('audit_logs').insert({
      user_id: userId,
      action: `auth:${action}`,
      resource_type: 'auth',
      details,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to log auth event:', error);
  }
}

// =============================================================================
// BREAK GLASS RECOVERY
// =============================================================================

export async function breakGlassRecovery(
  adminEmail: string,
  reason: string
): Promise<{ success: boolean; message: string }> {
  // Only permanent superadmins can use break glass
  if (!PERMANENT_SUPERADMINS.includes(adminEmail.toLowerCase())) {
    return { success: false, message: 'Only permanent superadmins can use break glass recovery' };
  }
  
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, message: 'Database unavailable' };
  }
  
  // Log the break glass event
  await supabase.from('audit_logs').insert({
    action: 'auth:break_glass_recovery',
    resource_type: 'system',
    details: {
      admin_email: adminEmail,
      reason,
      timestamp: new Date().toISOString(),
    },
    created_at: new Date().toISOString(),
  });
  
  return { success: true, message: 'Break glass recovery executed - check audit logs' };
}

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  AUTH_CONFIG,
  getSupabaseClient,
  getSession,
  getAuthUser,
  getUserRole,
  getPermanentRole,
  requireAuth,
  requireRole,
  requireAdmin,
  requireSuperAdmin,
  logAuthEvent,
  breakGlassRecovery,
};
