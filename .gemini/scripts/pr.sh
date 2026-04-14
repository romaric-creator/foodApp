#!/usr/bin/env bash
# Usage : ./pr.sh [source] [cible]
# Par défaut : branche courante → develop

SOURCE=${1:-$(git branch --show-current)}
TARGET=${2:-develop}

[ -z "$SOURCE" ] && { echo "❌ Branche source introuvable."; exit 1; }

[[ "$SOURCE" == hotfix/* || "$SOURCE" == release/* ]] && TARGET="main"

ISSUE_REF=""
[[ "$SOURCE" =~ /([0-9]+)- ]] && ISSUE_REF="Closes #${BASH_REMATCH[1]}"

TITLE=$(echo "$SOURCE" | sed 's|.*/||' | sed 's/-/ /g' | sed 's/^[0-9]* //')
TITLE="${TITLE^}"

echo "🔀 PR : $SOURCE → $TARGET | Titre : $TITLE"

git push origin "$SOURCE" 2>/dev/null || true

gh pr create \
  --base "$TARGET" \
  --head "$SOURCE" \
  --title "$TITLE" \
  --body "## 📋 Description
[Décris les changements effectués]

## 🎯 Type de changement
- [ ] ✨ Nouvelle feature  - [ ] 🐛 Bug fix
- [ ] 🔥 Hotfix critique   - [ ] 📝 Documentation

## ✅ Checklist
- [ ] Tests passent (\`npm test\`)
- [ ] Linting propre (\`npm run lint\`)
- [ ] Scan sécurité OK (\`.gemini/scripts/security-scan.sh\`)
- [ ] Docs à jour si besoin
- [ ] Pas de secrets dans le diff

## 🔗 Issue liée
$ISSUE_REF" \
  --web

echo "✅ PR créée."
