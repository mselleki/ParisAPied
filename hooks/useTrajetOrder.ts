"use client";

import { useState, useEffect, useMemo } from "react";
import { Restaurant } from "@/types/restaurant";
import { pushSync } from "@/lib/sync";

const STORAGE_KEY = "paris-a-pied-trajet-order";

function loadOrderIds(restaurantIds: number[]): number[] {
  if (typeof window === "undefined") return restaurantIds;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return restaurantIds;
    const parsed = JSON.parse(raw) as number[];
    if (!Array.isArray(parsed)) return restaurantIds;
    const valid = parsed.filter((id) => restaurantIds.includes(id));
    const missing = restaurantIds.filter((id) => !valid.includes(id));
    return [...valid, ...missing];
  } catch {
    return restaurantIds;
  }
}

function saveOrderIds(ids: number[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    pushSync();
  } catch {
    // ignore
  }
}

export function useTrajetOrder(restaurants: Restaurant[]): [Restaurant[], (newOrder: Restaurant[]) => void] {
  const ids = useMemo(() => restaurants.map((r) => r.id), [restaurants]);
  const [orderIds, setOrderIds] = useState<number[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    setOrderIds(loadOrderIds(ids));
    setInitialized(true);
  }, [ids.join(",")]);

  const orderedRestaurants = useMemo(() => {
    if (!initialized || orderIds.length === 0) return restaurants;
    const byId = new Map(restaurants.map((r) => [r.id, r]));
    const result: Restaurant[] = [];
    for (const id of orderIds) {
      const r = byId.get(id);
      if (r) result.push(r);
    }
    const remaining = restaurants.filter((r) => !orderIds.includes(r.id));
    return [...result, ...remaining];
  }, [restaurants, orderIds, initialized]);

  const setOrder = (newOrder: Restaurant[]) => {
    const newIds = newOrder.map((r) => r.id);
    setOrderIds(newIds);
    saveOrderIds(newIds);
  };

  return [orderedRestaurants, setOrder];
}
