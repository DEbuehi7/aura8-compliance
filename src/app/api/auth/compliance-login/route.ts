import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

// Hardcoded credentials — replace with DB lookup in production
const USERS: Record<string, { passwordHash: string; role: string; name: string }> = {
  ccbill_auditor: {
    passwordHash: '$2a$10$6rN7/eZAFuoiITQ1CWoIsuCkgscOwhPVKpKLXyTozovYjGS2PbA1u',
    role: 'auditor',
    name: 'CCBill Auditor',
  },
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { username, password } = body as { username: string; password: string }

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 },
      )
    }

    const user = USERS[username.trim().toLowerCase()]

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, user.passwordHash)

    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const token = crypto.randomBytes(32).toString('hex')

    return NextResponse.json({
      token,
      user: {
        username: username.trim().toLowerCase(),
        name: user.name,
        role: user.role,
      },
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
