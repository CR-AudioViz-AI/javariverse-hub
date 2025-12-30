// /app/page.tsx
// Javari Landing Page - CR AudioViz AI
// High-conversion homepage showcasing the AI companion ecosystem

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

// =============================================================================
// JAVARI HERO AVATAR (Animated)
// =============================================================================

function HeroAvatar() {
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    // Simulate speaking animation
    const interval = setInterval(() => {
      setSpeaking(true);
      setTimeout(() => setSpeaking(false), 2000);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="relative w-48 h-48 md:w-64 md:h-64"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Glow rings */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-3xl opacity-30"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.2, 0.3] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      <motion.div
        className="absolute inset-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-2xl opacity-20"
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.2, 0.3, 0.2] }}
        transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
      />

      {/* Main avatar */}
      <motion.div
        className="relative w-full h-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl"
        animate={speaking ? { scale: [1, 1.02, 1] } : {}}
        transition={{ duration: 0.3, repeat: speaking ? 3 : 0 }}
      >
        {/* Inner glow */}
        <div className="absolute inset-2 bg-gradient-to-br from-white/20 to-transparent rounded-full" />
        
        {/* Face */}
        <div className="relative z-10">
          {/* Eyes */}
          <div className="flex gap-6 mb-3">
            <motion.div 
              className="w-5 h-5 md:w-6 md:h-6 bg-white rounded-full shadow-lg"
              animate={{ scaleY: speaking ? [1, 0.3, 1] : 1 }}
              transition={{ duration: 0.2, repeat: speaking ? 3 : 0 }}
            >
              <div className="w-2 h-2 bg-gray-800 rounded-full ml-2 mt-1" />
            </motion.div>
            <motion.div 
              className="w-5 h-5 md:w-6 md:h-6 bg-white rounded-full shadow-lg"
              animate={{ scaleY: speaking ? [1, 0.3, 1] : 1 }}
              transition={{ duration: 0.2, repeat: speaking ? 3 : 0, delay: 0.1 }}
            >
              <div className="w-2 h-2 bg-gray-800 rounded-full ml-2 mt-1" />
            </motion.div>
          </div>
          {/* Mouth */}
          <motion.div 
            className="w-10 h-4 md:w-12 md:h-5 bg-white rounded-full mx-auto shadow-lg overflow-hidden"
            animate={speaking ? { scaleY: [1, 1.5, 0.8, 1.3, 1] } : {}}
            transition={{ duration: 0.4, repeat: speaking ? 3 : 0 }}
          >
            <div className="w-full h-1/2 bg-pink-300 mt-2" />
          </motion.div>
        </div>
      </motion.div>

      {/* Status badge */}
      <motion.div
        className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Online & Ready
      </motion.div>
    </motion.div>
  );
}

// =============================================================================
// DEMO CHAT PREVIEW
// =============================================================================

