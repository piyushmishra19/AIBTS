'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/auth-context'
import { useBooking } from '@/lib/context/booking-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { SeatPicker } from '@/components/booking/seat-picker'
import {
  ArrowLeft,
  Clock,
  MapPin,
  Calendar,
  CreditCard,
  CheckCircle,
  Bus,
  Building2,
} from 'lucide-react'
import { mockBuses, getRouteFare, busTypeLabels } from '@/lib/data/mock-data'
import { getOperatorById } from '@/lib/data/operators'
import { formatTime, formatDate, formatDuration, formatCurrency, formatSeatNumbers } from '@/lib/utils/format'
import Link from 'next/link'

interface BookingPageProps {
  params: Promise<{ tripId: string }>
}

export default function BookingPage({ params }: BookingPageProps) {
  const { tripId } = use(params)
  const router = useRouter()
  const { user } = useAuth()
  const {
    getTripById,
    getRouteById,
    getAvailableSeats,
    getBookingsForTrip,
    addBooking,
  } = useBooking()

  const trip = getTripById(tripId)
  const route = trip ? getRouteById(trip.routeId) : undefined
  const bus = trip ? mockBuses.find((b) => b.id === trip.busId) : undefined

  const [selectedSeats, setSelectedSeats] = useState<number[]>([])
  const [boardingStop, setBoardingStop] = useState('')
  const [droppingStop, setDroppingStop] = useState('')
  const [isBooking, setIsBooking] = useState(false)
  const [bookingComplete, setBookingComplete] = useState(false)
  const [bookingId, setBookingId] = useState<string | null>(null)

  if (!trip || !route || !bus) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Bus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 font-semibold">Trip not found</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              This trip may no longer be available
            </p>
            <Button asChild>
              <Link href="/passenger/search">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Search
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Get booked seats for this trip
  const tripBookings = getBookingsForTrip(trip.id)
  const bookedSeats = tripBookings.flatMap((b) => b.seatNumbers)
  const availableSeats = getAvailableSeats(trip.id, bus.capacity)

  const operator = route ? getOperatorById(route.operatorId) : undefined
  const seatFare = route && bus ? getRouteFare(route, bus.busType) : 0

  const handleSeatSelect = (seatNumber: number) => {
    setSelectedSeats((prev) =>
      prev.includes(seatNumber)
        ? prev.filter((s) => s !== seatNumber)
        : [...prev, seatNumber]
    )
  }

  const totalFare = selectedSeats.length * seatFare

  const handleBooking = async () => {
    if (!user || selectedSeats.length === 0 || !boardingStop || !droppingStop) return

    try {
      setIsBooking(true)

      const booking = await addBooking({
        passengerId: user.id,
        tripId: trip.id,
        seatNumbers: selectedSeats,
        status: 'confirmed',
        totalFare,
        boardingStop,
        droppingStop,
        passengerName: user.name,
        passengerPhone: user.phone,
      })

      setBookingId(booking.id)
      setBookingComplete(true)
    } finally {
      setIsBooking(false)
    }
  }

  if (bookingComplete) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="mx-auto max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Booking Confirmed!</h3>
            <p className="mb-6 text-center text-sm text-muted-foreground">
              Your booking ID is <span className="font-mono font-semibold">{bookingId}</span>
            </p>

            <Card className="mb-6 w-full bg-muted/30">
              <CardContent className="p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Route</span>
                    <span className="font-medium">{route.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium">{formatDate(trip.departureTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time</span>
                    <span className="font-medium">{formatTime(trip.departureTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Seats</span>
                    <span className="font-medium">{formatSeatNumbers(selectedSeats)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-emerald-600">{formatCurrency(totalFare)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex w-full gap-3">
              <Button asChild variant="outline" className="flex-1">
                <Link href="/passenger/bookings">View Bookings</Link>
              </Button>
              <Button asChild className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                <Link href="/passenger/dashboard">Go Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto space-y-6 px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">Book Your Seat</h1>
          <p className="text-sm text-muted-foreground">{route.name}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Main Content */}
        <div className="space-y-6">
          {/* Trip Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Trip Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-xl font-bold">{formatTime(trip.departureTime)}</p>
                  <p className="text-sm text-muted-foreground">{route.origin.name}</p>
                </div>
                <div className="flex flex-1 flex-col items-center">
                  <div className="flex w-full items-center gap-2">
                    <div className="h-0.5 flex-1 bg-border" />
                    <Badge variant="outline">
                      <Clock className="mr-1 h-3 w-3" />
                      {formatDuration(route.estimatedDuration)}
                    </Badge>
                    <div className="h-0.5 flex-1 bg-border" />
                  </div>
                  <p className="text-xs text-muted-foreground">{route.distance} km</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold">{formatTime(trip.arrivalTime)}</p>
                  <p className="text-sm text-muted-foreground">{route.destination.name}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">
                  <Calendar className="mr-1 h-3 w-3" />
                  {formatDate(trip.departureTime)}
                </Badge>
                <Badge variant="outline">
                  <Bus className="mr-1 h-3 w-3" />
                  {bus.model}
                </Badge>
                <Badge variant="outline">{bus.registrationNumber}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Boarding & Dropping Points */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Boarding & Dropping Points</CardTitle>
              <CardDescription>Select your pickup and drop-off locations</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Boarding Point</Label>
                <Select value={boardingStop} onValueChange={setBoardingStop}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select boarding point" />
                  </SelectTrigger>
                  <SelectContent>
                    {route.stops.slice(0, -1).map((stop) => (
                      <SelectItem key={stop.id} value={stop.name}>
                        {stop.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Dropping Point</Label>
                <Select value={droppingStop} onValueChange={setDroppingStop}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select dropping point" />
                  </SelectTrigger>
                  <SelectContent>
                    {route.stops.slice(1).map((stop) => (
                      <SelectItem key={stop.id} value={stop.name}>
                        {stop.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Seat Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Seats</CardTitle>
              <CardDescription>
                {availableSeats.length} of {bus.capacity} seats available
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SeatPicker
                totalSeats={bus.capacity}
                bookedSeats={bookedSeats}
                selectedSeats={selectedSeats}
                onSeatSelect={handleSeatSelect}
                maxSelection={6}
              />
            </CardContent>
          </Card>
        </div>

        {/* Booking Summary (Sticky on Desktop) */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Route</span>
                  <span className="font-medium">{route.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date & Time</span>
                  <span className="font-medium">
                    {formatDate(trip.departureTime)}, {formatTime(trip.departureTime)}
                  </span>
                </div>
                {boardingStop && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Boarding</span>
                    <span className="font-medium">{boardingStop}</span>
                  </div>
                )}
                {droppingStop && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dropping</span>
                    <span className="font-medium">{droppingStop}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Seats</span>
                  <span className="font-medium">
                    {selectedSeats.length > 0 ? formatSeatNumbers(selectedSeats) : 'None selected'}
                  </span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Base Fare ({selectedSeats.length} x {formatCurrency(seatFare)})
                  </span>
                  <span>{formatCurrency(totalFare)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service Fee</span>
                  <span>{formatCurrency(0)}</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span className="text-emerald-600">{formatCurrency(totalFare)}</span>
              </div>

              <Button
                onClick={handleBooking}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                disabled={selectedSeats.length === 0 || !boardingStop || !droppingStop || isBooking}
              >
                {isBooking ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Processing...
                  </span>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Pay {formatCurrency(totalFare)}
                  </>
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                By booking, you agree to our terms and conditions
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
