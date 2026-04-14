#!/usr/bin/env bash
# Lint Script - Linter tous les fichiers du projet
# Usage: ./.gemini/scripts/lint.sh [--fix] [--watch]

FIX=${1:-""}
WATCH=${2:-""}

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔍 Linting Projet"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

ERRORS=0

# ─── Backend ────────────────────────────────
if [ -d "backend" ]; then
  echo ""
  echo "🖥️  Backend..."
  cd backend

  if [ -f "package.json" ] && grep -q '"eslint"' package.json; then
    if [ "$FIX" == "--fix" ]; then
      npm run lint -- --fix || ERRORS=$((ERRORS + 1))
    else
      npm run lint || ERRORS=$((ERRORS + 1))
    fi
  else
    echo "  ⚠️  ESLint not configured"
  fi

  cd - > /dev/null
  echo -e "${GREEN}✓ Backend linted${NC}"
fi

# ─── Frontend ───────────────────────────────
if [ -d "frontend" ]; then
  echo ""
  echo "📱 Frontend..."
  cd frontend

  if [ -f "package.json" ] && grep -q '"eslint"' package.json; then
    if [ "$FIX" == "--fix" ]; then
      npm run lint -- --fix || ERRORS=$((ERRORS + 1))
    else
      npm run lint || ERRORS=$((ERRORS + 1))
    fi
  else
    echo "  ⚠️  ESLint not configured"
  fi

  cd - > /dev/null
  echo -e "${GREEN}✓ Frontend linted${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}✓ Tous les fichiers sont OK!${NC}"
else
  echo -e "${RED}✗ $ERRORS erreur(s) détectée(s)${NC}"
  echo ""
  echo "💡 Exécutez: ./.gemini/scripts/lint.sh --fix"
  exit 1
fi

if [ "$WATCH" == "--watch" ]; then
  echo ""
  echo "👁️  Mode watch (Ctrl+C pour quitter)..."
  npm run lint -- --watch 2>/dev/null || true
fi
