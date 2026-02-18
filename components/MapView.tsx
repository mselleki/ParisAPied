"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { Restaurant } from "@/types/restaurant";

// Import dynamique complet de la carte pour éviter les problèmes SSR
const MapComponent = dynamic(() => import("./MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="text-center">
        <div className="text-4xl mb-4 animate-pulse">🗺️</div>
        <p className="text-muted font-medium">Chargement de la carte...</p>
      </div>
    </div>
  ),
});

interface MapViewProps {
  restaurants: Restaurant[];
  selectedRestaurant: Restaurant | null;
  onSelectRestaurant: (restaurant: Restaurant) => void;
  doneIds: number[];
}

export default function MapView({
  restaurants,
  selectedRestaurant,
  onSelectRestaurant,
  doneIds,
}: MapViewProps) {
  return (
    <MapComponent
      restaurants={restaurants}
      selectedRestaurant={selectedRestaurant}
      onSelectRestaurant={onSelectRestaurant}
      doneIds={doneIds}
    />
  );
}
