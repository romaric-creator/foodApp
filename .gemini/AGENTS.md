# 🤖 Gemini Multi-Agents v4.1 ⚡ Advanced

## Agents disponibles (16)

### Core Agents

| Agent          | Rôle                  | Quand l'utiliser                  |
| -------------- | --------------------- | --------------------------------- |
| `orchestrator` | 🎯 Chef de projet     | Démarrer une feature, planifier   |
| `architect`    | 🏗️ Conception système | Architecture, patterns, structure |
| `coder`        | 💻 Développement      | Implémenter, corriger du code     |
| `reviewer`     | 👁️ Code Review        | Review, refactoring, optimisation |

### Specializations

| Agent         | Rôle             | Quand l'utiliser                 |
| ------------- | ---------------- | -------------------------------- |
| `frontend`    | 🎨 UI/UX React   | Composants, styling, responsive  |
| `mobile`      | 📱 Mobile Native | iOS/Android, EAS, performance    |
| `api`         | 🔌 REST/GraphQL  | Endpoints, validation, scaling   |
| `performance` | ⚡ Optimisation  | Profiling, benchmarking, caching |
| `database`    | 🗄️ Données       | Schémas, migrations, requêtes    |

### Quality & Security

| Agent      | Rôle                | Quand l'utiliser                   |
| ---------- | ------------------- | ---------------------------------- |
| `testing`  | ✅ Tests            | Unit, integration, e2e, coverage   |
| `security` | 🔒 Sécurité         | Audits, secrets, OWASP, compliance |
| `ci-cd`    | 🔄 CI/CD Automation | Pipelines, deployment, monitoring  |

### Infrastructure

| Agent        | Rôle              | Quand l'utiliser                |
| ------------ | ----------------- | ------------------------------- |
| `devops`     | 🚀 Infrastructure | Docker, CI/CD, déploiement      |
| `qa`         | ✅ QA & Tests     | Tests, audits, benchmarking     |
| `documenter` | 📚 Documentation  | README, API docs, changelog     |
| `github`     | 🔀 Git-Flow       | Branches, PRs, issues, releases |

## Scripts disponibles (24)

### Core Scripts

| Script                         | Usage                                      | Catégorie |
| ------------------------------ | ------------------------------------------ | --------- |
| `invoke.sh <agent> "<prompt>"` | Invoquer n'importe quel agent              | Core      |
| `new-feature.sh`               | Planifier une feature (orchestrateur)      | Planning  |
| `audit.sh [--fix]`             | Audit QA + sécurité (avec auto-correction) | Quality   |
| `document.sh`                  | Générer la documentation                   | Docs      |

### Code Quality

| Script                      | Usage                       | Catégorie |
| --------------------------- | --------------------------- | --------- |
| `lint.sh [--fix] [--watch]` | 🔍 Linter tous les fichiers | Quality   |
| `format.sh [--check]`       | 💅 Formater code (Prettier) | Quality   |
| `test.sh [type] [--watch]`  | ✅ Exécuter les tests       | Testing   |
| `benchmark.sh [type]`       | ⚡ Performance benchmarking | Testing   |

### Git & Release Scripts

| Script                    | Usage                                        | Catégorie |
| ------------------------- | -------------------------------------------- | --------- |
| `branch.sh`               | Créer une branche Git-Flow (avec stash auto) | Git       |
| `pr.sh`                   | Ouvrir une Pull Request                      | Git       |
| `issue.sh [--start]`      | Créer une Issue (+ branche avec --start)     | Git       |
| `release.sh`              | Préparer une release                         | Release   |
| `tag.sh`                  | Publier un tag GitHub                        | Release   |
| `quick-fix.sh [--commit]` | ⚡ Hotfix rapide avec branche auto           | Git       |

### Maintenance & Deployment

| Script                                  | Usage                               | Catégorie   |
| --------------------------------------- | ----------------------------------- | ----------- |
| `init.sh [--full]`                      | 🚀 Setup initial Gemini system      | Setup       |
| `deploy.sh [dev\|staging\|prod]`        | 🚀 Déploiement multi-environnements | Deploy      |
| `health-check.sh [--fix]`               | 🏥 Diagnostic projet + auto-fix     | Maintenance |
| `sync-all.sh [--update] [--audit]`      | 🔄 Sync toutes les dépendances      | Maintenance |
| `migrate.sh [create\|up\|down\|status]` | 🗄️ Gestion migrations BD            | Database    |
| `stats.sh [--detailed]`                 | 📊 Statistiques du projet           | Analytics   |
| `logs.sh [source] [--follow]`           | 📋 Viewing project logs             | Monitoring  |
| `explore.sh`                            | Explorer l'état du repo             | Analytics   |
| `security-scan.sh`                      | Scanner les secrets avant PR        | Security    |
| `setup-env.sh`                          | Gérer le .env.example               | Setup       |

## 🧠 Mémoire Projet

Si `ARCHITECTURE.md` existe à la racine, il est **automatiquement injecté**
dans tous les agents via `invoke.sh`, `audit.sh` et `new-feature.sh`.

