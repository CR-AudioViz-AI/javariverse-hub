// /app/faq/page.tsx
// CR AudioViz AI - FAQ Page (Stub)
// Created: 2026-01-14

import Link from 'next/link';
import { ArrowLeft, Home, MessageSquare } from 'lucide-react';

export const metadata = {
  title: 'FAQ - CR AudioViz AI',
  description: 'Frequently asked questions about CR AudioViz AI platform and tools.',
};

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-16">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-400">
            Help center coming soon. For immediate assistance, contact support.
          </p>
        </div>

        {/* Coming Soon Notice */}
        <div className="bg-gray-800/50 border border-cyan-500/30 rounded-2xl p-8 text-center mb-8">
          <MessageSquare className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-3">
            FAQ Center In Development
          </h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            We're building a comprehensive FAQ center to answer your questions about our platform, 
            pricing, features, and more. Check back soon.
          </p>
          
          {/* Temporary Resources */}
          <div className="grid md:grid-cols-2 gap-4 max-w-xl mx-auto">
            <Link
              href="/support"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-cyan-500 text-white font-medium rounded-xl hover:bg-cyan-600 transition-all"
            >
              Contact Support
            </Link>
            <Link
              href="/about"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 text-white font-medium rounded-xl hover:bg-gray-600 transition-all border border-gray-600"
            >
              Learn More About Us
            </Link>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-3 gap-6">
          <Link
            href="/"
            className="group bg-gray-800/30 p-6 rounded-xl border border-gray-700 hover:border-cyan-500/50 transition-all"
          >
            <Home className="w-8 h-8 text-cyan-400 mb-3" />
            <h3 className="text-white font-semibold mb-2">Home</h3>
            <p className="text-gray-400 text-sm">Return to homepage</p>
          </Link>

          <Link
            href="/apps"
            className="group bg-gray-800/30 p-6 rounded-xl border border-gray-700 hover:border-cyan-500/50 transition-all"
          >
            <MessageSquare className="w-8 h-8 text-cyan-400 mb-3" />
            <h3 className="text-white font-semibold mb-2">Explore Apps</h3>
            <p className="text-gray-400 text-sm">Browse our tools</p>
          </Link>

          <Link
            href="/pricing"
            className="group bg-gray-800/30 p-6 rounded-xl border border-gray-700 hover:border-cyan-500/50 transition-all"
          >
            <ArrowLeft className="w-8 h-8 text-cyan-400 mb-3" />
            <h3 className="text-white font-semibold mb-2">View Pricing</h3>
            <p className="text-gray-400 text-sm">Plans and pricing</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
