#!/usr/bin/env bash
# Logs Script - Viewing project logs
# Usage: ./.gemini/scripts/logs.sh [backend|frontend|docker|all] [--follow] [--lines N]

LOG_SOURCE=${1:-"all"}
FOLLOW=${2:-""}
LINES=${3:-"100"}

if [ "$FOLLOW" == "--lines" ]; then
  LINES=$3
  FOLLOW=$4
fi

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "📋 Project Logs"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

case "$LOG_SOURCE" in
  backend)
    if [ -d "backend/logs" ]; then
      echo ""
      echo "🖥️  Backend Logs"
      LATEST=$(ls -t backend/logs/*.log 2>/dev/null | head -1)
      if [ -n "$LATEST" ]; then
        if [ "$FOLLOW" == "--follow" ]; then
          tail -f "$LATEST"
        else
          tail -n "$LINES" "$LATEST"
        fi
      else
        echo "  No logs found"
      fi
    fi
    ;;

  frontend)
    echo ""
    echo "📱 Frontend Logs"
    if [ -d "frontend/logs" ]; then
      LATEST=$(ls -t frontend/logs/*.log 2>/dev/null | head -1)
      if [ -n "$LATEST" ]; then
        if [ "$FOLLOW" == "--follow" ]; then
          tail -f "$LATEST"
        else
          tail -n "$LINES" "$LATEST"
        fi
      else
        echo "  No logs found"
      fi
    else
      echo "  No logs directory"
    fi
    ;;

  docker)
    echo ""
    echo "🐳 Docker Logs"
    if command -v docker &> /dev/null; then
      if [ "$FOLLOW" == "--follow" ]; then
        docker-compose logs -f 2>/dev/null || echo "Docker not running"
      else
        docker-compose logs --tail=$LINES 2>/dev/null || echo "Docker not running"
      fi
    else
      echo "  Docker not installed"
    fi
    ;;

  all|*)
    echo ""
    echo -e "${BLUE}━ Backend${NC}"
    if [ -d "backend/logs" ]; then
      LATEST=$(ls -t backend/logs/*.log 2>/dev/null | head -1)
      [ -n "$LATEST" ] && tail -n 20 "$LATEST" || echo "  No logs"
    fi

    echo ""
    echo -e "${BLUE}━ Frontend${NC}"
    if [ -d "frontend/logs" ]; then
      LATEST=$(ls -t frontend/logs/*.log 2>/dev/null | head -1)
      [ -n "$LATEST" ] && tail -n 20 "$LATEST" || echo "  No logs"
    fi
    ;;
esac

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Usage:"
echo "  ./.gemini/scripts/logs.sh [backend|frontend|docker|all]"
echo "  ./.gemini/scripts/logs.sh backend --follow"
echo "  ./.gemini/scripts/logs.sh all --lines 200"
