#!/usr/bin/env bash
# Usage : ./.gemini/scripts/invoke.sh <agent> "<prompt>" [--no-cache] [--verbose]

set -e

AGENT=$1
PROMPT=$2
NO_CACHE=${3:-""}
VERBOSE=${4:-""}

# Validate input
AGENTS=(orchestrator architect coder database devops qa reviewer documenter github frontend mobile api performance)

if [ -z "$AGENT" ] || [ -z "$PROMPT" ]; then
  echo "❌ Usage: ./.gemini/scripts/invoke.sh <agent> \"<prompt>\" [--no-cache] [--verbose]"
  echo ""
  echo "   Available agents: ${AGENTS[*]}"
  exit 1
fi

# Check agent exists
if [[ ! " ${AGENTS[@]} " =~ " ${AGENT} " ]]; then
  echo "❌ Agent '$AGENT' inexistant."
  echo "   Disponibles: ${AGENTS[*]}"
  exit 1
fi

SKILL_FILE=".gemini/skills/$AGENT/SKILL.md"
if [ ! -f "$SKILL_FILE" ]; then
  echo "❌ Agent skill file non trouvé: $SKILL_FILE"
  exit 1
fi

# ─── Caching System ────────────────────────────
CACHE_DIR=".gemini/.cache"
CACHE_TTL=86400  # 24 hours
CACHE_HASH=$(echo "$AGENT:$PROMPT" | md5sum | cut -d' ' -f1)
CACHE_FILE="$CACHE_DIR/$CACHE_HASH"

mkdir -p "$CACHE_DIR"

# Check if cache is valid
if [ "$NO_CACHE" != "--no-cache" ] && [ -f "$CACHE_FILE" ]; then
  CACHE_AGE=$(($(date +%s) - $(stat -c %Y "$CACHE_FILE" 2>/dev/null || echo 0)))

  if [ $CACHE_AGE -lt $CACHE_TTL ]; then
    if [ "$VERBOSE" == "--verbose" ]; then
      echo "💾 Cache hit (age: ${CACHE_AGE}s)"
    fi
    cat "$CACHE_FILE"
    exit 0
  else
    rm -f "$CACHE_FILE"
  fi
fi

# ─── Load Agent Skill ──────────────────────────
SYSTEM=$(cat "$SKILL_FILE")

# ─── Inject Project Memory ────────────────────
if [ -f "ARCHITECTURE.md" ]; then
  ARCH=$(cat "ARCHITECTURE.md")
  SYSTEM="$SYSTEM

---
## 📐 Contexte Architecture du Projet (ARCHITECTURE.md)

$ARCH"
  if [ "$VERBOSE" == "--verbose" ]; then
    echo "📌 Architecture injectée ($(wc -c < ARCHITECTURE.md) bytes)"
  fi
fi

# ─── Execute Agent ────────────────────────────
if [ "$VERBOSE" == "--verbose" ]; then
  echo "🤖 Agent: $AGENT | Prompt: $PROMPT"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
fi

# Execute and capture output
OUTPUT=$(gemini -p "### ROLE: $AGENT
$SYSTEM

### TASK
$PROMPT" 2>&1)

# Cache the result
echo "$OUTPUT" | tee "$CACHE_FILE"

# Cleanup old cache files (older than TTL)
find "$CACHE_DIR" -type f -mtime +1 -delete 2>/dev/null || true

