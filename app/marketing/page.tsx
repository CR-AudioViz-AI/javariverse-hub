'use client';

/**
 * MARKETING COMMAND CENTER - CENTRAL HUB
 * CR AudioViz AI - craudiovizai.com/marketing
 * Integrates: Auth, Credits, CRM, Cross-Selling, Javari AI
 * Created: December 16, 2025
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { 
  Megaphone, Target, Rocket, Search, Gift, BarChart3, 
  Mail, Share2, Globe, Sparkles, TrendingUp, Users,
  ChevronRight, Play, Star, Zap, ArrowRight
} from 'lucide-react';

// Marketing Tools Configuration
const MARKETING_TOOLS = [
  {
    id: 'platform-finder',
    title: 'Platform Finder',
    description: 'AI-powered recommendations for the best launch platforms based on your product type',
    icon: Target,
    href: '/marketing/platform-finder',
    color: 'from-blue-500 to-blue-600',
    free: true,
    creditCost: 0,
  },
  {
    id: 'area-targeting',
    title: 'Area Targeting',
    description: 'Find your ideal customers by ZIP code demographics and market potential',
    icon: Search,
    href: '/marketing/area-targeting',
    color: 'from-green-500 to-green-600',
    free: false,
    creditCost: 5,
  },
  {
    id: 'launch-checklist',
    title: 'Launch Checklist',
    description: 'Platform-specific checklists optimized for Product Hunt, Hacker News, Reddit & more',
    icon: Rocket,
    href: '/marketing/launch-checklist',
    color: 'from-orange-500 to-orange-600',
    free: true,
    creditCost: 0,
  },
  {
    id: 'free-tools',
    title: 'Free Tool Directory',
    description: '100+ vetted free marketing tools with CRAV alternatives for advanced features',
    icon: Gift,
    href: '/marketing/free-tools',
    color: 'from-purple-500 to-purple-600',
    free: true,
    creditCost: 0,
  },
  {
    id: 'distribution',
    title: 'Distribution Hub',
    description: 'Post to all social platforms from one interface with AI-optimized content',
    icon: Share2,
    href: '/marketing/distribution',
    color: 'from-pink-500 to-pink-600',
    free: false,
    creditCost: 3,
  },
  {
    id: 'campaign-tracker',
    title: 'Campaign Tracker',
    description: 'Track all your marketing campaigns across channels with unified analytics',
    icon: BarChart3,
    href: '/marketing/campaigns',
    color: 'from-indigo-500 to-indigo-600',
    free: false,
    creditCost: 2,
  },
];

// CRAV Tools for Cross-Selling
const CRAV_CROSS_SELL = [
  { name: 'Newsletter Pro', href: '/apps/newsletter', icon: Mail, description: 'Enterprise email marketing' },
  { name: 'Social Graphics', href: '/apps/social-graphics', icon: Share2, description: 'AI-powered designs' },
  { name: 'Site Builder', href: '/apps/site-builder', icon: Globe, description: 'Landing pages in minutes' },
  { name: 'Logo Studio', href: '/apps/logo-studio', icon: Sparkles, description: 'Professional branding' },
];

export default function MarketingCommandCenter() {
  const [user, setUser] = useState<any>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        // Fetch credits from central system
        const { data: profile } = await supabase
          .from('profiles')
          .select('credits_balance')
          .eq('id', user.id)
          .single();
        
        setCredits(profile?.credits_balance ?? 0);
        
        // Log activity to central system
        await fetch('/api/activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            action: 'page_view',
            appId: 'marketing-command-center',
            metadata: { page: 'home' }
          })
        }).catch(() => {}); // Silent fail for logging
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-sm mb-6">
              <Megaphone className="w-4 h-4" />
              Marketing Command Center
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Launch Smarter, <span className="text-yellow-300">Not Harder</span>
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              AI-powered marketing tools designed to help you find the right platforms, 
              target the right audience, and maximize your launch success.
            </p>
            
            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center gap-8 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold">60+</div>
                <div className="text-white/80 text-sm">CRAV Tools</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">100+</div>
                <div className="text-white/80 text-sm">Free Resources</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">$0</div>
                <div className="text-white/80 text-sm">To Start</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                href="/marketing/platform-finder"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-600 font-semibold rounded-xl hover:bg-gray-100 transition-all shadow-lg"
              >
                <Target className="w-5 h-5" />
                Find Your Platforms
              </Link>
              <Link
                href="/marketing/free-tools"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/20 text-white font-semibold rounded-xl hover:bg-white/30 transition-all"
              >
                <Gift className="w-5 h-5" />
                Browse Free Tools
              </Link>
            </div>
          </div>
        </div>
        
        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#f9fafb"/>
          </svg>
        </div>
      </section>

      {/* User Status Bar - Only for logged in users */}
      {user && (
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">Welcome back!</span>
                <div className="flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                  <Zap className="w-4 h-4" />
                  {credits !== null ? `${credits} Credits` : 'Loading...'}
                </div>
              </div>
              <Link href="/pricing" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                Get More Credits →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Marketing Tools Grid */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Marketing Tools</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Everything you need to plan, launch, and track your marketing campaigns
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MARKETING_TOOLS.map((tool) => {
            const IconComponent = tool.icon;
            return (
              <Link
                key={tool.id}
                href={tool.href}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
              >
                <div className={`h-2 bg-gradient-to-r ${tool.color}`}></div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center text-white`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    {tool.free ? (
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        FREE
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                        {tool.creditCost} credits
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {tool.description}
                  </p>
                  <div className="flex items-center text-purple-600 text-sm font-medium">
                    Get Started
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Cross-Sell Section */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Supercharge Your Marketing</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Combine with other CR AudioViz AI tools for maximum impact
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {CRAV_CROSS_SELL.map((tool) => {
              const IconComponent = tool.icon;
              return (
                <Link
                  key={tool.name}
                  href={tool.href}
                  className="group p-6 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all"
                >
                  <IconComponent className="w-8 h-8 text-purple-400 mb-4" />
                  <h3 className="font-semibold mb-2 group-hover:text-purple-400 transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-sm text-gray-400">{tool.description}</p>
                </Link>
              );
            })}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/apps"
              className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-medium"
            >
              Explore all 60+ tools
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Free Tools Preview */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-4">
                <Gift className="w-4 h-4" />
                100% Free
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Free Marketing Tools Directory
              </h2>
              <p className="text-gray-600 mb-6">
                We believe in providing value first. Access our curated directory of 100+ free marketing 
                tools across email, design, social, SEO, and analytics categories.
              </p>
              <ul className="space-y-3 mb-6">
                {['Mailchimp, Canva, Buffer alternatives', 'SEO tools like Google Search Console', 'Analytics with Google Analytics', 'CRAV alternatives for premium features'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700">
                    <Star className="w-5 h-5 text-yellow-500" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/marketing/free-tools"
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors"
              >
                Browse Free Tools
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="grid grid-cols-2 gap-4">
                {['Email', 'Design', 'Social', 'Analytics'].map((cat, i) => (
                  <div key={cat} className="bg-white rounded-2xl p-6 shadow-sm">
                    <div className="text-3xl font-bold text-purple-600 mb-1">25+</div>
                    <div className="text-gray-600">{cat} Tools</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="max-w-7xl mx-auto px-4 py-16">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-8 md:p-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Launch Smarter?</h2>
            <p className="text-white/90 mb-8 max-w-2xl mx-auto">
              Sign up free and get 50 credits to try our premium marketing tools. 
              No credit card required.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/signup?redirectTo=/marketing"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/login?redirectTo=/marketing"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/20 text-white font-semibold rounded-xl hover:bg-white/30 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
