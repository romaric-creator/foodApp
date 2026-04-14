# GOURMI Dashboard

## Présentation

GOURMI Dashboard est une application d’administration pour la gestion de menus, catégories, tables, commandes et utilisateurs dans un restaurant. Elle est développée avec React, Material-UI, Firebase (Firestore & Auth), Electron (pour le mode desktop) et Cloudinary (pour la gestion des images).

## Fonctionnalités principales

- **Gestion des commandes** : Visualisation, filtrage, impression et téléchargement des commandes.
- **Gestion des menus** : Ajout, modification, suppression de menus, import en masse, upload d’images via Cloudinary.
- **Gestion des catégories** : Ajout, édition, suppression et recherche de catégories.
- **Gestion des tables** : Génération de QR codes pour chaque table.
- **Gestion des utilisateurs** : Visualisation et gestion des comptes utilisateurs.
- **Profil administrateur** : Modification des informations du profil, changement de mot de passe, déconnexion.
- **Thème personnalisable** : Mode sombre/clair, couleurs personnalisées, sauvegarde du thème dans Firebase.
- **Support Electron** : L’application peut être packagée et lancée en mode desktop.

## Technologies utilisées

- **React** (frontend)
- **Material-UI** (UI/UX)
- **Firebase** (Firestore, Auth)
- **Cloudinary** (upload d’images)
- **Electron** (mode desktop)
- **Framer Motion** (animations)
- **jsPDF** (génération de PDF)

## Structure du projet

- `src/components/Admin/` : Composants principaux du dashboard (Menu, Commandes, Catégories, Utilisateurs, etc.)
- `src/theme/CustomThemeProvider.js` : Fournisseur de thème global (sombre/clair, couleurs dynamiques)
- `src/services/` : Fonctions d’accès à Firebase et Cloudinary
- `src/electron/` : Fichiers spécifiques à Electron (main.js, preload.js)
- `firebaseConfig.js` : Configuration Firebase

## Configuration

1. **Firebase** : Créez un projet, configurez Firestore et Auth, et renseignez les infos dans `firebaseConfig.js`.
2. **Cloudinary** : Créez un compte, obtenez votre `cloud_name` et `upload_preset`, et renseignez-les dans les fonctions d’upload.
3. **Electron** : Pour le mode desktop, vérifiez que le fichier `main.js` charge bien l’URL de votre app React.
4. **Lancement** :
   - `npm start` pour le mode web.
   - `npm run electron` pour le mode desktop.

## Remarques

- Les menus peuvent être ajoutés individuellement ou en masse via un formulaire dédié.
- Les images sont uploadées sur Cloudinary avant d’être référencées dans Firestore.
- Le thème est personnalisable et persistant (localStorage + Firestore).
- L’application gère les droits d’accès via Firebase Auth.

## Estimation du coût de réalisation

Le coût de réalisation du projet dépend de plusieurs facteurs : temps de développement, compétences requises, et choix de prestataires. Voici une estimation indicative pour un projet de ce type :

- **Développement (freelance ou agence)** :  
  - Frontend React + Material-UI + intégration Firebase/Cloudinary/Electron  
  - Estimation : **15 à 30 jours/homme**  
  - Tarif freelance moyen : **350 à 500 €/jour**  
  - **Total développement** : **5 000 à 15 000 €**

- **Design UI/UX** (si besoin d’une maquette dédiée) :  
  - **500 à 2 000 €**

- **Tests & Recette** :  
  - **500 à 1 500 €**

- **Déploiement initial & configuration** :  
  - **500 à 1 000 €**

**Total estimé pour la réalisation initiale** :  
- **6 500 à 19 500 €** (hors maintenance, hébergement, et évolutions ultérieures)

> **Remarque** : Ces montants sont indicatifs et peuvent varier selon la complexité, la localisation, le prestataire et les besoins spécifiques du client.

## Auteur

Projet réalisé par [Votre Nom/Équipe].

