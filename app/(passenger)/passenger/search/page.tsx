'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useBooking } from '@/lib/context/booking-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search,
  Clock,
  MapPin,
  Users,
  Wifi,
  Snowflake,
  Plug,
  Droplet,
  Bed,
  Monitor,
  Cookie,
  ArrowRight,
  Calendar,
  Building2,
  Bus,
  Filter,
} from 'lucide-react'
import { indianCities, mockBuses, busTypeLabels, getRouteFare } from '@/lib/data/mock-data'
import { allOperators, getOperatorById } from '@/lib/data/operators'
import { formatTime, formatDuration, formatCurrency } from '@/lib/utils/format'
import type { Trip, Route, Bus as BusType, OperatorType } from '@/lib/types'

const amenityIcons: Record<string, React.ElementType> = {
  'WiFi': Wifi,
  'AC': Snowflake,
  'Charging Points': Plug,
  'Water Bottle': Droplet,
  'Blanket': Bed,
  'Entertainment': Monitor,
  'Snacks': Cookie,
}

function SearchContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { searchTrips, getRouteById, routes } = useBooking()

  const initialFrom = searchParams.get('from') || ''
  const initialTo = searchParams.get('to') || ''

  const [origin, setOrigin] = useState(initialFrom)
  const [destination, setDestination] = useState(initialTo)
  const [operatorTypeFilter, setOperatorTypeFilter] = useState<'all' | OperatorType>('all')
  const [busTypeFilter, setBusTypeFilter] = useState<string>('all')
  const [searchResults, setSearchResults] = useState<Array<{ trip: Trip; route: Route; bus: BusType }>>([])
  const [hasSearched, setHasSearched] = useState(false)

  // Auto-search if params are provided
  useEffect(() => {
    if (initialFrom && initialTo) {
      handleSearch(initialFrom, initialTo)
    }
  }, [initialFrom, initialTo])

  const handleSearch = (from: string = origin, to: string = destination) => {
    if (!from || !to) return

    const today = new Date()
    const trips = searchTrips(from, to, today)

    const results = trips.map((trip) => {
      const route = getRouteById(trip.routeId)
      const bus = mockBuses.find((b) => b.id === trip.busId)
      return { trip, route: route!, bus: bus! }
    }).filter((r) => r.route && r.bus)

    setSearchResults(results)
    setHasSearched(true)
  }

  // Filter results based on operator type and bus type
  const filteredResults = searchResults.filter(({ route, bus }) => {
    const operator = getOperatorById(route.operatorId)
    if (operatorTypeFilter !== 'all' && operator?.type !== operatorTypeFilter) {
      return false
    }
    if (busTypeFilter !== 'all' && bus.busType !== busTypeFilter) {
      return false
    }
    return true
  })

  const handleBookClick = (tripId: string) => {
    router.push(`/passenger/book/${tripId}`)
  }

  // Get unique bus types from results for filter
  const availableBusTypes = [...new Set(searchResults.map(r => r.bus.busType))]

  return (
    <div className="container mx-auto space-y-6 px-4 py-6">
      <div>
        <h1 className="text-2xl font-bold">Search Buses</h1>
        <p className="text-muted-foreground">Find government roadways and private buses across India</p>
      </div>

      {/* Search Form */}
      <Card>
        <CardContent className="p-4">
          <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
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
            <div className="flex items-end">
              <Button
                onClick={() => handleSearch()}
                className="w-full bg-emerald-600 hover:bg-emerald-700 sm:w-auto"
                disabled={!origin || !destination}
              >
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {hasSearched && (
        <div className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Filters:</span>
                </div>
                <Select value={operatorTypeFilter} onValueChange={(v) => setOperatorTypeFilter(v as 'all' | OperatorType)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Operator Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Operators</SelectItem>
                    <SelectItem value="government">
                      <span className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        State Roadways
                      </span>
                    </SelectItem>
                    <SelectItem value="private">
                      <span className="flex items-center gap-2">
                        <Bus className="h-4 w-4" />
                        Private Buses
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {availableBusTypes.length > 0 && (
                  <Select value={busTypeFilter} onValueChange={setBusTypeFilter}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Bus Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {availableBusTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {busTypeLabels[type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <h2 className="font-semibold">
              {filteredResults.length} {filteredResults.length === 1 ? 'bus' : 'buses'} found
            </h2>
            <p className="text-sm text-muted-foreground">
              <Calendar className="mr-1 inline h-4 w-4" />
              Today
            </p>
          </div>

          {filteredResults.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mb-2 font-semibold">No buses found</h3>
                <p className="text-center text-sm text-muted-foreground">
                  Try adjusting your filters or search for a different route
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredResults.map(({ trip, route, bus }) => {
                const operator = getOperatorById(route.operatorId)
                const fare = getRouteFare(route, bus.busType)
                
                return (
                  <Card key={trip.id} className="overflow-hidden transition-all hover:shadow-md">
                    <CardContent className="p-0">
                      {/* Operator Header */}
                      <div className={`flex items-center justify-between px-4 py-2 ${
                        operator?.type === 'government' 
                          ? 'bg-blue-50 dark:bg-blue-950/30' 
                          : 'bg-orange-50 dark:bg-orange-950/30'
                      }`}>
                        <div className="flex items-center gap-2">
                          {operator?.type === 'government' ? (
                            <Building2 className="h-4 w-4 text-blue-600" />
                          ) : (
                            <Bus className="h-4 w-4 text-orange-600" />
                          )}
                          <span className={`text-sm font-semibold ${
                            operator?.type === 'government' 
                              ? 'text-blue-700 dark:text-blue-400' 
                              : 'text-orange-700 dark:text-orange-400'
                          }`}>
                            {operator?.shortName || operator?.name}
                          </span>
                          {operator?.state && (
                            <Badge variant="outline" className="text-xs">
                              {operator.state}
                            </Badge>
                          )}
                        </div>
                        <Badge className={`text-xs ${
                          operator?.type === 'government'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                            : 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300'
                        }`}>
                          {busTypeLabels[bus.busType]}
                        </Badge>
                      </div>

                      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                        {/* Time & Route */}
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-3">
                            <div className="text-center">
                              <p className="text-lg font-bold">{formatTime(trip.departureTime)}</p>
                              <p className="text-xs text-muted-foreground">{route.origin.name}</p>
                            </div>
                            <div className="flex flex-1 items-center gap-2">
                              <div className="h-0.5 flex-1 bg-border" />
                              <div className="flex flex-col items-center">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  {formatDuration(route.estimatedDuration)}
                                </span>
                              </div>
                              <div className="h-0.5 flex-1 bg-border" />
                            </div>
                            <div className="text-center">
                              <p className="text-lg font-bold">{formatTime(trip.arrivalTime)}</p>
                              <p className="text-xs text-muted-foreground">{route.destination.name}</p>
                            </div>
                          </div>

                          {/* Bus Info */}
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {bus.model}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {bus.registrationNumber}
                            </Badge>
                            {trip.status === 'in-progress' && (
                              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                <MapPin className="mr-1 h-3 w-3" />
                                Live
                              </Badge>
                            )}
                          </div>

                          {/* Amenities */}
                          <div className="mt-2 flex flex-wrap gap-2">
                            {bus.amenities.slice(0, 5).map((amenity) => {
                              const Icon = amenityIcons[amenity] || Wifi
                              return (
                                <div
                                  key={amenity}
                                  className="flex items-center gap-1 text-xs text-muted-foreground"
                                  title={amenity}
                                >
                                  <Icon className="h-3.5 w-3.5" />
                                  <span className="hidden sm:inline">{amenity}</span>
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        {/* Price & Book */}
                        <div className="flex items-center justify-between gap-4 border-t pt-4 sm:flex-col sm:items-end sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
                          <div className="text-right">
                            <p className="text-2xl font-bold text-emerald-600">
                              {formatCurrency(fare)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              <Users className="mr-1 inline h-3 w-3" />
                              {bus.capacity - (trip.passengers?.length || 0)} seats left
                            </p>
                          </div>
                          <Button
                            onClick={() => handleBookClick(trip.id)}
                            className="bg-emerald-600 hover:bg-emerald-700"
                            disabled={trip.status === 'completed' || trip.status === 'cancelled'}
                          >
                            {trip.status === 'in-progress' ? (
                              <>
                                <MapPin className="mr-1 h-4 w-4" />
                                Track & Book
                              </>
                            ) : (
                              <>
                                Book Now
                                <ArrowRight className="ml-1 h-4 w-4" />
                              </>
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Stops */}
                      <div className="border-t bg-muted/30 px-4 py-2">
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium">Stops:</span>{' '}
                          {route.stops.map((stop) => stop.name).join(' → ')}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Suggested Routes (when no search yet) */}
      {!hasSearched && (
        <>
          {/* Operator Categories */}
          <section>
            <h2 className="mb-4 text-lg font-semibold">Browse by Operator Type</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="cursor-pointer border-blue-200 bg-blue-50/50 transition-all hover:shadow-md dark:border-blue-800 dark:bg-blue-950/20">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-blue-900 dark:text-blue-100">State Roadways</p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Punjab, Haryana, UP, Rajasthan, and more
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="cursor-pointer border-orange-200 bg-orange-50/50 transition-all hover:shadow-md dark:border-orange-800 dark:bg-orange-950/20">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/50">
                    <Bus className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-orange-900 dark:text-orange-100">Private Operators</p>
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                      VRL, Hans, Zingbus, IntrCity, and more
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold">Popular Routes</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {routes.slice(0, 12).map((route) => {
                const operator = getOperatorById(route.operatorId)
                return (
                  <Card
                    key={route.id}
                    className="cursor-pointer transition-all hover:shadow-md"
                    onClick={() => {
                      setOrigin(route.origin.name)
                      setDestination(route.destination.name)
                      handleSearch(route.origin.name, route.destination.name)
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="mb-2 flex items-center gap-2">
                        {operator?.type === 'government' ? (
                          <Building2 className="h-4 w-4 text-blue-600" />
                        ) : (
                          <Bus className="h-4 w-4 text-orange-600" />
                        )}
                        <span className="text-xs font-medium text-muted-foreground">
                          {operator?.shortName}
                        </span>
                      </div>
                      <p className="font-medium">
                        {route.origin.name}
                        <ArrowRight className="mx-2 inline h-4 w-4 text-muted-foreground" />
                        {route.destination.name}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                          {route.distance} km • {formatDuration(route.estimatedDuration)}
                        </p>
                        <p className="font-bold text-emerald-600">from {formatCurrency(route.baseFare)}</p>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </section>

          {/* State Roadways List */}
          <section>
            <h2 className="mb-4 text-lg font-semibold">State Road Transport Corporations</h2>
            <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {allOperators.filter(op => op.type === 'government').slice(0, 12).map((operator) => (
                <div
                  key={operator.id}
                  className="flex items-center gap-2 rounded-lg border p-3 text-sm"
                >
                  <Building2 className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="font-medium">{operator.shortName}</p>
                    <p className="text-xs text-muted-foreground">{operator.state}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}
