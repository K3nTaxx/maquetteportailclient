# Atelier Méridien · portail (projet vitrine)

Projet vitrine conçu par Kalion Studio : le portail d'une maison de voyages sur mesure fictive, « Atelier Méridien » (Paris 6e). Toutes les données sont fictives. Il n'y a ni serveur ni appel externe ; l'état de la démo est gardé dans le navigateur, et le bouton **Réinitialiser** la remet au lundi 5 octobre 2026, 10:40.

Trois espaces reliés, qu'on change depuis la barre du haut :

- **Client** (Camille Delorme, voyage au Japon du 7 au 22 novembre) : compte à rebours, itinéraire jour par jour sur une carte exacte avec curseur, lever et coucher du soleil, choix de l'hébergement à Kyoto, réservations tamponnées, envoi de passeport, paiement simulé, messages, téléchargements (.ics, .csv, programme imprimable).
- **Équipe** (Louis, conseiller Japon) : dossiers, confirmation de Kyoto avec tampon, vérification du passeport, marges, frise des départs, alerte d'un couple en voyage et trajet de remplacement.
- **Admin** (Mathilde, direction) : pilotage (soldes à J-30, attributions, envois programmés), veille mondiale avec la nuit en temps réel, clients, et l'onglet **Analytique**.

## Le parcours à montrer (2 minutes)

1. **Client › Mon voyage** : « Choisir le ryokan » → « Envoyer mon choix à Louis ».
2. **Client › Itinéraire** : faire glisser le curseur de J1 à J16.
3. **Équipe › Mes dossiers › Delorme** : « Demander à l'hôtel » → « Marquer confirmé » (le tampon tombe).
4. **Client › Paiements** : le total passe à 11 920 € → « J'ai fait un virement ».
5. **Admin › Pilotage** : « Marquer comme reçu », « Attribuer » la famille Aubert. **Veille** : la nuit sur la carte.
6. **Admin › Analytique** : survoler les mois, cliquer une destination, « Par date de départ ».

## Fichiers

- `index.html`, `assets/styles.css`, `assets/css/*.css`
- `assets/js/core.js` (état, horloge, boucle entre les rôles), `data.js` (données fictives), `maps.js`, `client.js`, `equipe.js`, `admin.js`, `analytics.js`
- `assets/js/sun.js` (position du soleil, NOAA/Meeus) et `assets/js/geo.js` (côtes : Natural Earth, domaine public)
- `netlify.toml` : site statique, aucune compilation, non indexé
