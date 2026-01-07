/**
 * Auth Providers Configuration - Single Source of Truth
 * 
 * This file defines ALL available authentication methods for the platform.
 * Both login and signup pages consume this config to ensure consistency.
 * 
 * Supabase OAuth providers: https://supabase.com/docs/guides/auth/social-login
 * 
 * @timestamp January 7, 2026 - 11:43 AM EST
 * @author Claude (for Roy Henderson)
 */

import { Provider } from '@supabase/supabase-js';

// ============================================================================
// PROVIDER DEFINITIONS
// ============================================================================

export type AuthProviderType = 'oauth' | 'email' | 'magic_link' | 'phone' | 'sso';

export interface AuthProviderConfig {
  id: string;
  name: string;
  type: AuthProviderType;
  // For OAuth providers, this must match Supabase's Provider type
  supabaseProvider?: Provider;
  // Icon component name or SVG path
  icon: 'google' | 'github' | 'apple' | 'microsoft' | 'discord' | 'twitter' | 'facebook' | 'linkedin' | 'email' | 'magic' | 'phone' | 'sso';
  // Environment variable that must be set for this provider to be enabled
  envKey?: string;
  // Brand colors for the button
  colors: {
    bg: string;
    bgHover: string;
    text: string;
    border?: string;
  };
  // Is this provider currently enabled?
  enabled: boolean;
  // Display order (lower = first)
  order: number;
}

// ============================================================================
// OAUTH PROVIDERS - ALL ENABLED
// ============================================================================

export const OAUTH_PROVIDERS: AuthProviderConfig[] = [
  {
    id: 'google',
    name: 'Google',
    type: 'oauth',
    supabaseProvider: 'google',
    icon: 'google',
    envKey: 'GOOGLE_CLIENT_ID',
    colors: {
      bg: 'bg-white',
      bgHover: 'hover:bg-gray-50',
      text: 'text-gray-700',
      border: 'border-gray-300',
    },
    enabled: true,
    order: 1,
  },
  {
    id: 'github',
    name: 'GitHub',
    type: 'oauth',
    supabaseProvider: 'github',
    icon: 'github',
    envKey: 'GITHUB_CLIENT_ID',
    colors: {
      bg: 'bg-gray-900',
      bgHover: 'hover:bg-gray-800',
      text: 'text-white',
    },
    enabled: true,
    order: 2,
  },
  {
    id: 'apple',
    name: 'Apple',
    type: 'oauth',
    supabaseProvider: 'apple',
    icon: 'apple',
    envKey: 'APPLE_CLIENT_ID',
    colors: {
      bg: 'bg-black',
      bgHover: 'hover:bg-gray-900',
      text: 'text-white',
    },
    enabled: true,
    order: 3,
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    type: 'oauth',
    supabaseProvider: 'azure',
    icon: 'microsoft',
    envKey: 'AZURE_CLIENT_ID',
    colors: {
      bg: 'bg-[#2F2F2F]',
      bgHover: 'hover:bg-[#1F1F1F]',
      text: 'text-white',
    },
    enabled: true,
    order: 4,
  },
  {
    id: 'discord',
    name: 'Discord',
    type: 'oauth',
    supabaseProvider: 'discord',
    icon: 'discord',
    envKey: 'DISCORD_CLIENT_ID',
    colors: {
      bg: 'bg-[#5865F2]',
      bgHover: 'hover:bg-[#4752C4]',
      text: 'text-white',
    },
    enabled: true,
    order: 5,
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    type: 'oauth',
    supabaseProvider: 'twitter',
    icon: 'twitter',
    envKey: 'TWITTER_CLIENT_ID',
    colors: {
      bg: 'bg-black',
      bgHover: 'hover:bg-gray-900',
      text: 'text-white',
    },
    enabled: true,
    order: 6,
  },
  {
    id: 'facebook',
    name: 'Facebook',
    type: 'oauth',
    supabaseProvider: 'facebook',
    icon: 'facebook',
    envKey: 'FACEBOOK_CLIENT_ID',
    colors: {
      bg: 'bg-[#1877F2]',
      bgHover: 'hover:bg-[#166FE5]',
      text: 'text-white',
    },
    enabled: true,
    order: 7,
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    type: 'oauth',
    supabaseProvider: 'linkedin_oidc',
    icon: 'linkedin',
    envKey: 'LINKEDIN_CLIENT_ID',
    colors: {
      bg: 'bg-[#0A66C2]',
      bgHover: 'hover:bg-[#004182]',
      text: 'text-white',
    },
    enabled: true,
    order: 8,
  },
];

