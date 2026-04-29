'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Bus,
  Wifi,
  Snowflake,
  Plug,
  Building2,
} from 'lucide-react'
import { getStatusColor } from '@/lib/utils/format'
import { allOperators } from '@/lib/data/operators'
import { busTypeLabels } from '@/lib/data/mock-data'
import type { Bus as BusRecord, BusStatus, BusType } from '@/lib/types'

type BusFormState = {
  id?: string
  operatorId: string
  registrationNumber: string
  model: string
  busType: BusType
  capacity: string
  amenities: string
  status: BusStatus
}

const initialFormState: BusFormState = {
  operatorId: 'prtc',
  registrationNumber: '',
  model: '',
  busType: 'ordinary',
  capacity: '',
  amenities: 'AC, Charging Points',
  status: 'active',
}

export default function AdminBusesPage() {
  const [buses, setBuses] = useState<BusRecord[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingBus, setEditingBus] = useState<BusRecord | null>(null)
  const [formData, setFormData] = useState<BusFormState>(initialFormState)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadBuses = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch('/api/buses')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Unable to load buses')
      }

      setBuses(data.buses ?? [])
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load buses')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadBuses()
  }, [])

  const filteredBuses = useMemo(() => {
    return buses.filter((bus) => {
      const matchesSearch =
        bus.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bus.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bus.operatorId.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || bus.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [buses, searchQuery, statusFilter])

  const resetForm = () => {
    setFormData(initialFormState)
  }

  const openEditDialog = (bus: BusRecord) => {
    setFormData({
      id: bus.id,
      operatorId: bus.operatorId,
      registrationNumber: bus.registrationNumber,
      model: bus.model,
      busType: bus.busType,
      capacity: bus.capacity.toString(),
      amenities: bus.amenities.join(', '),
      status: bus.status,
    })
    setEditingBus(bus)
  }

  const normalizeAmenities = (value: string) =>
    value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)

  const handleSaveBus = async () => {
    try {
      setIsSaving(true)
      setError(null)

      const payload = {
        operatorId: formData.operatorId,
        registrationNumber: formData.registrationNumber,
        model: formData.model,
        busType: formData.busType,
        capacity: Number(formData.capacity),
        amenities: normalizeAmenities(formData.amenities),
        status: formData.status,
      }

      const isEdit = !!editingBus
      const response = await fetch(isEdit ? `/api/buses/${editingBus.id}` : '/api/buses', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Unable to save bus')
      }

      await loadBuses()
      setIsAddDialogOpen(false)
      setEditingBus(null)
      resetForm()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save bus')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteBus = async (busId: string) => {
    try {
      setError(null)
      const response = await fetch(`/api/buses/${busId}`, { method: 'DELETE' })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Unable to delete bus')
      }
      await loadBuses()
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete bus')
    }
  }

  const handleToggleStatus = async (bus: BusRecord) => {
    try {
      setError(null)
      const nextStatus: BusStatus = bus.status === 'active' ? 'inactive' : 'active'
      const response = await fetch(`/api/buses/${bus.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operatorId: bus.operatorId,
          registrationNumber: bus.registrationNumber,
          model: bus.model,
          busType: bus.busType,
          capacity: bus.capacity,
          amenities: bus.amenities,
          status: nextStatus,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Unable to update bus status')
      }
      await loadBuses()
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : 'Unable to update bus status')
    }
  }

  const BusFormDialog = ({
    isOpen,
    onOpenChange,
    isEdit = false,
  }: {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    isEdit?: boolean
  }) => (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        onOpenChange(open)
        if (!open) {
          setEditingBus(null)
          resetForm()
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Bus' : 'Add New Bus'}</DialogTitle>
          <DialogDescription>
            Save full bus details to MySQL, including operator, bus type, capacity, amenities, and status.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="operator">Operator</Label>
            <Select
              value={formData.operatorId}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, operatorId: value }))}
            >
              <SelectTrigger id="operator">
                <SelectValue placeholder="Select operator" />
              </SelectTrigger>
              <SelectContent>
                {allOperators.map((operator) => (
                  <SelectItem key={operator.id} value={operator.id}>
                    {operator.shortName} {operator.type === 'government' ? '(Roadways)' : '(Private)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="registration">Registration Number</Label>
            <Input
              id="registration"
              placeholder="e.g., DL 01 AB 1234"
              value={formData.registrationNumber}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, registrationNumber: e.target.value }))
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="model">Model</Label>
            <Input
              id="model"
              placeholder="e.g., Volvo 9400"
              value={formData.model}
              onChange={(e) => setFormData((prev) => ({ ...prev, model: e.target.value }))}
            />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="busType">Bus Type</Label>
              <Select
                value={formData.busType}
                onValueChange={(value: BusType) => setFormData((prev) => ({ ...prev, busType: value }))}
              >
                <SelectTrigger id="busType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(busTypeLabels) as [BusType, string][]).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="capacity">Seating Capacity</Label>
              <Input
                id="capacity"
                type="number"
                placeholder="e.g., 40"
                value={formData.capacity}
                onChange={(e) => setFormData((prev) => ({ ...prev, capacity: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="amenities">Amenities</Label>
            <Input
              id="amenities"
              placeholder="AC, WiFi, Charging Points"
              value={formData.amenities}
              onChange={(e) => setFormData((prev) => ({ ...prev, amenities: e.target.value }))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: BusStatus) =>
                setFormData((prev) => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveBus}
            className="bg-violet-600 hover:bg-violet-700"
            disabled={
              isSaving ||
              !formData.operatorId ||
              !formData.registrationNumber ||
              !formData.model ||
              !formData.capacity
            }
          >
            {isSaving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Bus'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Buses</h1>
          <p className="text-muted-foreground">Manage your fleet of buses stored in MySQL</p>
        </div>
        <Button
          className="bg-violet-600 hover:bg-violet-700"
          onClick={() => {
            resetForm()
            setEditingBus(null)
            setIsAddDialogOpen(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Bus
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by registration, model, or operator..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fleet Overview</CardTitle>
          <CardDescription>{filteredBuses.length} buses found</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Registration</TableHead>
                <TableHead>Operator</TableHead>
                <TableHead>Model / Type</TableHead>
                <TableHead className="hidden md:table-cell">Capacity</TableHead>
                <TableHead className="hidden lg:table-cell">Amenities</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    Loading buses...
                  </TableCell>
                </TableRow>
              ) : filteredBuses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    No buses found
                  </TableCell>
                </TableRow>
              ) : (
                filteredBuses.map((bus) => {
                  const operator = allOperators.find((item) => item.id === bus.operatorId)

                  return (
                    <TableRow key={bus.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Bus className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{bus.registrationNumber}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{operator?.shortName || bus.operatorId}</p>
                            <p className="text-xs text-muted-foreground">
                              {operator?.type === 'government' ? 'Roadways' : 'Private'}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{bus.model}</p>
                          <p className="text-xs text-muted-foreground">{busTypeLabels[bus.busType]}</p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{bus.capacity} seats</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          {bus.amenities.includes('WiFi') && (
                            <Wifi className="h-4 w-4 text-muted-foreground" title="WiFi" />
                          )}
                          {bus.amenities.includes('AC') && (
                            <Snowflake className="h-4 w-4 text-muted-foreground" title="AC" />
                          )}
                          {bus.amenities.includes('Charging Points') && (
                            <Plug className="h-4 w-4 text-muted-foreground" title="Charging Points" />
                          )}
                          <span className="text-xs text-muted-foreground">
                            {bus.amenities.length ? bus.amenities.join(', ') : 'None'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(bus.status)}>{bus.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(bus)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(bus)}>
                              {bus.status === 'active' ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteBus(bus.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
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

      <BusFormDialog isOpen={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
      <BusFormDialog
        isOpen={!!editingBus}
        onOpenChange={(open) => {
          if (!open) {
            setEditingBus(null)
            resetForm()
          }
        }}
        isEdit
      />
    </div>
  )
}
