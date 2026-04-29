import type { RowDataPacket } from 'mysql2'
import type { Bus, BusStatus, BusType } from '@/lib/types'
import { mockBuses } from '@/lib/data/mock-data'
import { getDbPool } from './db'

type BusRow = RowDataPacket & {
  id: string
  operator_id: string
  registration_number: string
  model: string
  bus_type: BusType
  capacity: number
  amenities: string
  status: BusStatus
  current_location_lat: number | null
  current_location_lng: number | null
}

function rowToBus(row: BusRow): Bus {
  const parsedAmenities = (() => {
    const rawAmenities = row.amenities

    try {
      if (Array.isArray(rawAmenities)) {
        return rawAmenities.filter((item): item is string => typeof item === 'string')
      }

      if (typeof rawAmenities === 'object' && rawAmenities !== null) {
        const values = Object.values(rawAmenities)
        if (values.every((item) => typeof item === 'string')) {
          return values as string[]
        }
      }

      const parsed = JSON.parse(typeof rawAmenities === 'string' ? rawAmenities : '[]') as unknown
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === 'string')
      }
    } catch {
      if (typeof rawAmenities !== 'string') {
        return []
      }

      return rawAmenities
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    }

    return []
  })()

  return {
    id: row.id,
    operatorId: row.operator_id,
    registrationNumber: row.registration_number,
    model: row.model,
    busType: row.bus_type,
    capacity: row.capacity,
    amenities: parsedAmenities,
    status: row.status,
    currentLocation:
      row.current_location_lat != null && row.current_location_lng != null
        ? { lat: Number(row.current_location_lat), lng: Number(row.current_location_lng) }
        : undefined,
  }
}

export async function ensureBusesTableAndSeed() {
  const pool = getDbPool()

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS buses (
      id VARCHAR(80) NOT NULL PRIMARY KEY,
      operator_id VARCHAR(80) NOT NULL,
      registration_number VARCHAR(80) NOT NULL UNIQUE,
      model VARCHAR(120) NOT NULL,
      bus_type ENUM('ordinary', 'express', 'deluxe', 'ac-sleeper', 'volvo', 'semi-sleeper', 'super-deluxe') NOT NULL,
      capacity INT NOT NULL,
      amenities JSON NOT NULL,
      status ENUM('active', 'maintenance', 'inactive') NOT NULL,
      current_location_lat DECIMAL(10, 7) NULL,
      current_location_lng DECIMAL(10, 7) NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `)

  const [countRows] = await pool.query<Array<RowDataPacket & { count: number }>>(
    'SELECT COUNT(*) as count FROM buses'
  )

  if ((countRows[0]?.count || 0) > 0) {
    return
  }

  for (const bus of mockBuses) {
    await pool.execute(
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
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        bus.id,
        bus.operatorId,
        bus.registrationNumber,
        bus.model,
        bus.busType,
        bus.capacity,
        JSON.stringify(bus.amenities),
        bus.status,
        bus.currentLocation?.lat ?? null,
        bus.currentLocation?.lng ?? null,
      ]
    )
  }
}

export async function getAllBuses() {
  await ensureBusesTableAndSeed()
  const pool = getDbPool()
  const [rows] = await pool.query<BusRow[]>('SELECT * FROM buses ORDER BY operator_id, registration_number')
  return rows.map(rowToBus)
}

export async function getBusById(busId: string) {
  await ensureBusesTableAndSeed()
  const pool = getDbPool()
  const [rows] = await pool.query<BusRow[]>('SELECT * FROM buses WHERE id = ? LIMIT 1', [busId])
  const row = rows[0]
  return row ? rowToBus(row) : null
}
