/**
 * CR AudioViz AI - v6.2 Pricing Configuration
 * SINGLE SOURCE OF TRUTH - All pricing data lives here
 * UI imports this config. Backend enforces these values.
 * 
 * @version 6.2
 * @timestamp January 8, 2026
 */

// =============================================================================
// CREDIT FUNDAMENTALS
// =============================================================================
export const CREDIT_PRICE_CENTS = 3; // 1 credit = $0.03
export const CREDIT_PRICE_DISPLAY = '$0.03';

export const CREDIT_USAGE_EXAMPLES = {
  quick: { min: 1, max: 10, label: 'Quick tasks' },
  larger: { min: 15, max: 100, label: 'Larger tasks' },
};

// =============================================================================
// CORE MONTHLY PLANS
// =============================================================================
export type CorePlanId = 'starter' | 'pro' | 'business';

export interface CorePlan {
  id: CorePlanId;
  name: string;
  priceMonthly: number;
  credits: number;
  badge?: string;
  features: string[];
  cta: string;
  stripePriceId?: string; // Set via env var
}

export const CORE_PLANS: CorePlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    priceMonthly: 29,
    credits: 1000,
    features: [
      '1,000 credits/month',
      'Access to all core apps',
      'Credits roll forward while active',
      'AI support with escalation',
    ],
    cta: 'Get Started',
  },
  {
    id: 'pro',
    name: 'Pro',
    priceMonthly: 79,
    credits: 3000,
    badge: 'Most Popular',
    features: [
      '3,000 credits/month',
      'Access to all core apps',
      'Credits roll forward while active',
      'AI support with escalation',
      'Priority processing',
    ],
    cta: 'Upgrade to Pro',
  },
  {
    id: 'business',
    name: 'Business',
    priceMonthly: 199,
    credits: 8000,
    features: [
      '8,000 credits/month',
      'Access to all core apps',
      'Credits roll forward while active',
      'AI support with escalation',
      'Priority processing',
      'API access',
    ],
    cta: 'Go Business',
  },
];

// =============================================================================
// CREDIT PACKS (One-time purchases)
// =============================================================================
export interface CreditPack {
  credits: number;
  price: number;
  badge?: string;
  stripePriceId?: string; // Set via env var
}

export const CREDIT_PACKS: CreditPack[] = [
  { credits: 1000, price: 30 },
  { credits: 5000, price: 150 },
  { credits: 10000, price: 300, badge: 'Most Popular' },
  { credits: 25000, price: 700, badge: 'Best Value' },
];

export const CREDIT_PACK_RULES = [
  'Pack credits stay usable while subscription is active',
  'Packs do NOT extend subscription term',
  'Pack credits remain usable during 10-day grace period',
  'If not renewed after grace, remaining credits are forfeited',
];

// =============================================================================
// AUTO-RELOAD TIERS
// =============================================================================
export interface AutoReloadTier {
  credits: number;
  price: number;
}

export const AUTO_RELOAD_TIERS: AutoReloadTier[] = [
  { credits: 100, price: 3.00 },
  { credits: 250, price: 7.25 },
  { credits: 500, price: 14.25 },
];

export const AUTO_RELOAD_MIN_THRESHOLD = 10;

export const AUTO_RELOAD_RULES = [
  'Auto-reload adds credits when balance is low',
  'Triggers once per threshold event (never repeatedly)',
  'You select both threshold (min 10 credits) and reload tier',
  'Auto-reload paused during grace period',
];

// =============================================================================
// SUBSCRIPTION RULES
// =============================================================================
export const SUBSCRIPTION_RULES = {
  graceperiodDays: 10,
  disputeWindowDays: 7,
  packPurchaseBlackoutDays: 7, // Pack purchases in final 7 days require active renewal
};

export const SUBSCRIPTION_FEATURES = [
  'Credits roll forward while subscription is active',
  'Cancel anytime; access continues through paid term',
  '10-day grace period after term expires',
  'During grace: spend remaining credits, no new purchases',
  'All credit purchases are final',
];

// =============================================================================
// TRIAL & FREE TIERS
// =============================================================================
export const TRIAL_LENGTH_DAYS = 30;

export interface TrialConfig {
  vertical: string;
  credits: number;
  capacity?: { type: string; amount: number };
}

export const TRIAL_CONFIGS: Record<string, TrialConfig> = {
  core: { vertical: 'Core', credits: 100 },
  realtors: { vertical: 'Realtors', credits: 200 },
  collectors: { vertical: 'Collectors', credits: 100, capacity: { type: 'items', amount: 25 } },
  hobbyists: { vertical: 'Hobbyists', credits: 50, capacity: { type: 'projects', amount: 3 } },
};

export interface FreeTierConfig {
  vertical: string;
  hasFreeTier: boolean;
  credits: number;
  capacity?: { type: string; amount: number };
  accessLevel: 'full' | 'view-only' | 'locked';
}

export const FREE_TIER_CONFIGS: Record<string, FreeTierConfig> = {
  core: { vertical: 'Core', hasFreeTier: false, credits: 0, accessLevel: 'locked' },
  realtors: { vertical: 'Realtors', hasFreeTier: false, credits: 0, accessLevel: 'locked' },
  collectors: { vertical: 'Collectors', hasFreeTier: true, credits: 0, capacity: { type: 'items', amount: 10 }, accessLevel: 'view-only' },
  hobbyists: { vertical: 'Hobbyists', hasFreeTier: true, credits: 0, capacity: { type: 'projects', amount: 1 }, accessLevel: 'view-only' },
};

