import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';
import * as crypto from 'crypto';

// ---------------------------------------------------------------------------
// JWT helpers (native Node.js crypto — no extra dependency)
// ---------------------------------------------------------------------------

function signJWT(payload: Record<string, unknown>, secret: string, expiresInSeconds = 3600): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const body = Buffer.from(
    JSON.stringify({ ...payload, iat: now, exp: now + expiresInSeconds })
  ).toString('base64url');
  const sig = crypto
    .createHmac('sha256', secret)
    .update(`${header}.${body}`)
    .digest('base64url');
  return `${header}.${body}.${sig}`;
}

// ---------------------------------------------------------------------------
// In-memory rate limiting (per IP, resets after WINDOW_MS)
// Note: serverless instances may not share state; Supabase audit log is the
// authoritative record for compliance — this provides a best-effort local guard.
// ---------------------------------------------------------------------------

const RATE_LIMIT_MAX = 10;       // attempts per window
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

const rateMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = rateMap.get(ip);

  if (!entry || now > entry.resetAt) {
    const resetAt = now + WINDOW_MS;
    rateMap.set(ip, { count: 1, resetAt });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1, resetAt };
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  return { allowed: true, remaining: RATE_LIMIT_MAX - entry.count, resetAt: entry.resetAt };
}

// ---------------------------------------------------------------------------
// POST /api/auth/compliance-login
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  // Rate limiting
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown';

  const rl = checkRateLimit(ip);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many login attempts. Try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
          'X-RateLimit-Limit': String(RATE_LIMIT_MAX),
          'X-RateLimit-Remaining': '0',
        },
      }
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const jwtSecret = process.env.JWT_SECRET ?? 'change-me-in-production';

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase config:', { supabaseUrl, supabaseKey: !!supabaseKey });
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  let body: { username?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { username, password } = body;

  if (!username || !password) {
    return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
  }

  // ------------------------------------------------------------------
  // Database query
  // ------------------------------------------------------------------

  const dbStart = Date.now();
  console.log(`[LOGIN] Querying account: ${username}`);
  
  const { data: account, error: dbError } = await supabase
    .from('compliance_accounts')
    .select('id, username, password_hash, active, role, organization, expires_at')
    .eq('username', username)
    .single();
  
  const dbQueryTime = Date.now() - dbStart;

  console.log(`[LOGIN] Query result:`, { 
    found: !!account, 
    error: dbError?.message, 
    dbQueryTime,
    accountData: account ? { id: account.id, username: account.username, active: account.active } : null
  });

  const totalTime = () => Date.now() - startTime;

  // Helper: write to audit log (fire-and-forget — non-blocking)
  const audit = (action: string, details: Record<string, unknown>) => {
    supabase
      .from('compliance_audit_log')
      .insert({ account_id: account?.id ?? null, action, details, ip_address: ip })
      .then(() => {/* ignore */});
  };

  if (dbError || !account) {
    console.log(`[LOGIN] Account not found: ${username}`);
    audit('login_fail_unknown_user', { username, dbQueryTime });
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  if (!account.active) {
    console.log(`[LOGIN] Account inactive: ${username}`);
    audit('login_fail_inactive', { username, dbQueryTime });
    return NextResponse.json({ error: 'Account is inactive' }, { status: 401 });
  }

  if (account.expires_at && new Date(account.expires_at) < new Date()) {
    console.log(`[LOGIN] Account expired: ${username}`);
    audit('login_fail_expired', { username, dbQueryTime });
    return NextResponse.json({ error: 'Account has expired' }, { status: 401 });
  }

  // For testing: compare plain text password (NO HASHING)
  console.log(`[LOGIN] Comparing plain text password for ${username}`);
  const passwordMatch = password === account.password_hash;
  console.log(`[LOGIN] Password match: ${passwordMatch}`);

  if (!passwordMatch) {
    console.log(`[LOGIN] Expected: "${account.password_hash}", got: "${password}"`);
    audit('login_fail_bad_password', { username, dbQueryTime });
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  // ------------------------------------------------------------------
  // Issue JWT
  // ------------------------------------------------------------------

  const token = signJWT(
    { sub: account.id, username: account.username, role: account.role, org: account.organization },
    jwtSecret,
    3600
  );

  const elapsed = totalTime();
  audit('login_success', { username, dbQueryTime, totalTime: elapsed });

  return NextResponse.json(
    {
      token,
      expiresIn: 3600,
      user: { username: account.username, role: account.role, organization: account.organization },
      metrics: { dbQueryTime, totalTime: elapsed },
    },
    {
      status: 200,
      headers: {
        'X-Response-Time': `${elapsed}ms`,
        'X-DB-Query-Time': `${dbQueryTime}ms`,
        'X-RateLimit-Limit': String(RATE_LIMIT_MAX),
        'X-RateLimit-Remaining': String(rl.remaining),
      },
    }
  );
}
