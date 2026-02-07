/**
 * MULTI-AI CHAMBER
 * Route: /chamber
 * ChatGPT (Architect) + Claude (Builder) + Javari (Observer)
 */

'use client';

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import JavariChamberUI from '@/components/JavariChamberUI';

export default function ChamberPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navigation />
      <main className="flex-grow">
        <JavariChamberUI />
      </main>
      <Footer />
    </div>
  );
}
