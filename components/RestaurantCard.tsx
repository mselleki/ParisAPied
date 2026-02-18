"use client";

import { Restaurant } from "@/types/restaurant";
import { motion } from "framer-motion";

interface RestaurantCardProps {
  restaurant: Restaurant;
  isSelected: boolean;
  onClick: () => void;
  index: number;
  isDone: boolean;
  onToggleDone: (e: React.MouseEvent) => void;
}

export default function RestaurantCard({
  restaurant,
  isSelected,
  onClick,
  index,
  isDone,
  onToggleDone,
}: RestaurantCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="relative"
    >
      <motion.button
        whileHover={{ scale: 1.01, y: -2 }}
        whileTap={{ scale: 0.99 }}
        onClick={onClick}
        className={`w-full text-left p-5 rounded-2xl transition-all duration-300 ${
          isSelected
            ? "bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 text-white shadow-xl shadow-emerald-500/40 border-2 border-emerald-400/50"
            : "bg-white hover:bg-gray-50 border border-gray-200 hover:border-emerald-300 shadow-md hover:shadow-lg"
        } ${isDone ? "opacity-90" : ""}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 pr-10">
            <h3 className={`font-bold text-xl mb-2 ${isSelected ? "text-white" : "text-gray-900"} ${isDone ? "line-through opacity-80" : ""}`}>
              {restaurant.nom}
            </h3>
            <p className={`text-sm mb-3 leading-relaxed ${isSelected ? "text-white/90" : "text-gray-600"} ${isDone ? "opacity-75" : ""}`}>
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
          <div className="flex items-center gap-2 flex-shrink-0 absolute top-4 right-4">
            <button
              type="button"
              onClick={onToggleDone}
              className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all touch-manipulation ${
                isDone
                  ? "bg-emerald-600 border-emerald-600 text-white"
                  : isSelected
                    ? "border-white/50 text-white hover:bg-white/20"
                    : "border-gray-300 text-gray-400 hover:border-emerald-500 hover:text-emerald-600"
              }`}
              aria-label={isDone ? "Marquer comme non fait" : "Marquer comme fait"}
            >
              {isDone ? "✓" : ""}
            </button>
            <div className={`w-3 h-3 rounded-full transition-all ${
              isSelected ? "bg-white shadow-lg" : "bg-emerald-500"
            }`} />
          </div>
        </div>
      </motion.button>
    </motion.div>
  );
}
