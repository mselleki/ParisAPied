"use client";

import { Restaurant } from "@/types/restaurant";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRestaurantNotes } from "@/hooks/useRestaurantNotes";
import { useRestaurantPhotos } from "@/hooks/useRestaurantPhotos";

interface RestaurantDetailProps {
  restaurant: Restaurant | null;
  onClose: () => void;
  isDone: boolean;
  onToggleDone: () => void;
  currentUser?: "moi" | "marianne";
}

export default function RestaurantDetail({
  restaurant,
  onClose,
  isDone,
  onToggleDone,
  currentUser = "moi",
}: RestaurantDetailProps) {
  const [mounted, setMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const { getNote, setNote } = useRestaurantNotes();
  const { getPhotos, addPhoto, removePhoto } = useRestaurantPhotos();
  const [showNotes, setShowNotes] = useState(false);
  const [showPhotos, setShowPhotos] = useState(false);
  const [photoInput, setPhotoInput] = useState<HTMLInputElement | null>(null);
  const [currentNote, setCurrentNote] = useState<number | null>(null);
  const [currentComment, setCurrentComment] = useState("");
  const [moiNote, setMoiNote] = useState<number | null>(null);
  const [moiComment, setMoiComment] = useState("");
  const [marianneNote, setMarianneNote] = useState<number | null>(null);
  const [marianneComment, setMarianneComment] = useState("");

  useEffect(() => {
    setMounted(true);
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  useEffect(() => {
    if (restaurant) {
      // Lock body scroll sur iOS
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
      
      // Charger les notes existantes
      const moiNoteData = getNote(restaurant.id, "moi");
      const marianneNoteData = getNote(restaurant.id, "marianne");
      setMoiNote(moiNoteData?.note ?? null);
      setMoiComment(moiNoteData?.comment ?? "");
      setMarianneNote(marianneNoteData?.note ?? null);
      setMarianneComment(marianneNoteData?.comment ?? "");
      
      // Charger la note de l'utilisateur actuel
      const currentNoteData = getNote(restaurant.id, currentUser);
      setCurrentNote(currentNoteData?.note ?? null);
      setCurrentComment(currentNoteData?.comment ?? "");
      
      return () => {
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        document.body.style.overflow = "";
        window.scrollTo(0, scrollY);
      };
    }
  }, [restaurant, getNote, currentUser]);

  const handleSaveNote = () => {
    if (!restaurant) return;
    setNote(restaurant.id, currentUser, currentNote, currentComment || null);
    // Recharger les notes après sauvegarde
    const moiNoteData = getNote(restaurant.id, "moi");
    const marianneNoteData = getNote(restaurant.id, "marianne");
    setMoiNote(moiNoteData?.note ?? null);
    setMoiComment(moiNoteData?.comment ?? "");
    setMarianneNote(marianneNoteData?.note ?? null);
    setMarianneComment(marianneNoteData?.comment ?? "");
    setShowNotes(false);
  };

  const modalContent = (
    <AnimatePresence>
      {restaurant && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: "100vw",
              height: "100vh",
              zIndex: 99998,
            }}
          />

          {/* Modal - Bottom sheet sur mobile, centrée sur desktop */}
          <motion.div
            initial={isDesktop ? { opacity: 0, scale: 0.95, x: "-50%", y: "-50%" } : { opacity: 0, y: "100%" }}
            animate={isDesktop ? { opacity: 1, scale: 1, x: "-50%", y: "-50%" } : { opacity: 1, y: 0 }}
            exit={isDesktop ? { opacity: 0, scale: 0.95, x: "-50%", y: "-50%" } : { opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 md:bottom-auto md:left-1/2 md:right-auto md:top-1/2 w-full md:w-auto md:max-w-2xl md:max-h-[85vh] bg-white rounded-t-3xl md:rounded-2xl shadow-2xl overflow-y-auto border-t md:border border-gray-200 md:mx-4"
            style={{
              maxHeight: isDesktop ? "85vh" : "calc(100dvh - env(safe-area-inset-bottom))",
              WebkitOverflowScrolling: "touch",
              zIndex: 99999,
              position: "fixed",
            }}
          >
            {/* Handle bar pour mobile */}
            <div className="md:hidden flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </div>

            <div className="p-6 md:p-8 pb-safe md:pb-8">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1 min-w-0 pr-4">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    {restaurant.nom}
                  </h2>
                  <p className="text-gray-600">{restaurant.quartier}</p>
                </div>
                <button
                  onClick={onClose}
                  className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 active:bg-gray-200 flex items-center justify-center transition-colors text-gray-600 active:text-gray-900 touch-manipulation"
                  aria-label="Fermer"
                  style={{
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Marquer comme fait */}
              <button
                type="button"
                onClick={onToggleDone}
                className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 font-medium transition-all mb-6 touch-manipulation ${
                  isDone
                    ? "bg-emerald-100 border-emerald-500 text-emerald-800"
                    : "bg-gray-50 border-gray-200 text-gray-700 hover:border-emerald-400 hover:bg-emerald-50"
                }`}
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                {isDone ? "✓ Fait" : "Marquer comme fait"}
              </button>

              {/* Content */}
              <div className="space-y-6">
                {/* Adresse */}
                <div className="flex items-start gap-4">
                  <div className="text-2xl flex-shrink-0">📍</div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">Adresse</h3>
                    <p className="text-gray-600 break-words">{restaurant.adresse}</p>
                  </div>
                </div>

                {/* Note */}
                {restaurant.note && (
                  <div className="flex items-start gap-4">
                    <div className="text-2xl flex-shrink-0">⭐</div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Note</h3>
                      <p className="text-gray-600">{restaurant.note} / 5</p>
                    </div>
                  </div>
                )}

                {/* Horaires */}
                {restaurant.horaires && (
                  <div className="flex items-start gap-4">
                    <div className="text-2xl flex-shrink-0">🕐</div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Horaires</h3>
                      <p className="text-gray-600">{restaurant.horaires}</p>
                    </div>
                  </div>
                )}

                {/* Type */}
                {restaurant.type && (
                  <div className="flex items-start gap-4">
                    <div className="text-2xl flex-shrink-0">🍽️</div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">Type</h3>
                      <p className="text-gray-600 capitalize break-words">{restaurant.type}</p>
                    </div>
                  </div>
                )}

                {/* Photos souvenirs */}
                {isDone && (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">Photos souvenirs</h3>
                      <button
                        type="button"
                        onClick={() => {
                          const input = document.createElement("input");
                          input.type = "file";
                          input.accept = "image/*";
                          input.capture = "environment";
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file && restaurant) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                const photoUrl = event.target?.result as string;
                                addPhoto(restaurant.id, photoUrl, currentUser);
                              };
                              reader.readAsDataURL(file);
                            }
                          };
                          input.click();
                        }}
                        className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                      >
                        + Ajouter
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {restaurant &&
                        getPhotos(restaurant.id).map((photo, idx) => (
                          <div key={idx} className="relative group">
                            <img
                              src={photo.photoUrl}
                              alt={`Souvenir ${restaurant.nom}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removePhoto(restaurant.id, photo.timestamp)}
                              className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      {restaurant && getPhotos(restaurant.id).length === 0 && (
                        <p className="text-xs text-gray-500 col-span-3">
                          Aucune photo pour l&apos;instant
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes et commentaires */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">Vos notes</h3>
                    <button
                      type="button"
                      onClick={() => setShowNotes(!showNotes)}
                      className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      {showNotes ? "Masquer" : "Ajouter / Modifier"}
                    </button>
                  </div>

                  {/* Affichage des notes existantes */}
                  <div className="space-y-2 mb-3">
                    {(moiNote !== null || moiComment) && (
                      <div className="p-2 bg-emerald-50 rounded-lg">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium text-emerald-700">👤 Ilyass:</span>
                          {moiNote !== null && (
                            <span className="text-emerald-600 font-semibold">{moiNote}/5</span>
                          )}
                          {moiComment && (
                            <span className="text-gray-600 italic">&quot;{moiComment}&quot;</span>
                          )}
                        </div>
                      </div>
                    )}
                    {(marianneNote !== null || marianneComment) && (
                      <div className="p-2 bg-orange-50 rounded-lg">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium text-orange-700">🌸 Marianne:</span>
                          {marianneNote !== null && (
                            <span className="text-orange-600 font-semibold">{marianneNote}/5</span>
                          )}
                          {marianneComment && (
                            <span className="text-gray-600 italic">&quot;{marianneComment}&quot;</span>
                          )}
                        </div>
                      </div>
                    )}
                    {moiNote === null && !moiComment && marianneNote === null && !marianneComment && (
                      <p className="text-sm text-gray-500 italic">Aucune note pour l&apos;instant</p>
                    )}
                  </div>

                  {/* Formulaire pour ajouter/modifier */}
                  {showNotes && (
                    <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {currentUser === "moi" ? "👤 Ilyass" : "🌸 Marianne"} - Note (1-5)
                        </label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <button
                              key={n}
                              type="button"
                              onClick={() => setCurrentNote(n)}
                              className={`w-10 h-10 rounded-lg font-semibold transition-colors ${
                                currentNote === n
                                  ? "bg-emerald-600 text-white"
                                  : "bg-white border-2 border-gray-300 text-gray-700 hover:border-emerald-400"
                              }`}
                            >
                              {n}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => setCurrentNote(null)}
                            className="px-3 h-10 rounded-lg bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-400 text-sm"
                          >
                            Effacer
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Commentaire
                        </label>
                        <textarea
                          value={currentComment}
                          onChange={(e) => setCurrentComment(e.target.value)}
                          placeholder="Ton avis sur ce resto..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm resize-none"
                          rows={2}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleSaveNote}
                        className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm"
                      >
                        Enregistrer
                      </button>
                    </div>
                  )}
                </div>

                {/* Liens */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                  {restaurant.site && (
                    <a
                      href={restaurant.site}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-5 py-3 bg-emerald-600 text-white rounded-lg active:bg-emerald-700 transition-colors font-medium shadow-lg touch-manipulation flex items-center justify-center gap-2"
                      style={{
                        WebkitTapHighlightColor: "transparent",
                      }}
                    >
                      <span className="text-lg leading-none">🌐</span>
                      <span>Site web</span>
                    </a>
                  )}
                  {restaurant.instagram && (
                    <a
                      href={`https://instagram.com/${restaurant.instagram.replace("@", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-5 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg active:from-orange-600 active:to-orange-700 transition-colors font-medium shadow-lg touch-manipulation flex items-center justify-center gap-2"
                      style={{
                        WebkitTapHighlightColor: "transparent",
                      }}
                    >
                      <span className="text-lg leading-none">📸</span>
                      <span>Instagram</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  // Utiliser un portail React pour rendre la modale en dehors du DOM de la carte
  if (!mounted) return null;
  
  return createPortal(modalContent, document.body);
}
