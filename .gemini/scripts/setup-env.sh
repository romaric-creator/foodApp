#!/usr/bin/env bash
# Usage : ./setup-env.sh [--generate|--check|--sync]
#
# --generate : Demande à l'agent database de créer .env.example
# --check    : Vérifie que toutes les variables de .env.example sont dans .env
# --sync     : Ajoute les variables manquantes dans .env sans les remplir

MODE=${1:-"--check"}

case "$MODE" in
  --generate)
    DB_SKILL=$(cat ".gemini/skills/database/SKILL.md")
    ARCH_CTX=""
    if [ -f "ARCHITECTURE.md" ]; then
      ARCH=$(cat "ARCHITECTURE.md")
      ARCH_CTX="

## Contexte Architecture
$ARCH"
    fi

    # Scan du code pour trouver les variables d'environnement utilisées
    ENV_VARS=$(grep -rh "process\.env\." src/ 2>/dev/null | \
      grep -oE "process\.env\.[A-Z_]+" | \
      sed 's/process\.env\.//' | sort -u || echo "")

    echo "  🔍 Variables process.env détectées dans /src :"
    echo "$ENV_VARS" | sed 's/^/     /'

    echo ""
    echo "  ⚙ L'agent database génère le .env.example..."
    RESULT=$(gemini --system "$DB_SKILL$ARCH_CTX" \
      "Génère un fichier .env.example complet pour ce projet.
Variables déjà détectées dans le code :
$ENV_VARS

Format attendu :
\`\`\`
# Section : Base de données
DB_HOST=localhost
DB_PORT=5432

# Section : Auth
JWT_SECRET=your-secret-here
\`\`\`
Ajoute une description commentée pour chaque variable.
Ne mets jamais de vraies valeurs sensibles.")

    echo "$RESULT" | grep -E "^(#|[A-Z_]+=)" > .env.example 2>/dev/null || echo "$RESULT" > .env.example
    echo "  ✅ .env.example généré"
    ;;

  --check)
    [ ! -f ".env.example" ] && {
      echo "❌ .env.example introuvable. Lance : ./setup-env.sh --generate"; exit 1
    }
    [ ! -f ".env" ] && {
      echo "❌ .env introuvable. Copie : cp .env.example .env"; exit 1
    }

    echo "  🔍 Vérification des variables..."
    MISSING=()
    while IFS= read -r line; do
      [[ "$line" =~ ^#.*$ || -z "$line" ]] && continue
      VAR=$(echo "$line" | cut -d= -f1)
      grep -q "^${VAR}=" .env 2>/dev/null || MISSING+=("$VAR")
    done < .env.example

    if [ ${#MISSING[@]} -eq 0 ]; then
      echo "  ✅ Toutes les variables sont configurées dans .env"
    else
      echo "  ⚠  Variables manquantes dans .env :"
      for v in "${MISSING[@]}"; do echo "     - $v"; done
      echo ""
      echo "  Lance : ./setup-env.sh --sync"
      exit 1
    fi
    ;;

  --sync)
    [ ! -f ".env.example" ] && {
      echo "❌ .env.example introuvable."; exit 1
    }
    touch .env
    ADDED=0
    while IFS= read -r line; do
      [[ "$line" =~ ^#.*$ || -z "$line" ]] && {
        echo "$line" >> .env 2>/dev/null || true; continue
      }
      VAR=$(echo "$line" | cut -d= -f1)
      grep -q "^${VAR}=" .env 2>/dev/null || {
        echo "${VAR}=" >> .env
        echo "  + Ajouté : $VAR"
        ADDED=$((ADDED+1))
      }
    done < .env.example
    echo "  ✅ $ADDED variable(s) ajoutée(s) dans .env — remplis les valeurs"
    ;;

  *)
    echo "❌ Mode inconnu. Usage : ./setup-env.sh [--generate|--check|--sync]"
    ;;
esac
