# Architecture Backend - QR Menu Offline

## Structure Microservices

```
backend/
├── gateway/              # API Gateway (port 5000)
├── services/
│   ├── auth-service/    # Authentification (port 5001)
│   ├── user-service/    # Gestion utilisateurs (port 5002)
│   ├── catalog-service/ # Catalogue menus/catégories (port 5003)
│   ├── order-service/   # Commandes (port 5004)
│   ├── table-service/   # Tables + QR Codes signés (port 5005)
│   └── kitchen-service/ # Vue cuisine (port 5006) - NOUVEAU
├── shared/              # Modules partagés
│   ├── config/
│   │   └── database.js  # Configuration MySQL
│   └── middleware/
│       └── auth.js      # Middleware JWT
└── database/
    └── schema.sql       # Schéma MySQL
```

## Points importants

- Base de données MySQL (locale, pas cloud)
- QR Codes avec token HMAC signé
- Support offline via PWA (frontend)
- Temps réel via WebSockets (optionnel)

