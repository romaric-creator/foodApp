#!/usr/bin/env bash
# Usage : ./.gemini/scripts/audit.sh <file_path> [--fix]

FILE=$1; FIX=$2
AGENT="qa"
SKILL_FILE=".gemini/skills/$AGENT/SKILL.md"

[ -z "$FILE" ] && { echo "❌ Chemin du fichier requis."; exit 1; }
[ ! -f "$FILE" ] && { echo "❌ Fichier '$FILE' introuvable."; exit 1; }
[ ! -f "$SKILL_FILE" ] && { echo "❌ Agent '$AGENT' introuvable."; exit 1; }

SYSTEM=$(cat "$SKILL_FILE")
CONTENT=$(cat "$FILE")

PROMPT="Analyse ce fichier pour la qualité, les bugs et la sécurité OWASP :
---
FILE: $FILE
CONTENT:
$CONTENT"

if [ "$FIX" == "--fix" ]; then
  PROMPT="$PROMPT

⚠️ APPlique les corrections directement si possible."
fi

# Injection mémoire projet
if [ -f "ARCHITECTURE.md" ]; then
  ARCH=$(cat "ARCHITECTURE.md")
  SYSTEM="$SYSTEM

---
## 📐 Contexte Architecture du Projet (ARCHITECTURE.md)
$ARCH"
  echo "  ℹ Mémoire projet injectée (ARCHITECTURE.md)"
fi

echo "🛡️ Agent: QA | Audit de : $FILE"
echo "─────────────────────────────────────────"
gemini -p "### ROLE: $AGENT
$SYSTEM

### TASK
$PROMPT"
