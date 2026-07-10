import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

// Metrics tracking
const metrics = {
  loginAttempts: 0,
  loginSuccesses: 0,
  loginFailures: 0,
  avgQueryTime: 0,
  queryTimes: [] as number[],
};

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  metrics.loginAttempts++;

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase env vars:', { supabaseUrl: !!supabaseUrl, supabaseKey: !!supabaseKey });
      metrics.loginFailures++;
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      metrics.loginFailures++;
      return NextResponse.json(
        { error: 'Username and password required' },
        { status: 400 }
      );
    }

    // Track database query time
    const dbStartTime = Date.now();
    
    // Query compliance_accounts table
    const { data: complianceAccount, error } = await supabase
      .from('compliance_accounts')
      .select('id, username, password_hash, active, role, organization, expires_at')
      .eq('username', username)
      .single();

    const dbQueryTime = Date.now() - dbStartTime;
    metrics.queryTimes.push(dbQueryTime);
    metrics.avgQueryTime = metrics.queryTimes.reduce((a, b) => a + b, 0) / metrics.queryTimes.length;

    if (error || !complianceAccount) {
      metrics.loginFailures++;
      console.warn(`[LOGIN_FAIL] Username not found: ${username}, DB query time: ${dbQueryTime}ms`);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if account is active
    if (!complianceAccount.active) {
      metrics.loginFailures++;
      console.warn(`[LOGIN_FAIL] Account inactive: ${username}`);
      return NextResponse.json(
        { error: 'Account is inactive' },
        { status: 401 }
      );
    }

    // Check if account has expired
    if (complianceAccount.expires_at && new Date(complianceAccount.expires_at) < new Date()) {
      metrics.loginFailures++;
      console.warn(`[LOGIN_FAIL] Account expired: ${username}`);
      return NextResponse.json(
        { error: 'Account has expired' },
        { status: 401 }
      );
    }

    // Verify password with bcrypt
    const passwordMatch = await bcrypt.compare(password, complianceAccount.password_hash);

    if (!passwordMatch) {
      metrics.loginFailures++;
      console.warn(`[LOGIN_FAIL] Invalid password for: ${username}`);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate session token (in production, use JWT)
    const token = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Log to compliance_audit_log
    await supabase
      .from('compliance_audit_log')
      .insert({
        account_id: complianceAccount.id,
        action: 'login_success',
        details: { username, timestamp: new Date().toISOString(), responseTime: Date.now() - startTime },
      });

    metrics.loginSuccesses++;
    const totalTime = Date.now() - startTime;
    
    console.log(`[LOGIN_SUCCESS] User: ${username}, Total time: ${totalTime}ms, DB query: ${dbQueryTime}ms`);
    console.log(`[METRICS] Attempts: ${metrics.loginAttempts}, Success: ${metrics.loginSuccesses}, Failures: ${metrics.loginFailures}, Avg query time: ${metrics.avgQueryTime.toFixed(2)}ms`);

    return NextResponse.json(
      {
        token,
        user: {
          username: complianceAccount.username,
          role: complianceAccount.role,
          organization: complianceAccount.organization,
        },
      },
      { 
        status: 200,
        headers: {
          'X-Response-Time': `${totalTime}ms`,
          'X-DB-Query-Time': `${dbQueryTime}ms`,
        }
      }
    );
  } catch (error) {
    metrics.loginFailures++;
    console.error('[LOGIN_ERROR]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Metrics endpoint
export async function GET() {
  return NextResponse.json({
    metrics: {
      totalAttempts: metrics.loginAttempts,
      successfulLogins: metrics.loginSuccesses,
      failedLogins: metrics.loginFailures,
      successRate: ((metrics.loginSuccesses / metrics.loginAttempts) * 100).toFixed(2) + '%',
      avgDatabaseQueryTime: metrics.avgQueryTime.toFixed(2) + 'ms',
      recentQueryTimes: metrics.queryTimes.slice(-10),
    },
    timestamp: new Date().toISOString(),
  });
}
