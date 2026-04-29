import type { ResultSetHeader, RowDataPacket } from 'mysql2'
import type { Booking, BookingStatus } from '@/lib/types'
import { getDbPool } from './db'

type BookingRow = RowDataPacket & {
  id: string
  passenger_id: string
  trip_id: string
  seat_numbers: string
  status: BookingStatus
  total_fare: number
  booked_at: Date
  boarding_stop: string
  dropping_stop: string
  passenger_name: string | null
  passenger_phone: string | null
}

function parseSeatNumbers(rawSeatNumbers: unknown) {
  if (Array.isArray(rawSeatNumbers)) {
    return rawSeatNumbers
      .map((seat) => Number(seat))
      .filter((seat) => Number.isInteger(seat) && seat > 0)
  }

  try {
    const parsed = JSON.parse(typeof rawSeatNumbers === 'string' ? rawSeatNumbers : '[]') as unknown
    if (Array.isArray(parsed)) {
      return parsed
        .map((seat) => Number(seat))
        .filter((seat) => Number.isInteger(seat) && seat > 0)
    }
  } catch {
    return []
  }

  return []
}

function rowToBooking(row: BookingRow): Booking {
  return {
    id: row.id,
    passengerId: row.passenger_id,
    tripId: row.trip_id,
    seatNumbers: parseSeatNumbers(row.seat_numbers),
    status: row.status,
    totalFare: Number(row.total_fare),
    bookedAt: new Date(row.booked_at),
    boardingStop: row.boarding_stop,
    droppingStop: row.dropping_stop,
    passengerName: row.passenger_name ?? undefined,
    passengerPhone: row.passenger_phone ?? undefined,
  }
}

export async function ensureBookingsTable() {
  const pool = getDbPool()

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS bookings (
      id VARCHAR(80) NOT NULL PRIMARY KEY,
      passenger_id VARCHAR(80) NOT NULL,
      trip_id VARCHAR(80) NOT NULL,
      seat_numbers JSON NOT NULL,
      status ENUM('confirmed', 'cancelled', 'completed') NOT NULL,
      total_fare DECIMAL(10, 2) NOT NULL,
      booked_at DATETIME NOT NULL,
      boarding_stop VARCHAR(160) NOT NULL,
      dropping_stop VARCHAR(160) NOT NULL,
      passenger_name VARCHAR(120) NULL,
      passenger_phone VARCHAR(30) NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `)
}

export async function getAllBookings() {
  await ensureBookingsTable()
  const pool = getDbPool()
  const [rows] = await pool.query<BookingRow[]>('SELECT * FROM bookings ORDER BY booked_at DESC')
  return rows.map(rowToBooking)
}

export async function createBookingRecord(input: Omit<Booking, 'id' | 'bookedAt'>) {
  await ensureBookingsTable()
  const pool = getDbPool()
  const bookingId = `booking-${Date.now()}`
  const bookedAt = new Date()

  await pool.execute<ResultSetHeader>(
    `INSERT INTO bookings (
      id,
      passenger_id,
      trip_id,
      seat_numbers,
      status,
      total_fare,
      booked_at,
      boarding_stop,
      dropping_stop,
      passenger_name,
      passenger_phone
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      bookingId,
      input.passengerId,
      input.tripId,
      JSON.stringify(input.seatNumbers),
      input.status,
      input.totalFare,
      bookedAt,
      input.boardingStop,
      input.droppingStop,
      input.passengerName ?? null,
      input.passengerPhone ?? null,
    ]
  )

  return {
    id: bookingId,
    bookedAt,
    ...input,
  } satisfies Booking
}

export async function cancelBookingRecord(bookingId: string) {
  await ensureBookingsTable()
  const pool = getDbPool()

  await pool.execute<ResultSetHeader>(
    `UPDATE bookings
     SET status = 'cancelled'
     WHERE id = ?`,
    [bookingId]
  )

  const [rows] = await pool.query<BookingRow[]>('SELECT * FROM bookings WHERE id = ? LIMIT 1', [bookingId])
  const row = rows[0]
  return row ? rowToBooking(row) : null
}
