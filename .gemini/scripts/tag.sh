#!/usr/bin/env bash
# Usage : ./tag.sh <version> ["notes"]

VERSION=$1; NOTES=${2:-""}
[ -z "$VERSION" ] && { echo "❌ Version requise."; exit 1; }

VERSION="${VERSION#v}"; TAG="v$VERSION"
echo "🏷  Tag $TAG sur main"

git checkout main --quiet && git pull origin main --quiet

git tag | grep -q "^$TAG$" && {
  echo "❌ Tag $TAG existe déjà."; git tag | grep "^v" | sort -V | tail -5; exit 1
}

git tag -a "$TAG" -m "Release $TAG"
git push origin "$TAG"
echo "  ✓ Tag poussé"

LAST_TAG=$(git tag --sort=-version:refname | grep -v "^$TAG$" | head -1)
AUTO_NOTES=$(git log "${LAST_TAG:-}..${TAG}" --oneline 2>/dev/null | sed 's/^/- /' || echo "- Release initiale")

gh release create "$TAG" \
  --title "Release $TAG" \
  --notes "$([ -n "$NOTES" ] && echo "$NOTES"$'\n\n')"## Changements

$AUTO_NOTES" \
  --latest

echo "✅ GitHub Release $TAG publiée !"
echo "   $(gh release view "$TAG" --json url --jq '.url' 2>/dev/null)"
