# Portfolio – Yannis Oukacine

Site personnel réalisé dans le cadre de ma reconversion professionnelle.  
Objectif : présenter mon parcours (relation client, conformité, immobilier), mes compétences transverses et ma motivation pour évoluer vers le web / produit.

## 🎯 Objectifs du site
- Mettre en avant : rigueur, sens du service, organisation, résolution de problèmes.
- Montrer ma capacité à apprendre rapidement (structure propre, accessibilité, i18n, animations).
- Servir de base évolutive : ajout futur de vrais projets techniques et d’indicateurs d’impact.

## ✨ Fonctionnalités actuelles
- Préloader animé (progression simulée 2s).
- Thème sombre/clair avec persistance (localStorage) + icône dynamique.
- Navigation sticky + masquage au scroll.
- Menu mobile accessible (focus management, aria-expanded, fermeture sur clic extérieur / ESC).
- ScrollReveal (IntersectionObserver) désactivé automatiquement si prefers-reduced-motion.
- Bouton retour en haut (apparition progressive).
- Accordéon Expérience : accessible (aria-controls, aria-expanded) + transitions fluides.
- Internationalisation prête (FR / EN) via attributs `data-i18n` et `data-i18n-list`.
- Formulaire de contact : validation front + messages d’erreur accessibles (aria-live).
- Vanta Birds (animation WebGL) rechargée quand le thème change (couleurs cohérentes).
- Responsive → mobile first jusqu’aux grands écrans.
- Accessibilité : skip link, focus states visibles, attributs ARIA, gestion réduction animations.

## 🛠️ Stack / Tech
| Catégorie            | Détails |
|----------------------|---------|
| Langages             | HTML5, CSS3, JavaScript (Vanilla) |
| Accessibilité        | ARIA, prefers-reduced-motion, focus management |
| Animations           | CSS transitions, IntersectionObserver, Vanta.js (Birds) |
| Internationalisation | JSON + mapping dynamique |
| Performance légère   | Pas de framework, assets minimaux |

## 📂 Structure simplifiée
```
.
├── index.html
├── style.css
├── script.js
├── assets/
│   ├── icons/
│   └── images/
├── locales/
│   ├── fr.json
│   └── en.json
└── .github/workflows/deploy.yml
```

## 🔄 Améliorations futures (roadmap)
- [ ] Ajouter une vraie section Parcours (timeline animée).
- [ ] Remplacer les placeholders dans Projets par : “Ce portfolio” + mini scripts (automatisation / organisation).
- [ ] Ajouter un mode “Focus Recruteur” (vue imprimable condensée).
- [ ] Intégrer un service d’envoi de formulaire (Formspree / EmailJS / self-host).
- [ ] Générer sitemap.xml + JSON-LD (schema.org Person / WebSite).
- [ ] Mettre en place un composant “Statistiques d’impact” (processus optimisés, % de gain, etc.).
- [ ] Ajout d’un test Lighthouse + badge.

## ♿ Accessibilité
- `aria-live` sur messages formulaire.
- Gestion clavier du menu mobile.
- Accordéon : `aria-controls` / `aria-expanded`.
- Skip link immédiatement accessible (tab au chargement).
- Respect des préférences utilisateur (réduction animations).

## 📬 Contact
LinkedIn : https://www.linkedin.com/in/yannis-oukacine-63347320b/  
Email : yannis.oukacine@gmail.com

---
Made with motivation & curiosity 🚀
