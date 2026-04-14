# Backend QR Menu Offline - Architecture Microservices

## ✅ Nettoyage Effectué

- ✅ Supprimé ancien code monolithique (`server.js`, `routes/`, `config/`, `middleware/`)
- ✅ Architecture microservices complète
- ✅ Services organisés et indépendants

## 🏗️ Architecture

```
backend/
├── gateway/              # API Gateway (port 5000)
├── services/
│   ├── auth-service/    # Authentification (5001)
│   ├── user-service/    # Utilisateurs (5002)
│   ├── catalog-service/ # Catalogue (5003)
│   ├── order-service/   # Commandes (5004)
│   ├── table-service/   # Tables + QR Codes HMAC (5005)
│   ├── kitchen-service/ # Vue cuisine (5006) ⭐ NOUVEAU
│   └── theme-service/   # Thème (5007)
├── shared/              # Modules partagés
│   ├── config/database.js
│   └── middleware/auth.js
└── database/
    └── schema.sql       # Schéma MySQL
```

## 🆕 Nouveautés

### QR Codes avec Token HMAC
- Route `/api/qrcode/generate/:tableId` - Génère QR Code signé
- Route `/api/qrcode/validate` - Valide le token
- Token HMAC SHA-256 avec expiration 24h
- Secret configurable via `QR_SECRET`

### Service Cuisine
- `/api/kitchen/orders/pending` - Commandes en attente
- `/api/kitchen/orders/:id/prepare` - Marquer en préparation
- `/api/kitchen/orders/:id/serve` - Marquer servie
- `/api/kitchen/stats/today` - Statistiques du jour

## 🚀 Démarrage

```bash
cd backend
npm run install:all
npm run start:all
```

## ⚙️ Configuration

Créer `.env` dans chaque service ou utiliser un `.env` global :

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=foodapp
JWT_SECRET=votre_secret_jwt
QR_SECRET=votre_secret_qr_hmac
SERVER_URL=http://menu.local
```

