/**
 * CR AudioViz AI - Realtors Pricing Page (v6.2)
 * JavariKeys pricing + Zoyzy included
 * 
 * @version 6.2
 * @timestamp January 8, 2026
 */

'use client';

import React from 'react';
import Link from 'next/link';
import {
  TRIAL_CONFIGS,
  REALTORS_PRODUCT_NAME,
  REALTORS_HOSTING,
  REALTORS_ZOYZY,
  FAQ_ITEMS,
} from '@/lib/pricing/v62';
import {
  PlanCard,
  TrialBanner,
  VerticalNav,
  ExploreOtherOfferings,
  FAQAccordion,
  PolicyNotices,
  CreditExplanation,
} from '@/components/pricing/PricingComponents';
import { Home, Globe, Search, Zap, Check, ArrowRight } from 'lucide-react';

// JavariKeys Plans (Realtor-specific)
const REALTOR_PLANS = [
  {
    id: 'keys-starter',
    name: 'Keys Starter',
    priceMonthly: 49,
    credits: 500,
    features: [
      '500 credits/month',
      '1 agent website',
      'Standard hosting included',
      'Zoyzy property search',
      'AI support with escalation',
    ],
    cta: 'Start Building',
  },
  {
    id: 'keys-pro',
    name: 'Keys Pro',
    priceMonthly: 99,
    credits: 1500,
    badge: 'Most Popular',
    features: [
      '1,500 credits/month',
      '3 agent websites',
      'Standard hosting included',
      'Zoyzy property search',
      'AI support with escalation',
      'Priority processing',
    ],
    cta: 'Go Pro',
  },
  {
    id: 'keys-team',
    name: 'Keys Team',
    priceMonthly: 249,
    credits: 5000,
    features: [
      '5,000 credits/month',
      '10 agent websites',
      'Standard hosting included',
      'Zoyzy property search',
      'AI support with escalation',
      'Priority processing',
      'Team management',
    ],
    cta: 'Contact Sales',
  },
];

export default function RealtorsPricingPage() {
  const trialConfig = TRIAL_CONFIGS.realtors;

  return (
    <div className="min-h-screen bg-slate-50 py-8 md:py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-cyan-100 text-cyan-700 px-4 py-1 rounded-full text-sm font-medium mb-4">
            <Home className="w-4 h-4" />
            {REALTORS_PRODUCT_NAME}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
            Professional Real Estate Websites
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Build stunning agent websites with AI. Includes hosting, SSL, and integrated property search.
          </p>
        </div>

        {/* Vertical Navigation */}
        <VerticalNav current="realtors" />

        {/* Trial Banner */}
        <TrialBanner
          vertical={REALTORS_PRODUCT_NAME}
          credits={trialConfig.credits}
          days={30}
        />

        {/* What's Included */}
        <section className="mb-8">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Standard Hosting */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-100 rounded-full p-2">
                  <Globe className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{REALTORS_HOSTING.standard.name}</h3>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    Included
                  </span>
                </div>
              </div>
              <ul className="space-y-2">
                {REALTORS_HOSTING.standard.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                    <Check className="w-4 h-4 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Zoyzy */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 rounded-full p-2">
                  <Search className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{REALTORS_ZOYZY.name}</h3>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    Included
                  </span>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-3">
                {REALTORS_ZOYZY.description}
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-slate-600">
                  <Check className="w-4 h-4 text-green-500" />
                  Integrated with your website
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-600">
                  <Check className="w-4 h-4 text-green-500" />
                  MLS feed compatible
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-600">
                  <Check className="w-4 h-4 text-green-500" />
                  Lead capture forms
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Credit Explanation */}
        <CreditExplanation />

        {/* Plans */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Zap className="w-6 h-6 text-cyan-600" />
            <h2 className="text-2xl font-bold text-slate-900">{REALTORS_PRODUCT_NAME} Plans</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {REALTOR_PLANS.map((plan) => (
              <PlanCard
                key={plan.id}
                name={plan.name}
                price={plan.priceMonthly}
                credits={plan.credits}
                badge={plan.badge}
                features={plan.features}
                cta={plan.cta}
                ctaHref="/signup?vertical=realtors"
                highlighted={plan.badge === 'Most Popular'}
              />
            ))}
          </div>
          
          <div className="mt-4 text-center text-sm text-slate-500">
            Credits roll forward while subscription is active. Cancel anytime.
          </div>
        </section>

        {/* Hosting Pro Upsell */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-6 md:p-8 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold mb-2">{REALTORS_HOSTING.pro.name}</h3>
                <p className="text-slate-300 text-sm">
                  {REALTORS_HOSTING.pro.description}. Advanced CDN, custom domains, and priority support.
                </p>
              </div>
              <Link
                href="/contact?subject=hosting-pro"
                className="inline-flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-lg font-semibold hover:bg-slate-100 transition-colors whitespace-nowrap"
              >
                {REALTORS_HOSTING.pro.price}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Add-ons Note */}
        <section className="mb-12">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <h3 className="font-bold text-amber-800 mb-2">Additional Features</h3>
            <p className="text-amber-700 text-sm">
              Need custom integrations, additional websites, or advanced features? These are credits-based. 
              Your plan credits can be used for any add-on services.
            </p>
          </div>
        </section>

        {/* Grace Period Info */}
        <section className="mb-12">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-bold text-blue-900 mb-3">10-Day Grace Period</h3>
            <p className="text-blue-800 mb-3">
              After your paid term expires, you get a 10-day grace period:
            </p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Your websites remain live</li>
              <li>• Continue using remaining credits</li>
              <li>• Cannot purchase additional credits</li>
              <li>• Renew to keep full access; otherwise websites go offline after grace ends</li>
            </ul>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto">
            <FAQAccordion items={FAQ_ITEMS} />
          </div>
        </section>

        {/* Explore Other Offerings */}
        <ExploreOtherOfferings exclude="realtors" />

        {/* Policy Notices */}
        <PolicyNotices />

        {/* Back Link */}
        <div className="mt-8 text-center">
          <Link href="/pricing" className="text-cyan-600 hover:text-cyan-700 font-medium">
            ← Back to all pricing
          </Link>
        </div>
      </div>
    </div>
  );
}
