import type { ResultSetHeader, RowDataPacket } from 'mysql2'
import type { User } from '@/lib/types'
import { hashPassword } from './auth'
import { getDbPool } from './db'

type DriverRow = RowDataPacket & {
  id: number
  name: string
  email: string
  phone: string
  role: 'driver'
}

export async function getDriverUsers() {
  const pool = getDbPool()
  const [rows] = await pool.query<DriverRow[]>(
    `SELECT id, name, email, phone, role
     FROM users
     WHERE role = 'driver'
     ORDER BY name`
  )

  return rows.map(
    (row): User => ({
      id: String(row.id),
      name: row.name,
      email: row.email,
      phone: row.phone,
      role: row.role,
    })
  )
}

type ExistingDriverRow = RowDataPacket & {
  id: number
}

export async function createDriverUser(input: {
  name: string
  email: string
  phone: string
  password: string
}) {
  const pool = getDbPool()
  const normalizedEmail = input.email.trim().toLowerCase()
  const normalizedPhone = input.phone.trim()

  const [existingDrivers] = await pool.query<ExistingDriverRow[]>(
    `SELECT id
     FROM users
     WHERE email = ? AND role = 'driver'
     LIMIT 1`,
    [normalizedEmail]
  )

  if (existingDrivers.length > 0) {
    throw new Error('A driver account already exists for this email')
  }

  const passwordHash = hashPassword(input.password)
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO users (name, email, phone, password_hash, role)
     VALUES (?, ?, ?, ?, 'driver')`,
    [input.name.trim(), normalizedEmail, normalizedPhone, passwordHash]
  )

  return {
    id: String(result.insertId),
    name: input.name.trim(),
    email: normalizedEmail,
    phone: normalizedPhone,
    role: 'driver' as const,
  } satisfies User
}
