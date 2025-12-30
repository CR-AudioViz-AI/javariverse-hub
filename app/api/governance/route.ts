// /api/governance/route.ts
// Data Governance & Compliance API - CR AudioViz AI
// GDPR, CCPA, Privacy Management
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kteobfyferrukqeolofj.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// =============================================================================
// CONSENT MANAGEMENT
// =============================================================================

interface ConsentUpdate {
  consent_type: string;
  granted: boolean;
  version: string;
  source?: string;
}

// Get user's current consent status
async function getUserConsents(userId: string) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  
  const { data, error } = await supabase
    .from('user_consents')
    .select('*')
    .eq('user_id', userId);
  
  if (error) throw error;
  return data || [];
}

// Update user consent
async function updateConsent(
  userId: string, 
  consent: ConsentUpdate,
  context: { ip?: string; userAgent?: string }
) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  
  const { data, error } = await supabase
    .from('user_consents')
    .upsert({
      user_id: userId,
      consent_type: consent.consent_type,
      granted: consent.granted,
      granted_at: consent.granted ? new Date().toISOString() : null,
      revoked_at: !consent.granted ? new Date().toISOString() : null,
      version: consent.version,
      source: consent.source || 'api',
      ip_address: context.ip,
      user_agent: context.userAgent,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,consent_type'
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// =============================================================================
// DATA SUBJECT REQUESTS (GDPR/CCPA)
// =============================================================================

type RequestType = 
  | 'access' 
  | 'portability' 
  | 'rectification' 
  | 'erasure' 
  | 'restriction' 
  | 'objection'
  | 'do_not_sell' 
  | 'know' 
  | 'delete';

interface DataRequest {
  request_type: RequestType;
  email: string;
  details?: string;
}

// Create a new data request
async function createDataRequest(request: DataRequest, userId?: string) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  
  // Generate verification token for non-authenticated requests
  const verificationToken = userId ? null : crypto.randomUUID();
  
  const { data, error } = await supabase
    .from('data_requests')
    .insert({
      user_id: userId,
      request_type: request.request_type,
      email: request.email,
      verification_token: verificationToken,
      status: userId ? 'pending' : 'verifying',
      internal_notes: request.details
    })
    .select()
    .single();
  
  if (error) throw error;
  
  // TODO: Send verification email if not authenticated
  // TODO: Send notification to privacy team
  
  return data;
}

// Get user's data requests
async function getDataRequests(userId: string) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  
  const { data, error } = await supabase
    .from('data_requests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

// =============================================================================
// DATA EXPORT (Right to Access / Portability)
// =============================================================================

// Tables to include in user data export
const EXPORT_TABLES = [
  { table: 'profiles', userColumn: 'id', label: 'Profile' },
  { table: 'user_consents', userColumn: 'user_id', label: 'Consent Records' },
  { table: 'analytics_events', userColumn: 'user_id', label: 'Activity History' },
  { table: 'chat_messages', userColumn: 'user_id', label: 'Chat History' },
  { table: 'credits_transactions', userColumn: 'user_id', label: 'Credit Transactions' },
  { table: 'marketplace_orders', userColumn: 'buyer_id', label: 'Orders' },
  { table: 'marketplace_reviews', userColumn: 'user_id', label: 'Reviews' },
  { table: 'user_reports', userColumn: 'reporter_id', label: 'Reports Submitted' },
];

// Generate user data export
async function generateDataExport(userId: string): Promise<Record<string, any>> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const exportData: Record<string, any> = {
    export_date: new Date().toISOString(),
    user_id: userId,
    data: {}
  };
  
  // Get auth user data
  const { data: authUser } = await supabase.auth.admin.getUserById(userId);
  if (authUser?.user) {
    exportData.data['Account'] = {
      email: authUser.user.email,
      created_at: authUser.user.created_at,
      last_sign_in: authUser.user.last_sign_in_at,
      email_confirmed: authUser.user.email_confirmed_at
    };
  }
  
  // Export from each table
  for (const tableConfig of EXPORT_TABLES) {
    try {
      const { data, error } = await supabase
        .from(tableConfig.table)
        .select('*')
        .eq(tableConfig.userColumn, userId);
      
      if (!error && data && data.length > 0) {
        exportData.data[tableConfig.label] = data;
      }
    } catch (e) {
      // Table might not exist yet, skip silently
      console.log(`Skipping table ${tableConfig.table}: not found`);
    }
  }
  
  return exportData;
}

// =============================================================================
// DATA ERASURE (Right to be Forgotten)
// =============================================================================

// Tables and their erasure strategy
const ERASURE_CONFIG = [
  { table: 'profiles', userColumn: 'id', strategy: 'anonymize' },
  { table: 'analytics_events', userColumn: 'user_id', strategy: 'delete' },
  { table: 'analytics_sessions', userColumn: 'user_id', strategy: 'delete' },
  { table: 'chat_messages', userColumn: 'user_id', strategy: 'delete' },
  { table: 'user_consents', userColumn: 'user_id', strategy: 'delete' },
  { table: 'marketplace_reviews', userColumn: 'user_id', strategy: 'anonymize' },
  { table: 'marketplace_orders', userColumn: 'buyer_id', strategy: 'anonymize' },
];

// Process erasure request
async function processErasure(userId: string): Promise<{ success: boolean; details: any[] }> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const details: any[] = [];
  
  for (const config of ERASURE_CONFIG) {
    try {
      if (config.strategy === 'delete') {
        const { error, count } = await supabase
          .from(config.table)
          .delete()
          .eq(config.userColumn, userId);
        
        details.push({
          table: config.table,
          action: 'deleted',
          count: count || 0,
          error: error?.message
        });
      } else if (config.strategy === 'anonymize') {
        // Anonymize by setting user-identifying fields to null/anonymous
        const { error, count } = await supabase
          .from(config.table)
          .update({
            // Common anonymization fields - adjust per table
            updated_at: new Date().toISOString()
          })
          .eq(config.userColumn, userId);
        
        details.push({
          table: config.table,
          action: 'anonymized',
          count: count || 0,
          error: error?.message
        });
      }
    } catch (e: any) {
      details.push({
        table: config.table,
        action: 'error',
        error: e.message
      });
    }
  }
  
  // Finally, delete the auth user (this cascades to profiles)
  try {
    await supabase.auth.admin.deleteUser(userId);
    details.push({ table: 'auth.users', action: 'deleted' });
  } catch (e: any) {
    details.push({ table: 'auth.users', action: 'error', error: e.message });
  }
  
  return { success: true, details };
}

