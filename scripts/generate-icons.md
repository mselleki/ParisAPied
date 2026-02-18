# Génération des icônes PWA

Pour générer les icônes PNG nécessaires à la PWA, vous pouvez :

## Option 1 : Utiliser un outil en ligne
1. Allez sur [realfavicongenerator.net](https://realfavicongenerator.net/)
2. Uploadez le fichier `public/icon.svg`
3. Téléchargez les icônes générées
4. Placez `icon-192.png` et `icon-512.png` dans le dossier `public/`

## Option 2 : Utiliser ImageMagick (si installé)
```bash
magick convert public/icon.svg -resize 192x192 public/icon-192.png
magick convert public/icon.svg -resize 512x512 public/icon-512.png
```

## Option 3 : Utiliser un éditeur d'images
Ouvrez `public/icon.svg` dans votre éditeur préféré et exportez en PNG aux tailles 192x192 et 512x512.

## Note
Pour l'instant, le site fonctionnera sans ces icônes PNG, mais elles sont recommandées pour une meilleure expérience PWA.
