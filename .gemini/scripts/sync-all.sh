#!/usr/bin/env bash
# Sync Dependencies - Synchronise toutes les dépendances
# Usage: ./.gemini/scripts/sync-all.sh [--update] [--audit]

UPDATE=${1:-""}
AUDIT=${2:-""}

echo "🔄 Synchronisation des dépendances"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# ─── Root ──────────────────────────────────────
echo "📦 Root..."
if [ -f "package.json" ]; then
  if [ "$UPDATE" == "--update" ]; then
    npm update
  fi
  npm ci --legacy-peer-deps 2>/dev/null || npm install --legacy-peer-deps
  echo -e "${GREEN}✓ Root dependencies synced${NC}"
fi

# ─── Backend ────────────────────────────────────
echo ""
echo "🖥️  Backend..."
if [ -d "backend" ] && [ -f "backend/package.json" ]; then
  cd backend

  if [ "$UPDATE" == "--update" ]; then
    npm update
  fi

  npm ci --legacy-peer-deps 2>/dev/null || npm install --legacy-peer-deps

  if [ "$AUDIT" == "--audit" ]; then
    echo "  🔍 Audit de sécurité..."
    npm audit --audit-level=moderate || true
  fi

  cd - > /dev/null
  echo -e "${GREEN}✓ Backend dependencies synced${NC}"
fi

# ─── Frontend ───────────────────────────────────
echo ""
echo "📱 Frontend..."
if [ -d "frontend" ] && [ -f "frontend/package.json" ]; then
  cd frontend

  if [ "$UPDATE" == "--update" ]; then
    npm update
  fi

  npm ci --legacy-peer-deps 2>/dev/null || npm install --legacy-peer-deps

  if [ "$AUDIT" == "--audit" ]; then
    echo "  🔍 Audit de sécurité..."
    npm audit --audit-level=moderate || true
  fi

  cd - > /dev/null
  echo -e "${GREEN}✓ Frontend dependencies synced${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✓ Toutes les dépendances synchronisées!${NC}"

if [ "$AUDIT" != "--audit" ]; then
  echo ""
  echo "💡 Pour audit de sécurité: sync-all.sh --audit"
fi
