'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/auth-context'
import { useBooking } from '@/lib/context/booking-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatCard } from '@/components/dashboard/stat-card'
import {
  Route,
  Users,
  Clock,
  MapPin,
  Play,
  CheckCircle,
  Calendar,
  TrendingUp,
  Bus,
} from 'lucide-react'
import { mockBuses, mockUsers } from '@/lib/data/mock-data'
import { formatTime, formatDate, getStatusColor, formatDuration } from '@/lib/utils/format'

export default function DriverDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const { trips, routes, getBookingsForTrip } = useBooking()

  // Get driver's trips
  const driverTrips = trips.filter((t) => t.driverId === user?.id)
  const todayTrips = driverTrips.filter((t) => {
    const tripDate = new Date(t.departureTime).toDateString()
    const today = new Date().toDateString()
    return tripDate === today
  })

  const activeTrip = todayTrips.find((t) => t.status === 'in-progress')
  const upcomingTrips = todayTrips.filter((t) => t.status === 'scheduled')
  const completedTrips = todayTrips.filter((t) => t.status === 'completed')

  // Stats
  const totalPassengersToday = todayTrips.reduce((acc, trip) => {
    return acc + getBookingsForTrip(trip.id).reduce((sum, b) => sum + b.seatNumbers.length, 0)
  }, 0)

  const getRouteForTrip = (routeId: string) => routes.find((r) => r.id === routeId)
  const getBusForTrip = (busId: string) => mockBuses.find((b) => b.id === busId)

  return (
    <div className="container mx-auto space-y-6 px-4 py-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold">
          Welcome back, {user?.name?.split(' ')[0] || 'Driver'}
        </h1>
        <p className="text-muted-foreground">Here&apos;s your schedule for today</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Today&apos;s Trips"
          value={todayTrips.length}
          subtitle={`${completedTrips.length} completed`}
          icon={Route}
          iconClassName="bg-amber-500"
        />
        <StatCard
          title="Total Passengers"
          value={totalPassengersToday}
          subtitle="Across all trips"
          icon={Users}
          iconClassName="bg-blue-500"
        />
        <StatCard
          title="Upcoming"
          value={upcomingTrips.length}
          subtitle={upcomingTrips.length > 0 ? `Next at ${formatTime(upcomingTrips[0].departureTime)}` : 'No more trips'}
          icon={Clock}
          iconClassName="bg-emerald-500"
        />
        <StatCard
          title="Status"
          value={activeTrip ? 'On Route' : 'Available'}
          subtitle={activeTrip ? 'Trip in progress' : 'Ready for next trip'}
          icon={TrendingUp}
          iconClassName={activeTrip ? 'bg-emerald-500' : 'bg-gray-500'}
        />
      </div>

      {/* Active Trip Card */}
      {activeTrip && (
        <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-5 w-5 text-amber-600" />
                Active Trip
              </CardTitle>
              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                In Progress
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {(() => {
              const route = getRouteForTrip(activeTrip.routeId)
              const bus = getBusForTrip(activeTrip.busId)
              const passengers = getBookingsForTrip(activeTrip.id)
              if (!route || !bus) return null

              return (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-semibold">{route.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {bus.model} • {bus.registrationNumber}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{passengers.length} passengers</p>
                      <p className="text-sm text-muted-foreground">
                        Stop {activeTrip.currentStopIndex + 1}/{route.stops.length}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Started at {formatTime(activeTrip.departureTime)}</span>
                    <span>•</span>
                    <span>ETA: {formatTime(activeTrip.arrivalTime)}</span>
                  </div>
                  <Button
                    className="w-full bg-amber-600 hover:bg-amber-700"
                    onClick={() => router.push(`/driver/trip/${activeTrip.id}`)}
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    View Trip Details
                  </Button>
                </>
              )
            })()}
          </CardContent>
        </Card>
      )}

      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-amber-600" />
            Today&apos;s Schedule
          </CardTitle>
          <CardDescription>
            {formatDate(new Date())} • {todayTrips.length} trips assigned
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {todayTrips.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Bus className="mb-2 h-12 w-12 text-muted-foreground/50" />
              <p className="text-muted-foreground">No trips assigned for today</p>
            </div>
          ) : (
            todayTrips.map((trip) => {
              const route = getRouteForTrip(trip.routeId)
              const bus = getBusForTrip(trip.busId)
              const passengers = getBookingsForTrip(trip.id)
              if (!route || !bus) return null

              return (
                <Card
                  key={trip.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    trip.status === 'in-progress' ? 'border-amber-300 bg-amber-50/30 dark:border-amber-800 dark:bg-amber-950/10' : ''
                  }`}
                  onClick={() => router.push(`/driver/trip/${trip.id}`)}
                >
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-muted">
                        <span className="text-sm font-bold">{formatTime(trip.departureTime)}</span>
                      </div>
                      <div>
                        <p className="font-medium">{route.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {bus.registrationNumber} • {passengers.length} passengers
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(trip.status)}>
                        {trip.status === 'in-progress' ? 'Active' : trip.status}
                      </Badge>
                      {trip.status === 'scheduled' && (
                        <Button size="sm" variant="outline">
                          <Play className="mr-1 h-3 w-3" />
                          Start
                        </Button>
                      )}
                      {trip.status === 'completed' && (
                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Button
          variant="outline"
          className="h-auto flex-col gap-2 py-4"
          onClick={() => router.push('/driver/trips')}
        >
          <Route className="h-5 w-5 text-amber-600" />
          <span className="text-xs">All Trips</span>
        </Button>
        <Button
          variant="outline"
          className="h-auto flex-col gap-2 py-4"
          disabled={!activeTrip}
          onClick={() => activeTrip && router.push(`/driver/trip/${activeTrip.id}`)}
        >
          <MapPin className="h-5 w-5 text-amber-600" />
          <span className="text-xs">Active Trip</span>
        </Button>
        <Button variant="outline" className="h-auto flex-col gap-2 py-4" disabled>
          <Users className="h-5 w-5 text-muted-foreground" />
          <span className="text-xs">Support</span>
        </Button>
      </div>
    </div>
  )
}
