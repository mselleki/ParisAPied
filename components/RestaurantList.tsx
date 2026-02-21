"use client";

import { Restaurant } from "@/types/restaurant";
import { useState, useMemo } from "react";
import RestaurantCard from "./RestaurantCard";
import { motion, AnimatePresence, Reorder } from "framer-motion";

interface RestaurantListProps {
  restaurants: Restaurant[];
  selectedRestaurant: Restaurant | null;
  onSelectRestaurant: (restaurant: Restaurant) => void;
  doneIds: number[];
  onToggleDone: (restaurantId: number) => void;
  isDone: (restaurantId: number) => boolean;
  onTrajetReorder?: (newOrder: Restaurant[]) => void;
}

export default function RestaurantList({
  restaurants,
  selectedRestaurant,
  onSelectRestaurant,
  doneIds,
  onToggleDone,
  isDone,
  onTrajetReorder,
}: RestaurantListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterQuartier, setFilterQuartier] = useState<string>("all");

  const types = useMemo(
    () => Array.from(new Set(restaurants.map((r) => r.type))),
    [restaurants]
  );

  const quartiers = useMemo(
    () => Array.from(new Set(restaurants.map((r) => r.quartier))).sort(),
    [restaurants]
  );

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((restaurant) => {
      const matchesSearch =
        restaurant.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurant.adresse.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurant.quartier.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = filterType === "all" || restaurant.type === filterType;
      const matchesQuartier =
        filterQuartier === "all" || restaurant.quartier === filterQuartier;

      return matchesSearch && matchesType && matchesQuartier;
    });
  }, [restaurants, searchTerm, filterType, filterQuartier]);

  const hasFilter = searchTerm !== "" || filterType !== "all" || filterQuartier !== "all";
  const filteredSet = useMemo(
    () => new Set(filteredRestaurants.map((r) => r.id)),
    [filteredRestaurants]
  );
  const filteredIndices = useMemo(
    () =>
      restaurants
        .map((r, i) => (filteredSet.has(r.id) ? i : -1))
        .filter((i) => i >= 0),
    [restaurants, filteredSet]
  );

  const handleReorder = (newFilteredOrder: Restaurant[]) => {
    if (!onTrajetReorder) return;
    if (!hasFilter) {
      onTrajetReorder(newFilteredOrder);
      return;
    }
    const newFull = [...restaurants];
    newFilteredOrder.forEach((r, j) => {
      newFull[filteredIndices[j]] = r;
    });
    onTrajetReorder(newFull);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Filtres */}
      <div className="p-5 bg-white border-b border-gray-200 space-y-4 sticky top-0 z-10 shadow-sm">
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher un restaurant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3.5 pl-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-white text-gray-900 placeholder:text-gray-400 text-base shadow-sm"
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
            🔍
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white text-gray-900 transition-all font-medium shadow-sm"
          >
            <option value="all">Tous les types</option>
            {types.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <select
            value={filterQuartier}
            onChange={(e) => setFilterQuartier(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white text-gray-900 transition-all font-medium shadow-sm"
          >
            <option value="all">Tous les quartiers</option>
            {quartiers.map((quartier) => (
              <option key={quartier} value={quartier}>
                {quartier}
              </option>
            ))}
          </select>
        </div>

        <motion.div
          key={filteredRestaurants.length}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-gray-600 font-medium flex items-center gap-2 flex-wrap"
        >
          {filteredRestaurants.length} restaurant
          {filteredRestaurants.length > 1 ? "s" : ""} trouvé
          {filteredRestaurants.length > 1 ? "s" : ""}
          {onTrajetReorder && (
            <span className="text-gray-400 font-normal">
              — Glisse pour modifier l’ordre du trajet
            </span>
          )}
        </motion.div>
      </div>

      {/* Liste (réordonnable par drag pour mettre à jour le trajet sur la carte) */}
      <div className="flex-1 overflow-y-auto p-5 bg-gray-50">
        <AnimatePresence mode="wait">
          {filteredRestaurants.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-12 text-center"
            >
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-gray-600 text-lg font-medium">
                Aucun restaurant trouvé
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Essayez de modifier vos filtres
              </p>
            </motion.div>
          ) : onTrajetReorder ? (
            <Reorder.Group
              axis="y"
              values={filteredRestaurants}
              onReorder={handleReorder}
              className="space-y-4"
            >
              {filteredRestaurants.map((restaurant, index) => (
                <Reorder.Item key={restaurant.id} value={restaurant}>
                  <RestaurantCard
                    restaurant={restaurant}
                    isSelected={selectedRestaurant?.id === restaurant.id}
                    onClick={() => onSelectRestaurant(restaurant)}
                    index={index}
                    isDone={isDone(restaurant.id)}
                    onToggleDone={(e) => {
                      e.stopPropagation();
                      onToggleDone(restaurant.id);
                    }}
                  />
                </Reorder.Item>
              ))}
            </Reorder.Group>
          ) : (
            <div className="space-y-4">
              {filteredRestaurants.map((restaurant, index) => (
                <RestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  isSelected={selectedRestaurant?.id === restaurant.id}
                  onClick={() => onSelectRestaurant(restaurant)}
                  index={index}
                  isDone={isDone(restaurant.id)}
                  onToggleDone={(e) => {
                    e.stopPropagation();
                    onToggleDone(restaurant.id);
                  }}
                />
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
