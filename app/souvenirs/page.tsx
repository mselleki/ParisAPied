"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRestaurantPhotos } from "@/hooks/useRestaurantPhotos";
import { useDoneRestaurants } from "@/hooks/useDoneRestaurants";
import restaurantsData from "@/data/restaurants.json";
import { Restaurant } from "@/types/restaurant";

export default function SouvenirsPage() {
  const allRestaurants = restaurantsData.restaurants as Restaurant[];
  const { doneIds } = useDoneRestaurants();
  const { getAllPhotos } = useRestaurantPhotos();
  const [selectedRestaurant, setSelectedRestaurant] = useState<number | null>(null);

  const photos = getAllPhotos();
  const doneRestaurants = allRestaurants.filter((r) => doneIds.includes(r.id));

  const photosByRestaurant = useMemo(() => {
    const grouped: Record<number, typeof photos> = {};
    photos.forEach((photo) => {
      if (!grouped[photo.restaurantId]) {
        grouped[photo.restaurantId] = [];
      }
      grouped[photo.restaurantId].push(photo);
    });
    return grouped;
  }, [photos]);

  const sortedPhotos = useMemo(() => {
    return photos.sort((a, b) => b.timestamp - a.timestamp);
  }, [photos]);

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-orange-600 text-white p-5 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="text-white/90 hover:text-white text-sm font-medium"
          >
            ← Retour
          </Link>
          <h1 className="text-2xl font-bold">📸 Nos souvenirs</h1>
          <div className="w-14" />
        </div>
      </header>

      <div className="flex-1 p-5 max-w-4xl mx-auto w-full">
        {photos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              Aucune photo souvenir pour l&apos;instant.
            </p>
            <p className="text-sm text-gray-400">
              Coche des restos comme &quot;fait&quot; et ajoute des photos dans leur détail !
            </p>
          </div>
        ) : (
          <>
            {/* Stats rapides */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <div className="text-2xl font-bold text-emerald-600">{photos.length}</div>
                <div className="text-xs text-gray-500">Photos</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <div className="text-2xl font-bold text-orange-600">
                  {Object.keys(photosByRestaurant).length}
                </div>
                <div className="text-xs text-gray-500">Restos</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <div className="text-2xl font-bold text-gray-600">{doneRestaurants.length}</div>
                <div className="text-xs text-gray-500">Visités</div>
              </div>
            </div>

            {/* Filtre par resto */}
            {doneRestaurants.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRestaurant(null)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      selectedRestaurant === null
                        ? "bg-emerald-600 text-white"
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Tous
                  </button>
                  {doneRestaurants.map((resto) => (
                    <button
                      key={resto.id}
                      type="button"
                      onClick={() => setSelectedRestaurant(resto.id)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        selectedRestaurant === resto.id
                          ? "bg-emerald-600 text-white"
                          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {resto.nom}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Grille de photos */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {sortedPhotos
                .filter(
                  (photo) =>
                    selectedRestaurant === null || photo.restaurantId === selectedRestaurant
                )
                .map((photo, idx) => {
                  const resto = allRestaurants.find((r) => r.id === photo.restaurantId);
                  return (
                    <motion.div
                      key={`${photo.restaurantId}-${photo.timestamp}`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="relative group aspect-square bg-gray-200 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow"
                    >
                      <img
                        src={photo.photoUrl}
                        alt={resto?.nom || "Souvenir"}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                          <div className="font-semibold text-sm">{resto?.nom}</div>
                          <div className="text-xs opacity-90">
                            {new Date(photo.timestamp).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
