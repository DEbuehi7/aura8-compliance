import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * GET /api/metrics
 *
 * Returns real-time performance and compliance metrics derived from the
 * compliance_audit_log table in Supabase.  Data covers the last 24 hours.
 *
 * CCBill integration: poll this endpoint to verify SLA targets are met.
 */
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data: logs, error } = await supabase
    .from('compliance_audit_log')
    .select('action, details, created_at')
    .gte('created_at', since)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
  }

  const entries = logs ?? [];

  const successes = entries.filter((e) => e.action === 'login_success');
  const failures = entries.filter((e) => e.action.startsWith('login_fail'));
  const total = successes.length + failures.length;

  const successRate = total > 0 ? ((successes.length / total) * 100).toFixed(2) : '0.00';

  const dbTimes: number[] = successes
    .map((e) => (e.details as Record<string, unknown>)?.dbQueryTime)
    .filter((v): v is number => typeof v === 'number');

  const responseTimes: number[] = successes
    .map((e) => (e.details as Record<string, unknown>)?.totalTime)
    .filter((v): v is number => typeof v === 'number');

  const avg = (arr: number[]) =>
    arr.length > 0 ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2) : 'N/A';

  const max = (arr: number[]) => (arr.length > 0 ? Math.max(...arr) : null);

  return NextResponse.json({
    period: '24h',
    logins: {
      total,
      successful: successes.length,
      failed: failures.length,
      successRate: `${successRate}%`,
    },
    performance: {
      avgDbQueryTimeMs: avg(dbTimes),
      maxDbQueryTimeMs: max(dbTimes),
      avgResponseTimeMs: avg(responseTimes),
      maxResponseTimeMs: max(responseTimes),
    },
    slaTargets: {
      successRateTarget: '≥95%',
      avgDbQueryTimeTarget: '<200ms',
      avgResponseTimeTarget: '<500ms',
    },
    recentActivity: entries.slice(0, 20).map((e) => ({
      action: e.action,
      timestamp: e.created_at,
    })),
    timestamp: new Date().toISOString(),
  });
}
