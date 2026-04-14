# 🤖 Gemini Multi-Agents System

Système d'agents intelligents pour accélérer le développement du projet blood-donation-app.

## 📖 Table des matières

- [Quick Start](#quick-start)
- [Agents](#agents)
- [Scripts](#scripts)
- [Workflows](#workflows)
- [Advanced](#advanced)
- [Troubleshooting](#troubleshooting)

## 🚀 Quick Start

### 1. Vérifier la santé du projet

```bash
.gemini/scripts/health-check.sh
```

### 2. Générer l'architecture (une seule fois)

```bash
.gemini/scripts/invoke.sh architect "Documente l'architecture complète du projet"
# Sauvegarder le résultat dans ARCHITECTURE.md
```

### 3. Invoquer un agent

```bash
# Format: .gemini/scripts/invoke.sh <agent> "<prompt>"
.gemini/scripts/invoke.sh coder "Ajoute la validation email"
.gemini/scripts/invoke.sh frontend "Crée un composant de login"
.gemini/scripts/invoke.sh performance "Optimise les temps de réponse API"
```

## 🧠 Agents disponibles (16)

### Core

- **`orchestrator`** - Chef de projet, planification
- **`architect`** - Architecture, design patterns
- **`coder`** - Implémentation, bug fixes
- **`reviewer`** - Code review, refactoring

### Frontend & Mobile

- **`frontend`** - React Native, UI, styling, animations
- **`mobile`** - iOS/Android, EAS, native modules

### Backend

- **`api`** - REST, GraphQL, validation, versioning
- **`database`** - Schemas, migrations, optimisations
- **`performance`** - Profiling, benchmarking, caching

### Quality & Security ⭐ NEW

- **`testing`** - Unit, integration, e2e, coverage
- **`security`** - Audits, secrets, OWASP compliance
- **`ci-cd`** - Pipelines, automation, monitoring

### Infrastructure

- **`devops`** - Docker, CI/CD, deployment
- **`qa`** - Tests, sécurité, audits
- **`documenter`** - Docs, README, changelog
- **`github`** - Git-flow, branches, PRs

## 📦 Scripts disponibles (24)

### Initialization & Setup

```bash
.gemini/scripts/init.sh              # Setup initial system
.gemini/scripts/init.sh --full       # Full setup + dependencies
```

### Diagnostics

```bash
.gemini/scripts/health-check.sh      # Vérifier l'état du projet
.gemini/scripts/stats.sh             # Statistiques détaillées
.gemini/scripts/stats.sh --detailed  # Stats complètes
```

### Code Quality ⭐ NEW

```bash
.gemini/scripts/lint.sh              # Linter tous les fichiers
.gemini/scripts/lint.sh --fix        # Auto-fix lint errors
.gemini/scripts/lint.sh --watch      # Watch mode

.gemini/scripts/format.sh            # Formater avec Prettier
.gemini/scripts/format.sh --check    # Check only (no fix)

.gemini/scripts/test.sh              # Exécuter tests (unit)
.gemini/scripts/test.sh integration  # Integration tests
.gemini/scripts/test.sh e2e          # E2E tests
.gemini/scripts/test.sh coverage     # Coverage report
.gemini/scripts/test.sh --watch      # Watch mode

.gemini/scripts/benchmark.sh api     # API benchmarking
.gemini/scripts/benchmark.sh frontend # Bundle analysis
.gemini/scripts/benchmark.sh lighthouse  # Web vitals
```

### Monitoring ⭐ NEW

```bash
.gemini/scripts/logs.sh              # View logs (all)
.gemini/scripts/logs.sh backend      # Backend logs
.gemini/scripts/logs.sh frontend     # Frontend logs
.gemini/scripts/logs.sh backend --follow  # Follow backend logs
.gemini/scripts/logs.sh all --lines 200  # Last 200 lines
```

### Feature Development

```bash
.gemini/scripts/new-feature.sh       # Planifier une feature
.gemini/scripts/branch.sh            # Créer une branche Git
.gemini/scripts/issue.sh             # Créer une issue GitHub
.gemini/scripts/issue.sh feature "Description" --start  # Avec branche
```

### Code Quality & Audit

```bash
.gemini/scripts/lint.sh --fix         # Linter + auto-fix
.gemini/scripts/audit.sh --fix        # QA audit + auto-fix
.gemini/scripts/security-scan.sh      # Scanner les secrets
```

### Git & Release Scripts

```bash
.gemini/scripts/branch.sh             # Créer une branche Git-Flow
.gemini/scripts/pr.sh                 # Ouvrir une Pull Request
.gemini/scripts/quick-fix.sh          # Hot fix rapide
.gemini/scripts/quick-fix.sh --commit # Finaliser hot fix

.gemini/scripts/release.sh 1.2.0      # Préparer release
.gemini/scripts/tag.sh 1.2.0          # Publier tag
```

### Deployment & Database

```bash
.gemini/scripts/deploy.sh dev         # Déployer en dev
.gemini/scripts/deploy.sh staging     # Déployer en staging
.gemini/scripts/deploy.sh prod        # Déployer en production

.gemini/scripts/migrate.sh create <name>   # Créer migration
.gemini/scripts/migrate.sh up              # Exécuter migrations
.gemini/scripts/migrate.sh down            # Rollback
.gemini/scripts/migrate.sh status          # Status migrations
```

### Maintenance & Monitoring

```bash
.gemini/scripts/sync-all.sh           # Synchroniser dépendances
.gemini/scripts/sync-all.sh --update  # Update packages
.gemini/scripts/sync-all.sh --audit   # Audit de sécurité

.gemini/scripts/logs.sh all           # View all logs
.gemini/scripts/logs.sh backend --follow  # Follow logs
```

### Deployment

## 🔄 Workflows

### Nouvelle Feature

```bash
# 1. Planifier la feature
.gemini/scripts/new-feature.sh

# 2. Créer branche avec issue
.gemini/scripts/issue.sh feature "Description" --start

# 3. Coder
.gemini/scripts/invoke.sh coder "Implémente la feature X"

# 4. Audit et fix
.gemini/scripts/audit.sh src/ --fix

# 5. Créer PR
.gemini/scripts/pr.sh

# 6. Merger + Delete branche
```

### Hot Fix Urgent

```bash
# 1. Créer branche hotfix
.gemini/scripts/quick-fix.sh

# 2. Effectuer les changements
# ... éditer les fichiers ...

# 3. Committer et merger
.gemini/scripts/quick-fix.sh --commit
```

### Optimisation Performance

```bash
# 1. Analyser
.gemini/scripts/invoke.sh performance "Profile l'application, identifie les goulots"

# 2. Implémenter corrections
.gemini/scripts/invoke.sh coder "Optimise basé sur analyse de performance"

# 3. Vérifier
.gemini/scripts/audit.sh --fix

# 4. Tester en staging
.gemini/scripts/deploy.sh staging

# 5. Monitorer résultats
.gemini/scripts/stats.sh --detailed
```

### Test & Quality Assurance ⭐ NEW

```bash
# 1. Linter et formater
.gemini/scripts/lint.sh --fix
.gemini/scripts/format.sh

# 2. Exécuter les tests
.gemini/scripts/test.sh unit
.gemini/scripts/test.sh integration
.gemini/scripts/test.sh coverage

# 3. Benchmark performance
.gemini/scripts/benchmark.sh api
.gemini/scripts/benchmark.sh frontend

# 4. Security scan
.gemini/scripts/invoke.sh security "Audit de sécurité complet"

# 5. Audit QA
.gemini/scripts/audit.sh --fix

# 6. Vérifier health
.gemini/scripts/health-check.sh
```

### Release Production

```bash
# 1. Préparer release
.gemini/scripts/release.sh 1.2.0

# 2. Vérifier santé
.gemini/scripts/health-check.sh

# 3. Audit final
.gemini/scripts/audit.sh --fix

# 4. Publier
.gemini/scripts/tag.sh 1.2.0 "Description des changements"

# 5. Déployer
.gemini/scripts/deploy.sh prod

# 6. Vérifier
.gemini/scripts/stats.sh --detailed
```

## ⚙️ Advanced

### Mémoire Projet (Architecture Auto-Injectée)

Les agents héritent automatiquement du contexte du projet si `ARCHITECTURE.md` existe :

```bash
# 1. Générer ARCHITECTURE.md une fois
.gemini/scripts/invoke.sh architect "Documente toute l'architecture du projet"

# 2. Sauvegarder le résultat
# Copiez l'output dans ARCHITECTURE.md à la racine du projet

# 3. À partir de là, tous les agents connaissent votre architecture!
.gemini/scripts/invoke.sh coder "..."  # Aura le contexte ARCHITECTURE.md
```

### Exécution Parallèle

```bash
# lancer plusieurs agents en parallèle
.gemini/scripts/invoke.sh frontend "..." &
.gemini/scripts/invoke.sh api "..." &
wait
```

### Caching pour Performance

Les scripts mettent en cache les résultats pour éviter les appels redondants:

```bash
# Premier appel: récupère des données fraîches
.gemini/scripts/invoke.sh architect "..."

# Appels suivants: utilise le cache (plus rapide)
# Le cache expire après 24h ou sur 'rm .gemini/.cache'
```

### Intégration CI/CD

Ajouter dans `.github/workflows/ci.yml` :

```yaml
- name: Health Check
  run: .gemini/scripts/health-check.sh

- name: Audit & Fix
  run: .gemini/scripts/audit.sh src/ --fix

- name: Deploy Staging
  if: github.event_name == 'push' && github.ref == 'refs/heads/develop'
  run: .gemini/scripts/deploy.sh staging
```

## 🆘 Troubleshooting

### Script non trouvé

```bash
# Rendre les scripts exécutables
chmod +x .gemini/scripts/*.sh
```

### Agent introuvable

```bash
# Vérifier la structure
ls .gemini/skills/
# Ajouter manquant:
mkdir -p .gemini/skills/<agent_name>
cp .gemini/skills/coder/SKILL.md .gemini/skills/<agent_name>/
```

### Erreur de permission

```bash
# Vérifier permissions git
git config --global user.email "your@email.com"
git config --global user.name "Your Name"
```

### Cache stale

```bash
# Nettoyer le cache
rm -rf .gemini/.cache
```

### ARCHITECTURE.md non détecté

```bash
# Générer et placer à la racine du projet
.gemini/scripts/invoke.sh architect "..." > ARCHITECTURE.md
```

## 📊 Monitoring

### Vérification quotidienne

```bash
# Rapport santé du projet
.gemini/scripts/health-check.sh

# Statistiques détaillées
.gemini/scripts/stats.sh --detailed

# Audit de sécurité
.gemini/scripts/security-scan.sh
```

### Avant chaque PR

```bash
.gemini/scripts/audit.sh --fix
.gemini/scripts/security-scan.sh
.gemini/scripts/pr.sh
```

### Avant chaque déploiement

```bash
.gemini/scripts/health-check.sh
.gemini/scripts/audit.sh --fix
.gemini/scripts/deploy.sh staging
```

## 🎯 Bonnes Pratiques

1. **Générez ARCHITECTURE.md première** - Les agents l'utilisent automatiquement
2. **Utilisez health-check régulièrement** - Avant et après changements majeurs
3. **Committez avec messages clairs** - Les agents s'en inspireront
4. **Runez les audits** - Non négociable avant PR
5. **Documentez au fur et à mesure** - Utilisez `documenter` agent
6. **Testez en staging** - Avant la production

## 📚 Ressources

- [AGENTS.md](./AGENTS.md) - Liste des agents et workflows
- [skills/](./skills/) - Prompts détaillés de chaque agent
- [scripts/](./scripts/) - Code source des utilitaires

## 📞 Support

- Vérifier `health-check.sh` pour diagnostic
- Lire AGENTS.md pour workflows détaillés
- Consulter documentation/ pour plus d'infos
- Exécuter `invoke.sh architect "Questions?"` pour discuter d'architecture

---

**v4.0** - Système d'agents optimisé pour productivity 🚀
