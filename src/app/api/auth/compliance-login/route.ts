import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase env vars:', { supabaseUrl: !!supabaseUrl, supabaseKey: !!supabaseKey });
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password required' },
        { status: 400 }
      );
    }

    // Query compliance_accounts table
    const { data: complianceAccount, error } = await supabase
      .from('compliance_accounts')
      .select('id, username, password_hash, active, role, organization, expires_at')
      .eq('username', username)
      .single();

    if (error || !complianceAccount) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if account is active
    if (!complianceAccount.active) {
      return NextResponse.json(
        { error: 'Account is inactive' },
        { status: 401 }
      );
    }

    // Check if account has expired
    if (complianceAccount.expires_at && new Date(complianceAccount.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Account has expired' },
        { status: 401 }
      );
    }

    // Verify password with bcrypt
    const passwordMatch = await bcrypt.compare(password, complianceAccount.password_hash);

    if (!passwordMatch) {
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
        details: { username, timestamp: new Date().toISOString() },
      });

    return NextResponse.json(
      {
        token,
        user: {
          username: complianceAccount.username,
          role: complianceAccount.role,
          organization: complianceAccount.organization,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
