#!/usr/bin/env bash
# Usage : ./release.sh [version] [major|minor|patch]

VERSION=$1; TYPE=${2:-minor}

if [ -z "$VERSION" ]; then
  LAST_TAG=$(git tag --sort=-version:refname | head -1)
  if [ -n "$LAST_TAG" ]; then
    IFS='.' read -r MAJOR MINOR PATCH <<< "${LAST_TAG#v}"
    case "$TYPE" in
      major) VERSION="$((MAJOR+1)).0.0" ;;
      patch) VERSION="$MAJOR.$MINOR.$((PATCH+1))" ;;
      *)     VERSION="$MAJOR.$((MINOR+1)).0" ;;
    esac
    echo "  Auto-version : $LAST_TAG → v$VERSION"
  else
    echo "❌ Version requise. Usage : ./release.sh 1.2.0"; exit 1
  fi
fi

VERSION="${VERSION#v}"; TAG="v$VERSION"
echo "🚀 Préparation release $TAG"

git fetch origin --quiet
git checkout develop --quiet 2>/dev/null || git checkout main --quiet
git pull --quiet

RELEASE_BRANCH="release/$VERSION"
git checkout -b "$RELEASE_BRANCH"
echo "  ✓ Branche $RELEASE_BRANCH créée"

# Bump package.json
if [ -f "package.json" ] && command -v jq &>/dev/null; then
  jq ".version = \"$VERSION\"" package.json > /tmp/pkg.json && mv /tmp/pkg.json package.json
  git add package.json
  echo "  ✓ package.json → $VERSION"
fi

LAST_TAG=$(git tag --sort=-version:refname | head -1)

# ── AMÉLIORATION : regex plus permissive sur les commits ─────────────────────
echo ""
echo "  📝 Changements depuis $LAST_TAG :"
FEATS=$(git log "${LAST_TAG}..HEAD" --oneline 2>/dev/null | grep -iE "^[a-f0-9]+ feat" || true)
FIXES=$(git log "${LAST_TAG}..HEAD" --oneline 2>/dev/null | grep -iE "^[a-f0-9]+ fix" || true)
OTHERS=$(git log "${LAST_TAG}..HEAD" --oneline 2>/dev/null | grep -ivE "^[a-f0-9]+ (feat|fix)" || true)

[ -n "$FEATS"  ] && echo "  Ajouté :"  && echo "$FEATS"  | sed 's/^/    + /'
[ -n "$FIXES"  ] && echo "  Corrigé :" && echo "$FIXES"  | sed 's/^/    - /'
[ -n "$OTHERS" ] && echo "  Autres :"  && echo "$OTHERS" | sed 's/^/    · /'

if ! git diff --cached --quiet; then
  git commit -m "chore(release): bump version to $VERSION"
  echo "  ✓ Version commitée"
fi

git push origin "$RELEASE_BRANCH"
echo "  ✓ Branche poussée"

ALL_COMMITS=$(git log "${LAST_TAG}..HEAD" --oneline 2>/dev/null | head -20 | sed 's/^/- /' || echo "- Premier release")

gh pr create \
  --base main \
  --head "$RELEASE_BRANCH" \
  --title "Release $TAG" \
  --body "## 🚀 Release $TAG

$ALL_COMMITS

## ✅ Checklist
- [ ] Tests CI passent
- [ ] CHANGELOG.md à jour
- [ ] package.json bumped
- [ ] Review effectuée

Après merge → \`.gemini/scripts/tag.sh $VERSION\`" \
  --web 2>/dev/null || echo "  Ouvre la PR manuellement"

echo ""
echo "✅ Release $TAG prête."
echo "   Après merge PR : .gemini/scripts/tag.sh $VERSION"
