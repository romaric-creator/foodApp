#!/usr/bin/env bash
# Init Script - Setup initial du système .gemini
# Usage: ./.gemini/scripts/init.sh [--full]

FULL=${1:-""}

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "🚀 Gemini System Initialization"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ─── Check Prerequisites ────────────────────
echo ""
echo "✅ Vérification des prérequis..."

if ! command -v gemini &> /dev/null; then
  echo -e "${YELLOW}⚠️  Gemini CLI not found${NC}"
  echo "   Install: npm install -g @google-ai/gemini-cli"
fi

if ! command -v git &> /dev/null; then
  echo -e "${YELLOW}⚠️  Git not found${NC}"
  exit 1
fi

# ─── Create Directory Structure ────────────
echo ""
echo "📁 Création des dossiers..."

mkdir -p .gemini/{skills,scripts,.cache}
mkdir -p backend/logs
mkdir -p frontend/logs

echo -e "${GREEN}✓ Structure created${NC}"

# ─── Initialize Git Hooks ──────────────────
echo ""
echo "🔗 Git Hooks..."

if [ ! -d ".git/hooks" ]; then
  git init > /dev/null 2>&1
fi

# Pre-commit hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
echo "🔍 Pre-commit checks..."
.gemini/scripts/lint.sh --fix || exit 1
.gemini/scripts/security-scan.sh || exit 1
EOF

chmod +x .git/hooks/pre-commit
echo -e "${GREEN}✓ Pre-commit hook installed${NC}"

# ─── Make Scripts Executable ───────────────
echo ""
echo "🔐 Permissions..."

chmod +x .gemini/scripts/*.sh
echo -e "${GREEN}✓ Scripts made executable${NC}"

# ─── Setup Environment Files ───────────────
echo ""
echo "⚙️  Configuration..."

if [ ! -f ".env.example" ]; then
  echo "# Environment Variables" > .env.example
  echo "" >> .env.example
  echo "# Backend" >> .env.example
  echo "# BACKEND_URL=http://localhost:3000" >> .env.example
  echo "" >> .env.example
  echo "# Frontend" >> .env.example
  echo "# FRONTEND_URL=http://localhost:8081" >> .env.example

  echo -e "${GREEN}✓ .env.example created${NC}"
fi

# ─── Full Setup ─────────────────────────────
if [ "$FULL" == "--full" ]; then
  echo ""
  echo "📦 Dépendances..."

  if [ -f "package.json" ]; then
    npm install --legacy-peer-deps 2>/dev/null
    echo -e "${GREEN}✓ Root dependencies${NC}"
  fi

  if [ -f "backend/package.json" ]; then
    cd backend
    npm install --legacy-peer-deps 2>/dev/null
    cd - > /dev/null
    echo -e "${GREEN}✓ Backend dependencies${NC}"
  fi

  if [ -f "frontend/package.json" ]; then
    cd frontend
    npm install --legacy-peer-deps 2>/dev/null
    cd - > /dev/null
    echo -e "${GREEN}✓ Frontend dependencies${NC}"
  fi

  # ─── Generate ARCHITECTURE.md if needed ──
  echo ""
  echo "🏗️  Architecture..."

  if [ ! -f "ARCHITECTURE.md" ]; then
    echo "📌 Generating ARCHITECTURE.md..."
    echo ""
    echo "ℹ️  ARCHITECTURE.md is required for full agent capabilities"
    echo ""
    echo "Generate it with:"
    echo "  ./.gemini/scripts/invoke.sh architect \"${BLUE}Documente l'architecture complète du projet${NC}\""
    echo ""
    echo "Then save the output to ARCHITECTURE.md at project root"
  fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✓ Initialization complete!${NC}"
echo ""
echo "🎯 Next Steps:"
echo "   1. ./.gemini/scripts/health-check.sh"
echo "   2. Generate ARCHITECTURE.md (see above)"
echo "   3. ./.gemini/scripts/invoke.sh coder \"...prompt...\""
echo ""
echo "📚 Docs: .gemini/README.md"
