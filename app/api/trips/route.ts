import { NextResponse } from 'next/server'
import { z } from 'zod'
import type { TripStatus } from '@/lib/types'
import { ensureTripsTableAndSeed, getAllTrips } from '@/lib/server/trips'
import { getDbPool } from '@/lib/server/db'

const tripSchema = z.object({
  routeId: z.string().trim().min(1, 'Route is required'),
  busId: z.string().trim().min(1, 'Bus is required'),
  driverId: z.string().trim().min(1, 'Driver is required'),
  departureTime: z.string().datetime('Valid departure time is required'),
  arrivalTime: z.string().datetime('Valid arrival time is required'),
  status: z
    .enum(['scheduled', 'in-progress', 'completed', 'cancelled'] satisfies [TripStatus, ...TripStatus[]])
    .default('scheduled'),
})

export async function GET() {
  try {
    const trips = await getAllTrips()
    return NextResponse.json({ trips })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load trips'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = tripSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid trip data' },
        { status: 400 }
      )
    }

    const data = parsed.data
    await ensureTripsTableAndSeed()
    const pool = getDbPool()
    const tripId = `trip-${Date.now()}`

    await pool.execute(
      `INSERT INTO trips (
        id,
        route_id,
        bus_id,
        driver_id,
        departure_time,
        arrival_time,
        status,
        current_stop_index,
        current_location_lat,
        current_location_lng,
        passengers
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, NULL, NULL, ?)`,
      [
        tripId,
        data.routeId,
        data.busId,
        data.driverId,
        new Date(data.departureTime),
        new Date(data.arrivalTime),
        data.status,
        JSON.stringify([]),
      ]
    )

    const trips = await getAllTrips()
    const trip = trips.find((item) => item.id === tripId)
    return NextResponse.json({ trip }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create trip'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
