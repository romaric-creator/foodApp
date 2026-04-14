#!/usr/bin/env bash
# Parallel Agents Script - Exécuter plusieurs agents en même temps
# Usage: ./.gemini/scripts/parallel.sh <agent1> "<prompt1>" <agent2> "<prompt2>" ...

set -e

if [ $# -lt 4 ]; then
  echo "❌ Usage: ./.gemini/scripts/parallel.sh <agent> \"<prompt>\" <agent> \"<prompt>\" ..."
  echo ""
  echo "Exemple:"
  echo "  .gemini/scripts/parallel.sh \\"
  echo "    frontend \"Crée un composant login\" \\"
  echo "    api \"Design endpoint /auth\" \\"
  echo "    database \"Crée table users\""
  exit 1
fi

JOBS=()
PIDS=()
RESULTS=()

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🚀 Parallel Agents Execution"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ─── Launch all agents in parallel ─────────────
INDEX=0
while [ $INDEX -lt $# ]; do
  AGENT=${!INDEX}
  INDEX=$((INDEX + 1))
  PROMPT=${!INDEX}
  INDEX=$((INDEX + 1))

  RESULT_FILE="/tmp/gemini_${AGENT}_$$.txt"
  RESULTS+=("$RESULT_FILE")

  # Launch agent in background
  (
    echo -e "${BLUE}[$(date '+%H:%M:%S')] Starting: $AGENT${NC}"
    .gemini/scripts/invoke.sh "$AGENT" "$PROMPT" > "$RESULT_FILE" 2>&1
    echo -e "${GREEN}[$(date '+%H:%M:%S')] Completed: $AGENT${NC}"
  ) &

  PIDS+=($!)
  echo -e "${BLUE}→ $AGENT${NC} (PID: $!)"
done

echo ""
echo "⏳ Attente de tous les agents..."
echo ""

# ─── Wait for all jobs to complete ────────────
FAILED=0
for i in "${!PIDS[@]}"; do
  PID=${PIDS[$i]}
  if wait $PID 2>/dev/null; then
    :  # success
  else
    FAILED=$((FAILED + 1))
  fi
done

# ─── Display results ──────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Résultats"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

for i in "${!RESULTS[@]}"; do
  RESULT_FILE="${RESULTS[$i]}"

  if [ -f "$RESULT_FILE" ]; then
    LINES=$(wc -l < "$RESULT_FILE")
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✓ Agent $((i+1)) ($LINES lignes)"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    cat "$RESULT_FILE"
    echo ""
    rm -f "$RESULT_FILE"
  fi
done

# ─── Summary ────────────────────────────────
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ Tous les agents ont complété avec succès!${NC}"
else
  echo -e "${YELLOW}⚠️ $FAILED agent(s) échoués${NC}"
  exit 1
fi

echo ""
echo "⏱️  Total time: $(date '+%H:%M:%S')"
