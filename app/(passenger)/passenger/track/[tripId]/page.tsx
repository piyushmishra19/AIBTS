'use client'

import { use, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useBooking } from '@/lib/context/booking-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { BusMap } from '@/components/maps/bus-map'
import {
  ArrowLeft,
  Bus,
  CheckCircle,
  Clock,
  MapPin,
  Navigation,
  RefreshCw,
  Route,
  TimerReset,
  Wifi,
} from 'lucide-react'
import { mockBuses } from '@/lib/data/mock-data'
import { formatDuration, formatTime, getStatusColor } from '@/lib/utils/format'

interface TrackingPageProps {
  params: Promise<{ tripId: string }>
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export default function TrackingPage({ params }: TrackingPageProps) {
  const { tripId } = use(params)
  const router = useRouter()
  const { getTripById, getRouteById } = useBooking()

  const trip = getTripById(tripId)
  const route = trip ? getRouteById(trip.routeId) : undefined
  const bus = trip ? mockBuses.find((b) => b.id === trip.busId) : undefined

  const [now, setNow] = useState(() => new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 15000)
    return () => clearInterval(interval)
  }, [])

  const trackingState = useMemo(() => {
    if (!trip || !route) return null

    const departureTime = new Date(trip.departureTime)
    const arrivalTime = new Date(trip.arrivalTime)
    const totalRouteMinutes = route.stops[route.stops.length - 1]?.arrivalOffset || route.estimatedDuration
    const elapsedMinutes = clamp((now.getTime() - departureTime.getTime()) / 60000, 0, totalRouteMinutes)
    const completionPercentage = clamp((elapsedMinutes / totalRouteMinutes) * 100, 0, 100)

    if (trip.status === 'scheduled') {
      return {
        currentStopIndex: 0,
        previousStop: null,
        currentStop: route.stops[0],
        nextStop: route.stops[1],
        currentLocation: { lat: route.stops[0].lat, lng: route.stops[0].lng },
        completionPercentage: 0,
        elapsedMinutes: 0,
        minutesToNext: route.stops[1]?.arrivalOffset || 0,
        minutesToDestination: totalRouteMinutes,
        currentPhase: 'Waiting to depart',
        liveSpeed: 0,
        routeDelayMinutes: 0,
        lastReported: departureTime,
        arrivalTime,
      }
    }

    if (trip.status === 'completed') {
      const lastStop = route.stops[route.stops.length - 1]
      return {
        currentStopIndex: route.stops.length - 1,
        previousStop: route.stops[route.stops.length - 2] || null,
        currentStop: lastStop,
        nextStop: null,
        currentLocation: { lat: lastStop.lat, lng: lastStop.lng },
        completionPercentage: 100,
        elapsedMinutes: totalRouteMinutes,
        minutesToNext: 0,
        minutesToDestination: 0,
        currentPhase: 'Trip completed',
        liveSpeed: 0,
        routeDelayMinutes: 0,
        lastReported: arrivalTime,
        arrivalTime,
      }
    }

    let currentStopIndex = 0
    for (let index = 0; index < route.stops.length; index += 1) {
      if (route.stops[index].arrivalOffset <= elapsedMinutes) {
        currentStopIndex = index
      } else {
        break
      }
    }

    const currentStop = route.stops[currentStopIndex]
    const nextStop = route.stops[currentStopIndex + 1] || null
    const previousStop = currentStopIndex > 0 ? route.stops[currentStopIndex - 1] : null

    let currentLocation = { lat: currentStop.lat, lng: currentStop.lng }
    let currentPhase = `Standing at ${currentStop.name}`
    let liveSpeed = 0

    if (nextStop) {
      const currentOffset = currentStop.arrivalOffset
      const nextOffset = nextStop.arrivalOffset
      const segmentProgress = clamp((elapsedMinutes - currentOffset) / (nextOffset - currentOffset || 1), 0, 1)

      currentLocation = {
        lat: currentStop.lat + (nextStop.lat - currentStop.lat) * segmentProgress,
        lng: currentStop.lng + (nextStop.lng - currentStop.lng) * segmentProgress,
      }
      currentPhase =
        segmentProgress < 0.08
          ? `Departed ${currentStop.name}`
          : segmentProgress > 0.92
            ? `Approaching ${nextStop.name}`
            : `Running between ${currentStop.name} and ${nextStop.name}`
      liveSpeed = Math.round(38 + segmentProgress * 19)
    }

    const routeDelayMinutes = Math.round(((trip.id.length % 4) + currentStopIndex) / 2)
    const lastReported = new Date(now.getTime() - 1000 * 60 * ((trip.id.length % 3) + 1))

    return {
      currentStopIndex,
      previousStop,
      currentStop,
      nextStop,
      currentLocation,
      completionPercentage,
      elapsedMinutes,
      minutesToNext: nextStop ? Math.max(0, nextStop.arrivalOffset - elapsedMinutes) : 0,
      minutesToDestination: Math.max(0, totalRouteMinutes - elapsedMinutes),
      currentPhase,
      liveSpeed,
      routeDelayMinutes,
      lastReported,
      arrivalTime,
    }
  }, [trip, route, now])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await new Promise((resolve) => setTimeout(resolve, 700))
    setNow(new Date())
    setIsRefreshing(false)
  }

  if (!trip || !route || !bus || !trackingState) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Bus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 font-semibold">Trip not found</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              This trip may no longer be available for tracking
            </p>
            <Button asChild>
              <Link href="/passenger/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4 px-4 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-semibold">{route.name}</h1>
            <p className="text-sm text-muted-foreground">
              {bus.model} • {bus.registrationNumber}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(trip.status)}>
            {trip.status === 'in-progress' ? 'Live Tracking' : trip.status}
          </Badge>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`mr-1 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.25fr_0.85fr]">
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <div className="h-[52vh] min-h-[380px]">
              <BusMap
                stops={route.stops}
                currentLocation={trackingState.currentLocation}
                currentStopIndex={trackingState.currentStopIndex}
                className="h-full w-full"
              />
            </div>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                <span>Live Running Status</span>
                <span className="text-xs font-normal text-muted-foreground">
                  Last updated {trackingState.lastReported.toLocaleTimeString()}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl bg-emerald-50 p-4 dark:bg-emerald-950/20">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Current running status</p>
                    <p className="text-lg font-semibold">{trackingState.currentPhase}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Tracking like a live coach position view for buses
                    </p>
                  </div>
                  <div className="rounded-full bg-white/80 px-3 py-2 text-right shadow-sm dark:bg-background/70">
                    <p className="text-xs text-muted-foreground">Completion</p>
                    <p className="font-semibold">{Math.round(trackingState.completionPercentage)}%</p>
                  </div>
                </div>
                <Progress value={trackingState.completionPercentage} className="mt-4 h-2.5" />
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Last crossed</p>
                  <p className="mt-1 font-semibold">{trackingState.previousStop?.name || 'Journey start'}</p>
                </div>
                <div className="rounded-xl border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Current point</p>
                  <p className="mt-1 font-semibold">{trackingState.currentStop.name}</p>
                </div>
                <div className="rounded-xl border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Next halt</p>
                  <p className="mt-1 font-semibold">{trackingState.nextStop?.name || route.destination.name}</p>
                </div>
                <div className="rounded-xl border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Destination ETA</p>
                  <p className="mt-1 font-semibold">
                    {trackingState.minutesToDestination > 0
                      ? `${Math.round(trackingState.minutesToDestination)} min`
                      : 'Arrived'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Journey Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border p-3">
                  <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="text-xs">Current stop</span>
                  </div>
                  <p className="font-semibold">{trackingState.currentStop.name}</p>
                </div>
                <div className="rounded-xl border p-3">
                  <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                    <Navigation className="h-4 w-4" />
                    <span className="text-xs">Speed</span>
                  </div>
                  <p className="font-semibold">
                    {trackingState.liveSpeed > 0 ? `${trackingState.liveSpeed} km/h` : 'Standing'}
                  </p>
                </div>
                <div className="rounded-xl border p-3">
                  <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span className="text-xs">Next stop ETA</span>
                  </div>
                  <p className="font-semibold">
                    {trackingState.minutesToNext > 0
                      ? `${Math.round(trackingState.minutesToNext)} min`
                      : trackingState.nextStop
                        ? 'Arriving'
                        : 'Reached'}
                  </p>
                </div>
                <div className="rounded-xl border p-3">
                  <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                    <TimerReset className="h-4 w-4" />
                    <span className="text-xs">Delay</span>
                  </div>
                  <p className="font-semibold">
                    {trackingState.routeDelayMinutes > 0 ? `+${trackingState.routeDelayMinutes} min` : 'On time'}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Route timeline</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Wifi className="h-3.5 w-3.5" />
                    Auto refresh
                  </div>
                </div>
                <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
                  {route.stops.map((stop, index) => {
                    const isCompleted = index < trackingState.currentStopIndex
                    const isCurrent = index === trackingState.currentStopIndex
                    const isUpcoming = index > trackingState.currentStopIndex
                    const scheduledTime = new Date(new Date(trip.departureTime).getTime() + stop.arrivalOffset * 60000)

                    return (
                      <div
                        key={stop.id}
                        className={`rounded-xl border p-3 ${
                          isCurrent
                            ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/20'
                            : isCompleted
                              ? 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-900/50 dark:bg-emerald-950/10'
                              : 'bg-background'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div
                              className={`mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-xs ${
                                isCompleted
                                  ? 'bg-emerald-500 text-white'
                                  : isCurrent
                                    ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-500 dark:bg-emerald-900/30'
                                    : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              {isCompleted ? <CheckCircle className="h-3.5 w-3.5" /> : index + 1}
                            </div>
                            <div>
                              <p className="font-medium">{stop.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {index === 0 ? 'Origin' : index === route.stops.length - 1 ? 'Destination' : 'Intermediate stop'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatTime(scheduledTime)}</p>
                            <p className="text-xs text-muted-foreground">
                              {isCompleted ? 'Crossed' : isCurrent ? 'Live' : isUpcoming ? 'Upcoming' : ''}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Trip Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Departure</span>
                <span className="font-medium">{formatTime(trip.departureTime)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Arrival</span>
                <span className="font-medium">{formatTime(trackingState.arrivalTime)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total duration</span>
                <span className="font-medium">{formatDuration(route.estimatedDuration)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Stops covered</span>
                <span className="font-medium">
                  {trackingState.currentStopIndex + 1} / {route.stops.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Distance</span>
                <span className="font-medium">{route.distance} km</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Tracking mode</span>
                <span className="font-medium">Live route progress</span>
              </div>
              <div className="rounded-xl bg-muted/40 p-3 text-xs text-muted-foreground">
                This view updates automatically and shows current stop progress, upcoming halts, and estimated arrival in a bus-tracking format similar to live train-running screens.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
