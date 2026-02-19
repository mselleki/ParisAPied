"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import { Restaurant } from "@/types/restaurant";
import restaurantsData from "@/data/restaurants.json";
import { useDoneRestaurants } from "@/hooks/useDoneRestaurants";

const STORAGE_PREFIX = "paris-a-pied-classement-";
const VALIDATED_SUFFIX = "-validated";
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

function loadValidated(key: UserKey): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(STORAGE_PREFIX + key + VALIDATED_SUFFIX) === "1";
  } catch {
    return false;
  }
}

function setValidated(key: UserKey, value: boolean) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_PREFIX + key + VALIDATED_SUFFIX, value ? "1" : "0");
  } catch {}
}

export default function ClassementPage() {
  const allRestaurants = (restaurantsData.restaurants as Restaurant[]).slice();
  const { doneIds } = useDoneRestaurants();
  const [user, setUser] = useState<UserKey | null>(null);
  const [ordered, setOrdered] = useState<Restaurant[]>([]);
  const [validatedMoi, setValidatedMoi] = useState(false);
  const [validatedMarianne, setValidatedMarianne] = useState(false);
  const [showRevelations, setShowRevelations] = useState(false);

  const doneRestaurants = useMemo(
    () => allRestaurants.filter((r) => doneIds.includes(r.id)),
    [allRestaurants, doneIds]
  );
  const allDone = doneIds.length === allRestaurants.length;

  const orderedRestaurants = useMemo(() => {
    if (ordered.length > 0) return ordered;
    const ids = user ? loadOrder(user) : null;
    const byId = new Map(doneRestaurants.map((r) => [r.id, r]));
    if (ids && ids.length > 0) {
      const fromSaved = ids.map((id) => byId.get(id)).filter(Boolean) as Restaurant[];
      const savedIds = new Set(ids);
      const appended = doneRestaurants.filter((r) => !savedIds.has(r.id));
      return [...fromSaved, ...appended];
    }
    return doneRestaurants;
  }, [user, ordered, doneRestaurants]);

  useEffect(() => {
    setValidatedMoi(loadValidated("moi"));
    setValidatedMarianne(loadValidated("marianne"));
  }, [user, showRevelations]);

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

  const handleValidate = () => {
    if (user) {
      setValidated(user, true);
      if (user === "moi") setValidatedMoi(true);
      else setValidatedMarianne(true);
    }
  };

  const bothValidated = validatedMoi && validatedMarianne;

  const moiOrder = useMemo(() => {
    const ids = loadOrder("moi");
    if (!ids) return [];
    const byId = new Map(allRestaurants.map((r) => [r.id, r]));
    return ids.map((id) => byId.get(id)).filter(Boolean) as Restaurant[];
  }, [allRestaurants, validatedMoi, validatedMarianne, showRevelations]);

  const marianneOrder = useMemo(() => {
    const ids = loadOrder("marianne");
    if (!ids) return [];
    const byId = new Map(allRestaurants.map((r) => [r.id, r]));
    return ids.map((id) => byId.get(id)).filter(Boolean) as Restaurant[];
  }, [allRestaurants, validatedMoi, validatedMarianne, showRevelations]);

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
        {bothValidated && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <button
              type="button"
              onClick={() => setShowRevelations(true)}
              className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-orange-500 to-emerald-600 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all"
            >
              🏆 CLASSEMENT FINAL DES DEUX TOURTEREAUX ! RÉVÉLATIONS !
            </button>
          </motion.div>
        )}

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
                  className="p-8 rounded-2xl bg-white border-2 border-gray-200 hover:border-emerald-400 shadow-md hover:shadow-xl transition-all text-center relative"
                >
                  {(u === "moi" ? validatedMoi : validatedMarianne) && (
                    <span className="absolute top-3 right-3 text-emerald-500 text-xl" title="Validé">
                      ✓
                    </span>
                  )}
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

            {doneRestaurants.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Coche des restos en « fait » sur la page d&apos;accueil pour les
                classer ici.
              </p>
            ) : (
              <>
                <p className="text-gray-500 text-sm mb-4">
                  Tu ne peux classer que les restos cochés comme faits (
                  {doneRestaurants.length}/{allRestaurants.length}). Glisse pour
                  réordonner. Le premier = ton préféré.
                </p>

                {allDone && !(user === "moi" ? validatedMoi : validatedMarianne) && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mb-4"
                  >
                    <button
                      type="button"
                      onClick={handleValidate}
                      className="w-full py-3 px-4 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors"
                    >
                      Valider mon classement
                    </button>
                  </motion.div>
                )}

                {(user === "moi" ? validatedMoi : validatedMarianne) && (
                  <p className="text-emerald-600 font-medium text-sm mb-4">
                    ✓ Classement validé (figé)
                  </p>
                )}

                {(user === "moi" ? validatedMoi : validatedMarianne) ? (
                  <ul className="space-y-3 list-none">
                    {orderedRestaurants.map((restaurant, index) => (
                      <li
                        key={restaurant.id}
                        className="flex items-center gap-4 p-4 rounded-xl bg-white border border-gray-200 shadow-sm"
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
                      </li>
                    ))}
                  </ul>
                ) : (
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
                )}
              </>
            )}
          </>
        )}
      </div>

      <AnimatePresence>
        {showRevelations && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-[100]"
              onClick={() => setShowRevelations(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-h-[85vh] overflow-y-auto rounded-2xl bg-white shadow-2xl z-[101] p-6 max-w-2xl mx-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  🏆 Classement final des deux tourtereaux
                </h2>
                <button
                  type="button"
                  onClick={() => setShowRevelations(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
                  ×
                </button>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    👤 Moi
                  </h3>
                  <ol className="space-y-2">
                    {moiOrder.map((r, i) => (
                      <li
                        key={r.id}
                        className="flex items-center gap-2 text-sm text-gray-800"
                      >
                        <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs">
                          {i + 1}
                        </span>
                        {r.nom}
                      </li>
                    ))}
                  </ol>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    🌸 Marianne
                  </h3>
                  <ol className="space-y-2">
                    {marianneOrder.map((r, i) => (
                      <li
                        key={r.id}
                        className="flex items-center gap-2 text-sm text-gray-800"
                      >
                        <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 font-bold flex items-center justify-center text-xs">
                          {i + 1}
                        </span>
                        {r.nom}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}
