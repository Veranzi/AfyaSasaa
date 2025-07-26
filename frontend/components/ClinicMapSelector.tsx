"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Example clinics (replace with your real data)
const clinics = [
  { id: 1, name: "Nairobi Women's Hospital", lat: -1.302, lng: 36.806 },
  { id: 2, name: "Aga Khan University Hospital", lat: -1.266, lng: 36.817 },
  // ...add more clinics
];

// Dynamic import of the map component with no SSR
const MapWithNoSSR = dynamic(() => import("./Map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full rounded-xl bg-gray-100 flex items-center justify-center">
      Loading map...
    </div>
  ),
});

export default function ClinicMapSelector({ onSelect }: { onSelect: (clinic: any) => void }) {
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handleUseMyLocation = () => {
    if (typeof window !== "undefined" && typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserPos([pos.coords.latitude, pos.coords.longitude]);
        },
        () => alert("Could not get your location")
      );
    }
  };

  return (
    <div className="w-full h-[400px] md:h-[500px]" style={{ minHeight: 400 }}>
      <button 
        onClick={handleUseMyLocation} 
        className="mb-2 bg-blue-600 text-white px-4 py-2 rounded"
      >
        Use My Current Location
      </button>
      <div className="w-full h-full rounded-xl" style={{ minHeight: 400 }}>
        {mounted && (
          <MapWithNoSSR
            userPos={userPos}
            clinics={clinics}
            onSelect={onSelect}
          />
        )}
      </div>
    </div>
  );
} 