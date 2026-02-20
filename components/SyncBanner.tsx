"use client";

import { useState, useEffect } from "react";
import {
  getRoomId,
  setRoomId,
  clearRoomId,
  pullSync,
  generateRoomId,
} from "@/lib/sync";

export default function SyncBanner() {
  const [roomId, setRoomIdState] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState("");
  const [showPanel, setShowPanel] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setRoomIdState(getRoomId());
  }, []);

  const handleCreate = () => {
    const id = generateRoomId();
    setRoomId(id);
    setRoomIdState(id);
    setShowPanel(false);
  };

  const handleJoin = async () => {
    const code = joinCode.trim().toLowerCase().replace(/\s/g, "");
    if (!code) return;
    setRoomId(code);
    setRoomIdState(code);
    setJoinCode("");
    const ok = await pullSync();
    setShowPanel(false);
    if (ok) window.location.reload();
  };

  const handleDisconnect = () => {
    clearRoomId();
    setRoomIdState(null);
    setShowPanel(false);
  };

  if (!mounted) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowPanel(!showPanel)}
        className="px-2 py-1.5 md:px-3 md:py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs md:text-sm font-medium flex items-center gap-1"
        title="Synchronisation multi-appareils"
      >
        {roomId ? "🔗 Sync" : "🔗"}
      </button>

      {showPanel && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowPanel(false)}
            aria-hidden
          />
          <div className="absolute right-0 top-full mt-2 w-72 md:w-80 bg-white rounded-xl shadow-xl border border-gray-200 p-4 z-50">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">
              Synchronisation
            </h3>
            {roomId ? (
              <div>
                <p className="text-xs text-gray-600 mb-2">
                  Code de la pièce (partage-le pour synchroniser avec un autre appareil) :
                </p>
                <p className="font-mono text-sm bg-gray-100 p-2 rounded break-all mb-3">
                  {roomId}
                </p>
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  Désactiver la sync
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleCreate}
                  className="w-full py-2 px-3 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700"
                >
                  Créer un code
                </button>
                <div>
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    placeholder="Coller le code"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-500 mb-2"
                  />
                  <button
                    type="button"
                    onClick={handleJoin}
                    className="w-full py-2 px-3 rounded-lg bg-gray-800 text-white text-sm font-medium hover:bg-gray-900"
                  >
                    Rejoindre
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
