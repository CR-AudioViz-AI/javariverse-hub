'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumb() {
  const pathname = usePathname();
  
  // Don't show breadcrumb on home page
  if (pathname === '/') return null;

  const pathSegments = pathname.split('/').filter(segment => segment);
  
  // Map route segments to readable labels
  const getLabel = (segment: string) => {
    const labels: Record<string, string> = {
      'apps': 'Apps',
      'games': 'Games',
      'javari': 'Javari AI',
      'craiverse': 'CRAIVerse',
      'pricing': 'Pricing',
      'login': 'Log In',
      'signup': 'Sign Up',
    };
    return labels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  return (
    <nav className="bg-gray-50 border-b border-gray-200">
      <div className="container mx-auto px-4 py-3">
        <ol className="flex items-center space-x-2 text-sm">
          <li>
            <Link 
              href="/" 
              className="flex items-center text-gray-600 hover:text-cyan-500 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span className="ml-1">Home</span>
            </Link>
          </li>
          
          {pathSegments.map((segment, index) => {
            const href = '/' + pathSegments.slice(0, index + 1).join('/');
            const isLast = index === pathSegments.length - 1;
            
            return (
              <li key={segment} className="flex items-center">
                <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
                {isLast ? (
                  <span className="text-cyan-500 font-semibold">
                    {getLabel(segment)}
                  </span>
                ) : (
                  <Link 
                    href={href}
                    className="text-gray-600 hover:text-cyan-500 transition-colors"
                  >
                    {getLabel(segment)}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
