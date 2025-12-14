// app/craiverse/page.tsx
// CRAIverse - 20 Social Impact Modules
// Timestamp: Saturday, December 13, 2025 - 11:22 AM EST

import { MobileButton } from '@/components/mobile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Heart, Shield, Users, Church, PawPrint, TreePine, 
  Store, Building2, GraduationCap, MapPin, Briefcase,
  DollarSign, Sparkles, Globe, Home, Stethoscope,
  Baby, Mic, Palette, Scale, Truck, Wifi, BookOpen,
  Utensils, Music, Camera, Gamepad2
} from 'lucide-react';

// Complete 20 Social Impact Modules
const MODULES = [
  // TIER 1: HIGH-PRIORITY GRANT TARGETS ($400M+)
  {
    id: 'first-responders',
    name: 'First Responders Haven',
    icon: Shield,
    color: 'blue',
    grants: '$400M+',
    tier: 1,
    description: 'Mental health support for police, fire, EMS, and military. Anonymous peer support groups and professional resources.',
    features: ['Anonymous support groups', 'Professional counseling', 'Peer networking', 'Grant-funded access'],
    targetAudience: 'Police, Fire, EMS, Military',
    impactMetric: '500K+ first responders'
  },
  {
    id: 'veterans-transition',
    name: 'Veterans Transition Hub',
    icon: Briefcase,
    color: 'slate',
    grants: '$150M+',
    tier: 1,
    description: 'Career transition support for veterans. Resume building, job matching, skills translation, and employer connections.',
    features: ['Skills translation', 'Job matching AI', 'Resume builder', 'Employer network'],
    targetAudience: 'Military Veterans',
    impactMetric: '200K+ veterans annually'
  },

  // TIER 2: FAMILY & COMMUNITY ($50M-150M)
  {
    id: 'together-anywhere',
    name: 'Together Anywhere',
    icon: Heart,
    color: 'red',
    grants: '$50M+',
    tier: 2,
    description: 'Virtual family rooms for military families separated by deployment. Video chat, shared calendars, and memory books.',
    features: ['Video family rooms', 'Shared calendars', 'Memory books', 'Deployment support'],
    targetAudience: 'Military Families',
    impactMetric: '100K+ families connected'
  },
  {
    id: 'faith-communities',
    name: 'Faith Communities',
    icon: Church,
    color: 'purple',
    grants: '$75M+',
    tier: 2,
    description: 'Digital tools for churches, temples, and religious organizations. Live streaming, donation management, and member engagement.',
    features: ['Live streaming', 'Donation management', 'Member portal', 'Event planning'],
    targetAudience: 'Religious Organizations',
    impactMetric: '10K+ congregations'
  },
  {
    id: 'senior-connect',
    name: 'Senior Connect',
    icon: Users,
    color: 'amber',
    grants: '$80M+',
    tier: 2,
    description: 'Combat isolation for seniors. Video visits with family, virtual activities, health monitoring, and emergency alerts.',
    features: ['Video visits', 'Virtual activities', 'Health monitoring', 'Emergency alerts'],
    targetAudience: 'Seniors 65+',
    impactMetric: '1M+ seniors supported'
  },
  {
    id: 'foster-care-network',
    name: 'Foster Care Network',
    icon: Home,
    color: 'rose',
    grants: '$60M+',
    tier: 2,
    description: 'Connect foster families, case workers, and resources. Placement matching, training, and support communities.',
    features: ['Placement matching', 'Training modules', 'Resource library', 'Support groups'],
    targetAudience: 'Foster Families & Agencies',
    impactMetric: '50K+ children supported'
  },

  // TIER 3: HEALTH & WELLNESS ($30M-50M)
  {
    id: 'rural-health',
    name: 'Rural Health Access',
    icon: Stethoscope,
    color: 'teal',
    grants: '$45M+',
    tier: 3,
    description: 'Telehealth platform for rural communities. Connect with specialists, manage prescriptions, and access health education.',
    features: ['Telehealth visits', 'Specialist access', 'Prescription management', 'Health education'],
    targetAudience: 'Rural Communities',
    impactMetric: '500K+ rural patients'
  },
  {
    id: 'mental-health-youth',
    name: 'Youth Mental Health',
    icon: Baby,
    color: 'sky',
    grants: '$55M+',
    tier: 3,
    description: 'Age-appropriate mental health resources for teens. Anonymous support, crisis intervention, and school partnerships.',
    features: ['Anonymous support', 'Crisis hotline', 'School integration', 'Parent resources'],
    targetAudience: 'Teens 13-19',
    impactMetric: '2M+ teens reached'
  },
  {
    id: 'addiction-recovery',
    name: 'Recovery Together',
    icon: Heart,
    color: 'emerald',
    grants: '$40M+',
    tier: 3,
    description: 'Addiction recovery support network. Meeting finder, sponsor connections, milestone tracking, and family support.',
    features: ['Meeting finder', 'Sponsor matching', 'Milestone tracking', 'Family support'],
    targetAudience: 'Recovery Community',
    impactMetric: '100K+ in recovery'
  },

  // TIER 4: ANIMALS & ENVIRONMENT ($30M-45M)
  {
    id: 'animal-rescue',
    name: 'Animal Rescue Network',
    icon: PawPrint,
    color: 'orange',
    grants: '$40M+',
    tier: 4,
    description: 'Connect rescue organizations, foster families, and adopters. Track animals, manage adoptions, and coordinate volunteers.',
    features: ['Adoption matching', 'Foster network', 'Volunteer coordination', 'Medical records'],
    targetAudience: 'Animal Rescues',
    impactMetric: '500K+ animals saved'
  },
  {
    id: 'green-earth',
    name: 'Green Earth Initiative',
    icon: TreePine,
    color: 'green',
    grants: '$35M+',
    tier: 4,
    description: 'Environmental projects and community gardens. Track conservation efforts, coordinate volunteers, and share resources.',
    features: ['Project tracking', 'Volunteer coordination', 'Resource sharing', 'Impact metrics'],
    targetAudience: 'Environmental Orgs',
    impactMetric: '10K+ projects'
  },
  {
    id: 'disaster-relief',
    name: 'Disaster Relief Hub',
    icon: Truck,
    color: 'red',
    grants: '$50M+',
    tier: 4,
    description: 'Coordinate disaster response efforts. Resource allocation, volunteer deployment, and affected family support.',
    features: ['Resource coordination', 'Volunteer deployment', 'Family assistance', 'Real-time updates'],
    targetAudience: 'Disaster Response Orgs',
    impactMetric: '1M+ people assisted'
  },

  // TIER 5: BUSINESS & EDUCATION ($20M-35M)
  {
    id: 'small-business',
    name: 'Small Business Hub',
    icon: Store,
    color: 'indigo',
    grants: '$25M+',
    tier: 5,
    description: 'Tools for local businesses to thrive. Inventory management, customer engagement, and marketing automation.',
    features: ['Inventory management', 'Customer CRM', 'Marketing tools', 'Financial tracking'],
    targetAudience: 'Small Businesses',
    impactMetric: '50K+ businesses'
  },
  {
    id: 'nonprofit-toolkit',
    name: 'Nonprofit Toolkit',
    icon: Building2,
    color: 'violet',
    grants: '$30M+',
    tier: 5,
    description: 'Complete management suite for nonprofits. Donor management, grant tracking, volunteer coordination, and impact reporting.',
    features: ['Donor management', 'Grant tracking', 'Volunteer CRM', 'Impact reports'],
    targetAudience: 'Nonprofits',
    impactMetric: '25K+ nonprofits'
  },
  {
    id: 'education-access',
    name: 'Education Access',
    icon: GraduationCap,
    color: 'blue',
    grants: '$35M+',
    tier: 5,
    description: 'Bridge the education gap. Tutoring connections, scholarship matching, and learning resources for underserved students.',
    features: ['Tutor matching', 'Scholarship finder', 'Learning resources', 'Progress tracking'],
    targetAudience: 'Underserved Students',
    impactMetric: '500K+ students'
  },
  {
    id: 'digital-literacy',
    name: 'Digital Literacy',
    icon: Wifi,
    color: 'cyan',
    grants: '$20M+',
    tier: 5,
    description: 'Bridge the digital divide. Computer training, internet access programs, and device donation coordination.',
    features: ['Training courses', 'Device programs', 'Internet access', 'Tech support'],
    targetAudience: 'Underserved Communities',
    impactMetric: '200K+ trained'
  },

  // TIER 6: ARTS & CULTURE ($15M-25M)
  {
    id: 'artists-collective',
    name: 'Artists Collective',
    icon: Palette,
    color: 'pink',
    grants: '$20M+',
    tier: 6,
    description: 'Platform for independent artists. Portfolio hosting, commission management, and community collaboration.',
    features: ['Portfolio hosting', 'Commission system', 'Collaboration tools', 'Marketing support'],
    targetAudience: 'Independent Artists',
    impactMetric: '100K+ artists'
  },
  {
    id: 'musicians-guild',
    name: 'Musicians Guild',
    icon: Music,
    color: 'fuchsia',
    grants: '$18M+',
    tier: 6,
    description: 'Support emerging musicians. Gig booking, collaboration matching, and music education resources.',
    features: ['Gig booking', 'Collaboration matching', 'Music lessons', 'Equipment sharing'],
    targetAudience: 'Musicians',
    impactMetric: '75K+ musicians'
  },
  {
    id: 'community-journalism',
    name: 'Community Journalism',
    icon: BookOpen,
    color: 'gray',
    grants: '$15M+',
    tier: 6,
    description: 'Support local news and citizen journalism. Publishing tools, fact-checking resources, and community reporting.',
    features: ['Publishing platform', 'Fact-checking', 'Community reporting', 'Revenue sharing'],
    targetAudience: 'Local Journalists',
    impactMetric: '5K+ publications'
  },
  {
    id: 'food-security',
    name: 'Food Security Network',
    icon: Utensils,
    color: 'lime',
    grants: '$25M+',
    tier: 6,
    description: 'Connect food banks, pantries, and those in need. Inventory tracking, delivery coordination, and nutrition education.',
    features: ['Inventory tracking', 'Delivery coordination', 'Recipient matching', 'Nutrition education'],
    targetAudience: 'Food Banks & Recipients',
    impactMetric: '10M+ meals distributed'
  }
];

