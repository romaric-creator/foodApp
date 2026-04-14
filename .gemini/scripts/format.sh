#!/usr/bin/env bash
# Format Script - Formater tous les fichiers du projet
# Usage: ./.gemini/scripts/format.sh [--check]

CHECK=${1:-""}

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "💅 Formatting Projet"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

ERRORS=0

# ─── Prettier ────────────────────────────────
if command -v prettier &> /dev/null; then
  echo ""
  echo "🎨 Prettier..."

  if [ "$CHECK" == "--check" ]; then
    prettier --check . --ignore-path .gitignore 2>/dev/null || ERRORS=$((ERRORS + 1))
  else
    prettier --write . --ignore-path .gitignore 2>/dev/null || ERRORS=$((ERRORS + 1))
  fi

  echo -e "${GREEN}✓ Prettier done${NC}"
else
  echo "  ⚠️  Prettier not installed"
fi

# ─── Backend Formatting ──────────────────────
if [ -d "backend" ]; then
  echo ""
  echo "🖥️  Backend..."
  cd backend

  if [ -f "package.json" ] && grep -q '"prettier"' package.json; then
    if [ "$CHECK" == "--check" ]; then
      npm run prettier -- --check . 2>/dev/null || ERRORS=$((ERRORS + 1))
    else
      npm run prettier -- --write . 2>/dev/null || ERRORS=$((ERRORS + 1))
    fi
  fi

  cd - > /dev/null
  echo -e "${GREEN}✓ Backend formatted${NC}"
fi

# ─── Frontend Formatting ─────────────────────
if [ -d "frontend" ]; then
  echo ""
  echo "📱 Frontend..."
  cd frontend

  if [ -f "package.json" ] && grep -q '"prettier"' package.json; then
    if [ "$CHECK" == "--check" ]; then
      npm run prettier -- --check . 2>/dev/null || ERRORS=$((ERRORS + 1))
    else
      npm run prettier -- --write . 2>/dev/null || ERRORS=$((ERRORS + 1))
    fi
  fi

  cd - > /dev/null
  echo -e "${GREEN}✓ Frontend formatted${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}✓ Format OK!${NC}"
else
  echo -e "${YELLOW}⚠️  $ERRORS formatting issues${NC}"

  if [ "$CHECK" == "--check" ]; then
    echo ""
    echo "💡 Exécutez: ./.gemini/scripts/format.sh"
  fi
fi
