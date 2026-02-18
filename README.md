# Paris à Pied 🚶‍♂️✨

Site web premium pour découvrir les meilleures petites adresses de Paris.

## ✨ Fonctionnalités

- 📋 **Liste interactive** avec filtres avancés (type, quartier, recherche)
- 🗺️ **Carte interactive** avec points cliquables et animations fluides
- 📱 **Design responsive** optimisé mobile-first
- ⚡ **Vue split** (liste + carte côte à côte)
- 🎨 **Animations fluides** avec Framer Motion
- 📄 **Page de détails** pour chaque restaurant
- 🔔 **PWA** - Installable sur mobile
- 🌙 **Mode sombre** automatique
- ⚡ **Performance optimisée**

## 🚀 Installation

```bash
npm install
```

## 💻 Développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 📝 Ajouter des restaurants

Éditez le fichier `data/restaurants.json` avec vos restaurants. Format :

```json
{
  "restaurants": [
    {
      "id": 1,
      "nom": "Nom du restaurant",
      "adresse": "Adresse complète, 750XX Paris",
      "type": "restaurant",
      "note": 4.5,
      "horaires": "12h-14h30, 19h-22h30",
      "site": "https://...",
      "instagram": "@...",
      "photo": null,
      "quartier": "Nom du quartier",
      "lat": 48.8566,
      "lon": 2.3522
    }
  ]
}
```

### Obtenir les coordonnées (lat/lon)

- **OpenStreetMap Nominatim** (gratuit) : [nominatim.openstreetmap.org](https://nominatim.openstreetmap.org/)
- **Google Maps** : Clic droit sur un point → coordonnées

## 🎨 Design

- Palette de couleurs moderne avec vert émeraude et orange
- Animations fluides et micro-interactions
- Typographie optimisée
- Design system cohérent

## 📱 PWA

Le site est installable comme une application sur mobile :
- Android : Menu → "Ajouter à l'écran d'accueil"
- iOS : Safari → Partager → "Sur l'écran d'accueil"

## 🛠️ Technologies

- **Next.js 14** - Framework React
- **TypeScript** - Typage statique
- **Tailwind CSS** - Styles utilitaires
- **Framer Motion** - Animations
- **Leaflet** - Cartes interactives
- **React Leaflet** - Intégration React

## 🚀 Déploiement sur Vercel

1. Créez un compte sur [Vercel](https://vercel.com)
2. Installez la CLI Vercel : `npm i -g vercel`
3. Connectez votre repo GitHub à Vercel
4. Vercel détectera automatiquement Next.js et déploiera

Ou utilisez le bouton "Deploy" directement depuis GitHub après avoir connecté le repo.

## 📄 Licence

Projet personnel - Usage privé