// =============================================================================
// HOBBY TIERS
// =============================================================================
export type HobbyPlanId = 'hobby-starter' | 'hobby-plus' | 'hobby-pro' | 'hobby-studio';

export interface HobbyPlan {
  id: HobbyPlanId;
  name: string;
  priceMonthly: number;
  credits: number;
  projects: number;
  badge?: string;
  features: string[];
  cta: string;
  stripePriceId?: string;
}

export const HOBBY_PLANS: HobbyPlan[] = [
  {
    id: 'hobby-starter',
    name: 'Hobby Starter',
    priceMonthly: 9,
    credits: 200,
    projects: 20,
    features: [
      '200 credits/month',
      '20 projects',
      'All hobby apps access',
      'AI support with escalation',
    ],
    cta: 'Start Creating',
  },
  {
    id: 'hobby-plus',
    name: 'Hobby Plus',
    priceMonthly: 19,
    credits: 500,
    projects: 75,
    features: [
      '500 credits/month',
      '75 projects',
      'All hobby apps access',
      'AI support with escalation',
      'Priority processing',
    ],
    cta: 'Go Plus',
  },
  {
    id: 'hobby-pro',
    name: 'Hobby Pro',
    priceMonthly: 39,
    credits: 1200,
    projects: 200,
    badge: 'Most Popular',
    features: [
      '1,200 credits/month',
      '200 projects',
      'All hobby apps access',
      'AI support with escalation',
      'Priority processing',
    ],
    cta: 'Upgrade to Pro',
  },
  {
    id: 'hobby-studio',
    name: 'Hobby Studio',
    priceMonthly: 79,
    credits: 3000,
    projects: 1000,
    badge: 'Best Value',
    features: [
      '3,000 credits/month',
      '1,000 projects',
      'All hobby apps access',
      'AI support with escalation',
      'Priority processing',
      'Bulk operations',
    ],
    cta: 'Go Studio',
  },
];

// =============================================================================
// COLLECTORS VERTICAL
// =============================================================================
export const COLLECTORS_UMBRELLA_NAME = 'Javari Collectors';

export const COLLECTORS_DOWNGRADE_POLICY = 
  'Downgrade: data retained but items above tier limit are hidden until upgrade.';

// =============================================================================
// REALTORS VERTICAL (JavariKeys)
// =============================================================================
export const REALTORS_PRODUCT_NAME = 'JavariKeys';

export const REALTORS_HOSTING = {
  standard: {
    name: 'Standard Hosting',
    included: true,
    features: ['Vercel hosting', 'SSL', 'Automated backups', 'Monitoring'],
  },
  pro: {
    name: 'Hosting Pro',
    included: false,
    description: 'For high-traffic/advanced needs',
    price: 'Contact sales', // Placeholder until pricing decided
  },
};

export const REALTORS_ZOYZY = {
  name: 'Zoyzy',
  description: 'Real estate property search',
  includedWithRealtorWebsite: true,
  advertisingNote: 'Advertising features available separately',
};

// =============================================================================
// SUPPORT & POLICIES
// =============================================================================
export const SUPPORT_POLICY = 'Support is ticket-only for traceability';
export const REFUND_POLICY = 'All credit purchases are final. Cancel anytime; access continues through paid term.';

// =============================================================================
// FAQ CONTENT
// =============================================================================
export const FAQ_ITEMS = [
  {
    question: 'How do credits work?',
    answer: `1 credit = ${CREDIT_PRICE_DISPLAY}. Quick tasks typically use 1-10 credits, larger tasks 15-100+ credits. You always see the credit cost before confirming any action.`,
  },
  {
    question: 'What happens if my subscription expires?',
    answer: 'You get a 10-day grace period after your paid term ends. During grace, you can spend remaining credits but cannot purchase more. Auto-reload is paused. If not renewed after grace, remaining credits are forfeited.',
  },
  {
    question: 'Do credit packs extend my subscription?',
    answer: 'No. Credit packs add credits to your balance but do NOT extend your subscription term. Pack credits remain usable during the grace period but are forfeited if you don\'t renew.',
  },
  {
    question: 'How does auto-reload work?',
    answer: 'You set a threshold (minimum 10 credits) and select a reload tier. When your balance drops below the threshold, credits are automatically added—once per threshold event, never repeatedly. Auto-reload pauses during grace period.',
  },
  {
    question: 'What is your refund policy?',
    answer: REFUND_POLICY,
  },
  {
    question: 'How do I get support?',
    answer: `${SUPPORT_POLICY}. You can file a billing dispute within ${SUBSCRIPTION_RULES.disputeWindowDays} days of any transaction.`,
  },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================
export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function formatCredits(credits: number): string {
  return credits.toLocaleString();
}

export function getCorePlanById(id: CorePlanId): CorePlan | undefined {
  return CORE_PLANS.find(p => p.id === id);
}

export function getHobbyPlanById(id: HobbyPlanId): HobbyPlan | undefined {
  return HOBBY_PLANS.find(p => p.id === id);
}

export function getCreditPackByCredits(credits: number): CreditPack | undefined {
  return CREDIT_PACKS.find(p => p.credits === credits);
}
