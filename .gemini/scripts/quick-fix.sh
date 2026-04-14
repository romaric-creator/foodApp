#!/usr/bin/env bash
# Quick Fix Script - Hotfix rapide
# Usage: ./.gemini/scripts/quick-fix.sh [--commit] [--force]

set -e

COMMIT=${1:-""}
FORCE=${2:-""}

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

if [[ ! "$CURRENT_BRANCH" =~ ^hotfix/ ]]; then
  read -p "Nom de la fix (sans 'hotfix/' prefix): " FIX_NAME
  FIX_BRANCH="hotfix/$FIX_NAME"

  echo "🔀 Création branche: $FIX_BRANCH"
  git checkout -b "$FIX_BRANCH" 2>/dev/null || {
    if [ "$FORCE" == "--force" ]; then
      git checkout -B "$FIX_BRANCH"
    else
      echo "❌ Branche existe déjà. Utilisez --force pour forcer."
      exit 1
    fi
  }
else
  FIX_BRANCH=$CURRENT_BRANCH
  FIX_NAME=$(echo "$CURRENT_BRANCH" | sed 's/hotfix\///')
fi

echo ""
echo "🔧 Hot Fix: $FIX_NAME"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Effectuez vos corrections..."
echo "Puis relancez avec: ./.gemini/scripts/quick-fix.sh --commit"
echo ""

if [ "$COMMIT" == "--commit" ]; then
  echo "📝 Changements:"
  git diff --stat

  read -p "Message de commit: " MSG
  [ -z "$MSG" ] && MSG="hotfix: $FIX_NAME"

  git add -A
  git commit -m "$MSG" || {
    echo "❌ Commit échoué"
    exit 1
  }

  echo ""
  echo "🚀 Prêt pour merger:"
  echo "  git checkout main"
  echo "  git merge $FIX_BRANCH"
  echo "  git tag v$(date +%s)"
  echo "  git push"
else
  echo "⏸️  Attendu des changements..."
  read -p "Appuyez sur Enter après vos modifications... "
fi
