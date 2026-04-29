'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { Booking, Trip, Route } from '@/lib/types'
import { mockBookings, mockTrips, mockRoutes } from '@/lib/data/mock-data'

interface BookingContextType {
  bookings: Booking[]
  trips: Trip[]
  routes: Route[]
  addBooking: (booking: Omit<Booking, 'id' | 'bookedAt'>) => Promise<Booking>
  cancelBooking: (bookingId: string) => Promise<void>
  getBookingsForPassenger: (passengerId: string) => Booking[]
  getBookingsForTrip: (tripId: string) => Booking[]
  getTripById: (tripId: string) => Trip | undefined
  getRouteById: (routeId: string) => Route | undefined
  getRouteByTripId: (tripId: string) => Route | undefined
  getAvailableSeats: (tripId: string, totalSeats: number) => number[]
  searchTrips: (origin: string, destination: string, date: Date) => Trip[]
}

const BookingContext = createContext<BookingContextType | undefined>(undefined)

export function BookingProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>(mockBookings)
  const [trips, setTrips] = useState<Trip[]>(mockTrips)
  const [routes, setRoutes] = useState<Route[]>(mockRoutes)

  useEffect(() => {
    let mounted = true

    const loadRoutes = async () => {
      try {
        const response = await fetch('/api/routes')
        const data = await response.json()
        if (!response.ok || !mounted) return

        setRoutes(data.routes ?? [])
      } catch {
        // Keep seeded mock routes as a fallback if the API is unavailable.
      }
    }

    const loadTrips = async () => {
      try {
        const response = await fetch('/api/trips')
        const data = await response.json()
        if (!response.ok || !mounted) return

        setTrips(
          (data.trips ?? []).map((trip: Trip & { departureTime: string; arrivalTime: string }) => ({
            ...trip,
            departureTime: new Date(trip.departureTime),
            arrivalTime: new Date(trip.arrivalTime),
          }))
        )
      } catch {
        // Keep seeded mock trips as a fallback if the API is unavailable.
      }
    }

    const loadBookings = async () => {
      try {
        const response = await fetch('/api/bookings')
        const data = await response.json()
        if (!response.ok || !mounted) return

        setBookings(
          (data.bookings ?? []).map((booking: Booking & { bookedAt: string }) => ({
            ...booking,
            bookedAt: new Date(booking.bookedAt),
          }))
        )
      } catch {
        // Keep seeded mock bookings as a fallback if the API is unavailable.
      }
    }

    loadRoutes()
    loadTrips()
    loadBookings()

    return () => {
      mounted = false
    }
  }, [])

  const addBooking = useCallback(async (bookingData: Omit<Booking, 'id' | 'bookedAt'>): Promise<Booking> => {
    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData),
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error || 'Unable to create booking')
    }

    const newBooking: Booking = {
      ...data.booking,
      bookedAt: new Date(data.booking.bookedAt),
    }

    setBookings((prev) => [newBooking, ...prev])
    return newBooking
  }, [])

  const cancelBooking = useCallback(async (bookingId: string) => {
    const response = await fetch(`/api/bookings/${bookingId}`, {
      method: 'PATCH',
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error || 'Unable to cancel booking')
    }

    const updatedBooking: Booking = {
      ...data.booking,
      bookedAt: new Date(data.booking.bookedAt),
    }

    setBookings((prev) =>
      prev.map((booking) => (booking.id === bookingId ? updatedBooking : booking))
    )
  }, [])

  const getBookingsForPassenger = useCallback(
    (passengerId: string) => {
      return bookings.filter((b) => b.passengerId === passengerId)
    },
    [bookings]
  )

  const getBookingsForTrip = useCallback(
    (tripId: string) => {
      return bookings.filter((b) => b.tripId === tripId && b.status !== 'cancelled')
    },
    [bookings]
  )

  const getTripById = useCallback(
    (tripId: string) => {
      return trips.find((t) => t.id === tripId)
    },
    [trips]
  )

  const getRouteById = useCallback(
    (routeId: string) => {
      return routes.find((r) => r.id === routeId)
    },
    [routes]
  )

  const getRouteByTripId = useCallback(
    (tripId: string) => {
      const trip = trips.find((t) => t.id === tripId)
      if (!trip) return undefined
      return routes.find((r) => r.id === trip.routeId)
    },
    [trips, routes]
  )

  const getAvailableSeats = useCallback(
    (tripId: string, totalSeats: number) => {
      const tripBookings = bookings.filter((b) => b.tripId === tripId && b.status !== 'cancelled')
      const bookedSeats = tripBookings.flatMap((b) => b.seatNumbers)
      return Array.from({ length: totalSeats }, (_, i) => i + 1).filter(
        (seat) => !bookedSeats.includes(seat)
      )
    },
    [bookings]
  )

  const searchTrips = useCallback(
    (origin: string, destination: string, date: Date) => {
      const normalizedOrigin = origin.toLowerCase()
      const normalizedDestination = destination.toLowerCase()

      const stopMatches = (stopName: string, cityName: string) => stopName.toLowerCase().includes(cityName)

      // Find routes matching origin/destination either as endpoints or along the stop sequence.
      const matchingRoutes = routes.filter((route) => {
        const originMatch = route.origin.name.toLowerCase().includes(normalizedOrigin)
        const destMatch = route.destination.name.toLowerCase().includes(normalizedDestination)

        if (originMatch && destMatch) {
          return true
        }

        const originStopIndex = route.stops.findIndex((stop) => stopMatches(stop.name, normalizedOrigin))
        const destinationStopIndex = route.stops.findIndex((stop) =>
          stopMatches(stop.name, normalizedDestination)
        )

        return originStopIndex >= 0 && destinationStopIndex > originStopIndex
      })

      if (matchingRoutes.length === 0) return []

      // Find trips for matching routes on the given date
      const routeIds = matchingRoutes.map((r) => r.id)
      return trips.filter((trip) => {
        const tripDate = new Date(trip.departureTime)
        const searchDate = new Date(date)
        return (
          routeIds.includes(trip.routeId) &&
          tripDate.toDateString() === searchDate.toDateString() &&
          trip.status !== 'cancelled' &&
          trip.status !== 'completed'
        )
      })
    },
    [routes, trips]
  )

  return (
    <BookingContext.Provider
      value={{
        bookings,
        trips,
        routes,
        addBooking,
        cancelBooking,
        getBookingsForPassenger,
        getBookingsForTrip,
        getTripById,
        getRouteById,
        getRouteByTripId,
        getAvailableSeats,
        searchTrips,
      }}
    >
      {children}
    </BookingContext.Provider>
  )
}

export function useBooking() {
  const context = useContext(BookingContext)
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider')
  }
  return context
}
