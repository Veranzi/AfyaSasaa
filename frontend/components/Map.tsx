"use client";
import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapProps {
  userPos: [number, number] | null;
  clinics: Array<{
    id: number;
    name: string;
    lat: number;
    lng: number;
  }>;
  onSelect: (clinic: any) => void;
}

function SetViewToUser({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, 13);
  }, [position, map]);
  return null;
}

export default function Map({ userPos, clinics, onSelect }: MapProps) {
  const mapRef = useRef<L.Map | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);

  return (
    <div className="w-full h-full rounded-xl overflow-hidden">
      <MapContainer
        center={userPos || [-1.2921, 36.8219]} // Default: Nairobi
        zoom={13}
        style={{ width: "100%", height: "100%", minHeight: 400 }}
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {clinics.map((clinic) => (
          <Marker
            key={clinic.id}
            position={[clinic.lat, clinic.lng]}
            eventHandlers={{
              click: () => onSelect(clinic),
            }}
            icon={L.icon({
              iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
              iconSize: [25, 41],
              iconAnchor: [12, 41]
            })}
          >
            <Popup>
              <b>{clinic.name}</b>
              <br />
              <button 
                onClick={() => onSelect(clinic)} 
                className="text-blue-600 underline"
              >
                Select
              </button>
            </Popup>
          </Marker>
        ))}
        {userPos && (
          <Marker
            position={userPos}
            icon={L.icon({
              iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              className: "user-location-marker"
            })}
          >
            <Popup>Your Location</Popup>
          </Marker>
        )}
        {userPos && <SetViewToUser position={userPos} />}
      </MapContainer>
    </div>
  );
} 