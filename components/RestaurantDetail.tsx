"use client";

import { Restaurant } from "@/types/restaurant";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

interface RestaurantDetailProps {
  restaurant: Restaurant | null;
  onClose: () => void;
}

export default function RestaurantDetail({
  restaurant,
  onClose,
}: RestaurantDetailProps) {
  useEffect(() => {
    if (restaurant) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [restaurant]);

  return (
    <AnimatePresence>
      {restaurant && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
          />

          {/* Modal - Bottom sheet sur mobile, centrée sur desktop */}
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 md:bottom-auto md:left-1/2 md:right-auto md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-full md:w-auto md:max-w-2xl max-h-[85vh] md:max-h-[90vh] bg-white rounded-t-3xl md:rounded-2xl shadow-2xl z-[101] overflow-y-auto border-t md:border border-gray-200"
            style={{
              // S'assurer que la modale est toujours visible
              maxHeight: "85vh",
            }}
          >
            {/* Handle bar pour mobile */}
            <div className="md:hidden flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </div>

            <div className="p-6 md:p-8">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1 min-w-0 pr-4">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    {restaurant.nom}
                  </h2>
                  <p className="text-gray-600">{restaurant.quartier}</p>
                </div>
                <button
                  onClick={onClose}
                  className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors text-gray-600 hover:text-gray-900"
                  aria-label="Fermer"
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <div className="space-y-6">
                {/* Adresse */}
                <div className="flex items-start gap-4">
                  <div className="text-2xl flex-shrink-0">📍</div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">Adresse</h3>
                    <p className="text-gray-600 break-words">{restaurant.adresse}</p>
                  </div>
                </div>

                {/* Note */}
                {restaurant.note && (
                  <div className="flex items-start gap-4">
                    <div className="text-2xl flex-shrink-0">⭐</div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Note</h3>
                      <p className="text-gray-600">{restaurant.note} / 5</p>
                    </div>
                  </div>
                )}

                {/* Horaires */}
                {restaurant.horaires && (
                  <div className="flex items-start gap-4">
                    <div className="text-2xl flex-shrink-0">🕐</div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Horaires</h3>
                      <p className="text-gray-600">{restaurant.horaires}</p>
                    </div>
                  </div>
                )}

                {/* Type */}
                {restaurant.type && (
                  <div className="flex items-start gap-4">
                    <div className="text-2xl flex-shrink-0">🍽️</div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Type</h3>
                      <p className="text-gray-600 capitalize">{restaurant.type}</p>
                    </div>
                  </div>
                )}

                {/* Liens */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                  {restaurant.site && (
                    <a
                      href={restaurant.site}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-5 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium shadow-lg text-center"
                    >
                      🌐 Site web
                    </a>
                  )}
                  {restaurant.instagram && (
                    <a
                      href={`https://instagram.com/${restaurant.instagram.replace("@", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-5 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-colors font-medium shadow-lg text-center"
                    >
                      📸 Instagram
                    </a>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
