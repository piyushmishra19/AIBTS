import { NextResponse } from 'next/server'
import { z } from 'zod'
import { buildStopsFromNames, createRoute, getAllRoutes } from '@/lib/server/routes'

const locationSchema = z.object({
  name: z.string().trim().min(2, 'Location name is required'),
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
})

const routeSchema = z.object({
  id: z.string().trim().min(1).optional(),
  operatorId: z.string().trim().min(1, 'Operator is required'),
  name: z.string().trim().min(3, 'Route name is required'),
  origin: locationSchema,
  destination: locationSchema,
  distance: z.coerce.number().int().positive('Distance must be greater than 0'),
  estimatedDuration: z.coerce.number().int().positive('Duration must be greater than 0'),
  baseFare: z.coerce.number().positive('Base fare must be greater than 0'),
  stopNames: z.array(z.string().trim().min(1)).default([]),
})

export async function GET() {
  try {
    const routes = await getAllRoutes()
    return NextResponse.json({ routes })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load routes'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = routeSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid route data' },
        { status: 400 }
      )
    }

    const data = parsed.data
    const stops = buildStopsFromNames(
      data.origin,
      data.destination,
      data.estimatedDuration,
      data.stopNames
    )

    const route = await createRoute({
      id: data.id,
      operatorId: data.operatorId,
      name: data.name,
      origin: data.origin,
      destination: data.destination,
      distance: data.distance,
      estimatedDuration: data.estimatedDuration,
      baseFare: data.baseFare,
      stops,
    })

    return NextResponse.json({ route }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create route'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
