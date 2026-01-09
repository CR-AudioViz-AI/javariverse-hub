import { Card, CardContent } from '@/components/ui/card';
import { MobileButton } from '@/components/mobile';
import { Lightbulb, Users, Building2, Rocket, GraduationCap, Heart, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const solutions = [
  { icon: Users, name: 'For Creators', description: 'Build apps, games, and content faster', features: ['60+ Creative Tools', 'Javari AI Assistant', '1200+ Games'], link: '/signup', color: 'blue' },
  { icon: Building2, name: 'For Businesses', description: 'Scale your operations with AI', features: ['Custom Solutions', 'Team Collaboration', 'White-label Options'], link: '/contact?subject=Business', color: 'purple' },
  { icon: GraduationCap, name: 'For Education', description: 'Empower students and educators', features: ['50% Student Discount', 'Classroom Tools', 'Learning Resources'], link: '/pricing', color: 'green' },
  { icon: Heart, name: 'For Nonprofits', description: 'Amplify your social impact', features: ['30% Discount', 'Grant Assistance', 'CRAIverse Access'], link: '/grants', color: 'orange' },
];

export default function SolutionsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-cyan-500 to-cyan-500 text-white px-4 py-12 md:py-16 lg:py-20">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <Lightbulb className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 md:mb-6" />
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
              Solutions for Everyone
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-cyan-500 mb-6 md:mb-8">
              Tailored plans and features for every type of creator
            </p>
          </div>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="px-4 py-12 md:py-16 bg-white">
        <div className="container mx-auto">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {solutions.map((solution) => {
                const Icon = solution.icon;
                return (
                  <Card key={solution.name} className="hover:shadow-lg transition-all">
                    <CardContent className="p-6 md:p-8">
                      <Icon className={`w-12 h-12 md:w-16 md:h-16 text-${solution.color}-600 mb-4`} />
                      <h3 className="font-bold text-gray-900 mb-2 text-xl md:text-2xl">{solution.name}</h3>
                      <p className="text-sm md:text-base text-gray-600 mb-4">{solution.description}</p>
                      <ul className="space-y-2 mb-6">
                        {solution.features.map((feature) => (
                          <li key={feature} className="text-xs md:text-sm text-gray-600 flex items-center gap-2">
                            <span className="text-cyan-500">✓</span> {feature}
                          </li>
                        ))}
                      </ul>
                      <Link href={solution.link}>
                        <MobileButton fullWidth>
                          Get Started <ArrowRight className="w-4 h-4 ml-2" />
                        </MobileButton>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-12 md:py-16 bg-gradient-to-br from-blue-600 to-cyan-500 text-white">
        <div className="container mx-auto text-center">
          <Rocket className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 md:mb-6" />
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Not Sure Which Solution?</h2>
          <p className="text-base md:text-lg text-blue-100 mb-6 md:mb-8 max-w-2xl mx-auto">
            Talk to our team to find the perfect fit for your needs
          </p>
          <Link href="/contact" className="inline-block">
            <MobileButton size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
              Contact Sales
            </MobileButton>
          </Link>
        </div>
      </section>
    </div>
  );
}
