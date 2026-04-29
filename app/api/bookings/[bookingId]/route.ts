import { NextResponse } from 'next/server'
import { cancelBookingRecord } from '@/lib/server/bookings'

interface BookingRouteProps {
  params: Promise<{ bookingId: string }>
}

export async function PATCH(_: Request, { params }: BookingRouteProps) {
  try {
    const { bookingId } = await params
    const booking = await cancelBookingRecord(bookingId)

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    return NextResponse.json({ booking })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to cancel booking'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
