import { NextResponse } from 'next/server'
import { z } from 'zod'
import type { BusStatus, BusType } from '@/lib/types'
import { getBusById } from '@/lib/server/buses'
import { getDbPool } from '@/lib/server/db'

const busUpdateSchema = z.object({
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

interface RouteContext {
  params: Promise<{ busId: string }>
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { busId } = await context.params
    const body = await request.json()
    const parsed = busUpdateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid bus data' },
        { status: 400 }
      )
    }

    const pool = getDbPool()
    await pool.execute(
      `UPDATE buses
       SET operator_id = ?, registration_number = ?, model = ?, bus_type = ?, capacity = ?, amenities = ?, status = ?
       WHERE id = ?`,
      [
        parsed.data.operatorId,
        parsed.data.registrationNumber,
        parsed.data.model,
        parsed.data.busType,
        parsed.data.capacity,
        JSON.stringify(parsed.data.amenities),
        parsed.data.status,
        busId,
      ]
    )

    const bus = await getBusById(busId)
    return NextResponse.json({ bus })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update bus'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { busId } = await context.params
    const pool = getDbPool()
    await pool.execute('DELETE FROM buses WHERE id = ?', [busId])
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to delete bus'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
