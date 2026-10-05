# Maquette — portail client

Maquette interactive (non fonctionnelle) d'un portail client pour un studio de design :
**espace client**, **espace équipe** et **administration**, reliés entre eux.

Toutes les données sont fictives (« Atelier Méridien », « Maison Carbone »…). Rien n'est envoyé nulle part :
pas de serveur, pas de base de données, aucun appel externe. L'état de la démo est gardé dans le navigateur ;
le bouton **Réinitialiser** (barre du haut) la remet à zéro.

## Le parcours à montrer

1. **Client** → « Voir les propositions » → ouvrir un logo → cliquer sur le visuel pour placer un commentaire → « Envoyer mes retours ».
2. **Équipe** → le projet MC-1042 affiche les retours du client → « Déposer la version 2 » → « Envoyer au contrôle qualité ».
3. **Admin** → « Contrôler » → « Envoyer au client ».
4. **Client** → la version 2 est arrivée → « Choisir cette proposition et valider » → fichiers prêts à télécharger.

Aussi : commander une offre (paiement simulé), compléter le brief, factures, assigner un designer (admin › Projets),
modifier un prix ou masquer une offre (admin › Offres, visible tout de suite côté client).

## Fichiers

- `index.html` : la page
- `assets/styles.css` : le design
- `assets/app.js` : les écrans, les données fictives et les interactions
- `assets/fonts/` : polices hébergées sur place (Hanken Grotesk, Instrument Serif)
- `netlify.toml` : configuration Netlify (site statique, pas de compilation, non indexé par Google)

## Mise en ligne

Site statique : Netlify publie le dossier tel quel (aucune commande de build).
En local, il suffit d'ouvrir `index.html` dans un navigateur.
