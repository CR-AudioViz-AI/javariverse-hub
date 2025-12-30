// /app/checkout/success/page.tsx
// Checkout Success Page - CR AudioViz AI / Javari
// Confirms payment and shows next steps

'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface SessionDetails {
  status: string;
  paymentStatus: string;
  customerEmail: string;
  amountTotal: number;
  metadata: {
    mode: string;
    tierId?: string;
    credits?: string;
    billingCycle?: string;
  };
}

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<SessionDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionId) {
      fetchSession();
    } else {
      setLoading(false);
    }
  }, [sessionId]);

  const fetchSession = async () => {
    try {
      const response = await fetch(`/api/payments/create-checkout?session_id=${sessionId}`);
      if (!response.ok) throw new Error('Failed to fetch session');
      const data = await response.json();
      setSession(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Confirming your payment...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Unable to Confirm
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            We couldn't verify your payment. If you completed a purchase, your account will be updated shortly.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/support"
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isSubscription = session.metadata.mode === 'subscription';
  const isCredits = session.metadata.mode === 'payment';

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-16 px-4">
      <div className="max-w-lg mx-auto">
        {/* Success Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Payment Successful!
            </h1>
            <p className="text-green-100">
              Thank you for your purchase
            </p>
          </div>

          {/* Details */}
          <div className="p-8">
            {/* Order Summary */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                Order Summary
              </h3>
              
              {isSubscription && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Plan</span>
                    <span className="font-medium text-gray-900 dark:text-white capitalize">
                      {session.metadata.tierId} ({session.metadata.billingCycle})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Amount</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      ${(session.amountTotal / 100).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {isCredits && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Credits Purchased</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {parseInt(session.metadata.credits || '0').toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Amount Paid</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      ${(session.amountTotal / 100).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              <div className="border-t border-gray-200 dark:border-gray-600 mt-3 pt-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Confirmation Email</span>
                  <span className="font-medium text-gray-900 dark:text-white text-sm">
                    {session.customerEmail}
                  </span>
                </div>
              </div>
            </div>

            {/* What's Next */}
            <div className="mb-8">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                What's Next?
              </h3>
              
              <div className="space-y-3">
                {isSubscription && (
                  <>
                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">1</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Your credits are ready</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Your monthly credits have been added to your account
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">2</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Explore premium features</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Access advanced AI models and tools
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">3</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Credits refresh monthly</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Your credits will automatically refresh each billing period
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {isCredits && (
                  <>
                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">1</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Credits added instantly</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Your credits are ready to use right now
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">2</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Credits never expire</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Use them whenever you need - no time pressure
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-3">
              <Link
                href="/chat"
                className="w-full py-3 px-6 bg-blue-600 text-white text-center rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Start Chatting with Javari
              </Link>
              <Link
                href="/dashboard"
                className="w-full py-3 px-6 border border-gray-300 dark:border-gray-600 text-center rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Questions about your purchase?{' '}
            <Link href="/support" className="text-blue-600 hover:underline">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
