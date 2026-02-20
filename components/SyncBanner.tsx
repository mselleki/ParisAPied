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

  // Pas encore connecté : bannière toujours visible (aucun clic sur "Sync" nécessaire)
  if (!roomId) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-white/90 text-xs md:text-sm">Synchroniser :</span>
        <input
          type="text"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
          placeholder="Coller le code"
          className="px-2 py-1.5 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 w-28 md:w-36"
        />
        <button
          type="button"
          onClick={handleJoin}
          className="px-2 py-1.5 rounded-lg bg-white/30 hover:bg-white/40 text-white text-xs md:text-sm font-medium"
        >
          Rejoindre
        </button>
        <span className="text-white/70 text-xs">ou</span>
        <button
          type="button"
          onClick={handleCreate}
          className="px-2 py-1.5 rounded-lg bg-white/30 hover:bg-white/40 text-white text-xs md:text-sm font-medium"
        >
          Créer un code
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-1.5">
        <span className="hidden sm:inline font-mono text-xs text-white/90 truncate max-w-[8rem] md:max-w-[10rem]" title={roomId}>
          {roomId}
        </span>
        <button
          type="button"
          onClick={() => setShowPanel(!showPanel)}
          className="px-2 py-1.5 md:px-3 md:py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs md:text-sm font-medium flex items-center gap-1"
          title="Synchronisation multi-appareils"
        >
          🔗 Sync
        </button>
      </div>

      {showPanel && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowPanel(false)}
            aria-hidden
          />
          <div className="absolute right-0 top-full mt-2 w-72 md:w-80 max-h-[85vh] overflow-y-auto bg-white rounded-xl shadow-xl border border-gray-200 p-4 z-50">
            <h3 className="font-semibold text-gray-900 mb-3 text-base">
              Synchronisation
            </h3>
            <div>
              <p className="text-sm text-gray-700 mb-2">
                Code de la pièce — partage-le pour synchroniser avec un autre appareil :
              </p>
              <p className="font-mono text-sm bg-gray-100 p-2.5 rounded break-all mb-2 text-gray-900">
                {roomId}
              </p>
              <p className="text-xs text-gray-500 mb-3">
                Les données se mettent à jour automatiquement (Redis = source de vérité).
              </p>
              <button
                type="button"
                onClick={handleDisconnect}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Désactiver la sync
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