// Calculate total grants
const TOTAL_GRANTS = MODULES.reduce((sum, m) => {
  const amount = parseInt(m.grants.replace(/[^0-9]/g, ''));
  return sum + amount;
}, 0);

export default function CRAIversePage() {
  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string; hover: string }> = {
      blue: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200', hover: 'hover:border-blue-400' },
      red: { bg: 'bg-red-100', text: 'text-red-600', border: 'border-red-200', hover: 'hover:border-red-400' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200', hover: 'hover:border-purple-400' },
      orange: { bg: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-200', hover: 'hover:border-orange-400' },
      green: { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-200', hover: 'hover:border-green-400' },
      indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600', border: 'border-indigo-200', hover: 'hover:border-indigo-400' },
      slate: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', hover: 'hover:border-slate-400' },
      amber: { bg: 'bg-amber-100', text: 'text-amber-600', border: 'border-amber-200', hover: 'hover:border-amber-400' },
      rose: { bg: 'bg-rose-100', text: 'text-rose-600', border: 'border-rose-200', hover: 'hover:border-rose-400' },
      teal: { bg: 'bg-teal-100', text: 'text-teal-600', border: 'border-teal-200', hover: 'hover:border-teal-400' },
      sky: { bg: 'bg-sky-100', text: 'text-sky-600', border: 'border-sky-200', hover: 'hover:border-sky-400' },
      emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600', border: 'border-emerald-200', hover: 'hover:border-emerald-400' },
      violet: { bg: 'bg-violet-100', text: 'text-violet-600', border: 'border-violet-200', hover: 'hover:border-violet-400' },
      cyan: { bg: 'bg-cyan-100', text: 'text-cyan-600', border: 'border-cyan-200', hover: 'hover:border-cyan-400' },
      pink: { bg: 'bg-pink-100', text: 'text-pink-600', border: 'border-pink-200', hover: 'hover:border-pink-400' },
      fuchsia: { bg: 'bg-fuchsia-100', text: 'text-fuchsia-600', border: 'border-fuchsia-200', hover: 'hover:border-fuchsia-400' },
      gray: { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200', hover: 'hover:border-gray-400' },
      lime: { bg: 'bg-lime-100', text: 'text-lime-600', border: 'border-lime-200', hover: 'hover:border-lime-400' },
    };
    return colors[color] || colors.blue;
  };

  const tier1Modules = MODULES.filter(m => m.tier === 1);
  const tier2Modules = MODULES.filter(m => m.tier === 2);
  const tier3Modules = MODULES.filter(m => m.tier === 3);
  const tier4Modules = MODULES.filter(m => m.tier === 4);
  const tier5Modules = MODULES.filter(m => m.tier === 5);
  const tier6Modules = MODULES.filter(m => m.tier === 6);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Crai */}
      <section className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 text-white px-4 py-12 md:py-16 lg:py-20">
        <div className="container mx-auto">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
              {/* CRAI Avatar */}
              <div className="order-2 lg:order-1 flex justify-center lg:justify-start">
                <div className="relative w-32 h-32 md:w-48 md:h-48">
                  <Image
                    src="/avatars/craiavatar.png"
                    alt="CRAI - Your CRAIverse Guide"
                    width={192}
                    height={192}
                    className="rounded-full shadow-xl"
                    priority
                  />
                </div>
              </div>

              {/* Content */}
              <div className="order-1 lg:order-2 text-center lg:text-left">
                <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 md:mb-6">
                  Welcome to CRAIverse
                </h1>
                <p className="text-lg md:text-xl lg:text-2xl text-blue-100 mb-3 md:mb-4">
                  Meet <span className="font-semibold text-white">Crai</span> - Your Guide to Social Impact
                </p>
                <p className="text-base md:text-lg text-blue-100 mb-6 md:mb-8">
                  {MODULES.length} specialized modules connecting communities, businesses, and causes. 
                  From supporting first responders to building small businesses, CRAIverse 
                  makes real social impact possible.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <MobileButton 
                    size="lg"
                    className="bg-white text-purple-600 hover:bg-purple-50"
                  >
                    Explore All {MODULES.length} Modules
                  </MobileButton>
                  <MobileButton 
                    size="lg" 
                    variant="outline"
                    className="border-2 border-white text-white hover:bg-white/10"
                    icon={<DollarSign className="w-5 h-5" />}
                  >
                    View Grants (${TOTAL_GRANTS}M+)
                  </MobileButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grant Funding Banner */}
      <section className="bg-green-600 text-white px-4 py-4 md:py-6">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between max-w-6xl mx-auto gap-4">
            <div className="flex items-center space-x-3 text-center md:text-left">
              <DollarSign className="w-6 h-6 md:w-8 md:h-8 flex-shrink-0" />
              <div>
                <p className="font-bold text-base md:text-xl">${TOTAL_GRANTS}M+ in Grant Funding Available</p>
                <p className="text-green-100 text-xs md:text-sm">For First Responders, Veterans, Military Families, Health, Education & More</p>
              </div>
            </div>
            <Link href="/admin/grants">
              <MobileButton 
                size="sm"
                className="bg-white text-green-600 hover:bg-green-50 w-full sm:w-auto"
              >
                Grant Dashboard
              </MobileButton>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 py-12 md:py-16 bg-white">
        <div className="container mx-auto">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <div className="text-center">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <Globe className="w-6 h-6 md:w-8 md:h-8 text-purple-600" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{MODULES.length}</div>
                <div className="text-xs md:text-sm text-gray-600">Social Modules</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <DollarSign className="w-6 h-6 md:w-8 md:h-8 text-green-600" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">${TOTAL_GRANTS}M+</div>
                <div className="text-xs md:text-sm text-gray-600">Grant Funding</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <Users className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">10M+</div>
                <div className="text-xs md:text-sm text-gray-600">People Impacted</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <Heart className="w-6 h-6 md:w-8 md:h-8 text-orange-600" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">6</div>
                <div className="text-xs md:text-sm text-gray-600">Impact Tiers</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TIER 1: High Priority */}
      <section className="px-4 py-12 md:py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <Shield className="w-4 h-4" />
              TIER 1: PRIORITY INITIATIVES
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              First Responders & Veterans
            </h2>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
              Our highest-priority modules targeting $550M+ in federal and state grants
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {tier1Modules.map((module) => {
              const Icon = module.icon;
              const colors = getColorClasses(module.color);
              
              return (
                <Card 
                  key={module.id}
                  className={`hover:shadow-xl transition-all border-2 ${colors.border} ${colors.hover}`}
                >
                  <CardHeader className="p-4 md:p-6">
                    <div className="flex items-start justify-between">
                      <Icon className={`w-10 h-10 md:w-12 md:h-12 ${colors.text} mb-3`} />
                      <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                        PRIORITY
                      </span>
                    </div>
                    <CardTitle className="text-lg md:text-xl">{module.name}</CardTitle>
                    <CardDescription>
                      <span className={`inline-block ${colors.bg} ${colors.text} text-xs font-semibold px-2 py-1 rounded mr-2`}>
                        {module.grants} Grants
                      </span>
                      <span className="text-gray-500 text-xs">{module.targetAudience}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6 pt-0">
                    <p className="text-sm md:text-base text-gray-600 mb-4">
                      {module.description}
                    </p>
                    <ul className="space-y-2 text-xs md:text-sm text-gray-600 mb-4">
                      {module.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${colors.bg.replace('100', '500')}`}></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className="text-xs text-gray-500">Impact: {module.impactMetric}</span>
                      <Link href={`/craiverse/${module.id}`}>
                        <MobileButton
                          size="sm"
                          className={`${colors.bg} ${colors.text} border-0`}
                        >
                          Learn More
                        </MobileButton>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* TIER 2: Family & Community */}
      <section className="px-4 py-12 md:py-16 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <div className="inline-flex items-center gap-2 bg-rose-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <Heart className="w-4 h-4" />
              TIER 2: FAMILY & COMMUNITY
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Strengthening Families & Communities
            </h2>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
              Supporting military families, faith communities, seniors, and foster care
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {tier2Modules.map((module) => {
              const Icon = module.icon;
              const colors = getColorClasses(module.color);
              
              return (
                <Card 
                  key={module.id}
                  className={`hover:shadow-xl transition-all border-2 ${colors.border} ${colors.hover}`}
                >
                  <CardHeader className="p-4">
                    <Icon className={`w-8 h-8 ${colors.text} mb-2`} />
                    <CardTitle className="text-base">{module.name}</CardTitle>
                    <CardDescription>
                      <span className={`inline-block ${colors.bg} ${colors.text} text-xs font-semibold px-2 py-0.5 rounded`}>
                        {module.grants}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {module.description}
                    </p>
                    <Link href={`/craiverse/${module.id}`}>
                      <MobileButton fullWidth size="sm" className={`${colors.bg} ${colors.text} border-0`}>
                        Explore
                      </MobileButton>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* TIER 3: Health & Wellness */}
      <section className="px-4 py-12 md:py-16 bg-gradient-to-br from-teal-50 to-emerald-50">
        <div className="container mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <div className="inline-flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <Stethoscope className="w-4 h-4" />
              TIER 3: HEALTH & WELLNESS
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Healthcare Access for All
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {tier3Modules.map((module) => {
              const Icon = module.icon;
              const colors = getColorClasses(module.color);
              
              return (
                <Card 
                  key={module.id}
                  className={`hover:shadow-xl transition-all border-2 ${colors.border} ${colors.hover}`}
                >
                  <CardHeader className="p-4">
                    <Icon className={`w-8 h-8 ${colors.text} mb-2`} />
                    <CardTitle className="text-base">{module.name}</CardTitle>
                    <CardDescription>
                      <span className={`inline-block ${colors.bg} ${colors.text} text-xs font-semibold px-2 py-0.5 rounded`}>
                        {module.grants}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {module.description}
                    </p>
                    <Link href={`/craiverse/${module.id}`}>
                      <MobileButton fullWidth size="sm" className={`${colors.bg} ${colors.text} border-0`}>
                        Explore
                      </MobileButton>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* TIER 4: Animals & Environment */}
      <section className="px-4 py-12 md:py-16 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <div className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <TreePine className="w-4 h-4" />
              TIER 4: ANIMALS & ENVIRONMENT
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Protecting Our Planet & Animals
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {tier4Modules.map((module) => {
              const Icon = module.icon;
              const colors = getColorClasses(module.color);
              
              return (
                <Card 
                  key={module.id}
                  className={`hover:shadow-xl transition-all border-2 ${colors.border} ${colors.hover}`}
                >
                  <CardHeader className="p-4">
                    <Icon className={`w-8 h-8 ${colors.text} mb-2`} />
                    <CardTitle className="text-base">{module.name}</CardTitle>
                    <CardDescription>
                      <span className={`inline-block ${colors.bg} ${colors.text} text-xs font-semibold px-2 py-0.5 rounded`}>
                        {module.grants}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {module.description}
                    </p>
                    <Link href={`/craiverse/${module.id}`}>
                      <MobileButton fullWidth size="sm" className={`${colors.bg} ${colors.text} border-0`}>
                        Explore
                      </MobileButton>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* TIER 5: Business & Education */}
      <section className="px-4 py-12 md:py-16 bg-gradient-to-br from-indigo-50 to-violet-50">
        <div className="container mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <div className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <GraduationCap className="w-4 h-4" />
              TIER 5: BUSINESS & EDUCATION
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Empowering Growth & Learning
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {tier5Modules.map((module) => {
              const Icon = module.icon;
              const colors = getColorClasses(module.color);
              
              return (
                <Card 
                  key={module.id}
                  className={`hover:shadow-xl transition-all border-2 ${colors.border} ${colors.hover}`}
                >
                  <CardHeader className="p-4">
                    <Icon className={`w-8 h-8 ${colors.text} mb-2`} />
                    <CardTitle className="text-sm">{module.name}</CardTitle>
                    <CardDescription>
                      <span className={`inline-block ${colors.bg} ${colors.text} text-xs font-semibold px-2 py-0.5 rounded`}>
                        {module.grants}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <Link href={`/craiverse/${module.id}`}>
                      <MobileButton fullWidth size="sm" className={`${colors.bg} ${colors.text} border-0`}>
                        Explore
                      </MobileButton>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* TIER 6: Arts & Culture */}
      <section className="px-4 py-12 md:py-16 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <div className="inline-flex items-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <Palette className="w-4 h-4" />
              TIER 6: ARTS & CULTURE
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Supporting Creativity & Community
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {tier6Modules.map((module) => {
              const Icon = module.icon;
              const colors = getColorClasses(module.color);
              
              return (
                <Card 
                  key={module.id}
                  className={`hover:shadow-xl transition-all border-2 ${colors.border} ${colors.hover}`}
                >
                  <CardHeader className="p-4">
                    <Icon className={`w-8 h-8 ${colors.text} mb-2`} />
                    <CardTitle className="text-sm">{module.name}</CardTitle>
                    <CardDescription>
                      <span className={`inline-block ${colors.bg} ${colors.text} text-xs font-semibold px-2 py-0.5 rounded`}>
                        {module.grants}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <Link href={`/craiverse/${module.id}`}>
                      <MobileButton fullWidth size="sm" className={`${colors.bg} ${colors.text} border-0`}>
                        Explore
                      </MobileButton>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-12 md:py-16 bg-gradient-to-br from-purple-600 to-indigo-600 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
            Ready to Make an Impact?
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-purple-100 mb-6 md:mb-8 max-w-2xl mx-auto">
            Join CRAIverse and connect with {MODULES.length} modules serving communities that need it most. 
            Over ${TOTAL_GRANTS}M in grant funding available.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Link href="/signup" className="flex-1">
              <MobileButton 
                size="lg" 
                fullWidth
                className="bg-white text-purple-600 hover:bg-purple-50"
              >
                Get Started Free
              </MobileButton>
            </Link>
            <Link href="/contact?subject=CRAIverse%20Partnership" className="flex-1">
              <MobileButton 
                size="lg" 
                fullWidth
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10"
              >
                Partner With Us
              </MobileButton>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
