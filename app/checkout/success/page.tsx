// /app/checkout/success/page.tsx
// Checkout Success - CR AudioViz AI
// Confirmation page after successful payment (Stripe or PayPal)

'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState<{
    type: 'subscription' | 'credits';
    tier?: string;
    credits?: number;
    amount?: number;
    provider: 'stripe' | 'paypal';
    orderId?: string;
  } | null>(null);

  useEffect(() => {
    // Parse URL parameters
    const provider = searchParams.get('provider') as 'stripe' | 'paypal' || 'stripe';
    const type = searchParams.get('type') as 'subscription' | 'credits' || 'subscription';
    const tier = searchParams.get('tier');
    const credits = searchParams.get('credits');
    const orderId = searchParams.get('order_id') || searchParams.get('session_id');

    // Simulate fetching order details
    setTimeout(() => {
      setOrderDetails({
        type,
        tier: tier || 'Pro',
        credits: credits ? parseInt(credits) : undefined,
        amount: type === 'subscription' ? (tier === 'Business' ? 99 : tier === 'Pro' ? 29 : 9) : undefined,
        provider,
        orderId: orderId || undefined
      });
      setLoading(false);
    }, 1000);
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Confirming your order...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg w-full"
      >
        {/* Success Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          {/* Checkmark Animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <motion.svg
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="w-10 h-10 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <motion.path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </motion.svg>
          </motion.div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Payment Successful! 🎉
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Thank you for your purchase. Your account has been updated.
          </p>

          {/* Order Details */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6 text-left">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Order Details</h3>
            
            {orderDetails?.type === 'subscription' ? (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Plan</span>
                  <span className="font-medium text-gray-900 dark:text-white">{orderDetails.tier} Plan</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Amount</span>
                  <span className="font-medium text-gray-900 dark:text-white">${orderDetails.amount}/month</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Credits Added</span>
                  <span className="font-medium text-green-600">
                    +{orderDetails.tier === 'Business' ? '10,000' : orderDetails.tier === 'Pro' ? '2,000' : '500'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Package</span>
                  <span className="font-medium text-gray-900 dark:text-white">Credit Package</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Credits Added</span>
                  <span className="font-medium text-green-600">+{orderDetails?.credits?.toLocaleString()}</span>
                </div>
              </div>
            )}

            <div className="border-t border-gray-200 dark:border-gray-600 mt-3 pt-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Payment via</span>
                <span className="flex items-center gap-1">
                  {orderDetails?.provider === 'paypal' ? '🅿️ PayPal' : '💳 Stripe'}
                </span>
              </div>
              {orderDetails?.orderId && (
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-500">Order ID</span>
                  <span className="font-mono text-xs">{orderDetails.orderId.slice(0, 20)}...</span>
                </div>
              )}
            </div>
          </div>

          {/* What's Next */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-6 text-left">
            <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">What's Next?</h3>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              {orderDetails?.type === 'subscription' ? (
                <>
                  <li>✓ Your plan is now active</li>
                  <li>✓ Credits have been added to your account</li>
                  <li>✓ Access all {orderDetails.tier} features</li>
                  <li>✓ Check your email for receipt</li>
                </>
              ) : (
                <>
                  <li>✓ Credits have been added instantly</li>
                  <li>✓ Credits never expire</li>
                  <li>✓ Start using Javari AI now</li>
                  <li>✓ Check your email for receipt</li>
                </>
              )}
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Link
              href="/chat"
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              Start Chatting with Javari →
            </Link>
            <Link
              href="/dashboard"
              className="w-full py-3 border border-gray-300 dark:border-gray-600 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>

        {/* Social Prompt */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-3">Follow us for tips and updates!</p>
          <div className="flex justify-center gap-4">
            <a href="https://twitter.com/CRAudioVizAI" target="_blank" rel="noopener noreferrer" className="text-2xl hover:scale-110 transition-transform">🐦</a>
            <a href="https://instagram.com/CRAudioVizAI" target="_blank" rel="noopener noreferrer" className="text-2xl hover:scale-110 transition-transform">📸</a>
            <a href="https://discord.gg/javari" target="_blank" rel="noopener noreferrer" className="text-2xl hover:scale-110 transition-transform">💬</a>
            <a href="https://youtube.com/@CRAudioVizAI" target="_blank" rel="noopener noreferrer" className="text-2xl hover:scale-110 transition-transform">📺</a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
