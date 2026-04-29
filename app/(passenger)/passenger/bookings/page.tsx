'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/auth-context'
import { useBooking } from '@/lib/context/booking-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Clock,
  MapPin,
  Ticket,
  Calendar,
  X,
  ChevronRight,
  Bus,
} from 'lucide-react'
import {
  formatTime,
  formatDate,
  formatCurrency,
  formatSeatNumbers,
  getStatusColor,
  formatRelativeTime,
} from '@/lib/utils/format'
import type { Booking } from '@/lib/types'

export default function BookingsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { getBookingsForPassenger, getTripById, getRouteByTripId, cancelBooking } = useBooking()

  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null)

  const bookings = user ? getBookingsForPassenger(user.id) : []
  const upcomingBookings = bookings.filter((b) => b.status === 'confirmed')
  const pastBookings = bookings.filter((b) => b.status !== 'confirmed')

  const handleCancelBooking = async () => {
    if (cancellingBooking) {
      await cancelBooking(cancellingBooking.id)
      setCancellingBooking(null)
    }
  }

  const renderBookingCard = (booking: Booking, showCancelButton: boolean = false) => {
    const trip = getTripById(booking.tripId)
    const route = getRouteByTripId(booking.tripId)

    if (!trip || !route) return null

    return (
      <Card key={booking.id} className="overflow-hidden">
        <CardContent className="p-0">
          <div className="p-4">
            <div className="mb-3 flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(booking.status)}>
                  {booking.status}
                </Badge>
                {trip.status === 'in-progress' && (
                  <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                    <MapPin className="mr-1 h-3 w-3" />
                    Live
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Booked {formatRelativeTime(booking.bookedAt)}
              </p>
            </div>

            <div className="mb-3">
              <p className="text-lg font-semibold">
                {route.origin.name} → {route.destination.name}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(trip.departureTime)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {formatTime(trip.departureTime)}
                </span>
                <span className="flex items-center gap-1">
                  <Ticket className="h-3.5 w-3.5" />
                  {formatSeatNumbers(booking.seatNumbers)}
                </span>
              </div>
            </div>

            <div className="mb-3 rounded-lg bg-muted/50 p-3">
              <div className="flex items-center justify-between text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Boarding</p>
                  <p className="font-medium">{booking.boardingStop}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Dropping</p>
                  <p className="font-medium">{booking.droppingStop}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Fare</p>
                <p className="text-lg font-bold text-emerald-600">
                  {formatCurrency(booking.totalFare)}
                </p>
              </div>
              <div className="flex gap-2">
                {trip.status === 'in-progress' && booking.status === 'confirmed' && (
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
                {showCancelButton && booking.status === 'confirmed' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                    onClick={() => setCancellingBooking(booking)}
                  >
                    <X className="mr-1 h-4 w-4" />
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="border-t bg-muted/30 px-4 py-2">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">Booking ID:</span> {booking.id}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const EmptyState = ({ message }: { message: string }) => (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Ticket className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mb-2 font-semibold">No bookings found</h3>
        <p className="mb-4 text-center text-sm text-muted-foreground">{message}</p>
        <Button
          className="bg-emerald-600 hover:bg-emerald-700"
          onClick={() => router.push('/passenger/search')}
        >
          <Bus className="mr-2 h-4 w-4" />
          Search Buses
        </Button>
      </CardContent>
    </Card>
  )

  return (
    <div className="container mx-auto space-y-6 px-4 py-6">
      <div>
        <h1 className="text-2xl font-bold">My Bookings</h1>
        <p className="text-muted-foreground">View and manage your bus bookings</p>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upcoming" className="gap-2">
            Upcoming
            {upcomingBookings.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {upcomingBookings.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="past" className="gap-2">
            Past
            {pastBookings.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {pastBookings.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingBookings.length === 0 ? (
            <EmptyState message="You don't have any upcoming trips. Book a bus to get started!" />
          ) : (
            upcomingBookings.map((booking) => renderBookingCard(booking, true))
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastBookings.length === 0 ? (
            <EmptyState message="Your past bookings will appear here." />
          ) : (
            pastBookings.map((booking) => renderBookingCard(booking, false))
          )}
        </TabsContent>
      </Tabs>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog
        open={!!cancellingBooking}
        onOpenChange={() => setCancellingBooking(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone.
              {cancellingBooking && (
                <span className="mt-2 block font-medium">
                  Booking ID: {cancellingBooking.id}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Booking</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelBooking}
              className="bg-red-600 hover:bg-red-700"
            >
              Cancel Booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
