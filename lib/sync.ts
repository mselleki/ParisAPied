/**
 * Sync: Redis (or KV) is the source of truth, like a Postgres DB.
 * - On load: we pull from API and apply to localStorage (local cache).
 * - On change: we push to API; polling on other devices pulls and refreshes.
 * No "sync button" needed after initial setup (create or join room).
 * Photos are not synced (too heavy).
 */
const ROOM_KEY = "paris-a-pied-room";
const DONE_KEY = "paris-a-pied-done";
const CLASSEMENT_PREFIX = "paris-a-pied-classement-";
const NOTES_KEY = "paris-a-pied-notes-all";

export type SyncPayload = {
  doneIds: number[];
  classementMoi: number[];
  classementMarianne: number[];
  validatedMoi: boolean;
  validatedMarianne: boolean;
  notes: Record<string, { moi?: { note: number | null; comment: string | null }; marianne?: { note: number | null; comment: string | null } }>;
};

export function getRoomId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ROOM_KEY);
}

export function setRoomId(roomId: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ROOM_KEY, roomId);
}

export function clearRoomId() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ROOM_KEY);
}

function getJson<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function buildPayload(): SyncPayload {
  return {
    doneIds: getJson(DONE_KEY, []),
    classementMoi: getJson(CLASSEMENT_PREFIX + "moi", []),
    classementMarianne: getJson(CLASSEMENT_PREFIX + "marianne", []),
    validatedMoi: localStorage.getItem(CLASSEMENT_PREFIX + "moi" + "-validated") === "1",
    validatedMarianne: localStorage.getItem(CLASSEMENT_PREFIX + "marianne" + "-validated") === "1",
    notes: getJson(NOTES_KEY, {}),
  };
}

export function applyPayload(payload: SyncPayload) {
  if (typeof window === "undefined") return;
  localStorage.setItem(DONE_KEY, JSON.stringify(payload.doneIds ?? []));
  localStorage.setItem(CLASSEMENT_PREFIX + "moi", JSON.stringify(payload.classementMoi ?? []));
  localStorage.setItem(CLASSEMENT_PREFIX + "marianne", JSON.stringify(payload.classementMarianne ?? []));
  localStorage.setItem(CLASSEMENT_PREFIX + "moi-validated", (payload.validatedMoi ? "1" : "0"));
  localStorage.setItem(CLASSEMENT_PREFIX + "marianne-validated", (payload.validatedMarianne ? "1" : "0"));
  localStorage.setItem(NOTES_KEY, JSON.stringify(payload.notes ?? {}));
}

let pushTimeout: ReturnType<typeof setTimeout> | null = null;
const PUSH_DEBOUNCE_MS = 1500;

export function pushSync() {
  const roomId = getRoomId();
  if (!roomId) return;

  if (pushTimeout) clearTimeout(pushTimeout);
  pushTimeout = setTimeout(async () => {
    pushTimeout = null;
    try {
      await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room: roomId, data: buildPayload() }),
      });
    } catch {
      // ignore
    }
  }, PUSH_DEBOUNCE_MS);
}

export async function pullSync(): Promise<boolean> {
  const roomId = getRoomId();
  if (!roomId) return false;
  try {
    const res = await fetch(`/api/sync?room=${encodeURIComponent(roomId)}`);
    if (!res.ok) return false;
    const data = await res.json();
    if (data && typeof data === "object") {
      applyPayload(data as SyncPayload);
      return true;
    }
  } catch {
    // ignore
  }
  return false;
}

export function generateRoomId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
