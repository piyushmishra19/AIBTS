'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useBooking } from '@/lib/context/booking-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { BusMap } from '@/components/maps/bus-map'
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
  ArrowLeft,
  Clock,
  MapPin,
  Users,
  Play,
  Square,
  CheckCircle,
  Phone,
  Navigation,
  AlertTriangle,
  ChevronRight,
  Bus,
} from 'lucide-react'
import { mockBuses } from '@/lib/data/mock-data'
import { formatTime, formatDate, formatDuration, getStatusColor, formatSeatNumbers } from '@/lib/utils/format'

interface TripPageProps {
  params: Promise<{ tripId: string }>
}

export default function DriverTripPage({ params }: TripPageProps) {
  const { tripId } = use(params)
  const router = useRouter()
  const { getTripById, getRouteById, getBookingsForTrip } = useBooking()

  const trip = getTripById(tripId)
  const route = trip ? getRouteById(trip.routeId) : undefined
  const bus = trip ? mockBuses.find((b) => b.id === trip.busId) : undefined
  const bookings = trip ? getBookingsForTrip(trip.id) : []

  const [currentStopIndex, setCurrentStopIndex] = useState(trip?.currentStopIndex || 0)
  const [tripStatus, setTripStatus] = useState(trip?.status || 'scheduled')
  const [showStartDialog, setShowStartDialog] = useState(false)
  const [showEndDialog, setShowEndDialog] = useState(false)
  const [showEmergencyDialog, setShowEmergencyDialog] = useState(false)

  if (!trip || !route || !bus) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bus className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="mb-2 font-semibold">Trip not found</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              This trip may no longer be available
            </p>
            <Button asChild>
              <Link href="/driver/trips">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Trips
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleStartTrip = () => {
    setTripStatus('in-progress')
    setShowStartDialog(false)
  }

  const handleEndTrip = () => {
    setTripStatus('completed')
    setShowEndDialog(false)
  }

  const handleMarkArrival = () => {
    if (currentStopIndex < route.stops.length - 1) {
      setCurrentStopIndex((prev) => prev + 1)
    }
  }

  const totalPassengers = bookings.reduce((sum, b) => sum + b.seatNumbers.length, 0)

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b bg-card px-4 py-3">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-semibold">{route.name}</h1>
              <p className="text-sm text-muted-foreground">
                {bus.registrationNumber} • {formatDate(trip.departureTime)}
              </p>
            </div>
          </div>
          <Badge className={getStatusColor(tripStatus)}>
            {tripStatus === 'in-progress' ? 'Active' : tripStatus}
          </Badge>
        </div>
      </div>

      <div className="container mx-auto space-y-6 px-4 py-6">
        {/* Trip Controls */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                  <Navigation className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold">
                    {tripStatus === 'scheduled' && 'Ready to Start'}
                    {tripStatus === 'in-progress' && `At ${route.stops[currentStopIndex].name}`}
                    {tripStatus === 'completed' && 'Trip Completed'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {tripStatus === 'scheduled' && `Departs at ${formatTime(trip.departureTime)}`}
                    {tripStatus === 'in-progress' && `Stop ${currentStopIndex + 1} of ${route.stops.length}`}
                    {tripStatus === 'completed' && 'All passengers dropped off'}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                {tripStatus === 'scheduled' && (
                  <Button
                    className="bg-amber-600 hover:bg-amber-700"
                    onClick={() => setShowStartDialog(true)}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Start Trip
                  </Button>
                )}
                {tripStatus === 'in-progress' && (
                  <>
                    {currentStopIndex < route.stops.length - 1 ? (
                      <Button
                        variant="outline"
                        onClick={handleMarkArrival}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark Arrival
                      </Button>
                    ) : (
                      <Button
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => setShowEndDialog(true)}
                      >
                        <Square className="mr-2 h-4 w-4" />
                        End Trip
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Map (for in-progress trips) */}
        {tripStatus === 'in-progress' && (
          <Card className="overflow-hidden">
            <div className="h-[300px]">
              <BusMap
                stops={route.stops}
                currentLocation={trip.currentLocation || { lat: route.stops[currentStopIndex].lat, lng: route.stops[currentStopIndex].lng }}
                currentStopIndex={currentStopIndex}
                className="h-full w-full"
              />
            </div>
          </Card>
        )}

        {/* Stops Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5 text-amber-600" />
              Route Stops
            </CardTitle>
            <CardDescription>
              {currentStopIndex + 1} of {route.stops.length} stops
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {route.stops.map((stop, index) => (
              <div
                key={stop.id}
                className={`flex items-center gap-3 rounded-lg p-3 ${
                  index === currentStopIndex
                    ? 'bg-amber-100 dark:bg-amber-900/30'
                    : index < currentStopIndex
                      ? 'bg-emerald-50 dark:bg-emerald-950/20'
                      : 'bg-muted/50'
                }`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    index < currentStopIndex
                      ? 'bg-emerald-500 text-white'
                      : index === currentStopIndex
                        ? 'bg-amber-500 text-white'
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {index < currentStopIndex ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{stop.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {index === 0 ? 'Departure' : `+${stop.arrivalOffset} min`}
                  </p>
                </div>
                {index === currentStopIndex && tripStatus === 'in-progress' && (
                  <Badge className="bg-amber-100 text-amber-700">Current</Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Passengers List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-amber-600" />
              Passengers
            </CardTitle>
            <CardDescription>
              {totalPassengers} passengers booked
            </CardDescription>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <p className="py-4 text-center text-muted-foreground">
                No passengers booked for this trip
              </p>
            ) : (
              <div className="space-y-3">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        <Users className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{booking.passengerName || 'Passenger'}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatSeatNumbers(booking.seatNumbers)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right text-sm">
                        <p className="text-muted-foreground">
                          {booking.boardingStop}
                        </p>
                        <p className="flex items-center gap-1 text-muted-foreground">
                          <ChevronRight className="h-3 w-3" />
                          {booking.droppingStop}
                        </p>
                      </div>
                      {booking.passengerPhone && (
                        <Button variant="ghost" size="icon" asChild>
                          <a href={`tel:${booking.passengerPhone}`}>
                            <Phone className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Emergency Button */}
        <Button
          variant="destructive"
          className="w-full"
          onClick={() => setShowEmergencyDialog(true)}
        >
          <AlertTriangle className="mr-2 h-4 w-4" />
          Emergency / Report Issue
        </Button>
      </div>

      {/* Start Trip Dialog */}
      <AlertDialog open={showStartDialog} onOpenChange={setShowStartDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start Trip?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the trip as in-progress. Make sure you&apos;re ready to depart from{' '}
              {route.origin.name}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStartTrip}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Start Trip
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* End Trip Dialog */}
      <AlertDialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End Trip?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the trip as completed. Make sure all passengers have been dropped off
              at {route.destination.name}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEndTrip}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              End Trip
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Emergency Dialog */}
      <AlertDialog open={showEmergencyDialog} onOpenChange={setShowEmergencyDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Emergency Contact</AlertDialogTitle>
            <AlertDialogDescription>
              For emergencies, please contact our 24/7 helpline or call local emergency services.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 py-4">
            <Button variant="outline" className="w-full justify-start" asChild>
              <a href="tel:1800-xxx-xxxx">
                <Phone className="mr-2 h-4 w-4" />
                Helpline: 1800-XXX-XXXX
              </a>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <a href="tel:112">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Emergency: 112
              </a>
            </Button>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
