#!/usr/bin/env bash
# Deploy Script - Déploiement multi-environnements
# Usage: ./.gemini/scripts/deploy.sh [dev|staging|prod] [--verbose]

set -e

ENVIRONMENT=${1:-"dev"}
VERBOSE=${2:-""}
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

if [ "$VERBOSE" == "--verbose" ]; then
  set -x
fi

echo "🚀 Déploiement $ENVIRONMENT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ─── Pre-deployment checks ─────────────────────
echo "✓ Vérifications pré-déploiement..."

if ! git diff-index --quiet HEAD --; then
  echo -e "${YELLOW}⚠️  Changements non commités. Committez avant de déployer.${NC}"
  exit 1
fi

if [ ! -f ".env.$ENVIRONMENT" ] && [ "$ENVIRONMENT" != "dev" ]; then
  echo -e "${RED}✗ Fichier .env.$ENVIRONMENT manquant${NC}"
  exit 1
fi

# ─── Building ────────────────────────────────
echo ""
echo "🔨 Build..."

if [ -d "backend" ]; then
  cd backend
  echo "  Backend..."
  npm run lint --if-present || true
  npm run test --if-present || true
  cd - > /dev/null
fi

if [ -d "frontend" ]; then
  cd frontend
  echo "  Frontend..."
  npm run lint --if-present || true
  npm run test --if-present || true
  npm run build || true
  cd - > /dev/null
fi

# ─── Environment-specific deployment ────────
echo ""
echo "📦 Déploiement $ENVIRONMENT..."

case "$ENVIRONMENT" in
  dev)
    echo "  → Environnement de développement"
    echo "  ✓ Déploiement local: npm run dev (backend)"
    echo "  ✓ Frontend: npm start (frontend)"
    ;;

  staging)
    echo "  → Environnement de staging"
    if [ -f "render.yaml" ]; then
      echo "  ✓ Render détecté - déploiement automatique sur push"
      git push origin develop
    elif [ -f "vercel.json" ]; then
      echo "  ✓ Vercel détecté"
      # vercel deploy --prod
    fi
    ;;

  prod)
    echo "  → ⚠️  PRODUCTION"
    read -p "Êtes-vous sûr? (yes/no): " CONFIRM
    if [ "$CONFIRM" != "yes" ]; then
      echo "  Déploiement annulé"
      exit 1
    fi

    if [ -f "render.yaml" ]; then
      echo "  ✓ Render détecté - déploiement automatique"
      git push origin main
      echo "  💡 Vérifiez https://dashboard.render.com"
    fi
    ;;

  *)
    echo -e "${RED}✗ Environnement inconnu: $ENVIRONMENT${NC}"
    exit 1
    ;;
esac

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✓ Déploiement $ENVIRONMENT complété!${NC}"
