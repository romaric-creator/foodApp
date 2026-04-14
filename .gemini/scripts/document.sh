#!/usr/bin/env bash
# Usage : ./document.sh <dossier|fichier>

TARGET=$1
DOC_SKILL=$(cat ".gemini/skills/documenter/SKILL.md")

[ -z "$TARGET" ] && {
  echo "❌ Usage : ./document.sh src/controllers/"
  exit 1
}

echo -e "\n📝 DOCUMENTATION : $TARGET\n"

if [ -f "$TARGET" ]; then
  CODE=$(cat "$TARGET")
  gemini --system "$DOC_SKILL" \
    "Génère la documentation complète pour ce fichier :
\`\`\`
$CODE
\`\`\`"
elif [ -d "$TARGET" ]; then
  TREE=$(find "$TARGET" -type f | head -50)
  gemini --system "$DOC_SKILL" \
    "Génère un README.md pour ce module.
Arborescence :
$TREE"
fi
