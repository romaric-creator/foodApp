#!/usr/bin/env bash
# Health Check Script - Vérifie l'état du projet
# Usage: ./.gemini/scripts/health-check.sh [--fix]

set -e

FIX=${1:-""}
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🏥 Diagnostic Projet..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

HEALTH=0

# ─── 1. Dépendances ───────────────────────────
echo "📦 Vérification des dépendances..."
if [ ! -d "node_modules" ]; then
  echo -e "${RED}✗ node_modules manquant${NC}"
  HEALTH=$((HEALTH + 1))
  if [ "$FIX" == "--fix" ]; then
    echo "  💾 npm install..."
    npm install --legacy-peer-deps 2>/dev/null && echo -e "${GREEN}  ✓ Dépendances installées${NC}"
  fi
else
  echo -e "${GREEN}✓ node_modules present${NC}"
fi

# ─── 2. Git ───────────────────────────────────
echo "🔀 Vérification Git..."
if [ ! -d ".git" ]; then
  echo -e "${YELLOW}⚠ Repo Git non initialisé${NC}"
else
  DIRTY=$(git status --porcelain | wc -l)
  if [ $DIRTY -gt 0 ]; then
    echo -e "${YELLOW}⚠ $DIRTY fichiers modifiés${NC}"
  else
    echo -e "${GREEN}✓ Repo clean${NC}"
  fi
fi

# ─── 3. Fichiers de config ─────────────────────
echo "⚙️  Fichiers de configuration..."
CONFIGS=(".env.local" ".env.example" "package.json")
for cfg in "${CONFIGS[@]}"; do
  if [ -f "$cfg" ]; then
    echo -e "${GREEN}✓ $cfg${NC}"
  else
    if [ "$cfg" != ".env.local" ]; then
      echo -e "${RED}✗ $cfg manquant${NC}"
      HEALTH=$((HEALTH + 1))
    else
      echo -e "${YELLOW}⚠ $cfg (optionnel)${NC}"
    fi
  fi
done

# ─── 4. Backend ────────────────────────────────
echo "🖥️  Backend..."
if [ -d "backend" ]; then
  if [ ! -d "backend/node_modules" ]; then
    echo -e "${YELLOW}⚠ Dépendances backend manquantes${NC}"
    HEALTH=$((HEALTH + 1))
    if [ "$FIX" == "--fix" ]; then
      cd backend && npm install --legacy-peer-deps && cd ..
      echo -e "${GREEN}  ✓ Backend dependencies installées${NC}"
    fi
  else
    echo -e "${GREEN}✓ Backend ready${NC}"
  fi
else
  echo -e "${YELLOW}⚠ Pas de dossier backend${NC}"
fi

# ─── 5. Frontend ───────────────────────────────
echo "📱 Frontend..."
if [ -d "frontend" ]; then
  if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}⚠ Dépendances frontend manquantes${NC}"
    HEALTH=$((HEALTH + 1))
    if [ "$FIX" == "--fix" ]; then
      cd frontend && npm install --legacy-peer-deps && cd ..
      echo -e "${GREEN}  ✓ Frontend dependencies installées${NC}"
    fi
  else
    echo -e "${GREEN}✓ Frontend ready${NC}"
  fi
else
  echo -e "${YELLOW}⚠ Pas de dossier frontend${NC}"
fi

# ─── 6. Database ───────────────────────────────
echo "🗄️  Database..."
if [ -d "backend" ] && [ -f "backend/config/db.js" ]; then
  echo -e "${GREEN}✓ Config database${NC}"
else
  echo -e "${YELLOW}⚠ Config database manquante${NC}"
fi

# ─── 7. Tests ──────────────────────────────────
echo "✅ Tests..."
if [ -d "backend/__tests__" ]; then
  echo -e "${GREEN}✓ Tests backend${NC}"
else
  echo -e "${YELLOW}⚠ Tests backend manquants${NC}"
fi

if [ -d "frontend/__tests__" ]; then
  echo -e "${GREEN}✓ Tests frontend${NC}"
else
  echo -e "${YELLOW}⚠ Tests frontend manquants${NC}"
fi

# ─── Résumé ────────────────────────────────────
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $HEALTH -eq 0 ]; then
  echo -e "${GREEN}✓ Projet en bon état!${NC}"
  echo ""
  echo "🚀 Pour démarrer:"
  echo "  Backend:  cd backend && npm run dev"
  echo "  Frontend: cd frontend && npm start"
  exit 0
else
  echo -e "${RED}✗ $HEALTH problème(s) détecté(s)${NC}"
  echo ""
  echo "💡 Exécutez: ./.gemini/scripts/health-check.sh --fix"
  exit 1
fi
