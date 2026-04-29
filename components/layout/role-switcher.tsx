'use client'

import { useRouter } from 'next/navigation'
import { ChevronDown, LogOut } from 'lucide-react'
import { roleConfig } from '@/lib/auth/roles'
import { useAuth } from '@/lib/context/auth-context'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function RoleSwitcher() {
  const { user, logout } = useAuth()
  const router = useRouter()

  if (!user) return null

  const currentRole = roleConfig[user.role]
  const CurrentIcon = currentRole.icon

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <div className={`flex h-6 w-6 items-center justify-center rounded-full ${currentRole.bgColor}`}>
            <CurrentIcon className={`h-3.5 w-3.5 ${currentRole.color}`} />
          </div>
          <span className="hidden sm:inline">{user.name}</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span>{user.name}</span>
            <span className="text-xs font-normal text-muted-foreground">{user.email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs text-muted-foreground">Signed in as</DropdownMenuLabel>
        <div className="px-2 py-1.5 text-sm">
          <div className="flex items-center gap-2 rounded-md border px-2 py-2">
            <div className={`flex h-6 w-6 items-center justify-center rounded-full ${currentRole.bgColor}`}>
              <CurrentIcon className={`h-3.5 w-3.5 ${currentRole.color}`} />
            </div>
            <span>{currentRole.label}</span>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="gap-2 text-red-600">
          <LogOut className="h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
