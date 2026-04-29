import { NextResponse } from 'next/server'
import { clearSessionCookie, deleteSession, getCurrentSessionUser } from '@/lib/server/auth'

export async function POST() {
  try {
    const session = await getCurrentSessionUser()
    if (session) {
      await deleteSession(session.token)
    }

    await clearSessionCookie()

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to sign out'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
