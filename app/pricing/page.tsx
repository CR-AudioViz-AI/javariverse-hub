'use client';

import { useState } from 'react';
import { MobileButton } from '@/components/mobile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { 
  Check, 
  X, 
  Sparkles, 
  Zap, 
  Crown, 
  Building2,
  ArrowRight,
  Star,
  Infinity,
  GraduationCap,
  Heart,
} from 'lucide-react';

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const getPrice = (monthly: number, annual: number) => {
    return billingCycle === 'monthly' ? monthly : annual;
  };

  const getSavings = (monthly: number, annual: number) => {
    const monthlyCost = monthly * 12;
    const savings = monthlyCost - annual;
    return savings;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white px-4 py-12 md:py-16 lg:py-20">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 md:mb-6">
              Simple, Transparent Pricing
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-purple-100 mb-6 md:mb-8">
              Choose the plan that fits your needs. Upgrade or downgrade anytime.
            </p>

            {/* Billing Toggle - Mobile optimized */}
            <div className="flex items-center justify-center gap-2 md:gap-4 bg-white/10 backdrop-blur-sm rounded-full p-2 max-w-md mx-auto">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`flex-1 px-4 md:px-6 py-3 rounded-full font-medium transition-all text-sm md:text-base ${
                  billingCycle === 'monthly' 
                    ? 'bg-white text-blue-600 shadow-lg' 
                    : 'text-white hover:bg-white/10'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`flex-1 px-4 md:px-6 py-3 rounded-full font-medium transition-all text-sm md:text-base ${
                  billingCycle === 'annual' 
                    ? 'bg-white text-blue-600 shadow-lg' 
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <span>Annual</span>
                <span className="block md:inline md:ml-2 text-xs md:text-sm font-bold text-green-400">
                  Save 17%
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="px-4 py-12 md:py-16 -mt-10 md:-mt-20">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            
            {/* Free Plan */}
            <Card className="border-2 hover:shadow-xl transition-all">
              <CardHeader className="text-center p-4 md:p-6">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
                </div>
                <CardTitle className="text-lg md:text-xl mb-2">Creative Starter</CardTitle>
                <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                  $0
                  <span className="text-sm md:text-base font-normal text-gray-500">/month</span>
                </div>
                <CardDescription className="text-xs md:text-sm">Try out the platform</CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <ul className="space-y-2.5 mb-6 text-xs md:text-sm">
                  <li className="flex items-start">
                    <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">100 monthly AI credits</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Essential creative tools</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Games arcade access</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">2GB storage</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Starter templates</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Ticket support (48-72hr)</span>
                  </li>
                  <li className="flex items-start">
                    <X className="w-4 h-4 text-gray-300 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-400">Watermarked exports</span>
                  </li>
                  <li className="flex items-start">
                    <X className="w-4 h-4 text-gray-300 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-400">3 projects max</span>
                  </li>
                </ul>
                <Link href="/signup" className="block">
                  <MobileButton 
                    fullWidth 
                    size="lg"
                    className="bg-gray-600 hover:bg-gray-700"
                  >
                    Get Started Free
                  </MobileButton>
                </Link>
              </CardContent>
            </Card>

            {/* Starter Plan */}
            <Card className="border-2 hover:shadow-xl transition-all">
              <CardHeader className="text-center p-4 md:p-6">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg md:text-xl mb-2">Creative Pro</CardTitle>
                <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                  ${getPrice(19, 190)}
                  <span className="text-sm md:text-base font-normal text-gray-500">
                    {billingCycle === 'monthly' ? '/month' : '/year'}
                  </span>
                </div>
                <CardDescription className="text-xs md:text-sm">
                  {billingCycle === 'annual' && (
                    <span className="text-green-600 font-medium">Save ${getSavings(19, 190)}/year</span>
                  )}
                  {billingCycle === 'monthly' && 'For individual creators'}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <ul className="space-y-2.5 mb-6 text-xs md:text-sm">
                  <li className="flex items-start">
                    <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">1,000 monthly AI credits</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Full creative suite access</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Full games library</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">50GB storage</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Premium templates</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">No watermarks</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Unlimited projects</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Javari AI assistant (basic)</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Market Oracle (5 picks/week)</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Ticket support (12-24hr)</span>
                  </li>
                </ul>
                <Link href="/signup?plan=starter" className="block">
                  <MobileButton 
                    fullWidth 
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Start Free Trial
                  </MobileButton>
                </Link>
              </CardContent>
            </Card>

            {/* Pro Plan - Featured */}
            <Card className="border-4 border-purple-500 shadow-2xl relative lg:transform lg:scale-105">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 md:px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  MOST POPULAR
                </span>
              </div>
              <CardHeader className="text-center p-4 md:p-6 pt-8">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Crown className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg md:text-xl mb-2">Creative Business</CardTitle>
                <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                  ${getPrice(49, 490)}
                  <span className="text-sm md:text-base font-normal text-gray-500">
                    {billingCycle === 'monthly' ? '/month' : '/year'}
                  </span>
                </div>
                <CardDescription className="text-xs md:text-sm">
                  {billingCycle === 'annual' && (
                    <span className="text-green-600 font-medium">Save ${getSavings(49, 490)}/year</span>
                  )}
                  {billingCycle === 'monthly' && 'For teams & businesses'}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <ul className="space-y-2.5 mb-6 text-xs md:text-sm">
                  <li className="flex items-start">
                    <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 font-medium">5,000 monthly AI credits</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Everything in Starter, plus:</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">500GB storage</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Priority AI (2x faster)</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Team collaboration (5 members)</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Brand kit & templates</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Javari AI (advanced + memory)</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Market Oracle (unlimited)</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">API access (10K req/month)</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Custom domain</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Remove branding</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Priority ticket support (4-8hr)</span>
                  </li>
                </ul>
                <Link href="/signup?plan=pro" className="block">
                  <MobileButton 
                    fullWidth 
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    Start Free Trial
                  </MobileButton>
                </Link>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="border-2 border-gray-800 hover:shadow-xl transition-all">
              <CardHeader className="text-center p-4 md:p-6">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Building2 className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <CardTitle className="text-lg md:text-xl mb-2">Creative Corporation</CardTitle>
                <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                  ${getPrice(199, 1990)}
                  <span className="text-sm md:text-base font-normal text-gray-500">
                    {billingCycle === 'monthly' ? '/month' : '/year'}
                  </span>
                </div>
                <CardDescription className="text-xs md:text-sm">
                  {billingCycle === 'annual' && (
                    <span className="text-green-600 font-medium">Save ${getSavings(199, 1990)}/year</span>
                  )}
                  {billingCycle === 'monthly' && 'For large organizations'}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <ul className="space-y-2.5 mb-6 text-xs md:text-sm">
                  <li className="flex items-start">
                    <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 font-medium flex items-center gap-1">
                      <Infinity className="w-4 h-4" /> Unlimited AI credits*
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Everything in Pro, plus:</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Unlimited storage*</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Dedicated account manager</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Custom AI model training</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Unlimited team members</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">SSO/SAML authentication</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">White-label options</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">99.9% SLA guarantee</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Premium support (1-2hr)</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Quarterly business reviews</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Custom contract terms</span>
                  </li>
                </ul>
                <Link href="/contact?plan=enterprise" className="block">
                  <MobileButton 
                    fullWidth 
                    size="lg"
                    className="bg-gray-900 hover:bg-gray-800"
                  >
                    Contact Sales
                  </MobileButton>
                </Link>
                <p className="text-xs text-gray-500 mt-3 text-center">*Fair use policy applies</p>
              </CardContent>
            </Card>

          </div>
        </div>
      </section>

      {/* Special Discounts Section */}
      <section className="px-4 py-12 md:py-16 bg-white">
        <div className="container mx-auto">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
                Special Discounts Available
              </h2>
              <p className="text-base md:text-lg text-gray-600">
                We support students, educators, and nonprofits with exclusive pricing
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              
              {/* Student/Educator Discount */}
              <Card className="border-2 border-blue-200 bg-blue-50/30">
                <CardHeader className="p-4 md:p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg md:text-xl">Student & Educator</CardTitle>
                      <CardDescription className="text-sm">50% off Creative Pro</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0">
                  <div className="mb-4">
                    <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-2">
                      $9.50<span className="text-base md:text-lg font-normal text-gray-600">/month</span>
                    </div>
                    <p className="text-xs md:text-sm text-gray-600 mb-4">
                      or $95/year (normally $190)
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-3 md:p-4 mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">Eligibility:</h4>
                    <ul className="space-y-1 text-xs md:text-sm text-gray-600">
                      <li>• Valid .edu email address, OR</li>
                      <li>• School/university ID upload, OR</li>
                      <li>• SheerID verification</li>
                    </ul>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                    <p className="text-xs text-yellow-800">
                      <strong>Note:</strong> Verification required via support ticket. Must re-verify annually.
                    </p>
                  </div>

                  <Link href="/contact?type=student-discount" className="block">
                    <MobileButton 
                      fullWidth 
                      size="lg"
                      className="bg-blue-600 hover:bg-blue-700"
                      icon={<ArrowRight className="w-4 h-4" />}
                    >
                      Apply for Discount
                    </MobileButton>
                  </Link>
                </CardContent>
              </Card>

              {/* Nonprofit Discount */}
              <Card className="border-2 border-green-200 bg-green-50/30">
                <CardHeader className="p-4 md:p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Heart className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg md:text-xl">Nonprofit Organizations</CardTitle>
                      <CardDescription className="text-sm">30% off all plans</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0">
                  <div className="mb-4">
                    <div className="text-2xl md:text-3xl font-bold text-green-600 mb-2">
                      $13.30<span className="text-base md:text-lg font-normal text-gray-600">/month</span>
                    </div>
                    <p className="text-xs md:text-sm text-gray-600 mb-4">
                      Creative Pro: $133/year (normally $190)
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-3 md:p-4 mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">Eligibility:</h4>
                    <ul className="space-y-1 text-xs md:text-sm text-gray-600">
                      <li>• 501(c)(3) tax-exempt status, OR</li>
                      <li>• Registered nonprofit/charity</li>
                      <li>• Mission-driven organization</li>
                    </ul>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                    <p className="text-xs text-yellow-800">
                      <strong>Note:</strong> Nonprofit verification required. Discount applies to all paid tiers.
                    </p>
                  </div>

                  <Link href="/contact?type=nonprofit-discount" className="block">
                    <MobileButton 
                      fullWidth 
                      size="lg"
                      className="bg-green-600 hover:bg-green-700"
                      icon={<ArrowRight className="w-4 h-4" />}
                    >
                      Apply for Discount
                    </MobileButton>
                  </Link>
                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-12 md:py-16 bg-gradient-to-br from-purple-600 to-pink-600 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-purple-100 mb-6 md:mb-8 max-w-2xl mx-auto">
            Join thousands of creators already building with CR AudioViz AI
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Link href="/signup" className="flex-1">
              <MobileButton 
                size="lg" 
                fullWidth
                className="bg-white text-purple-600 hover:bg-purple-50"
              >
                Start Free Trial
              </MobileButton>
            </Link>
            <Link href="/contact" className="flex-1">
              <MobileButton 
                size="lg" 
                fullWidth
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10"
              >
                Contact Sales
              </MobileButton>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