// ============================================================================
// EMAIL/PASSWORD AUTH
// ============================================================================

export const EMAIL_PASSWORD_CONFIG: AuthProviderConfig = {
  id: 'email',
  name: 'Email',
  type: 'email',
  icon: 'email',
  colors: {
    bg: 'bg-cyan-600',
    bgHover: 'hover:bg-cyan-700',
    text: 'text-white',
  },
  enabled: true,
  order: 100,
};

// ============================================================================
// MAGIC LINK AUTH
// ============================================================================

export const MAGIC_LINK_CONFIG: AuthProviderConfig = {
  id: 'magic_link',
  name: 'Magic Link',
  type: 'magic_link',
  icon: 'magic',
  colors: {
    bg: 'bg-purple-600',
    bgHover: 'hover:bg-purple-700',
    text: 'text-white',
  },
  enabled: true,
  order: 101,
};

// ============================================================================
// PHONE/SMS AUTH
// ============================================================================

export const PHONE_CONFIG: AuthProviderConfig = {
  id: 'phone',
  name: 'Phone',
  type: 'phone',
  icon: 'phone',
  envKey: 'TWILIO_ACCOUNT_SID',
  colors: {
    bg: 'bg-green-600',
    bgHover: 'hover:bg-green-700',
    text: 'text-white',
  },
  enabled: true,
  order: 102,
};

// ============================================================================
// ENTERPRISE SSO
// ============================================================================

export const SSO_CONFIG: AuthProviderConfig = {
  id: 'sso',
  name: 'Enterprise SSO',
  type: 'sso',
  icon: 'sso',
  envKey: 'SAML_ENABLED',
  colors: {
    bg: 'bg-indigo-600',
    bgHover: 'hover:bg-indigo-700',
    text: 'text-white',
  },
  enabled: true,
  order: 200,
};

// ============================================================================
// FEATURE FLAGS - ALL ENABLED
// ============================================================================

export interface AuthFeatureFlags {
  emailPasswordEnabled: boolean;
  magicLinkEnabled: boolean;
  phoneEnabled: boolean;
  ssoEnabled: boolean;
  forgotPasswordEnabled: boolean;
  signupEnabled: boolean;
}

export const AUTH_FEATURES: AuthFeatureFlags = {
  emailPasswordEnabled: true,
  magicLinkEnabled: true,
  phoneEnabled: true,
  ssoEnabled: true,
  forgotPasswordEnabled: true,
  signupEnabled: true,
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all enabled OAuth providers
 */
export function getEnabledOAuthProviders(): AuthProviderConfig[] {
  return OAUTH_PROVIDERS
    .filter(p => p.enabled)
    .sort((a, b) => a.order - b.order);
}

/**
 * Get all auth methods for rendering
 */
export function getAllAuthMethods(): {
  oauth: AuthProviderConfig[];
  email: AuthProviderConfig | null;
  magicLink: AuthProviderConfig | null;
  phone: AuthProviderConfig | null;
  sso: AuthProviderConfig | null;
} {
  return {
    oauth: getEnabledOAuthProviders(),
    email: AUTH_FEATURES.emailPasswordEnabled ? EMAIL_PASSWORD_CONFIG : null,
    magicLink: AUTH_FEATURES.magicLinkEnabled ? MAGIC_LINK_CONFIG : null,
    phone: AUTH_FEATURES.phoneEnabled ? PHONE_CONFIG : null,
    sso: AUTH_FEATURES.ssoEnabled ? SSO_CONFIG : null,
  };
}

/**
 * Get provider by ID
 */
export function getProviderById(id: string): AuthProviderConfig | undefined {
  const allProviders = [
    ...OAUTH_PROVIDERS,
    EMAIL_PASSWORD_CONFIG,
    MAGIC_LINK_CONFIG,
    PHONE_CONFIG,
    SSO_CONFIG,
  ];
  return allProviders.find(p => p.id === id);
}

/**
 * Export list for testing - ALL PROVIDERS
 */
export const ENABLED_PROVIDER_IDS = [
  ...getEnabledOAuthProviders().map(p => p.id),
  ...(AUTH_FEATURES.emailPasswordEnabled ? ['email'] : []),
  ...(AUTH_FEATURES.magicLinkEnabled ? ['magic_link'] : []),
  ...(AUTH_FEATURES.phoneEnabled ? ['phone'] : []),
  ...(AUTH_FEATURES.ssoEnabled ? ['sso'] : []),
];
