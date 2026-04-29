import { NextResponse } from 'next/server'
import { getCurrentSessionUser } from '@/lib/server/auth'

export async function GET() {
  try {
    const session = await getCurrentSessionUser()

    if (!session) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    return NextResponse.json({ user: session.user })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load session'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
