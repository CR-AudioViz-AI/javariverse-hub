/**
 * CR AudioViz AI - Distributed Cron Lock System
 * ==============================================
 * 
 * Prevents cron job stampedes and overlaps using database locks
 * 
 * @version 1.0.0
 * @date January 2, 2026 - 2:24 AM EST
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface LockResult {
  acquired: boolean
  lock_id?: string
  reason?: string
}

/**
 * Acquire a distributed lock for a cron job
 * Prevents multiple instances from running simultaneously
 */
export async function acquireCronLock(
  jobName: string,
  maxDurationMs: number = 300000 // 5 minutes default
): Promise<LockResult> {
  const now = new Date()
  const expiresAt = new Date(now.getTime() + maxDurationMs)
  
  try {
    // Check for existing valid lock
    const { data: existingLock } = await supabase
      .from('cron_locks')
      .select('*')
      .eq('job_name', jobName)
      .gt('expires_at', now.toISOString())
      .single()
    
    if (existingLock) {
      return {
        acquired: false,
        reason: `Lock held until ${existingLock.expires_at}`
      }
    }
    
    // Delete expired locks
    await supabase
      .from('cron_locks')
      .delete()
      .eq('job_name', jobName)
      .lt('expires_at', now.toISOString())
    
    // Try to acquire lock
    const lockId = `${jobName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    const { data, error } = await supabase
      .from('cron_locks')
      .insert({
        id: lockId,
        job_name: jobName,
        acquired_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        instance_id: process.env.VERCEL_DEPLOYMENT_ID || 'local'
      })
      .select()
      .single()
    
    if (error) {
      // Race condition - another instance got the lock
      if (error.code === '23505') { // Unique violation
        return {
          acquired: false,
          reason: 'Lock acquired by another instance'
        }
      }
      throw error
    }
    
    return {
      acquired: true,
      lock_id: lockId
    }
    
  } catch (error: any) {
    console.error(`Failed to acquire lock for ${jobName}:`, error)
    return {
      acquired: false,
      reason: error.message
    }
  }
}

/**
 * Release a cron lock
 */
export async function releaseCronLock(lockId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('cron_locks')
      .delete()
      .eq('id', lockId)
    
    return !error
  } catch (error) {
    console.error(`Failed to release lock ${lockId}:`, error)
    return false
  }
}

/**
 * Wrapper to run a cron job with automatic locking
 */
export async function withCronLock<T>(
  jobName: string,
  fn: () => Promise<T>,
  maxDurationMs?: number
): Promise<{ success: boolean; result?: T; skipped?: boolean; reason?: string }> {
  const lock = await acquireCronLock(jobName, maxDurationMs)
  
  if (!lock.acquired) {
    console.log(`Skipping ${jobName}: ${lock.reason}`)
    return {
      success: true,
      skipped: true,
      reason: lock.reason
    }
  }
  
  try {
    const result = await fn()
    return {
      success: true,
      result
    }
  } catch (error: any) {
    console.error(`Error in ${jobName}:`, error)
    return {
      success: false,
      reason: error.message
    }
  } finally {
    if (lock.lock_id) {
      await releaseCronLock(lock.lock_id)
    }
  }
}
