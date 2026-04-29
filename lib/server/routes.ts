import type { ResultSetHeader, RowDataPacket } from 'mysql2'
import type { Location, Route, Stop } from '@/lib/types'
import { fareMultipliers, mockRoutes } from '@/lib/data/mock-data'
import { getDbPool } from './db'

type RouteRow = RowDataPacket & {
  id: string
  operator_id: string
  name: string
  origin_name: string
  origin_lat: number
  origin_lng: number
  destination_name: string
  destination_lat: number
  destination_lng: number
  stops: string
  distance: number
  estimated_duration: number
  base_fare: number
}

function isStop(item: unknown): item is Stop {
  return (
    typeof item === 'object' &&
    item !== null &&
    'id' in item &&
    'name' in item &&
    'lat' in item &&
    'lng' in item &&
    'arrivalOffset' in item
  )
}

function parseStops(rawStops: unknown): Stop[] {
  if (Array.isArray(rawStops)) {
    return rawStops.filter(isStop)
  }

  if (typeof rawStops === 'object' && rawStops !== null) {
    const values = Object.values(rawStops)
    if (values.every(isStop)) {
      return values
    }
  }

  try {
    const parsed = JSON.parse(typeof rawStops === 'string' ? rawStops : '[]') as unknown
    if (Array.isArray(parsed)) {
      return parsed.filter(isStop)
    }
  } catch {
    return []
  }

  return []
}

function rowToRoute(row: RouteRow): Route {
  return {
    id: row.id,
    operatorId: row.operator_id,
    name: row.name,
    origin: {
      name: row.origin_name,
      lat: Number(row.origin_lat),
      lng: Number(row.origin_lng),
    },
    destination: {
      name: row.destination_name,
      lat: Number(row.destination_lat),
      lng: Number(row.destination_lng),
    },
    stops: parseStops(row.stops),
    distance: Number(row.distance),
    estimatedDuration: row.estimated_duration,
    baseFare: Number(row.base_fare),
    fareMultiplier: fareMultipliers,
  }
}

export async function ensureRoutesTableAndSeed() {
  const pool = getDbPool()

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS routes (
      id VARCHAR(80) NOT NULL PRIMARY KEY,
      operator_id VARCHAR(80) NOT NULL,
      name VARCHAR(160) NOT NULL,
      origin_name VARCHAR(120) NOT NULL,
      origin_lat DECIMAL(10, 7) NOT NULL,
      origin_lng DECIMAL(10, 7) NOT NULL,
      destination_name VARCHAR(120) NOT NULL,
      destination_lat DECIMAL(10, 7) NOT NULL,
      destination_lng DECIMAL(10, 7) NOT NULL,
      stops JSON NOT NULL,
      distance INT NOT NULL,
      estimated_duration INT NOT NULL,
      base_fare DECIMAL(10, 2) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `)

  const [countRows] = await pool.query<Array<RowDataPacket & { count: number }>>(
    'SELECT COUNT(*) as count FROM routes'
  )

  if ((countRows[0]?.count || 0) > 0) {
    return
  }

  for (const route of mockRoutes) {
    await pool.execute(
      `INSERT INTO routes (
        id,
        operator_id,
        name,
        origin_name,
        origin_lat,
        origin_lng,
        destination_name,
        destination_lat,
        destination_lng,
        stops,
        distance,
        estimated_duration,
        base_fare
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        route.id,
        route.operatorId,
        route.name,
        route.origin.name,
        route.origin.lat,
        route.origin.lng,
        route.destination.name,
        route.destination.lat,
        route.destination.lng,
        JSON.stringify(route.stops),
        route.distance,
        route.estimatedDuration,
        route.baseFare,
      ]
    )
  }
}

export async function getAllRoutes() {
  await ensureRoutesTableAndSeed()
  const pool = getDbPool()
  const [rows] = await pool.query<RouteRow[]>('SELECT * FROM routes ORDER BY name')
  return rows.map(rowToRoute)
}

function interpolateLocation(start: Location, end: Location, progress: number) {
  return {
    lat: Number((start.lat + (end.lat - start.lat) * progress).toFixed(6)),
    lng: Number((start.lng + (end.lng - start.lng) * progress).toFixed(6)),
  }
}

export function buildStopsFromNames(
  origin: Location,
  destination: Location,
  estimatedDuration: number,
  stopNames: string[]
) {
  const cleanNames = stopNames.map((name) => name.trim()).filter(Boolean)
  const names = [origin.name, ...cleanNames, destination.name]
  const totalSegments = Math.max(names.length - 1, 1)

  return names.map((name, index) => {
    const point = interpolateLocation(origin, destination, index / totalSegments)
    return {
      id: `stop-${Date.now()}-${index}`,
      name,
      lat: point.lat,
      lng: point.lng,
      arrivalOffset: Math.round((estimatedDuration / totalSegments) * index),
    } satisfies Stop
  })
}

export async function createRoute(input: {
  id?: string
  operatorId: string
  name: string
  origin: Location
  destination: Location
  distance: number
  estimatedDuration: number
  baseFare: number
  stops: Stop[]
}) {
  await ensureRoutesTableAndSeed()
  const pool = getDbPool()
  const routeId = input.id || `route-${Date.now()}`

  await pool.execute<ResultSetHeader>(
    `INSERT INTO routes (
      id,
      operator_id,
      name,
      origin_name,
      origin_lat,
      origin_lng,
      destination_name,
      destination_lat,
      destination_lng,
      stops,
      distance,
      estimated_duration,
      base_fare
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      routeId,
      input.operatorId,
      input.name,
      input.origin.name,
      input.origin.lat,
      input.origin.lng,
      input.destination.name,
      input.destination.lat,
      input.destination.lng,
      JSON.stringify(input.stops),
      input.distance,
      input.estimatedDuration,
      input.baseFare,
    ]
  )

  const routes = await getAllRoutes()
  return routes.find((route) => route.id === routeId) ?? null
}
