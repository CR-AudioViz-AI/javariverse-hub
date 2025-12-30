// /app/checkout/error/page.tsx
// Checkout Error - CR AudioViz AI
// Error page for failed payments

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function CheckoutErrorPage() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason') || 'unknown';
  const provider = searchParams.get('provider') || 'unknown';

  const errorMessages: Record<string, { title: string; message: string; action: string }> = {
    cancelled: {
      title: 'Payment Cancelled',
      message: 'You cancelled the payment process. No charges were made.',
      action: 'Try Again'
    },
    failed: {
      title: 'Payment Failed',
      message: 'Your payment could not be processed. Please try again or use a different payment method.',
      action: 'Try Again'
    },
    insufficient_funds: {
      title: 'Insufficient Funds',
      message: 'Your payment method was declined due to insufficient funds.',
      action: 'Use Different Card'
    },
    expired: {
      title: 'Session Expired',
      message: 'Your checkout session has expired. Please start the checkout process again.',
      action: 'Start Over'
    },
    invalid: {
      title: 'Invalid Request',
      message: 'There was an issue with your payment request. Please try again.',
      action: 'Try Again'
    },
    unknown: {
      title: 'Something Went Wrong',
      message: 'An unexpected error occurred. Please try again or contact support.',
      action: 'Try Again'
    }
  };

  const error = errorMessages[reason] || errorMessages.unknown;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg w-full"
      >
        {/* Error Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          {/* Error Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <span className="text-4xl">❌</span>
          </motion.div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {error.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error.message}
          </p>

          {/* Error Details */}
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 mb-6 text-left">
            <h3 className="font-medium text-red-900 dark:text-red-100 mb-2">Error Details</h3>
            <div className="text-sm text-red-700 dark:text-red-300 space-y-1">
              <div className="flex justify-between">
                <span>Error Code:</span>
                <span className="font-mono">{reason.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Provider:</span>
                <span>{provider === 'paypal' ? 'PayPal' : 'Stripe'}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Link
              href="/pricing"
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all"
            >
              {error.action}
            </Link>
            <Link
              href="/support"
              className="w-full py-3 border border-gray-300 dark:border-gray-600 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
            >
              Contact Support
            </Link>
            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-gray-700 mt-2"
            >
              ← Return to Home
            </Link>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl p-4">
          <h3 className="font-medium text-gray-900 dark:text-white mb-3">Common Solutions</h3>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <li className="flex items-start gap-2">
              <span>💳</span>
              <span>Try a different payment method (we accept Stripe and PayPal)</span>
            </li>
            <li className="flex items-start gap-2">
              <span>🔄</span>
              <span>Clear your browser cache and try again</span>
            </li>
            <li className="flex items-start gap-2">
              <span>🏦</span>
              <span>Check with your bank if the transaction was blocked</span>
            </li>
            <li className="flex items-start gap-2">
              <span>📧</span>
              <span>Contact support@craudiovizai.com for assistance</span>
            </li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}
