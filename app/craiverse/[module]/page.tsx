import Link from "next/link";

const modules = [
  { slug: "first-responders", name: "First Responders", icon: "🚒", desc: "Supporting those who protect our communities" },
  { slug: "veterans-transition", name: "Veterans Transition", icon: "🎖️", desc: "Helping veterans transition to civilian life" },
  { slug: "faith-communities", name: "Faith Communities", icon: "🙏", desc: "Tools for faith-based organizations" },
  { slug: "animal-rescue", name: "Animal Rescue", icon: "🐾", desc: "Supporting animal welfare organizations" },
  { slug: "mental-health-youth", name: "Youth Mental Health", icon: "💚", desc: "Resources for young minds" },
  { slug: "senior-connect", name: "Senior Connect", icon: "👴", desc: "Bridging the digital divide for seniors" },
  { slug: "education-access", name: "Education Access", icon: "📚", desc: "Making education accessible to all" },
  { slug: "food-security", name: "Food Security", icon: "🍎", desc: "Fighting hunger in communities" },
  { slug: "disaster-relief", name: "Disaster Relief", icon: "🌊", desc: "Rapid response and recovery tools" },
  { slug: "small-business", name: "Small Business", icon: "🏪", desc: "Empowering local entrepreneurs" },
  { slug: "nonprofit-toolkit", name: "Nonprofit Toolkit", icon: "💝", desc: "Tools for nonprofit success" },
  { slug: "digital-literacy", name: "Digital Literacy", icon: "💻", desc: "Building digital skills" },
  { slug: "addiction-recovery", name: "Addiction Recovery", icon: "🌟", desc: "Supporting recovery journeys" },
  { slug: "foster-care-network", name: "Foster Care Network", icon: "🏠", desc: "Connecting foster families" },
  { slug: "rural-health", name: "Rural Health", icon: "🏥", desc: "Healthcare access in rural areas" },
  { slug: "green-earth", name: "Green Earth", icon: "🌱", desc: "Environmental sustainability" },
  { slug: "artists-collective", name: "Artists Collective", icon: "🎨", desc: "Supporting creative communities" },
  { slug: "musicians-guild", name: "Musicians Guild", icon: "🎵", desc: "Resources for musicians" },
  { slug: "community-journalism", name: "Community Journalism", icon: "📰", desc: "Local news and storytelling" },
  { slug: "together-anywhere", name: "Together Anywhere", icon: "🤝", desc: "Remote community building" },
];

export default function CRAIverseModulePage({ params }: { params: { module: string } }) {
  const module = modules.find(m => m.slug === params.module);
  
  if (!module) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">CRAIverse</h1>
          <p className="text-xl text-slate-300 mb-8">Social Impact Modules</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map(m => (
              <Link key={m.slug} href={`/craiverse/${m.slug}`} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 hover:border-cyan-500 transition-colors text-left">
                <span className="text-2xl">{m.icon}</span>
                <h3 className="font-semibold mt-2">{m.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/craiverse" className="text-cyan-400 hover:text-cyan-300 mb-4 inline-block">← Back to CRAIverse</Link>
        <div className="text-6xl mb-4">{module.icon}</div>
        <h1 className="text-4xl font-bold mb-4">{module.name}</h1>
        <p className="text-xl text-slate-300 mb-8">{module.desc}</p>
        
        <div className="bg-slate-800/50 p-8 rounded-xl border border-slate-700">
          <h2 className="text-2xl font-semibold mb-4">Coming Soon</h2>
          <p className="text-slate-300 mb-6">This social impact module is currently in development. Join our waitlist to be notified when it launches.</p>
          <button className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-lg font-semibold transition-colors">
            Join Waitlist
          </button>
        </div>
      </div>
    </div>
  );
}
