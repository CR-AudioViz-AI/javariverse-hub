import Link from "next/link";

export default function GamePlayPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white py-16 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <Link href="/games" className="text-cyan-400 hover:text-cyan-300 mb-4 inline-block">← Back to Games</Link>
        <div className="text-6xl mb-4">🎮</div>
        <h1 className="text-4xl font-bold mb-4">Game #{params.id}</h1>
        
        <div className="bg-slate-800/50 p-8 rounded-xl border border-slate-700 mt-8">
          <h2 className="text-2xl font-semibold mb-4">Loading Game...</h2>
          <p className="text-slate-300 mb-6">Our extensive games library is being prepared. Check back soon!</p>
          <div className="flex justify-center gap-4">
            <Link href="/games" className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-lg font-semibold transition-colors">
              Browse All Games
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
