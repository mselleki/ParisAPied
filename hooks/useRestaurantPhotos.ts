import { useState, useEffect } from "react";

const STORAGE_PREFIX = "paris-a-pied-photos-";

export interface RestaurantPhoto {
  restaurantId: number;
  photoUrl: string; // Data URL ou URL
  timestamp: number;
  userId?: "moi" | "marianne";
}

export interface RestaurantPhotos {
  [restaurantId: number]: RestaurantPhoto[];
}

function loadPhotos(): RestaurantPhotos {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + "all");
    if (!raw) return {};
    return JSON.parse(raw) as RestaurantPhotos;
  } catch {
    return {};
  }
}

function savePhotos(photos: RestaurantPhotos) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_PREFIX + "all", JSON.stringify(photos));
  } catch {}
}

export function useRestaurantPhotos() {
  const [photos, setPhotos] = useState<RestaurantPhotos>({});

  useEffect(() => {
    setPhotos(loadPhotos());
  }, []);

  const addPhoto = (
    restaurantId: number,
    photoUrl: string,
    userId?: "moi" | "marianne"
  ) => {
    setPhotos((prev) => {
      const next = { ...prev };
      if (!next[restaurantId]) {
        next[restaurantId] = [];
      }
      next[restaurantId].push({
        restaurantId,
        photoUrl,
        timestamp: Date.now(),
        userId,
      });
      savePhotos(next);
      return next;
    });
  };

  const removePhoto = (restaurantId: number, timestamp: number) => {
    setPhotos((prev) => {
      const next = { ...prev };
      if (next[restaurantId]) {
        next[restaurantId] = next[restaurantId].filter(
          (p) => p.timestamp !== timestamp
        );
        if (next[restaurantId].length === 0) {
          delete next[restaurantId];
        }
      }
      savePhotos(next);
      return next;
    });
  };

  const getPhotos = (restaurantId: number): RestaurantPhoto[] => {
    return photos[restaurantId] || [];
  };

  const getAllPhotos = (): RestaurantPhoto[] => {
    return Object.values(photos).flat();
  };

  return { photos, addPhoto, removePhoto, getPhotos, getAllPhotos };
}
