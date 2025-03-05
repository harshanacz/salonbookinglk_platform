"use client"

import { useEffect } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"

// Fix Leaflet marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/marker-icon-2x.png",
  iconUrl: "/marker-icon.png",
  shadowUrl: "/marker-shadow.png",
})

interface MapProps {
  center: { lat: number; lng: number }
  zoom: number
  markers: Array<{
    id: number
    position: { lat: number; lng: number }
    label: string
    selected?: boolean
  }>
  onMarkerClick?: (id: number) => void
}

// Custom marker icon
const createCustomIcon = (label: string, selected = false) => {
  return L.divIcon({
    html: `
      <div class="relative">
        <div class="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full ${
          selected ? "bg-primary" : "bg-white"
        } shadow-lg border-2 border-white">
          <span class="${selected ? "text-white" : "text-gray-900"} text-sm font-semibold">${label}</span>
        </div>
      </div>
    `,
    className: "custom-marker",
  })
}

// Component to update map center
function ChangeView({ center, zoom }: { center: L.LatLngExpression; zoom: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom)
  }, [center, zoom, map])
  return null
}

export default function Map({ center, zoom, markers, onMarkerClick }: MapProps) {
  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={zoom}
      className="w-full h-full rounded-lg"
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ChangeView center={[center.lat, center.lng]} zoom={zoom} />
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          position={[marker.position.lat, marker.position.lng]}
          icon={createCustomIcon(marker.label, marker.selected)}
          eventHandlers={{
            click: () => onMarkerClick?.(marker.id),
          }}
        >
          <Popup>
            <div className="text-sm font-medium">Rating: {marker.label}</div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}

