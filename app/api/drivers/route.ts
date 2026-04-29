import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createDriverUser, getDriverUsers } from '@/lib/server/drivers'

const createDriverSchema = z.object({
  name: z.string().trim().min(2, 'Driver name must be at least 2 characters'),
  email: z.string().trim().email('Enter a valid email address'),
  phone: z.string().trim().min(10, 'Enter a valid phone number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export async function GET() {
  try {
    const drivers = await getDriverUsers()
    return NextResponse.json({ drivers })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load drivers'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = createDriverSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid driver details' },
        { status: 400 }
      )
    }

    const driver = await createDriverUser(parsed.data)
    return NextResponse.json({ driver }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create driver'
    const status = message.includes('already exists') ? 409 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
