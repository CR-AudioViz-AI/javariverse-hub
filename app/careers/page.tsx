import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MobileButton } from '@/components/mobile';
import { Briefcase, MapPin, Clock, Users, Heart, Zap, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function CareersPage() {
  const openPositions = [
    {
      title: "Senior Full Stack Engineer",
      location: "Remote (USA)",
      type: "Full-time",
      department: "Engineering",
      link: "/careers/full-stack-engineer"
    },
    {
      title: "AI/ML Engineer",
      location: "Remote or Fort Myers, FL",
      type: "Full-time",
      department: "Engineering",
      link: "/careers/ai-ml-engineer"
    },
    {
      title: "Product Designer",
      location: "Remote (USA)",
      type: "Full-time",
      department: "Design",
      link: "/careers/product-designer"
    },
    {
      title: "Content Marketing Manager",
      location: "Remote",
      type: "Full-time",
      department: "Marketing",
      link: "/careers/content-marketing"
    },
    {
      title: "Customer Success Lead",
      location: "Fort Myers, FL",
      type: "Full-time",
      department: "Customer Success",
      link: "/careers/customer-success"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-cyan-600 via-cyan-600 to-red-600 text-white px-4 py-12 md:py-16 lg:py-20">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <Briefcase className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 md:mb-6" />
            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 md:mb-6">
              Join Our Team
            </h1>
            <p className="text-lg md:text-xl text-cyan-100 mb-6 md:mb-8">
              Help us build the future of AI-powered creativity
            </p>
          </div>
        </div>
      </section>

      {/* Why Work Here */}
      <section className="px-4 py-12 md:py-16 bg-white">
        <div className="container mx-auto">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-8 md:mb-12">
              Why CR AudioViz AI?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              <Card>
                <CardHeader className="p-4 md:p-6">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3 md:mb-4">
                    <Zap className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-center text-base md:text-lg">Innovation First</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-sm md:text-base text-gray-600 p-4 md:p-6 pt-0">
                  Work on cutting-edge AI technology that empowers millions of creators worldwide
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-4 md:p-6">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-cyan-100 rounded-lg flex items-center justify-center mx-auto mb-3 md:mb-4">
                    <Users className="w-5 h-5 md:w-6 md:h-6 text-cyan-600" />
                  </div>
                  <CardTitle className="text-center text-base md:text-lg">Amazing Team</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-sm md:text-base text-gray-600 p-4 md:p-6 pt-0">
                  Collaborate with talented, passionate people who love what they do
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-4 md:p-6">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-cyan-100 rounded-lg flex items-center justify-center mx-auto mb-3 md:mb-4">
                    <Heart className="w-5 h-5 md:w-6 md:h-6 text-cyan-600" />
                  </div>
                  <CardTitle className="text-center text-base md:text-lg">Great Benefits</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-sm md:text-base text-gray-600 p-4 md:p-6 pt-0">
                  Competitive salary, health insurance, unlimited PTO, and remote work options
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="px-4 py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-8 md:mb-12">
              Open Positions
            </h2>

            <div className="space-y-4 md:space-y-6">
              {openPositions.map((job, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col space-y-4">
                      {/* Job Info */}
                      <div className="flex-1">
                        <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3">
                          {job.title}
                        </h3>
                        <div className="flex flex-wrap gap-3 md:gap-4 text-xs md:text-sm text-gray-600">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1 flex-shrink-0" />
                            <span>{job.type}</span>
                          </div>
                          <div className="flex items-center">
                            <Briefcase className="w-4 h-4 mr-1 flex-shrink-0" />
                            <span>{job.department}</span>
                          </div>
                        </div>
                      </div>

                      {/* Apply Button - Full width on mobile */}
                      <Link href={job.link} className="block">
                        <MobileButton 
                          fullWidth
                          className="bg-blue-600 hover:bg-blue-700"
                          icon={<ArrowRight className="w-4 h-4" />}
                        >
                          Apply Now
                        </MobileButton>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* No Openings Message */}
            <Card className="mt-8 md:mt-12 bg-cyan-50 border-cyan-200">
              <CardContent className="p-6 md:p-8 text-center">
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3">
                  Don't see the right role?
                </h3>
                <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
                  We're always looking for talented people. Send us your resume and we'll keep you in mind for future opportunities.
                </p>
                <Link href="/contact?subject=General Application" className="inline-block w-full sm:w-auto">
                  <MobileButton 
                    fullWidth
                    variant="outline"
                    className="border-2 border-cyan-600 text-cyan-600 hover:bg-cyan-50"
                  >
                    Submit General Application
                  </MobileButton>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-4 py-12 md:py-16 bg-white">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-8 md:mb-12">
              Benefits & Perks
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              {[
                "🏥 Health, Dental & Vision Insurance",
                "🏖️ Unlimited PTO",
                "🏠 Remote Work Options",
                "💰 Competitive Salary",
                "📈 Stock Options",
                "🎓 Learning & Development Budget",
                "💻 Latest Tech Equipment",
                "🎉 Team Events & Retreats",
                "🍼 Parental Leave",
                "🚴 Wellness Benefits",
                "🏋️ Gym Membership",
                "☕ Daily Lunch & Snacks"
              ].map((benefit, index) => (
                <div 
                  key={index}
                  className="flex items-center p-3 md:p-4 bg-gray-50 rounded-lg text-sm md:text-base"
                >
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-12 md:py-16 bg-gradient-to-br from-cyan-600 to-cyan-600 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
            Ready to Join Us?
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-cyan-100 mb-6 md:mb-8 max-w-2xl mx-auto">
            Be part of a team that's revolutionizing creativity with AI
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Link href="#open-positions" className="flex-1">
              <MobileButton 
                size="lg" 
                fullWidth
                className="bg-white text-cyan-600 hover:bg-cyan-50"
              >
                View Open Roles
              </MobileButton>
            </Link>
            <Link href="/about" className="flex-1">
              <MobileButton 
                size="lg" 
                fullWidth
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10"
              >
                Learn About Us
              </MobileButton>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
