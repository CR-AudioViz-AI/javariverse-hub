/**
 * CrochetGenerator - Main pattern generation component
 * 
 * Integrates with:
 * - Centralized credits system
 * - AI generations logging
 * - Pattern validation engine
 */

'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Download, AlertCircle, Check, Loader2, Lock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { PATTERN_CREDITS } from '@/lib/crochet/constants';

// Pattern templates and generation logic
import { 
  generatePatternFromPrompt, 
  FullPattern,
  ANIMAL_TEMPLATES,
  OBJECT_TEMPLATES,
} from '@/lib/crochet/pattern-generator';

interface UserProfile {
  id: string;
  full_name: string | null;
}

interface CrochetGeneratorProps {
  user: UserProfile | null;
  creditBalance: number;
  isAuthenticated: boolean;
}

// Example prompts with icons
const EXAMPLE_PROMPTS = [
  { prompt: '6 inch manatee', icon: '🦭', credits: PATTERN_CREDITS.standard },
  { prompt: 'cute teddy bear', icon: '🧸', credits: PATTERN_CREDITS.complex },
  { prompt: 'small octopus', icon: '🐙', credits: PATTERN_CREDITS.standard },
  { prompt: '8 inch whale', icon: '🐋', credits: PATTERN_CREDITS.basic },
  { prompt: 'bunny rabbit', icon: '🐰', credits: PATTERN_CREDITS.basic },
  { prompt: 'cat amigurumi', icon: '🐱', credits: PATTERN_CREDITS.complex },
  { prompt: 'simple ball', icon: '⚽', credits: PATTERN_CREDITS.simple },
  { prompt: 'coaster set', icon: '☕', credits: PATTERN_CREDITS.simple },
];

// Determine credit cost based on pattern complexity
function getPatternCreditCost(prompt: string): number {
  const lowerPrompt = prompt.toLowerCase();
  
  // Simple patterns
  if (lowerPrompt.includes('ball') || lowerPrompt.includes('coaster') || lowerPrompt.includes('circle')) {
    return PATTERN_CREDITS.simple;
  }
  
  // Complex patterns (multiple pieces)
  if (lowerPrompt.includes('bear') || lowerPrompt.includes('cat') || lowerPrompt.includes('dog')) {
    return PATTERN_CREDITS.complex;
  }
  
  // Basic patterns
  if (lowerPrompt.includes('whale') || lowerPrompt.includes('bunny') || lowerPrompt.includes('basket')) {
    return PATTERN_CREDITS.basic;
  }
  
  // Default to standard
  return PATTERN_CREDITS.standard;
}

