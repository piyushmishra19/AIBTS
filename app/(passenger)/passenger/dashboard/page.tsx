'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/context/auth-context'
import { useBooking } from '@/lib/context/booking-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  MapPin,
  Clock,
  Ticket,
  ArrowRight,
  Calendar,
  Bus,
} from 'lucide-react'
import { indianCities } from '@/lib/data/mock-data'
import { formatDate, formatTime, formatCurrency, getStatusColor } from '@/lib/utils/format'

export default function PassengerDashboard() {
  const { user } = useAuth()
  const { getBookingsForPassenger, getRouteByTripId, getTripById, routes } = useBooking()
  const router = useRouter()

  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')

  const userBookings = user ? getBookingsForPassenger(user.id) : []
  const upcomingBookings = userBookings
    .filter((b) => b.status === 'confirmed')
    .slice(0, 3)

  const handleSearch = () => {
    if (origin && destination) {
      router.push(`/passenger/search?from=${encodeURIComponent(origin)}&to=${encodeURIComponent(destination)}`)
    }
  }

  return (
    <div className="container mx-auto space-y-8 px-4 py-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold">
          Hello, {user?.name?.split(' ')[0] || 'Traveler'}
        </h1>
        <p className="text-muted-foreground">Where would you like to go today?</p>
      </div>

      {/* Quick Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-emerald-600" />
            Search Buses
          </CardTitle>
          <CardDescription>Find and book buses across India</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="origin">From</Label>
              <Select value={origin} onValueChange={setOrigin}>
                <SelectTrigger id="origin">
                  <SelectValue placeholder="Select origin city" />
                </SelectTrigger>
                <SelectContent>
                  {indianCities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="destination">To</Label>
              <Select value={destination} onValueChange={setDestination}>
                <SelectTrigger id="destination">
                  <SelectValue placeholder="Select destination" />
                </SelectTrigger>
                <SelectContent>
                  {indianCities.filter((c) => c !== origin).map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            onClick={handleSearch}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
            disabled={!origin || !destination}
          >
            <Search className="mr-2 h-4 w-4" />
            Search Buses
          </Button>
        </CardContent>
      </Card>

      {/* Upcoming Bookings */}
      {upcomingBookings.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Upcoming Trips</h2>
            <Link
              href="/passenger/bookings"
              className="text-sm text-emerald-600 hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {upcomingBookings.map((booking) => {
              const trip = getTripById(booking.tripId)
              const route = getRouteByTripId(booking.tripId)
              if (!trip || !route) return null

              return (
                <Card key={booking.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(trip.departureTime)}
                          </span>
                        </div>
                        <p className="font-medium">
                          {route.origin.name} → {route.destination.name}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {formatTime(trip.departureTime)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Ticket className="h-3.5 w-3.5" />
                            Seat {booking.seatNumbers.join(', ')}
                          </span>
                        </div>
                      </div>
                      {trip.status === 'in-progress' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                          onClick={() => router.push(`/passenger/track/${trip.id}`)}
                        >
                          <MapPin className="mr-1 h-4 w-4" />
                          Track
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>
      )}

      {/* Popular Routes */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Popular Routes</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {routes.slice(0, 4).map((route) => (
            <Card
              key={route.id}
              className="cursor-pointer transition-all hover:shadow-md"
              onClick={() =>
                router.push(
                  `/passenger/search?from=${encodeURIComponent(route.origin.name)}&to=${encodeURIComponent(route.destination.name)}`
                )
              }
            >
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                    <Bus className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {route.origin.name}
                      <ArrowRight className="mx-1 inline h-3 w-3 text-muted-foreground" />
                      {route.destination.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {route.distance} km • ~{Math.floor(route.estimatedDuration / 60)}h{' '}
                      {route.estimatedDuration % 60}m
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-emerald-600">
                    {formatCurrency(route.baseFare)}
                  </p>
                  <p className="text-xs text-muted-foreground">onwards</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Button
            variant="outline"
            className="h-auto flex-col gap-2 py-4"
            onClick={() => router.push('/passenger/search')}
          >
            <Search className="h-5 w-5 text-emerald-600" />
            <span className="text-xs">Search</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto flex-col gap-2 py-4"
            onClick={() => router.push('/passenger/bookings')}
          >
            <Ticket className="h-5 w-5 text-emerald-600" />
            <span className="text-xs">My Bookings</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto flex-col gap-2 py-4"
            disabled
          >
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <span className="text-xs">Schedule</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto flex-col gap-2 py-4"
            disabled
          >
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <span className="text-xs">Nearby</span>
          </Button>
        </div>
      </section>
    </div>
  )
}
