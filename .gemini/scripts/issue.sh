#!/usr/bin/env bash
# Usage : ./issue.sh <type> "<titre>" [--start]
# Ex    : ./issue.sh bug "Crash au login"
#         ./issue.sh feature "Ajouter export PDF" --start   ← crée aussi la branche
#         ./issue.sh task "Mettre à jour les dépendances"

TYPE=$1; TITLE=$2; FLAG=$3

[ -z "$TYPE" ] || [ -z "$TITLE" ] && {
  echo "❌ Usage : ./issue.sh <type> \"<titre>\" [--start]"
  echo "   Types : bug | feature | task | docs | refactor"
  echo "   --start : crée aussi la branche associée"
  exit 1
}

case "$TYPE" in
  bug)
    LABEL="bug"
    BODY="## 🐛 Description
[Description claire et concise]

## 🔄 Étapes pour reproduire
1.
2.
3.

## ✅ Attendu vs ❌ Observé
**Attendu** : [comportement normal]
**Observé** : [comportement actuel]

## 🖥️ Environnement
- OS / Node / Version app :

## 📎 Logs
\`\`\`
[logs ici]
\`\`\`"
    ;;
  feature)
    LABEL="enhancement"
    BODY="## ✨ Description
[Expliquer le besoin et la valeur ajoutée]

## 📐 Critères d'acceptation
- [ ]
- [ ]

## 🔗 Références
"
    ;;
  task|chore)
    LABEL="chore"
    BODY="## 📋 Tâche
[Description]

## ✅ Définition of Done
- [ ]
"
    ;;
  docs)
    LABEL="documentation"
    BODY="## 📝 Documentation à créer/modifier
[Décrire ce qui manque]"
    ;;
  *) LABEL="$TYPE"; BODY="[Description]" ;;
esac

gh label create "$LABEL" --color "#d73a4a" --description "" 2>/dev/null || true

ISSUE_URL=$(gh issue create --title "$TITLE" --body "$BODY" --label "$LABEL")
echo "✅ Issue créée : $ISSUE_URL"

ISSUE_NUM=$(echo "$ISSUE_URL" | grep -oE '[0-9]+$')
SLUG=$(echo "$TITLE" | tr '[:upper:]' '[:lower:]' | sed 's/ /-/g' | sed 's/[^a-z0-9-]//g' | cut -c1-40)

# ── AMÉLIORATION : --start crée la branche directement ───────────────────────
if [ "$FLAG" = "--start" ]; then
  echo ""
  echo "  🌿 Création automatique de la branche (--start activé)..."
  bash "$(dirname "$0")/branch.sh" "$TYPE" "$SLUG" "$ISSUE_NUM"
else
  echo ""
  echo "  💡 Pour créer la branche :"
  echo "     .gemini/scripts/branch.sh $TYPE \"$SLUG\" $ISSUE_NUM"
fi
