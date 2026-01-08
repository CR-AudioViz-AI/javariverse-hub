'use client';

/**
 * CR AudioViz AI - FOOTER COMPONENT (FINAL LOCK)
 * 
 * - Deep navy/near-black background (solid, no gradients)
 * - Increased vertical padding
 * - Breathable spacing between sections
 * - White text, teal accents only
 * - NO rainbow, purple, green
 * 
 * DO NOT MODIFY AFTER LOCK
 * @timestamp January 8, 2026 - FINAL
 */

import Link from 'next/link';

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

const LEGAL_LINKS = [
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Cookie Policy', href: '/cookies' },
  { label: 'DMCA', href: '/dmca' },
  { label: 'Accessibility', href: '/accessibility' },
];

const SUPPORT_LINKS = [
  { label: 'Help Center', href: '/support' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact Us', href: '/contact' },
  { label: 'Documentation', href: '/docs' },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900" data-testid="site-footer">
      {/* Main Footer - INCREASED PADDING for breathing room */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Grid with increased gaps */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block mb-3">
              <span className="text-white font-bold text-xl">CR AudioViz AI</span>
            </Link>
            <p className="text-cyan-400 text-sm font-medium">Your Story. Our Design.</p>
            <p className="text-slate-400 text-sm mt-2">AI-powered creative tools for the modern creator.</p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-white font-semibold text-base mb-4">Navigation</h3>
            <div className="space-y-2.5">
              {NAV_LINKS.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href} 
                  className="block text-slate-400 hover:text-cyan-400 text-sm transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold text-base mb-4">Support</h3>
            <div className="space-y-2.5">
              {SUPPORT_LINKS.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href} 
                  className="block text-slate-400 hover:text-cyan-400 text-sm transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold text-base mb-4">Legal</h3>
            <div className="space-y-2.5">
              {LEGAL_LINKS.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href} 
                  className="block text-slate-400 hover:text-cyan-400 text-sm transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar - Slightly darker for separation */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
            <p className="text-slate-400 text-sm">© {currentYear} CR AudioViz AI, LLC. All rights reserved.</p>
            <p className="text-slate-500 text-sm">Made with ❤️ in Fort Myers, Florida</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
