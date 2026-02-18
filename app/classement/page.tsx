"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, Reorder } from "framer-motion";
import { Restaurant } from "@/types/restaurant";
import restaurantsData from "@/data/restaurants.json";

const STORAGE_PREFIX = "paris-a-pied-classement-";
type UserKey = "moi" | "marianne";

const userLabels: Record<UserKey, string> = {
  moi: "Mon classement",
  marianne: "Classement de Marianne",
};

function loadOrder(key: UserKey): number[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return null;
    const ids = JSON.parse(raw) as number[];
    return Array.isArray(ids) ? ids : null;
  } catch {
    return null;
  }
}

function saveOrder(key: UserKey, ids: number[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(ids));
  } catch {}
}

export default function ClassementPage() {
  const restaurants = (restaurantsData.restaurants as Restaurant[]).slice();
  const [user, setUser] = useState<UserKey | null>(null);
  const [ordered, setOrdered] = useState<Restaurant[]>([]);

  const orderedRestaurants = useMemo(() => {
    if (ordered.length > 0) return ordered;
    const ids = user ? loadOrder(user) : null;
    if (ids && ids.length > 0) {
      const byId = new Map(restaurants.map((r) => [r.id, r]));
      const fromSaved = ids.map((id) => byId.get(id)).filter(Boolean) as Restaurant[];
      const savedIds = new Set(ids);
      const appended = restaurants.filter((r) => !savedIds.has(r.id));
      return [...fromSaved, ...appended];
    }
    return restaurants;
  }, [user, ordered, restaurants]);

  useEffect(() => {
    if (!user) return;
    setOrdered([]);
  }, [user]);

  useEffect(() => {
    if (!user || orderedRestaurants.length === 0) return;
    saveOrder(user, orderedRestaurants.map((r) => r.id));
  }, [user, orderedRestaurants]);

  const handleReorder = (newOrder: Restaurant[]) => {
    setOrdered(newOrder);
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-orange-600 text-white p-5 shadow-lg">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="text-white/90 hover:text-white text-sm font-medium"
          >
            ← Retour
          </Link>
          <h1 className="text-2xl font-bold">Classement</h1>
          <div className="w-14" />
        </div>
      </header>

      <div className="flex-1 p-5 max-w-2xl mx-auto w-full">
        {user === null ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <p className="text-gray-600 text-center">
              Qui es-tu ? Choisis ta zone pour éditer ton classement.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {(["moi", "marianne"] as const).map((u) => (
                <motion.button
                  key={u}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setUser(u)}
                  className="p-8 rounded-2xl bg-white border-2 border-gray-200 hover:border-emerald-400 shadow-md hover:shadow-xl transition-all text-center"
                >
                  <span className="text-4xl mb-2 block">
                    {u === "moi" ? "👤" : "🌸"}
                  </span>
                  <span className="font-bold text-lg text-gray-900">
                    {u === "moi" ? "Moi" : "Marianne"}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {userLabels[user]}
              </h2>
              <button
                type="button"
                onClick={() => setUser(null)}
                className="text-sm text-gray-500 hover:text-emerald-600"
              >
                Changer de zone
              </button>
            </div>

            <p className="text-gray-500 text-sm mb-4">
              Glisse les cartes pour les réordonner. Le premier = ton préféré.
            </p>

            <Reorder.Group
              axis="y"
              values={orderedRestaurants}
              onReorder={handleReorder}
              className="space-y-3"
            >
              {orderedRestaurants.map((restaurant, index) => (
                <Reorder.Item
                  key={restaurant.id}
                  value={restaurant}
                  className="cursor-grab active:cursor-grabbing list-none"
                >
                  <motion.div
                    layout
                    className="flex items-center gap-4 p-4 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-sm">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900">
                        {restaurant.nom}
                      </div>
                      <div className="text-sm text-gray-500">
                        {restaurant.quartier}
                      </div>
                    </div>
                    <span className="text-gray-400">⋮⋮</span>
                  </motion.div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </>
        )}
      </div>
    </main>
  );
}
