"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import { Restaurant } from "@/types/restaurant";
import L from "leaflet";

// Fix pour les icônes Leaflet avec Next.js
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  });
}

// Icône personnalisée : isSelected = focus, isDone = validé (coché)
const createCustomIcon = (isSelected: boolean, isDone: boolean) => {
  const size = isSelected ? 40 : 32;
  const color = isDone ? "#10b981" : isSelected ? "#10b981" : "#f97316";
  const borderWidth = isDone ? 4 : 3;
  
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border: ${borderWidth}px solid white;
      border-radius: 50%;
      box-shadow: 0 4px 16px rgba(0,0,0,0.25), 0 0 0 3px ${color}40;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transform: ${isSelected ? 'scale(1.1)' : 'scale(1)'};
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
      pointer-events: auto;
    ">
      <div style="
        width: ${size * 0.5}px;
        height: ${size * 0.5}px;
        background: white;
        border-radius: 50%;
        box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${size * 0.35}px;
        font-weight: bold;
        color: #10b981;
      ">${isDone ? '✓' : ''}</div>
    </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

// Styles de cartes disponibles
const mapStyles = {
  positron: {
    name: "Positron (actuel)",
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    description: "Clair et épuré, parfait pour la lisibilité",
  },
  voyager: {
    name: "Voyager",
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    description: "Coloré et moderne, avec des couleurs douces",
  },
  osm: {
    name: "OpenStreetMap",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    description: "Classique et détaillé, style standard",
  },
  toner: {
    name: "Stamen Toner Lite",
    url: "https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.png",
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    description: "Minimaliste en noir et blanc, très épuré",
  },
  watercolor: {
    name: "Stamen Watercolor",
    url: "https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg",
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    description: "Artistique et unique, style aquarelle",
  },
};

type MapStyleKey = keyof typeof mapStyles;

interface MapComponentProps {
  restaurants: Restaurant[];
  selectedRestaurant: Restaurant | null;
  onSelectRestaurant: (restaurant: Restaurant) => void;
  doneIds: number[];
}

function MapUpdater({
  selectedRestaurant,
}: {
  selectedRestaurant: Restaurant | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (selectedRestaurant) {
      map.setView([selectedRestaurant.lat, selectedRestaurant.lon], 15, {
        animate: true,
        duration: 0.5,
      });
    }
  }, [selectedRestaurant, map]);

  return null;
}

export default function MapComponent({
  restaurants,
  selectedRestaurant,
  onSelectRestaurant,
  doneIds,
}: MapComponentProps) {
  const center: [number, number] = [48.8566, 2.3522];
  const [mapStyle, setMapStyle] = useState<MapStyleKey>("positron");
  const [showStyleSelector, setShowStyleSelector] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const currentStyle = mapStyles[mapStyle];

  const handleMarkerClick = (restaurant: Restaurant) => {
    onSelectRestaurant(restaurant);
  };

  // Positions pour la polyline : restos cochés dans l'ordre (pour le tracé)
  const donePositions: L.LatLngTuple[] = doneIds
    .map((id) => restaurants.find((r) => r.id === id))
    .filter((r): r is Restaurant => r != null)
    .map((r) => [r.lat, r.lon] as L.LatLngTuple);

  const polylineKey = donePositions.map((p) => p.join(",")).join("|");

  return (
    <div className="w-full h-full relative bg-gray-50">
      {/* Sélecteur de style de carte */}
      <div className="absolute top-4 right-4 z-[1000]">
        <button
          onClick={() => setShowStyleSelector(!showStyleSelector)}
          className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-white transition-all flex items-center gap-2"
        >
          🗺️ Style: {currentStyle.name}
          <span className="text-xs">▼</span>
        </button>
        
        {showStyleSelector && (
          <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden min-w-[280px] z-[1001]">
            {Object.entries(mapStyles).map(([key, style]) => (
              <button
                key={key}
                onClick={() => {
                  setMapStyle(key as MapStyleKey);
                  setShowStyleSelector(false);
                }}
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                  mapStyle === key ? "bg-emerald-50 border-l-4 border-emerald-500" : ""
                }`}
              >
                <div className="font-semibold text-gray-900">{style.name}</div>
                <div className="text-xs text-gray-500 mt-1">{style.description}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        className="z-0 map-modern"
        scrollWheelZoom={true}
        zoomControl={true}
        key={mapStyle}
      >
        <TileLayer
          attribution={currentStyle.attribution}
          url={currentStyle.url}
          maxZoom={20}
        />
        {donePositions.length >= 2 && (
          <>
            <Polyline
              key={`${polylineKey}-stroke`}
              positions={donePositions}
              pathOptions={{
                color: "white",
                weight: 10,
                opacity: 0.9,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
            <Polyline
              key={polylineKey}
              positions={donePositions}
              pathOptions={{
                color: "#059669",
                weight: 6,
                opacity: 1,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
          </>
        )}
        {restaurants.map((restaurant) => {
          const isDone = doneIds.includes(restaurant.id);
          return (
          <Marker
            key={restaurant.id}
            position={[restaurant.lat, restaurant.lon]}
            icon={createCustomIcon(selectedRestaurant?.id === restaurant.id, isDone)}
            eventHandlers={{
              click: () => handleMarkerClick(restaurant),
              mouseover: (e) => {
                if (!isMobile) {
                  const marker = e.target;
                  marker.setIcon(createCustomIcon(true, isDone));
                }
              },
              mouseout: (e) => {
                if (!isMobile && selectedRestaurant?.id !== restaurant.id) {
                  const marker = e.target;
                  marker.setIcon(createCustomIcon(false, isDone));
                }
              },
            }}
            // Désactiver le popup sur mobile
            {...(isMobile ? { interactive: true } : {})}
          >
            {/* Popup désactivé sur mobile, affiché sur desktop */}
            {!isMobile && (
              <Popup className="custom-popup" closeButton={true}>
                <div className="text-center p-3">
                  <h3 className="font-bold text-base mb-1.5 text-gray-900">
                    {restaurant.nom}
                  </h3>
                  <p className="text-sm text-gray-600 mb-1">{restaurant.adresse}</p>
                  <p className="text-xs text-gray-500">{restaurant.quartier}</p>
                </div>
              </Popup>
            )}
          </Marker>
          );
        })}
        <MapUpdater selectedRestaurant={selectedRestaurant} />
      </MapContainer>
    </div>
  );
}
