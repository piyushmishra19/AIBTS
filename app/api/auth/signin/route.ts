import { NextResponse } from 'next/server'
import { z } from 'zod'
import type { UserRole } from '@/lib/types'
import {
  createSession,
  setSessionCookie,
  toPublicUser,
  verifyPassword,
} from '@/lib/server/auth'
import { getDbPool } from '@/lib/server/db'
import type { RowDataPacket } from 'mysql2'

const signinSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  role: z.enum(['passenger', 'driver', 'admin'] satisfies [UserRole, ...UserRole[]]),
})

type UserRow = RowDataPacket & {
  id: number
  name: string
  email: string
  phone: string
  role: UserRole
  password_hash: string
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = signinSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid sign in data' },
        { status: 400 }
      )
    }

    const { email, password, role } = parsed.data
    const pool = getDbPool()
    const [rows] = await pool.query<UserRow[]>(
      `SELECT id, name, email, phone, role, password_hash
       FROM users
       WHERE email = ? AND role = ?
       LIMIT 1`,
      [email, role]
    )

    const user = rows[0]
    if (!user || !verifyPassword(password, user.password_hash)) {
      return NextResponse.json({ error: 'Invalid email, password, or role' }, { status: 401 })
    }

    const { token, expiresAt } = await createSession(user.id)
    await setSessionCookie(token, expiresAt)

    return NextResponse.json({ user: toPublicUser(user) })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to sign in'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
