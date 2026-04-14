#!/usr/bin/env bash
# Usage : ./security-scan.sh [dossier]
# Scan les secrets, credentials et patterns dangereux avant un commit/PR.
# Ex    : ./security-scan.sh src/
#         ./security-scan.sh          ← scan tout le projet

TARGET=${1:-.}
FOUND=0

echo -e "\n🔒 SCAN DE SÉCURITÉ : $TARGET\n"

# Patterns dangereux à détecter
declare -A PATTERNS=(
  ["Clé API / token en dur"]="(api[_-]?key|apikey|api[_-]?secret)\s*[=:]\s*['\"][A-Za-z0-9_\-]{16,}"
  ["Mot de passe en dur"]="(password|passwd|pwd|secret)\s*[=:]\s*['\"][^'\"]{4,}"
  ["JWT secret en dur"]="(jwt[_-]?secret|token[_-]?secret)\s*[=:]\s*['\"]"
  ["Clé privée SSH/RSA"]="-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----"
  ["Token GitHub/AWS"]="(ghp_|sk-|AKIA|AIza)[A-Za-z0-9]{10,}"
  ["Credential MongoDB"]="mongodb(\+srv)?://[^:]+:[^@]+@"
  ["eval() avec variable"]="eval\s*\(\s*\\\$"
  ["Commande rm -rf dangereuse"]="rm\s+-rf\s+/"
)

for DESC in "${!PATTERNS[@]}"; do
  PATTERN="${PATTERNS[$DESC]}"
  MATCHES=$(grep -rniE "$PATTERN" \
    --exclude-dir=".git" --exclude-dir="node_modules" \
    --exclude-dir=".gemini" --exclude="*.backup" \
    --include="*.js" --include="*.ts" --include="*.py" \
    --include="*.sh" --include="*.env*" --include="*.json" \
    "$TARGET" 2>/dev/null || true)

  if [ -n "$MATCHES" ]; then
    echo "  🔴 $DESC :"
    echo "$MATCHES" | head -5 | sed 's/^/     /'
    echo ""
    FOUND=$((FOUND + 1))
  fi
done

# Vérification .gitignore
echo "  📋 Vérification .gitignore..."
MISSING=()
for SENSITIVE in ".env" ".env.local" ".env.production" "*.pem" "*.key" "*.p12"; do
  if [ -f ".gitignore" ]; then
    grep -q "$SENSITIVE" .gitignore 2>/dev/null || MISSING+=("$SENSITIVE")
  else
    MISSING+=("$SENSITIVE (pas de .gitignore !)")
  fi
done

if [ ${#MISSING[@]} -gt 0 ]; then
  echo "  🟡 Entrées manquantes dans .gitignore :"
  for item in "${MISSING[@]}"; do echo "     - $item"; done
  FOUND=$((FOUND + 1))
  echo ""
fi

# Vérification npm audit
if [ -f "package.json" ] && command -v npm &>/dev/null; then
  echo "  📦 npm audit (vulnérabilités dépendances)..."
  AUDIT=$(npm audit --audit-level=high --json 2>/dev/null | \
    python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('metadata',{}).get('vulnerabilities',{}))" 2>/dev/null || echo "")
  if [ -n "$AUDIT" ] && echo "$AUDIT" | grep -qvE "^(\{\}|{'high': 0, 'critical': 0})"; then
    echo "  🟡 Vulnérabilités détectées : $AUDIT"
    echo "     Lance : npm audit fix"
    FOUND=$((FOUND + 1))
  else
    echo "  ✓ Aucune vulnérabilité HIGH/CRITICAL"
  fi
fi

echo ""
if [ "$FOUND" -eq 0 ]; then
  echo "  ✅ Scan terminé — aucun problème détecté. Safe to PR."
else
  echo "  ⚠  $FOUND problème(s) détecté(s) — corrige avant de pousser."
  exit 1
fi
