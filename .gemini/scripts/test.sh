#!/usr/bin/env bash
# Test Script - Exécuter tous les tests du projet
# Usage: ./.gemini/scripts/test.sh [unit|integration|e2e|coverage] [--watch] [--verbose]

TEST_TYPE=${1:-"unit"}
WATCH=${2:-""}
VERBOSE=${3:-""}

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

if [ "$TEST_TYPE" == "--watch" ] || [ "$TEST_TYPE" == "--verbose" ]; then
  WATCH=$TEST_TYPE
  VERBOSE=${2:-""}
  TEST_TYPE="unit"
fi

echo "✅ Test Suite"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

ERRORS=0

# ─── Backend Tests ──────────────────────────
if [ -d "backend" ]; then
  echo ""
  echo "🖥️  Backend Tests..."
  cd backend

  case "$TEST_TYPE" in
    unit)
      npm run test:unit -- ${WATCH:+--watch} ${VERBOSE:+--verbose} 2>/dev/null || ERRORS=$((ERRORS + 1))
      ;;
    integration)
      npm run test:integration 2>/dev/null || ERRORS=$((ERRORS + 1))
      ;;
    e2e)
      npm run test:e2e 2>/dev/null || ERRORS=$((ERRORS + 1))
      ;;
    coverage)
      npm run test:coverage 2>/dev/null || ERRORS=$((ERRORS + 1))
      ;;
    *)
      npm run test -- ${WATCH:+--watch} ${VERBOSE:+--verbose} 2>/dev/null || ERRORS=$((ERRORS + 1))
      ;;
  esac

  cd - > /dev/null
  echo -e "${GREEN}✓ Backend tests done${NC}"
fi

# ─── Frontend Tests ─────────────────────────
if [ -d "frontend" ]; then
  echo ""
  echo "📱 Frontend Tests..."
  cd frontend

  case "$TEST_TYPE" in
    unit)
      npm run test:unit -- ${WATCH:+--watch} ${VERBOSE:+--verbose} 2>/dev/null || ERRORS=$((ERRORS + 1))
      ;;
    e2e)
      npm run test:e2e 2>/dev/null || ERRORS=$((ERRORS + 1))
      ;;
    coverage)
      npm run test:coverage 2>/dev/null || ERRORS=$((ERRORS + 1))
      ;;
    *)
      npm run test -- ${WATCH:+--watch} ${VERBOSE:+--verbose} 2>/dev/null || ERRORS=$((ERRORS + 1))
      ;;
  esac

  cd - > /dev/null
  echo -e "${GREEN}✓ Frontend tests done${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}✓ Tous les tests sont passés!${NC}"
else
  echo -e "${RED}✗ $ERRORS test(s) échoué(s)${NC}"
  exit 1
fi
