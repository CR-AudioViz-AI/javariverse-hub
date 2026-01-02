// Javari Spirits API | Generated: 2026-01-02T02:09:42.067Z
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    module: 'javari-spirits',
    name: 'Javari Spirits',
    status: 'operational',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  return NextResponse.json({ success: true, module: 'javari-spirits', data: body })
}
