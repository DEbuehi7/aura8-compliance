import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

// Hardcoded test credentials (in production, query database)
const VALID_CREDENTIALS = {
  username: 'ccbill_auditor',
  passwordHash: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36QfcQi6',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password required' },
        { status: 400 }
      );
    }

    // Check username
    if (username !== VALID_CREDENTIALS.username) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // For testing, accept the password directly (simplified for demo)
    // In production, use: const passwordMatch = await bcrypt.compare(password, VALID_CREDENTIALS.passwordHash);
    if (password !== 'Aura8CCBill2024!') {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate a simple session token (in production, use JWT or sessions)
    const token = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return NextResponse.json(
      {
        token,
        user: {
          username: VALID_CREDENTIALS.username,
          role: 'Compliance Auditor',
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
