'use client'

import { cn } from '@/lib/utils'

interface SeatPickerProps {
  totalSeats: number
  bookedSeats: number[]
  selectedSeats: number[]
  onSeatSelect: (seatNumber: number) => void
  maxSelection?: number
  layout?: '2x2' | '3x2' // 2+2 or 3+2 configuration
}

export function SeatPicker({
  totalSeats,
  bookedSeats,
  selectedSeats,
  onSeatSelect,
  maxSelection = 6,
  layout = '2x2',
}: SeatPickerProps) {
  const seatsPerRow = layout === '2x2' ? 4 : 5
  const rows = Math.ceil(totalSeats / seatsPerRow)

  const getSeatStatus = (seatNumber: number) => {
    if (bookedSeats.includes(seatNumber)) return 'booked'
    if (selectedSeats.includes(seatNumber)) return 'selected'
    return 'available'
  }

  const handleSeatClick = (seatNumber: number) => {
    const status = getSeatStatus(seatNumber)
    if (status === 'booked') return
    if (status === 'selected') {
      onSeatSelect(seatNumber)
    } else if (selectedSeats.length < maxSelection) {
      onSeatSelect(seatNumber)
    }
  }

  const renderSeat = (seatNumber: number, isAisle: boolean = false) => {
    if (seatNumber > totalSeats) {
      return <div key={`empty-${seatNumber}`} className="h-10 w-10" />
    }

    const status = getSeatStatus(seatNumber)
    return (
      <button
        key={seatNumber}
        type="button"
        onClick={() => handleSeatClick(seatNumber)}
        disabled={status === 'booked'}
        className={cn(
          'relative h-10 w-10 rounded-t-lg border-2 text-xs font-medium transition-all',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          status === 'available' &&
            'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400',
          status === 'selected' &&
            'border-blue-500 bg-blue-500 text-white hover:bg-blue-600',
          status === 'booked' &&
            'cursor-not-allowed border-gray-300 bg-gray-200 text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-600',
          isAisle && 'ml-4'
        )}
      >
        {seatNumber}
        {/* Seat bottom */}
        <div
          className={cn(
            'absolute -bottom-1 left-1 right-1 h-1 rounded-b',
            status === 'available' && 'bg-emerald-300 dark:bg-emerald-700',
            status === 'selected' && 'bg-blue-600',
            status === 'booked' && 'bg-gray-300 dark:bg-gray-700'
          )}
        />
      </button>
    )
  }

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded border-2 border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/30" />
          <span className="text-muted-foreground">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded border-2 border-blue-500 bg-blue-500" />
          <span className="text-muted-foreground">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded border-2 border-gray-300 bg-gray-200 dark:border-gray-700 dark:bg-gray-800" />
          <span className="text-muted-foreground">Booked</span>
        </div>
      </div>

      {/* Bus Layout */}
      <div className="rounded-lg border bg-card p-4">
        {/* Driver area */}
        <div className="mb-4 flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 text-muted-foreground"
              >
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
            <span className="text-sm text-muted-foreground">Driver</span>
          </div>
          <div className="h-6 w-10 rounded border-2 border-dashed border-muted-foreground/30" />
        </div>

        {/* Seats Grid */}
        <div className="flex flex-col items-center gap-2">
          {Array.from({ length: rows }, (_, rowIndex) => {
            const startSeat = rowIndex * seatsPerRow + 1
            return (
              <div key={rowIndex} className="flex items-center gap-1">
                {layout === '2x2' ? (
                  <>
                    {/* Left side (2 seats) */}
                    {renderSeat(startSeat)}
                    {renderSeat(startSeat + 1)}
                    {/* Aisle */}
                    <div className="w-8" />
                    {/* Right side (2 seats) */}
                    {renderSeat(startSeat + 2)}
                    {renderSeat(startSeat + 3)}
                  </>
                ) : (
                  <>
                    {/* Left side (3 seats) */}
                    {renderSeat(startSeat)}
                    {renderSeat(startSeat + 1)}
                    {renderSeat(startSeat + 2)}
                    {/* Aisle */}
                    <div className="w-6" />
                    {/* Right side (2 seats) */}
                    {renderSeat(startSeat + 3)}
                    {renderSeat(startSeat + 4)}
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Selection info */}
      {selectedSeats.length > 0 && (
        <p className="text-center text-sm text-muted-foreground">
          Selected: {selectedSeats.sort((a, b) => a - b).join(', ')} ({selectedSeats.length}/{maxSelection} max)
        </p>
      )}
    </div>
  )
}
