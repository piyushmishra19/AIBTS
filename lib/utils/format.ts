import { format, formatDistanceToNow, isToday, isTomorrow } from 'date-fns'

// Currency formatter for INR
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Duration formatter (minutes to hours and minutes)
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `${mins}m`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}m`
}

// Distance formatter
export function formatDistance(km: number): string {
  return `${km} km`
}

// Time formatter
export function formatTime(date: Date): string {
  return format(new Date(date), 'hh:mm a')
}

// Date formatter
export function formatDate(date: Date): string {
  const d = new Date(date)
  if (isToday(d)) return 'Today'
  if (isTomorrow(d)) return 'Tomorrow'
  return format(d, 'EEE, dd MMM')
}

// Full date time formatter
export function formatDateTime(date: Date): string {
  return format(new Date(date), 'dd MMM yyyy, hh:mm a')
}

// Relative time (e.g., "2 hours ago")
export function formatRelativeTime(date: Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

// Phone number formatter
export function formatPhone(phone: string): string {
  // Format: +91 98765 43210
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`
  }
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`
  }
  return phone
}

// Seat numbers formatter
export function formatSeatNumbers(seats: number[]): string {
  if (seats.length === 0) return '-'
  if (seats.length === 1) return `Seat ${seats[0]}`
  return `Seats ${seats.join(', ')}`
}

// Status badge color
export function getStatusColor(status: string): string {
  switch (status) {
    case 'active':
    case 'confirmed':
    case 'completed':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
    case 'in-progress':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    case 'scheduled':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
    case 'maintenance':
    case 'cancelled':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    case 'inactive':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
  }
}

// ETA calculator
export function calculateETA(
  currentStopIndex: number,
  stops: { arrivalOffset: number }[],
  departureTime: Date
): Date {
  if (currentStopIndex >= stops.length - 1) {
    // Already at last stop
    return new Date(departureTime.getTime() + stops[stops.length - 1].arrivalOffset * 60000)
  }
  const nextStop = stops[currentStopIndex + 1]
  return new Date(departureTime.getTime() + nextStop.arrivalOffset * 60000)
}
