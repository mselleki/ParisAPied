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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] mx-4 bg-white rounded-2xl shadow-2xl z-50 overflow-y-auto border border-gray-200"
          >
            <div className="p-6 md:p-8">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {restaurant.nom}
                  </h2>
                  <p className="text-gray-600">{restaurant.quartier}</p>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors text-gray-600 hover:text-gray-900"
                  aria-label="Fermer"
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <div className="space-y-6">
                {/* Adresse */}
                <div className="flex items-start gap-4">
                  <div className="text-2xl">📍</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Adresse</h3>
                    <p className="text-gray-600">{restaurant.adresse}</p>
                  </div>
                </div>

                {/* Note */}
                {restaurant.note && (
                  <div className="flex items-start gap-4">
                    <div className="text-2xl">⭐</div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Note</h3>
                      <p className="text-gray-600">{restaurant.note} / 5</p>
                    </div>
                  </div>
                )}

                {/* Horaires */}
                {restaurant.horaires && (
                  <div className="flex items-start gap-4">
                    <div className="text-2xl">🕐</div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Horaires</h3>
                      <p className="text-gray-600">{restaurant.horaires}</p>
                    </div>
                  </div>
                )}

                {/* Type */}
                {restaurant.type && (
                  <div className="flex items-start gap-4">
                    <div className="text-2xl">🍽️</div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Type</h3>
                      <p className="text-gray-600 capitalize">{restaurant.type}</p>
                    </div>
                  </div>
                )}

                {/* Liens */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  {restaurant.site && (
                    <a
                      href={restaurant.site}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium shadow-lg"
                    >
                      🌐 Site web
                    </a>
                  )}
                  {restaurant.instagram && (
                    <a
                      href={`https://instagram.com/${restaurant.instagram.replace("@", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-colors font-medium shadow-lg"
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
