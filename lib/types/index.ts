// User Types
export type UserRole = 'passenger' | 'driver' | 'admin'

export interface User {
  id: string
  name: string
  email: string
  phone: string
  role: UserRole
  avatarUrl?: string
}

// Location Types
export interface Location {
  name: string
  lat: number
  lng: number
}

// Operator Types
export type OperatorType = 'government' | 'private'

export interface Operator {
  id: string
  name: string
  shortName: string
  type: OperatorType
  state?: string // For government operators
  logo?: string
  contactNumber: string
  website?: string
}

// Bus Types
export type BusStatus = 'active' | 'maintenance' | 'inactive'
export type BusType = 'ordinary' | 'express' | 'deluxe' | 'ac-sleeper' | 'volvo' | 'semi-sleeper' | 'super-deluxe'

export interface Bus {
  id: string
  operatorId: string
  registrationNumber: string
  model: string
  busType: BusType
  capacity: number
  amenities: string[]
  status: BusStatus
  currentLocation?: { lat: number; lng: number }
}

// Route Types
export interface Stop {
  id: string
  name: string
  lat: number
  lng: number
  arrivalOffset: number // minutes from start
}

export interface Route {
  id: string
  operatorId: string
  name: string
  origin: Location
  destination: Location
  stops: Stop[]
  distance: number // in km
  estimatedDuration: number // in minutes
  baseFare: number // in INR (ordinary fare)
  fareMultiplier?: Record<BusType, number> // multiplier for different bus types
}

// Trip Types
export type TripStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled'

export interface Trip {
  id: string
  routeId: string
  busId: string
  driverId: string
  departureTime: Date
  arrivalTime: Date
  status: TripStatus
  currentStopIndex: number
  currentLocation?: { lat: number; lng: number }
  passengers: string[] // passenger IDs
}

// Booking Types
export type BookingStatus = 'confirmed' | 'cancelled' | 'completed'

export interface Booking {
  id: string
  passengerId: string
  tripId: string
  seatNumbers: number[]
  status: BookingStatus
  totalFare: number
  bookedAt: Date
  boardingStop: string
  droppingStop: string
  passengerName?: string
  passengerPhone?: string
}

// Seat Types
export type SeatStatus = 'available' | 'booked' | 'selected'

export interface Seat {
  number: number
  status: SeatStatus
  price: number
}

// Stats Types
export interface DashboardStats {
  totalBuses: number
  activeBuses: number
  totalRoutes: number
  totalDrivers: number
  activeTrips: number
  todayBookings: number
  todayRevenue: number
  totalPassengers: number
}

// Chart Data Types
export interface ChartDataPoint {
  name: string
  value: number
  [key: string]: string | number
}
