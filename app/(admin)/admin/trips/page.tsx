'use client'

import { useEffect, useMemo, useState } from 'react'
import { useBooking } from '@/lib/context/booking-context'
import { Plus, CalendarClock, Search, Route as RouteIcon, Bus, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getStatusColor, formatDate, formatTime } from '@/lib/utils/format'
import { allOperators } from '@/lib/data/operators'
import type { Bus, Trip, TripStatus, User } from '@/lib/types'

type NewTripFormState = {
  routeId: string
  busId: string
  driverId: string
  departureTime: string
  arrivalTime: string
  status: TripStatus
}

const initialFormState: NewTripFormState = {
  routeId: '',
  busId: '',
  driverId: '',
  departureTime: '',
  arrivalTime: '',
  status: 'scheduled',
}

export default function AdminTripsPage() {
  const { routes: routeOptions } = useBooking()
  const [trips, setTrips] = useState<Trip[]>([])
  const [buses, setBuses] = useState<Bus[]>([])
  const [drivers, setDrivers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [formData, setFormData] = useState<NewTripFormState>(initialFormState)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [tripRes, busRes, driverRes] = await Promise.all([
        fetch('/api/trips'),
        fetch('/api/buses'),
        fetch('/api/drivers'),
      ])

      const [tripData, busData, driverData] = await Promise.all([
        tripRes.json(),
        busRes.json(),
        driverRes.json(),
      ])

      if (!tripRes.ok) throw new Error(tripData.error || 'Unable to load trips')
      if (!busRes.ok) throw new Error(busData.error || 'Unable to load buses')
      if (!driverRes.ok) throw new Error(driverData.error || 'Unable to load drivers')

      setTrips(
        (tripData.trips ?? []).map((trip: Trip & { departureTime: string; arrivalTime: string }) => ({
          ...trip,
          departureTime: new Date(trip.departureTime),
          arrivalTime: new Date(trip.arrivalTime),
        }))
      )
      setBuses(busData.buses ?? [])
      setDrivers(driverData.drivers ?? [])
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load trip setup data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredBuses = useMemo(() => {
    if (!formData.routeId) return buses
    const route = routeOptions.find((item) => item.id === formData.routeId)
    return route ? buses.filter((bus) => bus.operatorId === route.operatorId) : buses
  }, [buses, formData.routeId])

  const filteredTrips = useMemo(() => {
    return trips.filter((trip) => {
      const route = routeOptions.find((item) => item.id === trip.routeId)
      const bus = buses.find((item) => item.id === trip.busId)
      const driver = drivers.find((item) => item.id === trip.driverId)
      const haystack = [
        route?.name,
        route?.origin.name,
        route?.destination.name,
        bus?.registrationNumber,
        driver?.name,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return haystack.includes(searchQuery.toLowerCase())
    })
  }, [trips, buses, drivers, searchQuery])

  const resetForm = () => setFormData(initialFormState)

  const handleRouteChange = (routeId: string) => {
    const route = routeOptions.find((item) => item.id === routeId)
    const departure = formData.departureTime ? new Date(formData.departureTime) : new Date()

    if (route) {
      const arrival = new Date(departure.getTime() + route.estimatedDuration * 60000)
      setFormData((prev) => ({
        ...prev,
        routeId,
        busId: '',
        arrivalTime: arrival.toISOString().slice(0, 16),
      }))
      return
    }

    setFormData((prev) => ({ ...prev, routeId }))
  }

  const handleDepartureChange = (departureTime: string) => {
    const route = routeOptions.find((item) => item.id === formData.routeId)
    let arrivalTime = formData.arrivalTime

    if (route && departureTime) {
      const departure = new Date(departureTime)
      const arrival = new Date(departure.getTime() + route.estimatedDuration * 60000)
      arrivalTime = arrival.toISOString().slice(0, 16)
    }

    setFormData((prev) => ({ ...prev, departureTime, arrivalTime }))
  }

  const handleCreateTrip = async () => {
    try {
      setIsSaving(true)
      setError(null)

      const response = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          routeId: formData.routeId,
          busId: formData.busId,
          driverId: formData.driverId,
          departureTime: new Date(formData.departureTime).toISOString(),
          arrivalTime: new Date(formData.arrivalTime).toISOString(),
          status: formData.status,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Unable to create trip')
      }

      await loadData()
      setIsAddDialogOpen(false)
      resetForm()
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Unable to create trip')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Trips</h1>
          <p className="text-muted-foreground">Create trips and assign them to drivers from the admin panel</p>
        </div>
        <Button
          className="bg-violet-600 hover:bg-violet-700"
          onClick={() => {
            resetForm()
            setIsAddDialogOpen(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Trip
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/30">
              <CalendarClock className="h-6 w-6 text-violet-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{trips.length}</p>
              <p className="text-sm text-muted-foreground">Total Trips</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <UserRound className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{drivers.length}</p>
              <p className="text-sm text-muted-foreground">Driver Accounts</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
              <Bus className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{buses.length}</p>
              <p className="text-sm text-muted-foreground">Available Buses</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by route, driver, or bus..."
              className="pl-9"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assigned Trips</CardTitle>
          <CardDescription>{filteredTrips.length} trips available</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Route</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Bus</TableHead>
                <TableHead>Departure</TableHead>
                <TableHead>Arrival</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    Loading trips...
                  </TableCell>
                </TableRow>
              ) : filteredTrips.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    No trips found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTrips.map((trip) => {
                  const route = routeOptions.find((item) => item.id === trip.routeId)
                  const bus = buses.find((item) => item.id === trip.busId)
                  const driver = drivers.find((item) => item.id === trip.driverId)
                  const operator = route ? allOperators.find((item) => item.id === route.operatorId) : undefined

                  return (
                    <TableRow key={trip.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{route?.name || trip.routeId}</p>
                          <p className="text-xs text-muted-foreground">{operator?.shortName || 'Operator'}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{driver?.name || trip.driverId}</p>
                          <p className="text-xs text-muted-foreground">{driver?.email || 'Driver account'}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{bus?.registrationNumber || trip.busId}</p>
                          <p className="text-xs text-muted-foreground">{bus?.model || 'Bus'}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{formatDate(trip.departureTime)}</p>
                          <p className="text-xs text-muted-foreground">{formatTime(trip.departureTime)}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{formatDate(trip.arrivalTime)}</p>
                          <p className="text-xs text-muted-foreground">{formatTime(trip.arrivalTime)}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(trip.status)}>{trip.status}</Badge>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Driver Trip</DialogTitle>
            <DialogDescription>
              Choose the route, bus, and driver account to create a new assigned trip.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="route">Route</Label>
              <Select value={formData.routeId} onValueChange={handleRouteChange}>
                <SelectTrigger id="route">
                  <SelectValue placeholder="Select route" />
                </SelectTrigger>
                <SelectContent>
                  {routeOptions.map((route) => (
                    <SelectItem key={route.id} value={route.id}>
                      {route.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bus">Bus</Label>
              <Select
                value={formData.busId}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, busId: value }))}
              >
                <SelectTrigger id="bus">
                  <SelectValue placeholder="Select bus" />
                </SelectTrigger>
                <SelectContent>
                  {filteredBuses.map((bus) => (
                    <SelectItem key={bus.id} value={bus.id}>
                      {bus.registrationNumber} - {bus.model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="driver">Driver</Label>
              <Select
                value={formData.driverId}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, driverId: value }))}
              >
                <SelectTrigger id="driver">
                  <SelectValue placeholder="Select driver account" />
                </SelectTrigger>
                <SelectContent>
                  {drivers.map((driver) => (
                    <SelectItem key={driver.id} value={driver.id}>
                      {driver.name} ({driver.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="departure">Departure</Label>
                <Input
                  id="departure"
                  type="datetime-local"
                  value={formData.departureTime}
                  onChange={(event) => handleDepartureChange(event.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="arrival">Arrival</Label>
                <Input
                  id="arrival"
                  type="datetime-local"
                  value={formData.arrivalTime}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, arrivalTime: event.target.value }))
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: TripStatus) => setFormData((prev) => ({ ...prev, status: value }))}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateTrip}
              className="bg-violet-600 hover:bg-violet-700"
              disabled={
                isSaving ||
                !formData.routeId ||
                !formData.busId ||
                !formData.driverId ||
                !formData.departureTime ||
                !formData.arrivalTime
              }
            >
              {isSaving ? 'Creating...' : 'Create Trip'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
