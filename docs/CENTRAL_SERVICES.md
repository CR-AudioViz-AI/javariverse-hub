# CR AudioViz AI - Central Services Consolidation

## Overview

All 93 apps in the CR AudioViz AI ecosystem now use centralized services through `craudiovizai.com/api`. This eliminates separate auth, credits, and other service implementations across individual apps.

## Date Completed
January 9, 2026

## Files Updated

### Per App
1. `lib/central-services.ts` - v3.0.0 (871 lines)
2. `lib/supabase.ts` - Standardized with central services integration

### Total Changes
- 93 apps updated with central-services.ts v3.0.0
- 43 apps had supabase.ts standardized
- 3 new API routes created (/api/registry/*)

## Central Services Available

| Service | Endpoint | Description |
|---------|----------|-------------|
| Authentication | `/api/auth/*` | OAuth, Email/Password, Session management |
| Credits | `/api/credits/*` | Balance, Spend, Refund, History, Auto-reload |
| Payments | `/api/payments/*` | Stripe, PayPal, Subscriptions |
| Support | `/api/support/*` | Tickets, Knowledge Base, FAQ |
| Enhancements | `/api/support/enhancements/*` | Feature Requests, Voting |
| Analytics | `/api/analytics/*` | Event Tracking, Page Views |
| Activity | `/api/activity/*` | Audit Trail |
| Notifications | `/api/notifications/*` | Email, Push, In-App |
| Registry | `/api/registry/*` | App Discovery, Health Reporting |
| Recommendations | `/api/recommendations` | Cross-selling |

## Admin Bypass

The following email addresses receive FREE access to all services:
- royhenderson@craudiovizai.com
- cindyhenderson@craudiovizai.com
- roy@craudiovizai.com
- cindy@craudiovizai.com
- admin@craudiovizai.com

## Credit Costs

Standard credit costs defined in central-services.ts:

| Action | Cost |
|--------|------|
| AI Image | 5 credits |
| AI Video | 20 credits |
| AI Audio | 10 credits |
| AI Text/Chat | 1 credit |
| Pattern (Basic) | 3 credits |
| Pattern (Advanced) | 10 credits |
| PDF Generate | 3 credits |
| eBook Generate | 10 credits |
| Invoice Generate | 2 credits |
| Game Play | FREE |

## Usage Examples

### Check and Spend Credits
```typescript
import { CentralServices } from './central-services';

// Check if user can afford action
const { allowed, cost, balance } = await CentralServices.Credits.canAfford('ai_image');

if (allowed) {
  // Spend credits
  await CentralServices.Credits.spendForAction('ai_image', 'my-app-id', 'Generated AI image');
}
```

### Authentication
```typescript
import { CentralAuth } from './central-services';

// Get current session
const session = await CentralAuth.getSession();

// Sign in
await CentralAuth.signIn('user@example.com', 'password');

// OAuth
CentralAuth.oAuthSignIn('google', window.location.href);
```

### Support Tickets
```typescript
import { CentralServices } from './central-services';

// Create ticket
await CentralServices.Support.createTicket(
  'Bug Report',
  'Description of the issue...',
  'bug',
  'my-app-id'
);
```

### Analytics
```typescript
import { CentralServices } from './central-services';

// Track event
await CentralServices.Analytics.track('feature_used', { feature: 'ai_image' }, 'my-app-id');

// Track page view
await CentralServices.Analytics.pageView('/dashboard', 'my-app-id');
```

## Exceptions

1. **market-oracle-app** - Archived/read-only repository, cannot be updated

## Verification

All apps verified to have:
- ✅ `lib/central-services.ts` v3.0.0
- ✅ `lib/supabase.ts` with central services re-exports
- ✅ Successful Vercel deployments

## Live Endpoints

- Hub: https://craudiovizai.com
- Registry API: https://craudiovizai.com/api/registry
- Status API: https://craudiovizai.com/api/registry/status
