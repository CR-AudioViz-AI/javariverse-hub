// /api/search/route.ts
// Universal Cross-Module Search API - CR AudioViz AI
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kteobfyferrukqeolofj.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Module configurations for search
const SEARCH_MODULES = [
  {
    id: 'travel',
    name: 'Travel & Hospitality',
    table: 'travel_deals',
    searchFields: ['title', 'description', 'destination', 'category'],
    displayFields: ['id', 'title', 'description', 'destination', 'price', 'image_url'],
    url: 'https://orlandotripdeal.com',
    icon: '✈️'
  },
  {
    id: 'cards',
    name: 'Card Collections',
    table: 'cards',
    searchFields: ['name', 'description', 'category', 'series'],
    displayFields: ['id', 'name', 'description', 'category', 'rarity', 'image_url'],
    url: 'https://cravcards.com',
    icon: '🃏'
  },
  {
    id: 'properties',
    name: 'Real Estate',
    table: 'properties',
    searchFields: ['title', 'description', 'address', 'city', 'state'],
    displayFields: ['id', 'title', 'description', 'price', 'bedrooms', 'bathrooms', 'image_url'],
    url: 'https://cravproperty.com',
    icon: '🏠'
  },
  {
    id: 'invoices',
    name: 'Invoices',
    table: 'invoices',
    searchFields: ['invoice_number', 'client_name', 'description'],
    displayFields: ['id', 'invoice_number', 'client_name', 'total', 'status'],
    url: 'https://crav-invoice-generator.vercel.app',
    icon: '📄'
  },
  {
    id: 'ebooks',
    name: 'Ebooks',
    table: 'books',
    searchFields: ['title', 'description', 'genre', 'author'],
    displayFields: ['id', 'title', 'description', 'genre', 'status'],
    url: 'https://crav-ebook-studio.vercel.app',
    icon: '📚'
  },
  {
    id: 'logos',
    name: 'Logo Designs',
    table: 'logo_projects',
    searchFields: ['name', 'description', 'style', 'industry'],
    displayFields: ['id', 'name', 'description', 'style', 'image_url'],
    url: 'https://crav-logo-studio.vercel.app',
    icon: '🎨'
  },
  {
    id: 'graphics',
    name: 'Social Graphics',
    table: 'social_graphics',
    searchFields: ['title', 'description', 'platform', 'category'],
    displayFields: ['id', 'title', 'description', 'platform', 'image_url'],
    url: 'https://crav-social-graphics.vercel.app',
    icon: '🖼️'
  },
  {
    id: 'pdfs',
    name: 'PDF Documents',
    table: 'pdf_documents',
    searchFields: ['title', 'description', 'category'],
    displayFields: ['id', 'title', 'description', 'page_count', 'file_url'],
    url: 'https://crav-pdf-builder.vercel.app',
    icon: '📋'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const modules = searchParams.get('modules')?.split(',') || SEARCH_MODULES.map(m => m.id);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
    const userId = searchParams.get('userId'); // Optional: filter by user

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        error: 'Query must be at least 2 characters',
        results: [],
        total: 0
      }, { status: 400 });
    }

    if (!SUPABASE_SERVICE_KEY) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const searchTerm = query.trim().toLowerCase();
    
    const results: SearchResult[] = [];
    const moduleResults: Record<string, number> = {};

    // Search each enabled module
    for (const module of SEARCH_MODULES) {
      if (!modules.includes(module.id)) continue;

      try {
        // Build search query with ilike for each search field
        let dbQuery = supabase
          .from(module.table)
          .select(module.displayFields.join(','))
          .limit(limit);

        // Add user filter if provided
        if (userId && module.table !== 'travel_deals') {
          dbQuery = dbQuery.eq('user_id', userId);
        }

        // Build OR condition for search fields
        const orConditions = module.searchFields
          .map(field => `${field}.ilike.%${searchTerm}%`)
          .join(',');
        
        dbQuery = dbQuery.or(orConditions);

        const { data, error } = await dbQuery;

        if (error) {
          console.error(`Search error in ${module.id}:`, error.message);
          continue;
        }

        if (data && data.length > 0) {
          moduleResults[module.id] = data.length;
          
          results.push(...data.map(item => ({
            id: item.id,
            module: module.id,
            moduleName: module.name,
            moduleIcon: module.icon,
            moduleUrl: module.url,
            title: item.title || item.name || item.invoice_number || 'Untitled',
            description: item.description || '',
            thumbnail: item.image_url || item.thumbnail || null,
            metadata: item,
            relevance: calculateRelevance(item, searchTerm, module.searchFields)
          })));
        }
      } catch (err) {
        console.error(`Failed to search ${module.id}:`, err);
      }
    }

    // Sort by relevance
    results.sort((a, b) => b.relevance - a.relevance);

    // Limit total results
    const limitedResults = results.slice(0, limit * modules.length);

    return NextResponse.json({
      query: query,
      results: limitedResults,
      total: results.length,
      byModule: moduleResults,
      modules: SEARCH_MODULES.filter(m => modules.includes(m.id)).map(m => ({
        id: m.id,
        name: m.name,
        icon: m.icon,
        count: moduleResults[m.id] || 0
      }))
    });

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Calculate relevance score
function calculateRelevance(
  item: Record<string, any>, 
  searchTerm: string, 
  searchFields: string[]
): number {
  let score = 0;
  const term = searchTerm.toLowerCase();

  for (const field of searchFields) {
    const value = String(item[field] || '').toLowerCase();
    
    // Exact match in title/name = highest score
    if (field === 'title' || field === 'name') {
      if (value === term) score += 100;
      else if (value.startsWith(term)) score += 50;
      else if (value.includes(term)) score += 25;
    } else {
      // Other fields get lower scores
      if (value.includes(term)) score += 10;
    }
  }

  return score;
}

interface SearchResult {
  id: string;
  module: string;
  moduleName: string;
  moduleIcon: string;
  moduleUrl: string;
  title: string;
  description: string;
  thumbnail: string | null;
  metadata: Record<string, any>;
  relevance: number;
}

// Get available modules
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({
    modules: SEARCH_MODULES.map(m => ({
      id: m.id,
      name: m.name,
      icon: m.icon,
      url: m.url
    }))
  });
}
