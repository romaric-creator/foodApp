#!/usr/bin/env bash
# Usage : ./branch.sh <type> "<description>" [issue-id]
# Ex    : ./branch.sh feature "auth jwt" 42
#         ./branch.sh fix "calcul-tva" 17
#         ./branch.sh hotfix "crash-login"

TYPE=$1; DESC=$2; ISSUE=$3
VALID=(feature fix hotfix release docs refactor)

[ -z "$TYPE" ] || [ -z "$DESC" ] && {
  echo "❌ Usage : ./branch.sh <type> \"<description>\" [issue-id]"
  echo "   Types  : ${VALID[*]}"
  exit 1
}

printf '%s\n' "${VALID[@]}" | grep -q "^$TYPE$" || {
  echo "❌ Type invalide. Valides : ${VALID[*]}"; exit 1
}

# ── AMÉLIORATION : Vérifier le répertoire propre avant de changer de branche ──
STASHED=false
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "  ⚠ Fichiers modifiés détectés. Stash automatique..."
  git stash push -m "auto-stash avant branch.sh $(date +%Y%m%d-%H%M%S)"
  STASHED=true
  echo "  ✓ Stash effectué (récupère avec : git stash pop)"
fi

SLUG=$(echo "$DESC" | tr '[:upper:]' '[:lower:]' | sed 's/ /-/g' | sed 's/[^a-z0-9-]//g')
BRANCH="${TYPE}/${ISSUE:+${ISSUE}-}${SLUG}"
BASE=$([ "$TYPE" = "hotfix" ] && echo "main" || echo "develop")

# Fallback si develop n'existe pas
if ! git show-ref --verify --quiet "refs/heads/$BASE" && \
   ! git show-ref --verify --quiet "refs/remotes/origin/$BASE"; then
  echo "  ⚠ Branche '$BASE' introuvable, fallback sur main"
  BASE="main"
fi

git fetch origin --quiet
git checkout "$BASE" --quiet
git pull origin "$BASE" --quiet
git checkout -b "$BRANCH"

echo "✅ Branche créée : $BRANCH (base : $BASE)"
[ "$STASHED" = true ] && echo "  💡 Rappel : git stash pop pour récupérer tes modifications"
echo ""
echo "  Prochaines étapes :"
echo "  1. Développer"
echo "  2. git add . && git commit -m '${TYPE}($SLUG): description'"
echo "  3. .gemini/scripts/pr.sh"
