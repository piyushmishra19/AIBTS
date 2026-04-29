import { NextResponse } from 'next/server'
import { z } from 'zod'
import type { ResultSetHeader } from 'mysql2'
import type { BusStatus, BusType } from '@/lib/types'
import { getAllBuses } from '@/lib/server/buses'
import { getDbPool } from '@/lib/server/db'

const busSchema = z.object({
  id: z.string().trim().min(1).optional(),
  operatorId: z.string().trim().min(1, 'Operator is required'),
  registrationNumber: z.string().trim().min(3, 'Registration number is required'),
  model: z.string().trim().min(2, 'Model is required'),
  busType: z.enum(
    ['ordinary', 'express', 'deluxe', 'ac-sleeper', 'volvo', 'semi-sleeper', 'super-deluxe'] satisfies [
      BusType,
      ...BusType[],
    ]
  ),
  capacity: z.coerce.number().int().positive('Capacity must be greater than 0'),
  amenities: z.array(z.string().trim().min(1)).default([]),
  status: z.enum(['active', 'maintenance', 'inactive'] satisfies [BusStatus, ...BusStatus[]]),
})

export async function GET() {
  try {
    const buses = await getAllBuses()
    return NextResponse.json({ buses })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load buses'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = busSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid bus data' },
        { status: 400 }
      )
    }

    const data = parsed.data
    const busId = data.id || `bus-${Date.now()}`
    const pool = getDbPool()

    await pool.execute<ResultSetHeader>(
      `INSERT INTO buses (
        id,
        operator_id,
        registration_number,
        model,
        bus_type,
        capacity,
        amenities,
        status,
        current_location_lat,
        current_location_lng
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL)`,
      [
        busId,
        data.operatorId,
        data.registrationNumber,
        data.model,
        data.busType,
        data.capacity,
        JSON.stringify(data.amenities),
        data.status,
      ]
    )

    const buses = await getAllBuses()
    const createdBus = buses.find((bus) => bus.id === busId)
    return NextResponse.json({ bus: createdBus }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create bus'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
