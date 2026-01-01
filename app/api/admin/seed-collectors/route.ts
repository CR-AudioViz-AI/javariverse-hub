/**
 * CR AudioViz AI - Collector Database Seeding API
 * ================================================
 * 
 * Seeds collector app databases with real data from free APIs:
 * - Pokemon TCG (pokemontcg.io)
 * - Magic: The Gathering (Scryfall)
 * - Vinyl Records (Discogs)
 * - Comics (Comic Vine - requires API key)
 * 
 * @version 2.0.0
 * @date January 1, 2026
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface SeedResult {
  source: string
  status: 'success' | 'error' | 'skipped'
  count: number
  message: string
}

async function seedPokemonTCG(): Promise<SeedResult> {
  try {
    // Fetch all sets
    const setsRes = await fetch('https://api.pokemontcg.io/v2/sets?orderBy=-releaseDate&pageSize=50')
    const setsData = await setsRes.json()
    
    if (!setsData.data) {
      return { source: 'Pokemon TCG', status: 'error', count: 0, message: 'No data returned' }
    }
    
    // Transform to our schema
    const sets = setsData.data.map((set: any) => ({
      external_id: set.id,
      name: set.name,
      series: set.series,
      release_date: set.releaseDate,
      total_cards: set.total,
      image_url: set.images?.logo,
      symbol_url: set.images?.symbol,
      source: 'pokemontcg',
      metadata: {
        ptcgoCode: set.ptcgoCode,
        legalities: set.legalities
      }
    }))
    
    // Upsert to database
    const { error } = await supabase
      .from('collector_sets')
      .upsert(sets, { onConflict: 'external_id' })
    
    if (error) throw error
    
    return { 
      source: 'Pokemon TCG', 
      status: 'success', 
      count: sets.length, 
      message: `Seeded ${sets.length} Pokemon TCG sets` 
    }
  } catch (error: any) {
    return { source: 'Pokemon TCG', status: 'error', count: 0, message: error.message }
  }
}

async function seedMTG(): Promise<SeedResult> {
  try {
    // Fetch all sets from Scryfall
    const setsRes = await fetch('https://api.scryfall.com/sets')
    const setsData = await setsRes.json()
    
    if (!setsData.data) {
      return { source: 'MTG (Scryfall)', status: 'error', count: 0, message: 'No data returned' }
    }
    
    // Transform to our schema (limit to 100 most recent)
    const sets = setsData.data.slice(0, 100).map((set: any) => ({
      external_id: `mtg_${set.code}`,
      name: set.name,
      series: set.set_type,
      release_date: set.released_at,
      total_cards: set.card_count,
      image_url: set.icon_svg_uri,
      source: 'scryfall',
      metadata: {
        code: set.code,
        setType: set.set_type,
        digital: set.digital,
        scryfallUri: set.scryfall_uri
      }
    }))
    
    // Upsert to database
    const { error } = await supabase
      .from('collector_sets')
      .upsert(sets, { onConflict: 'external_id' })
    
    if (error) throw error
    
    return { 
      source: 'MTG (Scryfall)', 
      status: 'success', 
      count: sets.length, 
      message: `Seeded ${sets.length} MTG sets` 
    }
  } catch (error: any) {
    return { source: 'MTG (Scryfall)', status: 'error', count: 0, message: error.message }
  }
}

async function seedVinyl(): Promise<SeedResult> {
  try {
    // Fetch popular genres/styles from Discogs
    const genres = ['rock', 'jazz', 'electronic', 'hip-hop', 'classical']
    let totalCount = 0
    
    for (const genre of genres) {
      const res = await fetch(
        `https://api.discogs.com/database/search?style=${genre}&type=release&per_page=20`,
        { headers: { 'User-Agent': 'CRAudioVizAI/1.0' } }
      )
      const data = await res.json()
      
      if (data.results) {
        const records = data.results.map((item: any) => ({
          external_id: `discogs_${item.id}`,
          title: item.title,
          artist: item.title.split(' - ')[0],
          year: item.year,
          genre: genre,
          format: 'vinyl',
          image_url: item.cover_image,
          source: 'discogs',
          metadata: {
            country: item.country,
            label: item.label,
            catno: item.catno
          }
        }))
        
        const { error } = await supabase
          .from('collector_items')
          .upsert(records, { onConflict: 'external_id' })
        
        if (!error) totalCount += records.length
      }
      
      // Rate limit: wait 1 second between requests
      await new Promise(r => setTimeout(r, 1000))
    }
    
    return { 
      source: 'Vinyl (Discogs)', 
      status: 'success', 
      count: totalCount, 
      message: `Seeded ${totalCount} vinyl records` 
    }
  } catch (error: any) {
    return { source: 'Vinyl (Discogs)', status: 'error', count: 0, message: error.message }
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const results: SeedResult[] = []
  
  try {
    const body = await request.json().catch(() => ({}))
    const sources = body.sources || ['pokemon', 'mtg', 'vinyl']
    
    // Run seeding for requested sources
    if (sources.includes('pokemon')) {
      results.push(await seedPokemonTCG())
    }
    
    if (sources.includes('mtg')) {
      results.push(await seedMTG())
    }
    
    if (sources.includes('vinyl')) {
      results.push(await seedVinyl())
    }
    
    const totalSeeded = results.reduce((sum, r) => sum + r.count, 0)
    const successCount = results.filter(r => r.status === 'success').length
    
    return NextResponse.json({
      success: true,
      summary: {
        totalSeeded,
        sourcesProcessed: results.length,
        successful: successCount,
        executionTime: Date.now() - startTime
      },
      results
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      results
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/admin/seed-collectors',
    method: 'POST',
    description: 'Seeds collector databases from external APIs',
    sources: ['pokemon', 'mtg', 'vinyl'],
    usage: {
      seedAll: 'POST with empty body or {"sources": ["pokemon", "mtg", "vinyl"]}',
      seedSpecific: 'POST with {"sources": ["pokemon"]} for specific sources'
    }
  })
}
