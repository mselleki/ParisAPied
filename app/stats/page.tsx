"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useDoneRestaurants } from "@/hooks/useDoneRestaurants";
import { useRestaurantNotes } from "@/hooks/useRestaurantNotes";
import { useRestaurantPhotos } from "@/hooks/useRestaurantPhotos";
import restaurantsData from "@/data/restaurants.json";
import { Restaurant } from "@/types/restaurant";

function loadOrder(key: "moi" | "marianne"): number[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`paris-a-pied-classement-${key}`);
    if (!raw) return null;
    const ids = JSON.parse(raw) as number[];
    return Array.isArray(ids) ? ids : null;
  } catch {
    return null;
  }
}

export default function StatsPage() {
  const allRestaurants = restaurantsData.restaurants as Restaurant[];
  const { doneIds } = useDoneRestaurants();
  const { notes } = useRestaurantNotes();
  const { getAllPhotos } = useRestaurantPhotos();

  const stats = useMemo(() => {
    const doneRestaurants = allRestaurants.filter((r) => doneIds.includes(r.id));
    const photos = getAllPhotos();
    const moiOrder = loadOrder("moi") || [];
    const marianneOrder = loadOrder("marianne") || [];

    // Distance totale (approximative, en km)
    let totalDistance = 0;
    for (let i = 0; i < doneRestaurants.length - 1; i++) {
      const r1 = doneRestaurants[i];
      const r2 = doneRestaurants[i + 1];
      const lat1 = (r1.lat * Math.PI) / 180;
      const lat2 = (r2.lat * Math.PI) / 180;
      const dLat = ((r2.lat - r1.lat) * Math.PI) / 180;
      const dLon = ((r2.lon - r1.lon) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      totalDistance += 6371 * c; // Rayon de la Terre en km
    }

    // Notes moyennes
    let totalMoiNotes = 0;
    let countMoiNotes = 0;
    let totalMarianneNotes = 0;
    let countMarianneNotes = 0;

    Object.values(notes).forEach((restoNotes) => {
      if (restoNotes.moi?.note) {
        totalMoiNotes += restoNotes.moi.note;
        countMoiNotes++;
      }
      if (restoNotes.marianne?.note) {
        totalMarianneNotes += restoNotes.marianne.note;
        countMarianneNotes++;
      }
    });

    const avgMoiNote = countMoiNotes > 0 ? totalMoiNotes / countMoiNotes : 0;
    const avgMarianneNote = countMarianneNotes > 0 ? totalMarianneNotes / countMarianneNotes : 0;

    // Quartiers visités
    const quartiers = new Set(doneRestaurants.map((r) => r.quartier));

    // Types de restos
    const types = new Map<string, number>();
    doneRestaurants.forEach((r) => {
      types.set(r.type, (types.get(r.type) || 0) + 1);
    });

    // Resto préféré commun (premier dans les deux classements)
    let favoriteResto: Restaurant | null = null;
    if (moiOrder.length > 0 && marianneOrder.length > 0) {
      const moiFirst = allRestaurants.find((r) => r.id === moiOrder[0]);
      const marianneFirst = allRestaurants.find((r) => r.id === marianneOrder[0]);
      if (moiFirst && marianneFirst && moiFirst.id === marianneFirst.id) {
        favoriteResto = moiFirst;
      }
    }

    return {
      totalVisited: doneRestaurants.length,
      totalRestaurants: allRestaurants.length,
      totalPhotos: photos.length,
      totalDistance: Math.round(totalDistance * 10) / 10,
      quartiersVisited: quartiers.size,
      avgMoiNote: Math.round(avgMoiNote * 10) / 10,
      avgMarianneNote: Math.round(avgMarianneNote * 10) / 10,
      typesDistribution: Array.from(types.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
      favoriteResto,
    };
  }, [allRestaurants, doneIds, notes, getAllPhotos]);

  const progressPercent = (stats.totalVisited / stats.totalRestaurants) * 100;

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
          <h1 className="text-2xl font-bold">📊 Statistiques</h1>
          <div className="w-14" />
        </div>
      </header>

      <div className="flex-1 p-5 max-w-4xl mx-auto w-full space-y-6">
        {/* Progression globale */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <h2 className="text-lg font-bold text-gray-900 mb-4">Progression</h2>
          <div className="mb-2">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>
                {stats.totalVisited} / {stats.totalRestaurants} restos visités
              </span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-emerald-500 to-orange-500"
              />
            </div>
          </div>
        </motion.div>

        {/* Stats principales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-center"
          >
            <div className="text-3xl font-bold text-emerald-600">{stats.totalVisited}</div>
            <div className="text-xs text-gray-500 mt-1">Restos visités</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-center"
          >
            <div className="text-3xl font-bold text-orange-600">{stats.totalPhotos}</div>
            <div className="text-xs text-gray-500 mt-1">Photos</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-center"
          >
            <div className="text-3xl font-bold text-blue-600">{stats.totalDistance}</div>
            <div className="text-xs text-gray-500 mt-1">km parcourus</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-center"
          >
            <div className="text-3xl font-bold text-purple-600">{stats.quartiersVisited}</div>
            <div className="text-xs text-gray-500 mt-1">Quartiers</div>
          </motion.div>
        </div>

        {/* Notes moyennes */}
        {(stats.avgMoiNote > 0 || stats.avgMarianneNote > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
          >
            <h2 className="text-lg font-bold text-gray-900 mb-4">Notes moyennes</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600 mb-2">👤 Ilyass</div>
                <div className="text-2xl font-bold text-emerald-600">
                  {stats.avgMoiNote > 0 ? `${stats.avgMoiNote}/5` : "—"}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-2">🌸 Marianne</div>
                <div className="text-2xl font-bold text-orange-600">
                  {stats.avgMarianneNote > 0 ? `${stats.avgMarianneNote}/5` : "—"}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Distribution par type */}
        {stats.typesDistribution.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
          >
            <h2 className="text-lg font-bold text-gray-900 mb-4">Types de restos visités</h2>
            <div className="space-y-3">
              {stats.typesDistribution.map(([type, count], idx) => {
                const maxCount = Math.max(...stats.typesDistribution.map(([, c]) => c));
                const widthPercent = (count / maxCount) * 100;
                return (
                  <div key={type}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700 capitalize">{type}</span>
                      <span className="text-gray-500">{count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${widthPercent}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.1 }}
                        className="h-full bg-gradient-to-r from-emerald-500 to-orange-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Resto préféré commun */}
        {stats.favoriteResto && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gradient-to-r from-emerald-50 to-orange-50 p-6 rounded-xl border-2 border-emerald-200"
          >
            <h2 className="text-lg font-bold text-gray-900 mb-2">🏆 Votre resto préféré commun</h2>
            <p className="text-xl font-semibold text-emerald-700">{stats.favoriteResto.nom}</p>
            <p className="text-sm text-gray-600 mt-1">{stats.favoriteResto.quartier}</p>
          </motion.div>
        )}
      </div>
    </main>
  );
}
