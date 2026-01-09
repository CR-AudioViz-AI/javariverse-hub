'use client';

import { Card, CardContent } from '@/components/ui/card';
import { MobileButton, MobileInput } from '@/components/mobile';
import { BookOpen, Search, FileText, Code, Settings, CreditCard, Users, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const categories = [
  { icon: FileText, name: 'Getting Started', count: 12, link: '/knowledge-base/getting-started', color: 'blue' },
  { icon: Code, name: 'API Documentation', count: 24, link: '/knowledge-base/api', color: 'purple' },
  { icon: Settings, name: 'Account & Settings', count: 8, link: '/knowledge-base/account', color: 'green' },
  { icon: CreditCard, name: 'Billing & Credits', count: 10, link: '/knowledge-base/billing', color: 'orange' },
  { icon: Users, name: 'Team Management', count: 6, link: '/knowledge-base/teams', color: 'pink' },
  { icon: BookOpen, name: 'Tutorials', count: 15, link: '/tutorials', color: 'indigo' },
];

const popularArticles = [
  { title: 'How to get started', link: '/knowledge-base/getting-started/intro' },
  { title: 'Understanding credits', link: '/knowledge-base/billing/credits' },
  { title: 'API authentication', link: '/knowledge-base/api/auth' },
  { title: 'Using Javari AI', link: '/knowledge-base/javari/basics' },
  { title: 'Exporting projects', link: '/knowledge-base/export' },
];

export default function KnowledgeBasePage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-cyan-500 to-cyan-500 text-white px-4 py-12 md:py-16 lg:py-20">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <BookOpen className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 md:mb-6" />
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
              Knowledge Base
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-blue-100 mb-6 md:mb-8">
              Find answers to all your questions
            </p>
            <div className="max-w-2xl mx-auto">
              <MobileInput
                type="search"
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="w-5 h-5" />}
                className="bg-white/90 text-gray-900"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="px-4 py-12 md:py-16 bg-white">
        <div className="container mx-auto">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8 text-center">Browse by Category</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <Link key={category.name} href={category.link}>
                    <Card className="h-full hover:shadow-lg transition-all cursor-pointer">
                      <CardContent className="p-4 md:p-6 text-center">
                        <Icon className={`w-10 h-10 md:w-12 md:h-12 text-${category.color}-600 mx-auto mb-3`} />
                        <h3 className="font-bold text-gray-900 mb-1 text-sm md:text-base">{category.name}</h3>
                        <p className="text-xs text-gray-500">{category.count} articles</p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="px-4 py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8">Popular Articles</h2>
            
            <div className="space-y-3 md:space-y-4">
              {popularArticles.map((article) => (
                <Link key={article.title} href={article.link}>
                  <Card className="hover:shadow-md transition-all cursor-pointer">
                    <CardContent className="p-4 md:p-6 flex items-center justify-between">
                      <span className="font-medium text-sm md:text-base text-gray-900">{article.title}</span>
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-12 md:py-16 bg-gradient-to-br from-blue-600 to-cyan-500 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Can't Find What You Need?</h2>
          <p className="text-base md:text-lg text-blue-100 mb-6 md:mb-8 max-w-2xl mx-auto">
            Our support team is here to help
          </p>
          <Link href="/contact" className="inline-block">
            <MobileButton size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
              Contact Support
            </MobileButton>
          </Link>
        </div>
      </section>
    </div>
  );
}
