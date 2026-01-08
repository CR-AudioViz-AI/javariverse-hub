'use client';

/**
 * CR AudioViz AI - FOOTER COMPONENT
 * 
 * DEBUG: Added FOOTER_V10_ACTIVE marker to verify this file is rendering
 * 
 * COMPACT footer:
 * - Outer padding: py-8 md:py-10
 * - Grid gaps: gap-y-6 gap-x-10 md:gap-x-14
 * - Link font: text-[15px] leading-[1.25]
 * - List spacing: space-y-2
 * 
 * @timestamp January 8, 2026
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
    <footer className="bg-slate-950 border-t border-white/10" data-testid="site-footer">
      {/* DEBUG MARKER - Remove after confirming this footer renders */}
      <div className="bg-red-600 text-white text-center py-1 text-xs font-bold">
        FOOTER_V10_ACTIVE
      </div>
      
      {/* Main Footer - py-8 md:py-10 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        {/* Grid: gap-y-6 gap-x-10 md:gap-x-14 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-10 md:gap-x-14">
          
          {/* Brand - text only */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block mb-2">
              <span className="text-white font-bold text-lg">CR AudioViz AI</span>
            </Link>
            <p className="text-gray-400 text-sm">Your Story. Our Design.</p>
            <p className="text-gray-500 text-xs mt-1">AI-powered creative tools.</p>
          </div>

          {/* Navigation - text-[15px] leading-[1.25], space-y-2 */}
          <div>
            <h3 className="text-white font-semibold text-[15px] mb-2">Navigation</h3>
            <div className="space-y-2">
              {NAV_LINKS.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href} 
                  className="block text-gray-400 hover:text-white text-[15px] leading-[1.25]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Support - text-[15px] leading-[1.25], space-y-2 */}
          <div>
            <h3 className="text-white font-semibold text-[15px] mb-2">Support</h3>
            <div className="space-y-2">
              {SUPPORT_LINKS.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href} 
                  className="block text-gray-400 hover:text-white text-[15px] leading-[1.25]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Legal - text-[15px] leading-[1.25], space-y-2 */}
          <div>
            <h3 className="text-white font-semibold text-[15px] mb-2">Legal</h3>
            <div className="space-y-2">
              {LEGAL_LINKS.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href} 
                  className="block text-gray-400 hover:text-white text-[15px] leading-[1.25]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-1 text-center sm:text-left">
            <p className="text-gray-400 text-xs">© {currentYear} CR AudioViz AI, LLC. All rights reserved.</p>
            <p className="text-gray-500 text-xs">Made with ❤️ in Fort Myers, Florida</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
