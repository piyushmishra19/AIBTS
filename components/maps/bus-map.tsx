'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import type { Stop } from '@/lib/types'

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
)
const Polyline = dynamic(
  () => import('react-leaflet').then((mod) => mod.Polyline),
  { ssr: false }
)

interface BusMapProps {
  stops: Stop[]
  currentLocation?: { lat: number; lng: number }
  currentStopIndex?: number
  className?: string
}

export function BusMap({
  stops,
  currentLocation,
  currentStopIndex = 0,
  className,
}: BusMapProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [busIcon, setBusIcon] = useState<L.Icon | null>(null)
  const [stopIcon, setStopIcon] = useState<L.Icon | null>(null)
  const [currentStopIcon, setCurrentStopIcon] = useState<L.Icon | null>(null)

  useEffect(() => {
    setIsMounted(true)
    // Import Leaflet only on client side
    import('leaflet').then((L) => {
      // Import CSS
      import('leaflet/dist/leaflet.css')

      // Create custom icons
      setBusIcon(
        new L.Icon({
          iconUrl: 'data:image/svg+xml;base64,' + btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#2563eb" width="32" height="32">
              <rect x="3" y="4" width="18" height="14" rx="2" fill="#2563eb"/>
              <rect x="5" y="6" width="4" height="3" rx="1" fill="white"/>
              <rect x="10" y="6" width="4" height="3" rx="1" fill="white"/>
              <rect x="15" y="6" width="4" height="3" rx="1" fill="white"/>
              <circle cx="7" cy="18" r="2" fill="#1e40af"/>
              <circle cx="17" cy="18" r="2" fill="#1e40af"/>
            </svg>
          `),
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -16],
        })
      )

      setStopIcon(
        new L.Icon({
          iconUrl: 'data:image/svg+xml;base64,' + btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
              <circle cx="12" cy="12" r="6" fill="white" stroke="#6b7280" stroke-width="2"/>
            </svg>
          `),
          iconSize: [16, 16],
          iconAnchor: [8, 8],
          popupAnchor: [0, -8],
        })
      )

      setCurrentStopIcon(
        new L.Icon({
          iconUrl: 'data:image/svg+xml;base64,' + btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
              <circle cx="12" cy="12" r="8" fill="#10b981" stroke="white" stroke-width="2"/>
            </svg>
          `),
          iconSize: [20, 20],
          iconAnchor: [10, 10],
          popupAnchor: [0, -10],
        })
      )
    })
  }, [])

  if (!isMounted || stops.length === 0) {
    return (
      <div className={`flex items-center justify-center bg-muted ${className}`}>
        <div className="text-muted-foreground">Loading map...</div>
      </div>
    )
  }

  if (!busIcon || !stopIcon || !currentStopIcon) {
    return (
      <div className={`flex items-center justify-center bg-muted ${className}`}>
        <div className="text-muted-foreground">Preparing live map...</div>
      </div>
    )
  }

  // Calculate center of the route
  const centerLat = stops.reduce((sum, stop) => sum + stop.lat, 0) / stops.length
  const centerLng = stops.reduce((sum, stop) => sum + stop.lng, 0) / stops.length

  // Create polyline coordinates
  const routeCoordinates: [number, number][] = stops.map((stop) => [stop.lat, stop.lng])

  // Calculate bounds to fit all markers
  const bounds: [[number, number], [number, number]] = [
    [Math.min(...stops.map((s) => s.lat)) - 0.1, Math.min(...stops.map((s) => s.lng)) - 0.1],
    [Math.max(...stops.map((s) => s.lat)) + 0.1, Math.max(...stops.map((s) => s.lng)) + 0.1],
  ]

  return (
    <MapContainer
      center={[centerLat, centerLng]}
      bounds={bounds}
      zoom={8}
      className={className}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Route polyline */}
      <Polyline
        positions={routeCoordinates}
        pathOptions={{ color: '#2563eb', weight: 4, opacity: 0.7 }}
      />

      {/* Stop markers */}
      {stops.map((stop, index) => (
        <Marker
          key={stop.id}
          position={[stop.lat, stop.lng]}
          icon={index === currentStopIndex ? currentStopIcon : stopIcon}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">{stop.name}</p>
              {index === 0 && <p className="text-emerald-600">Origin</p>}
              {index === stops.length - 1 && <p className="text-blue-600">Destination</p>}
              {index === currentStopIndex && index !== 0 && index !== stops.length - 1 && (
                <p className="text-emerald-600">Current Stop</p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Bus marker (current location) */}
      {currentLocation && (
        <Marker position={[currentLocation.lat, currentLocation.lng]} icon={busIcon}>
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">Bus Location</p>
              <p className="text-muted-foreground">Live tracking</p>
            </div>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  )
}
