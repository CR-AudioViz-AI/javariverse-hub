// Javari Books API - eBook ↔ Audiobook Conversion
// Timestamp: January 1, 2026 - 2:15 PM EST

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Credit costs for conversions
const CREDIT_COSTS = {
  ebookToAudio: {
    base: 5,
    perMB: 2,
    max: 50
  },
  audioToEbook: {
    base: 3,
    perMinute: 0.5,
    max: 30
  }
}

// Calculate credit cost based on file size and conversion type
function calculateCreditCost(
  conversionType: 'ebook-to-audio' | 'audio-to-ebook',
  fileSizeBytes: number,
  durationMinutes?: number
): number {
  if (conversionType === 'ebook-to-audio') {
    const fileSizeMB = fileSizeBytes / (1024 * 1024)
    const cost = CREDIT_COSTS.ebookToAudio.base + (fileSizeMB * CREDIT_COSTS.ebookToAudio.perMB)
    return Math.min(Math.ceil(cost), CREDIT_COSTS.ebookToAudio.max)
  } else {
    const minutes = durationMinutes || (fileSizeBytes / (1024 * 1024)) * 10 // Estimate 10 min per MB for audio
    const cost = CREDIT_COSTS.audioToEbook.base + (minutes * CREDIT_COSTS.audioToEbook.perMinute)
    return Math.min(Math.ceil(cost), CREDIT_COSTS.audioToEbook.max)
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get auth header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const conversionType = formData.get('conversionType') as 'ebook-to-audio' | 'audio-to-ebook'
    const voiceId = formData.get('voiceId') as string
    const language = formData.get('language') as string
    const speed = parseFloat(formData.get('speed') as string) || 1.0

    if (!file || !conversionType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Calculate credit cost
    const creditCost = calculateCreditCost(conversionType, file.size)

    // Check user credits
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('credits')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (userData.credits < creditCost) {
      return NextResponse.json({ 
        error: 'Insufficient credits',
        required: creditCost,
        available: userData.credits
      }, { status: 402 })
    }

    // Create conversion job
    const jobId = crypto.randomUUID()
    const fileBuffer = await file.arrayBuffer()
    const fileBase64 = Buffer.from(fileBuffer).toString('base64')
    
    // Upload source file
    const sourceFileName = `${user.id}/${jobId}/source_${file.name}`
    const { error: uploadError } = await supabase.storage
      .from('javari-books')
      .upload(sourceFileName, Buffer.from(fileBuffer), {
        contentType: file.type
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }

    // Create job record
    const { data: job, error: jobError } = await supabase
      .from('conversion_jobs')
      .insert({
        id: jobId,
        user_id: user.id,
        conversion_type: conversionType,
        source_file_name: file.name,
        source_file_size: file.size,
        source_file_path: sourceFileName,
        status: 'queued',
        credit_cost: creditCost,
        settings: {
          voiceId: voiceId || 'alloy',
          language: language || 'en',
          speed: speed
        }
      })
      .select()
      .single()

    if (jobError) {
      console.error('Job creation error:', jobError)
      return NextResponse.json({ error: 'Failed to create job' }, { status: 500 })
    }

    // Deduct credits
    const { error: creditError } = await supabase
      .from('users')
      .update({ credits: userData.credits - creditCost })
      .eq('id', user.id)

    if (creditError) {
      // Rollback job if credit deduction fails
      await supabase.from('conversion_jobs').delete().eq('id', jobId)
      return NextResponse.json({ error: 'Failed to deduct credits' }, { status: 500 })
    }

    // In production, this would queue to a background worker
    // For now, simulate processing status
    
    return NextResponse.json({
      success: true,
      jobId: jobId,
      status: 'queued',
      creditCost: creditCost,
      creditsRemaining: userData.credits - creditCost,
      estimatedTime: conversionType === 'ebook-to-audio' ? '5-15 minutes' : '2-5 minutes',
      message: 'Conversion job created successfully'
    })

  } catch (error) {
    console.error('Conversion API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')
    
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    if (jobId) {
      // Get specific job
      const { data: job, error } = await supabase
        .from('conversion_jobs')
        .select('*')
        .eq('id', jobId)
        .eq('user_id', user.id)
        .single()

      if (error || !job) {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 })
      }

      // If completed, generate download URL
      let downloadUrl = null
      if (job.status === 'completed' && job.output_file_path) {
        const { data: urlData } = await supabase.storage
          .from('javari-books')
          .createSignedUrl(job.output_file_path, 3600) // 1 hour expiry
        downloadUrl = urlData?.signedUrl
      }

      return NextResponse.json({
        job: {
          ...job,
          downloadUrl
        }
      })
    } else {
      // Get all jobs for user
      const { data: jobs, error } = await supabase
        .from('conversion_jobs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) {
        return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
      }

      return NextResponse.json({ jobs })
    }
  } catch (error) {
    console.error('GET conversion jobs error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
