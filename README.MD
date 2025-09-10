# Portfolio – Yannis Oukacine

> Candidat à une école d’ingénieur en informatique (alternance). Site vitrine statique (HTML/CSS/JS) pour présenter mon profil, mon parcours et quelques projets.


## 🚀 Aperçu

- Statique, sans framework, rapide à charger
- Thème clair/sombre persistant (localStorage)
- Accessibilité soignée (ARIA, focus, clavier, skip‑link)
- Effets visuels discrets (révélations, typed effect, préloader)
- Fond animé optionnel (Vanta.js / WebGL) avec fallback
- Timeline “Parcours”, cartes “Valeur ajoutée”, “Stack”, “Projets” (avec objectifs)
- Lien CV ouvrant dans un nouvel onglet
- Formulaire de contact (validation côté client, envoi simulé)


## 🧰 Stack & technologies

- HTML5 sémantique
- CSS (Custom properties, Flex/Grid, effets, responsive)
- JavaScript Vanilla (IntersectionObserver, gestion du thème, accordéon, animations)
- Vanta.js BIRDS + three.js (chargé via CDN)
- Stockage préférences: localStorage
- SEO: métas + JSON‑LD (Person)


## 📁 Structure du projet

```
portfolio/
├── index.html
├── style.css
├── script.js
├── assets/
│   ├── icons/ (icônes thème, etc.)
│   ├── images/ (photo, fonds)
│   └── CV_OUKACINE_YANNIS.pdf (CV)
```


## 🧭 Navigation dans le code

- Hero et méta/SEO: `index.html` (head + header)
- Comportements (thème, préloader, animations, accordéon, typed): `script.js`
- Styles (tokens, layouts, effets, responsive): `style.css`
- Projets (cartes + objectifs) et Stack: `index.html` (sections `#projects` et `#stack`)
- Parcours (timeline) et Valeur ajoutée: `index.html` (sections `#education` et `#value`)


## ▶️ Démarrer en local

Le site étant statique, ouvrez simplement `index.html` dans votre navigateur.

Pour un environnement plus proche d’une prod (HTTP), vous pouvez utiliser un petit serveur statique (ex: VS Code Live Server, ou `python -m http.server`).


## ✏️ Personnalisation rapide

- Textes principaux: éditer `index.html` (hero, à propos, valeur, parcours, projets)
- Chaîne “typed” du hero: fonction `typedStrings()` dans `script.js`
- Couleurs, rayons, ombres, espacements: variables CSS dans `style.css` (custom properties)
- Projets: chaque carte dans `#projects` (titre, description, ligne Objectif, chips)
- CV: fichier `assets/CV_OUKACINE_YANNIS.pdf` et liens (nav + hero) dans `index.html`
- Timeline “Parcours”: blocs `.edu-item` (année, intitulé, école)


## ♿ Accessibilité

- Composants accessibles: accordéon (ARIA + clavier), skip‑link, focus visibles
- Préférence “réduction des animations” respectée (`prefers-reduced-motion`)
- Contrastes travaillés (clair/sombre) et lisibilité des textes
- Navigation clavier: menu burger, liens, accordéon testés


## ⚡ Performance

- Aucune pipeline/bundle: ressources minimales, CDN pour three.js/vanta
- Préloader léger avec barre de progression
- Vanta.js ré‑initialisé selon le thème; fallback CSS si indisponible


## 🔎 SEO

- Métas `title`, `description`, Open Graph dans `index.html`
- Données structurées JSON‑LD (type `Person`)
- Pensez à mettre à jour `jobTitle`, `description` et les liens `sameAs` (GitHub/LinkedIn)


## 🛠️ Déploiement

- Netlify
- Déployez le dossier tel quel; aucune étape de build requise


## ✅ Liste des fonctionnalités (extrait)

- Thème clair/sombre avec persistance
- Effet “typed” personnalisé
- Accordéon Expérience (clavier + ARIA)
- Révélations (IntersectionObserver) et barres de progression
- Timeline Parcours avec cartes et badges
- Cartes Projets avec “Objectif” et chips techno
- Boutons CV (nav + hero) ouvrant le PDF dans un nouvel onglet
- Formulaire Contact avec validation (envoi simulé)


## 🧪 Qualité & bonnes pratiques

- Code organisé et commenté; séparation claire contenu/style/comportement
- Patterns accessibles; évite les dépendances lourdes
- Mesure légère (préloader, micro‑animations non bloquantes)


## 🔧 Roadmap (idées possibles)

- Mini démonstration d’algorithmes (structures de données, complexité)
- Lint + tests unitaires (utilitaires JS) pour démontrer la démarche qualité
- Lazy‑load conditionnel de Vanta/three.js


## 🙏 Remerciements

- [Vanta.js](https://www.vantajs.com/) – effets de fond WebGL
- [three.js](https://threejs.org/) – moteur WebGL


## 📄 Licence

© 2025 – Yannis Oukacine. Ce projet est fourni à des fins de présentation personnelle. Les textes, images et le CV sont protégés. Vous pouvez forker le code pour un usage pédagogique, sans réutiliser les éléments personnels (photo, CV) sans autorisation.

