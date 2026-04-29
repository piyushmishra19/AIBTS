import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createBookingRecord, getAllBookings } from '@/lib/server/bookings'

const bookingSchema = z.object({
  passengerId: z.string().trim().min(1, 'Passenger is required'),
  tripId: z.string().trim().min(1, 'Trip is required'),
  seatNumbers: z.array(z.coerce.number().int().positive()).min(1, 'Select at least one seat'),
  status: z.enum(['confirmed', 'cancelled', 'completed']).default('confirmed'),
  totalFare: z.coerce.number().nonnegative('Total fare must be valid'),
  boardingStop: z.string().trim().min(1, 'Boarding point is required'),
  droppingStop: z.string().trim().min(1, 'Dropping point is required'),
  passengerName: z.string().trim().optional(),
  passengerPhone: z.string().trim().optional(),
})

export async function GET() {
  try {
    const bookings = await getAllBookings()
    return NextResponse.json({ bookings })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load bookings'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = bookingSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid booking data' },
        { status: 400 }
      )
    }

    const booking = await createBookingRecord(parsed.data)
    return NextResponse.json({ booking }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create booking'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
