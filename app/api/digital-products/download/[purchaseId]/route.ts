// app/api/digital-products/download/[purchaseId]/route.ts
// CR AudioViz AI - Secure Download API with Tracking
// Henderson Standard: Fortune 50 Quality

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  request: NextRequest,
  { params }: { params: { purchaseId: string } }
) {
  try {
    const purchaseId = params.purchaseId

    // Get auth token
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get purchase record
    const { data: purchase, error: purchaseError } = await supabase
      .from('digital_purchases')
      .select(`
        *,
        product:digital_products(
          id, title, file_path, file_type
        )
      `)
      .eq('id', purchaseId)
      .eq('user_id', user.id)
      .eq('payment_status', 'completed')
      .single()

    if (purchaseError || !purchase) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 })
    }

    // Check download limits
    if (purchase.download_count >= purchase.max_downloads) {
      return NextResponse.json({ 
        error: 'Download limit reached',
        downloads_used: purchase.download_count,
        max_downloads: purchase.max_downloads
      }, { status: 403 })
    }

    // Get client info for logging
    const headersList = headers()
    const forwardedFor = headersList.get('x-forwarded-for')
    const userAgent = headersList.get('user-agent')
    const ip = forwardedFor?.split(',')[0] || 'unknown'

    // Generate signed URL (1 hour expiry)
    const { data: urlData, error: urlError } = await supabase.storage
      .from('digital-products')
      .createSignedUrl(purchase.product.file_path, 3600)

    if (urlError) {
      console.error('URL generation error:', urlError)
      return NextResponse.json({ error: 'Failed to generate download link' }, { status: 500 })
    }

    // Increment download count
    await supabase
      .from('digital_purchases')
      .update({ 
        download_count: purchase.download_count + 1,
        download_url: urlData.signedUrl,
        download_url_expires_at: new Date(Date.now() + 3600000).toISOString()
      })
      .eq('id', purchaseId)

    // Log download
    await supabase.from('digital_download_logs').insert({
      purchase_id: purchaseId,
      user_id: user.id,
      product_id: purchase.product.id,
      ip_address: ip,
      user_agent: userAgent,
      success: true
    })

    return NextResponse.json({
      success: true,
      download_url: urlData.signedUrl,
      expires_in: 3600,
      downloads_remaining: purchase.max_downloads - purchase.download_count - 1,
      file_name: `${purchase.product.title}.${purchase.product.file_type}`
    })

  } catch (error) {
    console.error('Download API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}