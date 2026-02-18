"use client";

import { useState } from "react";
import { Restaurant } from "@/types/restaurant";
import RestaurantList from "@/components/RestaurantList";
import MapView from "@/components/MapView";
import RestaurantDetail from "@/components/RestaurantDetail";
import restaurantsData from "@/data/restaurants.json";
import { motion, AnimatePresence } from "framer-motion";
import { useDoneRestaurants } from "@/hooks/useDoneRestaurants";

export default function Home() {
  const [viewMode, setViewMode] = useState<"list" | "map" | "split">("split");
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const { doneIds, toggleDone, isDone } = useDoneRestaurants();

  const restaurants = restaurantsData.restaurants as Restaurant[];

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
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Paris à Pied</h1>
          <p className="text-base md:text-lg opacity-90">
            Tour des petites adresses parisiennes
          </p>
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
                restaurants={restaurants}
                selectedRestaurant={selectedRestaurant}
                onSelectRestaurant={handleSelectRestaurant}
                doneIds={doneIds}
                onToggleDone={toggleDone}
                isDone={isDone}
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
                restaurants={restaurants}
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
                  restaurants={restaurants}
                  selectedRestaurant={selectedRestaurant}
                  onSelectRestaurant={handleSelectRestaurant}
                  doneIds={doneIds}
                  onToggleDone={toggleDone}
                  isDone={isDone}
                />
              </div>
              <div className="w-full md:w-1/2 overflow-hidden">
                <MapView
                  restaurants={restaurants}
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
