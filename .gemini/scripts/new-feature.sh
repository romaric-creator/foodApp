#!/usr/bin/env bash
# Usage : ./.gemini/scripts/new-feature.sh "<description>"

PROMPT=$1
AGENT="orchestrator"
SKILL_FILE=".gemini/skills/$AGENT/SKILL.md"

[ -z "$PROMPT" ] && { echo "❌ Description de la feature requise."; exit 1; }
[ ! -f "$SKILL_FILE" ] && { echo "❌ Agent '$AGENT' introuvable."; exit 1; }

SYSTEM=$(cat "$SKILL_FILE")

# Injection mémoire projet
if [ -f "ARCHITECTURE.md" ]; then
  ARCH=$(cat "ARCHITECTURE.md")
  SYSTEM="$SYSTEM

---
## 📐 Contexte Architecture du Projet (ARCHITECTURE.md)
$ARCH"
  echo "  ℹ Mémoire projet injectée (ARCHITECTURE.md)"
fi

echo "🎯 Agent: Orchestrator | Planning de : $PROMPT"
echo "─────────────────────────────────────────"
gemini -p "### ROLE: $AGENT
$SYSTEM

### TASK
$PROMPT"
