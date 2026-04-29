'use client'

import { useMemo, useState } from 'react'
import { useBooking } from '@/lib/context/booking-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Search, Ticket, IndianRupee, Users, Clock } from 'lucide-react'
import { formatCurrency, formatDate, formatRelativeTime, getStatusColor } from '@/lib/utils/format'

export default function AdminBookingsPage() {
  const { bookings, getTripById, getRouteByTripId } = useBooking()
  const [searchQuery, setSearchQuery] = useState('')

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const trip = getTripById(booking.tripId)
      const route = getRouteByTripId(booking.tripId)

      const haystack = [
        booking.id,
        booking.passengerName,
        booking.passengerPhone,
        booking.boardingStop,
        booking.droppingStop,
        route?.name,
        route?.origin.name,
        route?.destination.name,
        trip?.id,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return haystack.includes(searchQuery.toLowerCase())
    })
  }, [bookings, getTripById, getRouteByTripId, searchQuery])

  const confirmedCount = bookings.filter((booking) => booking.status === 'confirmed').length
  const cancelledCount = bookings.filter((booking) => booking.status === 'cancelled').length
  const totalRevenue = bookings
    .filter((booking) => booking.status !== 'cancelled')
    .reduce((sum, booking) => sum + booking.totalFare, 0)

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Bookings</h1>
        <p className="text-muted-foreground">View passenger bookings across all trips</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/30">
              <Ticket className="h-6 w-6 text-violet-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{bookings.length}</p>
              <p className="text-sm text-muted-foreground">Total Bookings</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <Users className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{confirmedCount}</p>
              <p className="text-sm text-muted-foreground">Confirmed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
              <IndianRupee className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
              <p className="text-sm text-muted-foreground">{cancelledCount} cancelled</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by booking, passenger, phone, route, or stop..."
              className="pl-9"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
          <CardDescription>{filteredBookings.length} bookings found</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking</TableHead>
                <TableHead>Passenger</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Travel</TableHead>
                <TableHead>Fare</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    No bookings found
                  </TableCell>
                </TableRow>
              ) : (
                filteredBookings.map((booking) => {
                  const trip = getTripById(booking.tripId)
                  const route = getRouteByTripId(booking.tripId)

                  return (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{booking.id}</p>
                          <p className="text-xs text-muted-foreground">
                            Booked {formatRelativeTime(booking.bookedAt)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{booking.passengerName || 'Passenger'}</p>
                          <p className="text-xs text-muted-foreground">{booking.passengerPhone || '-'}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{route?.name || booking.tripId}</p>
                          <p className="text-xs text-muted-foreground">
                            {route ? `${route.origin.name} → ${route.destination.name}` : 'Route unavailable'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{booking.boardingStop}</p>
                          <p className="text-xs text-muted-foreground">{booking.droppingStop}</p>
                          {trip && (
                            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {formatDate(trip.departureTime)}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{formatCurrency(booking.totalFare)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
