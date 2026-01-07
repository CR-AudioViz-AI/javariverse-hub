/**
 * Login Page - CR AudioViz AI
 * 
 * ⚠️ UI CONTRACT LOCK - PHASE 2.9
 * This page MUST use the shared Header/Footer from root layout.
 * NO special layout allowed.
 * 
 * @timestamp January 7, 2026 - 12:17 PM EST
 * @locked PHASE 2.9 UI CONTRACT
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import AuthOptions from '@/components/auth/AuthOptions';

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-300px)] flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Header Text */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
          <p className="text-gray-400 mt-2">Sign in to continue to your account</p>
        </div>

        {/* Auth Form Card */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-2xl shadow-xl p-8">
          <AuthOptions 
            mode="login" 
            redirectTo="/dashboard"
          />
        </div>
      </motion.div>
    </div>
  );
}
