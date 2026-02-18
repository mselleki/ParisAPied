# 🚀 Démarrage Rapide

## Installation

```bash
npm install
```

## Lancement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000)

## ✨ Fonctionnalités principales

- **3 modes d'affichage** : Liste, Carte, Split
- **Recherche et filtres** : Par nom, type, quartier
- **Carte interactive** : Points cliquables avec animations
- **Détails restaurant** : Modal élégante avec toutes les infos
- **PWA** : Installable sur mobile
- **Mode sombre** : Automatique selon les préférences système

## 📝 Ajouter des restaurants

Éditez `data/restaurants.json` :

```json
{
  "id": 3,
  "nom": "Nouveau Restaurant",
  "adresse": "Adresse, 750XX Paris",
  "type": "restaurant",
  "note": 4.5,
  "horaires": "12h-14h30, 19h-22h30",
  "site": "https://...",
  "instagram": "@...",
  "photo": null,
  "quartier": "Quartier",
  "lat": 48.8566,
  "lon": 2.3522
}
```

**Pour obtenir les coordonnées** : Utilisez [Nominatim](https://nominatim.openstreetmap.org/) ou Google Maps (clic droit → coordonnées)

## 🎨 Personnalisation

- **Couleurs** : Modifiez les variables CSS dans `app/globals.css`
- **Styles** : Tailwind CSS dans tous les composants
- **Animations** : Framer Motion pour les transitions

## 📱 Installation PWA

### Android
1. Ouvrez le site dans Chrome
2. Menu (⋮) → "Ajouter à l'écran d'accueil"

### iOS
1. Ouvrez le site dans Safari
2. Partager (□↑) → "Sur l'écran d'accueil"

## 🛠️ Build production

```bash
npm run build
npm start
```