export default function CrochetGenerator({ 
  user, 
  creditBalance: initialBalance,
  isAuthenticated 
}: CrochetGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [difficulty, setDifficulty] = useState<'beginner' | 'easy' | 'intermediate' | 'advanced'>('easy');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedPattern, setGeneratedPattern] = useState<FullPattern | null>(null);
  const [creditBalance, setCreditBalance] = useState(initialBalance);
  const [freePatternUsed, setFreePatternUsed] = useState(false);
  
  const supabase = createClient();
  
  // Check if user has used free pattern today
  useEffect(() => {
    const checkFreePattern = async () => {
      if (!user) return;
      
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from('ai_generations')
        .select('id')
        .eq('user_id', user.id)
        .eq('tool_name', 'crochet')
        .gte('created_at', `${today}T00:00:00`)
        .eq('credits_used', 0);
      
      setFreePatternUsed((data?.length || 0) > 0);
    };
    
    checkFreePattern();
  }, [user]);

  const estimatedCredits = prompt ? getPatternCreditCost(prompt) : 0;
  const canGenerateFree = !freePatternUsed && estimatedCredits <= PATTERN_CREDITS.simple;
  const hasEnoughCredits = canGenerateFree || creditBalance >= estimatedCredits;

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please describe what you want to create');
      return;
    }
    
    if (!isAuthenticated) {
      setError('Please sign in to generate patterns');
      return;
    }
    
    if (!hasEnoughCredits) {
      setError(`Not enough credits. You need ${estimatedCredits} credits for this pattern.`);
      return;
    }

    setLoading(true);
    setError('');
    setGeneratedPattern(null);

    try {
      // Generate the pattern
      const result = await generatePatternFromPrompt({
        prompt,
        difficulty,
        projectType: 'amigurumi',
      });

      if (!result.success || !result.pattern) {
        setError(result.error || 'Failed to generate pattern');
        setLoading(false);
        return;
      }

      // Determine actual credit cost
      const creditCost = canGenerateFree ? 0 : estimatedCredits;
      
      // Deduct credits if not free
      if (creditCost > 0) {
        const { error: creditError } = await supabase.rpc('deduct_credits', {
          p_user_id: user!.id,
          p_amount: creditCost,
          p_description: `CrochetAI: ${result.pattern.title}`,
        });
        
        if (creditError) {
          setError('Failed to process credits. Please try again.');
          setLoading(false);
          return;
        }
        
        setCreditBalance(prev => prev - creditCost);
      }

      // Log the generation
      await supabase.from('ai_generations').insert({
        user_id: user!.id,
        tool_name: 'crochet',
        model_used: 'pattern-engine-v2',
        prompt: prompt,
        result_type: 'pattern',
        credits_used: creditCost,
        metadata: {
          pattern_id: result.pattern.id,
          pattern_title: result.pattern.title,
          difficulty: difficulty,
          sections: result.pattern.sections.length,
        },
      });

      // Mark free pattern as used
      if (creditCost === 0) {
        setFreePatternUsed(true);
      }

      setGeneratedPattern(result.pattern);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!generatedPattern) return;
    
    const blob = new Blob([generatedPattern.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedPattern.title.replace(/[^a-zA-Z0-9]/g, '_')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleNewPattern = () => {
    setGeneratedPattern(null);
    setPrompt('');
    setError('');
  };

  // Show generated pattern view
  if (generatedPattern) {
    return (
      <div id="generator" className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Pattern Header */}
          <div className="bg-gradient-to-r from-cyan-500 to-cyan-500 text-white p-8">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2">{generatedPattern.title}</h2>
                <p className="text-cyan-500 mb-4">{generatedPattern.description}</p>
                <div className="flex flex-wrap gap-3 text-sm">
                  <span className="bg-white/20 px-3 py-1 rounded-full">
                    ⏱️ {generatedPattern.estimatedTime}
                  </span>
                  <span className="bg-white/20 px-3 py-1 rounded-full">
                    📏 {generatedPattern.finishedSize}
                  </span>
                  <span className="bg-white/20 px-3 py-1 rounded-full capitalize">
                    📊 {generatedPattern.difficulty}
                  </span>
                </div>
              </div>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 bg-white text-cyan-500 px-4 py-2 rounded-xl font-semibold hover:bg-cyan-500 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          </div>

          {/* Materials */}
          <div className="p-8 border-b">
            <h3 className="text-xl font-bold text-gray-800 mb-4">🧶 Materials Needed</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {generatedPattern.materials.map((mat, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-lg">
                    {mat.type === 'yarn' ? '🧶' : mat.type === 'hook' ? '🪝' : '📦'}
                  </span>
                  <div>
                    <div className="font-medium text-gray-800">{mat.name}</div>
                    <div className="text-sm text-gray-600">{mat.quantity}</div>
                    {mat.notes && (
                      <div className="text-xs text-gray-500 italic">{mat.notes}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pattern Sections */}
          <div className="p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6">📝 Pattern Instructions</h3>
            
            {generatedPattern.sections.map((section, idx) => (
              <div key={idx} className="mb-8 last:mb-0">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-cyan-500 text-cyan-500 rounded-full flex items-center justify-center font-bold">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-800">
                      {section.name}
                      {section.quantity > 1 && (
                        <span className="text-cyan-500 ml-2">(Make {section.quantity})</span>
                      )}
                    </h4>
                    {section.colorNote && (
                      <span className="text-sm text-gray-600">{section.colorNote}</span>
                    )}
                  </div>
                </div>
                
                <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
                  <pre className="text-cyan-500 text-sm font-mono whitespace-pre-wrap">
                    {section.rounds.join('\n')}
                  </pre>
                </div>
                
                {section.tips.length > 0 && (
                  <div className="mt-3 p-4 bg-cyan-400 border-l-4 border-cyan-400 rounded-r-lg">
                    <div className="font-medium text-cyan-400 mb-1">💡 Tips:</div>
                    <ul className="text-sm text-cyan-400 space-y-1">
                      {section.tips.map((tip, tipIdx) => (
                        <li key={tipIdx}>• {tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Assembly */}
          <div className="p-8 border-t bg-cyan-500">
            <h3 className="text-xl font-bold text-gray-800 mb-4">🔧 Assembly</h3>
            <div className="space-y-2">
              {generatedPattern.assembly.map((step, idx) => (
                <div key={idx} className={`${
                  step.startsWith('ATTACH') || step.startsWith('FINISHING') 
                    ? 'font-bold text-cyan-500 mt-4' 
                    : 'text-gray-700 pl-4'
                }`}>
                  {step}
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 bg-gray-100 text-center text-sm text-gray-600">
            <p>✅ Pattern mathematically validated by CrochetAI</p>
            <p className="mt-1">US crochet terminology • Stitch counts verified</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={handleNewPattern}
            className="px-6 py-3 bg-white text-cyan-500 rounded-xl font-semibold border-2 border-cyan-500 hover:bg-cyan-500 transition-colors"
          >
            Generate Another Pattern
          </button>
          <button
            onClick={handleDownload}
            className="px-6 py-3 bg-cyan-500 text-white rounded-xl font-semibold hover:bg-cyan-500 transition-colors"
          >
            Download as Markdown
          </button>
        </div>
      </div>
    );
  }

  // Show generation form
  return (
    <div id="generator" className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-center mb-6">
          Generate Your Pattern
        </h2>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium">Generation Failed</div>
              <div className="text-sm mt-1">{error}</div>
            </div>
          </div>
        )}

        {/* Auth Required Notice */}
        {!isAuthenticated && (
          <div className="bg-cyan-500 border border-cyan-500 text-cyan-500 px-4 py-3 rounded-xl mb-6 flex items-start gap-3">
            <Lock className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium">Sign in required</div>
              <div className="text-sm mt-1">
                <a href="/login?redirect=/hobbies/crochet" className="underline">Sign in</a> to generate patterns and track your creations.
              </div>
            </div>
          </div>
        )}

        {/* Quick Examples */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quick Examples (click to use)
          </label>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_PROMPTS.map((example, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setPrompt(example.prompt)}
                className="flex items-center gap-1 px-3 py-1.5 bg-cyan-500 hover:bg-cyan-500 text-cyan-500 rounded-full text-sm transition-colors border border-cyan-500"
              >
                <span>{example.icon}</span>
                <span>{example.prompt}</span>
                <span className="text-xs text-cyan-500">({example.credits})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Prompt Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Describe your project
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            placeholder="e.g., 6 inch manatee, cute teddy bear, small octopus..."
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none text-base"
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">
            Include size (like "6 inch" or "10cm") and type of animal or object
          </p>
        </div>

        {/* Difficulty */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Difficulty Level
          </label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as any)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white text-base"
            disabled={loading}
          >
            <option value="beginner">🌱 Beginner - New to crochet</option>
            <option value="easy">🌿 Easy - Know the basics</option>
            <option value="intermediate">🌳 Intermediate - Some experience</option>
            <option value="advanced">🌲 Advanced - Experienced crocheter</option>
          </select>
        </div>

        {/* Credit Cost Display */}
        {prompt && isAuthenticated && (
          <div className={`mb-6 p-4 rounded-xl ${hasEnoughCredits ? 'bg-cyan-500 border border-cyan-500' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium">Credit Cost:</span>
                <span className={`ml-2 font-bold ${hasEnoughCredits ? 'text-cyan-500' : 'text-red-700'}`}>
                  {canGenerateFree ? 'FREE' : `${estimatedCredits} credits`}
                </span>
                {canGenerateFree && (
                  <span className="ml-2 text-xs text-cyan-500">(1 free simple pattern/day)</span>
                )}
              </div>
              <div className="text-sm text-gray-500">
                Balance: {creditBalance}
              </div>
            </div>
            {!hasEnoughCredits && (
              <a href="/pricing" className="text-sm text-red-600 underline mt-2 inline-block">
                Get more credits →
              </a>
            )}
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleGenerate}
          disabled={loading || !isAuthenticated || (isAuthenticated && !hasEnoughCredits)}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 ${
            loading || !isAuthenticated || !hasEnoughCredits
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-cyan-500 to-cyan-500 text-white hover:from-cyan-500 hover:to-cyan-500 shadow-lg hover:shadow-xl'
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating Your Pattern...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Pattern
            </>
          )}
        </button>

        {/* Footer Note */}
        <p className="text-sm text-gray-500 mt-6 text-center">
          🔬 Patterns are mathematically validated for correct stitch counts
        </p>
      </div>
    </div>
  );
}
