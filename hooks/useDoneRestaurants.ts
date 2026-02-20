"use client";

import { useState, useEffect } from "react";
import { pushSync } from "@/lib/sync";

const STORAGE_KEY = "paris-a-pied-done";

function loadDoneIds(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveDoneIds(ids: number[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // ignore
  }
}

export function useDoneRestaurants() {
  const [doneIds, setDoneIds] = useState<number[]>([]);

  useEffect(() => {
    setDoneIds(loadDoneIds());
  }, []);

  const toggleDone = (restaurantId: number) => {
    setDoneIds((prev) => {
      const next = prev.includes(restaurantId)
        ? prev.filter((id) => id !== restaurantId)
        : [...prev, restaurantId];
      saveDoneIds(next);
      pushSync();
      return next;
    });
  };

  const isDone = (restaurantId: number) => doneIds.includes(restaurantId);

  return { doneIds, toggleDone, isDone };
}
