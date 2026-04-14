# Structure Frontend Réorganisée

## Organisation par fonctionnalités

```
src/
├── app/                      # Configuration de l'app (routes, providers)
│   ├── App.js
│   └── routes.js
├── features/                 # Fonctionnalités métier
│   ├── auth/                 # Authentification
│   ├── menu/                 # Gestion menu client
│   ├── cart/                 # Panier
│   ├── orders/               # Commandes
│   ├── kitchen/              # Vue cuisine (NOUVEAU)
│   ├── admin/                # Administration
│   └── qrcode/               # QR Codes
├── shared/                   # Composants partagés
│   ├── components/           # Composants UI réutilisables
│   ├── hooks/                # Hooks personnalisés
│   ├── services/             # Services API
│   ├── contexts/             # Contextes React
│   └── utils/                # Utilitaires
├── config/                   # Configuration
└── assets/                   # Assets statiques
```

## Migration progressive

Les fichiers existants seront réorganisés dans cette structure.

