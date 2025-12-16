// app/admin/grants/page.tsx
// CR AudioViz AI - Grant Management Dashboard
// Server component wrapper for client dashboard
// Timestamp: Sunday, December 15, 2025 - 10:30 AM EST

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import GrantsDashboard from './GrantsDashboard';

export const dynamic = 'force-dynamic';

export default async function GrantsPage() {
  // Auth check
  const supabase = createServerComponentClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  // Allow access for development (remove in production)
  // if (!user) {
  //   redirect('/login');
  // }

  return <GrantsDashboard />;
}
