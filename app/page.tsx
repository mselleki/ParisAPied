"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Restaurant } from "@/types/restaurant";
import RestaurantList from "@/components/RestaurantList";
import MapView from "@/components/MapView";
import RestaurantDetail from "@/components/RestaurantDetail";
import SyncBanner from "@/components/SyncBanner";
import restaurantsData from "@/data/restaurants.json";
import { motion, AnimatePresence } from "framer-motion";
import { useDoneRestaurants } from "@/hooks/useDoneRestaurants";
import { useTrajetOrder } from "@/hooks/useTrajetOrder";
import { getRoomId, pullSync, buildPayload } from "@/lib/sync";

export default function Home() {
  const [viewMode, setViewMode] = useState<"list" | "map" | "split">("split");
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const { doneIds, toggleDone, isDone } = useDoneRestaurants();
  const restaurantsFromData = restaurantsData.restaurants as Restaurant[];
  const [orderedRestaurants, setTrajetOrder] = useTrajetOrder(restaurantsFromData);

  // Si code sync : au chargement, pull puis recharger seulement si les données ont changé
  useEffect(() => {
    if (typeof window === "undefined") return;
    const roomId = getRoomId();
    if (!roomId) return;
    const before = JSON.stringify(buildPayload());
    pullSync().then((ok) => {
      if (!ok) return;
      const after = JSON.stringify(buildPayload());
      if (before !== after) window.location.reload();
    });
  }, []);

  // Polling : pull toutes les 30s quand l’onglet est visible pour mettre à jour sans refresh
  useEffect(() => {
    if (typeof window === "undefined") return;
    const roomId = getRoomId();
    if (!roomId) return;
    const interval = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      const before = JSON.stringify(buildPayload());
      pullSync().then((ok) => {
        if (!ok) return;
        const after = JSON.stringify(buildPayload());
        if (before !== after) window.location.reload();
      });
    }, 30_000);
    return () => clearInterval(interval);
  }, []);


  const handleSelectRestaurant = (restaurant: Restaurant) => {
    // Toujours réinitialiser et sélectionner le nouveau restaurant
    setSelectedRestaurant(restaurant);
    setShowDetail(true);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    // Réinitialiser la sélection après l'animation de fermeture
    setTimeout(() => {
      setSelectedRestaurant(null);
    }, 300);
  };

  return (
    <main className="h-screen flex flex-col overflow-hidden bg-gray-50">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-orange-600 text-white p-5 md:p-6 shadow-lg relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Paris à Pied</h1>
            <p className="text-base md:text-lg opacity-90">
              Tour des petites adresses parisiennes
            </p>
          </div>
          <div className="flex-shrink-0 flex flex-wrap gap-1.5 md:gap-2">
            <Link
              href="/classement"
              className="px-2 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl bg-white/20 hover:bg-white/30 text-white font-medium text-xs md:text-sm transition-colors"
            >
              🏆 <span className="hidden sm:inline">Classement</span>
            </Link>
            <Link
              href="/souvenirs"
              className="px-2 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl bg-white/20 hover:bg-white/30 text-white font-medium text-xs md:text-sm transition-colors"
            >
              📸 <span className="hidden sm:inline">Souvenirs</span>
            </Link>
            <Link
              href="/stats"
              className="px-2 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl bg-white/20 hover:bg-white/30 text-white font-medium text-xs md:text-sm transition-colors"
            >
              📊 <span className="hidden sm:inline">Stats</span>
            </Link>
            <SyncBanner />
          </div>
        </div>
      </motion.header>

      {/* Mode selector */}
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => setViewMode("list")}
            className={`px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
              viewMode === "list"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 scale-105"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
            }`}
          >
            📋 Liste
          </button>
          <button
            onClick={() => setViewMode("split")}
            className={`px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
              viewMode === "split"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 scale-105"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
            }`}
          >
            ⚡ Split
          </button>
          <button
            onClick={() => setViewMode("map")}
            className={`px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
              viewMode === "map"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 scale-105"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
            }`}
          >
            🗺️ Carte
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative bg-gray-50">
        <AnimatePresence mode="wait">
          {viewMode === "list" && (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <RestaurantList
                restaurants={orderedRestaurants}
                selectedRestaurant={selectedRestaurant}
                onSelectRestaurant={handleSelectRestaurant}
                doneIds={doneIds}
                onToggleDone={toggleDone}
                isDone={isDone}
                onTrajetReorder={setTrajetOrder}
              />
            </motion.div>
          )}

          {viewMode === "map" && (
            <motion.div
              key="map"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <MapView
                restaurants={orderedRestaurants}
                selectedRestaurant={selectedRestaurant}
                onSelectRestaurant={handleSelectRestaurant}
                doneIds={doneIds}
              />
            </motion.div>
          )}

          {viewMode === "split" && (
            <motion.div
              key="split"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full flex flex-col md:flex-row"
            >
              <div className="w-full md:w-1/2 border-r border-gray-200 overflow-hidden">
                <RestaurantList
                  restaurants={orderedRestaurants}
                  selectedRestaurant={selectedRestaurant}
                  onSelectRestaurant={handleSelectRestaurant}
                  doneIds={doneIds}
                  onToggleDone={toggleDone}
                  isDone={isDone}
                  onTrajetReorder={setTrajetOrder}
                />
              </div>
              <div className="w-full md:w-1/2 overflow-hidden">
                <MapView
                  restaurants={orderedRestaurants}
                  selectedRestaurant={selectedRestaurant}
                  onSelectRestaurant={handleSelectRestaurant}
                  doneIds={doneIds}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Restaurant Detail Modal - Utilise un portail pour être au-dessus de tout */}
      <RestaurantDetail
        restaurant={showDetail ? selectedRestaurant : null}
        onClose={handleCloseDetail}
        isDone={selectedRestaurant ? isDone(selectedRestaurant.id) : false}
        onToggleDone={selectedRestaurant ? () => toggleDone(selectedRestaurant.id) : () => {}}
      />
    </main>
  );
}
