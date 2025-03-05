"use client";

interface MapProps {
  center: { lat: number; lng: number };
  zoom: number;
  markers: Array<{
    id: number;
    position: { lat: number; lng: number };
    label: string;
    selected?: boolean;
  }>;
  onMarkerClick?: (id: number) => void;
}

export default function Map({ center, markers, onMarkerClick }: MapProps) {
  return (
    <div className="w-full h-full bg-gray-100 rounded-lg relative">
      {/* Placeholder map background */}
      <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
        <div className="text-gray-500 text-center">
          <div className="text-sm mb-2">Map View</div>
          <div className="text-xs">
            Lat: {center.lat}, Lng: {center.lng}
          </div>
        </div>
      </div>

      {/* Markers */}
      {markers.map((marker) => (
        <div
          key={marker.id}
          className={`absolute w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-110 ${
            marker.selected ? "bg-primary text-white" : "bg-white text-gray-900"
          } shadow-lg border-2 border-white`}
          style={{
            left: `${((marker.position.lng - center.lng) / 0.1) * 50 + 50}%`,
            top: `${((marker.position.lat - center.lat) / 0.1) * 50 + 50}%`,
          }}
          onClick={() => onMarkerClick?.(marker.id)}
        >
          <span className="text-sm font-semibold">{marker.label}</span>
        </div>
      ))}
    </div>
  );
}