function DemoChatPreview() {
  const [currentMessage, setCurrentMessage] = useState(0);
  
  const messages = [
    { role: 'user', text: "Help me write a business proposal" },
    { role: 'javari', text: "I'd love to help! Let me ask a few questions to make it perfect. What's the main product or service?" },
    { role: 'user', text: "Create a logo for my coffee shop" },
    { role: 'javari', text: "Exciting! I'll design something warm and inviting. What's the name of your shop?" },
    { role: 'user', text: "I need to relax, any games?" },
    { role: 'javari', text: "I've got you! Check out the Games Hub - I recommend Puzzle Quest for a chill vibe 🎮" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 2) % messages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 max-w-sm mx-auto"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      <div className="space-y-3">
        <motion.div
          key={`user-${currentMessage}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex justify-end"
        >
          <div className="bg-blue-600 text-white px-4 py-2 rounded-2xl rounded-br-md text-sm max-w-[80%]">
            {messages[currentMessage].text}
          </div>
        </motion.div>
        <motion.div
          key={`javari-${currentMessage}`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-start gap-2"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex-shrink-0" />
          <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-2xl rounded-bl-md text-sm max-w-[80%] text-gray-900 dark:text-white">
            {messages[currentMessage + 1]?.text}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// =============================================================================
// FEATURE CARDS
// =============================================================================

const features = [
  {
    icon: '🤖',
    title: 'AI That Knows You',
    description: 'Javari remembers your preferences, learns your style, and gets better with every conversation.'
  },
  {
    icon: '🎨',
    title: 'Creative Tools',
    description: 'Logo design, document writing, social media graphics, presentations - all AI-powered.'
  },
  {
    icon: '🎮',
    title: 'Games Library',
    description: 'Take a break with our collection of casual games. Sometimes you need to unwind.'
  },
  {
    icon: '💳',
    title: 'Credits Never Expire',
    description: 'On paid plans, your credits are yours forever. Use them whenever you need.'
  },
  {
    icon: '🔒',
    title: 'Privacy First',
    description: 'Your data is yours. We never sell it, and you can export or delete anytime.'
  },
  {
    icon: '🚀',
    title: 'Always Improving',
    description: 'New features weekly. Vote on what we build next. Your voice matters.'
  }
];

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
    >
      <span className="text-4xl mb-4 block">{feature.icon}</span>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
    </motion.div>
  );
}

// =============================================================================
// TOOLS SHOWCASE
// =============================================================================

const tools = [
  { name: 'Logo Creator', icon: '🎨', color: 'from-pink-500 to-rose-500' },
  { name: 'Document Writer', icon: '📄', color: 'from-blue-500 to-cyan-500' },
  { name: 'Social Designer', icon: '📱', color: 'from-purple-500 to-violet-500' },
  { name: 'Invoice Generator', icon: '💰', color: 'from-green-500 to-emerald-500' },
  { name: 'Presentation Builder', icon: '📊', color: 'from-orange-500 to-amber-500' },
  { name: 'Code Assistant', icon: '💻', color: 'from-gray-600 to-gray-800' },
  { name: 'Research Helper', icon: '🔍', color: 'from-indigo-500 to-blue-500' },
  { name: 'Games Hub', icon: '🎮', color: 'from-red-500 to-pink-500' },
];

function ToolsShowcase() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {tools.map((tool, idx) => (
        <motion.div
          key={tool.name}
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: idx * 0.05 }}
          whileHover={{ scale: 1.05, y: -5 }}
          className={`bg-gradient-to-br ${tool.color} p-4 rounded-xl text-white text-center cursor-pointer shadow-lg`}
        >
          <span className="text-3xl block mb-2">{tool.icon}</span>
          <span className="text-sm font-medium">{tool.name}</span>
        </motion.div>
      ))}
    </div>
  );
}

// =============================================================================
// PRICING PREVIEW
// =============================================================================

function PricingPreview() {
  return (
    <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
      {/* Free */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Free</h3>
        <div className="text-4xl font-bold text-gray-900 dark:text-white mb-4">$0</div>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
          <li>✓ 50 credits/month</li>
          <li>✓ Javari AI chat</li>
          <li>✓ Basic tools</li>
        </ul>
        <Link href="/signup" className="block w-full py-2 text-center border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 transition-colors">
          Get Started
        </Link>
      </div>

      {/* Pro - Highlighted */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6 shadow-xl text-white relative">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">
          MOST POPULAR
        </div>
        <h3 className="text-xl font-bold mb-2">Pro</h3>
        <div className="text-4xl font-bold mb-4">$29<span className="text-lg font-normal">/mo</span></div>
        <ul className="space-y-2 text-sm text-blue-100 mb-6">
          <li>✓ 2,000 credits/month</li>
          <li>✓ All creative tools</li>
          <li>✓ Priority AI models</li>
          <li>✓ Credits never expire</li>
        </ul>
        <Link href="/signup?plan=pro" className="block w-full py-2 text-center bg-white text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors">
          Start Free Trial
        </Link>
      </div>

      {/* Business */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Business</h3>
        <div className="text-4xl font-bold text-gray-900 dark:text-white mb-4">$99<span className="text-lg font-normal">/mo</span></div>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
          <li>✓ 10,000 credits/month</li>
          <li>✓ Unlimited team members</li>
          <li>✓ SSO & Admin dashboard</li>
        </ul>
        <Link href="/contact?plan=business" className="block w-full py-2 text-center border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 transition-colors">
          Contact Sales
        </Link>
      </div>
    </div>
  );
}

// =============================================================================
// TESTIMONIALS (Placeholder)
// =============================================================================

const testimonials = [
  {
    quote: "Javari feels like having a brilliant assistant who actually gets me.",
    author: "Sarah M.",
    role: "Content Creator",
    avatar: "👩‍🎨"
  },
  {
    quote: "The logo creator alone saved me $500. And it was fun to use!",
    author: "Mike T.",
    role: "Small Business Owner",
    avatar: "👨‍💼"
  },
  {
    quote: "Finally, an AI that remembers our past conversations. Game changer.",
    author: "Alex R.",
    role: "Developer",
    avatar: "👨‍💻"
  }
];

function Testimonials() {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {testimonials.map((t, idx) => (
        <motion.div
          key={idx}
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: idx * 0.1 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg"
        >
          <p className="text-gray-600 dark:text-gray-300 mb-4 italic">"{t.quote}"</p>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{t.avatar}</span>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{t.author}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t.role}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// =============================================================================
// MAIN LANDING PAGE
// =============================================================================

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">Javari</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/features" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Features</Link>
            <Link href="/pricing" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Pricing</Link>
            <Link href="/tools" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Tools</Link>
            <Link href="/games" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Games</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              Log In
            </Link>
            <Link href="/signup" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left - Content */}
            <div>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
              >
                <span className="inline-block px-4 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium mb-6">
                  Meet Your AI Companion
                </span>
                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                  Hi, I'm <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Javari</span>
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                  Your personal AI assistant who actually remembers you. I help you create, build, 
                  learn, and accomplish amazing things. Let's work together.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link 
                    href="/signup"
                    className="px-8 py-4 bg-blue-600 text-white text-lg font-medium rounded-xl hover:bg-blue-700 transition-colors text-center shadow-lg shadow-blue-600/30"
                  >
                    Start Free - 50 Credits
                  </Link>
                  <Link 
                    href="/demo"
                    className="px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-lg font-medium rounded-xl hover:border-blue-500 transition-colors text-center"
                  >
                    Watch Demo
                  </Link>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                  No credit card required • Free forever plan available
                </p>
              </motion.div>
            </div>

            {/* Right - Avatar & Demo */}
            <div className="flex flex-col items-center gap-8">
              <HeroAvatar />
              <DemoChatPreview />
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section className="py-8 bg-gray-100 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-8 text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⭐</span>
              <span className="font-medium">4.9/5 Rating</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">👥</span>
              <span className="font-medium">10,000+ Users</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🛠️</span>
              <span className="font-medium">50+ AI Tools</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎮</span>
              <span className="font-medium">1000+ Games</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              More Than Just AI Chat
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Javari is a complete creative ecosystem. Chat, create, play, and grow - all in one place.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <FeatureCard key={feature.title} feature={feature} index={idx} />
            ))}
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section className="py-20 px-4 bg-gray-100 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Professional Tools, Zero Learning Curve
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Each tool is AI-powered to help you create professional results in minutes, not hours.
            </p>
          </div>
          <ToolsShowcase />
          <div className="text-center mt-8">
            <Link href="/tools" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
              Explore All Tools →
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Loved by Creators & Builders
            </h2>
          </div>
          <Testimonials />
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 px-4 bg-gray-100 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Simple, Honest Pricing
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Start free. Upgrade when you need more. Cancel anytime.
            </p>
          </div>
          <PricingPreview />
          <div className="text-center mt-8">
            <Link href="/pricing" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
              See Full Pricing Details →
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Ready to Meet Javari?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              50 free credits. No credit card. Just you and your new AI companion.
            </p>
            <Link 
              href="/signup"
              className="inline-block px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xl font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-xl shadow-blue-600/30"
            >
              Get Started Free →
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg" />
                <span className="text-xl font-bold text-white">Javari</span>
              </div>
              <p className="text-sm">Your AI companion for creating, building, and accomplishing amazing things.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/features" className="hover:text-white">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="/tools" className="hover:text-white">Tools</Link></li>
                <li><Link href="/games" className="hover:text-white">Games</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white">About</Link></li>
                <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
                <li><Link href="/careers" className="hover:text-white">Careers</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
                <li><Link href="/cookies" className="hover:text-white">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm">© 2025 CR AudioViz AI, LLC. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="https://twitter.com/javari_ai" className="hover:text-white">Twitter</a>
              <a href="https://linkedin.com/company/craudiovizai" className="hover:text-white">LinkedIn</a>
              <a href="https://discord.gg/javari" className="hover:text-white">Discord</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
