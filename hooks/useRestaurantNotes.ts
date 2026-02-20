import { useState, useEffect } from "react";
import { pushSync } from "@/lib/sync";

const STORAGE_PREFIX = "paris-a-pied-notes-";

export interface RestaurantNote {
  userId: "moi" | "marianne";
  note: number | null; // 1-5
  comment: string | null;
}

export interface RestaurantNotes {
  [restaurantId: number]: {
    moi?: { note: number | null; comment: string | null };
    marianne?: { note: number | null; comment: string | null };
  };
}

function loadNotes(): RestaurantNotes {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + "all");
    if (!raw) return {};
    return JSON.parse(raw) as RestaurantNotes;
  } catch {
    return {};
  }
}

function saveNotes(notes: RestaurantNotes) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_PREFIX + "all", JSON.stringify(notes));
  } catch {}
}

export function useRestaurantNotes() {
  const [notes, setNotes] = useState<RestaurantNotes>({});

  useEffect(() => {
    setNotes(loadNotes());
  }, []);

  const setNote = (
    restaurantId: number,
    userId: "moi" | "marianne",
    note: number | null,
    comment: string | null
  ) => {
    setNotes((prev) => {
      const next = { ...prev };
      if (!next[restaurantId]) {
        next[restaurantId] = {};
      }
      next[restaurantId][userId] = { note, comment };
      saveNotes(next);
      pushSync();
      return next;
    });
  };

  const getNote = (
    restaurantId: number,
    userId: "moi" | "marianne"
  ): RestaurantNote | null => {
    const restoNotes = notes[restaurantId];
    if (!restoNotes || !restoNotes[userId]) return null;
    return {
      userId,
      note: restoNotes[userId].note ?? null,
      comment: restoNotes[userId].comment ?? null,
    };
  };

  return { notes, setNote, getNote };
}
