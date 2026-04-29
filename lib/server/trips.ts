import type { RowDataPacket } from 'mysql2'
import type { Trip, TripStatus } from '@/lib/types'
import { mockTrips } from '@/lib/data/mock-data'
import { getDbPool } from './db'

type TripRow = RowDataPacket & {
  id: string
  route_id: string
  bus_id: string
  driver_id: string
  departure_time: Date | string
  arrival_time: Date | string
  status: TripStatus
  current_stop_index: number
  current_location_lat: number | null
  current_location_lng: number | null
  passengers: string | null
}

function rowToTrip(row: TripRow): Trip {
  const passengersValue = row.passengers
  let passengers: string[] = []

  if (typeof passengersValue === 'string') {
    try {
      const parsed = JSON.parse(passengersValue) as unknown
      if (Array.isArray(parsed)) {
        passengers = parsed.filter((item): item is string => typeof item === 'string')
      }
    } catch {
      passengers = passengersValue.split(',').map((item) => item.trim()).filter(Boolean)
    }
  }

  return {
    id: row.id,
    routeId: row.route_id,
    busId: row.bus_id,
    driverId: row.driver_id,
    departureTime: new Date(row.departure_time),
    arrivalTime: new Date(row.arrival_time),
    status: row.status,
    currentStopIndex: row.current_stop_index,
    currentLocation:
      row.current_location_lat != null && row.current_location_lng != null
        ? { lat: Number(row.current_location_lat), lng: Number(row.current_location_lng) }
        : undefined,
    passengers,
  }
}

export async function ensureTripsTableAndSeed() {
  const pool = getDbPool()

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS trips (
      id VARCHAR(80) NOT NULL PRIMARY KEY,
      route_id VARCHAR(80) NOT NULL,
      bus_id VARCHAR(80) NOT NULL,
      driver_id VARCHAR(80) NOT NULL,
      departure_time DATETIME NOT NULL,
      arrival_time DATETIME NOT NULL,
      status ENUM('scheduled', 'in-progress', 'completed', 'cancelled') NOT NULL,
      current_stop_index INT NOT NULL DEFAULT 0,
      current_location_lat DECIMAL(10, 7) NULL,
      current_location_lng DECIMAL(10, 7) NULL,
      passengers JSON NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `)

  const [countRows] = await pool.query<Array<RowDataPacket & { count: number }>>(
    'SELECT COUNT(*) as count FROM trips'
  )

  if ((countRows[0]?.count || 0) > 0) {
    return
  }

  for (const trip of mockTrips) {
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
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        trip.id,
        trip.routeId,
        trip.busId,
        trip.driverId,
        trip.departureTime,
        trip.arrivalTime,
        trip.status,
        trip.currentStopIndex,
        trip.currentLocation?.lat ?? null,
        trip.currentLocation?.lng ?? null,
        JSON.stringify(trip.passengers || []),
      ]
    )
  }
}

export async function getAllTrips() {
  await ensureTripsTableAndSeed()
  const pool = getDbPool()
  const [rows] = await pool.query<TripRow[]>('SELECT * FROM trips ORDER BY departure_time DESC')
  return rows.map(rowToTrip)
}
