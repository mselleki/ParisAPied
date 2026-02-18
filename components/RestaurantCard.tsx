"use client";

import { Restaurant } from "@/types/restaurant";
import { motion } from "framer-motion";

interface RestaurantCardProps {
  restaurant: Restaurant;
  isSelected: boolean;
  onClick: () => void;
  index: number;
}

export default function RestaurantCard({
  restaurant,
  isSelected,
  onClick,
  index,
}: RestaurantCardProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ scale: 1.01, y: -2 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={`w-full text-left p-5 rounded-2xl transition-all duration-300 ${
        isSelected
          ? "bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 text-white shadow-xl shadow-emerald-500/40 border-2 border-emerald-400/50"
          : "bg-white hover:bg-gray-50 border border-gray-200 hover:border-emerald-300 shadow-md hover:shadow-lg"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className={`font-bold text-xl mb-2 ${isSelected ? "text-white" : "text-gray-900"}`}>
            {restaurant.nom}
          </h3>
          <p className={`text-sm mb-3 leading-relaxed ${isSelected ? "text-white/90" : "text-gray-600"}`}>
            {restaurant.adresse}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${
              isSelected 
                ? "bg-white/20 text-white backdrop-blur-sm" 
                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
            }`}>
              📍 {restaurant.quartier}
            </span>
            {restaurant.note && (
              <span className={`text-xs flex items-center gap-1.5 px-2 ${
                isSelected ? "text-white/90" : "text-gray-600"
              }`}>
                ⭐ <span className="font-semibold">{restaurant.note}</span>
              </span>
            )}
            {restaurant.type && (
              <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                isSelected 
                  ? "bg-white/20 text-white backdrop-blur-sm" 
                  : "bg-orange-50 text-orange-700 border border-orange-200"
              }`}>
                {restaurant.type}
              </span>
            )}
          </div>
        </div>
        <div className={`flex-shrink-0 w-3 h-3 rounded-full transition-all ${
          isSelected ? "bg-white shadow-lg" : "bg-emerald-500"
        }`} />
      </div>
    </motion.button>
  );
}
