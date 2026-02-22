"use client";

import { useState, useEffect } from "react";
import { pushSync } from "@/lib/sync";

const STORAGE_KEY = "paris-a-pied-ssp-ids";

function loadSspIds(allIds: number[]): number[] {
  if (typeof window === "undefined") return [...allIds];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...allIds];
    const parsed = JSON.parse(raw) as number[];
    if (!Array.isArray(parsed)) return [...allIds];
    const valid = parsed.filter((id) => allIds.includes(id));
    const missing = allIds.filter((id) => !valid.includes(id));
    return missing.length > 0 ? [...valid, ...missing] : valid;
  } catch {
    return [...allIds];
  }
}

function saveSspIds(ids: number[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    pushSync();
  } catch {
    // ignore
  }
}

export function useSsp(allRestaurantIds: number[]) {
  const [sspIds, setSspIds] = useState<number[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const loaded = loadSspIds(allRestaurantIds);
    setSspIds(loaded);
    if (typeof window !== "undefined" && !localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(loaded));
    }
    setInitialized(true);
  }, [allRestaurantIds.join(",")]);

  const addToSsp = (id: number) => {
    setSspIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      saveSspIds(next);
      return next;
    });
  };

  const removeFromSsp = (id: number) => {
    setSspIds((prev) => {
      const next = prev.filter((x) => x !== id);
      saveSspIds(next);
      return next;
    });
  };

  const toggleSsp = (id: number) => {
    setSspIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      saveSspIds(next);
      return next;
    });
  };

  const effectiveSspIds = initialized ? sspIds : allRestaurantIds;
  const isInSsp = (id: number) => effectiveSspIds.includes(id);

  return { sspIds: effectiveSspIds, addToSsp, removeFromSsp, toggleSsp, isInSsp };
}
