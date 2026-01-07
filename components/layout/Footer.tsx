'use client';

/**
 * CR AudioViz AI - LOCKED FOOTER COMPONENT
 * 
 * ⚠️ UI CONTRACT LOCK - PHASE 2.9
 * This is the SINGLE SOURCE OF TRUTH for all page footers.
 * DO NOT create per-page footer variants.
 * 
 * Requirements:
 * - Same navigation links as Header
 * - Legal links: Terms, Privacy
 * - Social links: Must link to actual CR AudioViz AI accounts (not homepage)
 * - Hide/disable social links if account not live
 * 
 * @timestamp January 7, 2026 - 12:12 PM EST
 * @locked PHASE 2.9 UI CONTRACT
 */

import Link from 'next/link';
import { 
  Twitter, Facebook, Instagram, Linkedin, Youtube, 
  MessageCircle, Send, Github, Mail
} from 'lucide-react';

// ============================================================================
// LOCKED NAVIGATION - MUST MATCH HEADER EXACTLY
// ============================================================================
const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Apps', href: '/apps' },
  { label: 'Games', href: '/games' },
  { label: 'Javari AI', href: '/javari' },
  { label: 'JavariVerse', href: '/javari-verse' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

// ============================================================================
// LOCKED LEGAL LINKS
// ============================================================================
const LEGAL_LINKS = [
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Cookie Policy', href: '/cookies' },
  { label: 'DMCA', href: '/dmca' },
  { label: 'Accessibility', href: '/accessibility' },
];

// ============================================================================
// SOCIAL LINKS - MUST LINK TO ACTUAL ACCOUNTS, NOT HOMEPAGE
// Set enabled: false if account is not live
// ============================================================================
const SOCIAL_LINKS = [
  { name: 'Twitter/X', icon: Twitter, url: 'https://twitter.com/CRAudioVizAI', enabled: true },
  { name: 'Facebook', icon: Facebook, url: 'https://facebook.com/CRAudioVizAI', enabled: true },
  { name: 'Instagram', icon: Instagram, url: 'https://instagram.com/CRAudioVizAI', enabled: true },
  { name: 'LinkedIn', icon: Linkedin, url: 'https://linkedin.com/company/craudiovizai', enabled: true },
  { name: 'YouTube', icon: Youtube, url: 'https://youtube.com/@CRAudioVizAI', enabled: true },
  { name: 'Discord', icon: MessageCircle, url: 'https://discord.gg/craudiovizai', enabled: true },
  { name: 'GitHub', icon: Github, url: 'https://github.com/CR-AudioViz-AI', enabled: true },
  { name: 'Telegram', icon: Send, url: 'https://t.me/CRAudioVizAI', enabled: true },
];

// ============================================================================
// SUPPORT LINKS
// ============================================================================
const SUPPORT_LINKS = [
  { label: 'Help Center', href: '/support' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact Us', href: '/contact' },
  { label: 'Documentation', href: '/docs' },
];

export function Footer() {
  const currentYear = new Date().getFullYear();
  const enabledSocials = SOCIAL_LINKS.filter(s => s.enabled);

  return (
    <footer 
      className="bg-slate-950 border-t border-white/10"
      data-testid="site-footer"
    >
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <Link 
              href="/" 
              className="flex items-center gap-2 mb-4"
              data-testid="footer-logo"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                <div className="relative">
                  <div className="flex gap-1 mb-0.5">
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  </div>
                  <div className="w-3 h-1 bg-white rounded-full mx-auto" />
                </div>
              </div>
            </Link>
            <p className="text-gray-400 text-sm mb-2">
              Your Story. Our Design.
            </p>
            <p className="text-gray-500 text-xs">
              AI-powered creative tools for everyone.
            </p>
          </div>

          {/* Navigation - MUST MATCH HEADER */}
          <div data-testid="footer-nav">
            <h3 className="text-white font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div data-testid="footer-support">
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {SUPPORT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal - REQUIRED */}
          <div data-testid="footer-legal">
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social Links - MUST LINK TO ACTUAL ACCOUNTS */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Social Icons */}
            <div className="flex items-center gap-4" data-testid="footer-social">
              <span className="text-gray-500 text-sm">Follow us:</span>
              <div className="flex gap-3">
                {enabledSocials.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                    aria-label={social.name}
                    data-testid={`social-${social.name.toLowerCase().replace(/[^a-z]/g, '')}`}
                  >
                    <social.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Contact Email */}
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-500" />
              <a 
                href="mailto:support@craudiovizai.com"
                className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
              >
                support@craudiovizai.com
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="bg-slate-900/50 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-center md:text-left">
            <p className="text-gray-500 text-sm" data-testid="footer-copyright">
              © {currentYear} CR AudioViz AI, LLC. All rights reserved.
            </p>
            <p className="text-gray-600 text-xs">
              Made with ❤️ in Fort Myers, Florida
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Default export for backwards compatibility
export default Footer;
