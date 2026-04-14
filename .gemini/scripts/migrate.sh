#!/usr/bin/env bash
# Migration Script - Gère les migrations BD
# Usage: ./.gemini/scripts/migrate.sh [create|up|down|status|redo]

set -e

ACTION=${1:-"status"}
NAME=${2:-""}

if [ ! -d "backend" ]; then
  echo "❌ Dossier backend non trouvé"
  exit 1
fi

cd backend

MIGRATIONS_DIR="migrations"
[ ! -d "$MIGRATIONS_DIR" ] && mkdir -p "$MIGRATIONS_DIR"

case "$ACTION" in
  create)
    if [ -z "$NAME" ]; then
      echo "❌ Usage: ./.gemini/scripts/migrate.sh create <migration_name>"
      exit 1
    fi
    TIMESTAMP=$(date +%s)
    FILE="$MIGRATIONS_DIR/${TIMESTAMP}_${NAME}.js"

    cat > "$FILE" << 'EOF'
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // TODO: Implémer la migration UP
    // Exemple:
    // await queryInterface.createTable('users', {
    //   id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    //   email: { type: Sequelize.STRING, unique: true }
    // });
  },

  down: async (queryInterface, Sequelize) => {
    // TODO: Implémenter la migration DOWN (rollback)
    // Exemple:
    // await queryInterface.dropTable('users');
  }
};
EOF

    echo "✓ Migration créée: $FILE"
    echo "  Éditez-la et lancez: npm run migrate:up"
    ;;

  up)
    echo "🚀 Exécution des migrations..."
    npm run migrate:up 2>/dev/null || {
      echo "⚠️  Migration script non trouvé"
      echo "   Installez les outils de migration ou lancez manuellement"
    }
    ;;

  down)
    echo "⬇️  Rollback migration..."
    npm run migrate:down 2>/dev/null || echo "⚠️  Pas de rollback disponible"
    ;;

  status)
    echo "📋 Status migrations:"
    if [ -f "package.json" ] && grep -q "sequelize" package.json; then
      echo "  📦 Sequelize détecté"
      npm run migrate:status 2>/dev/null || echo "  ⚠️  Status unavailable"
    else
      echo "  Fichiers migrations: $MIGRATIONS_DIR"
      ls -la "$MIGRATIONS_DIR" 2>/dev/null || echo "  Aucune migration trouvée"
    fi
    ;;

  redo)
    echo "🔄 Redo dernière migration..."
    npm run migrate:down 2>/dev/null
    npm run migrate:up 2>/dev/null
    ;;

  *)
    echo "❌ Action inconnue: $ACTION"
    echo ""
    echo "Actions disponibles:"
    echo "  create <name>  - Créer une nouvelle migration"
    echo "  up             - Exécuter les migrations"
    echo "  down           - Rollback dernière migration"
    echo "  status         - Vue status"
    echo "  redo           - Redo dernière migration"
    exit 1
    ;;
esac

cd - > /dev/null
