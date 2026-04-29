import { NextResponse } from 'next/server'
import { z } from 'zod'
import type { ResultSetHeader, RowDataPacket } from 'mysql2'
import type { UserRole } from '@/lib/types'
import { createSession, hashPassword, setSessionCookie, toPublicUser } from '@/lib/server/auth'
import { getDbPool } from '@/lib/server/db'

const signupSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().email('Enter a valid email address'),
  phone: z.string().trim().min(10, 'Enter a valid phone number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['passenger', 'driver', 'admin'] satisfies [UserRole, ...UserRole[]]),
})

type ExistingUserRow = RowDataPacket & {
  id: number
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = signupSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid sign up data' },
        { status: 400 }
      )
    }

    const { name, email, phone, password, role } = parsed.data
    const pool = getDbPool()

    const [existingUsers] = await pool.query<ExistingUserRow[]>(
      'SELECT id FROM users WHERE email = ? AND role = ? LIMIT 1',
      [email, role]
    )

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'An account already exists for this email and role' },
        { status: 409 }
      )
    }

    const passwordHash = hashPassword(password)
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO users (name, email, phone, password_hash, role)
       VALUES (?, ?, ?, ?, ?)`,
      [name, email, phone, passwordHash, role]
    )

    const { token, expiresAt } = await createSession(result.insertId)
    await setSessionCookie(token, expiresAt)

    return NextResponse.json({
      user: toPublicUser({
        id: result.insertId,
        name,
        email,
        phone,
        role,
      }),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create account'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
