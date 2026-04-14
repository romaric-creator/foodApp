#!/usr/bin/env bash
# Benchmark Script - Performance benchmarking
# Usage: ./.gemini/scripts/benchmark.sh [api|frontend|general] [--detailed]

BENCH_TYPE=${1:-"general"}
DETAILED=${2:-""}

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "⚡ Performance Benchmarking"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

case "$BENCH_TYPE" in
  api)
    echo ""
    echo "🔌 Backend API Benchmark"

    if [ -d "backend" ]; then
      cd backend

      if npm list autocannon &>/dev/null; then
        echo "  Testing API endpoints..."
        echo "  http://localhost:3000/api/health"

        # Start server in background if not running
        if ! pgrep -f "node.*index" > /dev/null; then
          npm run dev &
          SERVER_PID=$!
          sleep 3
        fi

        autocannon http://localhost:3000/api/health -d 10 -c 100 || true

        [ -n "$SERVER_PID" ] && kill $SERVER_PID 2>/dev/null || true
      else
        echo "  ⚠️  autocannon not installed: npm install -D autocannon"
      fi

      cd - > /dev/null
    fi
    ;;

  frontend)
    echo ""
    echo "📱 Frontend Bundle Analysis"

    if [ -d "frontend" ]; then
      cd frontend

      echo "  Building and analyzing bundle..."
      npm run build 2>/dev/null || true

      if npm list webpack-bundle-analyzer &>/dev/null; then
        npm run analyze-bundle 2>/dev/null || {
          echo "  Run: npm install -D webpack-bundle-analyzer"
        }
      fi

      cd - > /dev/null
    fi
    ;;

  lighthouse|general)
    echo ""
    echo "🔍 Lighthouse Audit"

    if command -v lighthouse &> /dev/null; then
      URL=${LIGHTHOUSE_URL:-"http://localhost:3000"}

      if [ "$DETAILED" == "--detailed" ]; then
        lighthouse "$URL" --view
      else
        lighthouse "$URL" --output=json --output=html --output-path=./lighthouse-report
        echo -e "${GREEN}✓ Report: ./lighthouse-report.html${NC}"
      fi
    else
      echo "  ⚠️  lighthouse not installed"
      echo "  npm install -g lighthouse"
    fi
    ;;

  *)
    echo "❌ Type inconnu: $BENCH_TYPE"
    echo ""
    echo "Types disponibles:"
    echo "  api       - API endpoint benchmarking"
    echo "  frontend  - Bundle size analysis"
    echo "  lighthouse - Lighthouse audit"
    exit 1
    ;;
esac

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✓ Benchmark complété${NC}"
