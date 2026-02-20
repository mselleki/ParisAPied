import { NextRequest, NextResponse } from "next/server";

/**
 * Sync API: GET returns state for a room, POST saves state.
 * Uses Upstash Redis REST API when KV_REST_API_URL + KV_REST_API_TOKEN are set
 * (add "Vercel KV" or "Upstash Redis" in Vercel project settings).
 * Fallback: in-memory (resets on cold start, for local dev).
 */
const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;
const store = new Map<string, unknown>();

async function kvGet(key: string): Promise<unknown> {
  if (KV_URL && KV_TOKEN) {
    try {
      const url = `${KV_URL.replace(/\/$/, "")}/get/${encodeURIComponent(key)}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${KV_TOKEN}` },
      });
      if (!res.ok) return undefined;
      const json = await res.json();
      const raw = json.result ?? undefined;
      if (typeof raw === "string") {
        try {
          return JSON.parse(raw);
        } catch {
          return raw;
        }
      }
      return raw;
    } catch {
      return undefined;
    }
  }
  return store.get(key);
}

async function kvSet(key: string, value: unknown): Promise<void> {
  const payload = JSON.stringify(value);
  if (KV_URL && KV_TOKEN) {
    try {
      const url = `${KV_URL.replace(/\/$/, "")}/set/${encodeURIComponent(key)}`;
      await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${KV_TOKEN}`, "Content-Type": "application/json" },
        body: payload,
      });
    } catch {
      // ignore
    }
    return;
  }
  store.set(key, value);
}

const KEY_PREFIX = "paris-a-pied-sync:";

export async function GET(request: NextRequest) {
  const room = request.nextUrl.searchParams.get("room");
  if (!room || room.length > 64) {
    return NextResponse.json({ error: "Invalid room" }, { status: 400 });
  }
  const key = KEY_PREFIX + room;
  const data = await kvGet(key);
  if (data == null) return NextResponse.json({});
  try {
    const parsed = typeof data === "string" ? JSON.parse(data) : data;
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({});
  }
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { room: roomId, data } = body as { room?: string; data?: unknown };
  if (!roomId || typeof roomId !== "string" || roomId.length > 64) {
    return NextResponse.json({ error: "Invalid room" }, { status: 400 });
  }
  const key = KEY_PREFIX + roomId;
  await kvSet(key, data ?? {});
  return NextResponse.json({ ok: true });
}
