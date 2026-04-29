'use client'

import { useEffect, useMemo, useState } from 'react'
import { useBooking } from '@/lib/context/booking-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Pencil,
  MapPin,
  Clock,
  IndianRupee,
} from 'lucide-react'
import { formatCurrency, formatDuration } from '@/lib/utils/format'
import { allOperators } from '@/lib/data/operators'
import type { Route } from '@/lib/types'

type RouteFormState = {
  operatorId: string
  name: string
  originName: string
  originLat: string
  originLng: string
  destinationName: string
  destinationLat: string
  destinationLng: string
  distance: string
  estimatedDuration: string
  baseFare: string
  stopsText: string
}

const initialFormState: RouteFormState = {
  operatorId: '',
  name: '',
  originName: '',
  originLat: '',
  originLng: '',
  destinationName: '',
  destinationLat: '',
  destinationLng: '',
  distance: '',
  estimatedDuration: '',
  baseFare: '',
  stopsText: '',
}

export default function AdminRoutesPage() {
  const { routes: contextRoutes } = useBooking()
  const [routes, setRoutes] = useState<Route[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [viewingRoute, setViewingRoute] = useState<Route | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [formData, setFormData] = useState<RouteFormState>(initialFormState)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadRoutes = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/routes')
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Unable to load routes')
      }

      setRoutes(data.routes ?? [])
    } catch (loadError) {
      setRoutes(contextRoutes)
      setError(loadError instanceof Error ? loadError.message : 'Unable to load routes')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadRoutes()
  }, [])

  const filteredRoutes = useMemo(() => {
    return routes.filter((route) =>
      route.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.origin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.destination.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [routes, searchQuery])

  const resetForm = () => setFormData(initialFormState)

  const handleCreateRoute = async () => {
    try {
      setIsSaving(true)
      setError(null)

      const stopNames = formData.stopsText
        .split('\n')
        .map((name) => name.trim())
        .filter(Boolean)

      const response = await fetch('/api/routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operatorId: formData.operatorId,
          name: formData.name,
          origin: {
            name: formData.originName,
            lat: formData.originLat,
            lng: formData.originLng,
          },
          destination: {
            name: formData.destinationName,
            lat: formData.destinationLat,
            lng: formData.destinationLng,
          },
          distance: formData.distance,
          estimatedDuration: formData.estimatedDuration,
          baseFare: formData.baseFare,
          stopNames,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Unable to create route')
      }

      await loadRoutes()
      setIsAddDialogOpen(false)
      resetForm()
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Unable to create route')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Routes</h1>
          <p className="text-muted-foreground">Manage bus routes and schedules</p>
        </div>
        <Button
          className="bg-violet-600 hover:bg-violet-700"
          onClick={() => {
            resetForm()
            setIsAddDialogOpen(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Route
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search routes..."
              className="pl-9"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:hidden">
        {isLoading ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">Loading routes...</CardContent>
          </Card>
        ) : filteredRoutes.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">No routes found</CardContent>
          </Card>
        ) : (
          filteredRoutes.map((route) => (
            <Card key={route.id} className="cursor-pointer" onClick={() => setViewingRoute(route)}>
              <CardContent className="p-4">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{route.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {route.origin.name} to {route.destination.name}
                    </p>
                  </div>
                  <Badge variant="outline">{route.stops.length} stops</Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {route.distance} km
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {formatDuration(route.estimatedDuration)}
                  </span>
                  <span className="flex items-center gap-1">
                    <IndianRupee className="h-3.5 w-3.5" />
                    {formatCurrency(route.baseFare)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle>All Routes</CardTitle>
          <CardDescription>{filteredRoutes.length} routes available</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Route Name</TableHead>
                <TableHead>Origin</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Distance</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Fare</TableHead>
                <TableHead>Stops</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                    Loading routes...
                  </TableCell>
                </TableRow>
              ) : filteredRoutes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                    No routes found
                  </TableCell>
                </TableRow>
              ) : (
                filteredRoutes.map((route) => (
                  <TableRow key={route.id}>
                    <TableCell className="font-medium">{route.name}</TableCell>
                    <TableCell>{route.origin.name}</TableCell>
                    <TableCell>{route.destination.name}</TableCell>
                    <TableCell>{route.distance} km</TableCell>
                    <TableCell>{formatDuration(route.estimatedDuration)}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(route.baseFare)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{route.stops.length}</Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setViewingRoute(route)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem disabled>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit Route
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!viewingRoute} onOpenChange={(open) => !open && setViewingRoute(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{viewingRoute?.name}</DialogTitle>
            <DialogDescription>
              {viewingRoute?.origin.name} to {viewingRoute?.destination.name}
            </DialogDescription>
          </DialogHeader>
          {viewingRoute && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <p className="text-2xl font-bold">{viewingRoute.distance}</p>
                  <p className="text-xs text-muted-foreground">km</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <p className="text-2xl font-bold">{formatDuration(viewingRoute.estimatedDuration)}</p>
                  <p className="text-xs text-muted-foreground">duration</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <p className="text-2xl font-bold text-emerald-600">
                    {formatCurrency(viewingRoute.baseFare)}
                  </p>
                  <p className="text-xs text-muted-foreground">fare</p>
                </div>
              </div>

              <div>
                <h4 className="mb-3 font-semibold">Route Stops</h4>
                <div className="space-y-2">
                  {viewingRoute.stops.map((stop, index) => (
                    <div key={stop.id} className="flex items-center gap-3 rounded-lg border p-3">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                          index === 0
                            ? 'bg-emerald-100 text-emerald-700'
                            : index === viewingRoute.stops.length - 1
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{stop.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {index === 0 ? 'Departure' : `+${stop.arrivalOffset} min from start`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Route</DialogTitle>
            <DialogDescription>
              Create a route with operator, locations, fare, and intermediate stops.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="route-operator">Operator</Label>
              <select
                id="route-operator"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.operatorId}
                onChange={(event) => setFormData((prev) => ({ ...prev, operatorId: event.target.value }))}
              >
                <option value="">Select operator</option>
                {allOperators.map((operator) => (
                  <option key={operator.id} value={operator.id}>
                    {operator.shortName} - {operator.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="route-name">Route Name</Label>
              <Input
                id="route-name"
                value={formData.name}
                onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="e.g. Chandigarh to Patiala"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="origin-name">Origin</Label>
                <Input
                  id="origin-name"
                  value={formData.originName}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, originName: event.target.value }))
                  }
                  placeholder="Origin city"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="destination-name">Destination</Label>
                <Input
                  id="destination-name"
                  value={formData.destinationName}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, destinationName: event.target.value }))
                  }
                  placeholder="Destination city"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="origin-lat">Origin Latitude</Label>
                <Input
                  id="origin-lat"
                  value={formData.originLat}
                  onChange={(event) => setFormData((prev) => ({ ...prev, originLat: event.target.value }))}
                  placeholder="30.7333"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="origin-lng">Origin Longitude</Label>
                <Input
                  id="origin-lng"
                  value={formData.originLng}
                  onChange={(event) => setFormData((prev) => ({ ...prev, originLng: event.target.value }))}
                  placeholder="76.7794"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="destination-lat">Destination Latitude</Label>
                <Input
                  id="destination-lat"
                  value={formData.destinationLat}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, destinationLat: event.target.value }))
                  }
                  placeholder="30.3398"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="destination-lng">Destination Longitude</Label>
                <Input
                  id="destination-lng"
                  value={formData.destinationLng}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, destinationLng: event.target.value }))
                  }
                  placeholder="76.3869"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="distance">Distance (km)</Label>
                <Input
                  id="distance"
                  value={formData.distance}
                  onChange={(event) => setFormData((prev) => ({ ...prev, distance: event.target.value }))}
                  placeholder="75"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  value={formData.estimatedDuration}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, estimatedDuration: event.target.value }))
                  }
                  placeholder="110"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="fare">Base Fare (INR)</Label>
                <Input
                  id="fare"
                  value={formData.baseFare}
                  onChange={(event) => setFormData((prev) => ({ ...prev, baseFare: event.target.value }))}
                  placeholder="140"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="stops-text">Intermediate Stops</Label>
              <textarea
                id="stops-text"
                className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.stopsText}
                onChange={(event) => setFormData((prev) => ({ ...prev, stopsText: event.target.value }))}
                placeholder={'One stop per line\nAmbala\nRajpura'}
              />
              <p className="text-xs text-muted-foreground">
                Enter only intermediate stops. Origin and destination are added automatically.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateRoute}
              className="bg-violet-600 hover:bg-violet-700"
              disabled={
                isSaving ||
                !formData.operatorId ||
                !formData.name.trim() ||
                !formData.originName.trim() ||
                !formData.destinationName.trim() ||
                !formData.originLat.trim() ||
                !formData.originLng.trim() ||
                !formData.destinationLat.trim() ||
                !formData.destinationLng.trim() ||
                !formData.distance.trim() ||
                !formData.estimatedDuration.trim() ||
                !formData.baseFare.trim()
              }
            >
              {isSaving ? 'Creating...' : 'Create Route'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
