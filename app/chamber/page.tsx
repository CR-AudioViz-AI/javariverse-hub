/**
 * MULTI-AI CHAMBER
 * Route: /chamber
 * ChatGPT (Architect) + Claude (Builder) + Javari (Observer)
 */

import { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import JavariChamberUI from '@/app/components/JavariChamberUI';

export const metadata: Metadata = {
  title: 'Multi-AI Chamber | CR AudioViz AI',
  description: 'Build with ChatGPT (Architect) + Claude (Builder) + Javari (Observer)',
};

export default function ChamberPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-grow">
        <JavariChamberUI />
      </main>
      <Footer />
    </div>
  );
}
