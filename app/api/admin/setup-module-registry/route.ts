/**
 * CR AudioViz AI - Module Registry Setup API
 * Creates the module_registry table if it doesn't exist
 * 
 * @version 1.0.0
 * @date January 1, 2026
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    // Check if table exists
    const { data: tableCheck, error: checkError } = await supabase
      .from('module_registry')
      .select('id')
      .limit(1)
    
    if (!checkError) {
      // Table exists, count modules
      const { count } = await supabase
        .from('module_registry')
        .select('*', { count: 'exact', head: true })
      
      return NextResponse.json({
        success: true,
        message: 'Module registry table already exists',
        moduleCount: count || 0,
        timestamp: new Date().toISOString()
      })
    }
    
    // Table doesn't exist - create it
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS module_registry (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          module_slug VARCHAR(100) UNIQUE NOT NULL,
          module_name VARCHAR(200) NOT NULL,
          definition JSONB NOT NULL DEFAULT '{}',
          status VARCHAR(50) DEFAULT 'draft',
          version VARCHAR(20) DEFAULT '1.0.0',
          routes JSONB DEFAULT '[]',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_module_registry_slug ON module_registry(module_slug);
      `
    })
    
    if (createError) {
      // Try direct insert approach - table might exist with different permissions
      const { error: insertError } = await supabase
        .from('module_registry')
        .insert({
          module_slug: '_test_',
          module_name: 'Test Module',
          definition: {}
        })
      
      if (insertError && insertError.code === '42P01') {
        // Table really doesn't exist
        return NextResponse.json({
          success: false,
          error: 'Table does not exist and could not be created',
          details: createError?.message,
          action: 'Please create table via Supabase dashboard',
          sql: `
CREATE TABLE module_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_slug VARCHAR(100) UNIQUE NOT NULL,
  module_name VARCHAR(200) NOT NULL,
  definition JSONB NOT NULL DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'draft',
  version VARCHAR(20) DEFAULT '1.0.0',
  routes JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
          `.trim(),
          timestamp: new Date().toISOString()
        }, { status: 500 })
      }
      
      // Clean up test entry if it was created
      await supabase
        .from('module_registry')
        .delete()
        .eq('module_slug', '_test_')
    }
    
    return NextResponse.json({
      success: true,
      message: 'Module registry table ready',
      timestamp: new Date().toISOString()
    })
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  // POST: Seed all modules
  const MODULE_FAMILIES = {
    revenue: [
      { slug: 'javari-ai', name: 'Javari AI', description: 'Flagship AI assistant - chat, create, automate', icon: '🤖', revenueModel: 'subscription' },
      { slug: 'javari-key', name: 'Javari Key', description: 'AI-powered authentication hub', icon: '🔐', revenueModel: 'subscription' },
      { slug: 'javari-cards', name: 'Javari Cards', description: 'Digital & physical card creator', icon: '🎴', revenueModel: 'credits' },
      { slug: 'javari-spirits', name: 'Javari Spirits', description: 'Alcohol enthusiast platform', icon: '🥃', revenueModel: 'affiliate' },
      { slug: 'javari-vinyl', name: 'Javari Vinyl', description: 'Vinyl record collection tracker', icon: '📀', revenueModel: 'affiliate' },
      { slug: 'javari-tcg', name: 'Javari TCG', description: 'Trading card game collection hub', icon: '🃏', revenueModel: 'marketplace' },
      { slug: 'javari-comics', name: 'Javari Comics', description: 'Comic book collection manager', icon: '📚', revenueModel: 'marketplace' },
    ],
    creator: [
      { slug: 'javari-studio', name: 'Javari Studio', description: 'AI creative studio - images, video, audio', icon: '🎨', revenueModel: 'credits' },
      { slug: 'javari-music', name: 'Javari Music', description: 'AI music composition & production', icon: '🎵', revenueModel: 'credits' },
      { slug: 'javari-video', name: 'Javari Video', description: 'AI video editing & generation', icon: '🎬', revenueModel: 'credits' },
      { slug: 'javari-voice', name: 'Javari Voice', description: 'Voice cloning & text-to-speech', icon: '🎙️', revenueModel: 'credits' },
      { slug: 'javari-design', name: 'Javari Design', description: 'Graphic design automation', icon: '✏️', revenueModel: 'credits' },
    ],
    professional: [
      { slug: 'javari-docs', name: 'Javari Docs', description: 'Document creation & management', icon: '📄', revenueModel: 'subscription' },
      { slug: 'javari-legal', name: 'Javari Legal', description: 'Legal document automation', icon: '⚖️', revenueModel: 'subscription' },
      { slug: 'javari-finance', name: 'Javari Finance', description: 'Financial analysis & reporting', icon: '💰', revenueModel: 'subscription' },
      { slug: 'javari-marketing', name: 'Javari Marketing', description: 'Marketing content & campaigns', icon: '📢', revenueModel: 'subscription' },
      { slug: 'javari-sales', name: 'Javari Sales', description: 'Sales automation & CRM', icon: '🤝', revenueModel: 'subscription' },
    ],
    social_impact: [
      { slug: 'javari-heroes', name: 'Javari Heroes', description: 'First responder support platform', icon: '🚒', revenueModel: 'free' },
      { slug: 'javari-veterans', name: 'Javari Veterans', description: 'Veteran transition support', icon: '🎖️', revenueModel: 'free' },
      { slug: 'javari-faith', name: 'Javari Faith', description: 'Faith-based community tools', icon: '⛪', revenueModel: 'free' },
      { slug: 'javari-rescue', name: 'Javari Rescue', description: 'Animal rescue coordination', icon: '🐾', revenueModel: 'free' },
      { slug: 'javari-youth', name: 'Javari Youth', description: 'Youth development programs', icon: '👶', revenueModel: 'free' },
      { slug: 'javari-seniors', name: 'Javari Seniors', description: 'Senior citizen support', icon: '👴', revenueModel: 'free' },
      { slug: 'javari-access', name: 'Javari Access', description: 'Accessibility & disability support', icon: '♿', revenueModel: 'free' },
      { slug: 'javari-learn', name: 'Javari Learn', description: 'Educational tools & resources', icon: '📚', revenueModel: 'free' },
      { slug: 'javari-giving', name: 'Javari Giving', description: 'Nonprofit management tools', icon: '❤️', revenueModel: 'free' },
    ],
    lifestyle: [
      { slug: 'javari-fitness', name: 'Javari Fitness', description: 'Fitness tracking & coaching', icon: '💪', revenueModel: 'subscription' },
      { slug: 'javari-recipes', name: 'Javari Recipes', description: 'AI recipe generation', icon: '🍳', revenueModel: 'credits' },
      { slug: 'javari-travel', name: 'Javari Travel', description: 'Travel planning & booking', icon: '✈️', revenueModel: 'affiliate' },
      { slug: 'javari-home', name: 'Javari Home', description: 'Smart home integration', icon: '🏠', revenueModel: 'subscription' },
      { slug: 'javari-pets', name: 'Javari Pets', description: 'Pet care & management', icon: '🐕', revenueModel: 'subscription' },
    ],
    infrastructure: [
      { slug: 'javari-hub', name: 'Javari Hub', description: 'Central platform dashboard', icon: '🏢', revenueModel: 'subscription' },
      { slug: 'javari-api', name: 'Javari API', description: 'Developer API access', icon: '🔌', revenueModel: 'subscription' },
      { slug: 'javari-admin', name: 'Javari Admin', description: 'Platform administration', icon: '⚙️', revenueModel: 'subscription' },
      { slug: 'javari-analytics', name: 'Javari Analytics', description: 'Business intelligence', icon: '📊', revenueModel: 'subscription' },
      { slug: 'javari-market', name: 'Javari Market', description: 'Creator marketplace', icon: '🛒', revenueModel: 'marketplace' },
    ]
  }

  const results = {
    success: true,
    seeded: [] as string[],
    errors: [] as string[],
    timestamp: new Date().toISOString()
  }
  
  for (const [family, modules] of Object.entries(MODULE_FAMILIES)) {
    for (const mod of modules) {
      try {
        // Upsert module (insert or update)
        const { error } = await supabase
          .from('module_registry')
          .upsert({
            module_slug: mod.slug,
            module_name: mod.name,
            definition: {
              ...mod,
              family,
              category: family,
              tags: [family, mod.revenueModel],
              features: [],
              settings: {
                requiresAuth: true,
                requiresSubscription: mod.revenueModel === 'subscription',
                hasMarketplace: mod.revenueModel === 'marketplace',
                hasSearch: true,
                hasAnalytics: true,
                hasModeration: false,
                hasCredits: mod.revenueModel === 'credits'
              }
            },
            status: 'draft',
            version: '1.0.0',
            routes: [
              { path: `/${mod.slug}`, type: 'page', handler: 'default' },
              { path: `/api/${mod.slug}`, type: 'api', handler: 'api' }
            ]
          }, {
            onConflict: 'module_slug'
          })
        
        if (error) throw error
        results.seeded.push(mod.slug)
      } catch (error: any) {
        results.errors.push(`${mod.slug}: ${error.message}`)
      }
    }
  }
  
  return NextResponse.json(results)
}
