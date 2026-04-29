import { Shield, Truck, User } from 'lucide-react'
import type { UserRole } from '@/lib/types'

export const roleConfig: Record<
  UserRole,
  {
    label: string
    icon: typeof User
    color: string
    bgColor: string
    borderColor: string
    path: string
  }
> = {
  passenger: {
    label: 'User',
    icon: User,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
    borderColor: 'hover:border-emerald-300 dark:hover:border-emerald-700',
    path: '/passenger/dashboard',
  },
  driver: {
    label: 'Driver',
    icon: Truck,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    borderColor: 'hover:border-amber-300 dark:hover:border-amber-700',
    path: '/driver/dashboard',
  },
  admin: {
    label: 'Admin',
    icon: Shield,
    color: 'text-violet-600',
    bgColor: 'bg-violet-100 dark:bg-violet-900/30',
    borderColor: 'hover:border-violet-300 dark:hover:border-violet-700',
    path: '/admin/dashboard',
  },
}

export function getDashboardPath(role: UserRole) {
  return roleConfig[role].path
}
