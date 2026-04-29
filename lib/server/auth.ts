import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'
import type { RowDataPacket } from 'mysql2'
import type { User, UserRole } from '@/lib/types'
import { getDbPool } from './db'

const SESSION_COOKIE = 'aibts_session'
const SESSION_MAX_AGE = 60 * 60 * 24 * 7

type UserRow = RowDataPacket & {
  id: number
  name: string
  email: string
  phone: string
  role: UserRole
  password_hash: string
}

type SessionRow = RowDataPacket & {
  token: string
  expires_at: Date
  user_id: number
  name: string
  email: string
  phone: string
  role: UserRole
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, storedHash: string) {
  const [salt, key] = storedHash.split(':')
  if (!salt || !key) return false
  const derivedKey = scryptSync(password, salt, 64)
  const storedKey = Buffer.from(key, 'hex')
  if (derivedKey.length !== storedKey.length) return false
  return timingSafeEqual(derivedKey, storedKey)
}

export function createSessionToken() {
  return randomBytes(32).toString('hex')
}

export function toPublicUser(user: Pick<UserRow, 'name' | 'email' | 'phone' | 'role'> & { id: number }): User {
  return {
    id: String(user.id),
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
  }
}

export async function createSession(userId: number) {
  const pool = getDbPool()
  const token = createSessionToken()
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000)

  await pool.execute(
    'INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)',
    [token, userId, expiresAt]
  )

  return { token, expiresAt }
}

export async function setSessionCookie(token: string, expiresAt: Date) {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    path: '/',
  })
}

export async function clearSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(0),
    path: '/',
  })
}

export async function getCurrentSessionUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null

  const pool = getDbPool()
  const [rows] = await pool.query<SessionRow[]>(
    `SELECT s.token, s.expires_at, u.id as user_id, u.name, u.email, u.phone, u.role
     FROM sessions s
     INNER JOIN users u ON u.id = s.user_id
     WHERE s.token = ? AND s.expires_at > NOW()
     LIMIT 1`,
    [token]
  )

  const session = rows[0]
  if (!session) return null

  return {
    user: {
      id: String(session.user_id),
      name: session.name,
      email: session.email,
      phone: session.phone,
      role: session.role,
    } satisfies User,
    token,
  }
}

export async function deleteSession(token: string) {
  const pool = getDbPool()
  await pool.execute('DELETE FROM sessions WHERE token = ?', [token])
}