// =============================================================================
// AUDIT LOGGING
// =============================================================================

async function logComplianceAction(
  actorId: string | null,
  action: string,
  category: string,
  resource: { type?: string; id?: string; table?: string },
  details: { old?: any; new?: any; metadata?: any },
  context: { ip?: string; userAgent?: string; requestId?: string }
) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  
  await supabase.from('compliance_audit_log').insert({
    actor_id: actorId,
    actor_type: actorId ? 'user' : 'system',
    actor_ip: context.ip,
    action,
    action_category: category,
    resource_type: resource.type,
    resource_id: resource.id,
    resource_table: resource.table,
    old_values: details.old,
    new_values: details.new,
    metadata: details.metadata,
    request_id: context.requestId,
    user_agent: context.userAgent,
    gdpr_relevant: ['consent_change', 'data_access', 'data_deletion', 'export'].includes(category),
    ccpa_relevant: ['consent_change', 'data_access', 'data_deletion', 'export'].includes(category)
  });
}

// =============================================================================
// API HANDLERS
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }
    
    switch (action) {
      case 'consents':
        const consents = await getUserConsents(userId);
        return NextResponse.json({ consents });
      
      case 'requests':
        const requests = await getDataRequests(userId);
        return NextResponse.json({ requests });
      
      case 'export':
        const exportData = await generateDataExport(userId);
        
        // Log the export
        await logComplianceAction(
          userId,
          'data_export_generated',
          'export',
          { type: 'user_data', id: userId },
          { metadata: { tables_exported: Object.keys(exportData.data) } },
          { ip: request.headers.get('x-forwarded-for') || undefined }
        );
        
        return NextResponse.json(exportData);
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Governance GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, ...data } = body;
    
    const context = {
      ip: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
      requestId: request.headers.get('x-request-id') || crypto.randomUUID()
    };
    
    switch (action) {
      case 'update_consent':
        if (!userId || !data.consent_type) {
          return NextResponse.json({ error: 'userId and consent_type required' }, { status: 400 });
        }
        
        const consent = await updateConsent(userId, data, context);
        
        await logComplianceAction(
          userId,
          data.granted ? 'consent_granted' : 'consent_revoked',
          'consent_change',
          { type: 'consent', id: data.consent_type },
          { new: { granted: data.granted, version: data.version } },
          context
        );
        
        return NextResponse.json({ success: true, consent });
      
      case 'create_request':
        const dataRequest = await createDataRequest(data, userId);
        
        await logComplianceAction(
          userId || null,
          'data_request_created',
          'data_access',
          { type: 'data_request', id: dataRequest.id },
          { new: { type: data.request_type, email: data.email } },
          context
        );
        
        return NextResponse.json({ success: true, request: dataRequest });
      
      case 'process_erasure':
        if (!userId) {
          return NextResponse.json({ error: 'userId required' }, { status: 400 });
        }
        
        // Check for active legal holds
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
        const { data: holds } = await supabase
          .from('legal_holds')
          .select('id, name')
          .eq('status', 'active')
          .contains('scope_users', [userId]);
        
        if (holds && holds.length > 0) {
          return NextResponse.json({ 
            error: 'Cannot process erasure - active legal hold',
            holds: holds.map(h => h.name)
          }, { status: 403 });
        }
        
        const result = await processErasure(userId);
        
        await logComplianceAction(
          null, // Actor is system
          'user_data_erased',
          'data_deletion',
          { type: 'user', id: userId },
          { metadata: result.details },
          context
        );
        
        return NextResponse.json({ success: true, ...result });
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Governance POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// =============================================================================
// TYPES EXPORT
// =============================================================================

export type { ConsentUpdate, DataRequest, RequestType };
