#!/usr/bin/env bash
# Stats Script - Statistiques du projet
# Usage: ./.gemini/scripts/stats.sh [--detailed]

DETAILED=${1:-""}

echo "📊 Statistiques Projet"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ─── Code Lines ────────────────────────────────
echo ""
echo "📝 Lignes de code:"
if [ -d "backend" ]; then
  BACKEND_JS=$(find backend -name "*.js" -not -path "*/node_modules/*" -not -path "*/.git/*" | xargs wc -l 2>/dev/null | tail -1 | awk '{print $1}')
  echo "  Backend:  $BACKEND_JS lignes"
fi

if [ -d "frontend" ]; then
  FRONTEND_TS=$(find frontend -name "*.ts" -o -name "*.tsx" -o -name "*.js" | grep -v node_modules | wc -l)
  FRONTEND_LINES=$(find frontend -name "*.ts" -o -name "*.tsx" -o -name "*.js" | grep -v node_modules | xargs wc -l 2>/dev/null | tail -1 | awk '{print $1}')
  echo "  Frontend: $FRONTEND_LINES lignes"
fi

# ─── Fichiers ──────────────────────────────────
echo ""
echo "📁 Fichiers:"
if [ -d "backend/controllers" ]; then
  CTRL=$(find backend/controllers -name "*.js" | wc -l)
  echo "  Controllers: $CTRL"
fi

if [ -d "backend/models" ]; then
  MODELS=$(find backend/models -name "*.js" | wc -l)
  echo "  Models: $MODELS"
fi

if [ -d "frontend/components" ]; then
  COMPS=$(find frontend/components -name "*.tsx" -o -name "*.ts" -o -name "*.js" | wc -l)
  echo "  Composants Frontend: $COMPS"
fi

# ─── Git Stats ─────────────────────────────────
echo ""
echo "🔀 Git:"
if [ -d ".git" ]; then
  COMMITS=$(git rev-list --all --count 2>/dev/null || echo "?")
  AUTHORS=$(git shortlog -sn 2>/dev/null | wc -l || echo "?")
  BRANCHES=$(git branch -a 2>/dev/null | wc -l || echo "?")
  echo "  Commits: $COMMITS"
  echo "  Auteurs: $AUTHORS"
  echo "  Branches: $BRANCHES"
fi

# ─── Size ──────────────────────────────────────
echo ""
echo "💾 Taille:"
if [ -d "node_modules" ]; then
  SIZE=$(du -sh node_modules 2>/dev/null | awk '{print $1}')
  echo "  node_modules: $SIZE"
fi

if [ -d "backend/uploads" ]; then
  SIZE=$(du -sh backend/uploads 2>/dev/null | awk '{print $1}')
  echo "  Uploads: $SIZE"
fi

# ─── Dépendances ────────────────────────────────
echo ""
echo "📦 Dépendances:"
if [ -f "package.json" ]; then
  DEPS=$(grep -c '"dependencies"' package.json 2>/dev/null || echo "0")
  echo "  Root: voir package.json"
fi

if [ -f "backend/package.json" ]; then
  BACKEND_DEPS=$(jq '.dependencies | length' backend/package.json 2>/dev/null || echo "?")
  echo "  Backend: ~$BACKEND_DEPS packages"
fi

if [ -f "frontend/package.json" ]; then
  FRONTEND_DEPS=$(jq '.dependencies | length' frontend/package.json 2>/dev/null || echo "?")
  echo "  Frontend: ~$FRONTEND_DEPS packages"
fi

if [ "$DETAILED" == "--detailed" ]; then
  echo ""
  echo "🔍 Détails supplémentaires:"

  if [ -d "backend/migrations" ]; then
    MIGRATIONS=$(find backend/migrations -type f | wc -l)
    echo "  Migrations BD: $MIGRATIONS"
  fi

  if [ -d "backend/__tests__" ]; then
    TESTS=$(find backend/__tests__ -name "*.test.js" -o -name "*.spec.js" | wc -l)
    echo "  Tests Backend: $TESTS"
  fi

  if [ -d "documentation" ]; then
    DOCS=$(find documentation -name "*.md" | wc -l)
    echo "  Docs: $DOCS fichiers"
  fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
