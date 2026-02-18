# 🚀 Guide de déploiement sur Vercel

## Méthode 1 : Via l'interface web (Recommandé)

1. **Connecte-toi à Vercel**
   - Va sur [vercel.com](https://vercel.com)
   - Clique sur "Sign Up" et connecte-toi avec ton compte GitHub

2. **Importe ton projet**
   - Clique sur "Add New..." → "Project"
   - Sélectionne le repo `mselleki/ParisAPied`
   - Vercel détectera automatiquement Next.js

3. **Configuration (optionnel)**
   - Framework Preset: Next.js (détecté automatiquement)
   - Root Directory: `./` (par défaut)
   - Build Command: `npm run build` (détecté automatiquement)
   - Output Directory: `.next` (détecté automatiquement)
   - Install Command: `npm install` (détecté automatiquement)

4. **Déploie**
   - Clique sur "Deploy"
   - Attends quelques minutes
   - Ton site sera disponible sur une URL comme `paris-a-pied.vercel.app`

5. **Configuration du domaine (optionnel)**
   - Va dans "Settings" → "Domains"
   - Ajoute ton domaine personnalisé si tu en as un

## Méthode 2 : Via la CLI Vercel

```bash
# Installer Vercel CLI globalement
npm i -g vercel

# Se connecter à Vercel
vercel login

# Déployer depuis le dossier du projet
cd c:\Dev\ParisAPied
vercel

# Suivre les instructions :
# - Set up and deploy? Y
# - Which scope? (ton compte)
# - Link to existing project? N (première fois)
# - Project name? paris-a-pied (ou autre)
# - Directory? ./
# - Override settings? N

# Pour déployer en production
vercel --prod
```

## ✅ Vérifications post-déploiement

Une fois déployé, vérifie que :
- ✅ Le site charge correctement
- ✅ La carte s'affiche bien
- ✅ Les restaurants sont visibles
- ✅ Les filtres fonctionnent
- ✅ La modale s'ouvre correctement

## 🔄 Déploiements automatiques

Vercel déploiera automatiquement à chaque push sur `main` :
- Chaque commit sur `main` → déploiement automatique
- Chaque Pull Request → preview deployment

## 📝 Variables d'environnement

Pour l'instant, aucune variable d'environnement n'est nécessaire. Si tu en ajoutes plus tard :
1. Va dans "Settings" → "Environment Variables"
2. Ajoute tes variables
3. Redéploie

## 🐛 Dépannage

Si le déploiement échoue :
1. Vérifie les logs dans Vercel Dashboard
2. Vérifie que `npm install` fonctionne localement
3. Vérifie que `npm run build` fonctionne localement
4. Vérifie que tous les fichiers nécessaires sont dans le repo

## 📚 Documentation

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
