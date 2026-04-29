'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/auth-context'
import { useBooking } from '@/lib/context/booking-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowRight,
  Building2,
  Bus,
  CheckCircle,
  Clock,
  Landmark,
  MapPin,
  Play,
  Route,
  Users,
} from 'lucide-react'
import { busTypeLabels, mockBuses } from '@/lib/data/mock-data'
import { getOperatorById } from '@/lib/data/operators'
import { formatDate, formatDuration, formatTime, getStatusColor } from '@/lib/utils/format'
import type { Trip } from '@/lib/types'

type OperatorFilter = 'all' | 'government' | 'private'

export default function DriverTripsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { trips, routes, getBookingsForTrip } = useBooking()
  const [operatorFilter, setOperatorFilter] = useState<OperatorFilter>('all')

  const driverTrips = trips.filter((t) => t.driverId === user?.id)

  const todayTrips = driverTrips.filter((t) => {
    const tripDate = new Date(t.departureTime).toDateString()
    const today = new Date().toDateString()
    return tripDate === today
  })

  const upcomingTrips = driverTrips.filter((t) => {
    const tripDate = new Date(t.departureTime)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return tripDate > today && t.status === 'scheduled'
  })

  const pastTrips = driverTrips.filter((t) => t.status === 'completed')

  const getRouteForTrip = (routeId: string) => routes.find((r) => r.id === routeId)
  const getBusForTrip = (busId: string) => mockBuses.find((b) => b.id === busId)
  const getOperatorForTrip = (trip: Trip) => {
    const route = getRouteForTrip(trip.routeId)
    return route ? getOperatorById(route.operatorId) : undefined
  }

  const getStopSchedule = (trip: Trip) => {
    const route = getRouteForTrip(trip.routeId)
    if (!route) return []

    return route.stops.map((stop, index) => {
      const arrivalTime = new Date(new Date(trip.departureTime).getTime() + stop.arrivalOffset * 60000)
      const departureTime =
        index === route.stops.length - 1 ? null : new Date(arrivalTime.getTime() + 5 * 60000)

      return {
        id: stop.id,
        name: stop.name,
        arrivalTime,
        departureTime,
        isOrigin: index === 0,
        isDestination: index === route.stops.length - 1,
      }
    })
  }

  const filterTripsByOperatorType = (tripList: Trip[]) => {
    if (operatorFilter === 'all') return tripList
    return tripList.filter((trip) => getOperatorForTrip(trip)?.type === operatorFilter)
  }

  const filteredTodayTrips = filterTripsByOperatorType(todayTrips)
  const filteredUpcomingTrips = filterTripsByOperatorType(upcomingTrips)
  const filteredPastTrips = filterTripsByOperatorType(pastTrips)

  const governmentTripCount = driverTrips.filter(
    (trip) => getOperatorForTrip(trip)?.type === 'government'
  ).length
  const privateTripCount = driverTrips.filter((trip) => getOperatorForTrip(trip)?.type === 'private').length

  const TripCard = ({ trip }: { trip: Trip }) => {
    const route = getRouteForTrip(trip.routeId)
    const bus = getBusForTrip(trip.busId)
    const operator = getOperatorForTrip(trip)
    const passengers = getBookingsForTrip(trip.id)
    const stopSchedule = getStopSchedule(trip)

    if (!route || !bus || !operator) return null

    return (
      <Card
        className={`cursor-pointer transition-all hover:shadow-md ${
          trip.status === 'in-progress'
            ? 'border-amber-300 bg-amber-50/30 dark:border-amber-800 dark:bg-amber-950/10'
            : ''
        }`}
        onClick={() => router.push(`/driver/trip/${trip.id}`)}
      >
        <CardContent className="space-y-4 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={getStatusColor(trip.status)}>
                {trip.status === 'in-progress' ? 'Active' : trip.status}
              </Badge>
              <Badge variant="outline" className="gap-1">
                {operator.type === 'government' ? (
                  <Landmark className="h-3 w-3" />
                ) : (
                  <Building2 className="h-3 w-3" />
                )}
                {operator.type === 'government' ? 'Roadways' : 'Private Bus'}
              </Badge>
              <Badge variant="secondary">{operator.shortName}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{formatDate(trip.departureTime)}</p>
          </div>

          <div>
            <p className="text-lg font-semibold">{route.name}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Bus className="h-3.5 w-3.5" />
                {bus.model}
              </span>
              <span>•</span>
              <span>{bus.registrationNumber}</span>
              <span>•</span>
              <span>{busTypeLabels[bus.busType]}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="font-bold">{formatTime(trip.departureTime)}</p>
              <p className="text-xs text-muted-foreground">{route.origin.name}</p>
            </div>
            <div className="flex flex-1 flex-col items-center">
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">{formatDuration(route.estimatedDuration)}</p>
            </div>
            <div className="text-center">
              <p className="font-bold">{formatTime(trip.arrivalTime)}</p>
              <p className="text-xs text-muted-foreground">{route.destination.name}</p>
            </div>
          </div>

          <div className="rounded-lg border bg-muted/30 p-3">
            <div className="mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium">Arrival & departure timings</p>
            </div>
            <div className="space-y-2">
              {stopSchedule.map((stop) => (
                <div key={stop.id} className="grid grid-cols-[minmax(0,1.5fr)_88px_88px] gap-2 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{stop.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {stop.isOrigin ? 'Boarding point' : stop.isDestination ? 'Destination' : 'En-route stop'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Arrival</p>
                    <p className="font-medium">{formatTime(stop.arrivalTime)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Departure</p>
                    <p className="font-medium">
                      {stop.departureTime ? formatTime(stop.departureTime) : 'Arrives'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {passengers.reduce((sum, b) => sum + b.seatNumbers.length, 0)} passengers
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {route.stops.length} stops
              </span>
            </div>
            {trip.status === 'scheduled' && (
              <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
                <Play className="mr-1 h-3 w-3" />
                Start
              </Button>
            )}
            {trip.status === 'in-progress' && (
              <Button size="sm" variant="outline" className="border-amber-300 text-amber-600">
                <MapPin className="mr-1 h-3 w-3" />
                View
              </Button>
            )}
            {trip.status === 'completed' && <CheckCircle className="h-5 w-5 text-emerald-500" />}
          </div>
        </CardContent>
      </Card>
    )
  }

  const EmptyState = ({ message }: { message: string }) => (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Route className="mb-4 h-12 w-12 text-muted-foreground/50" />
        <p className="text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  )

  return (
    <div className="container mx-auto space-y-6 px-4 py-6">
      <div>
        <h1 className="text-2xl font-bold">My Trips</h1>
        <p className="text-muted-foreground">View and manage your assigned roadways and private bus trips</p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total assigned</CardDescription>
            <CardTitle>{driverTrips.length} trips</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Roadways buses</CardDescription>
            <CardTitle>{governmentTripCount} trips</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Private buses</CardDescription>
            <CardTitle>{privateTripCount} trips</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant={operatorFilter === 'all' ? 'default' : 'outline'} onClick={() => setOperatorFilter('all')}>
          All Trips
        </Button>
        <Button
          variant={operatorFilter === 'government' ? 'default' : 'outline'}
          onClick={() => setOperatorFilter('government')}
        >
          Roadways
        </Button>
        <Button
          variant={operatorFilter === 'private' ? 'default' : 'outline'}
          onClick={() => setOperatorFilter('private')}
        >
          Private Bus
        </Button>
      </div>

      <Tabs defaultValue="today" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="today" className="gap-2">
            Today
            {todayTrips.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {todayTrips.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="gap-2">
            Upcoming
            {upcomingTrips.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {upcomingTrips.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="past" className="gap-2">
            Past
            {pastTrips.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {pastTrips.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          {filteredTodayTrips.length === 0 ? (
            <EmptyState message="No matching trips scheduled for today" />
          ) : (
            filteredTodayTrips
              .sort((a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime())
              .map((trip) => <TripCard key={trip.id} trip={trip} />)
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          {filteredUpcomingTrips.length === 0 ? (
            <EmptyState message="No matching upcoming trips scheduled" />
          ) : (
            filteredUpcomingTrips
              .sort((a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime())
              .map((trip) => <TripCard key={trip.id} trip={trip} />)
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {filteredPastTrips.length === 0 ? (
            <EmptyState message="No matching completed trips yet" />
          ) : (
            filteredPastTrips
              .sort((a, b) => new Date(b.departureTime).getTime() - new Date(a.departureTime).getTime())
              .slice(0, 10)
              .map((trip) => <TripCard key={trip.id} trip={trip} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
