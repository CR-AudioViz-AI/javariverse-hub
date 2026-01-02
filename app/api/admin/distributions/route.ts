// External Distribution API
// Timestamp: January 1, 2026 - 4:50 PM EST

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - List all distribution entries
export async function GET(request: NextRequest) {
  try {
    const { data: entries, error } = await supabase
      .from('ebook_distributions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      // If table doesn't exist, return empty array
      if (error.code === '42P01') {
        return NextResponse.json({ entries: [], message: 'Distribution table not yet created' })
      }
      throw error
    }

    return NextResponse.json({ entries })
  } catch (error) {
    console.error('Error fetching distributions:', error)
    return NextResponse.json({ entries: [] })
  }
}

// POST - Create new distribution entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      book_slug,
      book_title,
      platform,
      status = 'pending',
      external_id,
      external_url,
      price,
      royalty_rate,
      notes
    } = body

    if (!book_slug || !book_title || !platform || !price) {
      return NextResponse.json(
        { error: 'Missing required fields: book_slug, book_title, platform, price' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('ebook_distributions')
      .insert({
        book_slug,
        book_title,
        platform,
        status,
        external_id,
        external_url,
        price,
        royalty_rate: royalty_rate || 0.70,
        sales_count: 0,
        revenue: 0,
        notes,
        submitted_at: status === 'submitted' ? new Date().toISOString() : null,
        live_at: status === 'live' ? new Date().toISOString() : null
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ entry: data })
  } catch (error: any) {
    console.error('Error creating distribution:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT - Update distribution entry
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    }

    // Auto-set timestamps based on status changes
    if (updates.status === 'submitted' && !updates.submitted_at) {
      updates.submitted_at = new Date().toISOString()
    }
    if (updates.status === 'live' && !updates.live_at) {
      updates.live_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('ebook_distributions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ entry: data })
  } catch (error: any) {
    console.error('Error updating distribution:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Remove distribution entry
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    }

    const { error } = await supabase
      .from('ebook_distributions')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting distribution:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
