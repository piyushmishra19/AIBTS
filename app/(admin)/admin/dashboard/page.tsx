'use client'

import { useBooking } from '@/lib/context/booking-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatCard } from '@/components/dashboard/stat-card'
import {
  Bus,
  Route,
  Users,
  Ticket,
  TrendingUp,
  IndianRupee,
  MapPin,
  Clock,
} from 'lucide-react'
import { mockBuses, mockUsers } from '@/lib/data/mock-data'
import {
  formatTime,
  formatCurrency,
  formatRelativeTime,
  getStatusColor,
} from '@/lib/utils/format'
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'

// Mock chart data
const dailyBookingsData = [
  { day: 'Mon', bookings: 45 },
  { day: 'Tue', bookings: 52 },
  { day: 'Wed', bookings: 38 },
  { day: 'Thu', bookings: 61 },
  { day: 'Fri', bookings: 78 },
  { day: 'Sat', bookings: 92 },
  { day: 'Sun', bookings: 85 },
]

const revenueData = [
  { month: 'Jan', revenue: 125000 },
  { month: 'Feb', revenue: 142000 },
  { month: 'Mar', revenue: 138000 },
  { month: 'Apr', revenue: 165000 },
  { month: 'May', revenue: 178000 },
  { month: 'Jun', revenue: 192000 },
]

const routePopularityData = [
  { route: 'Delhi-Jaipur', bookings: 320 },
  { route: 'Mumbai-Pune', bookings: 285 },
  { route: 'BLR-Mysore', bookings: 245 },
  { route: 'Chennai-Pondy', bookings: 198 },
  { route: 'HYD-VJA', bookings: 167 },
]

export default function AdminDashboard() {
  const { trips, routes, bookings } = useBooking()

  // Calculate stats
  const activeBuses = mockBuses.filter((b) => b.status === 'active').length
  const totalDrivers = mockUsers.filter((u) => u.role === 'driver').length
  const activeTrips = trips.filter((t) => t.status === 'in-progress').length
  const todayBookings = bookings.filter((b) => {
    const bookingDate = new Date(b.bookedAt).toDateString()
    return bookingDate === new Date().toDateString()
  })
  const todayRevenue = todayBookings.reduce((sum, b) => sum + b.totalFare, 0)

  // Recent activity
  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime())
    .slice(0, 5)

  const recentTrips = [...trips]
    .filter((t) => t.status === 'in-progress' || t.status === 'completed')
    .sort((a, b) => new Date(b.departureTime).getTime() - new Date(a.departureTime).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your bus tracking system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Buses"
          value={mockBuses.length}
          subtitle={`${activeBuses} active`}
          icon={Bus}
          iconClassName="bg-violet-500"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Active Trips"
          value={activeTrips}
          subtitle={`${trips.filter((t) => t.status === 'scheduled').length} scheduled`}
          icon={MapPin}
          iconClassName="bg-emerald-500"
        />
        <StatCard
          title="Today&apos;s Bookings"
          value={todayBookings.length}
          subtitle={`${bookings.length} total`}
          icon={Ticket}
          iconClassName="bg-blue-500"
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Today&apos;s Revenue"
          value={formatCurrency(todayRevenue)}
          subtitle="From bookings"
          icon={IndianRupee}
          iconClassName="bg-amber-500"
          trend={{ value: 15, isPositive: true }}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Weekly Bookings Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Weekly Bookings</CardTitle>
            <CardDescription>Number of bookings per day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyBookingsData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="day" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="bookings" fill="hsl(262.1 83.3% 57.8%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Revenue Trend</CardTitle>
            <CardDescription>Monthly revenue overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" tickFormatter={(value) => `₹${value / 1000}k`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(142.1 76.2% 36.3%)"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(142.1 76.2% 36.3%)' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Popular Routes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Popular Routes</CardTitle>
            <CardDescription>Top performing routes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {routePopularityData.map((route, index) => (
                <div key={route.route} className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      index === 0
                        ? 'bg-amber-100 text-amber-700'
                        : index === 1
                          ? 'bg-gray-100 text-gray-700'
                          : index === 2
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{route.route}</p>
                    <p className="text-sm text-muted-foreground">{route.bookings} bookings</p>
                  </div>
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Bookings</CardTitle>
            <CardDescription>Latest booking activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                      <Ticket className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{booking.passengerName || 'Guest'}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeTime(booking.bookedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatCurrency(booking.totalFare)}</p>
                    <Badge variant="outline" className={`text-xs ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active Trips */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Trip Activity</CardTitle>
            <CardDescription>Recent trip updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTrips.map((trip) => {
                const route = routes.find((r) => r.id === trip.routeId)
                if (!route) return null

                return (
                  <div key={trip.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full ${
                          trip.status === 'in-progress'
                            ? 'bg-emerald-100 dark:bg-emerald-900/30'
                            : 'bg-muted'
                        }`}
                      >
                        {trip.status === 'in-progress' ? (
                          <MapPin className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <Clock className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{route.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatTime(trip.departureTime)}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(trip.status)}>
                      {trip.status === 'in-progress' ? 'Active' : trip.status}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/30">
              <Route className="h-6 w-6 text-violet-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{routes.length}</p>
              <p className="text-sm text-muted-foreground">Total Routes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalDrivers}</p>
              <p className="text-sm text-muted-foreground">Active Drivers</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <Bus className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeBuses}</p>
              <p className="text-sm text-muted-foreground">Active Buses</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
              <TrendingUp className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">94%</p>
              <p className="text-sm text-muted-foreground">On-time Rate</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
