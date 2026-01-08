'use client';

/**
 * CR AudioViz AI - FOOTER COMPONENT
 * 
 * Compact footer with single-spaced links
 * No redundant social links (already in SocialMediaButtons above)
 * 
 * @timestamp January 8, 2026
 */

import Link from 'next/link';

// Navigation links
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

// Legal links
const LEGAL_LINKS = [
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Cookie Policy', href: '/cookies' },
  { label: 'DMCA', href: '/dmca' },
  { label: 'Accessibility', href: '/accessibility' },
];

// Support links
const SUPPORT_LINKS = [
  { label: 'Help Center', href: '/support' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact Us', href: '/contact' },
  { label: 'Documentation', href: '/docs' },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer 
      className="bg-slate-950 border-t border-white/10"
      data-testid="site-footer"
    >
      {/* Main Footer Content - Very compact, single spacing */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <Link 
              href="/" 
              className="flex items-center gap-2 mb-2"
              data-testid="footer-logo"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                <div className="relative">
                  <div className="flex gap-0.5 mb-0.5">
                    <div className="w-1 h-1 bg-white rounded-full" />
                    <div className="w-1 h-1 bg-white rounded-full" />
                  </div>
                  <div className="w-2 h-0.5 bg-white rounded-full mx-auto" />
                </div>
              </div>
            </Link>
            <p className="text-gray-400 text-xs leading-tight">Your Story. Our Design.</p>
            <p className="text-gray-500 text-xs leading-tight">AI-powered creative tools.</p>
          </div>

          {/* Navigation - Single spaced */}
          <div data-testid="footer-nav">
            <h3 className="text-white font-semibold text-xs mb-2">Navigation</h3>
            <ul className="space-y-0.5">
              {NAV_LINKS.map((link) => (
                <li key={link.href} className="leading-tight">
                  <Link 
                    href={link.href}
                    className="text-gray-400 hover:text-white text-xs transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support - Single spaced */}
          <div data-testid="footer-support">
            <h3 className="text-white font-semibold text-xs mb-2">Support</h3>
            <ul className="space-y-0.5">
              {SUPPORT_LINKS.map((link) => (
                <li key={link.href} className="leading-tight">
                  <Link 
                    href={link.href}
                    className="text-gray-400 hover:text-white text-xs transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal - Single spaced */}
          <div data-testid="footer-legal">
            <h3 className="text-white font-semibold text-xs mb-2">Legal</h3>
            <ul className="space-y-0.5">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href} className="leading-tight">
                  <Link 
                    href={link.href}
                    className="text-gray-400 hover:text-white text-xs transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright Bar - Very compact */}
      <div className="bg-slate-900/50 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex flex-col md:flex-row items-center justify-between gap-1 text-center md:text-left">
            <p className="text-gray-500 text-xs" data-testid="footer-copyright">
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

export default Footer;
