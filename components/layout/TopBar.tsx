'use client';

/**
 * CR AudioViz AI - COMBINED TOP BAR
 * 
 * Combines CR rotating text + Credits display into one bar
 * - Left: "CR = [rotating word]" 
 * - Right: Plan/Credits info or login prompt
 * - Blue-to-green gradient background
 * - Sticky at top when scrolling
 * 
 * @timestamp January 8, 2026
 */

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Coins, Crown, Sparkles, Zap, Infinity, LogIn, UserPlus } from 'lucide-react';

// CR = word combinations
const CR_PHRASES = [
  'Creative Results', 'Cutting-edge Resources', 'Collaborative Reach', 
  'Compelling Resonance', 'Customer Rewards', 'Curated Riches',
  'Confident Resilience', 'Connected Reality', 'Comprehensive Returns',
  'Custom Revolutions', 'Captivating Refinement', 'Community Roots',
  'Continuous Reliability', 'Core Relevance', 'Clever Reasoning',
  'Clear Resolution', 'Compelling Reviews', 'Creative Rebirth',
  'Confident Rise', 'Collective Radiance', 'Crafted Recognition',
  'Conscious Responsibility', 'Constant Renewal', 'Credible Results'
];

// Admin emails that always get unlimited access
const ADMIN_EMAILS = [
  'royhenderson@craudiovizai.com',
  'cindyhenderson@craudiovizai.com',
];

interface UserPlan {
  plan_name: string;
  credits: number;
  is_admin: boolean;
}

const PLAN_STYLES: Record<string, { icon: React.ReactNode }> = {
  Free: { icon: <Sparkles className="w-3 h-3" /> },
  Starter: { icon: <Zap className="w-3 h-3" /> },
  Pro: { icon: <Crown className="w-3 h-3" /> },
  Premium: { icon: <Crown className="w-3 h-3" /> },
  Admin: { icon: <Crown className="w-3 h-3" /> },
};

export default function TopBar() {
  const [currentPhrase, setCurrentPhrase] = useState(CR_PHRASES[0]);
  const [isVisible, setIsVisible] = useState(true);
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  
  const supabase = createClient();

  // Rotate CR phrases
  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentPhrase(prev => {
          const currentIndex = CR_PHRASES.indexOf(prev);
          const nextIndex = (currentIndex + 1) % CR_PHRASES.length;
          return CR_PHRASES[nextIndex];
        });
        setIsVisible(true);
      }, 300);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Load user plan
  useEffect(() => {
    async function loadUserPlan() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setLoading(false);
          setIsLoggedIn(false);
          return;
        }

        setIsLoggedIn(true);
        setUserEmail(user.email || null);

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('plan_name, credits, is_admin')
          .eq('id', user.id)
          .single();

        if (error || !profile) {
          setUserPlan({ plan_name: 'Free', credits: 50, is_admin: false });
        } else {
          setUserPlan(profile);
        }
      } catch (error) {
        console.error('Error loading user plan:', error);
      } finally {
        setLoading(false);
      }
    }

    loadUserPlan();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadUserPlan();
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // Check if user is admin
  const isAdmin = userPlan?.is_admin || (userEmail && ADMIN_EMAILS.includes(userEmail.toLowerCase()));
  const displayPlan = isAdmin ? 'Admin' : (userPlan?.plan_name || 'Free');
  const planStyle = PLAN_STYLES[displayPlan] || PLAN_STYLES['Free'];

  return (
    <div className="sticky top-0 z-50 bg-gradient-to-r from-blue-600 to-green-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-8 text-sm">
          
          {/* Left: CR = Rotating Text */}
          <div className="flex items-center">
            <span className="font-bold">CR</span>
            <span className="mx-1">=</span>
            <span 
              className={`font-semibold transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            >
              {currentPhrase}
            </span>
          </div>

          {/* Right: Credits/Plan Info */}
          <div className="flex items-center gap-3">
            {loading ? (
              <div className="w-32 h-5 bg-white/20 rounded animate-pulse" />
            ) : isLoggedIn ? (
              <>
                {/* Plan Badge */}
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/20 rounded-full text-xs font-medium">
                  {planStyle.icon}
                  <span>{displayPlan}</span>
                </div>

                {/* Credits */}
                <div className="flex items-center gap-1.5 text-xs">
                  <Coins className="w-3.5 h-3.5" />
                  {isAdmin ? (
                    <span className="flex items-center gap-1">
                      <Infinity className="w-3.5 h-3.5" />
                      Unlimited
                    </span>
                  ) : (
                    <span>{userPlan?.credits?.toLocaleString() || 0} credits</span>
                  )}
                </div>

                {/* Top Up / Upgrade Link */}
                {!isAdmin && (
                  <Link 
                    href="/pricing#credits" 
                    className="px-2 py-0.5 bg-white/20 hover:bg-white/30 rounded text-xs font-medium transition-colors"
                  >
                    {displayPlan === 'Free' ? 'Upgrade' : 'Top Up'}
                  </Link>
                )}
              </>
            ) : (
              /* Logged Out State */
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/80 hidden sm:inline">
                  Log in to see plan details
                </span>
                <Link 
                  href="/login"
                  className="flex items-center gap-1 px-2 py-0.5 bg-white/20 hover:bg-white/30 rounded text-xs font-medium transition-colors"
                >
                  <LogIn className="w-3 h-3" />
                  <span>Log In</span>
                </Link>
                <Link 
                  href="/signup"
                  className="flex items-center gap-1 px-2 py-0.5 bg-white text-blue-600 hover:bg-white/90 rounded text-xs font-medium transition-colors"
                >
                  <UserPlus className="w-3 h-3" />
                  <span>Sign Up</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