```bash
# Générer ARCHITECTURE.md la première fois
.gemini/scripts/invoke.sh architect "Documente l'architecture de ce projet"
# → Sauvegarder le résultat dans ARCHITECTURE.md
# → Désormais tous les agents connaissent les décisions d'architecture
```

## 🚀 Quick Start - Workflows clés

### 1️⃣ Diagnostic rapide du projet

```bash
.gemini/scripts/health-check.sh        # Vue d'ensemble
.gemini/scripts/stats.sh --detailed    # Statistiques détaillées
```

### 2️⃣ Nouvelle feature (workflow complet)

```bash
.gemini/scripts/new-feature.sh         # Planifier avec orchestrator
.gemini/scripts/issue.sh feature "Auth" --start    # Créer branche
.gemini/scripts/invoke.sh coder "Implémente JWT"   # Coder
.gemini/scripts/audit.sh src/ --fix               # Audit + fix
.gemini/scripts/pr.sh                            # Créer PR
```

### 3️⃣ Hot fix urgent

```bash
.gemini/scripts/quick-fix.sh           # Créer branche hotfix
# ... faire changements ...
.gemini/scripts/quick-fix.sh --commit  # Commit + merge
```

### 4️⃣ Performance optimization

```bash
.gemini/scripts/invoke.sh performance "Profile et optimise"
.gemini/scripts/deploy.sh staging      # Test en staging
.gemini/scripts/health-check.sh        # Vérifier état
```

### 5️⃣ Release production

```bash
.gemini/scripts/release.sh 1.2.0       # Préparer release
.gemini/scripts/tag.sh 1.2.0           # Publier tag
.gemini/scripts/deploy.sh prod         # Déployer en prod
.gemini/scripts/stats.sh --detailed    # Vérifier résultats
```

## 🏆 Best Practices

### ✅ Quoi faire

- Utiliser les agents pour explorer avant de coder (`architect`, `coder`)
- Executer health-check avant et après les changements majeurs
- Committer souvent avec des messages clairs
- Utiliser les scripts appropriés au contexte

### ❌ À éviter

- Bypasser les security scans avant une PR
- Déployer directement en production
- Modifier directement les fichiers de migration
- Ignorer les warnings des audits

## 📚 Ressources

- `ARCHITECTURE.md` - Créé par `architect` agent
- `.gemini/skills/` - Définitions détaillées de chaque agent
- `.gemini/scripts/` - Tous les scripts utilitaires
- `documentation/` - Docs du projet

---

## Profiter pleinement du système

1. **Générez ARCHITECTURE.md** la première fois (voir 🧠 Mémoire Projet)
2. **Explorez les agents** : `.gemini/scripts/invoke.sh <agent> "question?"`
3. **Automatisez** : intégrez les scripts dans votre CI/CD
4. **Documentez** : utilisez `documenter` pour maintenir les docs à jour
5. **Monitorez** : exécutez `health-check.sh` régulièrement

## 🌟 Nouveautés v4.1

### Agents Supplémentaires (+3)

- 🔒 **security** - Audits sécurité, OWASP, scanning secrets
- ✅ **testing** - Unit, integration, e2e, coverage analysis
- 🔄 **ci-cd** - Pipelines, CI/CD automation, monitoring

### Scripts Supplémentaires (+6)

- 🔍 **lint.sh** - Linter tous les fichiers (--fix, --watch)
- 💅 **format.sh** - Formater code avec Prettier
- ✅ **test.sh** - Exécuter tests (unit, integration, e2e, coverage)
- ⚡ **benchmark.sh** - Performance benchmarking (API, frontend, lighthouse)
- 📋 **logs.sh** - Viewing logs (backend, frontend, docker, all)
- 🚀 **init.sh** - Setup initial Gemini system (--full)

### Améliorations

- Caching 24h pour résultats agents
- Mode verbose optionnel
- Support exécution parallèle
- Pre-commit hooks Git
- Configuration centralisée (.config)

## 🤖 Workflow complet (du zéro à la prod)

```bash
# ─── Phase 1 : Setup ──────────────────────────────────────────────
.gemini/scripts/setup-env.sh --generate      # créer .env.example
.gemini/scripts/invoke.sh architect "Conçois l'architecture"  # → ARCHITECTURE.md

# ─── Phase 2 : Feature ────────────────────────────────────────────
.gemini/scripts/issue.sh feature "Auth JWT" --start   # issue + branche
.gemini/scripts/invoke.sh coder "Implémente le service JWT"
.gemini/scripts/audit.sh src/services/AuthService.js --fix

# ─── Phase 3 : PR ─────────────────────────────────────────────────
.gemini/scripts/security-scan.sh src/         # scan avant PR
.gemini/scripts/pr.sh                         # ouvre la PR

# ─── Phase 4 : Release ────────────────────────────────────────────
.gemini/scripts/release.sh 1.1.0
.gemini/scripts/tag.sh 1.1.0 "Ajout Auth JWT"

# ─── Exploration ──────────────────────────────────────────────────
.gemini/scripts/explore.sh status
.gemini/scripts/explore.sh issues open
```
