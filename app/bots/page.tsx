import { Card, CardContent } from '@/components/ui/card';
import { MobileButton } from '@/components/mobile';
import { Bot, Shield, Eye, Zap, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';

const bots = [
  { name: 'Security Bot', description: 'Monitors for security threats', status: 'active', icon: Shield, color: 'red' },
  { name: 'Uptime Bot', description: 'Checks system availability', status: 'active', icon: Eye, color: 'green' },
  { name: 'Performance Bot', description: 'Monitors system performance', status: 'active', icon: Zap, color: 'yellow' },
  { name: 'Backup Bot', description: 'Automated data backups', status: 'active', icon: Clock, color: 'blue' },
];

export default function BotsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-cyan-500 via-blue-600 to-cyan-600 text-white px-4 py-12 md:py-16 lg:py-20">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <Bot className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 md:mb-6" />
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
              Autonomous Bots
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-blue-100 mb-6 md:mb-8">
              9 autonomous bots working 24/7 to keep your platform running smoothly
            </p>
          </div>
        </div>
      </section>

      {/* Bots Grid */}
      <section className="px-4 py-12 md:py-16 bg-white">
        <div className="container mx-auto">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              {bots.map((bot) => {
                const Icon = bot.icon;
                return (
                  <Card key={bot.name}>
                    <CardContent className="p-4 md:p-6">
                      <div className="flex items-start gap-4">
                        <Icon className={`w-10 h-10 md:w-12 md:h-12 text-${bot.color}-600 flex-shrink-0`} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-gray-900 text-sm md:text-base">{bot.name}</h3>
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
                              <span className="text-xs text-cyan-500">Active</span>
                            </div>
                          </div>
                          <p className="text-xs md:text-sm text-gray-600">{bot.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Status */}
      <section className="px-4 py-12 md:py-16 bg-gradient-to-br from-cyan-500 to-teal-600 text-white">
        <div className="container mx-auto text-center">
          <CheckCircle className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 md:mb-6" />
          <h2 className="text-2xl md:text-3xl font-bold mb-4">All Bots Operational</h2>
          <p className="text-base md:text-lg text-cyan-500 mb-6 md:mb-8 max-w-2xl mx-auto">
            Your platform is being monitored 24/7
          </p>
          <Link href="/status" className="inline-block">
            <MobileButton size="lg" className="bg-white text-cyan-500 hover:bg-cyan-500">
              View System Status
            </MobileButton>
          </Link>
        </div>
      </section>
    </div>
  );
}
