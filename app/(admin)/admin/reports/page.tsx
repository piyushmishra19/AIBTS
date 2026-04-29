'use client'

import { useMemo } from 'react'
import { useBooking } from '@/lib/context/booking-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  Bus,
  CalendarDays,
  IndianRupee,
  Route as RouteIcon,
  Ticket,
  TrendingUp,
} from 'lucide-react'
import { mockBuses, mockUsers } from '@/lib/data/mock-data'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils/format'

const bookingStatusColors: Record<string, string> = {
  confirmed: '#10b981',
  pending: '#f59e0b',
  cancelled: '#ef4444',
}

export default function AdminReportsPage() {
  const { bookings, trips, routes, getRouteByTripId } = useBooking()

  const reportData = useMemo(() => {
    const activeBuses = mockBuses.filter((bus) => bus.status === 'active').length
    const totalDrivers = mockUsers.filter((user) => user.role === 'driver').length
    const totalRevenue = bookings
      .filter((booking) => booking.status !== 'cancelled')
      .reduce((sum, booking) => sum + booking.totalFare, 0)

    const bookingStatusData = ['confirmed', 'pending', 'cancelled'].map((status) => ({
      name: status,
      value: bookings.filter((booking) => booking.status === status).length,
      color: bookingStatusColors[status],
    }))

    const monthlyRevenueMap = new Map<string, { label: string; revenue: number; bookings: number }>()

    bookings.forEach((booking) => {
      if (booking.status === 'cancelled') return

      const date = new Date(booking.bookedAt)
      const key = `${date.getFullYear()}-${date.getMonth()}`
      const label = date.toLocaleString('en-IN', { month: 'short' })
      const current = monthlyRevenueMap.get(key) ?? { label, revenue: 0, bookings: 0 }

      current.revenue += booking.totalFare
      current.bookings += 1
      monthlyRevenueMap.set(key, current)
    })

    const monthlyRevenue = Array.from(monthlyRevenueMap.values()).slice(-6)

    const routePerformance = routes
      .map((route) => {
        const routeBookings = bookings.filter((booking) => {
          const tripRoute = getRouteByTripId(booking.tripId)
          return tripRoute?.id === route.id && booking.status !== 'cancelled'
        })

        return {
          id: route.id,
          name: route.name,
          bookings: routeBookings.length,
          revenue: routeBookings.reduce((sum, booking) => sum + booking.totalFare, 0),
          trips: trips.filter((trip) => trip.routeId === route.id).length,
        }
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    const latestTrips = [...trips]
      .sort((a, b) => new Date(b.departureTime).getTime() - new Date(a.departureTime).getTime())
      .slice(0, 6)

    return {
      activeBuses,
      totalDrivers,
      totalRevenue,
      bookingStatusData,
      monthlyRevenue,
      routePerformance,
      latestTrips,
    }
  }, [bookings, trips, routes, getRouteByTripId])

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-muted-foreground">
          Track bookings, revenue, routes, and trip activity from one place
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/30">
              <Ticket className="h-6 w-6 text-violet-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{bookings.length}</p>
              <p className="text-sm text-muted-foreground">Total bookings</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
              <IndianRupee className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatCurrency(reportData.totalRevenue)}</p>
              <p className="text-sm text-muted-foreground">Collected revenue</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <Bus className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{reportData.activeBuses}</p>
              <p className="text-sm text-muted-foreground">Active buses</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{reportData.totalDrivers}</p>
              <p className="text-sm text-muted-foreground">Driver accounts</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Month</CardTitle>
            <CardDescription>Last six months based on confirmed and pending bookings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportData.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="label" className="text-xs" />
                  <YAxis className="text-xs" tickFormatter={(value) => `₹${Math.round(value / 1000)}k`} />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="revenue" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Booking Status Mix</CardTitle>
            <CardDescription>Current split of booking states</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reportData.bookingStatusData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                  >
                    {reportData.bookingStatusData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [value, name]}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {reportData.bookingStatusData.map((item) => (
                <div key={item.name} className="rounded-lg border p-3">
                  <p className="text-sm capitalize text-muted-foreground">{item.name}</p>
                  <p className="text-lg font-semibold">{item.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Top Route Performance</CardTitle>
            <CardDescription>Best earning routes from current booking data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.routePerformance.length === 0 ? (
                <p className="text-sm text-muted-foreground">No route data available yet.</p>
              ) : (
                reportData.routePerformance.map((route, index) => (
                  <div key={route.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900/30">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{route.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {route.bookings} bookings • {route.trips} trips
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(route.revenue)}</p>
                      <p className="text-sm text-muted-foreground">Revenue</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Trips</CardTitle>
            <CardDescription>Latest scheduled and completed trip records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.latestTrips.length === 0 ? (
                <p className="text-sm text-muted-foreground">No trip activity available yet.</p>
              ) : (
                reportData.latestTrips.map((trip) => {
                  const route = routes.find((item) => item.id === trip.routeId)

                  return (
                    <div key={trip.id} className="rounded-lg border p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{route?.name || trip.id}</p>
                          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                            <CalendarDays className="h-4 w-4" />
                            {formatDate(trip.departureTime)}
                          </p>
                        </div>
                        <Badge className={getStatusColor(trip.status)}>{trip.status}</Badge>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-fuchsia-100 dark:bg-fuchsia-900/30">
              <RouteIcon className="h-6 w-6 text-fuchsia-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{routes.length}</p>
              <p className="text-sm text-muted-foreground">Routes covered</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-100 dark:bg-cyan-900/30">
              <Ticket className="h-6 w-6 text-cyan-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {reportData.bookingStatusData.find((item) => item.name === 'confirmed')?.value ?? 0}
              </p>
              <p className="text-sm text-muted-foreground">Confirmed tickets</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
              <Bus className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{trips.length}</p>
              <p className="text-sm text-muted-foreground">Trips in system</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
