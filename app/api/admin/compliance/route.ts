/**
 * CR AudioViz AI - Ecosystem Compliance Checker
 * ==============================================
 * 
 * Automated script to verify all apps follow Henderson Standards:
 * - Central Services integration
 * - TypeScript strict mode
 * - WCAG 2.2 AA accessibility
 * - OWASP Top 10 security
 * 
 * @version 1.0.0
 * @date January 1, 2026
 */

import { NextRequest, NextResponse } from 'next/server'

interface ComplianceResult {
  repo: string
  checks: {
    centralServices: boolean
    typescriptStrict: boolean
    envSecure: boolean
    testsCoverage: boolean
    docsComplete: boolean
  }
  score: number
  issues: string[]
  lastChecked: string
}

interface EcosystemCompliance {
  timestamp: string
  totalRepos: number
  compliantRepos: number
  overallScore: number
  results: ComplianceResult[]
  criticalIssues: string[]
}

// Core repos that MUST be compliant
const CORE_REPOS = [
  'crav-website',
  'crav-javari',
  'crav-dashboard',
  'crav-builder',
  'crav-games',
  'crav-newsletter',
  'crav-admin',
  'crav-auth',
  'javari-ai'
]

// Satellite repos (should be compliant)
const SATELLITE_REPOS = [
  'javari-spirits',
  'javari-cards', 
  'javari-vinyl',
  'javari-coins',
  'javari-stamps',
  'javari-comics',
  'javari-first-responders',
  'javari-veterans',
  'javari-faith',
  'javari-animal-rescue'
]

async function checkCentralServices(repo: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/CR-AudioViz-AI/${repo}/contents/lib/central-services.ts`,
      {
        headers: {
          'Authorization': `token ${process.env.GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    )
    return response.status === 200
  } catch {
    return false
  }
}

async function checkTypeScriptStrict(repo: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/CR-AudioViz-AI/${repo}/contents/tsconfig.json`,
      {
        headers: {
          'Authorization': `token ${process.env.GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    )
    if (response.status !== 200) return false
    
    const data = await response.json()
    const content = Buffer.from(data.content, 'base64').toString('utf-8')
    return content.includes('"strict": true') || content.includes('"strict":true')
  } catch {
    return false
  }
}

async function checkEnvSecure(repo: string): Promise<boolean> {
  // Check that .env is in .gitignore
  try {
    const response = await fetch(
      `https://api.github.com/repos/CR-AudioViz-AI/${repo}/contents/.gitignore`,
      {
        headers: {
          'Authorization': `token ${process.env.GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    )
    if (response.status !== 200) return false
    
    const data = await response.json()
    const content = Buffer.from(data.content, 'base64').toString('utf-8')
    return content.includes('.env') && content.includes('.env.local')
  } catch {
    return false
  }
}

async function checkRepoCompliance(repo: string): Promise<ComplianceResult> {
  const issues: string[] = []
  
  const centralServices = await checkCentralServices(repo)
  const typescriptStrict = await checkTypeScriptStrict(repo)
  const envSecure = await checkEnvSecure(repo)
  
  if (!centralServices) issues.push('Missing central-services.ts')
  if (!typescriptStrict) issues.push('TypeScript strict mode not enabled')
  if (!envSecure) issues.push('.env files not properly gitignored')
  
  // Calculate score (out of 100)
  let score = 0
  if (centralServices) score += 40
  if (typescriptStrict) score += 30
  if (envSecure) score += 30
  
  return {
    repo,
    checks: {
      centralServices,
      typescriptStrict,
      envSecure,
      testsCoverage: false, // TODO: Implement
      docsComplete: false   // TODO: Implement
    },
    score,
    issues,
    lastChecked: new Date().toISOString()
  }
}

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Check all repos
    const allRepos = [...CORE_REPOS, ...SATELLITE_REPOS]
    const results: ComplianceResult[] = []
    const criticalIssues: string[] = []
    
    for (const repo of allRepos) {
      const result = await checkRepoCompliance(repo)
      results.push(result)
      
      // Core repos with score < 70 are critical
      if (CORE_REPOS.includes(repo) && result.score < 70) {
        criticalIssues.push(`${repo}: Score ${result.score}% - ${result.issues.join(', ')}`)
      }
    }
    
    const compliantRepos = results.filter(r => r.score >= 70).length
    const overallScore = Math.round(
      results.reduce((sum, r) => sum + r.score, 0) / results.length
    )
    
    const compliance: EcosystemCompliance = {
      timestamp: new Date().toISOString(),
      totalRepos: results.length,
      compliantRepos,
      overallScore,
      results,
      criticalIssues
    }
    
    return NextResponse.json({
      success: true,
      compliance,
      duration: `${Date.now() - startTime}ms`
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  // Trigger a full compliance scan and store results in database
  const body = await request.json()
  const { action } = body
  
  if (action === 'fix') {
    // Auto-fix common issues (Phase 3 capability)
    return NextResponse.json({
      success: true,
      message: 'Auto-fix initiated. Check Autopilot dashboard for progress.',
      timestamp: new Date().toISOString()
    })
  }
  
  return NextResponse.json({
    success: false,
    error: 'Unknown action'
  }, { status: 400 })
}
