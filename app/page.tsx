'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bus, CheckCircle, Clock, CreditCard, MapPin } from 'lucide-react'
import { useAuth } from '@/lib/context/auth-context'
import { roleConfig, getDashboardPath } from '@/lib/auth/roles'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { UserRole } from '@/lib/types'

const features = [
  {
    icon: MapPin,
    title: 'Real-time Tracking',
    description: 'Track your bus location live on the map with accurate ETAs.',
  },
  {
    icon: Clock,
    title: 'Live Updates',
    description: 'Get instant notifications about delays, arrivals, and schedule changes.',
  },
  {
    icon: CreditCard,
    title: 'Easy Booking',
    description: 'Book tickets instantly with our visual seat selection system.',
  },
  {
    icon: CheckCircle,
    title: 'Reliable Service',
    description: 'Travel with confidence across major routes in India.',
  },
]

const initialSigninState = {
  email: '',
  password: '',
  role: 'passenger' as UserRole,
}

const initialSignupState = {
  name: '',
  email: '',
  phone: '',
  password: '',
  role: 'passenger' as UserRole,
}

const busBackgroundSvg =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 420'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cpath d='M115 255c0-27 20-50 47-54l84-13c15-2 29-8 41-18l63-54c20-17 45-26 71-26h247c52 0 95 38 103 89l14 76h34c17 0 30 13 30 30v24h-35c-6-31-33-54-66-54s-60 23-66 54H308c-6-31-33-54-66-54s-60 23-66 54h-61v-54Zm154 0h74V146h-10c-13 0-26 5-36 14l-28 26v69Zm105 0h154V146H374v109Zm184 0h135l-12-65c-5-25-26-44-52-44h-71v109Zm-304 54c0 20-16 36-36 36s-36-16-36-36 16-36 36-36 36 16 36 36Zm472 0c0 20-16 36-36 36s-36-16-36-36 16-36 36-36 36 16 36 36Z' fill='%230f172a'/%3E%3Cpath d='M0 334h1200' stroke='%2364738b' stroke-width='10' stroke-linecap='round' stroke-dasharray='12 18'/%3E%3C/g%3E%3C/svg%3E\")"

function RoleSelector({
  value,
  onChange,
}: {
  value: UserRole
  onChange: (role: UserRole) => void
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {(Object.entries(roleConfig) as [UserRole, (typeof roleConfig)[UserRole]][]).map(([role, config]) => {
        const Icon = config.icon
        const isActive = value === role

        return (
          <button
            key={role}
            type="button"
            onClick={() => onChange(role)}
            className={`rounded-xl border p-3 text-left transition ${
              isActive ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-primary/40'
            }`}
          >
            <div className={`mb-2 flex h-9 w-9 items-center justify-center rounded-full ${config.bgColor}`}>
              <Icon className={`h-4 w-4 ${config.color}`} />
            </div>
            <p className="text-sm font-semibold">{config.label}</p>
          </button>
        )
      })}
    </div>
  )
}

export default function LandingPage() {
  const { user, login, signup, isLoading } = useAuth()
  const router = useRouter()
  const [signinData, setSigninData] = useState(initialSigninState)
  const [signupData, setSignupData] = useState(initialSignupState)
  const [authError, setAuthError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (user && !isLoading) {
      router.push(getDashboardPath(user.role))
    }
  }, [user, isLoading, router])

  const handleSignin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setAuthError(null)
    setIsSubmitting(true)

    try {
      const signedInUser = await login(signinData)
      router.push(getDashboardPath(signedInUser.role))
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Unable to sign in')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSignup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setAuthError(null)
    setIsSubmitting(true)

    try {
      const createdUser = await signup(signupData)
      router.push(getDashboardPath(createdUser.role))
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Unable to create account')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <header className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyNTYzZWIiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="absolute inset-x-0 bottom-0 top-24 opacity-20">
          <div
            className="absolute inset-0 bg-contain bg-bottom bg-no-repeat"
            style={{ backgroundImage: busBackgroundSvg }}
          />
          <div className="absolute -left-20 top-10 h-56 w-56 rounded-full bg-emerald-200/50 blur-3xl" />
          <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
        </div>
        <div className="container relative mx-auto px-4 py-16 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Bus className="h-4 w-4" />
              <span>AIBTS</span>
            </div>
            <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              All India Bus Tracking System
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-pretty text-lg text-muted-foreground sm:text-xl">
              Sign in or create an account for users, drivers, and admins.
            </p>
          </div>
        </div>
      </header>

      <section className="relative -mt-8 container mx-auto px-4 py-12 sm:-mt-12">
        <div className="mx-auto max-w-2xl">
          <Card className="border-white/60 bg-white/85 shadow-2xl backdrop-blur dark:border-white/10 dark:bg-slate-950/80">
            <CardHeader>
              <CardTitle>Account Access</CardTitle>
              <CardDescription>Use the same email with different roles if you need separate access.</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="signin" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                {authError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {authError}
                  </div>
                )}

                <TabsContent value="signin">
                  <form className="space-y-4" onSubmit={handleSignin}>
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <RoleSelector
                        value={signinData.role}
                        onChange={(role) => setSigninData((prev) => ({ ...prev, role }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        value={signinData.email}
                        onChange={(event) => setSigninData((prev) => ({ ...prev, email: event.target.value }))}
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Password</Label>
                      <Input
                        id="signin-password"
                        type="password"
                        value={signinData.password}
                        onChange={(event) => setSigninData((prev) => ({ ...prev, password: event.target.value }))}
                        placeholder="Enter your password"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? 'Signing In...' : `Sign In as ${roleConfig[signinData.role].label}`}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form className="space-y-4" onSubmit={handleSignup}>
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <RoleSelector
                        value={signupData.role}
                        onChange={(role) => setSignupData((prev) => ({ ...prev, role }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full Name</Label>
                      <Input
                        id="signup-name"
                        value={signupData.name}
                        onChange={(event) => setSignupData((prev) => ({ ...prev, name: event.target.value }))}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        value={signupData.email}
                        onChange={(event) => setSignupData((prev) => ({ ...prev, email: event.target.value }))}
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-phone">Phone</Label>
                      <Input
                        id="signup-phone"
                        value={signupData.phone}
                        onChange={(event) => setSignupData((prev) => ({ ...prev, phone: event.target.value }))}
                        placeholder="+91 98765 43210"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        value={signupData.password}
                        onChange={(event) => setSignupData((prev) => ({ ...prev, password: event.target.value }))}
                        placeholder="Minimum 6 characters"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? 'Creating Account...' : `Create ${roleConfig[signupData.role].label} Account`}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="border-t bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-2 text-2xl font-bold">Why Choose Us</h2>
            <p className="text-muted-foreground">Everything you need for hassle-free travel</p>
          </div>
          <div className="mx-auto grid max-w-4xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div key={feature.title} className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
