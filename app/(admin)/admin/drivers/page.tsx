'use client'

import { useEffect, useMemo, useState } from 'react'
import { useBooking } from '@/lib/context/booking-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Plus, Search, MoreHorizontal, Eye, Pencil, Phone, Mail, Users, Route } from 'lucide-react'
import { formatPhone } from '@/lib/utils/format'
import type { User } from '@/lib/types'

type DriverFormState = {
  name: string
  email: string
  phone: string
  password: string
}

const initialFormState: DriverFormState = {
  name: '',
  email: '',
  phone: '',
  password: '',
}

export default function AdminDriversPage() {
  const { trips, routes } = useBooking()
  const [drivers, setDrivers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [formData, setFormData] = useState<DriverFormState>(initialFormState)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadDrivers = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/drivers')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Unable to load drivers')
      }

      setDrivers(data.drivers ?? [])
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load drivers')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadDrivers()
  }, [])

  const filteredDrivers = useMemo(() => {
    return drivers.filter(
      (driver) =>
        driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        driver.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        driver.phone.includes(searchQuery)
    )
  }, [drivers, searchQuery])

  const getDriverStats = (driverId: string) => {
    const driverTrips = trips.filter((trip) => trip.driverId === driverId)
    const completedTrips = driverTrips.filter((trip) => trip.status === 'completed').length
    const activeTrips = driverTrips.filter((trip) => trip.status === 'in-progress').length
    return { completedTrips, activeTrips, totalTrips: driverTrips.length }
  }

  const getCurrentTrip = (driverId: string) => {
    const activeTrip = trips.find((trip) => trip.driverId === driverId && trip.status === 'in-progress')
    if (!activeTrip) return null
    const route = routes.find((item) => item.id === activeTrip.routeId)
    return route?.name || null
  }

  const resetForm = () => setFormData(initialFormState)

  const handleCreateDriver = async () => {
    try {
      setIsSaving(true)
      setError(null)

      const response = await fetch('/api/drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Unable to create driver')
      }

      await loadDrivers()
      setIsAddDialogOpen(false)
      resetForm()
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Unable to create driver')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Drivers</h1>
          <p className="text-muted-foreground">Manage your driver team</p>
        </div>
        <Button
          className="bg-violet-600 hover:bg-violet-700"
          onClick={() => {
            resetForm()
            setIsAddDialogOpen(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Driver
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
              <Users className="h-6 w-6 text-violet-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{drivers.length}</p>
              <p className="text-sm text-muted-foreground">Total Drivers</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <Route className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{drivers.filter((driver) => getCurrentTrip(driver.id)).length}</p>
              <p className="text-sm text-muted-foreground">On Active Trips</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{drivers.filter((driver) => !getCurrentTrip(driver.id)).length}</p>
              <p className="text-sm text-muted-foreground">Available</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search drivers by name, email, or phone..."
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
            <CardContent className="p-6 text-center text-muted-foreground">Loading drivers...</CardContent>
          </Card>
        ) : filteredDrivers.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">No drivers found</CardContent>
          </Card>
        ) : (
          filteredDrivers.map((driver) => {
            const stats = getDriverStats(driver.id)
            const currentTrip = getCurrentTrip(driver.id)

            return (
              <Card key={driver.id}>
                <CardContent className="p-4">
                  <div className="mb-3 flex items-start gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={driver.avatarUrl} alt={driver.name} />
                      <AvatarFallback>
                        {driver.name
                          .split(' ')
                          .map((name) => name[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">{driver.name}</p>
                        {currentTrip ? (
                          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                            On Trip
                          </Badge>
                        ) : (
                          <Badge variant="outline">Available</Badge>
                        )}
                      </div>
                      {currentTrip && <p className="text-sm text-emerald-600">{currentTrip}</p>}
                    </div>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5" />
                      {driver.email}
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5" />
                      {formatPhone(driver.phone)}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-4 border-t pt-3 text-sm">
                    <span>{stats.totalTrips} total trips</span>
                    <span>{stats.completedTrips} completed</span>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle>All Drivers</CardTitle>
          <CardDescription>{filteredDrivers.length} drivers registered</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Driver</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Current Trip</TableHead>
                <TableHead>Total Trips</TableHead>
                <TableHead>Completed</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    Loading drivers...
                  </TableCell>
                </TableRow>
              ) : filteredDrivers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    No drivers found
                  </TableCell>
                </TableRow>
              ) : (
                filteredDrivers.map((driver) => {
                  const stats = getDriverStats(driver.id)
                  const currentTrip = getCurrentTrip(driver.id)

                  return (
                    <TableRow key={driver.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={driver.avatarUrl} alt={driver.name} />
                            <AvatarFallback>
                              {driver.name
                                .split(' ')
                                .map((name) => name[0])
                                .join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{driver.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          <p className="flex items-center gap-1 text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {driver.email}
                          </p>
                          <p className="flex items-center gap-1 text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {formatPhone(driver.phone)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {currentTrip ? (
                          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                            On Trip
                          </Badge>
                        ) : (
                          <Badge variant="outline">Available</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {currentTrip ? (
                          <span className="text-sm">{currentTrip}</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>{stats.totalTrips}</TableCell>
                      <TableCell>{stats.completedTrips}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem disabled>
                              <Eye className="mr-2 h-4 w-4" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem disabled>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
            <DialogTitle>Add Driver</DialogTitle>
            <DialogDescription>
              Create a driver login that can be assigned to trips from the admin panel.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="driver-name">Full Name</Label>
              <Input
                id="driver-name"
                value={formData.name}
                onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Enter driver name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="driver-email">Email</Label>
              <Input
                id="driver-email"
                type="email"
                value={formData.email}
                onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
                placeholder="Enter email address"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="driver-phone">Phone</Label>
              <Input
                id="driver-phone"
                value={formData.phone}
                onChange={(event) => setFormData((prev) => ({ ...prev, phone: event.target.value }))}
                placeholder="Enter phone number"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="driver-password">Password</Label>
              <Input
                id="driver-password"
                type="password"
                value={formData.password}
                onChange={(event) => setFormData((prev) => ({ ...prev, password: event.target.value }))}
                placeholder="Set a password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateDriver}
              className="bg-violet-600 hover:bg-violet-700"
              disabled={
                isSaving ||
                !formData.name.trim() ||
                !formData.email.trim() ||
                !formData.phone.trim() ||
                !formData.password
              }
            >
              {isSaving ? 'Creating...' : 'Create Driver'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
