// /app/page.tsx
// CR AudioViz AI - Main Landing Page
// Combined hero section with single Javari image
// 🔒 USES SHARED HEADER/FOOTER FROM LAYOUT - NO DUPLICATE NAV

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* 🔒 NO DUPLICATE NAV - Header comes from root layout.tsx */}
      
      {/* Combined Hero Section - Javari Introduction */}
      <section className="hero-section pt-6 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-5 gap-8 items-center">
            {/* Javari Avatar - Smaller, left side */}
            <motion.div 
              className="md:col-span-2 flex justify-center"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full blur-2xl opacity-30 scale-110" />
                <Image
                  src="/avatars/javariavatar.png"
                  alt="Javari - Your AI Assistant"
                  width={220}
                  height={220}
                  className="relative rounded-full border-3 border-cyan-400 shadow-xl shadow-cyan-500/30"
                />
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-3 py-1.5 rounded-full font-bold text-sm flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  Javari AI
                </div>
              </div>
            </motion.div>

            {/* Javari's Introduction */}
            <motion.div
              className="md:col-span-3"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Hi, I'm <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Javari</span>!
              </h1>
              <p className="text-lg text-gray-300 mb-4 leading-relaxed">
                Welcome to <strong className="text-white">CR AudioViz AI</strong> - I'm your personal AI assistant 
                who actually remembers you. I'm here to help you create, build, learn, and accomplish amazing things.
              </p>
              
              {/* What we offer - compact grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                  <span className="text-cyan-400 font-semibold text-sm">🎨 AI Apps</span>
                  <p className="text-gray-400 text-xs mt-1">Logos, docs, social media & more</p>
                </div>
                <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                  <span className="text-cyan-400 font-semibold text-sm">🎮 Fun Games</span>
                  <p className="text-gray-400 text-xs mt-1">Take a break and have fun</p>
                </div>
                <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                  <span className="text-cyan-400 font-semibold text-sm">💬 I Remember You</span>
                  <p className="text-gray-400 text-xs mt-1">Chat naturally, I learn your preferences</p>
                </div>
                <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                  <span className="text-cyan-400 font-semibold text-sm">🤖 Multiple AI Models</span>
                  <p className="text-gray-400 text-xs mt-1">GPT-4, Claude, Gemini & more</p>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-3">
                <Link 
                  href="/apps"
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg shadow-cyan-500/30"
                >
                  Explore Apps →
                </Link>
                <Link 
                  href="/javari"
                  className="px-6 py-3 bg-gray-800 text-white font-medium rounded-xl hover:bg-gray-700 transition-all border border-gray-700"
                >
                  Chat with Me
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-12 px-4 bg-gray-800/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              AI-Powered Apps & Tools
            </h2>
            <p className="text-gray-400">Create professional results in minutes, not hours</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { name: 'Logo Creator', icon: '🎨', color: 'from-pink-500 to-rose-500' },
              { name: 'Document Writer', icon: '📄', color: 'from-blue-500 to-cyan-500' },
              { name: 'Social Designer', icon: '📱', color: 'from-purple-500 to-violet-500' },
              { name: 'Invoice Generator', icon: '💰', color: 'from-green-500 to-emerald-500' },
              { name: 'Presentation Builder', icon: '📊', color: 'from-orange-500 to-amber-500' },
              { name: 'Code Assistant', icon: '💻', color: 'from-gray-500 to-gray-700' },
              { name: 'Research Helper', icon: '🔍', color: 'from-indigo-500 to-blue-500' },
              { name: 'Games Hub', icon: '🎮', color: 'from-red-500 to-pink-500' },
            ].map((tool, idx) => (
              <motion.div
                key={tool.name}
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ scale: 1.05, y: -3 }}
                className={`bg-gradient-to-br ${tool.color} p-3 rounded-xl text-white text-center cursor-pointer shadow-lg`}
              >
                <span className="text-2xl block mb-1">{tool.icon}</span>
                <span className="text-xs font-medium">{tool.name}</span>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link 
              href="/apps"
              className="inline-block px-6 py-3 border border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 rounded-xl transition-colors font-medium"
            >
              View All Apps →
            </Link>
          </div>
        </div>
      </section>

      {/* JavariVerse Preview */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-2xl p-8 border border-purple-500/30">
            <div className="text-center">
              <span className="inline-block px-4 py-1 bg-purple-500/20 text-purple-400 text-sm font-medium rounded-full mb-4">
                COMING SOON
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                Enter the <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">JavariVerse</span>
              </h2>
              <p className="text-gray-300 max-w-2xl mx-auto mb-6">
                A virtual world where creativity meets AI. Build, explore, and connect with others in our immersive 3D environment.
              </p>
              <Link 
                href="/javari-verse"
                className="inline-block px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all"
              >
                Learn More →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-12 px-4 bg-gray-800/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Simple, Transparent Pricing
            </h2>
            <p className="text-gray-400">Start free, upgrade when you need more</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 text-center">
              <h3 className="text-lg font-bold text-white mb-2">Free</h3>
              <p className="text-3xl font-bold text-white mb-3">$0</p>
              <p className="text-gray-400 text-sm">50 credits/month</p>
            </div>
            <div className="bg-gradient-to-b from-cyan-900/50 to-blue-900/50 p-6 rounded-xl border border-cyan-500/50 text-center relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-cyan-500 text-white text-xs font-bold rounded-full">POPULAR</span>
              <h3 className="text-lg font-bold text-white mb-2">Pro</h3>
              <p className="text-3xl font-bold text-white mb-3">$19<span className="text-lg text-gray-400">/mo</span></p>
              <p className="text-gray-400 text-sm">500 credits/month</p>
            </div>
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 text-center">
              <h3 className="text-lg font-bold text-white mb-2">Enterprise</h3>
              <p className="text-3xl font-bold text-white mb-3">Custom</p>
              <p className="text-gray-400 text-sm">Unlimited credits</p>
            </div>
          </div>
          <div className="text-center mt-6">
            <Link 
              href="/pricing"
              className="inline-block px-6 py-3 border border-gray-600 text-gray-300 hover:bg-gray-800 rounded-xl transition-colors font-medium"
            >
              View Full Pricing →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
